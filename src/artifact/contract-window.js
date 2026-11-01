// ===== LOL GM: Global player FA and contract expiry window =====
// Contracts expire Monday 23:59 UTC before December's first Tuesday FA opening.
// No extra renewal-priority days; existing contracts and contact consent remain.

function contractWindowYear(db){return db.world?.year??db.year}
function contractWindowAnchorDate(db){
  const w=db.world,finished=Object.values(w?.seasons||{}).filter(s=>s?.done&&s.days?.length),
    endDate=s=>s.days[s.days.length-1].date,
    worlds=finished.filter(s=>{
      const comp=db.competitions[s.comp];
      return isWorldChampionshipId(s.comp)||isWorldChampionshipId(comp?.id);
    });
  if(worlds.length)return validatedWorldsClosingDate(db,finished,worlds);
  // Custom worlds may omit the standard Worlds preset. Fall back to the
  // latest completed international, then the world's final scheduled date.
  const internationals=finished.filter(s=>db.competitions[s.comp]?.international);
  if(internationals.length)return internationals.map(endDate).sort().at(-1);
  return w?.lastDate||db.worldDate||contractWindowYear(db)+'-11-01';
}
// Shared UTC FA date helpers are owned by global-market-calendar.js.
function contractWindowDates(db){
  const year=contractWindowYear(db),
    seasonEnd=contractWindowAnchorDate(db),
    outsideContactDate=globalPlayerFAOpenDate(year),
    contractExpiryDate=globalPlayerContractExpiryDate(year);
  if(seasonEnd>=outsideContactDate)
    throw new Error('공식 시즌이 선수 글로벌 FA 개방일 이후까지 이어집니다: '+seasonEnd);
  return {
    seasonYear:year,startSeason:year+1,seasonEndDate:seasonEnd,
    startDate:addDays(seasonEnd,1),exclusiveThrough:contractExpiryDate,
    contractExpiryDate,outsideContactDate,effectiveDate:outsideContactDate
  };
}
function contractExpiresThisSeason(db,p){
  const year=contractWindowYear(db);
  return !!(p&&!p.retired&&p.team&&p.contract&&!p.contract.medicalReplacement&&
    p.contract.until===year);
}
function contractHasPendingOption(db,p){
  const year=contractWindowYear(db),o=p?.contract?.option;
  return !!(o&&o.year===year+1);
}
function contractAgreementStore(db){
  const w=db.world;if(!w)return {};
  w.contractAgreements=w.contractAgreements||{};
  return w.contractAgreements;
}
function contractAgreementFor(db,pid){return contractAgreementStore(db)[pid]||null}
function contractClosingPayrollSnapshot(db){
  const rows={};
  for(const t of activeTeams(db))rows[t.id]={
    salary:ownedContractPayroll(db,t),regulated:loanAnnualRegulatedPayroll(db,t)
  };
  return rows;
}
function initOffseasonContractWindow(db){
  const w=db.world;if(!w||w.phase!=='offseason')return w?.contractWindow||null;
  if(w.contractWindow)return w.contractWindow;
  const d=contractWindowDates(db);
  w.contractWindow={...d,stage:'exclusive',incumbentProcessed:false,
    completed:false,contactWaivers:{},financePayroll:contractClosingPayrollSnapshot(db)};
  contractAgreementStore(db);
  if(!db.worldDate||db.worldDate<d.startDate)setWorldCalendarDate(db,d.startDate);
  aiGrantEarlyContact(db);
  return w.contractWindow;
}
// A club can relinquish its pre-FA contact exclusivity without terminating the
// still-binding playing contract. Early agreements take effect at global FA.
function grantEarlyContact(db,pid,actor='manager'){
  const cw=db.world?.contractWindow,p=db.players[pid],
    t=p?.team&&db.teams[p.team];
  if(!cw||cw.stage!=='exclusive'||db.worldDate>cw.contractExpiryDate||
    !contractExpiresThisSeason(db,p)||!t)
    return {ok:false,msg:'현재 계약 만료 전 협상 중인 선수가 아닙니다'};
  const auth=playerActionAuthority(db,actor,t);
  if(auth)return {ok:false,msg:auth.errors?.join(' · ')||'구단 결정 권한이 없습니다'};
  if(contractHasPendingOption(db,p))
    return {ok:false,msg:'다음 시즌 옵션 행사 여부가 먼저 결정돼야 합니다'};
  if(contractAgreementFor(db,pid)?.status==='agreed')
    return {ok:false,msg:'이미 재계약에 합의해 조기 접촉을 허용할 수 없습니다'};
  cw.contactWaivers=cw.contactWaivers||{};
  if(cw.contactWaivers[pid])
    return {ok:true,waiver:cw.contactWaivers[pid],msg:'이미 타 구단 접촉을 허용했습니다'};
  const row={pid,incumbentId:t.id,grantedDate:db.worldDate,
    expiresOn:cw.contractExpiryDate,actor};
  cw.contactWaivers[pid]=row;
  const renewal=negotiationStore(db)[negotiationId(db,pid,'renewal')];
  if(renewal?.status==='open'){
    renewal.status='cancelled';renewal.closedDate=db.worldDate;
    renewal.reason='원소속 구단이 독점 접촉권 포기';
    const target=recruitmentTarget(db,pid);
    if(target?.negotiationId===renewal.id)target.negotiationId=null;
  }
  recordPlayerEvent(p,'early_contact_allowed',cw.seasonYear,{
    team:t.id,date:db.worldDate,expiryDate:cw.contractExpiryDate,actor});
  return {ok:true,waiver:row,msg:p.name+' 타 구단 조기 접촉 허용 · 계약은 '+
    cw.contractExpiryDate+'까지 유지됩니다'};
}
function earlyContactAllowed(db,p,t){
  const cw=db.world?.contractWindow,waiver=cw?.contactWaivers?.[p?.id];
  return !!(cw?.stage==='exclusive'&&db.worldDate<=cw.contractExpiryDate&&
    waiver&&waiver.incumbentId===p.team&&p.team!==t?.id&&
    !contractHasPendingOption(db,p)&&!contractAgreementFor(db,p.id)?.status?.match(/^(agreed|effective)$/));
}
function contractWindowContactError(db,p,t,kind){
  const w=db.world,cw=w?.contractWindow;
  if(!w||w.phase!=='offseason'||!cw)return '오프시즌 계약 협상 기간이 아닙니다';
  if(cw.stage!=='exclusive'||db.worldDate>cw.contractExpiryDate)
    return '기존 계약 만료 전 협상 단계가 끝났습니다';
  if(!p||!t||!contractExpiresThisSeason(db,p))
    return '이번 시즌 만료 예정인 계약이 아닙니다';
  if(contractAgreementFor(db,p.id)?.status==='agreed')
    return '이미 다음 시즌 계약에 합의한 선수입니다';
  if(kind==='early_fa')
    return earlyContactAllowed(db,p,t)?null:
      '원소속 구단이 조기 접촉을 허용하지 않은 선수입니다';
  if(kind!=='renewal'||p.team!==t.id)
    return '원소속 구단만 재계약을 진행할 수 있습니다';
  if(cw.contactWaivers?.[p.id])
    return '원소속 구단이 독점권을 포기해 재계약 대신 타 구단 접촉을 허용한 선수입니다';
  return null;
}
function recordContractAgreement(db,p,t,terms,kind='renewal',actor='manager'){
  if(!contractGuaranteeTermsValid(terms))
    return {ok:false,msg:'유효하지 않은 방출 보장률입니다'};
  const auth=playerActionAuthority(db,actor,t);
  if(auth)return {ok:false,msg:auth.errors?.join(' · ')||'구단 계약 권한이 없습니다'};
  const err=contractWindowContactError(db,p,t,kind);if(err)return {ok:false,msg:err};
  if(kind==='early_fa'&&actor==='manager'&&!recruitmentReady(db,p.id,t.id))
    return {ok:false,msg:'조기 접촉 허용 뒤에도 스카우팅과 내부 평가가 필요합니다'};
  // Next-season terms leave the current contract intact until expiry.
  const cw=db.world.contractWindow,
    normalized=withContractStartSeason(db,cw.startSeason,()=>
    normalizeContractTerms(db,p,t,terms.salary,terms.years,terms)),
    budgetErr=negotiationBudgetError(db,p,t,normalized,kind);
  if(budgetErr)return {ok:false,msg:budgetErr};
  const row={pid:p.id,fromTeamId:p.team,teamId:t.id,kind,status:'agreed',
      agreedDate:db.worldDate,effectiveDate:cw.effectiveDate,
      contractExpiryDate:cw.contractExpiryDate,startSeason:cw.startSeason,
      salary:normalized.salary,years:normalized.years,terms:normalized,actor};
  contractAgreementStore(db)[p.id]=row;
  recordPlayerEvent(p,kind==='renewal'?'renewal_agreement':'early_fa_agreement',cw.seasonYear,{
    from:p.team,to:t.id,agreedDate:db.worldDate,effectiveDate:cw.effectiveDate,
    contractExpiryDate:cw.contractExpiryDate,salary:normalized.salary,
    years:normalized.years
  });
  for(const neg of Object.values(negotiationStore(db))){
    if(neg.pid!==p.id||neg.status!=='open')continue;
    if(neg.teamId===t.id&&neg.kind===kind)continue;
    neg.status='superseded';neg.reason='선수가 다음 시즌 계약에 합의';neg.closedDate=db.worldDate;
  }
  return {ok:true,agreement:row,msg:p.name+' 다음 계약 합의 · 기존 계약 '+
    cw.contractExpiryDate+'까지 유지 · '+cw.effectiveDate+' 새 계약 시작'};
}
function aiRunExclusiveRenewals(db){
  const w=db.world,cw=w?.contractWindow;if(!cw||cw.incumbentProcessed)return [];
  const manual=w.manage==='manual'?managedRecruitmentTeamId(db):null,
    rng=new RNG(w.seed+'/'+cw.seasonYear,'exclusive-renewal'),rows=[];
  for(const t of activeTeams(db).filter(t=>!manual||parentTeamOf(db,t)?.id!==manual)){
    for(const id of (t.roster||[]).slice()){
      const p=db.players[id];
      if(!contractExpiresThisSeason(db,p)||contractHasPendingOption(db,p)||
        cw.contactWaivers?.[p.id]||contractAgreementFor(db,p.id))continue;
      const decision=aiRenewalDecision(db,p,t,rng);if(!decision.accepted)continue;
      const r=recordContractAgreement(db,p,t,decision.proposal,'renewal','ai');
      if(r.ok)rows.push(r.agreement);
    }
  }
  cw.incumbentProcessed=true;return rows;
}
function exerciseExclusiveTeamOption(db,pid){
  const w=db.world,cw=w?.contractWindow,p=db.players[pid],
    t=p?.team&&db.teams[p.team],mine=managedTeamId(db),o=p?.contract?.option;
  if(!w||w.phase!=='offseason'||!cw||cw.stage!=='exclusive')
    return {ok:false,msg:'팀 옵션 행사 기간이 아닙니다'};
  if(!p||!t||parentTeamOf(db,t)?.id!==mine||!o||o.type!=='team'||
    o.year!==cw.startSeason||p.contract.until!==cw.seasonYear)
    return {ok:false,msg:'행사할 수 있는 다음 시즌 팀 옵션이 없습니다'};
  const before=db.year;db.year=cw.startSeason;
  const result=commitWorldAction(db,{type:'player.option',pid:p.id,teamId:t.id,
    actor:'manager'});
  db.year=before;
  return result.ok?{ok:true,msg:p.name+' 팀 옵션 행사 · '+cw.startSeason+' 시즌 계약 확정'}:
    {ok:false,msg:(result.errors||['팀 옵션 행사 실패']).join(' · ')};
}
function closeExclusiveContractWindow(db){
  const rollback=pendingOfficialUndo(db);try{
  const cw=initOffseasonContractWindow(db);
  if(!cw)return {ok:false,msg:'계약 협상 기간을 종료할 수 없습니다'};
  if(cw.stage!=='exclusive')return {ok:true,stage:cw.stage,date:db.worldDate,
    settlement:cw.settlement||null,msg:'기존 계약 만료 전 단계가 이미 끝났습니다'};
  const renewals=aiRunExclusiveRenewals(db),earlyOffers=aiRunEarlyContactOffers(db);
  if(!freeAgencyDateValid(db.worldDate))throw Error('날짜 오류');
  setWorldCalendarDate(db,db.worldDate>cw.outsideContactDate?db.worldDate:cw.outsideContactDate);
  processTransferPayments(db);
  processLocalServiceDaily(db);aiChooseLocalEligibility(db);
  const settlement=finalizeExclusiveContractExpiry(db);
  cw.stage='fa';cw.completed=true;cw.settlement=settlement;
  refreshAIMarketOffers(db);
  return {ok:true,stage:'fa',date:db.worldDate,renewals,earlyOffers,settlement,
    msg:'글로벌 선수 FA 개방 · 기존 계약 만료 · 신규 협상 가능'};
  }catch(error){rollback();throw error}
}
function advanceOffseasonContractDay(db){
  const rollback=pendingOfficialUndo(db);try{
  const cw=initOffseasonContractWindow(db);
  if(!cw)return {ok:false,msg:'계약 협상 기간을 진행할 수 없습니다'};
  if(cw.stage!=='exclusive')return {ok:true,stage:cw.stage,date:db.worldDate,
    msg:'기존 계약 만료 전 단계가 이미 끝났습니다'};
  const next=addDays(db.worldDate,1);
  if(next>=cw.outsideContactDate)return closeExclusiveContractWindow(db);
  setWorldCalendarDate(db,next);processTransferPayments(db);processLocalServiceDaily(db);aiChooseLocalEligibility(db);aiRunEarlyContactOffers(db);
  return {ok:true,stage:'exclusive',date:db.worldDate,
    msg:'기존 계약 만료 전 · '+db.worldDate};
  }catch(error){rollback();throw error}
}
function advanceOffseasonContractWindow(db){return closeExclusiveContractWindow(db)}
