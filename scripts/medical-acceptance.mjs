// D02 medical/rehabilitation contract with the actual bundled game engine.
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import vm from 'node:vm';
import {ENGINE_MODULES} from './artifact-modules.mjs';
const dir=resolve(import.meta.dirname,'..','src','artifact');
let source='';
for(const file of ENGINE_MODULES)source+=await readFile(resolve(dir,file),'utf8')+'\n';
const ui=await readFile(resolve(dir,'ui-roster.js'),'utf8');
const marketUi=await readFile(resolve(dir,'ui-market.js'),'utf8');
const medicalOwner=await readFile(resolve(dir,'medical.js'),'utf8');
const medicalUi=await readFile(resolve(dir,'ui-club-medical.js'),'utf8');
if(!ui.includes('data-medical-plan')||!ui.includes('bindMedicalPlanControls()')||!(medicalUi.includes('return writeMedicalPlan(p,mode)')&&medicalOwner.includes('p.medicalPlan=mode'))||!medicalUi.includes('el.onchange='))
  throw new Error('D02_MEDICAL player rest controls missing from manager roster');
if(!marketUi.includes('의료 가용성 위험')||!marketUi.includes('medicalContractRisk(DB,p)'))
  throw new Error('D02_MEDICAL recruitment evaluation is missing live contract availability risk');
source+=String.raw`(()=>{
  const ok=(x,msg)=>{if(!x)throw new Error('D02_MEDICAL '+msg)};
  const cfg=defaultWorldConfig();
  cfg.regions=[regionCfg('NA',{teams:10,splits:1,legs:1,regularBo:1,
    playoffBo:1,playoffTake:4,format:'rr_po',div2:false,system:'franchise'})];
  cfg.internationals=[];cfg.subs=0;cfg.changes='none';
  const db=buildWorld(cfg),teams=activeTeams(db,null,1),manager=teams[0];
  startCareer(db,manager.id,'d02-medical');
  autoBuildInitialSquad(db,manager,new RNG('d02','initial'),5);
  finalizeInitialRosters(db);
  // The initial auction must leave a modest real FA pool across every role,
  // without generating emergency players after a health incident.
  const initialFree=Object.values(db.players).filter(p=>
    !p.retired&&!p.team&&isLocalPlayer(p,manager.region));
  const roleDepth=Object.fromEntries(ROLES.map(role=>
    [role,initialFree.filter(p=>p.role===role).length]));
  ok(ROLES.every(role=>roleDepth[role]>=2),
    'initial market exhausted or inflated unsigned regional players: '+JSON.stringify(roleDepth));
  const faCount=Object.keys(db.players).length,originalFree=initialFree.map(p=>p.id).sort();
  ok(seedFirstSeasonFreeAgentDepth(db).length===0&&Object.keys(db.players).length===faCount,
    'FA seeding repeated after initial market completion');
  const initialSave=unpackDB(packDB(db));
  ok(originalFree.every(id=>initialSave.players[id]&&!initialSave.players[id].team),
    'unsigned FA reserve did not survive save roundtrip');
  // D02-B5: modest, recency-decaying CLUB availability risk affects actual
  // valuations and contract lengths, not the athlete's requested pay.
  const healthyBase=db.players[manager.roster[0]];
  const qualityAttrs=Object.fromEntries(Object.keys(healthyBase.attrs).map(k=>[k,86]));
  const healthy={...healthyBase,age:20,attrs:qualityAttrs,pot:97,reputation:90,
    medical:null,medicalResidual:null,careerEvents:[]};
  const activeSevere={...healthy,medical:{kind:'injury',severity:'severe',
    out:true,daysLeft:42,started:db.worldDate}};
  const smallIllness={...healthy,medical:{kind:'illness',severity:'minor',
    out:false,daysLeft:5,started:db.worldDate}};
  const oldInjury={...healthy,careerEvents:[{type:'medical_start',
    kind:'injury',severity:'severe',date:addDays(db.worldDate,-760)}]};
  const healed={...healthy,medicalResidual:{daysLeft:14},careerEvents:[{
    type:'medical_start',kind:'injury',severity:'severe',
    date:addDays(db.worldDate,-25)}]};
  const repeat={...healthy,careerEvents:[7,30,55].map(days=>({
    type:'medical_start',kind:'injury',severity:'severe',
    date:addDays(db.worldDate,-days)}))};
  const riskSevere=medicalContractRisk(db,activeSevere),
    riskHealed=medicalContractRisk(db,healed),
    riskRepeat=medicalContractRisk(db,repeat);
  ok(medicalContractRisk(db,healthy)===0&&medicalContractRisk(db,oldInjury)===0,
    'clean or 2-year-old injury history still affects contract valuation');
  ok(medicalContractRisk(db,smallIllness)<.02&&riskHealed>0&&
    riskHealed<riskSevere&&riskSevere>.07&&riskSevere<.12&&
    riskRepeat>.115&&riskRepeat<=.17,
    'acute, recovered or recurring medical absence risk is miscalibrated');
  ok(playerMarketValue(db,activeSevere)<playerMarketValue(db,healthy)&&
    aiMarketValue(db,activeSevere,manager)<aiMarketValue(db,healthy,manager),
    'medical availability does not affect market price and AI recruitment');
  ok(asking(db,activeSevere,manager.region)===asking(db,healthy,manager.region)&&
    offerAcceptanceThreshold(db,activeSevere)===offerAcceptanceThreshold(db,healthy),
    'player salary demands or consent were mechanically reduced for injury');
  const durationDraw=()=>({next:()=>.99,chance:()=>false});
  ok(contractYearsForPlayer(db,healthy,durationDraw())===3&&
    contractYearsForPlayer(db,activeSevere,durationDraw())===2&&
    contractYearsForPlayer(db,repeat,durationDraw())===1&&
    contractYearsForPlayer(db,oldInjury,durationDraw())===3,
    'medical risk did not bound AI contract duration proportionately');
  // Scouting board and career negotiation use the same live engine value.
  const observedFA=initialFree[0],pastEvents=observedFA.careerEvents.slice();
  observedFA.medical={kind:'injury',severity:'severe',out:true,
    daysLeft:32,started:db.worldDate};
  recordPlayerEvent(observedFA,'medical_start',db.year,{kind:'injury',
    severity:'severe',date:db.worldDate,out:true});
  ok(setRecruitmentPriority(db,observedFA.id,'B').ok,
    'could not add FA to medical risk recruitment fixture');
  observePlayer(db,observedFA,95,{comp:'d02-medical-recruitment',games:4});
  const evaluated=recruitmentEvaluation(db,observedFA.id,manager.id);
  ok(evaluated.ok&&evaluated.target.evaluation.medicalRiskPct>5&&
    evaluated.target.evaluation.medicalRiskPct<12,
    'medical recruitment risk was not captured by actual scouting evaluation');
  const remembered=unpackDB(packDB(db));
  ok(remembered.world.recruitment.targets[observedFA.id].evaluation.medicalRiskPct===
    evaluated.target.evaluation.medicalRiskPct,
    'scouted medical availability risk did not survive save roundtrip');
  observedFA.medical=null;observedFA.careerEvents=pastEvents;
  ok(medicalContractRisk(db,observedFA)===0,
    'cleared temporary injury left a permanent market penalty');
  ok(manager.roster.length===5,'need a five-person starting baseline');
  const p=db.players[manager.roster[0]];
  const initialCash=manager.finance.cash;
  manager.finance.cash=0; // An unaffordable free agent must not bypass the five-player floor.
  const limited=startMedicalEvent(db,p,'injury','severe',25,db.worldDate);
  manager.finance.cash=initialCash;
  ok(manager.roster.length===5,'unfunded emergency FA was added despite zero cash');
  ok(limited&&limited.out&&medicalOut(p)&&limited.severity==='severe',
    'roster shortage changed the actual severe injury');
  ok(p.careerEvents.some(e=>e.type==='medical_start'&&e.severity==='severe'&&e.out),
    'actual severe absence was not recorded in player history');
  ok(!validateStartingLineup(db,manager).ok,'medically unavailable starter was allowed');
  ok(medicalPlanFor(db,p)==='rehab','injured player not automatically assigned rehab');
  p.medicalPlan='normal';const normalCare=medicalCare(db,p);
  p.medicalPlan='rehab';ok(medicalCare(db,p)>normalCare+.10,'rehab did not improve treatment rate');
  p.medicalPlan='rest';ok(medicalScrimRest(db,p),'manual rest did not exclude player from scrims');
  ok(!validateStartingLineup(db,manager).ok,'medical rest made an unavailable player eligible');
  ok(Object.keys(bestStartingLineup(db,manager,{},true)).length<5,
    'a five-person roster scheduled scrims despite medical rest');
  const baseline=db.players[manager.roster[1]];
  p.fatigue=baseline.fatigue=48;p.condition=baseline.condition=75;
  baseline.medicalPlan='normal';dailyRecovery(db);
  ok(p.fatigue+2<baseline.fatigue&&p.condition>baseline.condition,
    'individual rest did not improve daily fatigue/condition compared with training');
  baseline.medicalPlan='auto';
  let club=teams.find(t=>t.id!==manager.id&&t.roster.length>=6);
  if(!club){
    club=teams[1];const sub=Object.values(db.players).find(x=>!x.team&&!x.retired);
    ok(sub,'need a free-agent substitute fixture');
    sub.team=club.id;club.roster.push(sub.id);initializeDepthChart(db,club,true);
  }
  const role=ROLES[0],injured=starterFor(db,club,role),oldMap={...club.depthChart};
  const absence=startMedicalEvent(db,injured,'illness','moderate',5,db.worldDate);
  ok(absence?.out&&medicalOut(injured),'available bench did not permit medical absence');
  ok(!validateStartingLineup(db,club,oldMap).ok,'unavailable starter still passed validation');
  const substitute=starterFor(db,club,role);
  ok(substitute&&substitute.id!==injured.id&&validateStartingLineup(db,club).ok,
    'legal emergency substitution did not occur');
  const another=db.players[club.roster.find(id=>id!==injured.id&&id!==substitute.id)];
  const guarded=startMedicalEvent(db,another,'burnout','severe',19,db.worldDate);
  ok(guarded?.out&&guarded.severity==='severe'&&medicalOut(another),
    'another absence changed severity because of squad size');
  medicalExposure(db,substitute,'official',2);
  const load=substitute.medicalLoad;medicalExposure(db,substitute,'scrim',3);
  ok(substitute.medicalLoad>load&&substitute.medicalLoad>=4.9,
    'official and private work did not accumulate risk');
  const packed=packDB(db),restored=unpackDB(packed);
  ok(restored.players[injured.id].medical?.out&&
    restored.players[p.id].medical?.out&&restored.players[p.id].medical?.severity==='severe'&&
    restored.players[p.id].medicalPlan==='rest'&&
    restored.players[substitute.id].medicalLoad===substitute.medicalLoad,
    'active health status / training load did not survive save roundtrip');
  const legacy=JSON.parse(packed);
  delete legacy.players[p.id].medical;
  delete legacy.players[p.id].medicalLoad;
  delete legacy.players[p.id].medicalPlan;
  ok(!unpackDB(JSON.stringify(legacy)).players[p.id].medical,
    'older v15 saves without medical fields failed to load');
  const date=addDays(db.worldDate,1);
  ok(applyWorldDailyEffects(db,date),'world did not run medical day');
  ok(p.medicalRestDays===1,'rest day was not counted toward seasonal lost practice');
  ok(medicalPlanFor(db,injured)==='rehab','rival AI ignored injury rehabilitation');
  ok(medicalPlanFor(db,db.players[manager.roster[1]])!=='rehab','healthy player forced into medical rehab');
  const before=JSON.stringify([db.players[injured.id].medical,
    db.players[substitute.id].medicalLoad,db.players[p.id].medical]);
  ok(!applyWorldDailyEffects(db,date),'medical tick repeated on same calendar day');
  ok(before===JSON.stringify([db.players[injured.id].medical,
    db.players[substitute.id].medicalLoad,db.players[p.id].medical]),
    'replayed date re-applied rehab / exposure');
  for(let i=2;i<18&&medicalOut(injured);i++)medicalHeal(db,injured,1,addDays(date,i));
  ok(!medicalOut(injured)&&injured.medicalResidual?.daysLeft>0,
    'player did not recover with temporary post-injury consequences');
  ok(injured.careerEvents.some(e=>e.type==='medical_start')&&
    injured.careerEvents.some(e=>e.type==='medical_return'),
    'medical records were not added to player career events');
  medicalOffseasonRecovery(db,addDays(date,90));
  ok(medicalSummary(p)==='정상'&&medicalSummary(injured)==='정상',
    'offseason date jump froze recovery or lingering health effects');
  const severe={kind:'injury',severity:'severe',site:'wrist',started:date};
  let scarCount=0;
  for(let i=0;i<600;i++){
    const clone={...injured,id:'scar-'+i,age:36,attrs:{...injured.attrs},careerEvents:[]};
    const old=clone.attrs.precision;medicalScar(db,clone,severe,date);
    const lost=old-clone.attrs.precision;
    ok(lost===0||lost===1,'permanent effect exceeded one attribute point');
    scarCount+=lost;
  }
  ok(scarCount>=2&&scarCount<100,'permanent loss was not rare');
  // D02-B3/B7: sign a guaranteed, day-billed replacement only when academy coverage is unavailable.
  // Exercise both the managed club and a rival under identical market rules.
  const verifyEmergencyFA=(team,label)=>{
    ok(team.roster.length===5&&medicalAvailable(db,team)===5,
      label+' needs an ordinary healthy five-player roster');
    const available=Object.values(db.players).filter(p=>
      !p.team&&!p.retired&&isLocalPlayer(p,team.region));
    ok(available.length>=5,label+' emergency fixture has no natural FA reserve');
    const before=new Set(team.roster),beforePayroll=payroll(db,team);
    team.finance.cash=1000; // Give this deterministic fixture sufficient headroom.
    const oldWages=team.finance.prepaid?.medicalReplacementWage||0;
    const victim=db.players[team.roster[0]];
    const priorMedical=victim.medical?{...victim.medical}:null;
    const incident=startMedicalEvent(db,victim,'injury','severe',21,db.worldDate);
    const signed=team.roster.map(id=>db.players[id]).find(p=>!before.has(p.id));
    ok(Object.keys(db.players).length===faCount,
      label+' generated an athlete on demand instead of signing an existing FA');
    ok(incident?.out&&incident.severity==='severe'&&medicalOut(victim),
      label+' failed to apply a genuine medical absence: '+JSON.stringify({priorMedical,incident,available:medicalAvailable(db,team),roster:team.roster.length,faCount:Object.values(db.players).filter(x=>!x.team&&!x.retired).length,budget:salaryBudget(db,team)-payroll(db,team)}));
    ok(signed&&signed.team===team.id&&signed.contract?.years===1&&
      signed.contract.medicalReplacement&&team.roster.length===6,
      label+' did not sign a genuine day-billed replacement');
    const clause=signed.contract.medicalReplacement;
    ok(clause.forPid===victim.id&&clause.startedOn===db.worldDate&&
      clause.guaranteedThrough===addDays(db.worldDate,10)&&
      clause.expiresOn===addDays(db.worldDate,27)&&
      clause.paid>0&&clause.paid<signed.contract.salary/6,
      label+' replacement guarantees or conditional deadline were invalid');
    ok(signed.careerEvents.some(e=>e.type==='medical_emergency_fa'&&
      e.for===victim.id&&e.to===team.id),
      label+' emergency signing lost its reason in player history');
    ok(Math.abs(payroll(db,team)-beforePayroll)<.001,
      label+' full-year payroll was inflated by an emergency short contract');
    ok(Math.abs((team.finance.prepaid?.medicalReplacementWage||0)-oldWages-clause.paid)<.0001&&
      Math.abs(1000-team.finance.cash-clause.paid)<.0001,
      label+' guaranteed daily wages were not paid exactly once from cash');
    ok(medicalAvailable(db,team)===5&&validateStartingLineup(db,team).ok,
      label+' failed to maintain an eligible starting lineup');
    ok(rosterIntegrityErrors(db).length===0,
      label+' signing introduced a duplicate or inconsistent registration');
    const saved=unpackDB(packDB(db));
    ok(saved.players[victim.id].medical?.out&&
      saved.players[signed.id].team===team.id&&
      saved.players[signed.id].contract?.medicalReplacement?.forPid===victim.id&&
      saved.teams[team.id].roster.includes(signed.id),
      label+' emergency signing or absence failed the save roundtrip');
    return {team,victim,signed,clause};
  };
  const replacement=verifyEmergencyFA(manager,'manager');
  const aiClub=teams.find(t=>t.id!==manager.id&&t.id!==club.id&&
    t.roster.length===5&&medicalAvailable(db,t)===5);
  ok(aiClub,'need a five-person AI team for the FA signing test');
  const aiReplacement=verifyEmergencyFA(aiClub,'AI');
  const baseDate=replacement.clause.startedOn;
  const blocked=commitWorldAction(db,{type:'player.release',pid:replacement.signed.id,
    teamId:replacement.team.id,mode:'medical_end',date:addDays(baseDate,2),actor:'system'});
  ok(!blocked.ok&&medicalAvailable(db,replacement.team)===5,
    'guaranteed period or healthy five-player floor was bypassed');
  const noManagerCover=previewWorldAction(db,{type:'player.sign',
    pid:Object.values(db.players).find(q=>!q.team&&!q.retired).id,
    teamId:manager.id,salary:1,years:1,kind:'medical_replacement',
    replacement:{forPid:replacement.victim.id,absenceDays:21},actor:'manager'});
  ok(!noManagerCover.ok,'manager created a privileged medical replacement without system authority');
  const cashBefore=manager.finance.cash,paidBefore=replacement.clause.paid;
  medicalReplacementDailyTick(db,addDays(baseDate,12));
  ok(replacement.signed.team===manager.id&&
    medicalAvailable(db,manager)===5&&replacement.clause.paid>paidBefore&&
    manager.finance.cash<cashBefore,
    'daily medical cover was released early or extra work went unpaid');
  const billed=replacement.clause.paid,cashBilled=manager.finance.cash;
  medicalReplacementDailyTick(db,addDays(baseDate,12));
  ok(replacement.clause.paid===billed&&manager.finance.cash===cashBilled,
    'repeated medical date double-billed the same guaranteed daily work');
  medicalReplacementDailyTick(db,addDays(baseDate,30));
  ok(replacement.signed.team===manager.id&&medicalAvailable(db,manager)===5&&
    replacement.clause.paid>billed,
    'scheduled expiry removed the only legal substitute instead of paying an extension');
  medicalHeal(db,replacement.victim,99,addDays(baseDate,31));
  const prepaidEnd=replacement.clause.paid;
  medicalReplacementDailyTick(db,addDays(baseDate,31));
  ok(!replacement.signed.team&&!replacement.signed.contract&&
    replacement.team.roster.length===5&&rosterIntegrityErrors(db).length===0&&
    replacement.signed.careerEvents.some(e=>e.type==='medical_replacement_end'&&
      e.for===replacement.victim.id&&Math.abs(e.paid-prepaidEnd)<.0001),
    'recovered starter did not close the conditional contract through a legal atomic release');
  const aiStart=aiReplacement.clause.startedOn;
  medicalHeal(db,aiReplacement.victim,99,addDays(aiStart,2));
  medicalReplacementDailyTick(db,addDays(aiStart,2));
  ok(aiReplacement.signed.team===aiClub.id,
    'quick recovery unlawfully cancelled the replacement guarantee');
  medicalReplacementDailyTick(db,addDays(aiStart,11));
  ok(!aiReplacement.signed.team&&
    aiReplacement.signed.careerEvents.some(e=>e.type==='medical_replacement_end'),
    'AI substitute was not released on the first legal post-guarantee day');
  const allCommitted=financeOperatingExpense(db,manager).medicalReplacementWage;
  ok(Math.abs(allCommitted-(manager.finance.prepaid?.medicalReplacementWage||0))<.0001,
    'medical wage prepayment was missing from annual ledger');
  // An offseason calendar jump should not bill 120 unused days after a
  // replacement's original athlete would have recovered.
  db.worldDate=addDays(baseDate,45);
  const skipBefore=new Set(manager.roster);
  const skippedIncident=startMedicalEvent(db,replacement.victim,
    'injury','severe',21,db.worldDate);
  const lateCover=manager.roster.map(id=>db.players[id]).find(q=>!skipBefore.has(q.id));
  ok(skippedIncident?.out&&lateCover?.contract?.medicalReplacement,
    'could not sign a fresh conditional replacement for calendar-skip test');
  const lateClause=lateCover.contract.medicalReplacement,lateStart=db.worldDate;
  const lateRest=unpackDB(packDB(db));
  ok(lateRest.players[lateCover.id].contract.medicalReplacement.forPid===
    replacement.victim.id,'short-term clause was lost in modern save');
  medicalOffseasonRecovery(db,addDays(lateStart,120));
  ok(!lateCover.team&&!lateCover.contract&&
    lateClause.paid<lateRest.players[lateCover.id].contract.salary*50/365&&
    medicalAvailable(db,manager)>=5&&rosterIntegrityErrors(db).length===0,
    'calendar jump overcharged medical cover or failed to end the employment');
  // D02-B: protected top and reserve squads exchange only surplus healthy
  // players, using the same atomic roster plan as manager and club AI.
  const cfg2=defaultWorldConfig();
  cfg2.regions=[regionCfg('KR',{teams:10,splits:1,legs:1,regularBo:1,
    playoffBo:1,playoffTake:4,format:'rr_po',div2:true,system:'franchise'})];
  cfg2.internationals=[];cfg2.subs=1;cfg2.changes='none';
  const org=buildWorld(cfg2),owner=activeTeams(org,null,1)[0];
  startCareer(org,owner.id,'d02-emergency');
  autoBuildInitialSquad(org,owner,new RNG('d02-callup','squad'),5);
  autoBuildInitialSquad(org,reserveTeamsOf(org,owner)[0],
    new RNG('d02-callup','academy'),6);
  finalizeInitialRosters(org);
  const krFA=Object.values(org.players).filter(p=>!p.retired&&!p.team&&isLocalPlayer(p,'KR'));
  const minKoreanFA=Math.max(2,Math.ceil(activeTeams(org,'KR').length/5));
  ok(ROLES.every(role=>krFA.filter(p=>p.role===role).length>=minKoreanFA),
    'owned academy league lost regional free-agent labor depth');
  const first=activeTeams(org,null,1).find(t=>t.id!==owner.id&&
    reserveTeamsOf(org,t).some(s=>medicalAvailable(org,s)>5)&&
    (t.roster||[]).length<rosterRulesForTeam(org,t).firstTeamMax);
  ok(first,'no registered club with a surplus owned-reserve substitute');
  const reserve=reserveTeamsOf(org,first).find(s=>medicalAvailable(org,s)>5);
  const spareBefore=medicalAvailable(org,reserve),firstBefore=first.roster.length;
  const need=Math.max(0,medicalAvailable(org,first)-5);
  for(const id of first.roster.slice(0,need))
    ok(startMedicalEvent(org,org.players[id],'illness','moderate',8,org.worldDate)?.out,
      'preparation did not reduce club healthy roster to five');
  ok(medicalAvailable(org,first)===5,'callup setup healthy count incorrect');
  const target=first.roster.map(id=>org.players[id]).find(p=>!medicalOut(p));
  const emergency=startMedicalEvent(org,target,'injury','severe',32,org.worldDate);
  ok(emergency?.out&&emergency.severity==='severe'&&medicalOut(target),
    'available academy player did not allow a genuine absence');
  ok(first.roster.length===firstBefore+1&&medicalAvailable(org,first)===5,
    'first team failed to register a substitute');
  ok(medicalAvailable(org,reserve)===spareBefore-1&&medicalAvailable(org,reserve)>=5,
    'academy was left below its own legal match minimum');
  const promoted=org.players[first.roster.find(id=>
    org.players[id].careerEvents?.some(e=>e.type==='medical_callup'&&e.for===target.id))];
  ok(promoted&&promoted.team===first.id&&
    (reserve.roster||[]).every(id=>id!==promoted.id)&&
    validateStartingLineup(org,first).ok,
    'emergency callup was not an eligible unique-five lineup');
  const restoredOrg=unpackDB(packDB(org));
  ok(restoredOrg.players[target.id].medical?.out&&
    restoredOrg.players[promoted.id].team===first.id&&
    medicalAvailable(restoredOrg,reserveTeamsOf(restoredOrg,first.id)[0])>=5,
    'emergency registration or absence failed the save roundtrip');
  const beforeLoad=promoted.medicalLoad=10;
  medicalDailyTick(org,addDays(org.worldDate,1));
  ok(promoted.medicalLoad<beforeLoad&&promoted.medicalLoad>8.5,
    'medical lottery processed a moved player twice on one day');

    ok(db.version===15,'world schema changed');
  console.log('D02_MEDICAL_ACCEPTANCE '+JSON.stringify({
    fivePlayerFloor:true,actualSeverityPreserved:true,emergencySubstitute:true,emergencyFA:true,shortCover:true,conditionalPay:true,faSupply:roleDepth,contractRisk:{acute:riskSevere,recovered:riskHealed,recurrent:riskRepeat},individualRest:true,rehab:true,format2Save:true,
    dayIdempotent:true,offseasonRecovery:true,scars:scarCount,samples:600
  }));
})();`;
vm.runInNewContext(source,{console,Date,Math,JSON,Set,Map,WeakMap,Object,
  Array,String,Number,Boolean,RegExp,Error,Intl,performance,crypto},{timeout:90000});
