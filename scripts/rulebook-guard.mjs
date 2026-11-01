import {readFileSync} from 'node:fs';
import {dirname, resolve, posix} from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const CHAPTERS = Object.freeze([
  ['docs/rulebook/00-CORE.md','CORE'],
  ['docs/rulebook/10-COMPETITIONS.md','COMP'],
  ['docs/rulebook/20-CALENDAR.md','CAL'],
  ['docs/rulebook/30-TRANSFERS.md','TRANS'],
  ['docs/rulebook/40-PLAYERS.md','PLAYER'],
  ['docs/rulebook/50-MATCH.md','MATCH'],
  ['docs/rulebook/60-BUSINESS.md','BIZ'],
  ['docs/rulebook/70-GOVERNANCE.md','GOV'],
  ['docs/rulebook/80-EXPERIENCE.md','UI'],
]);
export const DOCUMENTS = Object.freeze([
  ...CHAPTERS.map(([path])=>path),
  'docs/rulebook/README.md',
  'docs/rulebook/CHANGELOG.md',
  'docs/AI_RULEBOOK_GUIDE.md',
  'docs/RULEBOOK_MIGRATION_AUDIT.md',
  'docs/RULEBOOK_APPROVAL_ADJUDICATION_2026_11_01.md',
  'docs/rulebook-audit/CLAUSE_DECISION_MATRIX_2026_11_01.md',
  'docs/rulebook-audit/STEP1_APPROVAL_EFFECT_AUDIT_2026_11_01.md',
  'docs/rulebook-audit/STEP1_CHOICE_SOURCE_INVENTORY_2026_11_01.md',
  'docs/rulebook-audit/STEP1_CHOICE_SOURCE_INVENTORY_B_2026_11_01.md',
  'docs/rulebook-audit/STEP1_SUPERSESSION_CHAINS_2026_11_01.md',
  'docs/rulebook-audit/STEP1_CROSS_ISSUE_EFFECT_AUDIT_2026_11_01.md',
  'docs/rulebook-audit/STEP1_R01_R21_SOURCE_ADJUDICATION_2026_11_01.md',
  'docs/rulebook-audit/STEP1_CALENDAR_LICENSE_SUPERSESSION_2026_11_01.md',
  'docs/rulebook-audit/STEP1_QA72_NORMATIVE_BOUNDARY_2026_11_01.md',
  'docs/rulebook-audit/STEP1_SOURCE_COMPLETENESS_AND_DECISION_GATE_2026_11_01.md',
  'docs/rulebook-audit/STEP1_M01_M212_SOURCE_DETAIL_2026_11_01.md',
  'docs/rulebook-audit/STEP1_R_CHOICES_SOURCE_DETAIL_2026_11_01.md',
  'docs/rulebook-audit/STEP1_INITIAL_30_DECISION_DETAILS_2026_11_01.md',
  'docs/rulebook-audit/STEP1_ALL_ISSUE_POLICY_CLASSIFICATION_2026_11_01.md',
  'docs/rulebook-audit/STEP1_LEGACY_PR_NORMATIVE_BOUNDARY_2026_11_01.md',
  'docs/rulebook-audit/STEP1_42_CLAUSES_SOURCE_PRECISION_QUEUE_2026_11_01.md',
  'docs/rulebook-audit/STEP1_DIRECT_ISSUE_SOURCE_16_CLAUSES_2026_11_01.md',
  'docs/rulebook-audit/STEP1_PR_BODY_POLICY_SCREEN_2026_11_01.md',
  'docs/rulebook-audit/CROSS_DOCUMENT_CONFLICT_AUDIT_2026_11_01.md',
  'docs/RULEBOOK_SEMANTIC_AUDIT_2026_11_01.md',
  'AGENTS.md',
]);

// These are regression sentinels for the APPROVED DOCUMENTED policy, not a
// substitute for running the game's contract/calendar/match/finance tests.
export const POLICY_PINS = Object.freeze({
  'CORE-009':[/개발 초기·잦은 구조 교체 단계/,/안정화 단계에 진입하면 지원 대상 구버전의 호환 또는 명시적 마이그레이션을 필수 정책으로 강화/,/안정화 진입 시점과 지원 포맷은 명시/,/비호환 전환·내보내기\/고지를 명확히 기록/,/원자적 마지막 성공 스냅샷·실패 복구·슬롯 격리/,/소급 수정하는 것/],
  'COMP-012':[/정체성과 행사 연속성은 영구 보장/,/저흥행만을 이유로 자동 폐지할 수 없다/,/영구 최대 개수가 아니다/,/참가 방식·규모·세부 형식을 재편/],
  'CORE-010':[/중대한 선택/,/정형적으로 반복되는 운영·정산·일상 업무는 담당자와 세계 엔진이 자동 집행/,/실제로 발생한 활동·지급·비용·일정·계약 결과/,/자동 집행이 법적 최종 서명권·의료 불가 판정·공식 참가 자격 검증·선수 동의를 대체해서도 안 된다/,/사용자와 AI에 동일한 권한·제약·비용 원칙/,/BIZ-004/],
  'BIZ-004':[/실제 가용자금이 충분하고 유효한 지급 조건을 충족한 채무는 별도의 반복 조작 없이 기한 내 지급/,/AI의 임의 지연이나 시스템상의 지급 누락으로 연체를 생성하지 않는다/,/자금이 부족하여 이행할 수 없는 확정 의무는 미지급 채무로 기록/,/기존 유효 계약과 적용 규정에 명시된 경우에만/,/새 임의 연체료·강제 추심·반복 납부 조작을 신설하지 않는다/,/바이아웃 요건을 미지급 장부로 우회해서는 안 되며/,/자동 소급 취소하지 않는다/],
  'COMP-018':[/공식 지역·국제대회는 적법한 공식 사무국/,/직접 주관·운영한다/,/공식 대회로 편입·전환할 수 없다/,/공인 여부와 공식 개최 주체/,/공식 국제대회 출전권과 계수는 자동 발생하지 않는다/],
  'COMP-019':[/동률은 해당 대회의 경기 시작 전에 공표된 타이브레이크 규정/,/규정이 순위 결정전을 실제로 요구하는 경우에만/,/모든 동률에 별도 결정전을 일률적으로 강제하지 않으며/,/87C의 87B 최종 철회·정정/],
  'COMP-020':[/일부 2군만 선택해 신규 발급할 수 없다/,/독립 구단 집단 역시 신규 보호권 발급에서/,/독립 구단 전원 보호 시 2군 전원도 보호되어야 하며/,/잔여 구단의 보호권을 일괄 박탈하는 규칙이 아니다/],
  'COMP-021':[/1군의 유효한 기준 보호 라이선스를 필요조건/,/모든 보호 라이선스 상실의 효력은 연간 경쟁 시즌 종료 이후에만 발생/,/2군 보호권이 자동 복원되지는 않으며/,/자동 강등·퇴출·경기 결과 소급 취소가 아니며/],
  'BIZ-015':[/공식 경기의 같이보기·동시 중계\(코스트리밍\)는 모든 시청자와 스트리머에게 자유롭게 허용/,/모든 실제 경기의 다시보기\(VOD\)는 영구 무료 공개/,/기존 유효한 광고·계약상 책임/,/영상 파일을 별도로 영구 보존하거나 실제 발생하지 않은 영상을 자동 생성해야 한다는 뜻이 아니며/],
  'GOV-010':[/구단별 현역 선수 대표 선출/,/에이전트 대리권/,/이적·은퇴·구단 해체/],
  'GOV-011':[/독립적인 행정 재심/,/사무국장 1인의 자의적 즉시 번복/,/불법 출전·무작위 규정 위반을 일부러 발생시키는 사후 징계·이의신청 게임 엔진 승인으로 확대하지 않는다/,/사전 검증/],
  'GOV-012':[/이해충돌이 있는 안건/,/공개하고 관련 심의·결정에서 회피/,/무작위 사건으로 발생시키는 게임 시스템을 허가하지 않는다/],
  'CORE-007':[/공식 대회 체계의 구조적 개편은 원칙적으로 차기 시즌부터/,/기존 독립 대회의 구조적 개편은 원칙적으로 차기 회차부터/,/신규 독립 대회는 당해 시즌에도 신설할 수 있으나/,/공식 일정 우선권/,/세계 공통 경기 금지 기간/,/소급 변경할 수 없으며/],
  'COMP-011':[/공식 대회 체계의 구조적 개편을 원칙적으로 차기 시즌부터/,/기존 독립 대회의 구조를 개편하는 경우에는 원칙적으로 차기 회차부터/,/새로운 독립 대회는 당해 시즌에도 적법하게 신설할 수 있다/,/공식 대회 우선권/,/세계 공통 경기 금지 기간의 검증을 통과해야 한다/,/소급 변경되지 않으며/],
  'COMP-003':[/신규 지역/,/2부/,/권고/],
  'CAL-001':[/12월 첫째 화요일 00:00 UTC/],
  'CAL-002':[/28일/,/종료 시각/],
  'CAL-003':[/공식 지역/,/공식 국제/,/독립 지역/,/독립 국제/,/금지/],
  'CAL-004':[/World/,/마지막 공식 경기/,/양 팀의 적법한 실격/,/우승자·경기·경기 시각을 만들어내지 않고 결승 단계의 종료\/판정 이력으로 피날레를 확인/,/COMP-006의 무우승 판정/],
  'TRANS-003':[/7일/,/14일/,/동의/,/TRANS-005/,/미보유/],
  'TRANS-005':[/라이선스 미보유/,/바이아웃/,/원소속|원팀/],
  'TRANS-011':[/공식 국제대회가 진행되는 기간을 우선적인 개장 시점으로 활용/,/국제대회마다 의무적으로 개설하거나/,/개장 여부, 횟수 및 시작·종료 시각을 사전에 공표/,/계약 선수 완전이적·임대 영입/,/원소속 구단의 동의 또는 합법적인 바이아웃/,/영입 지역의 개장만으로 원소속 구단의 계약상 권리/,/국제대회 참가 중인 선수도 적법한 이적 협상·체결/,/확정 명단을 소급 변경/,/CAL-001~003/,/TRANS-004/,/TRANS-005/],
  'PLAYER-002':[/5대5/,/1~5인/,/파티/],
  'PLAYER-004':[/RP/,/세계 순위/],
  'PLAYER-006':[/1인 1계정|인물 한 명당 고유 랭크 계정 하나/,/닉네임 변경/,/실명/,/요구하지 않는다/],
  'BIZ-010':[/100% 소유/,/한 곳뿐/,/독립 경영/],
  'BIZ-011':[/육성/,/실제 예산/,/미확정/,/중복 계산/],
  'BIZ-012':[/프로\/세미프로\/아마추어/,/배타적/,/프로 라이선스/],
  'COMP-004':[/동일한 부/,/적격한 실제 하위 부/,/행정적으로 이동/,/매각 또는 해체/,/일반 자동 강등이 아니며/,/하위 부의 실재 여부·등록 자격·수용 정원/,/다른.*2부로의 임의 재배치/,/COMP-017/],
  'COMP-006':[/엘리미네이션 단계\/브래킷/,/대회 전체에서 2패를 초과할 수 없다는 뜻이 아니다/,/Grand Final Reset/,/양 팀 적법 실격/],
  'COMP-015':[/MSI 미진출팀/,/Masters/,/Open/,/중복 출전/],
  'BIZ-013':[/상위 5명/,/전체 선수단/,/미확정/],
  'BIZ-014':[/유한/,/복제/,/인수/],
  'MATCH-008':[/순수 밸런스 핫픽스/,/전 세계의 해당 일자 공식 대회 경기와 세트가 모두 종료된 이후/,/한 번만/,/패치 잠금/],
  'MATCH-011':[/주장/,/도입하지 않는다/],
  'COMP-014':[/공식 지역대회/,/독립 지역대회/,/참가/],
  'MATCH-002':[/Fearless Draft/,/해제/],
  'MATCH-003':[/First Selection/,/변경 대상이 아니다/],
  'GOV-004':[/과반/,/지역 대표/],
  'UI-002':[/삭제/,/다른 슬롯/],
  'UI-007':[/완전한 재현에 필요한 근거가 부족한 경우/,/재현의 한계를 명시/,/저장된 공식 판정과 역사를 우선/],
  'UI-009':[/게임 세계 밖의 개발·설계 메타 설명/,/오류/,/GitHub/],
  'UI-010':[/제출하지 않은/,/다시 검증/,/이미 제출된/,/확정된 지급/],
  'CAL-009':[/같은 공식 지역리그/,/겹치지 않도록/,/서로 다른 공식 리그/],
  'CAL-010':[/하루에 한 공식 시리즈만/,/타이브레이크/,/예외의 발생 근거·해당 팀·단계·시리즈를 기록/],
  'CAL-011':[/연쇄적으로 순연하거나 취소하지 않는다/,/같은 대회 안/],
  'BIZ-001':[/구단 인수만으로 구단명·브랜드를 변경하거나 팬덤을 일률적으로 감소시키지 않는다/,/리브랜딩은 권리와 독립 경영을 존중하는 별도의 적법한 선택/],
  'BIZ-007':[/숨은 능력·잠재력이나 비공개 진료·보고서를 직접 읽지 않는다/,/실제 경기와 이후 공개 평판에 간접적으로 반영/],
  'COMP-016':[/승강 결정전/,/자동 승격·강등시키지 않는다/,/다음 시즌부터/],
  'COMP-017':[/2군은 공식 지역리그에서 승격하거나 승격 결정전에 참가할 수 없다/,/승격권/],
});

export function readDocuments(root=ROOT){
  return Object.fromEntries(DOCUMENTS.map(file=>[file,readFileSync(resolve(root,file),'utf8')]));
}

export function validateRulebook(docs){
  const errors=[],ids=new Map();
  const add=(code,message)=>errors.push(code+': '+message);
  for(const file of DOCUMENTS){
    if(typeof docs[file]!=='string'||!docs[file].trim())add('FILE_MISSING',file);
  }
  if(errors.length)return {errors,ruleCount:0,chapterCount:0};
  for(const [file,prefix] of CHAPTERS){
    const content=docs[file];
    const matches=[...content.matchAll(/^### ([A-Z]+)-([0-9]{3}) · ([^\n]+)$/gm)];
    if(!matches.length)add('NO_RULES',file);
    for(let i=0;i<matches.length;i++){
      const m=matches[i],id=m[1]+'-'+m[2],body=content.slice(m.index+m[0].length,matches[i+1]?.index??content.length);
      if(m[1]!==prefix)add('WRONG_CHAPTER',file+' '+id+' belongs in '+prefix);
      if(ids.has(id))add('DUPLICATE_ID',id+' '+ids.get(id).file+' '+file);
      if(!body.trim())add('EMPTY_RULE',id);
      if(!/https:\/\/github\.com\/lkh0802a\/LOL-GM\/issues\/[0-9]+/.test(body))add('NO_SOURCE',id);
      ids.set(id,{file,body});
    }
  }
  // Editorial diagnostics only: obvious conversational expressions do not
  // belong in the current normative chapters. Historical evidence remains intact.
  const colloquial=/가짜|딱지|원팀|그해|그때|꾸며내|하드코딩|버프/;
  for(const [file] of CHAPTERS){
    const match=colloquial.exec(docs[file]);
    if(match)add('COLLOQUIAL_STYLE',file+' contains informal wording: '+match[0]);
  }
  for(const [id,checks] of Object.entries(POLICY_PINS)){
    const rule=ids.get(id);
    if(!rule){add('MISSING_PIN',id);continue;}
    for(const re of checks)if(!re.test(rule.body))add('BROKEN_PIN',id+' missing '+re.source);
  }
  // The non-normative adjudication matrix must reflect current clauses and
  // evidence depth. This verifies indexing, NOT whether a linked source
  // actually contains the user's final approval.
  const matrix=docs['docs/rulebook-audit/CLAUSE_DECISION_MATRIX_2026_11_01.md'];
  const matrixIds=new Set();
  const matrixStatusCounts=new Map();
  let matrixDirect=0;
  for(const line of matrix.split('\n')){
    const m=line.match(/^\| ([A-Z]+-\d{3}) \|/);
    if(!m)continue;
    const id=m[1];
    const cells=line.split('|').map(part=>part.trim());
    if(matrixIds.has(id))add('MATRIX_DUPLICATE',id);
    matrixIds.add(id);
    const rule=ids.get(id);
    if(!rule){add('MATRIX_ORPHAN',id);continue;}
    const declared=cells[4];
    const actual=/issues\/\d+#issuecomment-\d+/.test(rule.body)?'댓글 직접 링크':'이슈·기타';
    if(declared!==actual)add('MATRIX_SOURCE_DEPTH',id+' expected '+actual+' found '+declared);
    if(actual==='댓글 직접 링크')matrixDirect++;
    const status=cells[5];
    if(!['관련 원문 부분대조','세부 판정 대기','**후속 대체 확인·교정 필요**'].includes(status)){
      add('MATRIX_STATUS',id+' '+status);
    }
    matrixStatusCounts.set(status,(matrixStatusCounts.get(status)||0)+1);
  }
  // Chapter headings are human-facing totals and must match the indexed rules.
  for(const [,prefix] of CHAPTERS){
    const m=matrix.match(new RegExp('^### '+prefix+' — (\\d+)개 조항$', 'm'));
    const actual=[...ids.keys()].filter(id=>id.startsWith(prefix+'-')).length;
    if(!m||Number(m[1])!==actual)add('MATRIX_CHAPTER_COUNT',prefix+' '+(m?.[1]??'missing')+' / '+actual);
  }
  for(const id of ids.keys())if(!matrixIds.has(id))add('MATRIX_MISSING',id);
  if(matrixIds.size!==ids.size)add('MATRIX_COUNT','matrix '+matrixIds.size+' / rules '+ids.size);
  const summaries=[
    ['관련 원문 부분대조','관련 원문 부분대조'],
    ['세부 판정 대기','세부 판정 대기'],
    ['후속 대체 확인·교정 필요','**후속 대체 확인·교정 필요**'],
  ];
  for(const [label,status] of summaries){
    const line=matrix.split('\n').find(l=>l.startsWith('| '+label+' |'));
    const declared=line?Number(line.split('|')[2].trim()):NaN;
    if(!Number.isInteger(declared)||declared!==(matrixStatusCounts.get(status)||0)){
      add('MATRIX_SUMMARY',label+' '+declared+' / '+(matrixStatusCounts.get(status)||0));
    }
  }
  const depthLine=matrix.split('\n').find(l=>l.startsWith('| 직접 댓글 링크 포함 |'));
  const declaredDirect=depthLine?Number(depthLine.split('|')[2].trim()):NaN;
  if(declaredDirect!==matrixDirect)add('MATRIX_DEPTH_SUMMARY',declaredDirect+' / '+matrixDirect);

  // Existing AGENTS.md intentionally links many legacy documents outside
  // this limited rulebook fixture; only validate relative links authored here.
  for(const file of [...CHAPTERS.map(([path])=>path),'docs/rulebook/README.md','docs/rulebook/CHANGELOG.md','docs/AI_RULEBOOK_GUIDE.md']){
    const content=docs[file];
    for(const match of content.matchAll(/\[[^\]\n]+\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)){
      const target=match[1].split('#')[0];
      if(!target||/^(?:https?:\/\/|mailto:)/i.test(target))continue;
      if(target.startsWith('/')||target.startsWith('..'+posix.sep+'..'+posix.sep)){
        // One parent level (e.g. ../AI_RULEBOOK_GUIDE.md) is legitimate;
        // the normalized destination must remain in the repository.
      }
      const joined=posix.normalize(posix.join(posix.dirname(file),target));
      if(joined==='..'||joined.startsWith('../')||joined.startsWith('/'))add('LINK_ESCAPE',file+' -> '+target);
      else if(!(joined in docs))add('BROKEN_LOCAL_LINK',file+' -> '+joined);
    }
  }

  // Provenance depth is reported as a metric, not a proxy for approval validity:
  // issue-level citations can still be valid but require more precise adjudication.
  const sourceDepth = {
    directCommentLinked: [...ids.values()].filter(({body}) => /issues\/\d+#issuecomment-\d+/.test(body)).length,
    issueOnlyOrOther: [...ids.values()].filter(({body}) => !/issues\/\d+#issuecomment-\d+/.test(body)).length,
  };
  const agent=docs['AGENTS.md'];
  for(const required of ['## 규정집 필수 참조','docs/rulebook/README.md','docs/AI_RULEBOOK_GUIDE.md','npm run check:rulebook']){
    if(!agent.includes(required))add('CODEX_ENTRY',required);
  }
  if(!docs['docs/AI_RULEBOOK_GUIDE.md'].includes('비규범'))add('GUIDE_SCOPE','AI guide must not define new policy');
  // Version is a living publication marker, not a hard-coded initial release.
  const version=docs['docs/rulebook/README.md'].match(/\*\*규정집 발행본:\*\*\s*(v\d+\.\d+\.\d+)/)?.[1];
  if(!version)add('VERSION','rulebook README lacks a semantic publication version');
  else if(!docs['docs/rulebook/CHANGELOG.md'].includes(' '+version))add('CHANGELOG','no entry for the current rulebook version '+version);
  return {errors,ruleCount:ids.size,chapterCount:CHAPTERS.length,sourceDepth};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const result=validateRulebook(readDocuments());
  if(result.errors.length){
    for(const error of result.errors)console.error('rulebook: '+error);
    process.exitCode=1;
  }else{
    console.log('rulebook: PASS '+result.ruleCount+' documented clauses across '+result.chapterCount+' chapters; '+result.sourceDepth.directCommentLinked+' direct-comment-linked; '+result.sourceDepth.issueOnlyOrOther+' issue-level/other-linked. IDs, links, Codex entrypoint and policy pins verified (DOCUMENT CHECK ONLY; SOURCE LINKS DO NOT VERIFY APPROVAL)');
  }
}
