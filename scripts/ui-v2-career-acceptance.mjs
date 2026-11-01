import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {runEngineFixture} from './test-harness.mjs';
const sources=await Promise.all(['state','market','contracts','views','management','dialog'].map(p=>readFile(new URL('../src/ui-v2/'+p+'.js',import.meta.url),'utf8')));
const r=await runEngineFixture(String.raw`(()=>{
 const check=(x,m)=>{if(!x)throw Error('UI_V2_CAREER '+m)},cfg=defaultWorldConfig();cfg.regions=[regionCfg('NA',{teams:4,div2:false,splits:1,legs:1,regularBo:1,playoffBo:1,playoffTake:2,format:'rr_po',system:'franchise'})];cfg.internationals=[];
 const db=buildWorld(cfg),t=activeTeams(db,'NA',1)[0];startCareer(db,t.id,'native-bridge');for(const t of setupTeamsForManager(db))autoBuildInitialSquad(db,t,new RNG('native/'+t.id));finalizeInitialRosters(db);
 V2.db=unpackDB(packDB(db));V2.target=t.id;V2.db.world.fired=true;const former=V2.db.teams[t.id],descriptors=[];for(const key of ['finance','staffRoster','training','practiceEvidence']){descriptors.push([key,Object.getOwnPropertyDescriptor(former,key)]);Object.defineProperty(former,key,{configurable:true,enumerable:true,get(){throw Error('해임된 구단의 비공개 자료 접근 '+key)}})}for(const fn of [v2Home,v2Squad,v2Staff,v2Market,v2Analysis,v2Finance,v2Inbox])fn();for(const [key,desc] of descriptors){if(desc)Object.defineProperty(former,key,desc);else delete former[key]}setManagedTeam(V2.db,null);const before=JSON.stringify(V2.db);for(const fn of [v2Home,v2Squad,v2Staff,v2Market,v2Analysis,v2Finance,v2Inbox]){fn();check(JSON.stringify(V2.db)===before,'무직 모든 화면 조회 순수');}check(v2CareerDetached()&&v2CareerPanel().includes('해임')&&JSON.stringify(V2.db)===before,'해임 조회 순수');
 v2ReviewCareer();let review=V2.managementReview;check(review?.careerAction==='day'&&JSON.stringify(V2.db)===before,'무직 세계 진행 수동 검토');V2.managementReview=null;check(JSON.stringify(V2.db)===before,'취소 무변경');
 const expected=v2Copy(V2.db);playWorldDay(expected);v2ReviewCareer();review=V2.managementReview;check(v2CommitManagement(review).ok&&JSON.stringify(V2.db)===JSON.stringify(expected),'실제 세계 진행 작성자 전체 결과');V2.managementReview=null;
 V2.db.world.phase='preseason';const original=JSON.stringify(V2.db);v2OpenCareerChoice();check(V2.db.world.phase==='pick','기존 선택 단계');v2CancelCareerChoice();check(JSON.stringify(V2.db)===original,'선택 취소 원문 전체 복구');
 v2OpenCareerChoice();const target=managerSelectableTeams(V2.db).find(x=>x.id!==t.id),prior=JSON.stringify(V2.db);v2ReviewCareer('choose',target.id);review=V2.managementReview;check(review&&JSON.stringify(V2.db)===prior,'선택 검토 선작성 없음');
 const originalWriter=v2Copy(V2.db);setManagedTeam(originalWriter,target.id);originalWriter.world.fired=false;originalWriter.teams[target.id].owner.patience=2;originalWriter.world.phase='preseason';check(v2CommitManagement(review).ok&&JSON.stringify(V2.db)===JSON.stringify(originalWriter),'기존 선택 writer 전체 결과');check(!v2CommitManagement(review).ok,'중복 선택 무효');V2.managementReview=null;
 V2.db.world.phase='pick';const base=packDB(V2.db);const stale=['load','manager','world','date','team','phase','cash','target'];for(const kind of stale){V2.db=unpackDB(base);V2.managementReview=null;v2ReviewCareer('choose',target.id);const r=V2.managementReview;if(kind==='load')V2.db=unpackDB(packDB(V2.db));if(kind==='manager')V2.db.manager={...V2.db.manager};if(kind==='world')V2.db.world={...V2.db.world};if(kind==='date')V2.db.worldDate=addDays(V2.db.worldDate,1);if(kind==='team')setManagedTeam(V2.db,null);if(kind==='phase')V2.db.world.phase='preseason';if(kind==='cash')V2.db.teams[target.id].finance.cash++;if(kind==='target')r.careerTeam=t.id;const unchanged=JSON.stringify(V2.db);check(!v2CommitManagement(r).ok&&JSON.stringify(V2.db)===unchanged,'오래된 선택 거절 '+kind)}
 V2.db=unpackDB(base);V2.managementReview=null;v2ReviewCareer('choose',target.id);review=V2.managementReview;const fn=chooseSeasonManagedTeam,all=JSON.stringify(V2.db),w=V2.db.world,p=V2.db.players[Object.keys(V2.db.players)[0]];chooseSeasonManagedTeam=(...args)=>{fn(...args);throw Error('통제 실제 선택 후 실패')};check(!v2CommitManagement(review).ok&&JSON.stringify(V2.db)===all&&V2.db.world===w&&V2.db.players[p.id]===p,'선택 실패 전체 그래프/참조 복구');chooseSeasonManagedTeam=fn;
 // Actual compact season -> existing-contract days -> manual annual close -> market -> team choice.
 V2.db=unpackDB(before);V2.managementReview=null;let days=0;while(V2.db.world.phase==='season'&&days++<500)playWorldDay(V2.db);check(V2.db.world.phase==='offseason','실제 소규모 시즌 종료');
 const calendar=V2.db.world.contractWindow||contractWindowDates(V2.db),expectedOpenings=V2.db.world.contractWindow?0:1,start=expectedOpenings?calendar.startDate:V2.db.worldDate;check(calendar.outsideContactDate==='2027-12-07','고정 FA 개방일');const expectedDays=(Date.parse('2027-12-07T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/86400000;check(Number.isInteger(expectedDays)&&expectedDays>=0&&expectedDays<366,'계약 만료 전 실제 남은 날짜');let exclusiveDays=0,openings=0;while(!V2.db.world.contractWindow||V2.db.world.contractWindow.stage==='exclusive'){
  V2.managementReview=null;const original=v2Copy(V2.db),kind=v2CareerKind();v2Continue();const r=V2.managementReview;check(r&&r.careerAction===kind,'무직 계약 달력 매번 검토');if(kind==='open-window')initOffseasonContractWindow(original);else advanceOffseasonContractDay(original);check(v2CommitManagement(r).ok&&JSON.stringify(V2.db)===JSON.stringify(original),'무직 계약 날짜 원래 writer 전체 상태');if(kind==='open-window')openings++;else exclusiveDays++;check(openings<=expectedOpenings&&exclusiveDays<=expectedDays,'실제 계약 날짜 진행 상한');
 }
 check(exclusiveDays===expectedDays&&openings===expectedOpenings&&V2.db.worldDate==='2027-12-07'&&V2.db.world.contractWindow.stage==='fa','실제 계약 만료/FA 경계');
 const faOpening=packDB(V2.db);V2.managementReview=null;v2Continue();review=V2.managementReview;
 check(review?.careerAction==='fa-day'&&packDB(V2.db)===faOpening,'무직 FA 검토 전 무작성');
 V2.managementReview=null;check(packDB(V2.db)===faOpening,'무직 FA 검토 취소 무작성');
 for(const kind of ['load','date','manager','phase']){
  V2.db=unpackDB(faOpening);V2.managementReview=null;v2Continue();const old=V2.managementReview;
  if(kind==='load')V2.db=unpackDB(packDB(V2.db));if(kind==='date')V2.db.worldDate=addDays(V2.db.worldDate,1);
  if(kind==='manager')V2.db.manager={...V2.db.manager};if(kind==='phase')V2.db.world.phase='market';
  const unchanged=packDB(V2.db);check(!v2CommitManagement(old).ok&&packDB(V2.db)===unchanged,'무직 FA 오래된 검토 거절 '+kind);
 }
 V2.db=unpackDB(faOpening);V2.managementReview=null;v2Continue();review=V2.managementReview;
 const faWriter=advanceOffseasonFreeAgencyDay,world=V2.db.world,faBefore=packDB(V2.db);
 advanceOffseasonFreeAgencyDay=(...args)=>{faWriter(...args);throw Error('무직 FA 작성 실패')};
 try{check(!v2CommitManagement(review).ok&&packDB(V2.db)===faBefore&&V2.db.world===world,'무직 FA 실패 전체 복구')}
 finally{advanceOffseasonFreeAgencyDay=faWriter}
 V2.managementReview=null;
 const marketClose=globalTransferMarketWindow(V2.db.world.year).closesOn;let faDays=0;
 while(V2.db.worldDate<marketClose&&faDays<28){
  V2.managementReview=null;const prior=packDB(V2.db),expected=v2Copy(V2.db);
  const day=advanceOffseasonFreeAgencyDay(expected,'system');check(day.ok,'무직 기존 FA 날짜 작성자');
  v2Continue();const dayReview=V2.managementReview;
  check(dayReview?.careerAction==='fa-day'&&packDB(V2.db)===prior,'무직 FA 하루 수동 검토 및 결산 건너뛰기 금지');
  check(v2CommitManagement(dayReview).ok&&JSON.stringify(V2.db)===JSON.stringify(expected),'무직 FA 실제 하루/원장 동일');
  check(!v2CommitManagement(dayReview).ok,'무직 FA 하루 중복 무효');faDays++;
  if(faDays===14)V2.db=unpackDB(packDB(V2.db));
 }
 check(faDays===28&&V2.db.worldDate===marketClose&&managedTeamId(V2.db)===null,'무직 FA 28일과 마감 경계');
 V2.managementReview=null;const annual=v2Copy(V2.db);v2ReviewCareer('annual');const annualReview=V2.managementReview;check(annualReview,'별도 수동 연간 결산');runOffseason(annual);check(v2CommitManagement(annualReview).ok&&JSON.stringify(V2.db)===JSON.stringify(annual),'실제 무직 연간 결산 전체 결과');
 V2.managementReview=null;const market=v2Copy(V2.db);v2Continue();const marketReview=V2.managementReview;closeMarket(market);check(v2CommitManagement(marketReview).ok&&JSON.stringify(V2.db)===JSON.stringify(market),'실제 무직 시장 마감 전체 결과');V2.managementReview=null;v2OpenCareerChoice();const club=managerSelectableTeams(V2.db)[0];v2ReviewCareer('choose',club.id);check(v2CommitManagement(V2.managementReview).ok&&!V2.db.world.fired&&managedTeamId(V2.db)===club.id,'실제 해임 커리어 다음 팀 복귀');check(managedTeamId(unpackDB(packDB(V2.db)))===club.id,'복귀 저장 복원');
 return {readPure:true,manualWorldContinuation:true,originalChoiceWholeState:true,cancelWholeState:true,duplicateInert:true,staleCases:stale.length,lateFailureRollback:true,formerPrivateGettersUntouched:true,actualCompactSeasonDays:days,exclusiveDays,manualAnnualCloseAndMarket:true,careerReturnSave:true};
})()`,{setupSources:[...sources,`function v2Render(){}function v2Navigate(){}function v2Icon(){return ''}function v2Save(){}const document={getElementById(){return {textContent:''}}};`],timeout:120000});assert(r.originalChoiceWholeState);console.log('UI_V2_CAREER_ACCEPTANCE',JSON.stringify(r));
