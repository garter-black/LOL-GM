// 기존 선수 판정과 계약 작성자를 유지한 수동 합의/최종 계약 경계.
function manualNegotiationError(db,n){
  const w=db.world,t=n&&db.teams[n.teamId],p=n&&db.players[n.pid],me=managedTeam(db);
  if(!w||!n||!t||!p||p.retired||t.active===false)return '협상 당사자를 확인할 수 없습니다';
  if(w.manage!=='manual'||w.fired||!me||me.parent)return '현재 감독 권한으로 계약을 결정할 수 없습니다';
  if(w.pendingOfficial&&(!manualContactPending(db)||w.pendingOfficial.queue[0].contact.id!==n.id))return '현재 감독 권한으로 계약을 결정할 수 없습니다';
  if(n.kind==='initial'){
    if(w.phase!=='initial_roster'||!setupTeamsForManager(db).some(x=>x.id===t.id))return '현재 창단 선수단의 협상이 아닙니다';
  }else if(w.phase==='initial_roster'||t.id!==me.id)return '현재 소유 구단의 협상이 아닙니다';
  return null;
}
function resolveNegotiationOffer(db,nid,terms){
  const n=db.world?.negotiations?.[nid],error=manualNegotiationError(db,n);
  if(error)return {ok:false,msg:error};
  if(n.status!=='open'||n.stage!=='player')return {ok:false,msg:'제출할 수 있는 선수 협상이 아닙니다'};
  // 실제 기존 판정을 격리된 상태에서 실행한다. 예산/자리의 예약은 만들지 않는다.
  const preview=JSON.parse(JSON.stringify(db)),result=submitNegotiationOffer(preview,nid,terms),next=preview.world.negotiations[nid];
  if(!result.ok||next.status!=='accepted')return submitNegotiationOffer(db,nid,terms);
  const agreed=JSON.parse(JSON.stringify(next.acceptedTerms));
  const pending={...next,status:'open',stage:'agreement',counter:null,agreedTerms:agreed,agreedDate:db.worldDate};
  delete pending.acceptedTerms;delete pending.closedDate;delete pending.agreement;
  pending.history=pending.history.map(h=>h.side==='player'&&h.result==='accept'?{...h,result:'agreed',terms:agreed}:h);
  db.world.negotiations[nid]=pending;
  return {ok:true,agreed:true,msg:db.players[n.pid].name+' 측이 조건을 수락했습니다 · 최종 계약은 직접 확정하세요'};
}
function finalizeStagedNegotiation(db,nid){
  const n=db.world?.negotiations?.[nid],error=manualNegotiationError(db,n);
  if(error)return {ok:false,msg:error};
  if(n.status!=='open'||n.stage!=='agreement'||!n.agreedTerms)return {ok:false,msg:'최종 확정할 합의가 없습니다'};
  const marketError=negotiationMarketDeadlineError(db,n);
  if(marketError)return {ok:false,msg:marketError};
  const deadline=negotiationContactDeadline(db,n);
  if(deadline&&negotiationClockAt(db)>=deadline)return {ok:false,msg:'기존 협상 마감이 지나 최종 계약을 확정할 수 없습니다'};
  const p=db.players[n.pid],t=db.teams[n.teamId],terms=n.agreedTerms;
  if(!contractGuaranteeTermsValid(terms))return {ok:false,msg:'유효하지 않은 계약 조건입니다'};
  if((n.kind==='fa'||n.kind==='initial')&&p.team)return {ok:false,msg:'선수가 이미 다른 계약을 체결했습니다'};
  if(n.kind==='renewal'&&p.team!==t.id)return {ok:false,msg:'선수의 소속 구단이 변경되었습니다'};
  if(['early_fa','renewal'].includes(n.kind)&&db.world?.phase==='offseason'&&db.world.contractWindow){
    const contact=contractWindowContactError(db,p,t,n.kind);if(contact)return {ok:false,msg:contact};
  }
  const budget=negotiationBudgetError(db,p,t,terms,n.kind);if(budget)return {ok:false,msg:budget};
  if(n.kind==='transfer'&&((terms.signingBonus||0)>Math.max(0,t.finance.cash-(n.feePlan?.upfront??n.fee??0))))return {ok:false,msg:'이적료 지급 후 계약금을 지급할 현금이 부족합니다'};
  const result=finalizeNegotiation(db,n,terms);
  if(result.ok)n.history.push({round:n.round,side:'club',result:'finalized',terms,date:db.worldDate});
  return result;
}

// 시각 조회는 이전 저장을 변경하지 않는다. 날짜 소비는 기존 달력 작성자를 사용한다.
function negotiationClockAt(db){
  const date=db.worldDate,stored=db.world?.negotiationClock;
  if(!freeAgencyDateValid(date))throw Error('협상 날짜를 확인할 수 없습니다');
  if(stored){
    if(typeof stored.at!=='string'||!Number.isFinite(Date.parse(stored.at))||new Date(stored.at).toISOString()!==stored.at)throw Error('협상 시각을 확인할 수 없습니다');
    if(stored.at.slice(0,10)>date)throw Error('협상 시각이 현재 날짜보다 늦습니다');
    if(stored.at.slice(0,10)===date)return officialGameClockFloor(db,stored.at);
  }
  return officialGameClockFloor(db,date+'T00:00:00.000Z');
}
// 완료된 타 지역 경기의 압축 저장에도 실제 숫자 소요 시간을 유지한다.
// 표시용 dur 문자열에서 시간을 복원하거나 누락 근거를 추정하지 않는다.
const seriesResultForSaveBeforeActualTime=seriesResultForSave;
seriesResultForSave=function(result,lite){
  const saved=seriesResultForSaveBeforeActualTime(result,lite);
  if(lite&&!result.lite)saved.games=saved.games.map((game,index)=>({...game,...(result.games[index].duration!=null?{duration:result.games[index].duration}:{})}));
  return saved;
};
// 넥서스 종료까지 실제 엔진이 소비한 분 단위 시간만 기록한다.
// 세트 사이 준비/휴식과 중계 종료 시간은 자료가 없어 만들어 넣지 않는다.
function officialGameTimeRecord(m,games){
  if(!Array.isArray(games)||games.some(g=>g.duration!=null&&(!Number.isFinite(g.duration)||g.duration<0)))throw Error('공식 경기의 실제 소요 시간을 확인할 수 없습니다');
  if(m.utcAt!=null&&(typeof m.utcAt!=='string'||!Number.isFinite(Date.parse(m.utcAt))||new Date(m.utcAt).toISOString()!==m.utcAt))throw Error('공식 경기 시작 시각을 확인할 수 없습니다');
  // 이전 저장의 누락된 시각/수치에는 새 시간을 추정하지 않는다.
  if(m.utcAt==null||Array.isArray(games)&&(!games.length||games.some(g=>g.duration==null)))return null;
  const start=officialActualStart(m),minutes=games.reduce((sum,g)=>sum+g.duration,0),end=Date.parse(start)+Math.round(minutes*60000);
  if(!Number.isFinite(end))throw Error('공식 경기 종료 시각을 확인할 수 없습니다');
  return {scheduledAt:m.utcAt,...(m.actualStart?{startedAt:start}:{}),gameTimeThrough:new Date(end).toISOString(),minutes,games:games.length};
}
// 원래 편성은 바꾸지 않는다. 실제로 끝난 앞 시리즈의 점유 근거만 순연에 쓴다.
function officialActualStart(m){
  const start=m.actualStart;
  if(!start)return m.utcAt;
  if(typeof start.at!=='string'||!Number.isFinite(Date.parse(start.at))||new Date(start.at).toISOString()!==start.at||start.at<=m.utcAt||!Array.isArray(start.after)||!start.after.length||start.after.some(x=>typeof x?.seasonKey!=='string'||typeof x?.matchId!=='string'||typeof x?.through!=='string')||start.at!==start.after.map(x=>x.through).sort().at(-1))throw Error('실제 경기 시작과 앞 경기의 종료 근거를 확인할 수 없습니다');
  return start.at;
}
function officialGameTimeSame(first,second){return !!first&&!!second&&['scheduledAt','startedAt','gameTimeThrough','minutes','games'].every(key=>first[key]===second[key]);}
function officialResourceKeys(db,s,m){
  const comp=db.competitions[s.comp];if(!comp)throw Error('공식 경기의 대회 자원을 확인할 수 없습니다');
  const keys=[comp.international?'broadcast:international':'broadcast:'+s.comp,'team:'+m.a,'team:'+m.b];
  // 개최 지역/시간대는 경기장 식별자가 아니다. 명시된 장소가 있을 때만 공유한다.
  const venue=m.venueId||s.venueId||comp.venueId;
  if(venue!=null){if(typeof venue!=='string'||!venue)throw Error('공식 경기의 장소를 확인할 수 없습니다');keys.push('venue:'+venue);}
  return keys;
}
function officialResourceEntries(db){
  return Object.entries(db.world.seasons||{}).flatMap(([key,s])=>(s.days||[]).flatMap(day=>day.matches.map(m=>({key,s,day,m}))));
}
function officialResourceStart(db,s,m,entries=officialResourceEntries(db)){
  const keys=officialResourceKeys(db,s,m),key=s.key||Object.entries(db.world.seasons).find(([,v])=>v===s)?.[0],order=(a,b)=>a.m.utcAt.localeCompare(b.m.utcAt)||a.key.localeCompare(b.key)||a.m.id.localeCompare(b.m.id),self={key,m},after=[];
  for(const ref of entries){
    if(ref.m===m||!ref.m.utcAt||order(ref,self)>=0||!officialResourceKeys(db,ref.s,ref.m).some(k=>keys.includes(k)))continue;
    if(!ref.m.res)return {blocked:true};
    const record=ref.m.gameTime;
    if(!record||record.gameTimeThrough<=m.utcAt)continue;
    const actual=officialGameTimeRecord(ref.m,ref.m.res.games||[]);
    if(!officialGameTimeSame(actual,record))throw Error('앞 경기의 실제 종료 기록을 확인할 수 없습니다');
    after.push({seasonKey:ref.key,matchId:ref.m.id,through:record.gameTimeThrough});
  }
  after.sort((a,b)=>a.seasonKey.localeCompare(b.seasonKey)||a.matchId.localeCompare(b.matchId));
  return {at:after.length?after.map(x=>x.through).sort().at(-1):m.utcAt,after};
}
function officialResourceStartCheck(db,s,m){
  officialActualStart(m);if(!m.actualStart)return;
  const refs=officialResourceEntries(db),keys=officialResourceKeys(db,s,m);
  const seen=new Set();for(const cause of m.actualStart.after){const id=cause.seasonKey+'|'+cause.matchId,ref=refs.find(x=>x.key===cause.seasonKey&&x.m.id===cause.matchId);if(seen.has(id)||!ref?.m.res||ref.m===m||ref.m.gameTime?.gameTimeThrough!==cause.through||!officialGameTimeSame(officialGameTimeRecord(ref.m,ref.m.res.games||[]),ref.m.gameTime)||!officialResourceKeys(db,ref.s,ref.m).some(k=>keys.includes(k))||cause.through<=m.utcAt||ref.m.utcAt>m.utcAt)throw Error('저장된 경기 순연의 자원 근거가 다릅니다');seen.add(id);}
}
function recordOfficialResourceStart(m,plan){
  if(plan.blocked)throw Error('앞 공식 경기의 종료를 기다리고 있습니다');
  if(plan.at>m.utcAt)m.actualStart={at:plan.at,after:plan.after};
}
function officialResourcePendingCheck(db,refs,q){
  officialResourceStartCheck(db,refs.s,refs.m);
  if(!q.inflight&&!q.session?.games?.length){const plan=officialResourceStart(db,refs.s,refs.m);if(plan.blocked||plan.at!==officialActualStart(refs.m))throw Error('앞 공식 경기의 종료와 현재 경기 시작을 다시 확인하세요');}
}
function officialGameClockFloor(db,at){
  const floor=db.world?.officialGameTimeThrough;
  if(!floor)return at;
  if(typeof floor!=='string'||!Number.isFinite(Date.parse(floor))||new Date(floor).toISOString()!==floor)throw Error('저장된 공식 경기 소비 시각을 확인할 수 없습니다');
  return floor>at?floor:at;
}
function recordOfficialGameTime(db,m,record){
  if(!record)return;
  m.gameTime=record;
  // 기존 일괄 작성자가 미리 계산한 다른 경기 때문에 수동 준비를 건너뛰지 않는다.
  const w=db.world,me=w.manage==='manual'&&!w.fired?managedTeamId(db):null;
  if(me&&m.a!==me&&m.b!==me&&Object.values(w.seasons||{}).some(s=>(s.days||[]).some(d=>d.matches.some(next=>!next.res&&(next.a===me||next.b===me)&&next.utcAt&&next.utcAt<record.gameTimeThrough))))return;
  db.world.officialGameTimeThrough=officialGameClockFloor(db,record.gameTimeThrough);
}
const officialCommitBeforeClock=commitScheduledSeries;
commitScheduledSeries=function(db,s,m,series){
  // 중복 결과와 잘못된 입력은 기존 결과/재정/사용 기록 작성 전에 거절한다.
  if(m.res)return officialCommitBeforeClock(db,s,m,series);
  officialGameClockFloor(db,m.utcAt);
  const record=officialGameTimeRecord(m,series.rec.games||[]);
  const result=officialCommitBeforeClock(db,s,m,series);
  recordOfficialGameTime(db,m,record);return result;
};
const officialResolveBeforeClock=resolvePendingOfficialMatch;
resolvePendingOfficialMatch=function(db,forcedDraft){
  const q=db.world?.pendingOfficial?.queue?.[0],refs=q&&pendingOfficialRefs(db,q);
  if(refs){officialGameClockFloor(db,refs.m.utcAt);officialGameTimeRecord(refs.m,q.session?.games||[]);}
  const result=officialResolveBeforeClock(db,forcedDraft);
  if(refs&&!result.done&&!result.succession)recordOfficialGameTime(db,refs.m,officialGameTimeRecord(refs.m,q.session.games));
  return result;
};
const officialPlayDayBeforeClock=playDay;
// 진행 중인 다른 경기의 다음 게임은 실제 종료 때만 관측/결과에 반영한다.
// 미래 세계 전체를 덮어쓰지 않고, 해당 게임의 기존 세션과 관측 입력만 보존한다.
function officialClockState(db){
  return Object.values(db.world?.seasons||{}).flatMap(s=>(s.days||[]).flatMap(d=>d.matches)).filter(m=>m.clockGame||m.clockSession).map(m=>[m.id,m.clockSession?.games.length||0,m.clockGame?.endAt||null]);
}
function officialGameObservation(r){
  return JSON.parse(JSON.stringify({winner:r.winner,date:r.date,patch:r.patch,comp:r.comp,metaContext:r.metaContext,
    draft:{bans:r.draft.bans,sequence:r.draft.sequence},sides:r.sides.map(s=>({
      team:{id:s.team.id,region:s.team.region,staffRoster:teamStaffMembers(s.team)},color:s.color,tacticContext:s.tacticContext,
      ps:s.ps.map(p=>({champ:{id:p.champ.id},p:{id:p.p.id},role:p.role,items:p.items,questBoots:p.questBoots,runes:p.runes}))}))}));
}
function officialQueuedGameError(db,s,m,event){
  officialResourceStartCheck(db,s,m);
  const session=event?.session;
  if(!session||session.a!==m.a||session.b!==m.b||session.bestOf!==m.bo||session.seed!==`${s.seed}/${s.year}/${m.id}`||session.opt?.compId!==s.comp||session.opt?.metaContext?.season!==s.id)throw Error('진행 중인 다른 경기와 공식 편성이 다릅니다');
  const record=officialGameTimeRecord(m,session.games);
  if(!record||event.endAt!==record.gameTimeThrough||session.games.length!==(m.clockSession?.games.length||0)+1||event.observation?.date!==(officialGameTimeRecord(m,m.clockSession?.games||[])?.gameTimeThrough||officialActualStart(m)).slice(0,10))throw Error('진행 중인 다른 게임의 종료 기록을 확인할 수 없습니다');
  const game=session.games.at(-1),observation=event.observation;
  if(s.patchLock&&[game.patch,game.publicRecord?.patch,observation.patch].some(id=>id!==internationalMatchPatch(db,s).id))throw Error('국제대회 개막 패치와 저장된 게임의 패치가 다릅니다');
  if(game.publicRecord?.ending?.kind!=='nexus'||game.publicRecord.ending.winner!==game.winner||game.publicRecord.winner!==game.winner||game.publicRecord.duration!==game.duration||game.publicRecord.ending.minute+game.publicRecord.ending.second/60!==game.duration)throw Error('실제 넥서스 종료 기록을 확인할 수 없습니다');
  if(![0,1].includes(observation.winner)||observation.sides?.length!==2||observation.sides[0].team?.id!==game.blue||observation.sides[1].team?.id!==game.red||[game.blue,game.red][observation.winner]!==game.winner||observation.comp!==s.comp||observation.metaContext?.season!==s.id)throw Error('진행 중인 게임과 관측 입력이 다릅니다');
  if(!Array.isArray(observation.draft?.bans)||observation.draft.bans.length!==2||observation.draft.bans.some(xs=>!Array.isArray(xs)||xs.some(id=>typeof id!=='string'))||observation.sides.some(side=>!Array.isArray(side.ps)||side.ps.length!==ROLES.length||side.ps.some(p=>typeof p?.champ?.id!=='string'||typeof p?.p?.id!=='string'||!Array.isArray(p.items)||!Array.isArray(p.runes))))throw Error('저장된 게임의 관측 입력을 확인할 수 없습니다');
  if([m.a,m.b].some(id=>!db.teams[id]||db.teams[id].active===false)||db.world.phase!=='season'||db.world.year!==s.year)throw Error('진행 중인 다른 경기의 현재 참가 권한을 확인할 수 없습니다');
  return record;
}
function officialClockSessionCheck(s,m){
  if(m.clockSession){
    const record=officialGameTimeRecord(m,m.clockSession.games);
    if(m.gameTime&&(!record||['scheduledAt','gameTimeThrough','minutes','games'].some(key=>m.gameTime[key]!==record[key])))throw Error('저장된 세션의 실제 소비 시각이 다릅니다');
  }
  if(m.clockSession&&(m.clockSession.a!==m.a||m.clockSession.b!==m.b||m.clockSession.bestOf!==m.bo||m.clockSession.seed!==`${s.seed}/${s.year}/${m.id}`||m.clockSession.opt?.compId!==s.comp||m.clockSession.opt?.metaContext?.season!==s.id||m.clockSession.g!==m.clockSession.games?.length+1))throw Error('저장된 진행 세션과 현재 공식 편성이 다릅니다');
}
// 경기 준비에서 읽는 과거 결과·고정 자료는 원본 쓰기를 막고 공유한다.
// 변경 가능한 선수/구단/관측 집계와 새 관측 목록은 별도로 격리한다.
const OFFICIAL_CLOCK_READONLY=new WeakMap();
function officialClockReadonly(value){
  if(!value||typeof value!=='object')return value;
  let found=OFFICIAL_CLOCK_READONLY.get(value);if(found)return found;
  const target=Array.isArray(value)?[]:{},reject=()=>{throw Error('경기 준비의 조회 자료를 변경할 수 없습니다');};
  found=new Proxy(target,{
    get(_target,key){return officialClockReadonly(Reflect.get(value,key));},
    has(_target,key){return Reflect.has(value,key);},
    ownKeys(){return Reflect.ownKeys(value);},
    getOwnPropertyDescriptor(_target,key){
      if(Array.isArray(value)&&key==='length')return {...Reflect.getOwnPropertyDescriptor(target,key),value:value.length};
      const descriptor=Reflect.getOwnPropertyDescriptor(value,key);return descriptor?{configurable:true,enumerable:descriptor.enumerable,writable:false,value:officialClockReadonly(Reflect.get(value,key))}:undefined;
    },set:reject,deleteProperty:reject,defineProperty:reject,setPrototypeOf:reject,preventExtensions:reject
  });
  OFFICIAL_CLOCK_READONLY.set(value,found);return found;
}
const OFFICIAL_CLOCK_FIXED=new WeakMap();
function officialClockFixed(value){
  if(!value||typeof value!=='object')return value;
  const raw=JSON.stringify(value),previous=OFFICIAL_CLOCK_FIXED.get(value);if(previous?.raw===raw)return previous.copy;
  const copy=JSON.parse(raw),freeze=o=>{if(o&&typeof o==='object'){for(const v of Object.values(o))freeze(v);Object.freeze(o);}};
  freeze(copy);OFFICIAL_CLOCK_FIXED.set(value,{raw,copy});return copy;
}
function officialClockPreview(db,teamIds=null){
  // A prepared foreign game may write only its participating squads. Other
  // players/teams remain guarded read-only inputs; the full path stays for
  // general callers. No rollback graph or historical validation is omitted.
  const participants=teamIds&&new Set(teamIds),pids=participants&&new Set(teamIds.flatMap(id=>db.teams[id]?.roster||[]));
  const mutable=JSON.parse(JSON.stringify({players:participants?Object.fromEntries([...pids].filter(id=>db.players[id]).map(id=>[id,db.players[id]])):db.players,teams:participants?Object.fromEntries(teamIds.filter(id=>db.teams[id]).map(id=>[id,db.teams[id]])):db.teams,metaStats:db.metaStats,regionMetaStats:db.regionMetaStats,regionMetaGames:db.regionMetaGames}));
  if(participants){
    mutable.players=Object.fromEntries(Object.entries(db.players).map(([id,p])=>[id,mutable.players[id]||officialClockReadonly(p)]));
    mutable.teams=Object.fromEntries(Object.entries(db.teams).map(([id,t])=>[id,mutable.teams[id]||officialClockReadonly(t)]));
  }
  const copy=Object.fromEntries(Object.entries(db).map(([key,value])=>[key,Object.hasOwn(mutable,key)?mutable[key]:officialClockReadonly(value)]));
  copy.patch=officialClockFixed(db.patch);copy.metaHistory=(db.metaHistory||[]).map(officialClockFixed);return copy;
}
function prepareOfficialClockGame(db,s,m){
  const me=db.world.manage==='manual'&&!db.world.fired?managedTeamId(db):null;
  if(me&&(m.a===me||m.b===me))throw Error('현재 감독의 경기에는 다른 구단의 자동 입력을 적용할 수 없습니다');
  if(m.clockGame){officialQueuedGameError(db,s,m,m.clockGame);return;}
  officialClockSessionCheck(s,m);
  const copy=officialClockPreview(db,[m.a,m.b]),session=JSON.parse(JSON.stringify(m.clockSession||scheduledSeriesSession(copy,officialClockReadonly(s),officialClockReadonly(m)).session));
  const played=playSeriesSessionGame(copy,session,null,true),record=officialGameTimeRecord(m,session.games);
  m.clockGame={endAt:record.gameTimeThrough,session,observation:officialGameObservation(played.game)};
  officialQueuedGameError(db,s,m,m.clockGame);
}
function consumeOfficialClockGame(db,s,m){
  const me=db.world.manage==='manual'&&!db.world.fired?managedTeamId(db):null;
  if(me&&(m.a===me||m.b===me))throw Error('현재 감독의 경기에는 다른 구단의 자동 입력을 적용할 수 없습니다');
  const event=m.clockGame,record=officialQueuedGameError(db,s,m,event);
  // 실제 종료 때 기존 작성자만 소비한다. 시작 때 격리한 세계를 덮어쓰지 않는다.
  recordMeta(db,event.observation);m.clockSession=event.session;delete m.clockGame;
  recordOfficialGameTime(db,m,record);
  if(seriesSessionDone(m.clockSession)){
    commitScheduledSeries(db,s,m,seriesSessionResult(db,m.clockSession));delete m.clockSession;
  }
}
function playOfficialGamesThrough(db,s,m,boundary){
  if(typeof boundary!=='string'||!Number.isFinite(Date.parse(boundary))||new Date(boundary).toISOString()!==boundary)throw Error('공식 경기 진행 경계 시각을 확인할 수 없습니다');
  const me=db.world.manage==='manual'&&!db.world.fired?managedTeamId(db):null;
  if(me&&(m.a===me||m.b===me))throw Error('현재 감독의 경기에는 다른 구단의 자동 입력을 적용할 수 없습니다');
  // This boundary call is atomic on failure, including earlier sets consumed
  // inside it. Sets committed before entry keep their original identities.
  const undo=pendingOfficialUndo(db);
  try{while(!m.res){
      prepareOfficialClockGame(db,s,m);
      if(m.clockGame.endAt>boundary)return false;
      const end=m.clockGame.endAt;consumeOfficialClockGame(db,s,m);
      if(m.res)return true;
      if(end>=boundary)return false;
  }return true;}catch(error){undo();throw error;}
}
function officialClockStartUndo(db,m){
  // 시작 준비는 격리된 자료만 변경한다. 실제 세계 작성은 이 두 필드뿐이다.
  const world=db.world,clock=Object.getOwnPropertyDescriptor(world,'negotiationClock'),game=Object.getOwnPropertyDescriptor(m,'clockGame'),start=Object.getOwnPropertyDescriptor(m,'actualStart');
  return ()=>{if(clock)Object.defineProperty(world,'negotiationClock',clock);else delete world.negotiationClock;if(game)Object.defineProperty(m,'clockGame',game);else delete m.clockGame;if(start)Object.defineProperty(m,'actualStart',start);else delete m.actualStart;};
}
// 대회 객체 나열 순서 대신 실제 시작·게임 종료·판단 연락을 함께 비교한다.
function playOfficialWorldEvents(db,date,manualEnd=null){
  const w=db.world,me=w.manage==='manual'&&!w.fired?managedTeamId(db):null;
  let days=Object.entries(w.seasons||{}).filter(([,s])=>!s.done&&s.days[s.cur]?.date===date)
    .map(([key,s])=>({key,s,day:s.days[s.cur]})).sort((a,b)=>a.key.localeCompare(b.key));
  const requested=days.flatMap(({day})=>day.matches);
  const currentDays=()=>Object.entries(w.seasons||{}).filter(([,s])=>!s.done&&s.days[s.cur]?.date<=db.worldDate).map(([key,s])=>({key,s,day:s.days[s.cur]})).sort((a,b)=>a.key.localeCompare(b.key));
  const remaining=()=>days.flatMap(d=>d.day.matches.filter(m=>!m.res&&m!==manualEnd?.match).map(m=>({...d,m})));
  const matches=remaining();
  if(!days.length||matches.some(({m})=>m.utcAt==null))return null;
  negotiationClockAt(db);
  for(const {s,m} of matches){officialGameTimeRecord(m,[]);officialClockSessionCheck(s,m);if(m.clockGame)officialQueuedGameError(db,s,m,m.clockGame);if(me&&(m.a===me||m.b===me)&&(m.clockGame||m.clockSession))throw Error('진행 중인 다른 구단의 경기입니다. 현재 감독 경기로 자동 전환하지 않습니다');}
  const n=(manualEnd?waitingNegotiationResponses(db).filter(n=>n.teamId===me):waitingNegotiationResponses(db,true))[0];
  if(n){const error=negotiationResponseError(n);if(error)throw Error(error);if(n.response.dueAt<date+'T00:00:00.000Z')return null;}
  const advanced=date>=db.worldDate?applyWorldDailyEffects(db,date):false,played=days.map(({s,day})=>({s,day}));
  const finish=(carryOnly=false)=>{
    const complete=days.filter(({s,day})=>day.matches.every(m=>m.res)&&(!carryOnly||s.days[s.cur+1]?.date<=db.worldDate));if(!complete.length)return;
    const undo=pendingOfficialUndo(db);
    try{
      for(const {s,day} of complete){
        const comp=db.competitions[s.comp],idx=comp.stages.findIndex(x=>x.id===day.stage);
        if(finalizeCompetitionDay(db,s,day,idx,comp.stages[idx]))scoutFromDay(db,s,day);
      }
    }catch(error){undo();throw error;}
  };
  while(true){
    // Finish the requested fixture day and its started games. A midnight
    // carry must not eagerly consume every later fixture day in the season.
    if(requested.every(m=>m.res)){finish();if(!activeSeasons(db).length)advanceStep(db);return {date,played,pending:w.pendingOfficial,advanced};}
    const entries=officialResourceEntries(db),events=remaining().flatMap(ref=>{
      const {m}=ref,owned=me&&(m.a===me||m.b===me);
      if(owned&&(m.clockGame||m.clockSession))throw Error('진행 중인 다른 구단의 경기입니다. 현재 감독 경기로 자동 전환하지 않습니다');
      officialResourceStartCheck(db,ref.s,m);
      const started=m.clockGame||m.clockSession,plan=started?null:officialResourceStart(db,ref.s,m,entries);if(plan?.blocked)return [];
      return [{...ref,plan,kind:m.clockGame?'end':owned?'manual':'start',priority:m.clockGame?0:owned?2:3,
        at:m.clockGame?.endAt||officialGameTimeRecord(m,m.clockSession?.games||[])?.gameTimeThrough||plan?.at||officialActualStart(m)}];
    });
    if(manualEnd)events.push({kind:'manualEnd',priority:0,at:manualEnd.at,key:manualEnd.key,m:manualEnd.match});
    const contact=(manualEnd?waitingNegotiationResponses(db).filter(n=>n.teamId===me):waitingNegotiationResponses(db,true))[0];
    const midnight=addDays(db.worldDate,1)+'T00:00:00.000Z',through=events.map(e=>e.at).sort().at(-1)||midnight;
    if(contact&&(contact.response.dueAt<midnight||contact.response.dueAt<=through))events.push({kind:'contact',priority:1,at:contact.response.dueAt,key:contact.id});
    events.sort((a,b)=>a.at.localeCompare(b.at)||a.priority-b.priority||a.key.localeCompare(b.key)||String(a.m?.id||'').localeCompare(String(b.m?.id||'')));
    let event=events[0];if(event&&event.at>=midnight)event={kind:'midnight',at:midnight};if(!event){if(remaining().length)throw Error('앞 공식 경기의 점유가 해소되지 않았습니다. 현재 경기와 저장을 확인하세요');finish();if(!activeSeasons(db).length)advanceStep(db);return {date,played,pending:w.pendingOfficial,advanced};}
    const succession=['start','manual'].includes(event.kind)?qualificationSuccessionPlan(officialClockReadonly(db),officialClockReadonly(event.s),officialClockReadonly(event.m)):null;
    const forfeit=!succession&&['start','manual'].includes(event.kind)&&!event.m.clockSession?scheduledRegistrationForfeit(officialClockReadonly(db),officialClockReadonly(event.s),officialClockReadonly(event.m)):null;
    const undo=event.kind==='start'&&!forfeit&&!succession?officialClockStartUndo(db,event.m):pendingOfficialUndo(db);
    let gameConsumed=false;
    try{
      // 이전 저장의 이미 소비된 하한은 되감지 않는다.
      const current=negotiationClockAt(db),at=event.at<current?current:event.at;
      if(event.kind==='midnight'){
        finish();w.officialCalendarThrough=event.at.slice(0,10);applyWorldDailyEffects(db,w.officialCalendarThrough);if(me)w.negotiationClock={at:event.at};days=currentDays();for(const {s,day} of days)if(!played.some(x=>x.day===day))played.push({s,day});continue;
      }
      if(me&&event.kind!=='manualEnd')w.negotiationClock={at};
      if(event.kind==='contact'){
        const response=manualEnd?receiveManualEndedContact(db):resolveDueNegotiationResponse(db);finish();
        return {date,played,pending:{kind:'negotiation',id:contact.id},advanced,...response};
      }
      if(event.kind==='manualEnd')return manualEnd.consume();
      if(event.kind==='end'){consumeOfficialClockGame(db,event.s,event.m);gameConsumed=true;finish(true);days=currentDays();for(const {s,day} of days)if(!played.some(x=>x.day===day))played.push({s,day});continue;}
      if(succession){commitQualificationSuccession(db,event.s,event.m,succession);continue;}
      if(forfeit){commitScheduledSeries(db,event.s,event.m,forfeit);continue;}
      if(event.plan)recordOfficialResourceStart(event.m,event.plan);
      if(event.kind==='manual'){
        if(manualEnd)throw Error('다른 수동 경기의 준비가 현재 게임 종료보다 먼저 겹칩니다. 현재 일정을 확인하세요');
        const fixtureDate=event.day.date;w.pendingOfficial={date:fixtureDate,queue:[{seasonKey:event.key,matchId:event.m.id,date:fixtureDate}]};finish();
        return {date,played,pending:w.pendingOfficial,advanced};
      }
      prepareOfficialClockGame(db,event.s,event.m);
    }catch(error){if(!gameConsumed)undo();throw error;}
  }
}
playDay=function(db,s,opt={}){
  if(!s||s.done||(!opt.deferTeam&&!s.days[s.cur].matches.some(m=>m.clockGame||m.clockSession)))return officialPlayDayBeforeClock(db,s,opt);
  const day=s.days[s.cur],w=db.world;
  const pending=Object.values(w.seasons||{}).filter(next=>!next.done&&next.days[next.cur]?.date===day.date)
    .flatMap(next=>next.days[next.cur].matches).filter(m=>!m.res&&(m.a===opt.deferTeam||m.b===opt.deferTeam));
  const contact=w.phase==='season'&&opt.deferTeam===managedTeamId(db)?waitingNegotiationResponses(db,true)[0]:null;
  if(contact){const error=negotiationResponseError(contact);if(error)throw Error(error);}
  const running=day.matches.some(m=>m.clockGame||m.clockSession);
  if((!pending.length&&!contact&&!running)||pending.some(m=>m.utcAt==null)||day.matches.some(m=>!m.res&&m.utcAt==null))return officialPlayDayBeforeClock(db,s,opt);
  // 날짜만 남은 이전 저장은 원래 작성자가 처리한다. 현재 시각의 오류는 작성 전 거절한다.
  for(const m of [...pending,...day.matches.filter(m=>!m.res)])officialGameTimeRecord(m,[]);
  const boundary=[...pending.map(m=>m.utcAt),...(contact?[contact.response.dueAt]:[])].sort()[0]||'9999-12-31T23:59:59.999Z',comp=db.competitions[s.comp],cfgIdx=comp.stages.findIndex(x=>x.id===day.stage),cfg=comp.stages[cfgIdx],queue=[];
  for(const m of day.matches){
    if(m.res)continue;
    const succession=qualificationSuccessionPlan(db,s,m);if(succession)commitQualificationSuccession(db,s,m,succession);
    if(m.a===opt.deferTeam||m.b===opt.deferTeam){
      if(m.clockGame||m.clockSession)throw Error('진행 중인 다른 구단의 경기입니다. 현재 감독 경기로 자동 전환하지 않습니다');
      if(contact&&m.utcAt>=contact.response.dueAt)continue;
      const forfeit=scheduledRegistrationForfeit(db,s,m);
      if(forfeit)commitScheduledSeries(db,s,m,forfeit);else queue.push({matchId:m.id});
      continue;
    }
    // 늦게 시작할 경기는 결과·사용/의료 효과·관측을 아직 작성하지 않는다.
    if(m.utcAt>=boundary)continue;
    const forfeit=m.clockGame||m.clockSession?null:scheduledRegistrationForfeit(db,s,m);
    if(forfeit)commitScheduledSeries(db,s,m,forfeit);
    else playOfficialGamesThrough(db,s,m,boundary);
  }
  return {day,pending:queue,finalized:finalizeCompetitionDay(db,s,day,cfgIdx,cfg)};
};
function negotiationResponsePlan(db,n,terms){
  const preview=JSON.parse(JSON.stringify(db)),result=resolveNegotiationOffer(preview,n.id,terms),next=preview.world.negotiations[n.id];
  const changed=JSON.stringify(next)!==JSON.stringify(n);
  if(!changed)return {ok:false,msg:result.msg};
  const immediate=next.stage==='agreement'&&n.maxRounds===2;
  const slow=next.stage!=='agreement'||negotiationCompetition(db,db.players[n.pid],db.teams[n.teamId],null,n.kind).length>0;
  const rng=new RNG(db.world.seed+'/'+n.id+'/'+(n.round+1),'response-time');
  const hours=immediate?0:slow?rng.int(24,72):rng.int(2,8);
  const submittedAt=negotiationClockAt(db),dueAt=new Date(Date.parse(submittedAt)+hours*3600000).toISOString();
  return {ok:true,immediate,hours,submittedAt,dueAt,terms:JSON.parse(JSON.stringify(terms))};
}
function stageNegotiationOffer(db,nid,terms){
  const n=db.world?.negotiations?.[nid],error=manualNegotiationError(db,n);
  if(error)return {ok:false,msg:error};
  if(n.status!=='open'||n.stage!=='player')return {ok:false,msg:'대기 중인 제안은 취소한 뒤 다시 제출하세요'};
  const plan=negotiationResponsePlan(db,n,terms);if(!plan.ok)return plan;
  const deadline=negotiationContactDeadline(db,n);
  if(deadline&&plan.dueAt>=deadline)return {ok:false,msg:'응답 예정 시각이 기존 협상 마감에 도달합니다. 이번 제안은 제출하지 않았습니다'};
  if(plan.immediate)return resolveNegotiationOffer(db,nid,terms);
  n.stage='waiting';n.response={submittedAt:plan.submittedAt,dueAt:plan.dueAt,terms:plan.terms,round:n.round+1};
  n.history.push({round:n.round+1,side:'club',result:'submitted',terms:plan.terms,date:db.worldDate,at:plan.submittedAt,dueAt:plan.dueAt});
  const shown=venueClockParts(plan.dueAt,'Asia/Seoul');
  return {ok:true,waiting:true,dueAt:plan.dueAt,msg:'제안을 접수했습니다 · 선수 응답 예정 '+shown.date+' '+shown.time+' (한국 시간) · 최종 계약은 직접 확정하세요'};
}
function waitingNegotiationResponses(db,ownedOnly=false){
  return Object.values(db.world?.negotiations||{}).filter(n=>n.status==='open'&&n.stage==='waiting'&&n.response)
    .filter(n=>!ownedOnly||!manualNegotiationError(db,n))
    .sort((a,b)=>String(a.response.dueAt).localeCompare(String(b.response.dueAt))||String(a.id).localeCompare(String(b.id)));
}
const seasonProjectionRequests=new WeakSet(),seasonStartFloors=new WeakMap();
function negotiationContactDeadline(db,n){
  const w=db.world,cw=w?.contractWindow,market=negotiationMarketDeadline(n),earlier=date=>market&&market<date?market:date;
  if(w?.phase==='offseason'&&['renewal','early_fa'].includes(n.kind)&&cw?.stage==='exclusive')return earlier(cw.outsideContactDate+'T00:00:00.000Z');
  if(!['initial_roster','market','preseason'].includes(w?.phase))return market;
  // 기존 시즌 작성자를 격리된 상태에서 실행해 실제 편성의 개최일을 읽는다.
  const copy=JSON.parse(JSON.stringify(db));seasonProjectionRequests.add(copy);
  try{startWorldSeason(copy,managedTeamId(copy),w.seed)}finally{seasonProjectionRequests.delete(copy)}
  const starts=Object.values(copy.world.seasons).flatMap(s=>s.days.flatMap(d=>d.matches.map(m=>{
    if(!m.localDate||!m.timeZone)throw Error('공식 경기의 개최일과 시간대를 확인할 수 없습니다');
    return venueToUtc(m.localDate,'00:00',m.timeZone);
  })));
  if(!starts.length)throw Error('기존 개막 편성에서 협상 마감을 확인할 수 없습니다');
  return earlier(starts.sort()[0]);
}
function negotiationResponseError(n){
  const r=n.response;
  if(!r||typeof r.dueAt!=='string'||!Number.isFinite(Date.parse(r.dueAt))||new Date(r.dueAt).toISOString()!==r.dueAt)return '응답 예정 시각을 확인할 수 없습니다';
  if(!Number.isInteger(r.round)||r.round!==n.round+1)return '제출 당시 협상 회차가 바뀌었습니다. 제안을 취소하고 현재 조건을 다시 확인하세요';
  return null;
}
function resolveDueNegotiationResponse(db){
  const now=negotiationClockAt(db),n=waitingNegotiationResponses(db,true).find(n=>n.response.dueAt<=now);
  if(!n)return null;
  const response=n.response,error=manualNegotiationError(db,n);
  if(error)return {ok:false,blocked:true,msg:error};
  const responseError=negotiationResponseError(n);if(responseError)return {ok:false,blocked:true,msg:responseError};
  const marketError=negotiationMarketDeadlineError(db,n);
  if(marketError)return {ok:false,blocked:true,msg:marketError};
  // 제출 시점의 판정을 적용하지 않고 실제 응답 시점의 상태를 재검사한다.
  n.stage='player';delete n.response;
  const before=n.history.length,result=resolveNegotiationOffer(db,n.id,response.terms),current=db.world.negotiations[n.id];
  if(current.history.length===before){
    current.history.push({round:response.round,side:'player',result:'response_unavailable',date:db.worldDate,at:now,reason:result.msg});
  }else for(const row of current.history.slice(before)){row.date=db.worldDate;row.at=now;}
  return {...result,response:true,negotiationId:n.id,msg:result.msg};
}
function commitNegotiationTime(db,copy){
  const world=db.world,nextWorld=copy.world,oldTeam=managedTeam(db),nextTeam=copy.teams[oldTeam?.id];
  if(oldTeam&&nextTeam){for(const key of Object.keys(oldTeam))delete oldTeam[key];Object.assign(oldTeam,nextTeam);copy.teams[oldTeam.id]=oldTeam;}
  if(JSON.stringify(copy.manager)===JSON.stringify(db.manager))copy.manager=db.manager;
  delete copy.world;for(const key of Object.keys(db))if(key!=='world')delete db[key];Object.assign(db,copy);for(const key of Object.keys(world))delete world[key];Object.assign(world,nextWorld);
}
function advanceNegotiationTime(db){
  const w=db.world,t=managedTeam(db);
  if(!w||!t||t.active===false||t.parent||w.manage!=='manual'||w.fired||w.pendingOfficial)return {ok:false,msg:'현재 감독 권한으로 시간을 진행할 수 없습니다'};
  if(!['initial_roster','market','preseason','offseason'].includes(w.phase))return {ok:false,msg:'현재 화면에서 협상 시간을 직접 진행할 수 없습니다'};
  const pending=waitingNegotiationResponses(db,true);if(!pending.length)return {ok:false,msg:'응답을 기다리는 현재 구단의 제안이 없습니다'};
  const responseError=negotiationResponseError(pending[0]);if(responseError)return {ok:false,msg:responseError};
  const now=negotiationClockAt(db),nextMidnight=addDays(db.worldDate,1)+'T00:00:00.000Z',due=pending[0].response.dueAt;
  if(!Number.isFinite(Date.parse(due)))return {ok:false,msg:'응답 예정 시각을 확인할 수 없습니다'};
  const copy=JSON.parse(JSON.stringify(db)),target=due<=now?now:due<nextMidnight?due:nextMidnight;
  if(target===nextMidnight){
    let result;
    if(w.phase==='offseason')result=w.contractWindow?.stage==='exclusive'?negotiationExclusiveDayBeforeClock(copy):negotiationFreeAgencyDayBeforeClock(copy);
    else {applyWorldDailyEffects(copy,target.slice(0,10));result={ok:true};}
    if(!result?.ok)return result;
  }
  copy.world.negotiationClock={at:target};
  const result=resolveDueNegotiationResponse(copy);
  if(result?.blocked)return result;
  commitNegotiationTime(db,copy);
  return result||{ok:true,advanced:true,msg:'협상 시간 진행 · '+target};
}
function advanceToNegotiationResponse(db){
  const copy=JSON.parse(JSON.stringify(db));let result;
  if(copy.world?.phase==='season'){
    const t=managedTeam(copy);
    if(!t||t.active===false||t.parent||copy.world.manage!=='manual'||copy.world.fired||copy.world.pendingOfficial)return {ok:false,msg:'현재 감독 권한으로 시간을 진행할 수 없습니다'};
    if(!waitingNegotiationResponses(copy).some(n=>!manualNegotiationError(copy,n)))return {ok:false,msg:'응답을 기다리는 현재 구단의 제안이 없습니다'};
    do{result=playWorldDay(copy);}while(result&&!result.pending&&copy.world.phase==='season'&&waitingNegotiationResponses(copy).some(n=>!manualNegotiationError(copy,n)));
    commitNegotiationTime(db,copy);
    return {ok:true,msg:result?.msg||'기존 공식 일정에서 진행을 중단했습니다. 현재 준비와 연락을 확인하세요',response:!!result?.response};
  }
  do{result=advanceNegotiationTime(copy);if(!result?.ok&&!result?.response)return result;}while(!result.response&&waitingNegotiationResponses(copy,true).length);
  commitNegotiationTime(db,copy);
  return result;
}
const negotiationExclusiveDayBeforeClock=advanceOffseasonContractDay;
const negotiationExclusiveWindowBeforeClock=advanceOffseasonContractWindow;
const negotiationFreeAgencyDayBeforeClock=advanceOffseasonFreeAgencyDay;
function negotiationResponseBeforeDate(db,date){
  const n=waitingNegotiationResponses(db,true)[0];
  return !!(n&&n.response.dueAt<=date+'T00:00:00.000Z');
}
advanceOffseasonContractDay=function(db){
  if(negotiationResponseBeforeDate(db,addDays(db.worldDate,1))){const r=advanceToNegotiationResponse(db);return r.response?{...r,ok:true}:r;}
  return negotiationExclusiveDayBeforeClock(db);
};
advanceOffseasonContractWindow=function(db){
  if(negotiationResponseBeforeDate(db,db.world?.contractWindow?.outsideContactDate)){const r=advanceToNegotiationResponse(db);return r.response?{...r,ok:true}:r;}
  return negotiationExclusiveWindowBeforeClock(db);
};
advanceOffseasonFreeAgencyDay=function(db,actor='manager'){
  if(actor==='manager'&&negotiationResponseBeforeDate(db,addDays(db.worldDate,1))){const r=advanceToNegotiationResponse(db);return r.response?{...r,ok:true}:r;}
  return negotiationFreeAgencyDayBeforeClock(db,actor);
};
const negotiationWorldDayBeforeClock=playWorldDay;
playWorldDay=function(db){
  const w=db.world,n=waitingNegotiationResponses(db).find(n=>!manualNegotiationError(db,n));
  if(w.phase==='season'&&!w.pendingOfficial?.queue?.length){
    const date=nextCalendarDate(db);
    if(date&&date===nextDate(db)){const result=playOfficialWorldEvents(db,date);if(result)return result;}
  }
  if(!n||w.phase!=='season'||w.pendingOfficial?.queue?.length)return negotiationWorldDayBeforeClock(db);
  const responseError=negotiationResponseError(n);if(responseError)return {date:db.worldDate,played:[],pending:{kind:'negotiation',id:n.id},advanced:false,msg:responseError};
  const date=nextCalendarDate(db);if(!date)return negotiationWorldDayBeforeClock(db);
  const due=n.response.dueAt,at=negotiationClockAt(db),dayEnd=addDays(date,1)+'T00:00:00.000Z';
  const fixtureStarts=Object.values(w.seasons).filter(s=>!s.done).flatMap(s=>s.days[s.cur]?.date===date?s.days[s.cur].matches.filter(m=>!m.res).map(m=>m.utcAt):[]).filter(Boolean).sort();
  // 실재 편성의 첫 경기보다 이른 연락만 먼저 소비한다. 경기 준비는 기존 작성자가 담당한다.
  const boundary=fixtureStarts[0]||dayEnd;
  if(due>at&&(due>boundary||due>=dayEnd)){
    const result=negotiationWorldDayBeforeClock(db);
    // 시작한 다른 경기를 게임 종료 경계에서 보존한 뒤 연락 시각에 멈춘다.
    if(due<dayEnd&&!db.world.pendingOfficial?.queue?.length&&db.world.phase==='season'){
      db.world.negotiationClock={at:due};const response=resolveDueNegotiationResponse(db);
      if(response)return {...result,...response,pending:{kind:'negotiation',id:n.id},advanced:result?.advanced||false};
    }
    return result;
  }
  const copy=JSON.parse(JSON.stringify(db)),target=due<=at?at:due;
  if(target.slice(0,10)>db.worldDate)applyWorldDailyEffects(copy,target.slice(0,10));
  copy.world.negotiationClock={at:target};const r=resolveDueNegotiationResponse(copy);
  if(r?.blocked)return {date:db.worldDate,played:[],pending:{kind:'negotiation',id:n.id},advanced:false,msg:r.msg};
  if(!r?.response)return negotiationWorldDayBeforeClock(db);
  // 일괄 진행의 세계 참조를 유지해 권한 변화로 잘못 처리하지 않는다.
  commitNegotiationTime(db,copy);
  return {date:db.worldDate,played:[],pending:{kind:'negotiation',id:n.id},response:true,advanced:true,msg:r.msg};
};
const negotiationCancelBeforeClock=cancelNegotiation;
cancelNegotiation=function(db,nid){
  const n=db.world?.negotiations?.[nid];
  if(n?.status==='open'&&n.stage==='waiting')n.history.push({round:n.response.round,side:'club',result:'cancelled',date:db.worldDate,at:negotiationClockAt(db),terms:n.response.terms});
  return negotiationCancelBeforeClock(db,nid);
};
const negotiationStartBeforeClock=startNegotiation;
startNegotiation=function(db,pid,kind='fa',extra={}){
  const teamId=extra.teamId||managedTeamId(db),previous=db.world?.negotiations?latestNegotiationAttempt(db,pid,kind,teamId):null,history=previous?.history?.some(h=>h.result==='submitted')?JSON.parse(JSON.stringify(previous.history)):null;
  const result=negotiationStartBeforeClock(db,pid,kind,extra);
  if(result.ok&&history&&result.neg!==previous&&result.neg.previousAttempts?.length)result.neg.previousAttempts.at(-1).history=history;
  return result;
};

// 제출한 수동 게임은 그 시작 입력으로 계산하고 실제 종료 앞의 다른 사건부터 소비한다.
const officialManualResolveBeforeEvents=resolvePendingOfficialMatch;
resolvePendingOfficialMatch=function(db,forcedDraft){
  const control=pendingOfficialControl(db),p=db.world?.pendingOfficial,q=p?.queue?.[0],refs=control.refs;
  // 날짜 필드 없는 기존 직접 작성 호출은 기존 작성자를 유지한다.
  // 화면·날짜 진행의 pendingOfficialControl 거절은 그대로이며 날짜를 저장에 보충하지 않는다.
  const w=db.world,me=managedTeam(db),legacy=q&&q.date==null&&!Object.hasOwn(q,'contact')&&!Object.hasOwn(q,'inflight')&&refs&&['manual','ai'].includes(w.manage)&&w.phase==='season'&&w.year===db.year&&p.date===db.worldDate&&refs.day.date===p.date&&[refs.m.a,refs.m.b].every(id=>db.teams[id]?.active!==false&&db.regions[db.teams[id]?.region])&&(!q.session||q.session.a===refs.m.a&&q.session.b===refs.m.b&&q.session.bestOf===refs.m.bo&&q.session.seed===`${refs.s.seed}/${refs.s.year}/${refs.m.id}`&&q.session.opt?.compId===refs.s.comp&&q.session.opt?.metaContext?.season===refs.s.id);
  if(legacy){if(forcedDraft!=null&&(w.manage!=='manual'||w.fired||!me||me.active===false||![refs.m.a,refs.m.b].includes(me.id)))throw Error('현재 감독의 수동 게임 입력이 아닙니다');return officialManualResolveBeforeEvents(db,forcedDraft);}
  if(control.error)throw Error(control.error);
  if(refs)officialResourcePendingCheck(db,refs,q);
  if(!control.manual&&forcedDraft!=null)throw Error('현재 감독의 수동 게임 입력이 아닙니다');
  const currentManualOwner=w.manage==='manual'&&!w.fired&&managedTeamId(db),dated=Object.values(w.seasons||{}).filter(s=>!s.done&&s.days[s.cur]?.date===refs?.day.date).every(s=>s.days[s.cur].matches.every(m=>m.utcAt));
  // 새 감독의 별도 준비와 시각 없는 이전 저장은 기존 인계 경계를 유지한다.
  // 감독이 없는 자동 인계도 다른 리그의 시작·종료를 먼저 소비한다.
  if(!refs?.m.utcAt||!control.manual&&!Object.hasOwn(q,'inflight')&&(currentManualOwner||!dated))return officialManualResolveBeforeEvents(db,forcedDraft);
  if(control.manual&&Object.hasOwn(q,'contact'))throw Error('선수 연락을 검토한 뒤 현재 경기 준비를 직접 다시 여세요');
  for(const n of waitingNegotiationResponses(db).filter(n=>n.teamId===managedTeamId(db))){const error=negotiationResponseError(n);if(error)throw Error(error);}
  const undo=pendingOfficialUndo(db);
  try{
    const current=negotiationClockAt(db);if(current.slice(0,10)>db.worldDate&&!Object.hasOwn(q,'inflight')){const record=officialGameTimeRecord(refs.m,q.session?.games||[]);officialClockSessionCheck(refs.s,{...refs.m,clockSession:q.session});if(!record||record.gameTimeThrough!==current)throw Error('자정을 넘긴 이전 경기의 실제 소비 근거를 확인할 수 없습니다');while(db.worldDate<current.slice(0,10)){w.officialCalendarThrough=addDays(db.worldDate,1);applyWorldDailyEffects(db,w.officialCalendarThrough);}}
    const succession=resolvePendingQualificationSuccession(db,refs,q,forcedDraft);if(succession)return succession;
    const administrative=resolvePendingDisqualifiedFinal(db,refs,q);if(administrative)return administrative;
    let played,baseSession,at;
    if(Object.hasOwn(q,'inflight')){
      if(forcedDraft!=null)throw Error('이미 시작한 게임에 새 밴픽 입력을 적용할 수 없습니다');
      const event=manualInflightGame(db,!control.manual);played=event.played;baseSession=event.session;at=event.endAt;
    }else{
      const preview=officialClockPreview(db),initial=JSON.parse(JSON.stringify(q.session||scheduledSeriesSession(preview,officialClockReadonly(refs.s),officialClockReadonly(refs.m)).session));
      baseSession=JSON.parse(JSON.stringify(initial));played=playSeriesSessionGame(preview,baseSession,forcedDraft,false);at=officialGameTimeRecord(refs.m,baseSession.games)?.gameTimeThrough;
      if(at){
        if(!q.session)q.session=initial;
        if(at.slice(0,10)>db.worldDate||control.manual&&waitingNegotiationResponses(db).some(n=>n.teamId===managedTeamId(db)&&n.response.dueAt<at))q.inflight={endAt:at,session:baseSession,observation:officialGameObservation(played.game),gameGraph:officialInflightPack(played),...(control.manual?{manager:db.manager.id,team:managedTeamId(db)}:{automatic:true,manager:null,team:null}),basis:JSON.stringify(q.session)};
      }
    }
    if(!at)return officialManualResolveBeforeEvents(db,forcedDraft);
    officialQueuedGameError(db,refs.s,{...refs.m,clockSession:q.session},{endAt:at,session:baseSession,observation:officialGameObservation(played.game)});
    const consume=()=>{
      if(Object.hasOwn(q,'inflight')){manualInflightGame(db,!control.manual);delete q.inflight;}if(!control.manual)delete q.contact;
      const writer=playSeriesSessionGame;let consumed=false;
      playSeriesSessionGame=function(current,currentSession,draft,quiet){
        if(current!==db)return writer(current,currentSession,draft,quiet);
        if(consumed||currentSession.seed!==baseSession.seed||currentSession.g!==baseSession.g-1)throw Error('수동 게임의 현재 작성 세션이 바뀌었습니다');
        consumed=true;recordMeta(current,played.game);for(const key of Object.keys(currentSession))delete currentSession[key];Object.assign(currentSession,JSON.parse(JSON.stringify(baseSession)));return played;
      };
      let result;try{result=officialManualResolveBeforeEvents(db,forcedDraft);}finally{playSeriesSessionGame=writer;}
      const contact=control.manual?receiveManualEndedContact(db):null;return contact?{...result,...contact}:result;
    };
    return playOfficialWorldEvents(db,refs.day.date,{match:refs.m,at,key:q.seasonKey,consume});
  }catch(error){undo();throw error;}
};

function manualContactPending(db){
  const control=pendingOfficialControl(db),q=db.world?.pendingOfficial?.queue?.[0],contact=q?.contact,n=contact&&db.world.negotiations?.[contact.id];
  return !!(control.manual&&n&&n.teamId===managedTeamId(db)&&typeof contact.at==='string'&&Number.isFinite(Date.parse(contact.at))&&new Date(contact.at).toISOString()===contact.at&&contact.at===negotiationClockAt(db)&&Array.isArray(q.session?.games)&&(Object.hasOwn(q,'inflight')?validManualInflightGame(db):q.session.games.length)&&Array.isArray(n.history)&&n.history.some(row=>row?.side==='player'&&row.at===contact.at));
}
function resumeManualAfterContact(db){
  if(!manualContactPending(db))return {ok:false,msg:'현재 감독의 도착한 선수 연락을 확인할 수 없습니다'};
  const waiting=db.world.pendingOfficial.queue[0].contact,current=db.world.negotiations[waiting.id];
  if(current.status==='open'&&current.stage==='waiting'){const error=negotiationResponseError(current);if(error)return {ok:false,msg:error};if(current.response.dueAt<=waiting.at)return {ok:false,msg:'도착한 응답을 처리할 수 없습니다. 협상 상태를 확인하거나 직접 종료하세요'};}
  const undo=pendingOfficialUndo(db);try{delete db.world.pendingOfficial.queue[0].contact;const contact=receiveManualEndedContact(db);return contact||(Object.hasOwn(db.world.pendingOfficial.queue[0],'inflight')?resolvePendingOfficialMatch(db,null):{ok:true,msg:'현재 경기 준비를 다시 검토하세요'});}catch(error){undo();throw error;}
}

function receiveManualEndedContact(db){
  const next=db.world.pendingOfficial?.queue?.[0];if(!next)return resolveDueNegotiationResponse(db);
  const response=waitingNegotiationResponses(db).filter(n=>n.teamId===managedTeamId(db)&&n.response.dueAt<=negotiationClockAt(db))[0];if(!response)return null;
  const error=negotiationResponseError(response);if(error)throw Error(error);
  next.contact={id:response.id,at:negotiationClockAt(db)};response.history.push({round:response.response.round,side:'player',result:'contact',date:db.worldDate,at:next.contact.at});
  const contact=resolveDueNegotiationResponse(db);if(!contact)delete next.contact;return contact&&!contact.response?{...contact,response:true,negotiationId:response.id}:contact;
}

// 시작 입력은 진행 저장에 고정하며 실제 종료 전에는 관측·결과를 소비하지 않는다.
function manualInflightGame(db,automatic=false){
  const control=pendingOfficialControl(db),q=db.world?.pendingOfficial?.queue?.[0],event=q?.inflight,refs=control.refs;
  const origin=event?.automatic===true?event.manager===null&&event.team===null&&(automatic||control.manual):event&&!Object.hasOwn(event,'automatic')&&[refs?.m.a,refs?.m.b].includes(event.team)&&(automatic||control.manual&&event.manager===db.manager?.id&&event.team===managedTeamId(db));
  if(control.error||!event||!refs||!origin||event.basis!==JSON.stringify(q.session))throw Error('진행 중인 수동 게임의 시작 입력이나 현재 권한을 확인할 수 없습니다');
  officialQueuedGameError(db,refs.s,{...refs.m,clockSession:q.session},event);
  const played=Object.hasOwn(event,'gameGraph')?officialInflightUnpack(event.gameGraph):event.played,last=event.session.games.at(-1);
  if(!played?.game||JSON.stringify(officialGameObservation(played.game))!==JSON.stringify(event.observation)||played.winner!==last.winner||played.loser!==[last.blue,last.red].find(id=>id!==last.winner)||played.done!==seriesSessionDone(event.session)||JSON.stringify(played.score)!==JSON.stringify([event.session.wins[event.session.a],event.session.wins[event.session.b]])||played.game.duration!==last.duration||negotiationClockAt(db)>event.endAt)throw Error('진행 중인 수동 게임의 실제 종료 입력을 확인할 수 없습니다');
  return {...event,played};
}
function validManualInflightGame(db){try{return !!manualInflightGame(db);}catch{return false;}}

const pendingOfficialSessionBeforeInflight=pendingOfficialSession;
pendingOfficialSession=function(db){
  const q=db.world?.pendingOfficial?.queue?.[0];
  if(q&&(Object.hasOwn(q,'inflight')||Object.hasOwn(q,'contact')))throw Error('시작한 게임이나 도착한 연락을 먼저 확인하세요. 새 준비 입력을 적용할 수 없습니다');
  return pendingOfficialSessionBeforeInflight(db);
};

// 같은 시작 객체는 한 번만 저장하고 전체 결과의 값과 참조를 복원한다.
function officialInflightPack(value){
  const nodes=[],seen=new Map();
  const encode=x=>{
    if(!x||typeof x!=='object')return typeof x==='number'&&!Number.isFinite(x)?null:x;
    if(seen.has(x))return {$:seen.get(x)};
    const id=nodes.length,array=Array.isArray(x),node={array,entries:[]};seen.set(x,id);nodes.push(node);
    const entries=array?Array.from({length:x.length},(_,i)=>[String(i),x[i]]):Object.entries(x);
    for(const [key,v] of entries){const omit=v===undefined||typeof v==='function'||typeof v==='symbol';if(!omit||array)node.entries.push([key,omit?null:encode(v)]);}
    return {$:id};
  };
  const root=encode(value);return {version:1,root,nodes};
}
function officialInflightUnpack(graph){
  const fail=()=>{throw Error('저장된 진행 게임의 객체 연결을 확인할 수 없습니다');};
  if(graph?.version!==1||!Array.isArray(graph.nodes)||!graph.nodes.length)fail();
  const nodes=graph.nodes,objects=nodes.map(node=>{if(typeof node?.array!=='boolean'||!Array.isArray(node.entries))fail();return node.array?[]:{};}),visited=new Set(),active=new Set();
  const reference=value=>{if(!value||typeof value!=='object')return null;if(Object.keys(value).length!==1||!Number.isInteger(value.$)||value.$<0||value.$>=nodes.length)fail();return value.$;};
  const decode=value=>{const id=reference(value);if(id===null)return value;if(active.has(id))fail();if(visited.has(id))return objects[id];active.add(id);const node=nodes[id],keys=new Set();
    for(let i=0;i<node.entries.length;i++){const entry=node.entries[i];if(!Array.isArray(entry)||entry.length!==2||typeof entry[0]!=='string'||keys.has(entry[0])||node.array&&entry[0]!==String(i))fail();keys.add(entry[0]);Object.defineProperty(objects[id],entry[0],{value:decode(entry[1]),enumerable:true,writable:true,configurable:true});}
    active.delete(id);visited.add(id);return objects[id];
  };
  const value=decode(graph.root);if(visited.size!==nodes.length)fail();return value;
}

// 원래 편성과 실제 소비 날짜를 구분하며 자정을 넘긴 진행 근거가 있을 때만 허용한다.
function officialPendingAcrossMidnight(db){
  const w=db.world,p=w?.pendingOfficial,q=p?.queue?.[0],refs=q&&pendingOfficialRefs(db,q);
  if(!refs||!freeAgencyDateValid(db.worldDate)||w.officialCalendarThrough!==db.worldDate||w.lastDailyTick!==db.worldDate||p.date!==q.date||q.date!==refs.day.date||q.date>=db.worldDate)return false;
  if(refs.m.actualStart&&(!q.session||!q.session.games?.length)&&!q.inflight){try{officialResourceStartCheck(db,refs.s,refs.m);return officialActualStart(refs.m)===negotiationClockAt(db)&&officialActualStart(refs.m).slice(0,10)===db.worldDate;}catch{return false;}}
  if(!q.session)return false;
  try{const record=officialGameTimeRecord(refs.m,q.session.games);if(q.inflight)officialQueuedGameError(db,refs.s,{...refs.m,clockSession:q.session},q.inflight);else if(!record||!refs.m.gameTime||['scheduledAt','gameTimeThrough','minutes','games'].some(key=>refs.m.gameTime[key]!==record[key]))return false;const at=negotiationClockAt(db),start=record?.gameTimeThrough||refs.m.utcAt,end=q.inflight?.endAt||start;return at.slice(0,10)===db.worldDate&&start<=at&&end>=at&&(!q.inflight||q.inflight.basis===JSON.stringify(q.session));}catch{return false;}
}
const pendingOfficialControlBeforeMidnight=pendingOfficialControl;
pendingOfficialControl=function(db){const result=officialPendingAcrossMidnight(db)?pendingOfficialControlBeforeMidnight({...db,worldDate:db.world.pendingOfficial.date}):pendingOfficialControlBeforeMidnight(db);if(!result.error&&result.refs){try{officialResourcePendingCheck(db,result.refs,db.world.pendingOfficial.queue[0]);}catch(error){return {...result,manual:false,error:error.message};}}return result;};
const nextCalendarDateBeforeMidnight=nextCalendarDate;
nextCalendarDate=function(db){
  const fixture=nextDate(db),w=db.world;
  if(fixture&&fixture<db.worldDate&&w.officialCalendarThrough===db.worldDate&&w.lastDailyTick===db.worldDate){
    const midnight=db.worldDate+'T00:00:00.000Z',pending=w.pendingOfficial?.queue?.[0];
    const carry=officialPendingAcrossMidnight(db)||Object.values(w.seasons||{}).some(s=>(s.days||[]).some(day=>day.date<=fixture&&day.matches.some(m=>{try{if(m.clockGame)return officialQueuedGameError(db,s,m,m.clockGame).gameTimeThrough>=midnight;const q=pending?.matchId===m.id?pending:null,record=officialGameTimeRecord(m,m.clockSession?.games||q?.session?.games||m.res?.games||[]);return !!(record&&m.gameTime&&record.gameTimeThrough>=midnight&&['scheduledAt','gameTimeThrough','minutes','games'].every(key=>record[key]===m.gameTime[key]));}catch{return false;}})));
    if(carry)return fixture;
  }
  return nextCalendarDateBeforeMidnight(db);
};
const officialBookedTeamsBeforeMidnight=officialBookedTeams;
officialBookedTeams=function(db,date=db.worldDate){
  const teams=officialBookedTeamsBeforeMidnight(db,date),add=(m,session,event)=>{if(!event)return;const start=officialGameTimeRecord(m,session?.games||[])?.gameTimeThrough||m.utcAt;if(start&&start.slice(0,10)<=date&&typeof event.endAt==='string'&&event.endAt.slice(0,10)>=date){teams.add(m.a);teams.add(m.b);}};
  for(const s of Object.values(db.world?.seasons||{}))for(const day of s.days||[])for(const m of day.matches){add(m,m.clockSession,m.clockGame);if(m.actualStart&&officialActualStart(m).slice(0,10)===date||m.gameTime&&typeof m.utcAt==='string'&&typeof m.gameTime.gameTimeThrough==='string'&&m.utcAt.slice(0,10)<=date&&m.gameTime.gameTimeThrough.slice(0,10)>=date){teams.add(m.a);teams.add(m.b);}}
  const q=db.world?.pendingOfficial?.queue?.[0],refs=q&&pendingOfficialRefs(db,q);if(refs)add(refs.m,q.session,q.inflight);return teams;
};

// 점유 조회도 실제 게임/세션 근거를 확인한다. 손상 시각으로 연습을 막거나 소비하지 않는다.
function officialOccupationEvidenceCheck(db){
  try{
  const q=db.world?.pendingOfficial?.queue?.[0],refs=q&&pendingOfficialRefs(db,q);
  for(const season of Object.values(db.world?.seasons||{}))for(const day of season.days||[])for(const match of day.matches||[]){
    if(match.actualStart)officialResourceStartCheck(db,season,match);
    const session=match.clockSession||(refs?.m===match?q.session:null);
    if(session)officialClockSessionCheck(season,{...match,clockSession:session});
    if(match.gameTime){
      const record=officialGameTimeRecord(match,session?.games||match.res?.games||[]);
      if(!record||!officialGameTimeSame(record,match.gameTime))throw Error('연습 일정 전에 공식 경기의 실제 소비 기록을 확인하세요');
    }
    if(match.clockGame)officialQueuedGameError(db,season,match,match.clockGame);
  }
  if(q?.inflight){
    if(!refs||q.inflight.basis!==JSON.stringify(q.session))throw Error('연습 일정 전에 진행 게임의 시작 입력을 확인하세요');
    officialQueuedGameError(db,refs.s,{...refs.m,clockSession:q.session},q.inflight);
  }
  }catch(error){error.code='official_occupation_evidence';throw error;}
}
const officialBookedTeamsBeforeResourceEvidence=officialBookedTeams;
officialBookedTeams=function(db,date=db.worldDate){officialOccupationEvidenceCheck(db);return officialBookedTeamsBeforeResourceEvidence(db,date);};
// 날짜/정산/의료 작성에 앞서 검증한다. 정상 입력은 원래 일일 작성자를 그대로 사용한다.
const officialDailyBeforeResourceEvidence=applyWorldDailyEffects;
applyWorldDailyEffects=function(db,date){
  if(db.world.lastDailyTick===date)return officialDailyBeforeResourceEvidence(db,date);
  officialOccupationEvidenceCheck(db);
  // 일일 정산/회복/연습/등록은 함께 완료하거나 함께 되돌린다. 이전 완료 날짜는 보존한다.
  const undo=pendingOfficialUndo(db);
  try{return officialDailyBeforeResourceEvidence(db,date);}catch(error){undo();throw error;}
};

// 새 스크림 예약은 당시 계산한 공통 시간과 체류 근거를 보존한다. 참가 선수는 미리 예약하지 않는다.
function officialScrimScheduleBasis(db,plan){
  const first=db.teams[plan.teamId],second=db.teams[plan.opponentId];if(!first||!second)return null;
  const overlap=scrimTimeOverlap(db,first,second,plan.date,plan.slot);if(!overlap)return null;
  return {version:1,date:plan.date,slot:plan.slot,games:plan.games,startsAt:overlap.startsAt,endsAt:overlap.endsAt,
    venues:[first,second].map(team=>({teamId:team.id,...teamPracticeVenue(db,team,plan.date)}))};
}
function officialScrimBasisSame(first,second){
  if(!first||!second||first.version!==1||second.version!==1||!Array.isArray(first.venues)||first.venues.length!==2)return false;
  return ['date','slot','games','startsAt','endsAt'].every(key=>first[key]===second[key])&&first.venues.every((venue,index)=>['teamId','region','timeZone'].every(key=>venue?.[key]===second.venues[index]?.[key]));
}
const officialScrimSnapshotBeforeBasis=WORLD_ACTION_HANDLERS['scrim.request'].snapshot;
WORLD_ACTION_HANDLERS['scrim.request'].snapshot=function(db,command){return {...officialScrimSnapshotBeforeBasis(db,command),scheduleBasis:officialScrimScheduleBasis(db,command)};};
const officialScrimApplyBeforeBasis=WORLD_ACTION_HANDLERS['scrim.request'].apply;
WORLD_ACTION_HANDLERS['scrim.request'].apply=function(db,command){
  const basis=officialScrimScheduleBasis(db,command),result=officialScrimApplyBeforeBasis(db,command);
  if(result?.ok){const id=[command.teamId,command.opponentId].sort().join('|')+'|'+command.date+'|'+command.slot,plan=scrimPlans(db).find(p=>p.id===id);if(!plan||!basis)throw Error('스크림 예약 당시 시간을 확인할 수 없습니다');plan.scheduleBasis=basis;}
  return result;
};
const officialScheduledScrimsBeforeBasis=runScheduledScrims;
runScheduledScrims=function(db){
  const due=scrimPlans(db).filter(p=>p.status==='accepted'&&p.date<=db.worldDate);if(!due.length)return officialScheduledScrimsBeforeBasis(db);
  const undo=pendingOfficialUndo(db);
  try{
    for(const plan of due){
      const current=plan.date===db.worldDate?officialScrimScheduleBasis(db,plan):null;
      if(!officialScrimBasisSame(plan.scheduleBasis,current)){plan.status='blocked';plan.playedGames=0;plan.reason=plan.scheduleBasis?'예약 당시 시간·체류 조건이 달라져 진행하지 않았습니다':'예약 당시 시간 근거가 없어 진행하지 않았습니다';}
    }
    return officialScheduledScrimsBeforeBasis(db);
  }catch(error){undo();throw error;}
};

// 같은 시기·위상의 동서 대회는 기간을 공유한다. 경기별 공통 중계는 실제 사건 작성자가 순차 소비한다.
// 원래 시즌 작성자를 한 번 호출하며 이미 작성된 현재 단계/편성·이전 저장은 다시 배치하지 않는다.
function officialPeerPeriodSteps(db,steps){
  const config=new Map((db.worldConfig.internationals||[]).map(x=>[x.id,x])),out=[];
  for(const step of steps){
    const previous=out.at(-1),a=previous?.kind==='intl'&&previous.ids?.length===1&&config.get(previous.ids[0]),b=step.kind==='intl'&&step.ids?.length===1&&config.get(step.ids[0]);
    if(a&&b&&['east','west'].includes(a.zone)&&['east','west'].includes(b.zone)&&a.zone!==b.zone&&a.timing===b.timing&&a.phase===b.phase&&a.tier===b.tier&&(a.prestige||1)===(b.prestige||1))out[out.length-1]={...previous,ids:[...previous.ids,...step.ids],label:previous.label+' · '+step.label};
    else out.push(step);
  }
  return out;
}
const officialWorldSeasonBeforePeerPeriods=startWorldSeason;
startWorldSeason=function(db,...args){
  const prior=db.world?.phase==='preseason'?db.world:null;
  const floor=prior?(seasonProjectionRequests.has(db)?prior.preseasonStartedOn:db.worldDate):null;
  const late=freeAgencyDateValid(floor)&&floor>`${db.year}-01-07`,undo=late?pendingAnnualUndo(db):null;
  try{
  if(freeAgencyDateValid(floor))seasonStartFloors.set(db,floor);
  let result;try{result=officialWorldSeasonBeforePeerPeriods(db,...args)}finally{seasonStartFloors.delete(db)}
  const w=db.world;
  if(prior?.negotiations)w.negotiations=prior.negotiations;
  if(prior?.recruitment)w.recruitment=prior.recruitment;
  if(prior?.negotiationClock)w.negotiationClock=prior.negotiationClock;
  const original=new Map(w.steps.map((step,index)=>[step,index])),prefix=w.steps.slice(0,w.step+1);
  w.steps=[...prefix,...officialPeerPeriodSteps(db,w.steps.slice(w.step+1)).map((step,index)=>step.kind==='league'&&original.get(step)!==prefix.length+index?{...step,patchSeedStep:original.get(step)}:step)];
  if(late)for(const s of Object.values(w.seasons||{}))for(const day of s.days||[])for(const match of day.matches||[]){
    if(!match.utcAt||globalTransferMarketState(match.utcAt.slice(0,10)).open)
      throw Error('늦은 시즌 시작 일정이 이적시장과 겹치거나 경기 시각이 유효하지 않습니다');
  }
  return result;
  }catch(error){if(undo)undo();throw error}
};
// 화면/진행의 단계 번호와 기존 패치 난수 입력을 분리한다. 기간 묶음만으로 패치 내용을 다시 뽑지 않는다.
const officialAdvanceStepBeforePeerPeriods=advanceStep;
advanceStep=function(db){
  // 완료 경기의 실제 UTC 종료일 이후부터 기존 단계 간격을 센다.
  // 원래 편성/결과는 유지하고 실제 기록이 없는 이전 저장에는 시간을 추정하지 않는다.
  let through=db.world.lastDate;
  const floor=seasonStartFloors.get(db);
  if(db.world.step===-1&&floor&&floor>through)through=floor;
  for(const season of Object.values(db.world.seasons||{}))if(season.done)for(const day of season.days||[])for(const match of day.matches||[]){
    if(!match.res||!match.gameTime)continue;
    const record=officialGameTimeRecord(match,match.res.games||[]);
    if(!record||!officialGameTimeSame(record,match.gameTime))throw Error('다음 단계 전에 완료 경기의 실제 종료 기록을 확인하세요');
    if(record.gameTimeThrough.slice(0,10)>through)through=record.gameTimeThrough.slice(0,10);
  }
  db.world.lastDate=through;
  const prior=new Set(db.world.majorPatchEvents||[]),result=officialAdvanceStepBeforePeerPeriods(db),w=db.world,step=w.steps[w.step];
  if(step?.kind==='league'&&Number.isInteger(step.patchSeedStep))for(const event of w.majorPatchEvents||[])if(!prior.has(event)&&event.step===w.step)event.step=step.patchSeedStep;
  return result;
};
