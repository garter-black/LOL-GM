function ensureEven(db,rng,ev){
  for(const R of Object.values(db.regions)){
    for(const div of R.div2?[1,2]:[1]){
      const n=activeTeams(db,R.id,div).length;
      if(n%2){const t=div===1?genTeam(db,rng,R.id,R.strength-3):genTeam(db,rng,R.id,R.strength-8,{div:2});if(R.system==='mixed'&&div===1)t.franchised=false;
        if(div===1&&R.div2&&R.system==='franchise')makeAcademy(db,rng,t);
        ev(`${div===1?R.leagueName:divName(R)} 신규 창단 승인: ${t.name} (${n+1}팀 체제)`)}
    }
    // 프랜차이즈 2군 리그는 모구단 수와 맞춘다
    if(R.div2&&R.system==='franchise'){for(const t of activeTeams(db,R.id,1))if(!activeTeams(db,R.id,2).some(a=>a.parent===t.id))makeAcademy(db,rng,t)}
    R.teams=activeTeams(db,R.id,1).length;
  }
  syncCompetitionLicenses(db,'office-structure-review');
}

// ---- 영입 후보 / 관심 → 관찰 → 내부평가 ----

// ===== LOL GM: Offseason orchestration =====
// Owns season closeout, retirement/growth handoff, market-close transition,
// promotion/relegation and next-season organizational reset.

// ---------- 오프시즌 1단계: 기록·성장·은퇴·승강·흥행·재정·사무국 ----------
// The shared undo restores graph values and identities. Annual growth also
// deletes and reinserts properties, so restore their original order on failure.
function pendingAnnualUndo(db){
  const undo=pendingOfficialUndo(db),seen=new Set(),pending=[db],orders=[];
  while(pending.length){
    const object=pending.pop();if(!object||typeof object!=='object'||seen.has(object))continue;
    seen.add(object);const keys=Object.keys(object);orders.push([object,keys]);
    for(const key of keys){const value=object[key];if(value&&typeof value==='object')pending.push(value)}
  }
  return ()=>{
    undo();
    for(const [object,keys] of orders){
      const current=Object.keys(object);if(current.length===keys.length&&current.every((key,i)=>key===keys[i]))continue;
      const values=keys.map(key=>object[key]);for(const key of current)delete object[key];
      keys.forEach((key,i)=>{object[key]=values[i]});
    }
  };
}
function pendingManagerMarketResponse(db){
  const w=db.world;
  return w?.manage==='manual'&&!w.fired&&!!managedTeamId(db)&&
    Object.values(w.negotiations||{}).some(n=>n.teamId===managedTeamId(db)&&n.status==='open'&&n.stage==='waiting');
}
function runOffseason(db){
  // A stale UI/duplicate command must not grow players or settle the same year
  // again after the manual annual closeout has already produced its report.
  if(db.world?.report?.year===db.world.year&&db.world.phase!=='offseason')return db.world.report;
  // Reject an incomplete ledger before contract dates, growth or retirement
  // change. A paid legacy year without its report needs diagnosis, not replay.
  if(assertFinanceCloseout(db,db.world)==='closed')throw Error('이미 연간 결산이 완료된 시즌입니다');
  if(db.world?.phase!=='offseason')throw Error('오프시즌에만 연간 결산을 할 수 있습니다');
  if(db.world?.phase==='offseason'&&pendingManagerMarketResponse(db))
    throw Error('응답 대기 중인 제안을 직접 취소하거나 연락을 확인한 뒤 결산하세요');
  const undo=pendingAnnualUndo(db);
  try{
  let w=db.world,cw=initOffseasonContractWindow(db);
  // Headless/AI callers historically advanced offseason in one call. Preserve
  // that contract while the interactive UI exposes both real window stages.
  if(cw?.stage==='exclusive')advanceOffseasonContractWindow(db);
  w=db.world;cw=w.contractWindow;
  const globalWindow=cw?.outsideContactDate===globalPlayerFAOpenDate(w.year)?globalTransferMarketWindow(w.year):null;
  if(globalWindow&&cw.stage==='fa'){
    while(db.worldDate<globalWindow.closesOn){
      const previousDate=db.worldDate;
      const day=advanceOffseasonFreeAgencyDay(db,'system');
      if(!day?.ok||db.worldDate!==addDays(previousDate,1))throw Error(day?.msg||'이적시장 날짜를 진행할 수 없습니다');
    }
    w=db.world;cw=w.contractWindow;
  }
  const rng=new RNG(w.seed+'/'+w.year,'offseason'), f=WORLD_CHANGE_FREQUENCY;
  const rep={year:w.year,growth:[],retired:[],signings:[],resign:[],expired:[],transfers:[],events:[]};
  const ev=t=>{rep.events.push(t);news(db,t)};
  const games={}, champGames={};
  for(const s of Object.values(w.seasons)){
    const cname=db.competitions[s.comp].name+(s.label?' '+s.label:'');
    for(const [pid,st] of Object.entries(s.pstats)){const p=db.players[pid];if(!p||p.retired)continue;
      games[pid]=(games[pid]||0)+st.g;champGames[pid]=champGames[pid]||{};
      for(const [c,[n]] of Object.entries(st.champs))champGames[pid][c]=(champGames[pid][c]||0)+n;
      const tm=p.team&&db.teams[p.team],value=playerMarketValue(db,p);
      p.career.push({year:w.year,seasonId:s.id,comp:s.comp,cname,team:p.team,region:tm?tm.region:playerActiveLocalRegion(p),division:tm?(tm.division||1):null,squad:playerSquadLabel(db,p),international:!!db.competitions[s.comp].international,ovr:playerOvr(p),reputation:p.reputation||0,marketValue:value,salary:p.contract?p.contract.salary:null,contractUntil:p.contract?p.contract.until:null,g:st.g,w:st.w,k:st.k,d:st.d,a:st.a,cs:st.cs,dmg:st.dmg,gold:st.gold||0,dmgTaken:st.dmgTaken||0,vision:st.vision||0,objectives:st.objectives||0,csDiff:st.csDiff||0,goldDiff:st.goldDiff||0,laneAdv:st.laneAdvGames?st.laneAdvSum/st.laneAdvGames:0,teamfightDmg:st.teamfightDmg||0,teamfights:st.teamfights||0,teamfightWins:st.teamfightWins||0,teamfightShare:st.g?st.teamfightShareSum/st.g:0,kp:st.g?st.kpSum/st.g:0,min:st.min,mvp:st.mvp,rating:st.g&&st.ratingSum?st.ratingSum/st.g:null});}
    if(s.champion)db.teams[s.champion].roster.forEach(pid=>{const p=db.players[pid];if(p){p.titles.push(`${w.year} ${cname}`);p.reputation=Math.round(clamp((p.reputation||playerOvr(p))+2,20,99));recordPlayerEvent(p,'title',w.year,{competition:cname,team:s.champion,international:!!db.competitions[s.comp].international})}});
  }
  rep.awards=[];rep.coaches=[];rep.hof=[];
  processTransferPayments(db);
  seasonAwards(db,w,rep);
  for(const p of Object.values(db.players)){const rows=(p.career||[]).filter(c=>c.year===w.year);if(!rows.length)continue;const gamesN=rows.reduce((a,c)=>a+c.g,0),rating=gamesN?rows.reduce((a,c)=>a+(c.rating||6.5)*c.g,0)/gamesN:6.5,intl=rows.some(c=>c.international),awardN=rep.awards.filter(a=>a.pid===p.id).length,target=clamp(playerOvr(p)*.72+rating*3.2+(intl?2:0)+awardN*2,20,99);p.reputation=Math.round(clamp((p.reputation||playerOvr(p))*.72+target*.28,20,99))}
  evalGoals(db,w,rep,ev);
  for(const R of Object.values(db.regions)){const s=finalSeason(w,R);if(s&&s.done)R.lastPlacement=regionPlacements(db,R)}
  for(const p of Object.values(db.players)){if(p.retired)continue;const d=growPlayer(db,p,rng,games[p.id]||0,champGames[p.id]||{});p.developmentTrail=p.developmentTrail||[];p.developmentTrail.push({year:w.year,ovr:playerOvr(p)});p.developmentTrail=p.developmentTrail.slice(-6);if(p.team)rep.growth.push({pid:p.id,d,ovr:playerOvr(p)})}
  rep.growth.sort((a,b)=>b.d-a.d);
  for(const p of Object.values(db.players)){ if(p.retired)continue;
    const o=playerOvr(p), R=db.regions[p.region],dev=ensurePlayerDevelopment(p),declineYears=p.age-(dev.peakAge+1);
    let pr=declineYears<=0?0:declineYears*.06*dev.declineRate+(p.age>=31?.18:0)+(R&&o<R.strength-8?.12:0);
    if(R&&o>=R.strength+5)pr*=.4;
    if(!p.team){p.faYears++;if(p.age>=23&&p.faYears>=2)pr+=0.5;if(p.faYears>=3)pr+=0.6;if(p.faYears>=2&&!p.career.length){delete db.players[p.id];continue}}
    if(rng.chance(pr)){p.retired=true;p.retiredYear=w.year;p.peak=Math.max(o,...p.career.map(c=>c.ovr||0));
      const wasTeam=p.team;
      if(p.team){const oldTeam=p.team;removePlayerFromTeam(db,p);rep.retired.push({pid:p.id,team:oldTeam,age:p.age,ovr:o})}
      if(!p.career.length&&!wasTeam){delete db.players[p.id];continue}
      recordPlayerEvent(p,'retirement',w.year,{team:wasTeam,age:p.age,peak:p.peak});if(hallOfFame(db,p))rep.hof.push(p.id);
      delete p.pool;delete p.tend;delete p.attrs;}
  }
  db.year=w.year+1;
  aiChooseLocalEligibility(db);
  // Consume the existing passive recovery interval without rewinding the live
  // world clock after contract dates have already advanced.
  if(!freeAgencyDateValid(db.worldDate))throw Error('연간 결산의 현재 날짜를 확인할 수 없습니다');
  const defaultRolloverDate=globalWindow?db.worldDate:`${db.year}-01-06`,medicalRolloverDate=db.worldDate>defaultRolloverDate?db.worldDate:defaultRolloverDate;
  medicalOffseasonRecovery(db,medicalRolloverDate,cw?.seasonEndDate||undefined);
  setWorldCalendarDate(db,medicalRolloverDate);
  promotionRelegation(db,w,rng,ev);
  updateHype(db,w);
  closeFinances(db,w,rng,ev);
  rep.contractWindow=settleOffseasonContractRollover(db,rep);
  setWorldCalendarDate(db,medicalRolloverDate);
  if(f>0){
    const successionCount=db.global?.regionHistory?.length||0;
    officeDecisions(db,rng,f,ev);
    globalOffice(db,w,rng,f,ev);
    if((db.global?.regionHistory?.length||0)!==successionCount)aiChooseLocalEligibility(db);
  }
  ensureEven(db,rng,ev);
  rep.rookies=[];rep.rookieGlobal=rookieGlobalCohort(db);
  for(const R of Object.values(db.regions)){const cls=generateRookieClass(db,R,rng),ri=R.rookieIntake[R.rookieIntake.length-1];rep.rookies.push({region:R.id,count:cls.length,ids:cls.map(p=>p.id),label:ri.label,tiers:ri.tiers,profile:ri.profile})}
  rep.expiryComplianceSignings=reconcileMinimumRosterAfterExpiry(db,rng,rep);
  const supplyErrs=talentSupplyErrors(db);if(supplyErrs.length)throw new Error('Talent supply invariant failed before market: '+supplyErrs.slice(0,8).join(' | '));
  for(const t of activeTeams(db)){if(t.id===managedTeamId(db))ensureStaffRoster(t);else ensureTeamStaff(db,t,rng)}ageStaff(db,rng);genStaffPool(db,rng);
  ageScoutReports(db);
  for(const t of activeTeams(db,null,1))aiManageStaff(db,t,rng);
  // Player-controlled and AI boards share the same facility investment model.
  // Need, maturity and economic opportunity cost—not a fixed regional upgrade—drive proposals.
  for(const t of activeTeams(db,null,1)){
    const f=ensureFacilities(t),liquidity=financeRunway(db,t),projected=financeForecast(db,t).closingCash;
    if((t.facilityProjects||[]).length>=2||['critical','strained'].includes(liquidity.severity))continue;
    const options=FACILITY_TYPES.filter(key=>f[key]<5&&!(t.facilityProjects||[]).some(p=>p.key===key))
      .map(key=>{
        const cost=facilityCost(db,t,key);
        const reserve=Math.max(cost*(t.philosophy==='cost'?4:2.5),liquidity.monthly*3);
        return {key,cost,reserve,benefit:facilityInvestmentScore(db,t,key)};
      })
      .filter(opt=>t.finance.cash>opt.cost+opt.reserve&&projected>opt.cost+opt.reserve)
      .sort((a,b)=>b.benefit-a.benefit||a.key.localeCompare(b.key));
    const best=options[0];
    if(best&&best.benefit>.6&&rng.chance(clamp(.1+best.benefit*.18,0,.45))){
      upgradeFacility(db,t,best.key,{deferDays:facilityBuildDays(f[best.key])});
      ev(`${t.name} 시설 투자 결정: ${FACILITY_LABELS[best.key]} ${f[best.key]}→${f[best.key]+1} 단계 · ${money(best.cost)}`);
    }
  }
  // D03-B3: once staff/facility decisions are known, AI clubs spend real
  // cash on a bounded pre-market scouting operation. Manager scouting remains manual.
  rep.aiScouting=aiRunActiveScouting(db);
  // 선수 만족도: 한 시즌 누적 출전/역할/계약/성적/국제전/커리어 목표를 결산한다.
  for(const t of activeTeams(db)){t._pre=t.roster.slice();for(const id of t.roster){const p=db.players[id];if(!p||!p.contract)continue;pState(p);p.form=0;p.fatigue=5;}}
  offseasonPlayerSatisfaction(db,w,rep,ev);
  const managed=managedTeam(db);
  w.sponsorOffers=managed&&managed.active!==false&&db.regions[managed.region]?sponsorOffers(db,managed):[];
  w.report=rep; w.phase='market'; w.offers=[]; w.marketLog=[];
  closeOpenNegotiationsForDeadline(db);
  refreshAIMarketOffers(db);
  return rep;
  }catch(error){undo();throw error}
}
// ---------- 오프시즌 2단계: 이적 시장 마감 ----------
function closeMarket(db){
  // A stale repeated command must never rerun AI signings or settlement.
  if(db.world?.phase!=='market')
    throw new Error('이적시장이 진행 중일 때만 마감할 수 있습니다');
  // A stale or premature close command must not settle the market while the
  // globally authoritative transfer window is still open.
  if(globalTransferMarketState(db.worldDate).open)
    throw new Error('28일 통합 이적시장 개방 중에는 시장을 마감할 수 없습니다');
  // The opening is not a closing: a stale market phase before this season's
  // window must not settle the year before its own deadline either.
  if(db.worldDate<globalTransferMarketWindow(db.world.year).closesOn)
    throw new Error('이번 시즌 이적시장 마감일 전에 시장을 마감할 수 없습니다');
  if(pendingManagerMarketResponse(db))
    throw Error('응답 대기 중인 제안을 직접 취소하거나 연락을 확인한 뒤 마감하세요');
  const undo=pendingOfficialUndo(db);
  try{
  const w=db.world, rng=new RNG(w.seed+'/'+w.year,'market'), rep=w.report;
  const ev=t=>{rep.events.push(t);news(db,t)};
  closeOpenNegotiationsForDeadline(db);
  contractMarket(db,rng,rep,ev);
  ensureEven(db,rng,ev);
  for(const t of activeTeams(db,null,1))aiManageOwnedReserve(db,t);
  for(const t of activeTeams(db)){aiReviewDepthChart(db,t);rebalanceAiRosterRoles(db,t)}
  for(const t of activeTeams(db)){const pre=t._pre||[];const now=ROLES.map(r=>starterFor(db,t,r)).filter(Boolean).map(p=>p.id);const changed=now.filter(id=>!pre.includes(id)).length;
    t.synergy=clamp(teamSynergy(t)-changed*5,15,85);recoverTeamCohesion(db,t,now,.08);delete t._pre;
    if(t.id!==managedTeamId(db)&&!t.parent&&(!t.sponsor||t.sponsor.until<db.year)){const chosen=aiSelectSponsor(db,t);if(chosen)ev(`${t.name} ${chosen.type} 스폰서 계약 · ${chosen.years}년`)}}
  for(const R of Object.values(db.regions)){const ts=activeTeams(db,R.id,1);R.teams=ts.length;if(ts.length)R.strength=Math.round(avg(ts.map(t=>teamStrength(db,t.id))))}
  rep.retired.slice(0,3).forEach(r=>news(db,`${db.players[r.pid].name} 은퇴 (${r.age}세)`));
  expireCurrentAIMarketOffers(db);
  w.preseasonStartedOn=db.worldDate;
  w.phase='preseason';
  }catch(error){undo();throw error}
}
// 승강: 승강제는 1부 하위 ↔ 2부 상위 교체, 혼합은 프랜차이즈 보호 구단 제외
function promotionRelegation(db,w,rng,ev){
  for(const R of Object.values(db.regions)){
    if(R.system!=='relegation'&&R.system!=='mixed')continue;
    const s=finalSeason(w,R); if(!s||!s.done)continue;
    const k=Math.max(1,R.relegate||1);
    const down=(R.standingsMode==='points'?regionPlacements(db,R):
      standings(db,s,'regular').map(x=>x.tid))
      .filter(t=>!(R.system==='mixed'&&db.teams[t].franchised)).slice(-k);
    const s2=finalSeason(w,R,2);
    const up=R.div2&&s2&&s2.done?
      (R.standingsMode==='points'?regionPlacements(db,R,2):placements(db,s2))
        .filter(t=>promotionEligible(db,t)).slice(0,k):[];
    down.forEach((tid,i)=>{
      const t=db.teams[tid];
      if(up[i]){const u=db.teams[up[i]];ensureClubLicense(db,t);ensureClubLicense(db,u);t.division=2;u.division=1;u.franchised=false;u.license='open';syncClubLicense(db,t,'relegation');syncClubLicense(db,u,'promotion');t.fans=Math.round((t.fans||20)*0.8);u.fans=Math.round((u.fans||10)+8);ev(`${R.leagueName} 승강: ${u.name} 승격 ↔ ${t.name} 강등`)}
      else{foldTeam(db,t);const nt=genTeam(db,rng,R.id,R.strength-3);if(R.system==='mixed'){nt.franchised=false;nt.license='open'}ev(`${R.leagueName} 강등: ${t.name} → 신생팀 ${nt.name} 합류`)}
    });
    reconcileTier2Structure(db,rng,R,ev);
    inferRegionPolicy(db,R);
  }
}
