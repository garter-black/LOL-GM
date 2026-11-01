import {runEngineFixture} from './test-harness.mjs';
const result=await runEngineFixture(String.raw`(()=>{
 const check=(ok,msg)=>{if(!ok)throw Error('GLOBAL_MARKET_CALENDAR '+msg)};
 const cases=[
  [2026,'2026-12-01','2026-12-29'],
  [2027,'2027-12-07','2028-01-04'],
  [2028,'2028-12-05','2029-01-02']
 ];
 for(const [year,open,close] of cases){
  const w=globalTransferMarketWindow(year);
  check(w.opensOn===open&&w.closesOn===close&&w.lastOpenDate===addDays(close,-1),'UTC weekday/year rollover '+year);
  check((Date.parse(close+'T00:00:00Z')-Date.parse(open+'T00:00:00Z'))/86400000===28,'exact 28 elapsed UTC days');
  check(!globalTransferMarketState(addDays(open,-1)).open,'day before open');
  check(globalTransferMarketState(open).open,'inclusive opening');
  check(globalTransferMarketState(addDays(close,-1)).open,'last open day');
  check(!globalTransferMarketState(close).open,'exclusive closing');
 }
 for(const date of ['2028-01-01','2028-01-03'])check(globalTransferMarketState(date).year===2027&&globalTransferMarketState(date).open,'January belongs to previous December window');
 for(const date of ['2027-07-05','2027-01-07','2028-01-04'])check(!globalTransferMarketState(date).open,'no invented summer/January market');
 for(const bad of ['2027-02-31','2027-13-01','bad','2027-12-07T00:00:00Z',null]){
  let rejected=false;try{globalTransferMarketState(bad)}catch{rejected=true}check(rejected,'malformed date must fail closed');
 }
 const cfg=defaultWorldConfig();cfg.regions=[regionCfg('NA',{teams:10,splits:1,legs:1,regularBo:1,playoffBo:1,playoffTake:4,div2:false,system:'franchise'})];cfg.internationals=[];cfg.changes='none';cfg.subs=0;
 const db=buildWorld(cfg),team=activeTeams(db,'NA',1)[0];startCareer(db,team.id,'global-market-calendar');
 autoBuildInitialSquad(db,team,new RNG('global-market-calendar','roster'),5);finalizeInitialRosters(db);
 const season=Object.values(db.world.seasons).find(s=>!s.done),day=season.days[season.cur];
 const originalDay=day.date;day.date='2027-12-07';db.worldDate='2027-12-06';
 const before=packDB(db),world=db.world,club=db.teams[team.id];let refused=false;
 const early=unpackDB(before);early.worldDate='2027-12-04';
 for(const date of ['2027-12-05','2027-12-06']){
  const result=playWorldDay(early);check(result?.advanced&&early.worldDate===date,'pre-market daily progress blocked '+date);
 }
 const earlyBefore=packDB(early);let boundaryBlocked=false;
 try{playWorldDay(early)}catch(error){boundaryBlocked=/28일.*이적시장/.test(error.message)}
 check(boundaryBlocked&&packDB(early)===earlyBefore,'market boundary changed saved state');
 const later=unpackDB(before),laterSeason=Object.values(later.world.seasons).find(s=>!s.done);laterSeason.days[laterSeason.cur].date='2028-01-04';
 const laterBefore=packDB(later);boundaryBlocked=false;
 try{playWorldDay(later)}catch(error){boundaryBlocked=/28일.*이적시장/.test(error.message)}
 check(boundaryBlocked&&packDB(later)===laterBefore,'world clock skipped the market before a later fixture');
 try{playWorldDay(db)}catch(error){refused=/28일.*이적시장/.test(error.message)}
 check(refused,'actual daily official writer accepted a market fixture');
 check(packDB(db)===before&&db.world===world&&db.teams[team.id]===club,'blocked day mutated clock/roster/finance/history or object identity');
 const restored=unpackDB(before),saved=packDB(restored);refused=false;
 try{playWorldDay(restored)}catch(error){refused=/28일.*이적시장/.test(error.message)}
 check(refused&&packDB(restored)===saved,'native save resumed forbidden fixture or mutated state');
 const opponent=activeTeams(db,'NA',1).find(t=>t.id!==team.id),compId=season.comp;
 db.worldDate='2027-12-06';
 const session=createSeriesSession(db,team.id,opponent.id,1,'market-session',{compId});
 db.worldDate='2027-12-07';
 const sessionBefore=JSON.stringify(session),dbBefore=packDB(db);
 for(const invoke of [
  ()=>createSeriesSession(db,team.id,opponent.id,1,'market-new',{compId}),
  ()=>seriesSessionPrepareGame(db,session),
  ()=>playSeriesSessionGame(db,session)
 ]){
  refused=false;try{invoke()}catch(error){refused=/28일.*이적시장/.test(error.message)}
  check(refused&&JSON.stringify(session)===sessionBefore&&packDB(db)===dbBefore,'direct/resumed competition session must reject before any write');
 }
 const restoredSession=JSON.parse(sessionBefore),restoredWorld=unpackDB(dbBefore);
 refused=false;try{playSeriesSessionGame(restoredWorld,restoredSession)}catch(error){refused=/28일.*이적시장/.test(error.message)}
 check(refused&&packDB(restoredWorld)===packDB(unpackDB(dbBefore))&&JSON.stringify(restoredSession)===sessionBefore,'persisted session bypass');
 for(const opt of [{compId,replay:true},{compId,practice:true}]){
  const allowed=createSeriesSession(db,team.id,opponent.id,1,'market-exempt',opt);
  check(!!seriesSessionPrepareGame(db,allowed),'historical replay/private practice blocked');
 }
 day.date='2028-01-04';db.worldDate='2028-01-03';check(nextCalendarDate(db)==='2028-01-04','first closed-market day must be available');
 day.date=originalDay;
 return {windows:cases.length,elapsedDays:28,inclusiveOpen:true,exclusiveClose:true,malformedRejected:5,actualDailyWriterBlocked:true,directAndRestoredSessionBlocked:true,replayAndPracticeAllowed:true,wholeStateUnchanged:true,nativeRestore:true,fullWorldMarketImplemented:false};
})()`,{timeout:30000,filename:'global-market-calendar-acceptance.js'});
console.log('GLOBAL_MARKET_CALENDAR_ACCEPTANCE '+JSON.stringify(result));
