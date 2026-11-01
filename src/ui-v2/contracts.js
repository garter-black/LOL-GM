const V2_TERM_FIELDS=[['salary','연봉 · 억 원/년'],['years','계약 기간 · 년'],['signingBonus','계약금 · 억 원']];
function v2Negotiations(){if(!v2Team()||V2.db.world.fired)return [];const ids=new Set(setupTeamsForManager(V2.db).map(t=>t.id));return Object.values(V2.db.world?.negotiations||{}).filter(n=>ids.has(n.teamId));}
function v2Draft(n){const stamp=JSON.stringify([V2.db.worldDate,n]);if(V2.drafts[n.id]?.stamp!==stamp)V2.drafts[n.id]={stamp,terms:JSON.parse(JSON.stringify(n.counter||n.demand))};return V2.drafts[n.id].terms;}
function v2CaptureDrafts(){if(!V2.db)return;document.querySelectorAll('[data-neg-form]').forEach(form=>{const n=V2.db.world?.negotiations?.[form.dataset.negForm];if(!n)return;const terms=v2Draft(n);for(const [key] of V2_TERM_FIELDS){const input=form.querySelector('[data-term="'+key+'"]');if(input)terms[key]=Number(input.value)}v2CaptureAdvancedTerms(form,terms)});v2CaptureTransactions();}
function v2Terms(terms){if(!terms)return '';return `<div class="statline"><span>연봉 · 연간</span><strong>${v2Money(terms.salary)}</strong></div><div class="statline"><span>기간</span><strong>${v2Esc(terms.years)}년</strong></div><div class="statline"><span>계약금</span><strong>${v2Money(terms.signingBonus||0)}</strong></div><div class="statline"><span>방출 보장 비율</span><strong>${Math.round(contractGuaranteeRate(terms)*100)}%</strong></div>${Object.entries(terms.bonuses||{}).filter(([,v])=>v).map(([k,v])=>`<div class="statline"><span>${({performance:'성과 보너스',title:'우승 보너스',international:'국제전 보너스'})[k]||v2Esc(k)}</span><strong>${v2Money(v)}</strong></div>`).join('')}<p class="hint">${v2Esc(SQUAD_ROLE_KO[terms.promisedRole]||'역할 약속 없음')}${terms.option?' · '+v2Esc(terms.option.type==='player'?'선수 옵션':'구단 옵션'):''}${terms.buyout?' · '+(normalizeBuyoutClause(terms.buyout)?.type==='release'?'구단 거부 불가':'협상 개시권')+' 바이아웃 '+v2Money(terms.buyout.amount):''}</p>`;}
function v2OwnedNegotiation(nid){return v2Negotiations().find(n=>n.id===nid)||null;}
function v2NegotiationState(n){return n.status!=='open'?({accepted:'계약 완료',cancelled:'협상 종료',withdrawn:'철회',rejected:'거절',lost:'경쟁 구단 선택',expired:'시장 마감'})[n.status]||n.status:n.stage==='waiting'?'응답 대기':n.stage==='agreement'?'조건 합의':(n.stage==='club'?n.clubCounter:n.counter&&n.round>0)?'역제안 검토':'조건 작성';}
function v2NegotiationCompetition(n){return n?.status==='open'&&['initial','fa'].includes(n.kind)?negotiationCompetition(V2.db,V2.db.players[n.pid],V2.db.teams[n.teamId],null,n.kind):null;}
function v2NegotiationSummary(n){
 if(v2OwnedNegotiation(n?.id)!==n)return '';
 if(n.stage==='club')return n.clubCounter!=null?`받은 이적료 역제안 · ${v2Money(n.clubCounter)}`:'판매 구단에 이적료 조건을 제안하세요';
 const waiting=n.status==='open'&&n.stage==='waiting',agreed=n.stage==='agreement',signed=n.status==='accepted',terms=waiting?n.response?.terms:signed?n.acceptedTerms:agreed?n.agreedTerms:n.counter||n.demand;
 return `${waiting?'제출 조건':signed?'체결 조건':agreed?'합의 조건':'받은 개인 조건'} · 연봉 ${v2Money(terms?.salary)} / 년`;
}
function v2NegotiationNextAction(n){return n.status!=='open'?'종료된 협상 기록을 확인하세요':n.stage==='club'?'판매 구단 이적료 조건 검토':n.stage==='waiting'?'선수 연락 대기 · 제안을 바꾸려면 먼저 취소하세요':n.stage==='agreement'?'감독의 별도 최종 계약 검토 필요':'받은 조건을 확인하고 제안을 검토하세요';}
function v2NegotiationCard(n){
 if(v2OwnedNegotiation(n?.id)!==n)return '';const rivals=v2NegotiationCompetition(n),waiting=n.status==='open'&&n.stage==='waiting';
 return `<article class="panel" data-negotiation-summary="${v2Esc(n.id)}"><div class="panel-heading"><strong>${v2Esc(V2.db.players[n.pid]?.name||'선수 정보 없음')}</strong><span class="state-tag">${v2Esc(v2NegotiationState(n))}</span></div><p class="small subtle">${v2Esc(V2.db.teams[n.teamId]?.name||'정보 없음')}</p><p class="small" data-negotiation-summary-terms>${v2Esc(v2NegotiationSummary(n))}</p>${waiting?`<p class="small">응답 예정 ${v2Esc(v2TimeText(n.response?.dueAt))}</p>`:''}<p class="hint">${v2Esc(v2NegotiationNextAction(n))}</p>${rivals!==null?`<p class="hint" data-ai-offers>실제 경쟁 제안 ${rivals.length}곳</p>`:''}<button class="btn btn-outline" data-negotiation-open="${v2Esc(n.id)}">협상 상세 →</button></article>`;
}
function v2MarketNegotiations(){const rows=v2Negotiations().filter(n=>n.status==='open');return `<section class="stack" data-market-negotiations><h2>진행 중인 협상 · ${rows.length}건</h2>${rows.length?v2WaitingProgress()+rows.map(v2NegotiationCard).join(''):'<p class="hint">진행 중인 공식 협상이 없습니다.</p>'}</section>`;}
function v2NegotiationList(){
 if(V2.nid)return v2NegotiationDetail(V2.nid);
 const rows=v2Negotiations();if(!rows.length)return '<section class="panel empty">진행 중인 협상이 없습니다.<p><button class="btn btn-primary" data-tab="선수 검색">선수 찾아보기</button></p></section>';
 return v2WaitingProgress()+'<section class="stack">'+rows.map(v2NegotiationCard).join('')+'</section>';
}
function v2NegotiationDetail(nid){
 const n=v2OwnedNegotiation(nid);if(!n)return '<section class="panel"><p>현재 관리 구단의 협상을 확인할 수 없습니다.</p><button class="btn btn-outline" id="negotiation-back">협상 목록으로</button></section>';
 if(n.stage==='club'&&n.status==='open')return v2SellerView(n);
 const p=V2.db.players[n.pid],open=n.status==='open',agreed=n.stage==='agreement',waiting=n.stage==='waiting',terms=waiting?n.response?.terms:open&&!agreed?v2Draft(n):n.agreedTerms||n.acceptedTerms||n.demand,
   rivals=v2NegotiationCompetition(n);
 return `<section class="panel"><button class="btn btn-outline btn-small" id="negotiation-back">← 협상 목록으로</button><div class="content-head"><div><h2>${v2Esc(p?.name||'선수 정보 없음')}</h2><p class="small subtle">대상 선수단 · ${v2Esc(V2.db.teams[n.teamId]?.name||'정보 없음')}</p></div><span class="state-tag">${v2Esc(v2NegotiationState(n))}</span></div>${v2NegotiationCounterparty(n)}${rivals!==null?`<p class="hint" data-ai-offers>실제 경쟁 제안 ${rivals.length}곳</p>`:''}<button class="btn btn-soft" id="contract-advice" data-advice="${v2Esc(n.id)}">비서에게 검토 요청</button>${open&&!agreed&&!waiting?`<form data-neg-form="${v2Esc(n.id)}" onsubmit="return false">${V2_TERM_FIELDS.map(([key,label])=>`<label class="field">${label}<input class="input" type="number" data-term="${key}" min="${key==='years'?1:0}" step="${key==='years'?1:.1}" value="${v2Esc(terms[key]||0)}" required></label>`).join('')}${v2AdvancedTerms(terms)}<button class="btn btn-primary" type="button" id="review-offer" data-offer-review="${v2Esc(n.id)}">제안 검토</button></form>`:v2Terms(terms)}${waiting?`<p>응답 예정 ${v2Esc(v2TimeText(n.response?.dueAt))}</p><p class="hint">현재 제안을 수정하려면 취소한 뒤 다시 제출하세요. 선수·자리·예산을 예약하지 않습니다.</p>${v2WaitingProgress()}`:''}${v2CurrentContact()?.id===n.id?'<button class="btn btn-primary" id="contract-match-resume">연락 검토를 마치고 현재 경기 재개</button>':''}${agreed&&open?`<p class="hint">아직 계약과 소속은 바뀌지 않았습니다. 최종 계약은 감독이 직접 결정합니다.</p><button class="btn btn-primary" id="review-final" data-final-review="${v2Esc(n.id)}">최종 계약 검토</button>`:''}${open?`<p><button class="btn btn-outline btn-small" data-end-neg="${v2Esc(n.id)}">협상 종료</button></p>`:''}<details><summary>주고받은 제안 · ${n.history?.length||0}건</summary>${(n.history||[]).map(h=>`<p class="small">${v2Esc(h.at?v2TimeText(h.at):h.date||n.createdDate||'날짜 정보 없음')} · ${v2Esc(v2NegotiationLabel(h))}${h.terms?' · 연봉 '+v2Money(h.terms.salary)+' / 년':''}${h.reason?' · '+v2Esc(h.reason):''}</p>`).join('')}</details></section>`;
}
function v2ReviewCurrent(review=V2.review){const n=review&&v2OwnedNegotiation(review.nid);return !!n&&review.db===V2.db&&review.manager===V2.db.manager&&review.owner===managedTeamId(V2.db)&&review.target===V2.target&&!manualNegotiationError(V2.db,n)&&review.stamp===v2NegotiationStamp(n)&&(review.mode==='final'||JSON.stringify(review.inputTerms)===JSON.stringify(v2Draft(n)));}
function v2InitialOfferImpactView(r,n,current){return current&&n?.kind==='initial'?v2InitialImpactProjection(r.db,n.pid,n.teamId,r.terms):'';}
function v2InitialImpactProjection(db,pid,tid,terms,candidate=false){
 let m;try{m=initialOfferImpact(db,pid,tid,terms)}catch(error){console.error('Initial offer impact failed',error);m={ok:false,reason:'미리보기를 계산하지 못했습니다. 조건과 저장 상태를 다시 확인하세요.'}}
 if(!m.ok)return `<p class="hint" role="status" data-initial-impact-rejected> 영입 전후를 확인할 수 없습니다 · ${v2Esc(m.reason)}</p>`;
 const b=m.before,a=m.after,row=(key,label,x,y)=>`<tr data-impact-field="${key}"><th scope="row">${v2Esc(label)}</th><td>${v2Esc(x)}</td><td>${v2Esc(y)}</td></tr>`;
 const tag=candidate?'div':'details',heading=candidate?'h3':'summary';
 return `<${tag}${candidate?'':' open'} data-initial-impact><${heading}>창단 영입 전후 · 조건부 미리보기</${heading}><p class="hint">${v2Esc(m.team)} · ${v2Esc(m.date)} · ${candidate?'요구 연봉 기준의 가정입니다. 실제 협상 요구·제출 조건과 다를 수 있습니다.':'지금 검토하는 조건입니다.'} 합의에 성공해 최종 계약했을 경우이며 선수 수락·경기 출전 자격을 보장하지 않습니다. 현재 선수단·현금은 바뀌지 않습니다.</p>${candidate?v2Terms({...m.terms,promisedRole:null}):''}<div class="table-scroll" tabindex="0" role="region" aria-label="현재와 최종 계약 후 비교"><table><thead><tr><th scope="col">항목</th><th scope="col">현재</th><th scope="col">최종 계약 시</th></tr></thead><tbody>${row('count','스쿼드 인원 · '+m.limits.min+'–'+m.limits.max+'명',b.count+'명',a.count+'명')}${row('imports','비로컬 · 상한 '+m.importLimit+'명',b.imports+'명',a.imports+'명')}${row('organization','구단 조직 인원',b.organization+'명',a.organization+'명')}${row('pay','연간 연봉 부담',v2Money(b.pay),v2Money(a.pay))}${row('budget','연봉 예산',v2Money(b.budget),v2Money(a.budget))}${row('room','예산 여유',v2Money(b.budget-b.pay),v2Money(a.budget-a.pay))}${row('cash','현재 현금 · 계약금 반영',v2Money(b.cash),v2Money(a.cash))}${row('tax','현재 규칙의 연간 부담금 추정',v2Money(b.tax),v2Money(a.tax))}</tbody></table></div><p class="hint">성과·우승·국제전 보너스는 지금 현금에서 차감하지 않습니다. 다른 진행 중 제안은 확정 의무로 합산하지 않습니다. 실제 제출·최종 서명 시 최신 조건을 다시 확인합니다.</p><details><summary>역할 배치 참고·개막 조건</summary>${ROLES.map(role=>`<p class="small">${v2Esc(ROLE_KO[role])} 전문 역할 인원 · ${b.roles[role]} → ${a.roles[role]}명</p>`).join('')}<p class="hint">전문 역할 인원은 등록 요건이 아니며 약속 역할·실제 주전 배치와 다릅니다. 이 스쿼드에서는 ${m.local?'로컬':'비로컬'}로 판정하며 국적·출신·언어와 별개입니다.</p>${a.errors.length?'<ul>'+a.errors.map(e=>'<li>'+v2Esc(e)+'</li>').join('')+'</ul>':'<p>현재 개막 조직 조건을 충족합니다.</p>'}</details></${tag}>`;
}
function v2ContractReviewView(){const r=V2.review,n=v2OwnedNegotiation(r?.nid),current=v2ReviewCurrent(r),plan=current&&r.mode!=='final'?negotiationResponsePlan(V2.db,n,r.terms):null,rivals=n?v2NegotiationCompetition(n):null;return `<section class="panel" id="contract-review"><p class="small">${v2Esc(V2.db.players[n?.pid]?.name||'선수 정보 없음')} · 대상 선수단 ${v2Esc(V2.db.teams[n?.teamId]?.name||'정보 없음')}</p>${r.adjusted?.length?'<p class="hint" role="status">기존 계약 규칙에 따라 '+r.adjusted.map(v2Esc).join(' · ')+'을 적용했습니다. 표시된 조건을 확인하거나 입력으로 돌아가 수정하세요.</p>':''}${v2Terms(r.terms)}${v2InitialOfferImpactView(r,n,current)}${rivals!==null?`<p class="hint" data-ai-offers>실제 경쟁 제안 ${rivals.length}곳</p>`:''}${plan?.ok?`<p>${plan.immediate?'기존 최단 회차의 수락 조건에 따라 즉시 응답합니다.':'응답 예정 '+v2Esc(v2TimeText(plan.dueAt))}</p>`:''}<p class="hint">${r.mode==='final'?'직접 확정하면 현재 예산·자리·자격을 다시 확인하고 계약을 체결합니다.':'제안을 제출해도 선수단·예산·자리를 예약하지 않습니다.'}</p>${!current?'<p role="alert">조건이나 현재 권한이 바뀌었습니다. 닫고 다시 검토하세요.</p>':''}<div class="tag-flex"><button class="btn btn-primary" id="confirm-contract"${!current?' disabled':''}>${r.mode==='final'?'최종 계약 확정':'이 조건으로 제출'}</button><button class="btn btn-outline" id="cancel-review">${r.mode==='final'?'합의로 돌아가기':'조건 수정으로'}</button></div></section>`;}
function v2OpenNegotiation(nid){if(!v2OwnedNegotiation(nid))return v2Tell('현재 관리 구단의 협상을 확인하세요');v2Navigate('market','진행 중인 협상',null,nid);}
function v2SubmitReview(){const review=V2.review;if(!v2ReviewCurrent(review))return v2Tell('조건이나 게임 상태가 바뀌었습니다. 현재 조건을 다시 검토하세요.');const n=v2OwnedNegotiation(review.nid);V2.review=null;v2ContractAction(()=>review.mode==='final'?finalizeStagedNegotiation(V2.db,n.id):stageNegotiationOffer(V2.db,n.id,review.terms),n.id);}
function v2NegotiationLabel(h){return ({agreed:'선수 조건 수락 · 최종 계약 전',finalized:'감독 최종 계약 확정',submitted:'제안 접수 · 응답 대기',cancelled:'대기 제안 취소',response_unavailable:'현재 조건으로 응답 처리 불가',accept:'조건 수락',counter:'역제안',commit_rejected:'계약 처리 거절',rival:'경쟁 구단 선택'})[h.result]||(h.side==='club'?'구단 제안':'선수 응답');}
function v2NegotiationStamp(n){const db=V2.db;return JSON.stringify([db.manager,db.worldDate,db.world.phase,db.world.manage,db.world.fired,db.world.pendingOfficial,db.world.negotiationClock,db.world.officialGameTimeThrough,officialClockState(db),db.world.contractWindow,db.world.negotiations,db.players[n.pid],db.teams[n.teamId],db.regions[db.teams[n.teamId]?.region],n.stage==='player'?(v2NegotiationCompetition(n)?.map(o=>o.offerId).sort()||[]):[]]);}
function v2Review(nid,mode){
 v2CaptureDrafts();const n=V2.db.world?.negotiations?.[nid],error=manualNegotiationError(V2.db,n);if(error)return v2Tell(error);
 if(n.status!=='open'||n.stage!==(mode==='final'?'agreement':'player'))return v2Tell('현재 협상 상태가 바뀌었습니다');
 const form=document.querySelector(`[data-neg-form="${CSS.escape(nid)}"]`);if(mode!=='final'&&form&&!form.reportValidity())return;
 if(V2.official?.open||V2.managementReview||V2.roleReview||V2.advice)return v2Tell('현재 작업 창을 먼저 닫으세요');
 const inputTerms=JSON.parse(JSON.stringify(mode==='final'?n.agreedTerms:v2Draft(n)));
 if(!contractGuaranteeTermsValid(inputTerms)||invalidContractNumericTerms(inputTerms))return v2Tell('계약 금액·기간·보장 조건을 다시 확인하세요');
 const terms=mode==='final'?inputTerms:normalizeContractTerms(V2.db,V2.db.players[n.pid],V2.db.teams[n.teamId],inputTerms.salary,inputTerms.years,inputTerms);
 const labels={salary:'연봉',years:'계약 기간',signingBonus:'계약금',bonuses:'보너스',buyout:'바이아웃',option:'옵션',releaseGuaranteeRate:'방출 보장',promisedRole:'선수단 역할'},adjusted=Object.keys(labels).filter(k=>JSON.stringify(inputTerms[k])!==JSON.stringify(terms[k])).map(k=>labels[k]);
 V2.review={db:V2.db,manager:V2.db.manager,owner:managedTeamId(V2.db),target:V2.target,nid,mode,stamp:v2NegotiationStamp(n),inputTerms,terms,adjusted};v2Render();
}
function v2BindContracts(){v2BindTransactions();v2Bind('[data-counterparty-use]',el=>v2UseCounterpartyTerms(el.dataset.counterpartyUse));
 v2Bind('#renew-player',()=>v2StartRenewal());
 v2Bind('#release-player',()=>v2ReviewPlayerRelease());v2Bind('#contact-waiver',()=>v2ReviewOwnedDecision('contact-waiver'));v2Bind('#window-option',()=>v2ReviewOwnedDecision('window-option'));v2Bind('#team-option',()=>v2ReviewManagement({type:'player.option',actor:'manager',pid:V2.pid,teamId:V2.db.players[V2.pid].team},'기존 팀 옵션 행사 검토',['저장된 기존 옵션 조건과 현재 권한을 다시 검사합니다.']));
 v2Bind('#seller-review',()=>v2ReviewSeller(V2.nid,Number(document.getElementById('seller-fee').value),v2ReadSellerFeePlan()));
 const seller=document.getElementById('seller-fee'),sellerCurrent=v2Guard();if(seller)seller.oninput=()=>{if(!sellerCurrent())return;const n=v2OwnedNegotiation(V2.nid);if(!n)return;V2.sellerDrafts??={};V2.sellerDrafts[n.id]={...V2.sellerDrafts[n.id],stamp:v2NegotiationStamp(n),fee:Number(seller.value)}};

 v2Bind('#contracts-advance',()=>v2ContractAction(()=>advanceToNegotiationResponse(V2.db)));
 v2Bind('#contract-match-resume',()=>v2ResumeAfterContact());
 v2Bind('[data-offer-review]',el=>v2Review(el.dataset.offerReview,'offer'));
 v2Bind('[data-final-review]',el=>v2Review(el.dataset.finalReview,'final'));
 v2Bind('[data-negotiation-open]',el=>v2OpenNegotiation(el.dataset.negotiationOpen));
 v2Bind('#negotiation-back',()=>v2Navigate('market','진행 중인 협상'));
 v2Bind('[data-advice]',el=>v2OpenAdvice(el.dataset.advice));
 v2Bind('#cancel-review',()=>v2CloseTask());
 v2Bind('#confirm-contract',()=>v2SubmitReview());
 v2Bind('[data-end-neg]',el=>{const n=V2.db.world?.negotiations?.[el.dataset.endNeg],error=manualNegotiationError(V2.db,n);if(error)return v2Tell(error);v2ContractAction(()=>v2CancelNegotiation(n.id),n.id)});
 document.querySelectorAll('[data-seller-fee-form] [data-advanced]').forEach(el=>el.addEventListener('input',v2ReadSellerFeePlan));
 const current=v2Guard();document.querySelectorAll('[data-neg-form] input,[data-neg-form] select').forEach(el=>el.oninput=()=>{if(current())v2CaptureDrafts()});
}
function v2Mail(){return v2Negotiations().flatMap(n=>(n.history||[]).map((h,i)=>({id:n.id+':'+i,nid:n.id,pid:n.pid,date:h.date||n.createdDate||'',title:(V2.db.players[n.pid]?.name||'선수')+' · '+v2NegotiationLabel(h),terms:h.terms}))).reverse();}
function v2Inbox(){const rows=v2Mail().filter(m=>V2.tab!=='읽지 않음'||!V2.read[m.id]);return `<section class="stack">${rows.map(m=>`<button class="mail-item" data-mail="${v2Esc(m.id)}"><span>${v2Icon('mail')}</span><span class="grow"><span class="title">${V2.read[m.id]?'':'● '}${v2Esc(m.title)}</span><span class="player-meta" style="display:block">${v2Esc(m.date)}</span></span><span>›</span></button>`).join('')||'<div class="panel empty">확인할 계약 연락이 없습니다.</div>'}</section>`;}

function v2CurrentContact(){return manualContactPending(V2.db)?V2.db.world.pendingOfficial.queue[0].contact:null;}
function v2TimeText(at){if(typeof at!=='string'||!Number.isFinite(Date.parse(at)))return '시각 확인 필요';const p=venueClockParts(at,'Asia/Seoul');return p.date+' '+p.time+' · 한국 시간';}
function v2WaitingProgress(){const rows=waitingNegotiationResponses(V2.db,true);return rows.length?`<section class="panel"><p>현재 게임 시각 ${v2Esc(v2TimeText(negotiationClockAt(V2.db)))}</p><p class="hint">다음 판단 연락 또는 공식 경기 준비에서 진행을 멈춥니다. 제안과 최종 계약은 자동으로 확정하지 않습니다.</p><button class="btn btn-primary" id="contracts-advance"${v2ManualError()?' disabled':''}>다음 선수 연락까지 진행</button></section>`:'';}
function v2ContractAction(action,nid=null){
 const error=nid?manualNegotiationError(V2.db,v2OwnedNegotiation(nid)):v2ManualError();if(error)return v2Tell(error);
 if(V2.managementReview||V2.roleReview||V2.advice||V2.official?.open)return v2Tell('현재 작업 창을 먼저 닫으세요');
 const undo=pendingOfficialUndo(V2.db);let out;try{out=action();if(!out?.ok&&!out?.response){undo();v2Tell(out?.msg||'현재 계약 상태를 다시 확인하세요');return out;}}catch(error){undo();v2Tell(error.message);return {ok:false,msg:error.message};}
 v2AfterCommittedAction(()=>{v2Tell(out.msg||'연락과 현재 상태를 확인하세요');v2Save();if(!v2ShowContractResponse(out))v2Render();});return out;
}
function v2ResumeAfterContact(){
 if(!v2CurrentContact())return v2Tell('현재 경기의 연락을 다시 확인하세요');
 const undo=pendingOfficialUndo(V2.db);let out;try{out=resumeManualAfterContact(V2.db);if(!out.ok&&!out.response&&!out.game){undo();return v2Tell(out.msg);}}catch(error){undo();return v2Tell(error.message);}
 v2AfterCommittedAction(()=>{v2AcceptOfficialOutput(out);if(!v2CurrentContact()&&V2.db.world.pendingOfficial)v2OfficialOpen();});
}

function v2ShowContractResponse(out){
 if(!out?.response)return false;const now=negotiationClockAt(V2.db),direct=out.negotiationId||(out.pending?.kind==='negotiation'?out.pending.id:null)||v2CurrentContact()?.id,n=direct?v2OwnedNegotiation(direct):v2Negotiations().find(n=>n.history?.some(h=>h.side==='player'&&h.at===now));
 if(!n)return false;v2OpenNegotiation(n.id);return true;
}

function v2CancelNegotiation(nid){const n=v2OwnedNegotiation(nid);if(!n||n.status!=='open')return {ok:false,msg:'진행 중인 협상이 아닙니다'};const msg=cancelNegotiation(V2.db,nid);return {ok:n.status==='cancelled',msg};}

// 게임 작성이 성공한 뒤의 표시 실패는 저장한 결정을 되돌리지 않는다.
function v2AfterCommittedAction(show){try{show();}catch(error){v2Tell('게임 처리는 유지했습니다. 화면을 다시 여세요 · '+error.message);}}

// 기존 재계약·판매 구단 협상을 새 화면에서 접근한다. 계약 작성은 기존 엔진만 한다.
function v2StartRenewal(pid=V2.pid){
 const db=V2.db,p=db.players[pid],t=v2Team(),error=v2ManagementError();if(error)return v2Tell(error);
 if(!p||p.retired||!t||t.parent||p.team!==t.id||!t.roster.includes(pid)||p.loan||p.contract?.medicalReplacement)return v2Tell('현재 관리 구단의 일반 소속 선수만 재계약을 검토하세요');
 if(v2TaskSpec())return v2Tell('현재 작업 창을 먼저 닫으세요');
 const undo=pendingOfficialUndo(db);try{const out=startNegotiation(db,pid,'renewal');if(!out.ok){undo();return v2Tell(out.msg)}v2Save();v2OpenNegotiation(out.neg.id)}catch(error){undo();v2Tell(error.message)}
}
function v2SellerView(n){
 const p=V2.db.players[n.pid],draft=V2.sellerDrafts?.[n.id],fee=draft?.stamp===v2NegotiationStamp(n)?draft.fee:n.clubCounter??0;
 return `<section class="panel"><button class="btn btn-outline" id="negotiation-back">← 협상 목록</button><h2>${v2Esc(p.name)} · 판매 구단 협상</h2><p>대상 선수단 ${v2Esc(V2.db.teams[n.teamId]?.name)} · 원소속 ${v2Esc(V2.db.teams[n.sellerId]?.name)}</p><p class="hint">받은 역제안이 있을 때만 상대 요구액을 표시합니다. 구단 간 합의 후에도 선수 동의와 별도 수동 최종 서명이 필요합니다.</p>${n.clubCounter?`<p>받은 역제안 ${v2Money(n.clubCounter)}</p>`:''}<label class="field">제안 이적료 · 억 원<input class="input" type="number" min="0" step="0.1" id="seller-fee" value="${v2Esc(fee)}"></label><details data-seller-fee-form><summary>분할 지급·성과 이적료</summary>${v2FeeFields(draft?.stamp===v2NegotiationStamp(n)?draft:{})}<p class="hint">잔금은 이적 30일 후, 추가금 조건은 1년간 유효합니다. 총 보장 이적료와 조건부 추가금은 별개입니다.</p></details><button class="btn btn-primary" id="seller-review">이적료 제안 검토</button><button class="btn btn-outline" data-end-neg="${v2Esc(n.id)}">협상 종료</button></section>`;
}
function v2ReviewSeller(nid,fee,feePlan=null){
 const n=v2OwnedNegotiation(nid),error=manualNegotiationError(V2.db,n);if(error)return v2Tell(error);
 if(n.stage!=='club'||n.status!=='open'||!Number.isFinite(fee)||fee<0)return v2Tell('현재 판매 구단 협상과 제안액을 확인하세요');
 if(v2TaskSpec())return v2Tell('현재 작업 창을 먼저 닫으세요');
 V2.managementReview={db:V2.db,world:V2.db.world,manager:V2.db.manager,stamp:v2ManagementStamp(),sellerOffer:{nid,fee,feePlan:v2Copy(feePlan),stamp:v2NegotiationStamp(n)},sellerTerms:JSON.stringify([nid,fee,feePlan]),preview:{command:{type:'transfer.fee-review'}},title:'판매 구단 이적료 제안 검토',lines:[V2.db.players[n.pid].name+' · '+v2Money(fee),v2FeeText(feePlan),'판매 구단이 현재 상태에서 독립 판단합니다. 이적료 합의만으로 선수 계약·소속·지급을 확정하지 않습니다.']};v2Render();
}
function v2CommitSeller(r){
 const c=r.sellerOffer,n=v2OwnedNegotiation(c.nid),error=manualNegotiationError(V2.db,n);if(error)return {ok:false,errors:[error]};
 if(n.stage!=='club'||n.status!=='open'||c.stamp!==v2NegotiationStamp(n)||r.sellerTerms!==undefined&&r.sellerTerms!==JSON.stringify([c.nid,c.fee,c.feePlan]))return {ok:false,errors:['현재 판매 구단 조건을 다시 확인하세요']};
 const undo=pendingOfficialUndo(V2.db),before=JSON.stringify(n);try{const msg=mTransferBid(V2.db,n.pid,c.fee,c.feePlan);if(JSON.stringify(n)===before){undo();return {ok:false,errors:[msg]}}return {ok:true,msg}}catch(error){undo();return {ok:false,errors:[error.message]}}
}
function v2ReviewPlayerRelease(pid=V2.pid){
 const p=v2RolePlayer(pid);if(!p)return v2Tell('현재 관리 선수를 확인하세요');
 const command={type:'player.release',actor:'manager',pid,teamId:p.team,mode:'manager'},plan=previewWorldAction(V2.db,command);if(!plan.ok)return v2Tell(plan.errors.join(' · '));
 v2ReviewManagement(command,p.name+' · 계약 해지 검토',['계약 종료 보상 '+v2Money(plan.changes[0]?.cost||0),'현재 등록·로스터·계약·재정 조건을 다시 검사한 뒤 수동 확정합니다.']);
}
function v2OwnedDecisionStamp(pid){const db=V2.db,p=db.players[pid];return JSON.stringify([db.worldDate,db.year,db.world.contractWindow,db.world.contractAgreements,p,db.teams[p?.team]])}
function v2ReviewOwnedDecision(kind,pid=V2.pid){
 const p=v2RolePlayer(pid),error=v2ManagementError();if(error)return v2Tell(error);if(!p||v2Team()?.parent||v2TaskSpec())return v2Tell('현재 관리 선수와 작업 창을 확인하세요');
 if(!['contact-waiver','window-option'].includes(kind))return;
 V2.managementReview={db:V2.db,world:V2.db.world,manager:V2.db.manager,stamp:v2ManagementStamp(),ownedDecision:{kind,pid,stamp:v2OwnedDecisionStamp(pid)},ownedTerms:JSON.stringify([kind,pid]),preview:{command:{type:'contract.window-decision'}},title:kind==='contact-waiver'?'타 구단 조기 접촉 허용 검토':'기존 팀 옵션 행사 검토',lines:[p.name,kind==='contact-waiver'?'원소속 독점기간의 조기 접촉을 허용합니다. 선수의 계약 종료나 타 구단 서명을 자동으로 결정하지 않습니다.':'저장된 기존 옵션 조건을 행사합니다. 선수 옵션은 감독이 대신 행사하지 않습니다.']};v2Render();
}
function v2CommitOwnedDecision(r){
 const c=r.ownedDecision,p=v2RolePlayer(c.pid),error=v2ManagementError();if(error)return {ok:false,errors:[error]};if(!p||!['contact-waiver','window-option'].includes(c.kind)||r.ownedTerms!==JSON.stringify([c.kind,c.pid])||c.stamp!==v2OwnedDecisionStamp(c.pid))return {ok:false,errors:['현재 계약 조건을 다시 확인하세요']};
 const undo=pendingOfficialUndo(V2.db);try{const out=c.kind==='contact-waiver'?grantEarlyContact(V2.db,c.pid,'manager'):exerciseExclusiveTeamOption(V2.db,c.pid);if(!out?.ok){undo();return {ok:false,errors:[out?.msg||'현재 계약에서 행사할 수 없습니다']}}return out}catch(error){undo();return {ok:false,errors:[error.message]}}
}

// Existing contract and roster commands only; these controls do not own game rules.
function v2TermSelect(key,label,value,choices){return `<label class="field">${label}<select class="input" data-advanced="${key}">${choices.map(([v,text])=>`<option value="${v2Esc(v)}"${v===value?' selected':''}>${v2Esc(text)}</option>`).join('')}</select></label>`;}
function v2TermNumber(key,label,value,max=null){return `<label class="field">${label}<input class="input" data-advanced="${key}" type="number" min="0"${max===null?'':` max="${max}"`} step="any" value="${v2Esc(value)}"></label>`;}
function v2AdvancedTerms(terms){const buyout=normalizeBuyoutClause(terms.buyout);return `<details><summary>보너스·보장·바이아웃·옵션·역할 조건</summary>${['performance','title','international'].map((k,i)=>v2TermNumber(k,['성과 보너스 · 억 원','우승 보너스 · 억 원','국제전 보너스 · 억 원'][i],terms.bonuses?.[k]||0)).join('')}${v2TermNumber('guarantee','방출 보장 · %',contractGuaranteeRate(terms)*100,100)}${v2TermSelect('buyoutType','바이아웃 유형',buyout?.type||'negotiation',[['negotiation','협상 개시권'],['release','구단 거부 불가']])}${v2TermNumber('buyout','바이아웃 금액 · 억 원',buyout?.amount||0)}${v2TermSelect('option','계약 옵션',terms.option?.type||'none',[['none','없음'],['team','구단 옵션'],['player','선수 옵션']])}${v2TermSelect('role','약속 역할',terms.promisedRole||'backup',SQUAD_ROLES.map(r=>[r,SQUAD_ROLE_KO[r]]))}<p class="hint">보너스는 기존 성과 조건, 옵션은 기존 계약 기간 규칙을 따릅니다. 바이아웃 0은 조항 없음입니다.</p></details>`;}
function v2CaptureAdvancedTerms(form,terms){const read=k=>form.querySelector(`[data-advanced="${k}"]`);if(!read('performance'))return;terms.bonuses={...terms.bonuses,...Object.fromEntries(['performance','title','international'].map(k=>[k,Number(read(k).value)]))};terms.releaseGuaranteeRate=Number(read('guarantee').value)/100;const amount=Number(read('buyout').value);terms.buyout=amount===0?null:{amount,type:read('buyoutType').value};terms.option=read('option').value==='none'?null:{type:read('option').value};terms.promisedRole=read('role').value;}
function v2FeeFields(d){return v2TermSelect('upfront','선지급 비율',String(d.upfront??100),[['100','100%'],['50','50%'],['0','0%']])+v2TermSelect('feeKind','추가 지급 조건',d.feeKind||'appearances',[['appearances','공식 출전 게임'],['international','국제전 출전 게임'],['titles','구단 우승']])+v2TermNumber('threshold','조건 횟수',d.threshold??10)+v2TermNumber('addOn','조건 달성 추가금 · 억 원',d.addOn??0);}
function v2FeePlan(d,fee,anchor){const fraction=Number(d.upfront??100)/100,bonus=Number(d.addOn??0);if(fraction===1&&bonus===0)return null;const upfront=Math.round(fee*fraction*10)/10,left=Math.round((fee-upfront)*10)/10;return {upfront,installments:left?[{date:addDays(anchor,30),amount:left}]:[],addOns:bonus?[{kind:d.feeKind||'appearances',threshold:Number(d.threshold??10),amount:bonus,through:addDays(anchor,365)}]:[]};}
function v2FeeText(plan){return !plan?'이적료 전액 선지급':'선지급 '+v2Money(plan.upfront)+(plan.installments||[]).map(x=>' · '+x.date+' '+v2Money(x.amount)).join('')+(plan.addOns||[]).map(x=>' · '+({appearances:'공식 출전',international:'국제전 출전',titles:'구단 우승'}[x.kind]||x.kind)+' '+x.threshold+'회 · '+v2Money(x.amount)+' (~'+x.through+')').join('');}
function v2TransactionDraft(pid){V2.transactionDrafts??={};const stamp=JSON.stringify([V2.db.worldDate,V2.db.world.phase,managedTeamId(V2.db),V2.db.players[pid]?.team,V2.db.players[pid]?.loan]);let d=V2.transactionDrafts[pid];if(!d||d.db!==V2.db||d.manager!==V2.db.manager||d.stamp!==stamp)d=V2.transactionDrafts[pid]={db:V2.db,manager:V2.db.manager,stamp,duration:'half',role:'starter',share:100,fee:0,recall:false,purchase:'none',purchaseFee:0,purchaseSalary:V2.db.players[pid]?.contract?.salary||0,purchaseYears:2,upfront:100,threshold:10,addOn:0};return d;}
function v2CaptureTransactions(){document.querySelectorAll('[data-transaction-form]').forEach(form=>{const pid=form.dataset.transactionForm;if(!V2.db.players[pid])return;const d=v2TransactionDraft(pid);form.querySelectorAll('[data-advanced]').forEach(el=>{d[el.dataset.advanced]=el.type==='checkbox'?el.checked:el.value})});}
function v2PlayerTransactions(p){const db=V2.db,t=v2Team();if(!t||db.world.fired||t.parent||!p?.team||!p.contract||p.retired)return '';const own=parentTeamOf(db,db.teams[p.team])?.id===t.id,loan=p.loan,d=v2TransactionDraft(p.id);let body='';
 if(loan){const owner=db.teams[loan.ownerId],borrower=db.teams[loan.borrowerId];if(![parentTeamOf(db,owner)?.id,parentTeamOf(db,borrower)?.id].includes(t.id))return '';body=`<p>계약 구단 ${v2Esc(owner?.name)} · 출전 구단 ${v2Esc(borrower?.name)} · ~${v2Esc(loan.endDate)}</p><p>임대료 ${v2Money(loan.fee)} · 임대 구단 급여 ${Math.round(loan.salaryShare*100)}%</p>${loan.purchase?`<p>${v2Esc(loan.purchase.type==='option'?'선택 매입':'의무 매입')} · ${v2Money(loan.purchase.fee)} · 연봉 ${v2Money(loan.purchase.salary)} · ${v2Esc(loan.purchase.years)}년</p><p>${v2Esc(v2FeeText(loan.purchase.feePlan))}</p>`:''}${loan.recall&&parentTeamOf(db,owner)?.id===t.id?'<button class="btn btn-outline" id="loan-return-review">조기 복귀 검토</button>':''}${loan.purchase?.type==='option'&&borrower?.id===t.id?'<button class="btn btn-outline" id="loan-purchase-review">매입 검토</button>':''}`;
 }else{const targets=own?activeTeams(db).filter(x=>parentTeamOf(db,x)?.id!==t.id&&loanMarketOpen(db,x)):[];if(own?targets.length:loanMarketOpen(db,t))body=`<form data-transaction-form="${v2Esc(p.id)}" onsubmit="return false">${own?v2TermSelect('target','임대 도착 구단',d.target||targets[0]?.id,targets.map(x=>[x.id,x.name])):''}${v2TermSelect('duration','임대 기간',d.duration,[['half','반 시즌'],['season','이번 시즌']])}${v2TermSelect('role','약속 역할',d.role,SQUAD_ROLES.map(r=>[r,SQUAD_ROLE_KO[r]]))}${v2TermNumber('share','임대 구단 급여 부담 · %',d.share,100)}${v2TermNumber('fee','임대료 · 억 원',d.fee)}<label class="field"><input type="checkbox" data-advanced="recall"${d.recall?' checked':''}>원소속 조기 리콜 허용</label><details><summary>임대 후 매입 조건</summary>${v2TermSelect('purchase','매입 방식',d.purchase,[['none','없음'],['option','선택 매입'],['obligation','만료 시 의무 매입']])}${v2TermNumber('purchaseFee','매입 이적료 · 억 원',d.purchaseFee)}${v2TermNumber('purchaseSalary','매입 후 연봉 · 억 원',d.purchaseSalary)}${v2TermNumber('purchaseYears','매입 후 기간 · 년',d.purchaseYears)}${v2FeeFields(d)}</details><button class="btn btn-primary" type="button" id="loan-offer-review">임대 조건 검토</button></form><p class="hint">선수와 양 구단의 기존 독립 동의·임대 기간/등록/예산 규칙을 따릅니다. 검토나 취소로 계약하지 않습니다.</p>`;}
 const mutual=own&&!loan?contractMutualTerminationTerms(db,p):null;if(mutual?.ok)body+=`<h3>상호 해지</h3><p>${v2Esc(mutual.reason)} · 계약 보장 ${v2Money(mutual.guaranteedAmount)}</p>${mutual.willing?`<label class="field">합의금 · 억 원<input class="input" type="number" min="${mutual.minimumAmount}" max="${mutual.guaranteedAmount}" step="any" id="mutual-amount" value="${v2Esc(d.mutual??mutual.minimumAmount)}"></label><button class="btn btn-outline" id="mutual-review">상호 해지 제안 검토</button>`:'<p>현재 선수 동의가 없습니다.</p>'}`;
 return body?`<section class="panel"><h2>임대·계약 결정</h2>${body}</section>`:'';
}
function v2ReviewPlayerTransaction(kind,pid=V2.pid){const db=V2.db,p=db.players[pid],t=v2Team();if(!p||!t||t.parent)return v2Tell('현재 선수와 관리 구단을 확인하세요');v2CaptureTransactions();const d=v2TransactionDraft(pid);let c,lines=[];
 if(kind==='loan'){const target=parentTeamOf(db,db.teams[p.team])?.id===t.id?(d.target||activeTeams(db).find(x=>parentTeamOf(db,x)?.id!==t.id&&loanMarketOpen(db,x))?.id):t.id,purchase=d.purchase==='none'?null:{type:d.purchase,fee:Number(d.purchaseFee),salary:Number(d.purchaseSalary),years:Number(d.purchaseYears),terms:{promisedRole:d.role},feePlan:v2FeePlan(d,Number(d.purchaseFee),loanEndDate(db,d.duration))};c={type:'player.loan',actor:'manager',pid,fromId:p.team,teamId:target,duration:d.duration,promisedRole:d.role,salaryShare:Number(d.share)/100,fee:Number(d.fee),recall:d.recall===true,purchase};}
 else if(kind==='return'&&p.loan){c={type:'player.loan-return',actor:'manager',pid,fromId:p.loan.borrowerId,teamId:p.loan.ownerId};lines=[p.name+' · 원소속 조기 복귀','기존 계약·자리·재정·등록 조건을 다시 확인합니다.'];}
 else if(kind==='purchase'&&p.loan){c={type:'player.loan-purchase',actor:'manager',pid,fromId:p.loan.ownerId,teamId:p.loan.borrowerId};lines=[p.name+' · 기존 선택 매입 행사',v2Money(p.loan.purchase?.fee)+' · '+v2FeeText(p.loan.purchase?.feePlan)];}
 else if(kind==='mutual'){const input=document.getElementById('mutual-amount'),amount=input?Number(input.value):Number(d.mutual);d.mutual=amount;c={type:'player.release',actor:'manager',pid,teamId:p.team,mode:'mutual',amount};lines=[p.name+' · 상호 해지 합의금 '+v2Money(amount),'선수의 기존 동의·최소 요구와 계약 보장·정산 조건을 확인합니다.'];}
 if(!c)return v2Tell('현재 임대·계약 상태를 다시 확인하세요');const plan=previewWorldAction(db,c);if(!plan.ok)return v2Tell(plan.errors.join(' · '));if(kind==='loan'){const q=plan.command,z=q.purchase;lines=[p.name+' → '+(db.teams[q.teamId]?.name||'도착 구단 확인'),'종료 '+q.endDate+' · '+SQUAD_ROLE_KO[q.promisedRole],'임대료 '+v2Money(q.fee)+' · 급여 '+Math.round(q.salaryShare*100)+'% · '+(q.recall?'리콜 허용':'리콜 없음'),z?(z.type==='option'?'선택 매입':'의무 매입')+' '+v2Money(z.fee)+' · 연봉 '+v2Money(z.salary)+' · '+z.years+'년 · '+v2FeeText(z.feePlan):'매입 조항 없음'];}if(kind==='mutual')lines[0]=p.name+' · 상호 해지 합의금 '+v2Money(plan.command.amount);v2ReviewManagement(plan.command,p.name+' · 계약 결정 검토',lines);
}
function v2OutgoingLoans(){const t=v2Team();if(!t||t.parent||V2.db.world.fired)return '';const rows=loanOutgoingPlayers(V2.db,t);return rows.length?`<section class="panel"><h2>임대 보낸 선수</h2>${rows.map(p=>`<p><button class="btn btn-outline" data-squad-player="${v2Esc(p.id)}">${v2Esc(p.name)} · ~${v2Esc(p.loan.endDate)}</button></p>`).join('')}</section>`:'';}
function v2BindTransactions(){const mutual=document.getElementById('mutual-amount'),current=v2Guard();if(mutual)mutual.oninput=()=>{if(current())v2TransactionDraft(V2.pid).mutual=mutual.value};for(const [id,kind] of [['loan-offer-review','loan'],['loan-return-review','return'],['loan-purchase-review','purchase'],['mutual-review','mutual']])v2Bind('#'+id,()=>v2ReviewPlayerTransaction(kind));document.querySelectorAll('[data-transaction-form] [data-advanced]').forEach(el=>el.addEventListener('input',v2CaptureTransactions));}

function v2ReadSellerFeePlan(){const n=v2OwnedNegotiation(V2.nid);if(!n)return null;const d=V2.sellerDrafts?.[n.id]||{};document.querySelectorAll('[data-seller-fee-form] [data-advanced]').forEach(el=>d[el.dataset.advanced]=el.value);V2.sellerDrafts??={};V2.sellerDrafts[n.id]={...d,stamp:v2NegotiationStamp(n),fee:Number(document.getElementById('seller-fee').value)};return v2FeePlan(d,V2.sellerDrafts[n.id].fee,V2.db.worldDate)}

// Received conditions and the contact name come from this negotiation's snapshot.
function v2NegotiationCounterparty(n){
 if(!n||v2OwnedNegotiation(n.id)!==n||n.stage==='club')return '';
 const name=typeof n.representative?.name==='string'&&n.representative.name.trim()?n.representative.name:'저장된 담당자 정보 없음',received=n.counter||n.demand,counter=!!n.counter&&n.history?.some(h=>h.result==='counter');
 return `<p class="small" data-negotiation-representative>${n.status==='open'?'협상 담당':'협상 당시 담당'} · ${v2Esc(name)}</p>${n.status==='open'&&['player','waiting'].includes(n.stage)?`<details data-counterparty-demand><summary>${counter?'선수 측 역제안':'선수 측 초기 요구'} 확인</summary><p class="hint">상대가 전달한 조건입니다. 작성 중이거나 제출한 내 제안과 비교하세요. 수락·최종 계약은 별도 절차입니다.</p><div data-counterparty-terms>${received?v2Terms(received):'<p class="hint">저장된 요구 조건을 확인할 수 없습니다.</p>'}</div>${n.stage==='player'&&received?`<button class="btn btn-outline" data-counterparty-use="${v2Esc(n.id)}"${manualNegotiationError(V2.db,n)?' disabled':''}>받은 조건으로 작성</button>`:''}</details>`:''}`;
}

function v2UseCounterpartyTerms(nid){
 const db=V2.db,n=v2OwnedNegotiation(nid),error=manualNegotiationError(db,n);if(error){v2Tell(error);return false;}
 if(V2.nid!==nid||n.status!=='open'||n.stage!=='player'||!(n.counter||n.demand)){v2Tell('현재 개인 조건 협상을 다시 확인하세요');return false;}
 const blocked=()=>V2.review||V2.official?.open||V2.managementReview||V2.roleReview||V2.advice;if(blocked()){v2Tell('현재 작업 창을 먼저 닫으세요');return false;}
 v2CaptureDrafts();const current=v2Guard(),stamp=v2NegotiationStamp(n),own=JSON.stringify(v2Draft(n));
 if(!confirm('작성 중인 조건을 상대가 전달한 조건으로 바꿀까요? 이후 제안 검토에서 직접 제출합니다.'))return false;
 if(!current()||blocked()||V2.nid!==nid||v2OwnedNegotiation(nid)!==n||manualNegotiationError(db,n)||n.status!=='open'||n.stage!=='player'||stamp!==v2NegotiationStamp(n)||own!==JSON.stringify(v2Draft(n))){v2Tell('조건이나 현재 권한이 바뀌었습니다. 다시 확인하세요.');return false;}
 const entry=V2.drafts[nid],before=entry.terms;try{entry.terms=JSON.parse(JSON.stringify(n.counter||n.demand));v2Tell('받은 조건을 작성란에 불러왔습니다. 제안 검토에서 직접 제출하세요.');v2Render();document.querySelector('[data-neg-form] [data-term="salary"]')?.focus({preventScroll:true});return true;}catch(error){entry.terms=before;console.error('Counterparty terms display failed',error);v2Tell('조건을 불러오지 못했습니다. 작성 중인 조건을 유지했습니다.');return false;}
}
