// ===== LOL GM: World calendar domain =====
// Owns raw clock positioning and in-season daily effects. Positioning alone
// intentionally does not run training, patches or medical daily ticks: the
// contract window and offseason recovery have their own accepted semantics.
// Recovery may temporarily position the clock at the last competition date.
// Global UTC market boundaries are owned by global-market-calendar.js.
function setWorldCalendarDate(db,date){db.worldDate=date}

// Match dates are fixtures; the authoritative world clock moves through every
// intervening calendar date, including rest days and inter-stage breaks.
function nextCalendarDate(db){
  const fixture=nextDate(db);
  if(fixture===null)return null;
  const previous=db.worldDate||`${db.year}-01-01`;
  if(previous>fixture)throw new Error('월드 날짜가 미진행 공식 경기일보다 늦습니다: '+previous+' > '+fixture);
  const next=previous===fixture?fixture:addDays(previous,1); // legacy saves may be parked on an unplayed match date
  const market=globalTransferMarketState(next);
  if(market.open)throw new Error('28일 통합 이적시장 중에는 대회 경기를 진행할 수 없습니다: '+next+' ('+market.opensOn+'~'+market.closesOn+' 미만)');
  return next;
}
function applyCalendarPatchEvents(db,date){
  const w=db.world;
  if(!w.majorPatchEvents?.length)return;
  const remaining=[];
  for(const e of w.majorPatchEvents){
    if(e.date>date){remaining.push(e);continue}
    const rng=new RNG(w.seed+w.year+'|'+e.step,'mid');
    const p=newPatch(db,e.date,true,rng);
    db.patches.nextDate=addDays(e.date,db.patches.cadence||14);
    const nc=p.notes.find(n=>n.type==='new');
    news(db,`${SPLIT_NAME[e.split]} 개막 패치 ${p.id}${nc?` — 신규 챔피언 ${nc.def.nameKo||nc.def.name} 출시`:''}`);
    officeMidSeason(db,rng,WORLD_CHANGE_FREQUENCY);
  }
  w.majorPatchEvents=remaining;
}
function applyWorldDailyEffects(db,date){
  const w=db.world;
  if(w.lastDailyTick===date)return false;
  if(w.lastDailyTick&&w.lastDailyTick>date)throw new Error('이미 처리한 날짜를 다시 진행할 수 없습니다');
  setWorldCalendarDate(db,date);
  processLoanDaily(db);
  processTransferPayments(db);
  aiReviewLoanMarket(db);
  aiReviewLoanDecisions(db);
  processLocalServiceDaily(db);
  // A scheduled patch is effective *on* its intended date, never during the
  // preceding break. Then every actual day runs exactly once.
  applyCalendarPatchEvents(db,date);
  patchTick(db,date,new RNG(w.seed+date,'patch'));
  advanceFacilityConstruction(db,date);
  dailyRecovery(db);
  medicalDailyTick(db,date);
  for(const t of activeTeams(db))aiReviewRoleConversions(db,t);
  runScheduledScrims(db);
  aiRunScrims(db,new RNG(w.seed+date,'scrim'));
  runDailyPractice(db);
  for(const t of activeTeams(db,null,1))aiManageOwnedReserve(db,t);
  aiReviewOfficialRegistrations(db);
  aiReviewCompetitionStaffRegistrations(db);
  refreshAIMarketOffers(db);
  w.lastDailyTick=date;
  return true;
}

// 독점 기간 뒤 연간 결산 전의 실제 날짜 소비. 기존 결산 기준일과 소비만 사용한다.
function freeAgencyDateValid(date){try{return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&addDays(date,0)===date}catch{return false}}
function freeAgencyDayState(db){
 const w=db.world,cw=w?.contractWindow,date=db.worldDate;
 const valid=w?.phase==='offseason'&&cw?.stage==='fa'&&cw.completed===true&&Number.isInteger(w.year)&&db.year===w.year&&cw.startSeason===w.year+1&&cw.seasonYear===w.year&&freeAgencyDateValid(cw.contractExpiryDate)&&freeAgencyDateValid(cw.outsideContactDate)&&addDays(cw.contractExpiryDate,1)===cw.outsideContactDate&&freeAgencyDateValid(date)&&freeAgencyDateValid(cw.outsideContactDate)&&date>=cw.outsideContactDate;
 const through=valid?`${cw.startSeason}-01-06`:null,next=valid?addDays(date,1):null;
 return {ready:!!(valid&&next<=through),date,next,through,reason:!valid?'자유계약 날짜 정보를 확인할 수 없습니다':next>through?'연간 결산 기준일에 도달했습니다':'',stage:valid?'fa':null};
}
function advanceOffseasonFreeAgencyDay(db,actor='manager'){
 const state=freeAgencyDayState(db),w=db.world,t=managedTeam(db);
 if(!state.ready)return {ok:false,msg:state.reason};
 if(!['manager','system'].includes(actor)||actor==='manager'&&(!t||t.active===false||t.parent||w.manage!=='manual'||w.fired||w.pendingOfficial?.queue?.length))return {ok:false,msg:'현재 구단에서 날짜를 직접 진행할 권한이 없습니다'};
 // 처리 실패가 현재 세계를 부분 변경하지 않도록 완성된 결과만 반영한다.
 const prepared=JSON.parse(JSON.stringify(db));
 const previousOfferPeriod=aiMarketOfferPeriod(prepared)?.id;
 setWorldCalendarDate(prepared,state.next);processTransferPayments(prepared);processLocalServiceDaily(prepared);aiChooseLocalEligibility(prepared);
 const marketClosesOn=globalTransferMarketWindow(w.year).closesOn;
 if(state.next>=marketClosesOn)closeOpenNegotiationsForDeadline(prepared);
 if(state.next===marketClosesOn){
  expireCurrentAIMarketOffers(prepared,previousOfferPeriod);
 }
 refreshAIMarketOffers(prepared);
 for(const key of Object.keys(db))delete db[key];Object.assign(db,prepared);
 return {ok:true,stage:'fa',date:db.worldDate,msg:'자유계약 기간 · '+db.worldDate};
}
