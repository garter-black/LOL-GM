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
  assert(result.ruleCount>=103); // protect the reviewed baseline without blocking future approved additions
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
  const docs=changed('docs/rulebook/README.md',text=>text.replace('v0.6.0','v9.9.9'));
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
  const docs=changed(file,text=>text.replace('산하 2군의 적법한 매각 또는 해체(R01D)','다른 2부로 자동 재배치'));
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
