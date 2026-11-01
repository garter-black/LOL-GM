import {runEngineFixture} from './test-harness.mjs';
const result=await runEngineFixture(String.raw`(()=>{
 const check=(v,m)=>{if(!v)throw Error('MARKET_DEADLINE_EXPIRY '+m)};
 function fixture(year,renewalBeforeFA=false){
  const cfg=defaultWorldConfig();cfg.startYear=year;cfg.regions=[regionCfg('KR',{teams:4,div2:false})];cfg.internationals=[];
  let db=buildWorld(cfg);const team=activeTeams(db)[0];setManagedTeam(db,team.id);
  for(const t of activeTeams(db))t.finance.cash=1000;
  const p=Object.values(db.players).find(p=>!p.retired&&!p.team);
  signContract(db,p,team,asking(db,p,team.region),1,{promisedRole:'core'});p.contract.option=null;
  db.world={year,seed:'deadline-'+year,manage:'manual',phase:'offseason',seasons:{},steps:[],step:0,negotiations:{},offers:[],marketLog:[],lastDate:year+'-11-16'};
  db.worldDate=db.world.lastDate;
  let previous=null;
  if(renewalBeforeFA){
   mInterest(db,p.id);mEvaluateTarget(db,p.id);previous=startNegotiation(db,p.id,'renewal');
   check(previous.ok,'actual pre-FA renewal');
  }
  initOffseasonContractWindow(db);advanceOffseasonContractWindow(db);
  if(renewalBeforeFA)return {db:unpackDB(packDB(db)),nid:previous.neg.id,pid:p.id};
  mInterest(db,p.id);mEvaluateTarget(db,p.id);const opened=startNegotiation(db,p.id,'fa');
  check(opened.ok,'actual observed FA negotiation');
  check(currentAIMarketOffers(db).some(o=>o.status==='open'),'actual independent AI offers');
  return {db:unpackDB(packDB(db)),nid:opened.neg.id,pid:p.id};
 }
 let actualDays=0,restores=0;
 for(const year of [2026,2027,2028]){
  const {db,nid}=fixture(year),window=globalTransferMarketWindow(year),before=packDB(db),pending=db.world.negotiations[nid];
  check(pending.status==='open','annual market test needs real pending proposal');
  runOffseason(db);
  check(db.worldDate===window.closesOn&&db.world.phase==='market'&&db.world.negotiations[nid].status==='expired','annual writer skipped actual 28-day market '+year);
  check(unpackDB(packDB(db)).worldDate===window.closesOn&&packDB(db)!==before,'annual market closing save '+year);
 }
 for(const year of [2026,2027,2028]){
  let {db,nid,pid}=fixture(year);const window=globalTransferMarketWindow(year),period=aiMarketOfferPeriod(db).id,
   heldQuote=JSON.parse(JSON.stringify(currentAIMarketOffers(db).find(o=>o.status==='open')));
  const contracts=JSON.stringify(Object.values(db.players).map(p=>[p.id,p.team,p.contract]));
  check(db.worldDate===window.opensOn,'actual global opening');
  for(let day=1;day<=28;day++){
   check(advanceOffseasonFreeAgencyDay(db).ok,'actual FA daily writer');actualDays++;
   const neg=db.world.negotiations[nid];
   if(day<28)check(neg.status==='open'&&neg.round===0,'negotiation expired early or auto-submitted');
   else{
    check(db.worldDate===window.closesOn&&neg.status==='expired'&&neg.closedDate===window.closesOn,'28-day boundary did not expire pending negotiation');
    const store=db.contractMarketOffers.periods[period];
    check(store.closedAt?.startsWith(window.closesOn+'T')&&Object.values(store.offers).every(o=>o.status!=='open'),'actual AI quotes not closed at deadline');
    check(!aiMarketOfferAvailable(db,heldQuote),'stale pre-deadline AI quote still available');
    const quotes=JSON.stringify(store),p=db.players[heldQuote.pid],t=db.teams[heldQuote.teamId];
    check(!issueAIMarketOffer(db,t,p,heldQuote.terms,'late-deadline',null,null,null,heldQuote.period)&&JSON.stringify(store)===quotes,'closed period issued a new quote');
    check(JSON.stringify(Object.values(db.players).map(p=>[p.id,p.team,p.contract]))===contracts,'deadline signed/moved a player without approval');
    const before=packDB(db);check(!submitNegotiationOffer(db,nid,neg.demand).ok&&packDB(db)===before,'stale offer accepted after deadline');
   }
   if(day===14||day===28){db=unpackDB(packDB(db));restores++;}
  }
  check(db.world.negotiations[nid].status==='expired'&&db.players[pid].team===null,'native restoration reopened proposal or signed player');
  const freshQuotes=currentAIMarketOffers(db).filter(o=>o.status==='open');
  check(freshQuotes.length>0&&freshQuotes.every(o=>o.issuedAt>=window.closesOn+'T00:00:00.000Z'&&!db.players[o.pid].team&&o.period!==period),'year-round true FA lost new AI offers after market close');
  check(freshQuotes.every(o=>aiMarketOfferAvailable(db,o))&&freshQuotes.some(o=>negotiationCompetition(db,db.players[o.pid],managedTeam(db),null,'fa').some(row=>row.offerId===o.id)),'new FA offers not consumed as real competing offers');
  const quoteRestored=unpackDB(packDB(db));check(freshQuotes.every(o=>aiMarketOfferAvailable(quoteRestored,quoteRestored.contractMarketOffers.periods[o.period].offers[o.id])),'new FA offers unavailable after restore');
  const closed=JSON.stringify(db.world.negotiations[nid]),quotes=JSON.stringify(db.contractMarketOffers.periods[period]);
  check(advanceOffseasonFreeAgencyDay(db).ok&&JSON.stringify(db.world.negotiations[nid])===closed,'year-round FA day changed closed proposal');
  check(JSON.stringify(db.contractMarketOffers.periods[period])===quotes,'later refresh reopened the closed quote period');
 }
 {
  let {db}=fixture(2027);const window=globalTransferMarketWindow(2027);
  while(db.worldDate<window.lastOpenDate)check(advanceOffseasonFreeAgencyDay(db).ok,'reach last open market day');
  const before=packDB(db),world=db.world,refresh=refreshAIMarketOffers;let threw=false;
  try{refreshAIMarketOffers=(...args)=>{refresh(...args);throw Error('postmarket issuance failure')};advanceOffseasonFreeAgencyDay(db)}
  catch(error){threw=error.message==='postmarket issuance failure'}finally{refreshAIMarketOffers=refresh}
  check(threw&&packDB(db)===before&&db.world===world,'postmarket issuance failure changed live world');
  check(advanceOffseasonFreeAgencyDay(db).ok&&db.worldDate===window.closesOn&&currentAIMarketOffers(db).some(o=>o.status==='open'),'postmarket issuance retry');
 }
 {
  let {db,nid}=fixture(2027);const window=globalTransferMarketWindow(2027);
  db.worldDate=addDays(window.closesOn,1);
  const player=Object.values(db.players).find(p=>!p.retired&&!p.team&&p.id!==db.world.negotiations[nid].pid);
  mInterest(db,player.id);mEvaluateTarget(db,player.id);const fresh=startNegotiation(db,player.id,'fa');
  check(fresh.ok,'post-deadline FA negotiation');
  const freshId=fresh.neg.id;db=unpackDB(packDB(db));
  check(advanceOffseasonFreeAgencyDay(db).ok,'restored late FA day');
  check(db.world.negotiations[nid].status==='expired','missed deadline left old negotiation open');
  check(db.world.negotiations[freshId].status==='open','catch-up expired a new year-round FA negotiation');
 }
 {
  let {db,nid,pid}=fixture(2027,true);const window=globalTransferMarketWindow(2027);
  db.worldDate=addDays(window.closesOn,1);
  mEvaluateTarget(db,pid);const fresh=startNegotiation(db,pid,'fa');check(fresh.ok,'replacement FA negotiation');
  const freshId=fresh.neg.id;db=unpackDB(packDB(db));
  check(advanceOffseasonFreeAgencyDay(db).ok,'replacement FA day');
  const target=recruitmentTarget(db,pid);
  check(db.world.negotiations[nid].status==='expired','old renewal not expired');
  check(db.world.negotiations[freshId].status==='open'&&target.stage==='negotiating'&&target.negotiationId===freshId,'stale renewal overwrote active FA board');
 }
 {
  let {db,nid}=fixture(2027);const previous=JSON.parse(JSON.stringify(db.world.negotiations[nid]));
  db.worldDate=addDays(globalTransferMarketWindow(2027).closesOn,1);
  const probe=unpackDB(packDB(db));runOffseason(probe);closeMarket(probe);
  const player=Object.values(db.players).find(p=>!p.retired&&!p.team&&p.id!==previous.pid&&probe.players[p.id]&&!probe.players[p.id].retired&&!probe.players[p.id].team&&!probe.world.report.signings.some(s=>s.pid===p.id));
  check(player,'actual FA available after market settlement');
  mInterest(db,player.id);mEvaluateTarget(db,player.id);const fresh=startNegotiation(db,player.id,'fa');check(fresh.ok,'actual post-close FA');
  const freshId=fresh.neg.id;
  const before=packDB(db),world=db.world,club=managedTeam(db),original=closeOpenNegotiationsForDeadline;
  closeOpenNegotiationsForDeadline=(...args)=>{original(...args);throw Error('controlled annual expiry')};
  let threw=false;try{runOffseason(db)}catch(e){threw=e.message==='controlled annual expiry'}
  finally{closeOpenNegotiationsForDeadline=original}
  const after=packDB(db), pos=[...before].findIndex((v,i)=>v!==after[i]);
  check(threw&&after===before&&db.world===world&&managedTeam(db)===club,'annual expiry failure partially committed '+JSON.stringify({threw,saved:after===before,world:db.world===world,club:managedTeam(db)===club,pos,before:before.slice(pos-100,pos+160),after:after.slice(pos-100,pos+160)}));
  runOffseason(db);
  check(db.world.phase==='market','actual annual transition');
  const closed=db.world.negotiations[nid];
  check(closed&&closed.status==='expired'&&closed.createdDate===previous.createdDate,'annual close erased pending negotiation instead of expiring it');
  check(db.world.negotiations[freshId]?.status==='open','annual close erased newer FA negotiation');
  db=unpackDB(packDB(db));check(db.world.negotiations[nid]?.status==='expired'&&db.world.negotiations[freshId]?.status==='open','annual negotiation history did not survive restore');
  const teamId=managedTeamId(db);closeMarket(db);startWorldSeason(db,teamId,'deadline-next-season');
  check(db.world.negotiations?.[freshId]?.status==='open'&&recruitmentTarget(db,player.id)?.negotiationId===freshId,'season transition lost ongoing FA negotiation');
  const duplicate=startNegotiation(db,player.id,'fa');check(duplicate.ok&&duplicate.neg.id===freshId,'season transition duplicated ongoing negotiation');
  db=unpackDB(packDB(db));check(db.world.negotiations?.[freshId]?.status==='open','next season restore lost FA negotiation');
 }
 {
  const {db,nid}=fixture(2027),n=db.world.negotiations[nid];n.maxRounds=3;
  const queued=stageNegotiationOffer(db,nid,n.demand);check(queued.ok&&queued.waiting,'actual pending manager response');
  const before=packDB(db),world=db.world,club=managedTeam(db);let blocked=false;
  try{runOffseason(db)}catch(e){blocked=e.message.includes('응답 대기')}
  check(blocked&&packDB(db)===before&&db.world===world&&managedTeam(db)===club,'annual writer skipped pending manager response');
  const saved=unpackDB(before);check(saved.world.negotiations[nid].response.dueAt===queued.dueAt,'pending response save');
  delete saved.world.negotiations[nid].response;const damaged=packDB(saved);let damagedBlocked=false;
  try{runOffseason(saved)}catch(e){damagedBlocked=e.message.includes('응답 대기')}
  check(damagedBlocked&&packDB(saved)===damaged,'damaged pending response skipped at annual close');
  cancelNegotiation(db,nid);check(runOffseason(db)===db.world.report,'explicit cancellation permits annual close');
 }
 {
  let {db}=fixture(2027);runOffseason(db);
  const player=Object.values(db.players).find(p=>!p.retired&&!p.team);check(player,'market FA for response');
  mInterest(db,player.id);mEvaluateTarget(db,player.id);const opened=startNegotiation(db,player.id,'fa');check(opened.ok,'market negotiation');
  const nid=opened.neg.id;opened.neg.maxRounds=3;const queued=stageNegotiationOffer(db,nid,opened.neg.demand);
  check(queued.ok&&queued.waiting,'actual market pending response');
  const before=packDB(db),world=db.world,club=managedTeam(db);let blocked=false;
  try{closeMarket(db)}catch(e){blocked=e.message.includes('응답 대기')}
  check(blocked&&packDB(db)===before&&db.world===world&&managedTeam(db)===club,'market close skipped pending manager response');
  const saved=unpackDB(before);delete saved.world.negotiations[nid].response;const damaged=packDB(saved);let damagedBlocked=false;
  try{closeMarket(saved)}catch(e){damagedBlocked=e.message.includes('응답 대기')}
  check(damagedBlocked&&packDB(saved)===damaged,'market close skipped damaged pending response');
  cancelNegotiation(db,nid);closeMarket(db);check(db.world.phase==='preseason','cancel permits market close');
 }
 for(const year of [2026,2027,2028]){
  const {db}=fixture(year),date=(year+1)+'-01-09';db.worldDate=date;
  runOffseason(db);
  check(db.worldDate===date&&db.world.phase==='market','annual close rewound restored world clock');
  const restored=unpackDB(packDB(db));check(restored.worldDate===date,'monotonic annual clock did not survive restore');
 }
 {
  let {db}=fixture(2027);const date='2028-02-15';db.worldDate=date;
  runOffseason(db);closeMarket(db);db=unpackDB(packDB(db));
  check(db.world.preseasonStartedOn===date,'preseason start date not saved');
  const p=Object.values(db.players).find(p=>!p.retired&&!p.team);mInterest(db,p.id);mEvaluateTarget(db,p.id);
  const opened=startNegotiation(db,p.id,'fa');check(opened.ok,'late preseason FA negotiation');
  const deadline=negotiationContactDeadline(db,opened.neg),later=unpackDB(packDB(db));later.worldDate=addDays(date,1);
  check(deadline>date+'T00:00:00.000Z'&&negotiationContactDeadline(later,later.world.negotiations[opened.neg.id])===deadline,'late preseason forecast deadline moved with current date');
  startWorldSeason(db,managedTeamId(db),'late-season-calendar');
  const days=Object.values(db.world.seasons).flatMap(s=>s.days.map(d=>d.date)).sort();
  check(days.length>0&&days[0]>=date,'late next season scheduled in the past '+JSON.stringify({date,first:days[0]}));
  const matches=Object.values(db.world.seasons).flatMap(s=>s.days.flatMap(d=>d.matches));
  check(matches.length>0&&matches.every(m=>typeof m.utcAt==='string'&&m.utcAt>=date+'T00:00:00.000Z'),'late next season has past UTC fixture');
  const restored=unpackDB(packDB(db));check(Object.values(restored.world.seasons).flatMap(s=>s.days.map(d=>d.date)).sort()[0]===days[0],'late schedule save restore');
 }
 {
  let {db}=fixture(2027);db.worldDate='2028-11-20';runOffseason(db);closeMarket(db);db=unpackDB(packDB(db));
  const before=packDB(db),world=db.world,team=managedTeam(db);let blocked=false;
  try{startWorldSeason(db,team.id,'late-market-overlap')}catch(e){blocked=e.message.includes('이적시장')}
  const overlap=Object.values(db.world.seasons||{}).flatMap(s=>s.days.filter(d=>globalTransferMarketState(d.date).open).map(d=>d.date));
  check(blocked&&packDB(db)===before&&db.world===world&&managedTeam(db)===team,'late season overlaps market or partially commits '+JSON.stringify({blocked,overlap}));
 }
 let rollbackCases=0;
 {
  const {db,nid}=fixture(2027);db.worldDate=addDays(globalTransferMarketWindow(2027).closesOn,1);
  const before=packDB(db),world=db.world,original=closeOpenNegotiationsForDeadline;
  closeOpenNegotiationsForDeadline=(...args)=>{original(...args);throw Error('controlled late catch-up')};
  let threw=false;try{advanceOffseasonFreeAgencyDay(db)}catch(e){threw=e.message==='controlled late catch-up'}
  finally{closeOpenNegotiationsForDeadline=original}
  check(threw&&packDB(db)===before&&db.world===world&&db.world.negotiations[nid].status==='open','late catch-up partially committed');
  check(advanceOffseasonFreeAgencyDay(db).ok&&db.world.negotiations[nid].status==='expired','late catch-up retry');rollbackCases++;
 }
 for(const name of ['negotiations','ai']){
  const {db,nid}=fixture(2027);db.worldDate=globalTransferMarketWindow(2027).lastOpenDate;
  const before=packDB(db),world=db.world,club=managedTeam(db),fn=name==='negotiations'?closeOpenNegotiationsForDeadline:expireCurrentAIMarketOffers;
  const failing=(...args)=>{fn(...args);throw Error('controlled deadline '+name)};
  if(name==='negotiations')closeOpenNegotiationsForDeadline=failing;else expireCurrentAIMarketOffers=failing;
  let threw=false;try{advanceOffseasonFreeAgencyDay(db)}catch(e){threw=e.message==='controlled deadline '+name}
  finally{if(name==='negotiations')closeOpenNegotiationsForDeadline=fn;else expireCurrentAIMarketOffers=fn;}
  check(threw&&packDB(db)===before&&db.world===world&&managedTeam(db)===club&&db.world.negotiations[nid].status==='open','deadline failure partially committed');
  check(advanceOffseasonFreeAgencyDay(db).ok&&db.world.negotiations[nid].status==='expired','deadline retry');rollbackCases++;
 }
 const cancelled=fixture(2027);cancelNegotiation(cancelled.db,cancelled.nid);const closed=JSON.stringify(cancelled.db.world.negotiations[cancelled.nid]);
 cancelled.db.worldDate=globalTransferMarketWindow(2027).lastOpenDate;advanceOffseasonFreeAgencyDay(cancelled.db);
 check(JSON.stringify(cancelled.db.world.negotiations[cancelled.nid])===closed,'deadline rewrote cancelled negotiation');
 return {years:3,actualDays,restores,actualHumanAndAIProposals:true,noAutomaticSignature:true,lateSubmissionRejected:true,rollbackCases,cancelledPreserved:true,fullMarketTransitionImplemented:false};
})()`,{timeout:60000});
console.log('MARKET_DEADLINE_EXPIRY_ACCEPTANCE '+JSON.stringify(result));
