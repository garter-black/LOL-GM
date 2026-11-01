function v2DisplaySalaryBudget(db,t){return db.world?.phase==='initial_roster'?initialSalaryBudget(db,t):salaryBudget(db,t)}
function v2Target(){if(!V2.db||V2.db.world?.fired)return null;if(V2.db.world.phase!=='initial_roster')return v2Team();const teams=setupTeamsForManager(V2.db);return teams.find(t=>t.id===V2.target)||teams[0]||null;}
function v2OrganizationContext(){
 const db=V2.db;if(db.world.fired||db.world.phase!=='initial_roster')return '';const teams=setupTeamsForManager(db),current=v2Target();if(teams.length<2)return '';
 return `<section class="panel"><div class="panel-heading"><strong>구성할 선수단</strong></div><p class="hint">구성할 선수단을 선택하고 선수를 검토하세요. 계약은 조건 합의 후 직접 확정합니다.</p><div class="stack">${teams.map(t=>{const lim=initialSquadLimits(db,t);return `<button class="btn ${current?.id===t.id?'btn-primary':'btn-outline'}" data-squad-context="${v2Esc(t.id)}" aria-pressed="${current?.id===t.id}">${v2Esc(t.name)} · ${t.roster.length}명 / 최소 ${lim.min}명</button>`}).join('')}</div></section>`;
}
function v2ChooseSquad(id){
 const error=v2ManualError();if(error)return v2Tell(error);if(V2.db.world.phase!=='initial_roster'||!setupTeamsForManager(V2.db).some(t=>t.id===id))return v2Tell('현재 구성할 수 있는 선수단이 아닙니다');
 v2CaptureDrafts();if(v2Target()?.id!==id)V2.initialQuery=null;V2.target=id;V2.review=null;V2.managementReview=null;V2.pid=null;V2.page=0;V2.returnScroll=0;v2Save();v2Tell('구성할 선수단 · '+v2Target().name);v2Render();
}
function v2Candidates(){
 const db=V2.db,t=v2Target(),view=v2ReadView(),query=V2.q.trim().toLocaleLowerCase('ko'),targets=db.world?.recruitment?.targets||{};
 if(db.world.phase==='initial_roster'&&V2.section==='market'){
  const filters=v2InitialQueryState(),model=initialCandidatePage(db,{...filters,q:V2.q,role:V2.role,page:V2.page},t,{pageSize:V2_LIST_PAGE_SIZE,interestsOnly:V2.tab==='관심 선수'});V2.page=model.page;
  return {view:model.view,rows:model.rows.map(r=>r.p),total:model.total,pages:Math.max(1,model.pages),sortValues:new Map(model.rows.map(r=>[r.p.id,{key:filters.sort,value:r.value}]))};
 }
 const scoutQuery=v2ScoutQueryAllowed()?v2ScoutQueryState():null,marketQuery=v2MarketQueryAllowed()?v2MarketQueryState():null,rows=Object.values(db.players).filter(p=>!p.retired&&(db.world.phase!=='initial_roster'||!p.team)&&(V2.role==='ALL'||p.role===V2.role)&&(!query||p.name.toLocaleLowerCase('ko').includes(query))&&(V2.tab!=='관심 선수'||targets[p.id])&&v2ScoutCandidateMatches(p,scoutQuery)&&v2MarketCandidateMatches(db,p,marketQuery,t));
 if(V2.section==='market'&&V2.tab==='관심 선수'){const order=new Map(recruitmentBoard(view).map((e,i)=>[e.pid,i]));rows.sort((a,b)=>(order.get(a.id)??Infinity)-(order.get(b.id)??Infinity));}else rows.sort((a,b)=>a.name.localeCompare(b.name,'ko')||a.id.localeCompare(b.id));
 const pages=Math.max(1,Math.ceil(rows.length/V2_LIST_PAGE_SIZE));V2.page=Math.max(0,Math.min(V2.page,pages-1));return {view,rows:rows.slice(V2.page*V2_LIST_PAGE_SIZE,(V2.page+1)*V2_LIST_PAGE_SIZE),total:rows.length,pages};
}
function v2PlayerCard(p,view,sortValue=null){
 const entry=view.world.recruitment?.targets?.[p.id],watched=!!entry,range=scoutAbilityRange(view,p);
 return `<article class="player-list-row">${v2InitialSelectionCheckbox(p)}<button class="player-list-open" data-player="${v2Esc(p.id)}"><span class="player-avatar">${v2Esc(ROLE_KO[p.role])}</span><span class="grow"><strong>${v2Esc(p.name)}</strong><span class="player-meta">${p.age}세 · ${v2Esc(view.teams[p.team]?.name||'무소속')} · 기량 ${range.every(Number.isFinite)?range.join('–'):'정보 부족'}</span>${watched?`<span class="player-meta">관심 ${v2Esc(entry.priority)}순위</span>`:''}${v2InitialSortSummary(p,view,sortValue)}${v2MarketValueSummary(view,p)}${v2CandidateNegotiationSummary(p)}</span><span aria-hidden="true">›</span></button><button class="icon-button favorite ${watched?'on':''}" data-watch="${v2Esc(p.id)}" aria-pressed="${watched}" aria-label="${v2Esc(p.name)} 관심 ${watched?'해제':'등록'}">${v2Icon('star')}</button></article>`;
}
function v2Market(){
 const db=V2.db,t=v2Target();if(!t)return '<section class="panel empty">관리 구단이 없습니다.</section>';
 const comparison=v2CandidateComparisonContext(),candidateTab=['선수 검색','관심 선수'].includes(V2.tab);
 if(candidateTab&&comparison?.comparison.open)return v2InitialComparisonPanel(comparison);
 const comparisonBar=candidateTab?v2InitialComparisonBar(comparison):'';
 if(V2.pid)return comparisonBar+v2PlayerDetail();
 if(V2.tab==='진행 중인 협상')return v2NegotiationList();
 if(V2.tab==='시장 현황')return `<section class="panel"><div class="panel-heading"><strong>${db.world.phase==='initial_roster'?'첫 시즌 선수단 구성':'선수 영입·계약'}</strong></div><p class="section-lead">선수를 직접 검토하고 조건을 제안하세요. 조건 합의 뒤에도 최종 계약은 감독이 직접 확정합니다.</p><div class="statline"><span>현재 선수단</span><strong>${t.roster.length}명</strong></div><div class="statline"><span>연간 연봉 예산</span><strong>${v2Money(v2DisplaySalaryBudget(db,t))}</strong></div><div class="statline"><span>현재 연봉 합계 · 연간</span><strong>${v2Money(payroll(db,t))}</strong></div><div class="tag-flex"><button class="btn btn-primary" data-tab="선수 검색">선수 찾아보기</button><button class="btn btn-outline" data-tab="진행 중인 협상">협상 확인</button></div></section>`+v2MarketNegotiations();
 const m=v2Candidates();
 return comparisonBar+`<section class="stack" data-candidate-list><div class="search-wrap"><span class="search-icon">${v2Icon('search')}</span><input class="input" id="player-search" type="search" autocomplete="off" placeholder="선수 이름·닉네임 검색" aria-label="선수 검색" value="${v2Esc(V2.q)}"></div>${v2CandidateRoleControls()}${v2ScoutQueryControls()}${v2MarketQueryControls()}${v2InitialListControls()}${v2InitialSelectionControls(m)}${v2InitialQueryControls()}<div class="between small subtle"><span role="status">${m.total}명 · ${V2.page+1}/${m.pages}페이지</span></div>${v2InitialQueryAllowed()&&v2InitialQueryState().table?v2InitialCandidateTable(m):m.rows.map(p=>v2PlayerCard(p,m.view,m.sortValues?.get(p.id))).join('')||'<div class="panel empty">조건에 맞는 선수가 없습니다.</div>'}<div class="between"><button class="btn btn-outline" data-page="-1"${!V2.page?' disabled':''}>이전</button><button class="btn btn-outline" data-page="1"${V2.page+1>=m.pages?' disabled':''}>다음</button></div></section>`;
}
function v2PlayerDetail(){
 const db=V2.db,p=db.players[V2.pid],t=v2Target();if(!p||p.retired)return '<section class="panel empty">현재 선수 정보를 확인할 수 없습니다.</section>';
 const view=v2ReadView(),range=scoutAbilityRange(view,p),potential=scoutPotentialRange(view,p),entry=view.world?.recruitment?.targets?.[p.id],checked=entry?.evaluation?.teamId===t?.id,eligible=t?v2PlayerEntryCheck(p,t):{ok:false,reason:'관리 선수단을 확인하세요'},n=v2CurrentPlayerNegotiation(p);
 return `<section class="panel" data-player-detail><button class="btn btn-outline btn-small" id="player-back">${V2.initialComparison?.detailReturn?'← 비교로 돌아가기':'← 목록으로'}</button><div class="content-head"><div><div class="eyebrow">선수 상세</div><h2>${v2Esc(p.name)}</h2><p class="small subtle">${v2Esc(ROLE_KO[p.role])} · ${p.age}세 · ${v2Esc(db.teams[p.team]?.name||'무소속')}</p></div><button class="icon-button favorite ${entry?'on':''}" data-watch="${p.id}" aria-pressed="${!!entry}" aria-label="관심 ${entry?'해제':'등록'}">${v2Icon('star')}</button></div><div class="detail-grid"><div class="stat"><span class="label">기량 추정</span><strong>${range.every(Number.isFinite)?range.join('–'):'정보 부족'}</strong></div><div class="stat"><span class="label">잠재력 추정</span><strong>${potential.every(Number.isFinite)?potential.join('–'):'정보 부족'}</strong></div></div><hr class="divider">${checked&&Number.isFinite(entry?.evaluation?.medicalRiskPct)?`<p class="hint">내부 평가 당시 계약 가용성 위험 ${entry.evaluation.medicalRiskPct}% · 부상 발생 확률이 아닙니다.</p>`:''}<p class="hint">관측한 정보로 표시합니다. 추정 범위는 실제 능력 확정값이 아닙니다. 현재 정보량 ${knowledge(view,p)}%.</p><div class="stack">${v2InitialComparisonButton(p)}${v2RecruitmentPriorityControls(p,entry)}<button class="btn btn-outline" id="scout-player">관찰 보고서 요청 · ${v2Money(.1*psOf(db,v2Team().region))}</button><button class="btn btn-outline" id="evaluate-player"${!entry||knowledge(view,p)<35?' disabled':''}>대상 선수단 내부 평가${checked?' · 완료':''}</button><button class="btn btn-primary" id="negotiate-player"${!n&&(!checked||!eligible.ok)?' disabled':''}>${n?'진행 중인 협상 확인':'계약 조건 제안'}</button></div>${!eligible.ok?`<p class="hint">${v2Esc(eligible.reason)}</p>`:''}<p class="hint">관심 등록 → 관찰 정보 확인 → 내부 평가 → 조건 제안 순서로 진행합니다.</p>${v2InitialCandidateImpact(p,t)}${v2PlayerObservationReport(view,p,t)}</section>`+v2PlayerTransactions(p);
}
function v2RecruitAction(action){if(v2Team()?.parent)return v2Tell('산하 선수단의 영입 계약은 모구단이 담당합니다');return v2Mutate(action);}
function v2BindMarket(){
 v2BindInitialComparison();v2BindInitialQuery();v2BindInitialSelection();v2BindRecruitmentPriority();v2BindInitialCandidateImpact();v2BindScoutQuery();v2BindMarketQuery();
 const current=v2Guard(),search=document.getElementById('player-search');
 document.querySelectorAll('[data-player-observation]').forEach(el=>el.ontoggle=()=>{if(!current()||!el.isConnected)return;V2.playerReport={db:V2.db,manager:V2.db.manager,owner:managedTeamId(V2.db),target:v2Target()?.id,pid:V2.pid,open:el.open};});
 if(search)search.oninput=()=>{if(!current())return;V2.q=search.value;V2.page=0;const start=search.selectionStart;v2Render();const next=document.getElementById('player-search');next?.focus({preventScroll:true});if(start!==null)next?.setSelectionRange(start,start)};
 v2Bind('[data-role]',el=>{if(v2InitialQueryAllowed())return v2ToggleInitialRole(el.dataset.role);V2.role=el.dataset.role;V2.page=0;v2Render()});
 v2Bind('[data-page]',el=>{V2.page+=Number(el.dataset.page);v2Render();window.scrollTo(0,0)});
 v2Bind('[data-player]',el=>v2Navigate(V2.section,V2.tab,el.dataset.player));
 v2Bind('#player-back',()=>{const c=v2CandidateComparisonContext();v2Navigate(V2.section,V2.tab,null,null,c?.detailReturn?'panel':null);});
 v2Bind('[data-squad-context]',el=>v2ChooseSquad(el.dataset.squadContext));
 v2Bind('[data-watch]',el=>v2RecruitAction(()=>{const id=el.dataset.watch;return V2.db.world?.recruitment?.targets?.[id]?mDropInterest(V2.db,id):mInterest(V2.db,id,'B')}));
 v2Bind('#scout-player',()=>v2RecruitAction(()=>scoutPlayers(V2.db,[V2.pid],40,.1*psOf(V2.db,v2Team().region))));
 v2Bind('#evaluate-player',()=>v2RecruitAction(()=>mEvaluateTarget(V2.db,V2.pid,v2Target().id)));
 v2Bind('#negotiate-player',()=>v2StartPlayerNegotiation());
}

function v2PlayerEntryCheck(p,t=v2Target()){
 if(V2.db.world.phase==='initial_roster')return initialSignCheck(V2.db,p,t);
 const error=v2ManualError()||(!t||t.active===false||t.parent?'현재 선수 계약은 활성 모구단에서 직접 검토하세요':!p||p.retired?'현재 협상 대상이 아닙니다':null);
 const reason=error||(p.team&&p.team!==t.id?permanentTransferWindowError(V2.db,p,t)||contractedMoveError(V2.db,p):null);return {ok:!reason,reason};
}
function v2StartPlayerNegotiation(){
 const db=V2.db,p=db.players[V2.pid],t=v2Target(),current=v2CurrentPlayerNegotiation(p);if(current)return v2OpenNegotiation(current.id);const allowed=v2PlayerEntryCheck(p,t);if(!allowed.ok)return v2Tell(allowed.reason);
 if(v2Team()?.parent)return v2Tell('산하 선수단의 영입 계약은 모구단이 담당합니다');
 if(p.team===t.id)return v2StartRenewal(p.id);
 const kind=db.world.phase==='initial_roster'?'initial':p.team?'transfer':'fa',id=negotiationId(db,p.id,kind,kind==='initial'?t.id:null),undo=pendingOfficialUndo(db);
 try{const out=kind==='initial'?initialStartNegotiation(db,p.id,t.id):startNegotiation(db,p.id,kind),created=db.world?.negotiations?.[id],ok=kind==='initial'?created?.kind==='initial'&&created.pid===p.id&&created.teamId===t.id&&created.status==='open':out.ok;if(!ok){undo();return v2Tell(typeof out==='string'?out:out.msg);}v2Save();v2OpenNegotiation(created?.id||out.neg?.id||id);}catch(error){undo();v2Tell(error.message);}
}

// Comparison selection is transient UI state, scoped to the current owner and squad.
function v2CandidateComparisonContext(){
 const db=V2.db,t=v2Target(),initial=db?.world?.phase==='initial_roster';
 const allowed=initial?initialCandidateAllowed(db,t):!!t&&!db.world.fired&&!['pick','initial_roster'].includes(db.world.phase);
 if(!db||!allowed){V2.initialComparison=null;return null;}
 if(V2.section!=='market')return null;
 const kind=initial?'initial':'shortlist',c=V2.initialComparison;
 if(!c||c.db!==db||c.world!==db.world||c.manager!==db.manager||c.owner!==managedTeamId(db)||c.target!==t.id||c.kind!==kind)
  V2.initialComparison={db,world:db.world,manager:db.manager,owner:managedTeamId(db),target:t.id,kind,detailReturn:false,comparison:initialComparisonState()};
 return V2.initialComparison;
}
function v2ComparisonCandidate(c,p){return c.kind==='initial'?initialCandidateAllowed(V2.db,V2.db.teams[c.target],p):!!p&&!p.retired&&!!recruitmentTarget(V2.db,p.id);}
function v2ToggleInitialComparison(pid){
 const c=v2CandidateComparisonContext();if(!c)return v2Tell('현재 후보를 다시 확인하세요.');
 if(c.comparison.ids.includes(pid)){c.comparison.ids=c.comparison.ids.filter(id=>id!==pid);v2Tell('비교 제외');}
 else if(c.kind==='initial')v2Tell(initialComparisonToggle(V2.db,c,pid));
 else if(!v2ComparisonCandidate(c,V2.db.players[pid]))v2Tell('현재 관심 후보가 아닙니다');
 else if(c.comparison.ids.length>=3)v2Tell('비교는 최대 3명입니다');
 else {c.comparison.ids.push(pid);v2Tell('비교 추가');}
 v2Render();
}
function v2InitialComparisonButton(p){
 const c=v2CandidateComparisonContext();if(!c)return '';
 const selected=c.comparison.ids.includes(p.id);if(!selected&&!v2ComparisonCandidate(c,p))return '';
 return `<button class="btn btn-outline" data-initial-compare-toggle="${v2Esc(p.id)}" aria-pressed="${selected}">${selected?'후보 비교에서 제외':'후보 비교에 추가'}</button>`;
}
function v2InitialComparisonBar(c){
 if(!c)return '';const ids=c.comparison.ids;
 return `<section class="panel"><h2>${c.kind==='initial'?'창단':'관심'} 후보 비교 · ${ids.length}/3명</h2><p class="hint">선수 상세에서 최대 3명을 골라 관측한 정보와 같은 조건의 공개 자료를 비교하세요.</p><div class="tag-flex">${ids.map(id=>`<button class="btn btn-outline btn-small" data-initial-compare-toggle="${v2Esc(id)}" aria-label="${v2Esc(V2.db.players[id]?.name||id)} 비교 제외">${v2Esc(V2.db.players[id]?.name||id)} · 제외</button>`).join('')}<button class="btn btn-primary" id="initial-compare-open"${ids.length<2?' disabled':''}>선택한 후보 비교</button></div></section>`;
}
function v2InitialComparisonPanel(c){
 const db=V2.db,read=c.kind==='shortlist'?scoutingReadView(db):null,m=read?{...shortlistComparisonModel({read},c.comparison),allowed:true,view:read,context:c.comparison}:initialComparisonModel(db,c);if(!m.allowed)return '<section class="panel">현재 후보 비교를 다시 확인하세요.</section>';
 const rows=m.rows,context=m.context,visible=c.kind==='initial'?metaRowsFiltered(db).filter(r=>observedMetaDate(db,r)):[],patches=m.patches||[...new Set(visible.map(r=>r.patch).filter(Boolean))].sort(),comps=m.comps||[...new Set(visible.map(r=>r.comp).filter(Boolean))].sort(),title=c.kind==='initial'?'창단':'관심';
 const num=v=>Number.isFinite(v)?v:'정보 부족',range=v=>Array.isArray(v)&&v.every(Number.isFinite)?v.join('–'):'정보 부족';
 const cell=fn=>rows.map(r=>`<td>${r.p?fn(r):v2Esc(r.status)}</td>`).join('');
 return `<section class="panel" data-initial-comparison><button class="btn btn-outline" id="initial-compare-close">← 후보 검토로 돌아가기</button><h2 tabindex="-1" id="initial-comparison-title">${title} 후보 비교 · ${rows.length}/3명</h2><p>${v2Esc(db.teams[c.target].name)} · 조회 ${v2Esc(m.date)}</p><p class="hint">서로 다른 역할·겹친 추정 범위로 우열을 단정하지 않습니다. 표본 없음은 낮은 실력이 아닙니다. 현재 관측 능력은 과거 경기 당시 능력이 아닙니다.</p><div class="search-controls"><label class="field">공개 표본 패치<select class="input" data-initial-compare-filter="patch"><option value="ALL">전체 패치</option>${context.patch!=='ALL'&&!patches.includes(context.patch)?`<option value="${v2Esc(context.patch)}" selected>${v2Esc(context.patch)} · 현재 표본 없음</option>`:''}${patches.map(x=>`<option value="${v2Esc(x)}"${context.patch===x?' selected':''}>${v2Esc(x)}</option>`).join('')}</select></label><label class="field">대회<select class="input" data-initial-compare-filter="comp"><option value="ALL">전체 대회</option>${context.comp!=='ALL'&&!comps.includes(context.comp)?`<option value="${v2Esc(context.comp)}" selected>${v2Esc(db.competitions[context.comp]?.name||context.comp)} · 현재 표본 없음</option>`:''}${comps.map(x=>`<option value="${v2Esc(x)}"${context.comp===x?' selected':''}>${v2Esc(db.competitions[x]?.name||x)}</option>`).join('')}</select></label><label class="field">시작일<input class="input" type="date" data-initial-compare-filter="from" max="${v2Esc(m.date)}" value="${v2Esc(context.from)}"></label></div>${rows.length<2?'<p role="status">두 명 이상을 골라 비교하세요.</p>':''}<div class="table-scroll" tabindex="0" role="region" aria-label="선택한 후보 관측 정보 비교"><table><thead><tr><th scope="col">항목</th>${rows.map(r=>`<th scope="col">${v2Esc(r.name)}<br><button class="btn btn-outline btn-small" data-initial-compare-toggle="${v2Esc(r.id)}">비교 제외</button>${r.p?`<button class="btn btn-outline btn-small" data-initial-compare-player="${v2Esc(r.id)}">선수 상세</button>`:''}</th>`).join('')}</tr></thead><tbody><tr><th scope="row">역할·나이·출신·현재 소속</th>${cell(r=>`${v2Esc(ROLE_KO[r.p.role])} · ${v2Esc(r.p.age)}세 · ${v2Esc(db.regions[r.p.region]?.name||r.p.region)} · ${v2Esc(m.view.teams[r.p.team]?.name||'무소속')}`)}</tr>${c.kind==='initial'?`<tr><th scope="row">요구 연봉 추정</th>${cell(r=>v2Money(asking(m.view,r.p,db.teams[c.target].region)))}</tr>`:''}<tr><th scope="row">기량·잠재 추정 범위</th>${cell(r=>range(r.report.ability)+' · '+range(r.report.potential))}</tr><tr><th scope="row">정보·관찰 날짜</th>${cell(r=>`${v2Esc(r.report.knowledge)}% · ${v2Esc(r.report.observations)}회 · ${v2Esc(r.report.lastSeenDate||'관찰 날짜 없음')} · ${v2Esc(r.report.staleYears)}시즌 전`)}</tr>${c.kind==='shortlist'?`<tr><th scope="row">공식 집계 (표본 필터와 별개)</th>${cell(r=>`${v2Esc(r.report.sample.g)}경기 · ${Number.isFinite(r.report.sample.rating)?'평점 '+r.report.sample.rating.toFixed(2):'평점 없음'} · ${r.report.sample.min>0?'분당 피해 '+Math.round(r.report.sample.dpm):'출전 시간 없음'}`)}</tr>`:''}<tr><th scope="row">역할 핵심 관측값</th>${cell(r=>(ROLE_KEY_ATTRS[r.p.role]||[]).map(k=>v2Esc(ATTR_KO[k]||TEND_KO[k]||k)+' '+(Object.hasOwn(r.attrs,k)?num(r.attrs[k]):'능력 축 없음')).join(' · '))}</tr>${Object.entries(INITIAL_COMPARE_METRICS).map(([key,label])=>`<tr><th scope="row">${v2Esc(label)} 추정</th>${cell(r=>num(r.metrics[key]))}</tr>`).join('')}<tr><th scope="row">같은 조건의 공개 표본</th>${cell(r=>r.sources.rows.length+'건 · 제외 '+r.sources.excluded+'건')}</tr></tbody></table></div>${v2ObservedComparisonRadar(rows)}<p class="hint">${c.kind==='initial'?'요구 연봉 추정은 확정된 협상 조건이 아닙니다.':'공식 집계는 표본 필터와 별개이며 과거 기록·현재 관측 능력을 다시 계산하지 않습니다. 영입 가격·수락·등록을 보장하지 않습니다.'} 공개 표본은 출전 행 수이며 독립 경기 수로 중복 제거한 값은 아닙니다.</p>${rows.filter(r=>r.sources).map(r=>`<details><summary>${v2Esc(r.name)} 공개 출전 자료 ${r.sources.rows.length}건</summary>${r.sources.rows.length?`<div class="table-scroll" tabindex="0" role="region" aria-label="${v2Esc(r.name)} 공개 출전 자료"><table><thead><tr><th scope="col">날짜</th><th scope="col">대회·단계</th><th scope="col">패치</th><th scope="col">역할·진영</th><th scope="col">챔피언·결과</th></tr></thead><tbody>${r.sources.rows.map(x=>`<tr><td>${v2Esc(x.date)}</td><td>${v2Esc(db.competitions[x.comp]?.name||x.comp||'대회 미상')} · ${v2Esc(x.stage||'단계 미상')}</td><td>${v2Esc(x.patch||'패치 미상')}</td><td>${v2Esc(ROLE_KO[x.role])} · ${x.color==='BLUE'?'블루':x.color==='RED'?'레드':'진영 미상'}</td><td>${v2Esc(championLabel(db,x.champ))} · ${x.win===null?'결과 미상':x.win?'승':'패'}</td></tr>`).join('')}</tbody></table></div>`:'<p>같은 조건의 공개 출전 기록이 없습니다.</p>'}</details>`).join('')}</section>`;
}
function v2ComparisonGuard(c){
 const db=V2.db,current=v2Guard(),stamp=c&&scoutingReadStamp(db),patch=db?.patch,history=db?.metaHistory,length=history?.length,tail=history?.at(-1);
 return ()=>current()&&!!c&&v2CandidateComparisonContext()===c&&db.patch===patch&&db.metaHistory===history&&history?.length===length&&history?.at(-1)===tail&&scoutingReadStamp(db)===stamp;
}
function v2BindInitialComparison(){
 const c=v2CandidateComparisonContext(),current=v2ComparisonGuard(c),bind=(selector,fn)=>v2Bind(selector,(el,e)=>{if(current())fn(el,e);});
 bind('[data-initial-compare-toggle]',el=>v2ToggleInitialComparison(el.dataset.initialCompareToggle));
 bind('#initial-compare-open',()=>{if(c.comparison.ids.length<2)return;v2RememberSearch();c.comparison.returnY=window.scrollY;c.comparison.open=true;c.detailReturn=false;v2Render();document.getElementById('initial-comparison-title')?.focus();window.scrollTo(0,0);});
 bind('#initial-compare-close',()=>{c.comparison.open=false;c.detailReturn=false;v2Render();const b=document.getElementById('initial-compare-open');(b&&!b.disabled?b:document.getElementById('app-title'))?.focus({preventScroll:true});window.scrollTo(0,c.comparison.returnY||0);});
 bind('[data-initial-compare-player]',el=>v2Navigate('market',V2.tab,el.dataset.initialComparePlayer,null,c.kind==='shortlist'?'detail':null));
 document.querySelectorAll('[data-initial-compare-filter]').forEach(el=>el.onchange=()=>{
  if(!current()||el.reportValidity&&!el.reportValidity())return;const key=el.dataset.initialCompareFilter,value=el.value;
  if(key==='from'&&value&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value>V2.db.worldDate||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value))return v2Tell('유효한 기준일 이전 날짜를 선택하세요');
  if(key!=='from'&&value!=='ALL'){const rows=c.kind==='shortlist'?shortlistComparisonModel({read:scoutingReadView(V2.db)},c.comparison)[key==='patch'?'patches':'comps']:metaRowsFiltered(V2.db).filter(r=>observedMetaDate(V2.db,r)).map(r=>r[key]);if(!rows.includes(value))return v2Tell('현재 공개 표본에 없는 조건입니다');}
  c.comparison[key]=value;v2Render();document.querySelector('[data-initial-compare-filter="'+key+'"]')?.focus({preventScroll:true});
 });
}

// This chart presents the same canonical observed axes as the numeric table.
function v2ObservedComparisonRadar(rows){
 const keys=Object.keys(INITIAL_COMPARE_METRICS),cx=150,cy=125,r=80,point=(i,v)=>{const a=-Math.PI/2+i*Math.PI*2/keys.length;return [cx+Math.cos(a)*r*v/99,cy+Math.sin(a)*r*v/99]},xy=p=>p.map(x=>x.toFixed(2)).join(',');
 const complete=rows.filter(row=>row.metrics&&keys.every(k=>Number.isFinite(row.metrics[k])&&row.metrics[k]>=1&&row.metrics[k]<=99));
 if(!complete.length)return '<p class="empty">완전한 관측 축이 없어 차트를 그리지 않습니다. 누락은 아래 숫자 표에서 확인하세요.</p>';
 return `<svg viewBox="0 0 300 260" width="300" style="display:block;max-width:100%;height:auto" role="img" aria-label="관측 능력 비교 레이더. 아래 숫자 표와 같은 열 가지 추정 지표입니다."><title>관측 능력 추정치 · 축 0–99 · 실제 경기 통계 아님</title><polygon points="${keys.map((_,i)=>xy(point(i,99))).join(' ')}" fill="none" stroke="currentColor" opacity=".35"/>${keys.map((k,i)=>{const p=point(i,99),label=point(i,118);return `<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="currentColor" opacity=".25"/><text x="${label[0]}" y="${label[1]}" fill="currentColor" font-size="9" text-anchor="middle">${INITIAL_COMPARE_METRICS[k]}</text>`}).join('')}${complete.map(row=>{const i=rows.indexOf(row);return `<polygon points="${keys.map((k,n)=>xy(point(n,row.metrics[k]))).join(' ')}" fill="none" stroke="${['#258fd2','#ba7515','#9c62cd'][i]}" stroke-width="2" stroke-dasharray="${['none','6 3','2 3'][i]}"><title>${v2Esc(row.name)}</title></polygon>`}).join('')}</svg><p>${rows.map((row,i)=>`${v2Esc(row.name)} · ${['실선','긴 점선','짧은 점선'][i]}${!complete.includes(row)?' (축 누락으로 차트 제외)':''}`).join(' / ')}</p><p class="hint">숫자 표의 기존 1–99 추정치를 0–99 축에 그대로 표시합니다. 면적은 종합 순위·승률이 아니며 역할마다 지표의 의미가 다릅니다.</p>`;
}

// Preserve the initial-only entry contract while the new internal controller serves both views.
function v2InitialComparisonContext(){const c=v2CandidateComparisonContext();return c?.kind==='initial'?c:null;}

// Existing observation/public-history readers own every displayed value.
function v2PlayerObservationReport(view,p,target){
 if(!view||view.world?.fired||!target||!managerControlsSquad(view,target)||!view.players[p?.id])return '';
 const player=view.players[p.id],r=scoutReport(view,player),metrics=observedPlayerCoreMetrics(view,player),pool=publicPlayerChampions(view,player),sample=r.sample,e=view.world.recruitment?.targets?.[p.id]?.evaluation;
 const remembered=V2.playerReport,opened=remembered?.db===V2.db&&remembered.manager===view.manager&&remembered.owner===managedTeamId(view)&&remembered.target===target.id&&remembered.pid===p.id&&remembered.open;
 const num=x=>Number.isFinite(x)?v2Esc(x):'정보 부족',range=x=>Array.isArray(x)&&x.length===2&&x.every(Number.isFinite)?x.join('–'):'범위 근거 없음',evaluation=e?.teamId===target.id?e:null;
 return `<details class="player-observation-report" data-player-observation${opened?' open':''}><summary>관측 보고서 · 공식 출전 근거</summary><div class="detail-grid"><div class="stat"><span class="label">관찰 횟수</span><strong data-observation-field="observations">${num(r.observations)}회</strong></div><div class="stat"><span class="label">최근 관찰 날짜</span><strong data-observation-field="last-date">${v2Esc(r.lastSeenDate||'관찰 날짜 없음')}</strong></div><div class="stat"><span class="label">관찰한 경기</span><strong data-observation-field="games-seen">${num(r.gamesSeen)}경기</strong></div><div class="stat"><span class="label">공식 집계 표본</span><strong data-observation-field="official-games">${num(sample.g)}경기</strong></div></div><p class="hint">${r.lastSeenDate?num(r.staleYears)+'시즌 경과한 관측입니다.':'관찰 날짜가 없어 최신성을 판단할 수 없습니다.'} 정보량은 정확도 보장이 아닙니다. 수동 관찰 횟수와 공식 경기 수는 별개이며, 관찰 요청으로 공식 경기 수를 추가하지 않습니다.</p><h3>현재 관측 지표</h3><div class="table-scroll" tabindex="0" role="region" aria-label="현재 관측 능력 추정치"><table><thead><tr><th scope="col">지표</th><th scope="col">추정값 (1–99)</th></tr></thead><tbody>${Object.entries(INITIAL_COMPARE_METRICS).map(([key,label])=>`<tr><th scope="row">${v2Esc(label)}</th><td data-observation-metric="${key}">${num(metrics[key])}</td></tr>`).join('')}</tbody></table></div><p class="hint">현재 관측 추정은 과거 경기 당시 능력이 아닙니다. 누락된 정보는 낮은 실력이나 0점으로 해석하지 않습니다.</p><h3>공식 집계</h3>${sample.g>0?`<p>평점 ${Number.isFinite(sample.rating)?sample.rating.toFixed(2):'정보 없음'} · 출전 시간 ${Number.isFinite(sample.min)?sample.min.toFixed(1)+'분':'정보 없음'} · ${sample.min>0&&Number.isFinite(sample.dpm)?'분당 피해 '+Math.round(sample.dpm):'분당 피해 정보 없음'}</p>`:'<p>공식 경기 기록 없음 · 관찰 횟수로 경기 통계를 만들지 않습니다.</p>'}<p class="hint">집계 대회: ${(sample.competitions||[]).map(id=>v2Esc(view.competitions[id]?.name||id)).join(' / ')||'대회 식별 기록 없음'}</p><h3>공개 출전 챔피언</h3><p class="hint">공식 집계와 공개 챔피언 원자료의 표본은 다를 수 있습니다. 비공개 숙련도는 표시하지 않습니다. 공개 근거 미확인 ${num(pool.unknown)}건.</p>${pool.champions.length?`<ul>${pool.champions.slice(0,5).map(c=>`<li data-observed-champion="${v2Esc(c.id)}">${v2Esc(championLabel(view,c.id))} · ${num(c.g)}경기 · ${v2Esc(c.from)}–${v2Esc(c.to)}</li>`).join('')}</ul>`:'<p>공개 출전 근거 없음 · 낮은 숙련도를 뜻하지 않습니다.</p>'}${evaluation?`<section data-observation-evaluation><h3>저장된 내부 평가</h3><p>${v2Esc(evaluation.date||'평가 날짜 미상')} · ${v2Esc(view.teams[target.id]?.name||target.id)} · 당시 정보 ${num(evaluation.knowledge)}% · 당시 기량 ${range(evaluation.ability)} · 잠재 ${range(evaluation.potential)} · 적합도 ${num(evaluation.fit)}/100</p><p class="hint">평가 당시 기록입니다. 현재 보고서·예산·등록 가능성이나 영입 성공을 보장하지 않습니다.</p></section>`:'<p class="hint">현재 선수단의 저장된 내부 평가가 없습니다.</p>'}</details>`;
}

function v2InitialQueryDefaults(){return {scope:'all',minimum:0,sort:'name',direction:'asc',open:false,metricFilters:{},metricDraft:null,metricOpen:false,roles:[],table:false,multiSort:false,secondary:[],columns:['age','ability','potential','salary'],columnOpen:false,tableScroll:0};}
function v2InitialQueryState(){return V2.initialQuery||(V2.initialQuery=v2InitialQueryDefaults());}
function v2InitialQueryAllowed(){return V2.section==='market'&&V2.db?.world?.phase==='initial_roster'&&initialCandidateAllowed(V2.db,v2Target());}
function v2SetInitialQuery(key,value){
 if(!v2InitialQueryAllowed())return false;
 if(key==='minimum'){value=Number(value);if(!Number.isInteger(value)||value<0||value>99)return false;}
 else if(key==='scope'){if(!['all','region','overseas'].includes(value))return false;}
 else if(key==='sort'){if(value==='role'||!Object.hasOwn(INITIAL_CANDIDATE_SORTS,value))return false;}
 else if(key==='direction'){if(!['asc','desc'].includes(value))return false;}else return false;
 V2.initialQuery={...v2InitialQueryState(),[key]:value,open:true};V2.page=0;v2Render();document.getElementById('initial-query-'+key)?.focus({preventScroll:true});return true;
}
function v2InitialSortSummary(p,view,entry){
 if(!entry||['name','role','age','ability'].includes(entry.key))return '';
 let value=Number.isFinite(entry.value)||typeof entry.value==='string'?v2Esc(entry.value):'정보 부족',label=INITIAL_CANDIDATE_SORTS[entry.key];
 if(entry.key==='salary'){label='요구 연봉 추정';value=v2Money(entry.value);}
 if(entry.key==='potential'){const range=scoutPotentialRange(view,p);value=range.length===2&&range.every(Number.isFinite)?range.join('–'):'정보 부족';}
 return `<span class="player-meta">${v2Esc(label)} · ${value}</span>`;
}
function v2InitialQueryControls(){
 if(!v2InitialQueryAllowed())return '';const s=v2InitialQueryState(),count=Number(s.scope!=='all')+Number(s.minimum>0)+Number(s.sort!=='name'||s.direction!=='asc')+initialMetricConditions(s).rows.length;
 return `<details class="panel" id="initial-query-options" data-initial-query${s.open?' open':''}><summary>창단 후보 조회 조건${count?' · '+count+'개 적용':''}</summary><p class="hint">출신 지역은 국적·로컬 자격·언어 숙련과 별개입니다. 기량·잠재력·능력 지표는 기존 관측 추정치이며 확정 실력이 아닙니다. 정보가 없는 값은 정렬의 마지막에 표시합니다.</p><div class="stack"><label class="field">출신 지역 범위<select class="input" id="initial-query-scope" data-initial-query-field="scope">${[['all','전체 출신 지역'],['region','대상 구단과 같은 출신 지역'],['overseas','다른 출신 지역']].map(([key,label])=>`<option value="${key}"${s.scope===key?' selected':''}>${label}</option>`).join('')}</select></label><label class="field">관측 종합 기량 추정 최소값<input class="input" type="number" inputmode="numeric" min="0" max="99" step="1" id="initial-query-minimum" data-initial-query-field="minimum" value="${v2Esc(s.minimum)}"><span class="hint">0–99 정수만 적용합니다. 범위를 벗어난 값은 적용되지 않습니다. 0 또는 빈칸은 제한 없음이며, 최소값이 있으면 해당 관측 정보가 없는 후보는 제외합니다.</span></label></div>${v2InitialMetricControls(s)}${v2InitialTableOptions(s)}<p class="hint">${initialCandidateOrders(s).map(r=>v2Esc(INITIAL_CANDIDATE_SORTS[r.key]+' · '+initialCandidateDirection(r.key,r.direction))).join(' / ')}. 요구 연봉 추정은 협상 조건·예산·등록 가능성이나 영입 성공을 보장하지 않습니다.</p><button class="btn btn-outline" id="initial-query-reset">지역·기량 조건·정렬 초기화</button></details>`;
}
function v2BindInitialQuery(){
 if(!v2InitialQueryAllowed())return;const current=v2Guard(),panel=document.getElementById('initial-query-options');if(!panel)return;
 panel.ontoggle=()=>{if(current()&&panel.isConnected)v2InitialQueryState().open=panel.open;};
 v2BindInitialMetrics(current);v2BindInitialTable(current);
 document.querySelectorAll('[data-initial-query-field]').forEach(el=>el.onchange=()=>{if(!current()||!el.isConnected||el.checkValidity&&!el.checkValidity())return;v2SetInitialQuery(el.dataset.initialQueryField,el.value);});
 v2Bind('#initial-query-reset',()=>{const s=v2InitialQueryState(),roles=initialCandidateRoles({...s,role:V2.role});V2.initialQuery={...v2InitialQueryDefaults(),roles,table:s.table,columns:s.columns,columnOpen:s.columnOpen,open:true};V2.page=0;v2Render();document.getElementById('initial-query-scope')?.focus({preventScroll:true});});
}

// Draft bounds never enter the shared candidate query until explicitly applied.
function v2InitialMetricControls(s){
 const draft=s.metricDraft||s.metricFilters||{},count=initialMetricConditions(s).rows.length;
 return `<details data-initial-metrics${s.metricOpen?' open':''}><summary>관측 지표별 조건${count?' · '+count+'개 적용':''}</summary><p class="hint">입력 중인 조건은 적용 전까지 목록을 바꾸지 않습니다. 1–99 정수, 빈칸은 제한 없음입니다. 여러 조건을 모두 충족하는 후보만 표시하며, 해당 관측 정보가 없으면 제외합니다.</p><div class="stack">${Object.entries(INITIAL_COMPARE_METRICS).map(([key,label])=>`<fieldset class="initial-metric-row"><legend>${v2Esc(label)} 추정</legend><div class="detail-grid">${['min','max'].map(bound=>`<label class="field">${bound==='min'?'최소':'최대'}<input class="input" type="number" inputmode="numeric" min="1" max="99" step="1" id="initial-metric-${key}-${bound}" data-initial-metric="${key}" data-bound="${bound}" value="${v2Esc(draft[key]?.[bound]??'')}" aria-label="${v2Esc(label)} ${bound==='min'?'최소':'최대'} 추정치"></label>`).join('')}</div></fieldset>`).join('')}</div><div class="tag-flex"><button class="btn btn-primary" type="button" id="initial-metric-apply">지표 조건 적용</button><button class="btn btn-outline" type="button" id="initial-metric-cancel">입력 취소</button><button class="btn btn-outline" type="button" id="initial-metric-clear">지표 조건 초기화</button></div></details>`;
}
function v2SetInitialMetricDraft(key,bound,value){
 if(!v2InitialQueryAllowed()||!Object.hasOwn(INITIAL_COMPARE_METRICS,key)||!['min','max'].includes(bound))return false;
 const s=v2InitialQueryState();s.metricDraft??=v2CloneInitialQuery(s.metricFilters||{});s.metricDraft[key]??={min:'',max:''};s.metricDraft[key][bound]=String(value);return true;
}
function v2ApplyInitialMetrics(){
 if(!v2InitialQueryAllowed())return false;const s=v2InitialQueryState(),draft=v2CloneInitialQuery(s.metricDraft||s.metricFilters||{});
 if(!initialMetricConditions({metricFilters:draft}).valid)return false;
 V2.initialQuery={...s,metricFilters:draft,metricDraft:v2CloneInitialQuery(draft),open:true,metricOpen:true};V2.page=0;v2Render();document.getElementById('initial-metric-apply')?.focus({preventScroll:true});return true;
}
function v2ResetInitialMetrics(clear=false){
 if(!v2InitialQueryAllowed())return false;const s=v2InitialQueryState();if(clear){s.metricFilters={};V2.page=0;}s.metricDraft=v2CloneInitialQuery(s.metricFilters||{});s.metricOpen=true;s.open=true;v2Render();document.getElementById(clear?'initial-metric-clear':'initial-metric-cancel')?.focus({preventScroll:true});return true;
}
function v2BindInitialMetrics(current){
 const panel=document.querySelector('[data-initial-metrics]');if(!panel)return;
 panel.ontoggle=()=>{if(current()&&panel.isConnected)v2InitialQueryState().metricOpen=panel.open;};
 const inputs=[...panel.querySelectorAll('[data-initial-metric]')];
 inputs.forEach(el=>el.oninput=()=>{if(!current()||!el.isConnected)return;inputs.forEach(input=>input.setCustomValidity(''));v2SetInitialMetricDraft(el.dataset.initialMetric,el.dataset.bound,el.value);});
 v2Bind('#initial-metric-apply',()=>{for(const el of inputs)if(!el.reportValidity())return;const s=v2InitialQueryState(),draft=s.metricDraft||s.metricFilters||{};for(const [key,bounds] of Object.entries(draft)){if(!initialMetricConditions({metricFilters:{[key]:bounds}}).valid){const el=inputs.find(input=>input.dataset.initialMetric===key&&input.dataset.bound==='max');el?.setCustomValidity('최대값은 최소값 이상이어야 합니다');el?.reportValidity();return;}}v2ApplyInitialMetrics();},panel);
 v2Bind('#initial-metric-cancel',()=>v2ResetInitialMetrics(),panel);v2Bind('#initial-metric-clear',()=>v2ResetInitialMetrics(true),panel);
}

function v2CandidateRoleControls(){
 const initial=v2InitialQueryAllowed(),roles=initial?initialCandidateRoles({...v2InitialQueryState(),role:V2.role}):V2.role==='ALL'?[]:[V2.role];
 return `<div class="filter-row" aria-label="포지션 선택${initial?' · 여러 개 선택':''}">${['ALL',...ROLES].map(r=>{const selected=r==='ALL'?!roles.length:roles.includes(r);return `<button class="chip ${selected?'selected':''}" aria-pressed="${selected}" data-role="${r}">${r==='ALL'?'전체':ROLE_KO[r]}</button>`}).join('')}</div>${initial?'<p class="hint">포지션은 여러 개 선택할 수 있습니다. 선택한 포지션 중 하나에 해당하고, 다른 조회 조건도 충족하는 후보를 표시합니다.</p>':''}`;
}
function v2ToggleInitialRole(role){
 if(!v2InitialQueryAllowed()||!['ALL',...ROLES].includes(role))return false;const s=v2InitialQueryState(),roles=initialCandidateRoles({...s,role:V2.role});s.roles=role==='ALL'?[]:ROLES.filter(r=>r===role?!roles.includes(r):roles.includes(r));V2.role=s.roles.length===1?s.roles[0]:'ALL';V2.page=0;v2Render();document.querySelector('[data-role="'+role+'"]')?.focus({preventScroll:true});return true;
}
function v2InitialListControls(){
 if(!v2InitialQueryAllowed())return '';const s=v2InitialQueryState();return `<div class="tag-flex" aria-label="후보 보기"><button class="btn btn-outline" data-initial-list="cards" aria-pressed="${!s.table}">카드 보기</button><button class="btn btn-outline" data-initial-list="table" aria-pressed="${!!s.table}">표 보기 · 열 정렬</button></div>`;
}
function v2InitialColumns(){const s=v2InitialQueryState();return Object.keys(INITIAL_CANDIDATE_COLUMNS).filter(k=>(s.columns||['age','ability','potential','salary']).includes(k));}
function v2InitialTableOptions(s){
 return `<label class="initial-table-toggle"><input type="checkbox" id="initial-multi-sort"${s.multiSort?' checked':''}>여러 열 정렬 · 최대 3개</label><p class="hint">표 보기의 열 제목을 눌러 정렬 방향을 바꿉니다. 여러 열 정렬을 켜면 선택한 순서대로 비교합니다. 포지션은 위 필터로 선택합니다.</p><details data-initial-columns${s.columnOpen?' open':''}><summary>표시 항목</summary><div class="initial-column-options">${Object.entries(INITIAL_CANDIDATE_COLUMNS).map(([key,label])=>`<label><input type="checkbox" id="initial-column-${key}" data-initial-column="${key}"${v2InitialColumns().includes(key)?' checked':''}>${v2Esc(label)}</label>`).join('')}</div><p class="hint">선수 이름과 포지션은 항상 표시합니다. 나머지 열은 여러 개 선택할 수 있습니다.</p></details>`;
}
function v2InitialSortColumn(key){
 if(!v2InitialQueryAllowed()||key==='role'||!Object.hasOwn(INITIAL_CANDIDATE_SORTS,key))return false;const s=v2InitialQueryState();let orders=initialCandidateOrders(s),at=orders.findIndex(r=>r.key===key);
 if(s.multiSort){if(at>=0)orders[at].direction=orders[at].direction==='asc'?'desc':'asc';else orders=[...orders.slice(0,2),{key,direction:'asc'}];}else orders=[{key,direction:s.sort===key&&s.direction==='asc'?'desc':'asc'}];
 s.sort=orders[0].key;s.direction=orders[0].direction;s.secondary=orders.slice(1);V2.page=0;v2Render();document.getElementById('initial-table-sort-'+key)?.focus({preventScroll:true});return true;
}
function v2InitialTableHeader(key){
 const s=v2InitialQueryState(),orders=initialCandidateOrders(s),index=orders.findIndex(r=>r.key===key),row=orders[index],label=INITIAL_CANDIDATE_SORTS[key]||INITIAL_CANDIDATE_COLUMNS[key],sortable=key!=='role'&&Object.hasOwn(INITIAL_CANDIDATE_SORTS,key);
 return `<th scope="col"${key==='name'?' class="initial-candidate-name"':''}${index===0?` aria-sort="${row.direction==='asc'?'ascending':'descending'}"`:''}>${sortable?`<button class="initial-column-sort" id="initial-table-sort-${key}" data-initial-sort-column="${key}" aria-label="${v2Esc(label)} 정렬${index>=0?' · '+(index+1)+'순위 '+v2Esc(initialCandidateDirection(key,row.direction)):''}">${v2Esc(label)}${index>=0?' '+(row.direction==='asc'?'↑':'↓'):''}</button>`:v2Esc(label)}</th>`;
}
function v2InitialTableCell(view,p,key){
 const range=r=>r.length===2&&r.every(Number.isFinite)?r.join('–'):'정보 부족';let value;
 if(key==='ability')value=range(scoutAbilityRange(view,p));else if(key==='potential')value=range(scoutPotentialRange(view,p));else if(key==='salary')value='약 '+v2Money(asking(view,p,v2Target().region));else if(key==='value')value=v2Money(observedPlayerMarketValue(view,p));else if(key==='region')value=view.regions[p.region]?.name||p.region;else if(Object.hasOwn(INITIAL_COMPARE_METRICS,key)){const v=observedPlayerCoreMetrics(view,p)[key];value=Number.isFinite(v)?v:'정보 부족';}else value=p[key];return v2Esc(value);
}
function v2InitialCandidateTable(m){
 const cols=v2InitialColumns();return `<div class="table-scroll v2-initial-table" data-initial-candidate-table tabindex="0" role="region" aria-label="관측 기반 초기 후보 비교표"><table><caption>초기 후보 · 열 제목을 눌러 정렬 · 기량/금액은 기존 관측 추정</caption><thead><tr><th scope="col">선택</th>${v2InitialTableHeader('role')}${v2InitialTableHeader('name')}${cols.map(v2InitialTableHeader).join('')}<th scope="col">관심</th></tr></thead><tbody>${m.rows.map(p=>`<tr data-initial-table-player="${v2Esc(p.id)}"><td>${v2InitialSelectionCheckbox(p)}</td><td>${v2Esc(ROLE_KO[p.role])}</td><td class="initial-candidate-name"><button class="initial-player-name" data-player="${v2Esc(p.id)}">${v2Esc(p.name)}</button></td>${cols.map(k=>`<td data-initial-cell="${k}">${v2InitialTableCell(m.view,p,k)}</td>`).join('')}<td>${v2CandidateNegotiationSummary(p)}<button class="icon-button favorite ${m.view.world.recruitment?.targets?.[p.id]?'on':''}" data-watch="${v2Esc(p.id)}" aria-pressed="${!!m.view.world.recruitment?.targets?.[p.id]}" aria-label="${v2Esc(p.name)} 관심 ${m.view.world.recruitment?.targets?.[p.id]?'해제':'등록'}">${v2Icon('star')}</button></td></tr>`).join('')||`<tr><td colspan="${cols.length+4}">조건에 맞는 선수가 없습니다.</td></tr>`}</tbody></table></div>`;
}
function v2BindInitialTable(current){
 const table=document.querySelector('[data-initial-candidate-table]');if(table){table.scrollLeft=v2InitialQueryState().tableScroll||0;table.onscroll=()=>{if(current()&&table.isConnected)v2InitialQueryState().tableScroll=table.scrollLeft;};}
 v2Bind('[data-initial-list]',el=>{v2InitialQueryState().table=el.dataset.initialList==='table';v2Render();document.querySelector('[data-initial-list="'+el.dataset.initialList+'"]')?.focus({preventScroll:true});});
 v2Bind('[data-initial-sort-column]',el=>v2InitialSortColumn(el.dataset.initialSortColumn));
 const multi=document.getElementById('initial-multi-sort');if(multi)multi.onchange=()=>{if(!current()||!multi.isConnected)return;const s=v2InitialQueryState();s.multiSort=multi.checked;if(!s.multiSort)s.secondary=[];V2.page=0;v2Render();document.getElementById('initial-multi-sort')?.focus({preventScroll:true});};
 const panel=document.querySelector('[data-initial-columns]');if(panel)panel.ontoggle=()=>{if(current()&&panel.isConnected)v2InitialQueryState().columnOpen=panel.open;};
 document.querySelectorAll('[data-initial-column]').forEach(el=>el.onchange=()=>{if(!current()||!el.isConnected||!Object.hasOwn(INITIAL_CANDIDATE_COLUMNS,el.dataset.initialColumn))return;const cols=v2InitialColumns();v2InitialQueryState().columns=Object.keys(INITIAL_CANDIDATE_COLUMNS).filter(k=>k===el.dataset.initialColumn?el.checked:cols.includes(k));v2Render();document.getElementById(el.id)?.focus({preventScroll:true});});
}

// The original initial-roster selection cap; scouting remains an engine operation.
const V2_INITIAL_SELECTION_LIMIT=10;
function v2InitialSelectionContext(){
 const db=V2.db,t=v2Target();if(!db||db.world?.phase!=='initial_roster'){V2.initialSelection=null;return null;}if(V2.section!=='market')return null;if(!initialCandidateAllowed(db,t)){V2.initialSelection=null;return null;}
 let c=V2.initialSelection;if(!c||c.db!==db||c.world!==db.world||c.manager!==db.manager||c.owner!==managedTeamId(db)||c.target!==t.id)c=V2.initialSelection={db,world:db.world,manager:db.manager,owner:managedTeamId(db),target:t.id,ids:[],open:false};return c;
}
function v2InitialSelectedEligible(c){return c?c.ids.filter(id=>{const p=V2.db.players[id];return !!p&&initialCandidateAllowed(V2.db,V2.db.teams[c.target],p);}):[];}
function v2InitialBatchScoutCost(ids){const me=v2Team();return me?.region? .1*psOf(V2.db,me.region)*ids.length:NaN;}
function v2ToggleInitialSelection(pid,selected){
 const c=v2InitialSelectionContext();if(!c||!V2.db.players[pid]||!initialCandidateAllowed(V2.db,V2.db.teams[c.target],V2.db.players[pid]))return false;
 if(selected&&!c.ids.includes(pid)){if(c.ids.length>=V2_INITIAL_SELECTION_LIMIT){v2Tell('한 번에 최대 10명만 선택할 수 있습니다');return false;}c.ids.push(pid);}else if(!selected)c.ids=c.ids.filter(id=>id!==pid);
 c.open=true;v2Render();document.querySelector('[data-initial-select="'+pid+'"]')?.focus({preventScroll:true});return true;
}
function v2SelectInitialPage(selected){
 const c=v2InitialSelectionContext();if(!c)return;const page=v2Candidates().rows.map(p=>p.id),visible=new Set(page),outside=c.ids.filter(id=>!visible.has(id));c.ids=selected?[...outside,...page.slice(0,V2_INITIAL_SELECTION_LIMIT-outside.length)]:outside;c.open=true;v2Render();document.getElementById('initial-select-page')?.focus({preventScroll:true});
}
function v2InitialSelectionCheckbox(p){
 const c=v2InitialSelectionContext();if(!c)return '';return `<label class="initial-candidate-select"><input type="checkbox" data-initial-select="${v2Esc(p.id)}" aria-label="${v2Esc(p.name)} 일괄 관찰 후보 선택"${c.ids.includes(p.id)?' checked':''}></label>`;
}
function v2InitialSelectionControls(m){
 const c=v2InitialSelectionContext();if(!c)return '';const visible=new Set(m.rows.map(p=>p.id)),outside=c.ids.filter(id=>!visible.has(id)).length,ids=v2InitialSelectedEligible(c),cost=v2InitialBatchScoutCost(ids);
 return `<details class="panel" data-initial-selection${c.open?' open':''}><summary>일괄 관찰 · ${c.ids.length}/10명 선택</summary><p class="hint" role="status">${c.ids.length}/10명 선택 · 현재 페이지 밖 ${outside}명 · 현재 유효한 FA ${ids.length}명. 필터 밖 선택도 유지됩니다.</p><div class="tag-flex"><label class="initial-table-toggle"><input type="checkbox" id="initial-select-page"${m.rows.length?'':' disabled'}>현재 페이지 선택/해제</label><button class="btn btn-outline" id="initial-selection-clear"${c.ids.length?'':' disabled'}>선택 모두 해제</button><button class="btn btn-outline" id="initial-batch-interest"${ids.length&&!v2ManualError()?'':' disabled'}>유효 후보 ${ids.length}명 관심 등록</button><button class="btn btn-outline" id="initial-batch-scout"${ids.length&&!v2ManualError()?'':' disabled'}>유효 후보 ${ids.length}명 일괄 관찰 · ${v2Money(cost)}</button></div><p class="hint">관찰 비용은 기존 수동 관찰 기준입니다. 대상 선수단 또는 불러온 게임이 바뀌면 선택을 초기화합니다.</p></details>`;
}
function v2InitialSelectionQuote(kind='scout'){
 const c=v2InitialSelectionContext(),ids=v2InitialSelectedEligible(c);if(!['scout','interest'].includes(kind)||!c||!ids.length||ids.length>V2_INITIAL_SELECTION_LIMIT)return null;return {context:c,ids,kind,cost:kind==='scout'?v2InitialBatchScoutCost(ids):0,stamp:scoutingReadStamp(V2.db)};
}
function v2InitialSelectionQuoteCurrent(quote,kind){
 const c=v2InitialSelectionContext();if(!quote||!c||quote.context!==c||quote.kind!==kind||!Array.isArray(quote.ids)||!quote.ids.length||quote.ids.length>V2_INITIAL_SELECTION_LIMIT||new Set(quote.ids).size!==quote.ids.length)return false;
 return quote.cost===(kind==='scout'?v2InitialBatchScoutCost(quote.ids):0)&&JSON.stringify(v2InitialSelectedEligible(c))===JSON.stringify(quote.ids)&&scoutingReadStamp(V2.db)===quote.stamp;
}
function v2RunInitialBatchScout(quote){
 if(!v2InitialSelectionQuoteCurrent(quote,'scout'))return v2Tell('선택·보고서·비용 문맥이 바뀌었습니다. 현재 후보를 다시 확인하세요.');
 return v2RecruitAction(()=>scoutPlayers(V2.db,quote.ids,40,quote.cost));
}
function v2RunInitialBatchInterest(quote){
 if(!v2InitialSelectionQuoteCurrent(quote,'interest'))return v2Tell('선택·보고서 문맥이 바뀌었습니다. 현재 후보를 다시 확인하세요.');
 return v2RecruitAction(()=>{try{return scoutingOperationAtomically(V2.db,v2Team(),()=>{for(const id of quote.ids)mInterest(V2.db,id,'B');return quote.ids.length+'명 관심 등록';});}catch(error){return '관심 등록 처리 실패 · '+error.message;}});
}
function v2BindInitialSelection(){
 const c=v2InitialSelectionContext();if(!c)return;const current=v2Guard(),panel=document.querySelector('[data-initial-selection]');if(panel)panel.ontoggle=()=>{if(current()&&panel.isConnected)c.open=panel.open;};
 document.querySelectorAll('[data-initial-select]').forEach(el=>el.onchange=()=>{if(!current()||!el.isConnected)return;if(!v2ToggleInitialSelection(el.dataset.initialSelect,el.checked))el.checked=c.ids.includes(el.dataset.initialSelect);});
 const page=document.getElementById('initial-select-page');if(page){const visible=v2Candidates().rows.map(p=>p.id),n=visible.filter(id=>c.ids.includes(id)).length;page.checked=n>0;page.indeterminate=n>0&&n<visible.length;page.onchange=()=>{if(current()&&page.isConnected)v2SelectInitialPage(page.checked);};}
 v2Bind('#initial-selection-clear',()=>{c.ids=[];c.open=false;v2Render();document.querySelector('[data-initial-selection]>summary')?.focus({preventScroll:true});});
 if(document.getElementById('initial-batch-scout')){const quote=v2InitialSelectionQuote(),interest=quote?{...quote,kind:'interest',cost:0}:null;v2Bind('#initial-batch-scout',()=>v2RunInitialBatchScout(quote));v2Bind('#initial-batch-interest',()=>v2RunInitialBatchInterest(interest));}
}


// A/B/C uses the existing interest writer, with the original explicit confirmation.
function v2RecruitmentPriorityAllowed(p){
 const db=V2.db,t=v2Team();if(V2.section!=='market'||!p||V2.pid!==p.id||!db.world?.recruitment?.targets?.[p.id]||v2ManualError()||t.active===false||t.parent)return false;
 return db.world.phase==='initial_roster'?initialCandidateAllowed(db,v2Target(),p):['season','offseason','market'].includes(db.world.phase)&&!p.retired&&!playerChampionInternalAccess(db,p)&&baseScoutKnowledge(db,p)<100;
}
function v2RecruitmentPriorityControls(p,entry){
 if(!entry||V2.section!=='market')return '';return `<label class="field">영입 우선순위<select class="input" id="player-recruitment-priority" aria-label="${v2Esc(p.name)} 영입 우선순위"${v2RecruitmentPriorityAllowed(p)?'':' disabled'}>${RECRUIT_PRIORITY.map(k=>`<option value="${k}"${entry.priority===k?' selected':''}>${k}순위</option>`).join('')}</select></label>`;
}
function v2BindRecruitmentPriority(){
 const el=document.getElementById('player-recruitment-priority');if(!el)return;const current=v2Guard(),db=V2.db,pid=V2.pid,p=db.players[pid],priority=db.world?.recruitment?.targets?.[pid]?.priority,stamp=scoutingReadStamp(db);
 const valid=()=>current()&&el.isConnected&&!el.disabled&&V2.pid===pid&&db.players[pid]===p&&v2RecruitmentPriorityAllowed(p)&&scoutingReadStamp(db)===stamp;
 el.onchange=()=>{if(!valid())return;const value=el.value;if(!RECRUIT_PRIORITY.includes(value)||value===priority){el.value=priority;return;}if(!confirm(p.name+' · 영입 우선순위 '+priority+' → '+value+'로 변경할까요?')){el.value=priority;return;}if(!valid())return;v2RecruitAction(()=>scoutingOperationAtomically(db,v2Team(),()=>mInterest(db,pid,value)));document.getElementById('player-recruitment-priority')?.focus({preventScroll:true});};
}


// Read the same current, owned negotiation consumed by the existing contract view.
function v2CurrentPlayerNegotiation(p){const t=v2Target();return p&&t?v2Negotiations().find(n=>n.pid===p.id&&n.teamId===t.id&&n.status==='open')||null:null;}
function v2CandidateNegotiationSummary(p){const n=V2.section==='market'&&v2CurrentPlayerNegotiation(p);return n?`<span class="player-meta" data-candidate-negotiation-state="${v2Esc(p.id)}">진행 중인 협상 · ${v2Esc(v2NegotiationState(n))}</span>`:'';}

// Reuse the existing conditional writer projection only when the reader opens it.
function v2InitialCandidateImpactContext(p,t=v2Target()){
 const db=V2.db;if(!db||db.world?.phase!=='initial_roster'||V2.section!=='market'||V2.pid!==p?.id||!initialCandidateAllowed(db,t,p)){V2.candidateImpact=null;return null;}
 const c=V2.candidateImpact;if(!c||c.db!==db||c.world!==db.world||c.manager!==db.manager||c.owner!==managedTeamId(db)||c.target!==t.id||c.pid!==p.id)V2.candidateImpact={db,world:db.world,manager:db.manager,owner:managedTeamId(db),target:t.id,pid:p.id,open:false};
 return V2.candidateImpact;
}
function v2InitialCandidateImpact(p,t){const c=v2InitialCandidateImpactContext(p,t);return c?`<details data-candidate-impact${c.open?' open':''}><summary>협상 전 영입 전후 확인</summary><div data-candidate-impact-content>${c.open?v2InitialImpactProjection(c.db,c.pid,c.target,null,true):''}</div></details>`:'';}
function v2BindInitialCandidateImpact(){
 const el=document.querySelector('[data-candidate-impact]');if(!el)return;const current=v2Guard(),c=V2.candidateImpact;
 el.ontoggle=()=>{if(!current()||!el.isConnected||V2.candidateImpact!==c||V2.pid!==c.pid||!initialCandidateAllowed(V2.db,v2Target(),V2.db.players[c.pid])||v2Target().id!==c.target)return;if(c.open===el.open)return;c.open=el.open;const body=el.querySelector('[data-candidate-impact-content]');if(body)body.innerHTML=c.open?v2InitialImpactProjection(c.db,c.pid,c.target,null,true):'';};
}

// Restore the existing scouting region/contract predicates without reading true ability.
function v2ScoutQueryAllowed(){return V2.section==='scout'&&!!V2.db?.world&&!!v2Team()&&!V2.db.world.fired;}
function v2CandidateQueryContext(query){const db=V2.db;return {db,world:db.world,manager:db.manager,owner:managedTeamId(db),target:v2Target()?.id,query:{...query}};}
function v2ScoutQueryContext(query={region:'ALL',contract:'all',open:false}){return v2CandidateQueryContext(query);}
function v2ScoutQueryState(){
 if(!v2ScoutQueryAllowed())return {region:'ALL',contract:'all',open:false};const db=V2.db,c=V2.scoutQuery;
 if(!c||c.db!==db||c.world!==db.world||c.manager!==db.manager||c.owner!==managedTeamId(db)||c.target!==v2Target()?.id)V2.scoutQuery=v2ScoutQueryContext();
 return V2.scoutQuery.query;
}
function v2RestoreScoutQuery(query){V2.scoutQuery=v2ScoutQueryAllowed()&&query?v2ScoutQueryContext(query):null;}
function v2ScoutCandidateMatches(p,q){if(!q)return true;if(q.region!=='ALL'&&p.region!==q.region)return false;return q.contract==='fa'?!p.contract:q.contract==='contracted'?!!p.contract:q.contract==='rookie'?p.age<=20&&(p.proSeasons||0)<=1:true;}
function v2ScoutQueryControls(){
 if(!v2ScoutQueryAllowed())return '';const q=v2ScoutQueryState(),count=Number(q.region!=='ALL')+Number(q.contract!=='all');
 return `<details class="panel" id="scout-query-options" data-scout-query${q.open?' open':''}><summary>선수 검색 조건${count?' · '+count+'개 적용':''}</summary><div class="stack"><label class="field">선수 지역<select class="input" id="scout-query-region" data-scout-query-field="region"><option value="ALL"${q.region==='ALL'?' selected':''}>전체 지역</option>${Object.values(V2.db.regions).map(r=>`<option value="${v2Esc(r.id)}"${q.region===r.id?' selected':''}>${v2Esc(r.name)}</option>`).join('')}</select></label><label class="field">계약 상태<select class="input" id="scout-query-contract" data-scout-query-field="contract">${[['all','전체'],['fa','FA'],['contracted','계약 중'],['rookie','신인/유망주']].map(([key,label])=>`<option value="${key}"${q.contract===key?' selected':''}>${label}</option>`).join('')}</select></label></div><p class="hint">선수 지역은 국적·로컬 자격과 별개입니다. 신인/유망주는 기존 검색 기준인 20세 이하·프로 경력 1시즌 이하이며 잠재력 확정값이 아닙니다.</p><button class="btn btn-outline" id="scout-query-reset">지역·계약 조건 초기화</button></details>`;
}
function v2SetScoutQuery(key,value){
 if(!v2ScoutQueryAllowed()||!(key==='region'?(value==='ALL'||Object.hasOwn(V2.db.regions,value)):key==='contract'&&['all','fa','contracted','rookie'].includes(value)))return false;
 Object.assign(v2ScoutQueryState(),{[key]:value,open:true});V2.page=0;v2Render();document.getElementById('scout-query-'+key)?.focus({preventScroll:true});return true;
}
function v2BindScoutQuery(){
 if(!v2ScoutQueryAllowed())return;const panel=document.getElementById('scout-query-options');if(!panel)return;const current=v2Guard(),context=V2.scoutQuery;
 panel.ontoggle=()=>{if(current()&&panel.isConnected&&v2ScoutQueryAllowed()&&V2.scoutQuery===context)v2ScoutQueryState().open=panel.open;};
 document.querySelectorAll('[data-scout-query-field]').forEach(el=>el.onchange=()=>{if(current()&&el.isConnected&&V2.scoutQuery===context)v2SetScoutQuery(el.dataset.scoutQueryField,el.value);});
 v2Bind('#scout-query-reset',()=>{if(!v2ScoutQueryAllowed()||V2.scoutQuery!==context)return;V2.scoutQuery=v2ScoutQueryContext();V2.scoutQuery.query.open=true;V2.page=0;v2Render();document.getElementById('scout-query-region')?.focus({preventScroll:true});});
}

function v2MarketQueryAllowed(){return V2.section==='market'&&!!V2.db?.world&&!['initial_roster','pick'].includes(V2.db.world.phase)&&['선수 검색','관심 선수'].includes(V2.tab)&&!!v2Target();}
function v2MarketQueryState(){
 if(!v2MarketQueryAllowed())return {kind:'all',open:false};const db=V2.db,c=V2.marketQuery;
 if(!c||c.db!==db||c.world!==db.world||c.manager!==db.manager||c.owner!==managedTeamId(db)||c.target!==v2Target()?.id)V2.marketQuery=v2CandidateQueryContext({kind:'all',open:false});
 return V2.marketQuery.query;
}
function v2RestoreMarketQuery(query){V2.marketQuery=v2MarketQueryAllowed()&&query?v2CandidateQueryContext(query):null;}
function v2MarketCandidateMatches(db,p,q,target){if(!q||q.kind==='all')return true;if(q.kind==='fa')return !p.team;if(q.kind!=='external')return true;const team=p.team&&db.teams[p.team],mine=parentTeamOf(db,target);return !!team&&!!mine&&parentTeamOf(db,team)?.id!==mine.id;}
function v2MarketValueSummary(view,p){
 if(!v2MarketQueryAllowed()||!view.players[p.id])return '';const value=observedPlayerMarketValue(view,view.players[p.id]);return `<span class="player-meta" data-market-value="${v2Esc(p.id)}">관측 시장가치 추정 · ${Number.isFinite(value)?'약 '+v2Money(value):'정보 부족'}</span>`;
}
function v2MarketQueryControls(){
 if(!v2MarketQueryAllowed())return '';const q=v2MarketQueryState();return `<details class="panel" id="market-query-options" data-market-query${q.open?' open':''}><summary>영입 후보 유형${q.kind!=='all'?' · 조건 적용':''}</summary><label class="field">현재 소속 유형<select class="input" id="market-query-kind" data-market-query-kind>${[['all','전체 선수'],['fa','무소속 · FA'],['external','현재 다른 구단 소속']].map(([key,label])=>`<option value="${key}"${q.kind===key?' selected':''}>${label}</option>`).join('')}</select></label><p class="hint">현재 소속 기준이며 모구단·산하 선수단은 같은 조직으로 구분합니다. 관측 가치는 보유 정보에 따른 추정이며 연봉·이적료와 영입 가능성은 기존 공식 협상에서 확인합니다.</p><button class="btn btn-outline" id="market-query-reset">유형 조건 초기화</button></details>`;
}
function v2SetMarketQuery(kind){if(!v2MarketQueryAllowed()||!['all','fa','external'].includes(kind))return false;Object.assign(v2MarketQueryState(),{kind,open:true});V2.page=0;v2Render();document.getElementById('market-query-kind')?.focus({preventScroll:true});return true;}
function v2BindMarketQuery(){
 if(!v2MarketQueryAllowed())return;const panel=document.getElementById('market-query-options'),field=document.getElementById('market-query-kind');if(!panel||!field)return;const current=v2Guard(),context=V2.marketQuery;
 panel.ontoggle=()=>{if(current()&&panel.isConnected&&v2MarketQueryAllowed()&&V2.marketQuery===context)v2MarketQueryState().open=panel.open;};
 field.onchange=()=>{if(current()&&field.isConnected&&V2.marketQuery===context)v2SetMarketQuery(field.value);};
 v2Bind('#market-query-reset',()=>{if(v2MarketQueryAllowed()&&V2.marketQuery===context)v2SetMarketQuery('all');});
}
