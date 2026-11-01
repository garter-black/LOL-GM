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
  assert(result.ruleCount>=96); // protect the reviewed baseline without blocking future approved additions
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
  const docs=changed('docs/rulebook/README.md',text=>text.replace('v0.4.0','v9.9.9'));
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
