import test from 'node:test';
import assert from 'node:assert/strict';
import {readDocuments,validateRulebook} from './rulebook-guard.mjs';

const original=readDocuments();
const check=docs=>validateRulebook(docs).errors.join('\n');
const changed=(file,fn)=>({...original,[file]:fn(original[file])});

test('published rulebook has unique, sourced rules and working local links',()=>{
  const result=validateRulebook(original);
  assert.deepEqual(result.errors,[]);
  assert.equal(result.chapterCount,9);
  assert(result.ruleCount>=113); // protect the reviewed baseline without blocking future approved additions
});
test('duplicate ID cannot pass as a new approved clause',()=>{
  const file='docs/rulebook/20-CALENDAR.md';
  const docs=changed(file,text=>text+'\n### CAL-001 · duplicate\ntext [근거](https://github.com/lkh0802a/LOL-GM/issues/234)\n');
  assert.match(check(docs),/DUPLICATE_ID: CAL-001/);
});
test('missing approval evidence is rejected',()=>{
  const file='docs/rulebook/50-MATCH.md';
  const docs=changed(file,text=>text.replace(/(### MATCH-003[\s\S]*?)(?=### MATCH-004)/,segment=>segment.replaceAll(/https:\/\/github\.com\/lkh0802a\/LOL-GM\/issues\/[0-9]+/g,'no-source')));
  assert.match(check(docs),/NO_SOURCE: MATCH-003/);
});
test('an obsolete global FA date cannot silently replace the approved date',()=>{
  const file='docs/rulebook/20-CALENDAR.md';
  const docs=changed(file,text=>text.replace('12월 첫째 화요일 00:00 UTC','11월 셋째 화요일 00:00 UTC'));
  assert.match(check(docs),/BROKEN_PIN: CAL-001/);
});
test('rulebook links to nonexistent files cannot silently pass',()=>{
  const file='docs/rulebook/README.md';
  const docs=changed(file,text=>text.replace('(00-CORE.md)','(missing-CORE.md)'));
  assert.match(check(docs),/BROKEN_LOCAL_LINK/);
});
test('Codex startup cannot silently drop the rulebook lookup',()=>{
  const docs=changed('AGENTS.md',text=>text.replace('## 규정집 필수 참조','## optional old note'));
  assert.match(check(docs),/CODEX_ENTRY/);
});
test('immutable First Selection and draft policies cannot silently disappear',()=>{
  let docs=changed('docs/rulebook/50-MATCH.md',text=>text.replaceAll('First Selection','Old Selection'));
  assert.match(check(docs),/BROKEN_PIN: MATCH-003/);
  docs=changed('docs/rulebook/50-MATCH.md',text=>text.replaceAll('Fearless Draft','Optional Draft'));
  assert.match(check(docs),/BROKEN_PIN: MATCH-002/);
});
test('publication version and changelog cannot silently diverge',()=>{
  const docs=changed('docs/rulebook/README.md',text=>text.replace('v0.10.0','v9.9.9'));
  assert.match(check(docs),/CHANGELOG: no entry/);
});
test('approved youth compensation and club taxonomy cannot silently regress',()=>{
  const file='docs/rulebook/60-BUSINESS.md';
  let docs=changed(file,text=>text.replace('지급 비율·금액·분할식·자격·발효 시점·기금 조성은 미확정','지급 비율은 확정'));
  assert.match(check(docs),/BROKEN_PIN: BIZ-011/);
  docs=changed(file,text=>text.replace('프로/세미프로/아마추어','프로/아마추어 고정'));
  assert.match(check(docs),/BROKEN_PIN: BIZ-012/);
});
test('source-depth coverage is inspectable and not mislabeled as approval verification',()=>{
  const result=validateRulebook(original);
  assert.equal(result.sourceDepth.directCommentLinked+result.sourceDepth.issueOnlyOrOther,result.ruleCount);
  assert(result.sourceDepth.directCommentLinked>0);
});
test('a tournament-wide two-loss cap cannot replace per-bracket elimination policy',()=>{
  const file='docs/rulebook/10-COMPETITIONS.md';
  const docs=changed(file,text=>text.replace('대회 전체에서 2패를 초과할 수 없다는 뜻이 아니다','대회 전체 2패 제한이 적용된다'));
  assert.match(check(docs),/BROKEN_PIN: COMP-006/);
});
test('relegated parent and academy second-division collision cannot disappear',()=>{
  const file='docs/rulebook/10-COMPETITIONS.md';
  const docs=changed(file,text=>text.replace('적격한 실제 하위 부로 행정적으로 이동하거나, 적법하게 매각 또는 해체','다른 2부로 자동 재배치'));
  assert.match(check(docs),/BROKEN_PIN: COMP-004/);
});
test('official international eligibility and distinct payroll bases are pinned',()=>{
  let docs=changed('docs/rulebook/10-COMPETITIONS.md',text=>text.replace('MSI 미진출팀','MSI 진출팀'));
  assert.match(check(docs),/BROKEN_PIN: COMP-015/);
  docs=changed('docs/rulebook/60-BUSINESS.md',text=>text.replaceAll('상위 5명','전체 선수'));
  assert.match(check(docs),/BROKEN_PIN: BIZ-013/);
});
test('general early-contact consent cannot erase the non-license buyout exception',()=>{
  const file='docs/rulebook/30-TRANSFERS.md';
  const docs=changed(file,text=>text.replace('다만 **TRANS-005에 해당하는 프로 라이선스 미보유 팀 계약 선수는 적법한 바이아웃을 전제로 한 자유 접촉·협상 예외**','다만 모든 조기 접촉은 반드시 원팀 동의'));
  assert.match(check(docs),/BROKEN_PIN: TRANS-003/);
});
test('colloquial vocabulary is rejected in normative chapter prose',()=>{
  const docs=changed('docs/rulebook/60-BUSINESS.md',text=>text.replace("고정된 '프로 구단' 분류","고정된 '프로 구단' 딱지"));
  assert.match(check(docs),/COLLOQUIAL_STYLE/);
});

test('in-game copy cannot be replaced by development-meta text',()=>{
  const file='docs/rulebook/80-EXPERIENCE.md';
  const docs=changed(file,text=>text.replace('게임 세계 밖의 개발·설계 메타 설명','게임 안에 개발·설계 메타 설명'));
  assert.match(check(docs),/BROKEN_PIN: UI-009/);
});
test('reopening an unsent draft cannot revoke signed contracts or committed payments',()=>{
  const file='docs/rulebook/80-EXPERIENCE.md';
  const docs=changed(file,text=>text.replace('이미 제출된 유효 제안, 실제 당사자 합의, 최종 서명, 확정된 지급 및 경과한 세계 시간','미제출 협상 내용'));
  assert.match(check(docs),/BROKEN_PIN: UI-010/);
});

test('a same-league broadcast overlap cannot silently replace sequential play',()=>{
  const docs=changed('docs/rulebook/20-CALENDAR.md',text=>text.replace('서로 겹치지 않도록 순차 편성','일부 겹치도록 편성'));
  assert.match(check(docs),/BROKEN_PIN: CAL-009/);
});
test('independent international events cannot be chained into automatic delay',()=>{
  const docs=changed('docs/rulebook/20-CALENDAR.md',text=>text.replace('연쇄적으로 순연하거나 취소하지 않는다','연쇄적으로 순연한다'));
  assert.match(check(docs),/BROKEN_PIN: CAL-011/);
});
test('automatic promotion and academy promotion cannot return silently',()=>{
  let docs=changed('docs/rulebook/10-COMPETITIONS.md',text=>text.replace('자동 승격·강등시키지 않는다','자동 승격·강등시킨다'));
  assert.match(check(docs),/BROKEN_PIN: COMP-016/);
  docs=changed('docs/rulebook/10-COMPETITIONS.md',text=>text.replace('2군은 공식 지역리그에서 승격하거나 승격 결정전에 참가할 수 없다','2군은 모든 승격 결정전에 자유롭게 참가할 수 있다'));
  assert.match(check(docs),/BROKEN_PIN: COMP-017/);
});


test('approved academy solution cannot be restricted to sale or dissolution only',()=>{
  const docs=changed('docs/rulebook/10-COMPETITIONS.md',text=>text.replace('적격한 실제 하위 부로 행정적으로 이동하거나, 적법하게 매각 또는 해체','적법하게 매각 또는 해체'));
  assert.match(check(docs),/BROKEN_PIN: COMP-004/);
});
test('parent and academy cannot share a lower official tier',()=>{
  const docs=changed('docs/rulebook/10-COMPETITIONS.md',text=>text.replace('같은 공식 지역리그의 동일한 부에 동시에 소속되거나 참가할 수 없다','같은 공식 지역리그의 3부라면 함께 참가할 수 있다'));
  assert.match(check(docs),/BROKEN_PIN: COMP-004/);
});
test('administrative academy relocation requires an actual eligible lower tier',()=>{
  const docs=changed('docs/rulebook/10-COMPETITIONS.md',text=>text.replace('해당 하위 부의 실재 여부·등록 자격·수용 정원과 계약·소유권·재정상 의무','행정 편의만 확인'));
  assert.match(check(docs),/BROKEN_PIN: COMP-004/);
});


test('adjudication matrix cannot duplicate an existing clause id',()=>{
  const file='docs/rulebook-audit/CLAUSE_DECISION_MATRIX_2026_11_01.md';
  const docs=changed(file,text=>text.replace('| CORE-002 |','| CORE-001 |'));
  assert.match(check(docs),/MATRIX_DUPLICATE: CORE-001/);
});
test('adjudication matrix cannot omit a rulebook clause',()=>{
  const file='docs/rulebook-audit/CLAUSE_DECISION_MATRIX_2026_11_01.md';
  const docs=changed(file,text=>text.replace(/^\| UI-010 \|[^\n]*\n/m,''));
  assert.match(check(docs),/MATRIX_MISSING: UI-010/);
});
test('adjudication source type must reflect direct comment links',()=>{
  const file='docs/rulebook-audit/CLAUSE_DECISION_MATRIX_2026_11_01.md';
  const docs=changed(file,text=>text.replace(/(\| CORE-001 \|[^\n]*\| )이슈·기타( \|)/,'$1댓글 직접 링크$2'));
  assert.match(check(docs),/MATRIX_SOURCE_DEPTH: CORE-001/);
});
test('adjudication summary cannot overcount reviewed clauses',()=>{
  const file='docs/rulebook-audit/CLAUSE_DECISION_MATRIX_2026_11_01.md';
  const docs=changed(file,text=>text.replace('| 관련 원문 부분대조 | 113 |','| 관련 원문 부분대조 | 112 |'));
  assert.match(check(docs),/MATRIX_SUMMARY: 관련 원문 부분대조/);
});


test('balance hotfix cannot take effect before every worldwide official series ends',()=>{
  const file='docs/rulebook/50-MATCH.md';
  const docs=changed(file,text=>text.replace('전 세계의 해당 일자 공식 대회 경기와 세트가 모두 종료된 이후','해당 지역의 첫 공식 경기 종료 직후'));
  assert.match(check(docs),/BROKEN_PIN: MATCH-008/);
});
test('unverifiable historical replay cannot be advertised as a perfect reproduction',()=>{
  const file='docs/rulebook/80-EXPERIENCE.md';
  const docs=changed(file,text=>text.replace('완전한 재현에 필요한 근거가 부족한 경우에는 재현의 한계를 명시','근거가 부족해도 전체 사건을 완벽하게 재현했다고 표시'));
  assert.match(check(docs),/BROKEN_PIN: UI-007/);
});


test('CORE-007 cannot forbid newly founded independent events until the next season',()=>{
  const file='docs/rulebook/00-CORE.md';
  const docs=changed(file,text=>text.replace('신규 독립 대회는 당해 시즌에도 신설할 수 있으나','신규 독립 대회도 무조건 다음 시즌에만 신설할 수 있으며'));
  assert.match(check(docs),/BROKEN_PIN: CORE-007/);
});
test('CORE-007 cannot change a currently running independent event retroactively',()=>{
  const file='docs/rulebook/00-CORE.md';
  const docs=changed(file,text=>text.replace('기존 독립 대회의 구조적 개편은 원칙적으로 차기 회차부터','기존 독립 대회의 구조적 개편은 진행 중 회차에도 즉시'));
  assert.match(check(docs),/BROKEN_PIN: CORE-007/);
});
test('COMP-011 must retain the official next-season structural reform rule',()=>{
  const file='docs/rulebook/10-COMPETITIONS.md';
  const docs=changed(file,text=>text.replace('공식 대회 체계의 구조적 개편을 원칙적으로 차기 시즌부터','공식 대회 체계의 구조적 개편을 현재 시즌 즉시'));
  assert.match(check(docs),/BROKEN_PIN: COMP-011/);
});
test('COMP-011 may not omit the global transfer-window match ban for new independent events',()=>{
  const file='docs/rulebook/10-COMPETITIONS.md';
  const docs=changed(file,text=>text.replace('세계 공통 경기 금지 기간의 검증을 통과해야 한다','세계 공통 경기 금지 기간을 무시하고 진행할 수 있다'));
  assert.match(check(docs),/BROKEN_PIN: COMP-011/);
});


test('an independent authorized event cannot be reclassified as an official calendar event',()=>{
  const file='docs/rulebook/10-COMPETITIONS.md';
  const docs=changed(file,text=>text.replace('공식 대회로 편입·전환할 수 없다','사무국 공인만으로 공식 대회로 편입할 수 있다'));
  assert.match(check(docs),/BROKEN_PIN: COMP-018/);
});
test('obsolete 87C must not force all tied teams into tiebreak matches',()=>{
  const file='docs/rulebook/10-COMPETITIONS.md';
  const docs=changed(file,text=>text.replace('모든 동률에 별도 결정전을 일률적으로 강제하지 않으며','모든 동률에 별도 결정전을 일률적으로 강제하며'));
  assert.match(check(docs),/BROKEN_PIN: COMP-019/);
});
test('new academy protection cannot be issued to selected academy teams only',()=>{
  const file='docs/rulebook/10-COMPETITIONS.md';
  const docs=changed(file,text=>text.replace('일부 2군만 선택해 신규 발급할 수 없다','일부 2군만 선택해 신규 발급할 수 있다'));
  assert.match(check(docs),/BROKEN_PIN: COMP-020/);
});
test('lawful individual loss of protection cannot revoke unrelated team licenses as a group',()=>{
  const file='docs/rulebook/10-COMPETITIONS.md';
  const docs=changed(file,text=>text.replace('잔여 구단의 보호권을 일괄 박탈하는 규칙이 아니다','잔여 구단의 보호권도 일괄 박탈한다'));
  assert.match(check(docs),/BROKEN_PIN: COMP-020/);
});
test('protection license cannot expire during the yearly official season',()=>{
  const file='docs/rulebook/10-COMPETITIONS.md';
  const docs=changed(file,text=>text.replace('모든 보호 라이선스 상실의 효력은 연간 경쟁 시즌 종료 이후에만 발생','보호 라이선스 상실은 지역 컵 중간에도 즉시 발생'));
  assert.match(check(docs),/BROKEN_PIN: COMP-021/);
});
test('co-streaming and permanent free VOD cannot be turned into exclusive paid access',()=>{
  const file='docs/rulebook/60-BUSINESS.md';
  const docs=changed(file,text=>text.replace('모든 실제 경기의 다시보기(VOD)는 영구 무료 공개','모든 실제 경기의 다시보기(VOD)는 독점 유료 공개'));
  assert.match(check(docs),/BROKEN_PIN: BIZ-015/);
});
test('elected player representatives cannot be replaced by appointed club agents',()=>{
  const file='docs/rulebook/70-GOVERNANCE.md';
  const docs=changed(file,text=>text.replace('구단별 현역 선수 대표 선출','구단장이 임명한 에이전트 대표'));
  assert.match(check(docs),/BROKEN_PIN: GOV-010/);
});
test('legitimate office review cannot restore withdrawn random violation and sanction events',()=>{
  const file='docs/rulebook/70-GOVERNANCE.md';
  const docs=changed(file,text=>text.replace('불법 출전·무작위 규정 위반을 일부러 발생시키는 사후 징계·이의신청 게임 엔진 승인으로 확대하지 않는다','위반을 무작위로 발생시켜 사후 징계·이의신청 게임 엔진을 운영한다'));
  assert.match(check(docs),/BROKEN_PIN: GOV-011/);
});
test('office leaders cannot ignore disclosure and recusal for conflicts',()=>{
  const file='docs/rulebook/70-GOVERNANCE.md';
  const docs=changed(file,text=>text.replace('공개하고 관련 심의·결정에서 회피','비밀로 하고 스스로 심의·결정'));
  assert.match(check(docs),/BROKEN_PIN: GOV-012/);
});


test('approved payment simplification pays valid funded obligations automatically',()=>{
  const file='docs/rulebook/60-BUSINESS.md';
  const docs=changed(file,text=>text.replace('별도의 반복 조작 없이 기한 내 지급','담당자의 반복 수동 클릭이 있어야만 지급'));
  assert.match(check(docs),/BROKEN_PIN: BIZ-004/);
});
test('unfunded obligations must remain actual outstanding debt',()=>{
  const file='docs/rulebook/60-BUSINESS.md';
  const docs=changed(file,text=>text.replace('자금이 부족하여 이행할 수 없는 확정 의무는 미지급 채무로 기록','자금이 부족한 채무는 무상으로 소멸'));
  assert.match(check(docs),/BROKEN_PIN: BIZ-004/);
});
test('random AI non-payment cannot create artificial defaults',()=>{
  const file='docs/rulebook/60-BUSINESS.md';
  const docs=changed(file,text=>text.replace('AI의 임의 지연이나 시스템상의 지급 누락으로 연체를 생성하지 않는다','AI가 임의로 지급을 건너뛰어 연체를 생성할 수 있다'));
  assert.match(check(docs),/BROKEN_PIN: BIZ-004/);
});
test('subsequent nonpayment cannot automatically revoke executed transfers',()=>{
  const file='docs/rulebook/60-BUSINESS.md';
  const docs=changed(file,text=>text.replace('이미 완료된 이적·출전·경기 결과를 뒤늦은 미지급만으로 자동 소급 취소하지 않는다','뒤늦은 미지급이 있으면 과거 경기·이적을 자동 취소한다'));
  assert.match(check(docs),/BROKEN_PIN: BIZ-004/);
});

test('routine delegation must never override legally reserved final decisions',()=>{
  const file='docs/rulebook/00-CORE.md';
  const docs=changed(file,text=>text.replace('자동 집행이 법적 최종 서명권·의료 불가 판정·공식 참가 자격 검증·선수 동의를 대체해서도 안 된다','시스템이 선수 동의와 계약 최종 서명권을 무시하고 즉시 확정한다'));
  assert.match(check(docs),/BROKEN_PIN: CORE-010/);
});
test('normal routine operations cannot erase real costs or world outcomes',()=>{
  const file='docs/rulebook/00-CORE.md';
  const docs=changed(file,text=>text.replace('실제로 발생한 활동·지급·비용·일정·계약 결과','비용과 지급을 발생하지 않은 것으로 취급한다'));
  assert.match(check(docs),/BROKEN_PIN: CORE-010/);
});

// Later direct user approval: regional windows prioritize mid-season international
// events but remain optional/local; transfers must not bypass legal contracts or registration.
test('regional mid-season windows cannot become mandatory on every international event',()=>{
  const file='docs/rulebook/30-TRANSFERS.md';
  const docs=changed(file,text=>text.replace('국제대회마다 의무적으로 개설하거나','국제대회마다 반드시 개설하며'));
  assert.match(check(docs),/BROKEN_PIN: TRANS-011/);
});
test('regional mid-season windows must remain subject to advance local publication',()=>{
  const file='docs/rulebook/30-TRANSFERS.md';
  const docs=changed(file,text=>text.replace('개장 여부, 횟수 및 시작·종료 시각을 사전에 공표','모든 지역이 같은 날짜에 자동 개장'));
  assert.match(check(docs),/BROKEN_PIN: TRANS-011/);
});
test('regional window cannot void the selling club contract rights',()=>{
  const file='docs/rulebook/30-TRANSFERS.md';
  const docs=changed(file,text=>text.replace('영입 지역의 개장만으로 원소속 구단의 계약상 권리','영입 지역 시장은 원소속 구단의 계약상 권리'));
  assert.match(check(docs),/BROKEN_PIN: TRANS-011/);
});
test('international roster locks must not disappear on mid-season transfer',()=>{
  const file='docs/rulebook/30-TRANSFERS.md';
  const docs=changed(file,text=>text.replace('진행 중인 국제대회의 확정 명단을 소급 변경','진행 중인 국제대회의 명단을 자유롭게 변경'));
  assert.match(check(docs),/BROKEN_PIN: TRANS-011/);
});

test('matrix chapter total must match the real number of clauses',()=>{
  const file='docs/rulebook-audit/CLAUSE_DECISION_MATRIX_2026_11_01.md';
  const docs=changed(file,text=>text.replace('### CORE — 10개 조항','### CORE — 9개 조항'));
  assert.match(check(docs),/MATRIX_CHAPTER_COUNT: CORE/);
});

// Audit coverage is a workflow gate, not a declaration that all source decisions are verified.
test('source-adjudication audit must stay available to rulebook readers',()=>{
  const file='docs/rulebook-audit/STEP1_APPROVAL_EFFECT_AUDIT_2026_11_01.md';
  const docs={...original};
  delete docs[file];
  assert.match(check(docs),/FILE_MISSING/);
});
test('approval-audit link cannot silently point to a nonexistent file',()=>{
  const file='docs/rulebook/README.md';
  const docs=changed(file,text=>text.replace('STEP1_APPROVAL_EFFECT_AUDIT_2026_11_01.md','missing-approval-audit.md'));
  assert.match(check(docs),/BROKEN_LOCAL_LINK/);
});
