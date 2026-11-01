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
  'docs/RULEBOOK_SEMANTIC_AUDIT_2026_11_01.md',
  'AGENTS.md',
]);

// These are regression sentinels for the APPROVED DOCUMENTED policy, not a
// substitute for running the game's contract/calendar/match/finance tests.
export const POLICY_PINS = Object.freeze({
  'COMP-003':[/신규 지역/,/2부/,/권고/],
  'CAL-001':[/12월 첫째 화요일 00:00 UTC/],
  'CAL-002':[/28일/,/종료 시각/],
  'CAL-003':[/공식 지역/,/공식 국제/,/독립 지역/,/독립 국제/,/금지/],
  'CAL-004':[/World/,/마지막 공식 경기/],
  'TRANS-003':[/7일/,/14일/,/동의/,/TRANS-005/,/미보유/],
  'TRANS-005':[/라이선스 미보유/,/바이아웃/,/원소속|원팀/],
  'PLAYER-002':[/5대5/,/1~5인/,/파티/],
  'PLAYER-004':[/RP/,/세계 순위/],
  'PLAYER-006':[/1인 1계정|인물 한 명당 고유 랭크 계정 하나/,/닉네임 변경/,/실명/,/요구하지 않는다/],
  'BIZ-010':[/100% 소유/,/한 곳뿐/,/독립 경영/],
  'BIZ-011':[/육성/,/실제 예산/,/미확정/,/중복 계산/],
  'BIZ-012':[/프로\/세미프로\/아마추어/,/배타적/,/프로 라이선스/],
  'COMP-004':[/같은 공식 2부/,/매각 또는 해체/,/R01D/],
  'COMP-006':[/엘리미네이션 단계\/브래킷/,/대회 전체에서 2패를 초과할 수 없다는 뜻이 아니다/,/Grand Final Reset/,/양 팀 적법 실격/],
  'COMP-015':[/MSI 미진출팀/,/Masters/,/Open/,/중복 출전/],
  'BIZ-013':[/상위 5명/,/전체 선수단/,/미확정/],
  'BIZ-014':[/유한/,/복제/,/인수/],
  'MATCH-011':[/주장/,/도입하지 않는다/],
  'COMP-014':[/공식 지역대회/,/독립 지역대회/,/참가/],
  'MATCH-002':[/Fearless Draft/,/해제/],
  'MATCH-003':[/First Selection/,/변경 대상이 아니다/],
  'GOV-004':[/과반/,/지역 대표/],
  'UI-002':[/삭제/,/다른 슬롯/],
  'UI-009':[/게임 세계 밖의 개발·설계 메타 설명/,/오류/,/GitHub/],
  'UI-010':[/제출하지 않은/,/다시 검증/,/이미 제출된/,/확정된 지급/],
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
