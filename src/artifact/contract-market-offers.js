// ===== LOL GM: Independent AI contract market proposals =====
// Owns actual offer issuance/history; roster and finance commits stay with player.sign.

// Real club proposals live with the contract domain, independently of human
// negotiations. They reserve neither money nor a roster slot. Every consumer
// rechecks the current period, authority, need, registration and finite funds.
function aiMarketOfferPeriod(db){
  const w=db.world;if(!w)return null;
  if(w.phase==='initial_roster')return {id:'initial/'+w.year,kind:'initial',year:w.year};
  if(w.phase==='offseason'){
    const day=freeAgencyDayState(db);
    return day.stage==='fa'&&db.worldDate<=day.through
      ?{id:'fa/'+w.contractWindow.startSeason+(db.worldDate>=globalTransferMarketWindow(w.year).closesOn?'/post':''),kind:'fa',year:w.contractWindow.startSeason}:null;
  }
  // Annual settlement advances db.year before the old world's year rolls over.
  if(w.phase==='market')return {id:'market/'+db.year,kind:'fa',year:db.year};
  return null;
}
function currentAIMarketOffers(db){
  const period=aiMarketOfferPeriod(db);
  return period?Object.values(db.contractMarketOffers?.periods?.[period.id]?.offers||{}):[];
}
function aiMarketOfferDeadlineState(db,o){
  if(typeof o?.issuedAt!=='string'||!Number.isFinite(Date.parse(o.issuedAt))||
    new Date(o.issuedAt).toISOString()!==o.issuedAt)
    return {deadline:null,passed:false,error:'AI 제안 발행 시각을 확인할 수 없습니다'};
  return negotiationMarketDeadlineState(db,{kind:o.kind,createdDate:o.issuedAt.slice(0,10)});
}
function aiMarketOfferAvailable(db,o,market=null){
  const deadline=aiMarketOfferDeadlineState(db,o);
  if(deadline.error||deadline.passed)return false;
  const period=aiMarketOfferPeriod(db),p=db.players[o?.pid],t=db.teams[o?.teamId];
  if(!period||db.contractMarketOffers?.periods?.[period.id]?.closedAt||o.period!==period.id||o.kind!==period.kind||o.status!=='open'||
    typeof o.issuedAt!=='string'||!Number.isFinite(Date.parse(o.issuedAt))||
    new Date(o.issuedAt).toISOString()!==o.issuedAt||o.issuedAt>negotiationClockAt(db)||
    !p||p.retired||p.team||!t||(t.parent&&o.kind!=='initial')||
    t.active===false||playerActionAuthority(db,'ai',t)||!o.terms||
    !Number.isFinite(o.terms.salary)||o.terms.salary<=0||
    !Number.isInteger(o.terms.years)||o.terms.years<=0||
    !contractGuaranteeTermsValid(o.terms)||invalidContractNumericTerms(o.terms)||
    !Number.isFinite(t.finance?.cash)||negotiationBudgetError(db,p,t,o.terms,o.kind))return false;
  if(o.kind==='initial')return t.roster.length<(o.target??initialLegalMinimumTarget(db,t))&&
    initialFutureFeasible(db,t,p,o.terms.salary,market);
  const room=salaryBudget(db,t)-payroll(db,t);
  return Number.isFinite(room)&&o.terms.salary<=room&&
    aiMarketOfferCandidates(db,t,[p],p.role,room,period.year).length>0;
}
function closeAIMarketOffer(db,o,status,reason){
  if(o.status!=='open')return;
  o.status=status;o.reason=reason;o.closedAt=negotiationClockAt(db);
}
function expireCurrentAIMarketOffers(db,periodId=aiMarketOfferPeriod(db)?.id){
  const store=periodId&&db.contractMarketOffers?.periods?.[periodId];
  if(!store)return;
  for(const o of Object.values(store.offers))closeAIMarketOffer(db,o,'expired','period_closed');
  store.closedAt=negotiationClockAt(db);
}
function issueAIMarketOffer(db,t,p,terms,event,target=null,choiceValue=null,market=null,expectedPeriod=null){
  const period=aiMarketOfferPeriod(db);if(!period)return null;
  if(expectedPeriod&&period.id!==expectedPeriod)return null;
  if(db.contractMarketOffers?.periods?.[period.id]?.closedAt)return null;
  const root=db.contractMarketOffers||(db.contractMarketOffers={version:1,periods:{}}),
    store=root.periods[period.id]||(root.periods[period.id]={offers:{},events:{}}),
    id=period.id+'/'+event+'/'+t.id+'/'+p.id;
  if(store.offers[id])return aiMarketOfferAvailable(db,store.offers[id],market)
    ?store.offers[id]:null;
  const offer={id,period:period.id,kind:period.kind,pid:p.id,teamId:t.id,
    terms:JSON.parse(JSON.stringify(terms)),issuedAt:negotiationClockAt(db),status:'open',
    ...(period.kind==='initial'?{target:target??initialLegalMinimumTarget(db,t),choiceValue}: {})};
  if(!aiMarketOfferAvailable(db,offer,market))return null;
  // Superseding is an actual new club offer; retain the old terms and outcome.
  for(const old of Object.values(store.offers))if(old.pid===p.id&&old.teamId===t.id)
    closeAIMarketOffer(db,old,'withdrawn','superseded');
  store.offers[id]=offer;return offer;
}
function settleAIMarketOffers(db,pid,teamId,terms){
  // JSON object order is not a contract term. Preserve the saved quote verbatim
  // while comparing its values, including nested clauses, against the writer.
  const key=value=>JSON.stringify(value,(_,row)=>row&&typeof row==='object'&&!Array.isArray(row)
    ?Object.fromEntries(Object.keys(row).sort().map(k=>[k,row[k]])):row),signedKey=key(terms);
  for(const o of currentAIMarketOffers(db))if(o.pid===pid)
    closeAIMarketOffer(db,o,o.teamId===teamId&&key(o.terms)===signedKey
      ?'accepted':'withdrawn',o.teamId===teamId?'contract_signed':'other_club_signed');
}
function refreshAIMarketOffers(db){
  const period=aiMarketOfferPeriod(db);if(!period)return [];
  if(db.contractMarketOffers?.periods?.[period.id]?.closedAt)return currentAIMarketOffers(db);
  const root=db.contractMarketOffers||(db.contractMarketOffers={version:1,periods:{}});
  for(const [id,store] of Object.entries(root.periods)){
    if(id!==period.id&&store.closedAt)continue;
    for(const o of Object.values(store.offers)){
      if(o.status!=='open')continue;
      const expired=id!==period.id||aiMarketOfferDeadlineState(db,o).passed;
      if(expired||!aiMarketOfferAvailable(db,o))
        closeAIMarketOffer(db,o,expired?'expired':'withdrawn',expired?'period_closed':'conditions_changed');
    }
    if(id!==period.id)store.closedAt=negotiationClockAt(db);
  }
  const store=root.periods[period.id]||(root.periods[period.id]={offers:{},events:{}}),
    event='day/'+db.worldDate;
  if(store.events[event])return currentAIMarketOffers(db);
  const teams=activeTeams(db,null,1).filter(t=>!t.parent&&!playerActionAuthority(db,'ai',t))
    .sort((a,b)=>a.id.localeCompare(b.id)),
    market=period.kind==='initial'?initialMarketSnapshot(db,teams):null,
    fas=period.kind==='fa'?Object.values(db.players).filter(p=>!p.retired&&!p.team):[];
  for(const t of teams){
    if(period.kind==='initial'){
      if(currentAIMarketOffers(db).some(o=>o.teamId===t.id&&o.status==='open'))continue;
      const proposal=initialOfferForTeam(db,t,0,db.world.seed+'|minimum',market,initialLegalMinimumTarget(db,t));
      if(proposal)issueAIMarketOffer(db,t,proposal.player,proposal.terms,event,
        initialLegalMinimumTarget(db,t),proposal.value,market);
    }else for(const role of ROLES){
      if(currentAIMarketOffers(db).some(o=>o.teamId===t.id&&db.players[o.pid]?.role===role&&o.status==='open'))continue;
      const room=salaryBudget(db,t)-payroll(db,t),
        candidate=aiMarketOfferCandidates(db,t,fas,role,room,period.year)[0];
      if(!candidate)continue;
      const rng=new RNG(db.world.seed+'/'+period.id+'/'+event+'/'+t.id+'/'+role,'ai-market-offer'),
        terms=aiMarketProposalTerms(db,candidate.p,t,candidate.ask,rng);
      issueAIMarketOffer(db,t,candidate.p,terms,event,null,null,null,period.id);
    }
  }
  store.events[event]=true;return currentAIMarketOffers(db);
}
