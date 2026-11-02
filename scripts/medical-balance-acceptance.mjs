// D02-B6: multi-seed athlete-day exposure audit against the LIVE medical engine.
// These are model-calibration figures, not observed esports medical statistics.
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import vm from 'node:vm';
import {ENGINE_MODULES} from './artifact-modules.mjs';

const dir=resolve(import.meta.dirname,'..','src','artifact');
let source='';
for(const file of ENGINE_MODULES)source+=await readFile(resolve(dir,file),'utf8')+'\n';
source+=String.raw`(()=>{
  const assert=(test,message)=>{if(!test)throw new Error('D02_MEDICAL_BALANCE '+message)};
  const cfg=defaultWorldConfig();
  cfg.regions=[regionCfg('NA',{teams:10,splits:1,legs:1,regularBo:1,
    playoffBo:1,playoffTake:4,format:'rr_po',div2:false,system:'franchise'})];
  cfg.internationals=[];cfg.subs=1;cfg.changes='none';
  const db=buildWorld(cfg),teams=activeTeams(db,null,1),manager=teams[0];
  startCareer(db,manager.id,'d02-b6-baseline');
  autoBuildInitialSquad(db,manager,new RNG('d02-b6','manager'),6);
  finalizeInitialRosters(db);
  const startingCount=Object.keys(db.players).length;
  const squads=teams.map((t,i)=>({
    team:t,profile:i<5?'controlled':'loaded',
    players:t.roster.map(id=>db.players[id])
  }));
  assert(squads.every(x=>x.players.length>=5),'invalid medical-balance cohort baseline');
  const athletes=squads.flatMap(x=>x.players);
  const seenIds=new Set(athletes.map(p=>p.id));
  assert(seenIds.size===athletes.length,'duplicate athlete in balance population');
  // Counterfactuals: keep all characteristics but the named risk driver fixed.
  const p={...athletes[0],age:21,fatigue:29,condition:96,medicalOverloadDays:0};
  const normal=teams[0],intense=teams[5];
  const base=medicalIncidentOdds(p,normal,6,'normal');
  const older=medicalIncidentOdds({...p,age:34},normal,6,'normal');
  const exposed=medicalIncidentOdds(p,normal,18,'normal');
  const high=medicalIncidentOdds({...p,fatigue:75},normal,18,'normal');
  const light=medicalIncidentOdds({...p,fatigue:75},normal,18,'light');
  const rest=medicalIncidentOdds({...p,fatigue:75},normal,18,'rest');
  const overloaded=medicalIncidentOdds({...p,medicalOverloadDays:70},intense,18,'normal');
  const restedOverload=medicalIncidentOdds({...p,medicalOverloadDays:70},intense,18,'rest');
  assert(base.injury>0&&older.injury>base.injury*1.15,
    'older player did not show greater injury incidence at equal workload');
  assert(exposed.injury>base.injury*1.4&&high.injury>exposed.injury*1.2,
    'actual workload or fatigue was not priced into injury risk');
  assert(light.injury<high.injury&&rest.injury<light.injury&&
    rest.illness===high.illness,'medical activity limits do not reduce overuse only');
  assert(base.burnout===0&&overloaded.burnout>0&&
    restedOverload.burnout<overloaded.burnout,
    'accumulated overload or recovery failed burnout risk check');
  // Preventive support is a real rate modifier, not a narrative UI stat.
  const supported={...intense,facilities:{...ensureFacilities(intense),recovery:5},
    staffRoster:[{role:'performanceCoach',rating:94}]};
  const unsupported={...intense,facilities:{...ensureFacilities(intense),recovery:1},
    staffRoster:[]};
  const supportedOdds=medicalIncidentOdds({...p,medicalOverloadDays:65},supported,18,'normal');
  const unsupportedOdds=medicalIncidentOdds({...p,medicalOverloadDays:65},unsupported,18,'normal');
  assert(supportedOdds.injury<unsupportedOdds.injury*.90&&
    supportedOdds.burnout<unsupportedOdds.burnout*.90&&
    supportedOdds.illness===unsupportedOdds.illness,
    'medical staff/facility prevention is missing or erases ordinary illness');
  const overusePlayer={...p,id:'medical-plan-overuse',
    medicalLoad:15,medicalOverloadDays:48,
    medicalPlan:'auto',medicalDayPlan:null,medicalPlanDate:null,
    team:intense.id};
  assert(medicalPlanFor(db,overusePlayer)==='rest'&&
    medicalPlanFor(db,{...overusePlayer,medicalOverloadDays:25})==='light'&&
    medicalPlanFor(db,{...overusePlayer,medicalOverloadDays:5})==='normal',
    'AI preventive overuse plans fail to distinguish rest, light and normal');
  overusePlayer.medicalPlan='normal';overusePlayer.team=manager.id;
  assert(medicalPlanFor(db,overusePlayer)==='normal',
    'manager deliberately selected normal training but AI forcibly overrode it');

  // This synthetic, steady-fatigue clinical experiment retains the original
  // exposure schedule, seeds and incidence assertions. The former high flag
  // admitted overload even at fatigue 29; now the loaded cohort explicitly
  // meets the real fatigue>=38 condition (40), below auto-rest at 51.
  // It is not a full calendar or a production fatigue/recovery coefficient.
  const count=()=>({days:0,injury:0,illness:0,burnout:0,
    severe:0,moderate:0,minor:0,unavailable:0});
  const stats={controlled:count(),loaded:count()};
  const perSeed=[],seeds=16,days=365;
  for(let iteration=0;iteration<seeds;iteration++){
    const year=2027+iteration,first=year+'-01-01';
    db.year=year;db.world.seed='d02-b6-population-'+iteration;
    const season={controlled:count(),loaded:count()};
    for(const cohort of squads){
      cohort.team.finance.cash=0; // Do not alter the trial cohort via emergency signing.
      for(const athlete of cohort.players){
        athlete.age=cohort.profile==='loaded'?34:21;
        athlete.medical=null;athlete.medicalResidual=null;
        athlete.medicalLoad=0;athlete.medicalOverloadDays=0;
        athlete.medicalDayPlan=null;athlete.medicalPlanDate=null;athlete.medicalPlan='auto';
        athlete.medicalRestDays=0;athlete.fatigue=cohort.profile==='loaded'?40:29;athlete.condition=96;
        athlete.careerEvents=[];
      }
    }
    for(let d=0;d<days;d++){
      const date=addDays(first,d),weekday=d%7;
      db.worldDate=date;
      for(const cohort of squads)for(const athlete of cohort.players){
        season[cohort.profile].days++;
        // Distinct workloads: loaded athletes play two series and four
        // three-game scrims weekly; controlled athletes use half the sessions.
        // Never expose a medically absent player to official or scrim play.
        if(medicalOut(athlete)||medicalScrimRest(db,athlete))continue;
        if(weekday===2||weekday===5&&cohort.profile==='loaded')
          medicalExposure(db,athlete,'official',2);
        if(cohort.profile==='loaded'?[0,1,3,4].includes(weekday):
          [0,4].includes(weekday))
          medicalExposure(db,athlete,'scrim',cohort.profile==='loaded'?3:2);
      }
      medicalDailyTick(db,date);
      for(const cohort of squads){
        for(const athlete of cohort.players){
          const evt=athlete.careerEvents[athlete.careerEvents.length-1];
          if(evt?.type==='medical_start'&&evt.date===date){
            const row=season[cohort.profile];
            row[evt.kind]++;row[evt.severity]++;
            if(evt.out)row.unavailable++;
          }
        }
      }
      if(d%30===0)for(const t of teams)if(medicalAvailable(db,t)<5){
        assert(!validateStartingLineup(db,t).ok,
          'medical shortage allowed an ineligible starting five');
        assert((t.roster||[]).some(id=>medicalOut(db.players[id])),
          'shortage had no recorded medical absence');
      }
    }
    for(const k of Object.keys(stats))
      for(const field of Object.keys(stats[k]))stats[k][field]+=season[k][field];
    const annualRate=row=>Math.round((row.injury+row.illness+row.burnout)/
      row.days*365*1000)/10;
    perSeed.push({seed:iteration,
      controlled:annualRate(season.controlled),
      loaded:annualRate(season.loaded)});
    assert(Object.keys(db.players).length===startingCount,
      'a real athlete was created while auditing medical events');
  }
  const rate=(row,field)=>Math.round(row[field]/row.days*365*1000)/10;
  const low=stats.controlled,highStress=stats.loaded;
  const cases=['injury','illness','burnout'];
  const total=(x)=>cases.reduce((n,k)=>n+x[k],0);
  assert(low.days>=20000&&highStress.days>=20000&&perSeed.length===seeds,
    'not enough real athlete-days for seed audit');
  assert(total(low)>0&&total(highStress)>0&&
    total(low)/low.days<.001&&total(highStress)/highStress.days<.002,
    'baseline incidence collapsed or became unreasonably frequent');
  assert(highStress.injury>low.injury,
    'high-load older cohort failed to show higher live injury incidence: '+JSON.stringify({controlled:low.injury,loaded:highStress.injury,daysLow:low.days,daysLoaded:highStress.days,burnoutLow:low.burnout,burnoutLoaded:highStress.burnout}));
  assert(highStress.burnout>low.burnout&&highStress.burnout>0,
    'prolonged high workload did not generate measurable burnout '+JSON.stringify({low,highStress}));
  assert(low.illness>0&&highStress.illness>0,
    'ordinary illness disappeared from one playing population');
  assert(low.unavailable+highStress.unavailable<total(low)+total(highStress),
    'all medical incidents became automatic disqualifying injuries');
  assert(new Set(perSeed.map(x=>x.controlled)).size>=3&&
    new Set(perSeed.map(x=>x.loaded)).size>=3,
    'year-to-year event counts collapsed to a fixed identical outcome');
  // Recovery support should materially reduce the observed duration of the
  // same moderate event (no permanent scars, no event lottery in this probe).
  const careTeam=normal,fac=ensureFacilities(careTeam);
  const originalFacility=fac.recovery;
  const recover=(level,plan)=>{
    fac.recovery=level;
    const candidate={...athletes[0],id:'d02-b6-recovery',
      team:careTeam.id,medicalPlan:plan,medicalDayPlan:null,medicalPlanDate:null,
      fatigue:25,careerEvents:[],medicalResidual:null,
      medical:{kind:'injury',site:'wrist',severity:'moderate',out:true,
        daysLeft:18,plannedDays:18,started:db.worldDate,lastTick:db.worldDate}};
    for(let day=1;day<=36;day++){
      medicalHeal(db,candidate,1,addDays(db.worldDate,day));
      if(!candidate.medical)return day;
    }
    throw new Error('medical recovery failed within 36 days');
  };
  const slow=recover(1,'normal'),fast=recover(5,'rehab'),facilityOnly=recover(5,'normal');
  assert(facilityOnly<slow,'facility-only recovery benefit disappeared');
  fac.recovery=originalFacility;
  assert(fast<slow&&slow-fast>=3,
    'facilities and the real rehab plan did not improve measured injury recovery '+JSON.stringify({slow,fast,facilityOnly}));
  const spread=field=>{
    const xs=perSeed.map(x=>x[field]).sort((a,b)=>a-b);
    return {min:xs[0],median:xs[Math.floor(xs.length/2)],max:xs[xs.length-1]};
  };
  const summary={
    seeds,yearsPerSeed:1,athleteDays:{controlled:low.days,loaded:highStress.days},
    seedSpreadPer100:{controlled:spread('controlled'),loaded:spread('loaded')},
    annualEventsPer100:{controlled:{
      injury:rate(low,'injury'),illness:rate(low,'illness'),
      burnout:rate(low,'burnout'),all:Math.round(total(low)/low.days*365*1000)/10
    },loaded:{
      injury:rate(highStress,'injury'),illness:rate(highStress,'illness'),
      burnout:rate(highStress,'burnout'),all:Math.round(total(highStress)/highStress.days*365*1000)/10
    }},
    recoveryDays:{limitedCare:slow,improvedCare:fast,facilityOnly},
    severe:low.severe+highStress.severe,
    shortageLineupsRejected:true,saveFormat:2
  };
  console.log('D02_MEDICAL_BALANCE '+JSON.stringify(summary));
})();`;
vm.runInNewContext(source,{console,Date,Math,JSON,Set,Map,WeakMap,Object,
  Array,String,Number,Boolean,RegExp,Error,Intl,performance,crypto},{timeout:90000});
