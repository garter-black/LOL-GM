import {runEngineFixture,artifactSources} from './test-harness.mjs';
await runEngineFixture(String.raw`(()=>{
  const check=(ok,msg)=>{if(!ok)throw Error('REGISTRATION '+msg)};
  const cfg=defaultWorldConfig();cfg.regions=[regionCfg('NA',{teams:3,div2:true,system:'franchise'}),regionCfg('KR',{teams:2,div2:false})];cfg.internationals=[];
  const db=buildWorld(cfg),[parent,opponent]=activeTeams(db,'NA',1),reserve=reserveTeamsOf(db,parent)[0],year=db.year;
  check(reserve,'owned reserve fixture missing');
  db.world={phase:'season',year,manage:'manual',seasons:{},registrationVersion:1};setManagedTeam(db,parent.id);setWorldCalendarDate(db,year+'-01-10');
  for(const t of activeTeams(db)){
    for(const role of ROLES){const p=genPlayer(db,new RNG(t.id+role,'registered'),{region:t.region,role,age:22,base:65});signContract(db,p,t,1,2,{});}
    initializeDepthChart(db,t,true);t.finance.cash=1000;
  }
  const spare=genPlayer(db,new RNG('spare','registered'),{region:'NA',role:ROLES[0],age:21,base:55});signContract(db,spare,parent,1,2,{});
  initializeOfficialRegistrations(db);const initial=JSON.stringify(parent.registration.players);
  const command={type:'roster.register',actor:'manager',teamId:parent.id,players:parent.registration.players.slice()},
    before=JSON.stringify(db),preview=previewWorldAction(db,command);
  check(preview.ok&&JSON.stringify(db)===before,'preview mutated state');
  const writer=writeOfficialRegistration;writeOfficialRegistration=(...args)=>{writer(...args);throw Error('late registry failure')};
  check(!applyWorldAction(db,preview).ok&&JSON.stringify(db)===before,'registry/service rollback failed');writeOfficialRegistration=writer;
  check(applyWorldAction(db,preview).ok,'valid registration failed');
  const old=parent.depthChart[ROLES[0]],incoming=reserve.depthChart[ROLES[0]],plan=rosterPlanState(db,parent);
  plan.assignments[old]=reserve.id;plan.assignments[incoming]=parent.id;
  check(commitWorldAction(db,{type:'roster.plan',actor:'manager',parentId:parent.id,assignments:plan.assignments}).ok,'internal move failed');
  check(JSON.stringify(parent.registration.players)===initial&&officialPlayerCanRepresent(db,db.players[old],parent),'training move rewrote official membership');
  const view=officialMatchView(db,null,parent.id,opponent.id);
  check(view.teams[parent.id].roster.includes(old)&&!view.teams[parent.id].roster.includes(incoming)&&
    validateStartingLineup(view,view.teams[parent.id]).ok,'official view followed training group or rejected preserved entry');
  const nextParent=parent.registration.players.filter(id=>id!==old).concat(incoming),nextReserve=reserve.registration.players.filter(id=>id!==incoming).concat(old);
  check(!previewWorldAction(db,{...command,players:nextParent}).ok,'duplicate official registration accepted');
  const batch={...command,registrations:{[parent.id]:nextParent,[reserve.id]:nextReserve}};delete batch.players;
  check(commitWorldAction(db,batch).ok,'atomic first/reserve exchange required invalid intermediate roster');
  setWorldCalendarDate(db,year+'-02-02');check(!previewWorldAction(db,command).ok,'closed registration window ignored');
  const newcomer=genPlayer(db,new RNG('outside-fa','registered'),{region:'KR',role:ROLES[0],age:22,base:70});
  check(commitWorldAction(db,{type:'player.sign',actor:'manager',kind:'fa',pid:newcomer.id,teamId:parent.id,salary:1,years:1,terms:{}}).ok,'year-round FA contract blocked');
  check(parent.roster.includes(newcomer.id)&&!parent.registration.players.includes(newcomer.id)&&
    !officialMatchView(db,null,parent.id,opponent.id).teams[parent.id].roster.includes(newcomer.id),'outside-window FA received official rights');
  check(!newcomer.localEligibility.service,'unregistered employment earned local service');
  const imports=[newcomer];
  for(let i=0;i<2;i++){const p=genPlayer(db,new RNG('extra-import'+i,'registered'),{region:'KR',role:ROLES[i+1],age:23,base:60});
    check(commitWorldAction(db,{type:'player.sign',actor:'manager',kind:'fa',pid:p.id,teamId:parent.id,salary:1,years:1,terms:{}}).ok,'employment incorrectly capped nonlocals');imports.push(p);}
  setWorldCalendarDate(db,year+'-01-25');check(!previewWorldAction(db,{...command,players:parent.registration.players.slice(0,2).concat(imports.map(p=>p.id))}).ok,'official import cap ignored');
  for(let i=0;i<4;i++){const p=genPlayer(db,new RNG('extra-local'+i,'registered'),{region:'NA',role:ROLES[0],age:22,base:50});signContract(db,p,parent,1,2,{});}
  check(parent.roster.length>10&&!previewWorldAction(db,{...command,players:parent.roster.slice(0,11)}).ok,'employment and official maximum were conflated');
  setWorldCalendarDate(db,year+'-02-02');
  const lineView=officialMatchView(db,null,parent.id,opponent.id),lineup=lineView.teams[parent.id].depthChart;
  check(commitWorldAction(db,{type:'roster.official-lineup',actor:'manager',teamId:parent.id,lineup}).ok,'lineup change outside registration window blocked');
  check(!previewWorldAction(db,{type:'roster.official-lineup',actor:'manager',teamId:parent.id,lineup:{...lineup,[ROLES[0]]:newcomer.id}}).ok,'unregistered starter accepted');
  db.regions.NA.internalMoveWindows=[{from:'07-01',through:'07-14'}];
  const back=rosterPlanState(db,parent);back.assignments[old]=parent.id;back.assignments[incoming]=reserve.id;
  check(!previewWorldAction(db,{type:'roster.plan',actor:'manager',parentId:parent.id,assignments:back.assignments}).ok,'internal window ignored');
  delete db.regions.NA.internalMoveWindows;db.regions.NA.internalMoveWaitDays=30;
  setWorldCalendarDate(db,year+'-01-11');check(!previewWorldAction(db,{type:'roster.plan',actor:'manager',parentId:parent.id,assignments:back.assignments}).ok,'internal wait ignored');
  delete db.regions.NA.internalMoveWaitDays;
  // AI submits the two final lists atomically through the identical gateway.
  const ai=unpackDB(packDB(db));setManagedTeam(ai,opponent.id);aiReviewOfficialRegistrations(ai);
  check(ai.teams[parent.id].registration.players.includes(incoming)&&!ai.teams[reserve.id].registration.players.includes(incoming),'production AI failed atomic registry exchange');
  // International snapshot is distinct and cannot follow later training-group changes.
  db.competitions.REG_INT={id:'REG_INT',international:true,teams:[parent.id,opponent.id],rules:{fearless:true},stages:[{id:'rr',type:'round_robin',legs:1,bestOf:1,name:'Test'}]};
  const intl=newSeason(db,'REG_INT',year,'reg-int',year+'-01-20');db.world.seasons.REG_INT=intl;
  check(intl.entries[parent.id].includes(incoming),'international entry snapshot missing');
  setWorldCalendarDate(db,intl.days[0].date);check(!previewWorldAction(db,batch).ok&&
    !previewWorldAction(db,{type:'roster.plan',actor:'manager',parentId:parent.id,assignments:back.assignments}).ok,'international entry/internal lock ignored');
  // Production series uses the official view; it cannot field a newly hired FA.
  const m=intl.days[0].matches[0],stage=db.competitions.REG_INT.stages[0];
  const result=simulateScheduledSeries(db,intl,intl.days[0],m,stage);
  check(result.lines.length===10&&!result.lines.some(l=>l.pid===newcomer.id),'official simulation used unregistered player');
  const saved=unpackDB(packDB(db));check(JSON.stringify(saved.world.seasons.REG_INT.entries)===JSON.stringify(intl.entries),'locked entries save lost');
  const corrupt=JSON.parse(packDB(db));corrupt.teams[parent.id].registration.players.push(corrupt.teams[parent.id].registration.players[0]);
  let denied=false;try{unpackDB(JSON.stringify(corrupt))}catch{denied=true}check(denied,'duplicate registry save accepted');
  // Explicit emergency policy controls replacement registration in a locked event.
  const injured=db.players[parent.registration.players[0]],emergency=newcomer;
  db.regions.NA.emergencyRegistration=false;check(!officialMedicalReplacementAllowed(db,parent,injured,emergency),'disabled emergency ignored');
  db.regions.NA.emergencyRegistration=true;check(officialMedicalReplacementAllowed(db,parent,injured,emergency),'legal locked-event replacement rejected');
  registerMedicalOfficialReplacement(db,parent,injured,emergency);check(intl.entries[parent.id].includes(emergency.id)&&newcomer.localEligibility.service,'explicit emergency missing entry/service');
  // Shortage forfeits without manufacturing games or official appearance counts.
  const roster=parent.registration.players.slice();for(const id of roster)db.players[id].medical={out:true,daysLeft:20};
  const forfeit=scheduledRegistrationForfeit(db,intl,{a:parent.id,b:opponent.id,bo:3});
  check(forfeit?.rec.winner===opponent.id&&forfeit.rec.games.length===0&&forfeit.lines.length===0,'shortage fabricated games or crashed');
  for(const id of roster)delete db.players[id].medical;
  // Older supported worlds use employment rosters rather than registration
  // snapshots; a genuine medical shortage must still take the same result path.
  const legacy=unpackDB(packDB(db));delete legacy.world.registrationVersion;
  for(const id of legacy.teams[parent.id].roster)legacy.players[id].medical={out:true,daysLeft:20};
  const legacyForfeit=scheduledRegistrationForfeit(legacy,legacy.world.seasons.REG_INT,{a:parent.id,b:opponent.id,bo:3});
  check(legacyForfeit?.rec.winner===opponent.id&&legacyForfeit.rec.games.length===0&&legacyForfeit.lines.length===0,
    'legacy medical shortage fabricated a game or ignored the forfeit');
  const legacySeason=legacy.world.seasons.REG_INT,legacyMatch=legacySeason.days[0].matches[0],
    actualForfeit=scheduledRegistrationForfeit(legacy,legacySeason,legacyMatch);
  commitScheduledSeries(legacy,legacySeason,legacyMatch,actualForfeit);
  const legacyRestored=unpackDB(packDB(legacy)),restoredResult=legacyRestored.world.seasons.REG_INT.days[0].matches[0].res;
  check(restoredResult?.forfeit&&restoredResult.winner===opponent.id&&restoredResult.games.length===0,
    'actual shortage result or saved history was not preserved');
  const em=unpackDB(packDB(db)),coverTeam=activeTeams(em,'KR',1)[0],coverFor=em.players[coverTeam.roster[0]],
    cover=genPlayer(em,new RNG('registration-medical','fixture'),{region:'KR',role:coverFor.role,age:22,base:50});
  for(const [id,p] of Object.entries(em.players))if(!p.team&&id!==cover.id)delete em.players[id];
  const emergencyBefore=packDB(em),emergencyWriter=registerMedicalOfficialReplacement;
  registerMedicalOfficialReplacement=(...args)=>{emergencyWriter(...args);throw Error('late emergency entry failure')};
  check(!medicalEmergencyFASigning(em,coverTeam,coverFor,10)&&packDB(em)===emergencyBefore,'late emergency entry failed to restore contract, cash and registration');
  registerMedicalOfficialReplacement=emergencyWriter;
  check(medicalEmergencyFASigning(em,coverTeam,coverFor,10)?.id===cover.id&&coverTeam.registration.players.includes(cover.id),'production emergency signing did not register cover');
  intl.done=true;setWorldCalendarDate(db,year+'-01-25');
  globalThis.SLOT='1';globalThis.SLOT_SWITCHING=false;globalThis.UI_RENDER_ID=1;globalThis.UI_OVERLAY=null;globalThis.VIEW='squad';globalThis.DB=db;globalThis.esc=String;globalThis.MSG='';let saves=0;globalThis.saveDB=()=>saves++;globalThis.navKeepScroll=()=>{};
  const button={dataset:{officialSubmit:parent.id}},selectors=[parent,reserve].flatMap(t=>t.registration.players.map(id=>({value:t.id,dataset:{officialDestination:id}})));
  globalThis.document={querySelectorAll:q=>q==='[data-official-submit]'?[button]:q==='[data-official-destination]'?selectors:[]};
  globalThis.confirm=()=>false;bindOfficialRegistrationControls();const cancelled=JSON.stringify(db);button.onclick();check(JSON.stringify(db)===cancelled&&!saves,'cancelled UI registry committed');
  globalThis.confirm=()=>true;button.onclick();check(saves===1&&officialRegistrationPanel(parent).includes('미등록'),'UI registry confirmation failed');
  console.log('REGISTRATION_ACCEPTANCE '+JSON.stringify({pureRollback:true,atomicSquadSwap:true,employmentSeparate:true,localService:true,windowsWait:true,internationalLock:true,productionMatch:true,saveValidation:true,emergencyPolicy:true,forfeitNoGames:true,uiConfirmCancel:true}));
})();`,{filename:'registration.fixture.js',setupSources:await artifactSources(['ui-official-edit.js','ui-registration.js'])});
