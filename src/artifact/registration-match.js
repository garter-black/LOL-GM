// Official match views and emergency entries never mutate employment rosters.
function officialSeasonRoster(db,t,s=null){
  if(!officialRegistrationEnabled(db))return t.roster;
  return s&&db.competitions[s.comp]?.international?s.entries?.[t.id]||[]:t.registration?.players||[];
}
WORLD_ACTION_HANDLERS['roster.official-lineup']={
  validate(db,a){
    const t=db.teams[a.teamId];
    if(!t||!officialRegistrationEnabled(db)||a.actor==='system'||
      a.actor==='manager'&&!managerControlsSquad(db,t)||a.actor==='ai'&&managerControlsSquad(db,t))
      return worldActionError('unauthorized','공식 선발 변경 권한이 없습니다');
    const q=db.world.pendingOfficial?.queue?.[0];
    if(q?.session?.current)return worldActionError('series_locked','현재 세트의 밴픽과 경기를 먼저 완료해야 합니다');
    const s=internationalRegistrationSeasons(db,t).find(x=>db.worldDate>=x.days[0]?.date),
      players=officialSeasonRoster(db,t,s),view=officialMatchView(db,s,t.id,t.id),
      checked=validateStartingLineup(view,view.teams[t.id],a.lineup);
    if(!checked.ok)return {ok:false,reason:'invalid_lineup',errors:checked.errors};
    return {ok:true,teamId:t.id,players:players.slice(),lineup:checked.assignment};
  },
  canonical(db,a,v){return {type:a.type,actor:a.actor,teamId:v.teamId,players:v.players,lineup:v.lineup}},
  snapshot:officialRegistrationSnapshot,
  changes(db,c){return [{kind:'official_lineup',teamId:c.teamId,lineup:c.lineup}]},
  apply(db,c){db.teams[c.teamId].registration.depthChart={...c.lineup};return {lineup:c.lineup}}
};
function officialMatchView(db,s,a,b){
  if(!officialRegistrationEnabled(db))return db;
  const teams={...db.teams};
  for(const id of [a,b]){
    const t=db.teams[id],players=officialSeasonRoster(db,t,s).filter(pid=>officialPlayerCanRepresent(db,db.players[pid],t));
    teams[id]={...t,roster:players,staffRoster:competitionStaffMatchRoster(db,s,t),officialRosterView:true,depthChart:{...t.depthChart,
      ...Object.fromEntries(Object.entries(t.registration?.depthChart||{}).filter(([,pid])=>players.includes(pid)))}};
  }
  const view={...db,teams};for(const id of [a,b])initializeDepthChart(view,teams[id],false);
  return view;
}
function seriesOfficialView(db,sess){
  const s=Object.values(db.world?.seasons||{}).find(x=>x.id===sess.opt.metaContext?.season);
  return s&&!sess.opt.practice&&!sess.opt.replay?officialMatchView(db,s,sess.a,sess.b):db;
}
function officialMedicalReplacementAllowed(db,t,injured,p){
  if(!officialRegistrationEnabled(db))return true;
  const lists=[t.registration?.players||[],...internationalRegistrationSeasons(db,t).map(s=>s.entries?.[t.id]||[])];
  if(db.regions[t.region]?.emergencyRegistration===false||internationalRegistrationSeasons(db,t)
    .some(s=>db.competitions[s.comp].rules?.emergencyRegistration===false))return false;
  if(activeTeams(db).some(other=>other.id!==t.id&&other.registration?.players.includes(p.id)&&
    other.registration.players.filter(id=>id!==p.id&&officialPlayerCanRepresent(db,db.players[id],other)&&
      !medicalOut(db.players[id])).length<5))return false;
  return lists.every(ids=>ids.includes(injured.id)&&ids.length<officialRosterCap(db,t)&&
    (isLocalPlayer(p,t.region,t.id)||ids.filter(id=>!isLocalPlayer(db.players[id],t.region,t.id)).length<nonLocalLimitForTeam(db,t)));
}
function registerMedicalOfficialReplacement(db,t,injured,p){
  if(!officialRegistrationEnabled(db))return;
  const prior=t.registration;t.registration={...prior,players:Array.from(new Set([...prior.players,p.id])),
    history:[...(prior.history||[]),{date:db.worldDate,source:'medical',for:injured.id,players:[...prior.players,p.id]}].slice(-8)};
  for(const other of activeTeams(db))if(other.id!==t.id&&other.registration?.players.includes(p.id))
    other.registration={...other.registration,players:other.registration.players.filter(id=>id!==p.id)};
  for(const s of internationalRegistrationSeasons(db,t))if(s.entries)
    s.entries[t.id]=Array.from(new Set([...(s.entries[t.id]||[]),p.id]));
  localServiceRegistration(db,p,t,true);
}
function scheduledRegistrationForfeit(db,s,m){
  const view=officialMatchView(db,s,m.a,m.b),counts=[m.a,m.b].map(id=>medicalAvailable(view,view.teams[id]));
  if(counts.every(n=>n>=5))return null;
  if(counts.every(n=>n<5)){
    if(!officialDisqualificationFinal(db,s,m))throw Error('양 팀 모두 공식 출전 가능 선수가 5명 미만입니다. 양측 실격 후 적격 차순위의 경기 자리 승계가 필요합니다.');
    const identity=emptyRecordedIdentity(),comp=db.competitions[s.comp];
    identity.competition={id:comp.id,name:comp.name};
    for(const id of [m.a,m.b]){const t=db.teams[id];identity.teams[id]={name:t.name,short:t.short||t.name,region:t.region,regionName:db.regions[t.region]?.name||null};}
    return {rec:{a:m.a,b:m.b,bestOf:m.bo,score:null,winner:null,games:[],forfeit:true,doubleForfeit:true,reason:'결승 양 팀 실격으로 우승자 없음',administrative:{kind:'double_disqualification',date:db.worldDate,identity}},lines:[]};
  }
  const winner=counts[0]>=5?m.a:m.b,need=Math.ceil(m.bo/2);
  // The eligible opponent retains the established single-sided forfeit.
  return {rec:{a:m.a,b:m.b,bestOf:m.bo,score:winner===m.a?[need,0]:[0,need],winner,
    games:[],forfeit:true,doubleForfeit:counts.every(n=>n<5),reason:'공식 등록 출전 가능 선수 5명 미만'},lines:[]};
}
function snapshotInternationalEntries(db,s){
  if(officialRegistrationEnabled(db)&&db.competitions[s.comp]?.international)
    s.entries=Object.fromEntries(db.competitions[s.comp].teams.map(id=>[id,(db.teams[id].registration?.players||[]).slice()]));
}
