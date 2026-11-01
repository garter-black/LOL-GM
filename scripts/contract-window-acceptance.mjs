// Global December FA: standard contracts expire on Monday before the
// first Tuesday; incumbent renewals run until the annual FA date.
import {artifactSources,runEngineFixture} from './test-harness.mjs';

const fixture=String.raw`(()=>{
  const assert=(x,m)=>{if(!x)throw new Error('D04_CONTRACT_WINDOW '+m)};
  assert(globalPlayerFAOpenDate(2026)==='2026-12-01'&&
    globalPlayerFAOpenDate(2027)==='2027-12-07'&&
    globalPlayerFAOpenDate(2028)==='2028-12-05'&&
    globalPlayerContractExpiryDate(2027)==='2027-12-06'&&
    globalPlayerContractExpiryDate(2028)==='2028-12-04',
    'UTC December first Tuesday/previous Monday rule incorrect');
  let db=buildWorld(),mine=activeTeams(db,null,1)[0],
    peers=activeTeams(db,mine.region,1).filter(t=>t.id!==mine.id),
    pool=Object.values(db.players).filter(p=>!p.retired&&!p.team).slice(0,4);
  assert(mine&&peers.length>=2&&pool.length===4,
    'fixture missing same-region clubs/free players');
  let other=peers[0],third=peers[1],
    [ownRenew,ownWaive,target,aiTarget]=pool;
  setManagedTeam(db,mine.id);
  mine.finance.cash=other.finance.cash=third.finance.cash=1000;

  const resetExpiring=(p,t,goal='stability')=>{
    p.age=25;p.careerGoal=goal;p.personality.ambition=45;
    p.satisfaction=90;p.managerTrust=85;p.managerRelationship=80;
    p.rosterRole='core';
    signContract(db,p,t,asking(db,p,t.region),1,{promisedRole:'core'});
    p.contract.option=null;
    assert(p.contract.until===2027,'fixture contract not expiring in 2027');
  };
  resetExpiring(ownRenew,mine);
  resetExpiring(ownWaive,mine,'titles');
  resetExpiring(target,other);
  // Keep this source club interested in renewing so the fixture begins with
  // real exclusivity; the waiver below is the only thing that opens contact.
  target.rosterRole='competition';
  resetExpiring(aiTarget,third);

  db.world={year:2027,seed:'d04-b3',manage:'manual',phase:'offseason',
    seasons:{},steps:[],step:0,report:null,offers:[],marketLog:[],
    negotiations:{},recruitment:{},lastDate:'2027-11-07'};
  db.year=2027;db.worldDate='2027-11-07';

  let cw=initOffseasonContractWindow(db);
  assert(cw.seasonEndDate==='2027-11-07'&&cw.startDate==='2027-11-08'&&
    cw.exclusiveThrough==='2027-12-06'&&cw.contractExpiryDate==='2027-12-06'&&
    cw.outsideContactDate==='2027-12-07'&&cw.effectiveDate==='2027-12-07',
    'dates do not match the 2027 global December contract expiry / FA opening');
  assert(db.worldDate==='2027-11-08','exclusive window did not start next day');

  // No outside approach is legal during exclusivity without the incumbent's waiver.
  let blocked=startNegotiation(db,ownWaive.id,'early_fa',{teamId:other.id});
  assert(!blocked.ok&&blocked.msg.includes('허용'),
    'outside club bypassed incumbent exclusivity');

  // Incumbent can explicitly stop pursuing renewal while keeping the current
  // playing contract intact through day 14.
  let waiver=grantEarlyContact(db,ownWaive.id,'manager');
  assert(waiver.ok&&cw.contactWaivers[ownWaive.id]&&
    ownWaive.team===mine.id&&ownWaive.contract.until===2027,
    'incumbent waiver terminated or moved current contract');
  blocked=startNegotiation(db,ownWaive.id,'renewal');
  assert(!blocked.ok&&blocked.msg.includes('독점권'),
    'club reopened renewal after explicitly relinquishing exclusivity');

  // Another AI incumbent can grant the same right; the manager may then scout,
  // evaluate and negotiate without changing the player's current club.
  waiver=grantEarlyContact(db,target.id,'ai');
  assert(waiver.ok&&earlyContactAllowed(db,target,mine),
    'AI incumbent waiver did not expose early contact');
  setRecruitmentPriority(db,target.id,'A');
  scoutPlayers(db,[target.id],40,0);scoutPlayers(db,[target.id],40,0);
  assert(recruitmentEvaluation(db,target.id,mine.id).ok,
    'early-contact target could not complete normal recruitment evaluation');

  const acceptedOffer=(neg,p,t,kind)=>{
    const competitor=neg.competitors?.length?Math.max(...neg.competitors.map(x=>x.utility)):0;
    for(const role of ['core','starter','competition'])for(const years of [1,2,3])
      for(let k=10;k<=22;k++){
        const offer=normalizeContractTerms(db,p,t,
          asking(db,p,t.region)*k/10,years,{
            releaseGuaranteeRate:kind==='renewal'?1:.75,
            signingBonus:0,bonuses:{performance:0,title:0,international:0},
            promisedRole:role,option:null,buyout:null
          }),
          util=offerUtility(db,p,t,offer,{renewal:kind==='renewal'}),
          threshold=Math.max(offerAcceptanceThreshold(db,p,{kind}),competitor-.035);
        if(!negotiationBudgetError(db,p,t,offer,kind)&&
          contractOfferReasonable(db,p,t,offer,kind)&&util>=threshold)return offer;
      }
    throw new Error('D04_CONTRACT_WINDOW no acceptable legal '+kind+' offer');
  };

  let n=startNegotiation(db,target.id,'early_fa',{teamId:mine.id});
  assert(n.ok&&n.neg.kind==='early_fa','permitted early negotiation did not start');
  let offer=acceptedOffer(n.neg,target,mine,'early_fa'),
    r=submitNegotiationOffer(db,n.neg.id,offer);
  assert(r.ok&&n.neg.status==='accepted','permitted early agreement did not accept');
  let early=contractAgreementFor(db,target.id);
  assert(early?.kind==='early_fa'&&early.teamId===mine.id&&
    early.effectiveDate==='2027-12-07'&&target.team===other.id&&
    target.contract.until===2027,
    'early agreement moved player before old contract expiry');

  n=startNegotiation(db,ownRenew.id,'renewal');
  assert(n.ok,'incumbent renewal did not start');
  offer=acceptedOffer(n.neg,ownRenew,mine,'renewal');
  r=submitNegotiationOffer(db,n.neg.id,offer);
  assert(r.ok&&contractAgreementFor(db,ownRenew.id)?.kind==='renewal'&&
    ownRenew.contract.until===2027,'renewal did not remain future-dated');

  // Save/restore must preserve dates, waiver, and both future agreements.
  let packed=packDB(db);db=unpackDB(packed);
  mine=db.teams[mine.id];other=db.teams[other.id];
  ownRenew=db.players[ownRenew.id];ownWaive=db.players[ownWaive.id];
  target=db.players[target.id];cw=db.world.contractWindow;
  assert(cw.contactWaivers[ownWaive.id]&&
    contractAgreementFor(db,target.id)?.terms.releaseGuaranteeRate===.5&&
    contractAgreementFor(db,ownRenew.id)?.terms.releaseGuaranteeRate===.5&&
    contractAgreementFor(db,target.id)?.status==='agreed'&&
    contractAgreementFor(db,ownRenew.id)?.status==='agreed',
    'contract-window state failed save/restore');

  // B2 cooldown clock can consume real days inside the pre-FA window.
  const day=advanceOffseasonContractDay(db);
  assert(day.ok&&db.worldDate==='2027-11-09'&&cw.stage==='exclusive',
    'exclusive window did not advance one real day');

  // A restored save may reach the opening with its contract stage still
  // pending. Settling it must not rewind the shared world clock.
  let late=unpackDB(packDB(db));late.worldDate='2027-12-10';
  const lateBefore=packDB(late),lateWorld=late.world,actualExpiry=finalizeExclusiveContractExpiry;
  let failed=false;
  try{
    finalizeExclusiveContractExpiry=(...args)=>{actualExpiry(...args);throw Error('late settlement failure')};
    advanceOffseasonContractWindow(late);
  }catch(error){failed=error.message==='late settlement failure'}
  finally{finalizeExclusiveContractExpiry=actualExpiry}
  assert(failed&&packDB(late)===lateBefore&&late.world===lateWorld,
    'late settlement failure changed saved world');
  const lateResult=advanceOffseasonContractWindow(late);
  assert(lateResult.ok&&late.worldDate==='2027-12-10'&&late.world.contractWindow.stage==='fa',
    'late contract settlement rewound the world clock');
  assert(late.players[ownRenew.id].team===mine.id&&late.players[target.id].team===mine.id&&
    contractAgreementFor(late,target.id).status==='effective',
    'late settlement lost a prior accepted agreement');
  const lateSettled=packDB(late);
  assert(advanceOffseasonContractWindow(late).ok&&packDB(late)===lateSettled,
    'duplicate late settlement changed world state');
  assert(unpackDB(lateSettled).worldDate==='2027-12-10',
    'late settlement clock did not survive save/restore');

  // Standard expiry is the Monday before December's first Tuesday; FA opens the next UTC day.
  const settled=advanceOffseasonContractWindow(db);
  cw=db.world.contractWindow;
  ownRenew=db.players[ownRenew.id];ownWaive=db.players[ownWaive.id];
  target=db.players[target.id];
  assert(settled.ok&&cw.stage==='fa'&&db.worldDate==='2027-12-07'&&
    settled.settlement.expiryDate==='2027-12-06',
    'exclusive close did not use global December expiry / FA opening');
  assert(ownRenew.team===mine.id&&ownRenew.contract.signed===2028&&
    ownRenew.contract.releaseGuaranteeRate===.5,
    'accepted incumbent renewal did not activate for next season');
  assert(target.team===mine.id&&target.contract.signed===2028&&
    target.contract.releaseGuaranteeRate===.5&&
    contractAgreementFor(db,target.id).status==='effective'&&
    contractAgreementFor(db,target.id).appliedDate==='2027-12-07',
    'early agreement did not activate immediately after old contract expired');
  assert(!db.teams[other.id].roster.includes(target.id),
    'old club retained player after early agreement activation');
  assert(ownWaive.team!==mine.id||ownWaive.contract?.signed===2028,
    'waived player remained on an expired incumbent contract');

  // Career continuity lowers the bar for a reasonable contract, but genuine
  // undervaluation stays rejectable.
  const fa=Object.values(db.players).find(p=>!p.retired&&!p.team);
  assert(fa,'fixture missing FA after expiry');
  fa.age=26;fa.faYears=0;fa.personality.ambition=50;
  const faTeam=other,ask=asking(db,fa,faTeam.region),
    fair=normalizeContractTerms(db,fa,faTeam,ask,2,{promisedRole:'core'}),
    low=normalizeContractTerms(db,fa,faTeam,ask*.6,2,{promisedRole:'backup'});
  db.world.phase='season';
  const strict=offerAcceptanceThreshold(db,fa,{kind:'fa'});
  db.world.phase='offseason';db.world.contractWindow.stage='fa';
  const continuity=offerAcceptanceThreshold(db,fa,{kind:'fa'}),
    fairUtility=offerUtility(db,fa,faTeam,fair);
  assert(continuity<strict,'unsigned-season career risk did not lower fair-offer resistance');
  assert(contractOfferReasonable(db,fa,faTeam,fair,'fa')&&
    fairUtility>=continuity&&!contractOfferReasonable(db,fa,faTeam,low,'fa'),
    'career continuity did not accept a market-level core offer or accepted clear undervaluation');

  packed=packDB(db);db=unpackDB(packed);
  assert(db.world.contractWindow.stage==='fa'&&
    contractAgreementFor(db,target.id)?.status==='effective'&&
    db.players[target.id].team===mine.id,
    'effective contract window state failed final save/restore');

  console.log('D04_CONTRACT_WINDOW_ACCEPTANCE '+JSON.stringify({
    dates:{worldsEnd:'2027-11-07',exclusiveStart:'2027-11-08',
      expiry:'2027-12-06',outside:'2027-12-07'},
    waiver:{manager:ownWaive.id,external:target.id},
    agreements:{renewal:ownRenew.id,early:target.id},
    settlement:{applied:settled.settlement.applied.length,
      released:settled.settlement.released.length,
      options:settled.settlement.options.length},
    acceptance:{strict:Math.round(strict*1000)/1000,
      continuity:Math.round(continuity*1000)/1000,
      fairUtility:Math.round(fairUtility*1000)/1000,
      fair:true,undervalued:false},
    saveFormat:JSON.parse(packed).saveFormat
  }));
})();`;
await runEngineFixture(fixture,{timeout:30000,filename:'contract-window-acceptance.fixture.js'});


// Strict closure gate: synthetic fixture metadata only, never fabricated wins
// or a stand-in for an actually played full season.
const closureFixture=String.raw`(()=>{
  const assert=(ok,reason)=>{if(!ok)throw new Error('GLOBAL_FA_FINAL_GATE '+reason)};
  const db=buildWorld();
  db.year=2027;
  const worlds={comp:'WORLD_CHAMPIONSHIP',done:true,days:[{date:'2027-11-10'}]},
    masters={comp:'MASTERS',done:true,days:[{date:'2027-11-09'}]},
    open={comp:'OPEN',done:true,days:[{date:'2027-11-08'}]};
  db.world={year:2027,phase:'offseason',
    seasons:{worlds,masters,open},lastDate:'2027-11-10'};
  const beforeHistory=JSON.stringify(db.history);
  assert(contractWindowDates(db).seasonEndDate==='2027-11-10',
    'valid Worlds-final ordering refused');
  const rejects=(message,reason)=>{
    let got='';
    try{contractWindowDates(db)}catch(error){got=String(error.message)}
    assert(got.includes(message),reason+' not rejected: '+got);
    assert(JSON.stringify(db.history)===beforeHistory,
      'closure guard changed historical results');
  };
  masters.days[0].date='2027-11-11';
  rejects('월즈 결승 이후 또는 같은 날','later Masters');
  masters.days[0].date='2027-11-10';
  rejects('월즈 결승 이후 또는 같은 날','same-day UTC ordering unknown');
  masters.days[0].date='2027-11-09';
  masters.done=false;
  rejects('미완료 공식 대회','unfinished Masters');
  masters.done=true;
  db.world.year=db.year=2028;
  worlds.days[0].date='2028-11-19';
  masters.days[0].date='2028-11-17';
  open.days[0].date='2028-11-15';
  db.world.lastDate='2028-11-19';
  assert(contractWindowDates(db).outsideContactDate==='2028-12-05',
    '2028 December FA window drift');
  worlds.days[0].date='2028-12-05';
  rejects('선수 글로벌 FA 개방일 이후','Worlds reached 2028 FA open');
  // Read the real initial world schedule writer rather than naming the
  // priority as a documentation-only policy.
  const scheduled=buildWorld(),managed=activeTeams(scheduled,null,1)[0];
  startWorldSeason(scheduled,managed.id,'global-final-priority-test');
  const last=scheduled.world.steps.at(-1);
  assert(last?.kind==='intl'&&
    ['WORLD_CHAMPIONSHIP','MASTERS','OPEN'].every(id=>last.ids.includes(id))&&
    last.ids.indexOf('WORLD_CHAMPIONSHIP')<last.ids.indexOf('MASTERS')&&
    last.ids.indexOf('MASTERS')<last.ids.indexOf('OPEN'),
    'final-phase participants not reserved in Worlds/Masters/Open order');
  assert(scheduled.world.steps.filter(s=>s.kind==='intl'&&
    s.ids.some(id=>['WORLD_CHAMPIONSHIP','MASTERS','OPEN'].includes(id))).length===1,
    'end-phase international events split into post-Worlds steps');
  console.log('GLOBAL_FA_FINAL_GATE_ACCEPTANCE '+JSON.stringify({
    worldsLast:true,sameDayConservative:true,unfinishedBlocked:true,
    years:[2027,2028],historyUnchanged:true,lateEntrantsReserved:true,fullSeasonSimulated:false
  }));
})();`;
await runEngineFixture(closureFixture,{timeout:30000,
  filename:'contract-worlds-final-gate.fixture.js'});

const [appSource,market,stove]=await artifactSources(['app.js','ui-market.js','ui-stove.js']);
const app=appSource+'\n'+stove;
if(!app.includes('scontractday')||!app.includes('scontractopen')||
  !market.includes('data-allow-contact')||!market.includes('data-start-early')||
  !market.includes('bindContractWindow'))
  throw new Error('D04_CONTRACT_WINDOW UI does not expose waiver/early-contact/date controls');
console.log('D04_CONTRACT_WINDOW_UI_ACCEPTANCE '+JSON.stringify({
  dailyClock:true,incumbentWaiver:true,earlyContact:true,faOnGlobalDate:true
}));
