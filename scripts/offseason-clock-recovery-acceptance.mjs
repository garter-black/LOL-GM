import { runEngineFixture } from './test-harness.mjs';

const result = await runEngineFixture(String.raw`(()=>{
 const check=(v,m)=>{if(!v)throw Error('OFFSEASON_CLOCK_RECOVERY '+m)};
 const cfg=defaultWorldConfig();cfg.regions=[regionCfg('NA',{teams:4,splits:1,legs:1,regularBo:1,playoffBo:1,playoffTake:2,format:'rr_po',div2:false,system:'franchise'})];cfg.internationals=[];
 let db=buildWorld(cfg);const team=activeTeams(db)[0];startCareer(db,team.id,'v2-phase-existing-season');autoBuildInitialSquad(db,team,new RNG('phase-roster'));finalizeInitialRosters(db);db.world.manage='ai';
 for(const source of [db,unpackDB(packDB(db))]){
  const before=packDB(source),world=source.world,players=source.players;let refused=false;
  try{runOffseason(source)}catch(error){refused=/오프시즌/.test(error.message)}
  check(refused&&packDB(source)===before&&source.world===world&&source.players===players,
   'annual settlement accepted unfinished season or mutated state');
 }
 let seasonDays=0;while(db.world.phase==='season'&&seasonDays++<500)playWorldDay(db);
 check(db.world.phase==='offseason'&&!db.world.fired,'actual compact season and current authority');db.world.manage='manual';
 const seasonEnd=db.world.contractWindow.seasonEndDate;
 const sourceLoad=Object.values(db.players).reduce((n,p)=>n+(p.medicalLoad||0),0);
 check(sourceLoad>0,'actual competition load required');
 check(advanceOffseasonContractWindow(db).ok&&db.world.contractWindow.stage==='fa','actual contract expiry writer');
 {
  const fast=unpackDB(packDB(db)),daily=unpackDB(packDB(db)),close=globalTransferMarketWindow(db.world.year).closesOn;
  const failed=unpackDB(packDB(db)),before=packDB(failed),world=failed.world,players=failed.players,refresh=refreshAIMarketOffers;let days=0,threw=false;
  try{refreshAIMarketOffers=(...args)=>{const result=refresh(...args);if(++days===3)throw Error('market day failure');return result};runOffseason(failed)}
  catch(error){threw=error.message==='market day failure'}finally{refreshAIMarketOffers=refresh}
  check(threw&&packDB(failed)===before&&failed.world===world&&failed.players===players,'annual market progression failure did not restore world');
  const noProgress=unpackDB(packDB(db)),beforeNoProgress=packDB(noProgress),dayWriter=advanceOffseasonFreeAgencyDay;let refused=false;
  try{advanceOffseasonFreeAgencyDay=()=>({ok:true});runOffseason(noProgress)}catch{refused=true}finally{advanceOffseasonFreeAgencyDay=dayWriter}
  check(refused&&packDB(noProgress)===beforeNoProgress,'nonadvancing market writer looped or mutated state');
  let count=0;while(daily.worldDate<close){check(advanceOffseasonFreeAgencyDay(daily,'system').ok,'actual market day');count++}
  check(count===28,'market day count');runOffseason(daily);runOffseason(fast);
  runOffseason(failed);check(fast.worldDate===close&&daily.worldDate===close&&packDB(fast)===packDB(daily)&&packDB(failed)===packDB(daily),'annual close skipped market days or changed actual writer output');
 }
 db=unpackDB(packDB(db));const start=db.worldDate;
 check(start==='2027-12-07'&&seasonEnd<start,'actual FA clock after competitive season');
 const setDate=setWorldCalendarDate,recover=medicalOffseasonRecovery,trace=[];let clinicalComparisons=0,clinicalThrough=null;
 setWorldCalendarDate=(state,date)=>{if(state===db)trace.push({from:state.worldDate,to:date});return setDate(state,date)};
 medicalOffseasonRecovery=(state,through,from)=>{
  // Compare the existing recovery writer on a private copy with its original
  // date input. The live world must keep its current clock throughout.
  clinicalThrough=through;const at=state.worldDate,expected=JSON.parse(JSON.stringify(state));expected.worldDate=from||at;
  recover(expected,through);const out=recover(state,through,from);expected.worldDate=at;
  check(state.worldDate===at,'medical consumer changed live clock');
  check(JSON.stringify(state)===JSON.stringify(expected),'recovery/ledger differs from existing interval consumer');clinicalComparisons++;return out;
 };
 let report;try{report=runOffseason(db)}finally{setWorldCalendarDate=setDate;medicalOffseasonRecovery=recover}
 const backwards=trace.find(row=>row.to<row.from);
 check(!backwards,'live world clock rewound '+JSON.stringify(backwards));
 check(clinicalComparisons===1&&db.worldDate===clinicalThrough&&db.worldDate>=start&&db.world.phase==='market','existing annual consumer and pending rollover boundary');
 const saved=packDB(db),restored=unpackDB(saved);check(packDB(restored)===saved,'actual annual result save/restore');
 const prior=packDB(restored);check(runOffseason(restored)===restored.world.report&&packDB(restored)===prior,'duplicate annual close changed result');
 return {actualCompactSeasonDays:seasonDays,seasonEnd,faDate:start,sourceLoad,clinicalComparisons,clockWrites:trace.length,monotonic:true,originalRecoveryAndLedger:true,nativeSave:true,duplicateInert:true,annualProcessingDate:clinicalThrough,marketCalendarFullyVerified:false,fullStandardWorldNotRun:true};
})()`, { timeout: 120000 });
console.log('OFFSEASON_CLOCK_RECOVERY_ACCEPTANCE', JSON.stringify(result));
