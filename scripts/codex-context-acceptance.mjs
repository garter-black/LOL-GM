import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {QUEUE_MARKER,extractCurrentQueue,formatCurrentQueue,searchDocument,formatSearch} from './codex-context.mjs';

const script=fileURLToPath(new URL('./codex-context.mjs',import.meta.url));
const row=n=>'| **'+n+' · 작업** | [#'+(n==='01'?'331':'233')+'](https://github.com/lkh0802a/LOL-GM/issues/'+(n==='01'?'331':'233')+') | 없음 | 검증 필요 |';
const stages=['01','01.5','02','03','04','05','06','07','08','09','10'];
const current=QUEUE_MARKER+'\n# 현재\n## 실제 재편된 순서\n| 단계 | 작업 | PR | 게이트 |\n|---|---|---|---|\n'+stages.map(row).join('\n')+
 '\n\n**단계 밖의 두 필수 역할:** QA\n## 새로운 GitHub 분류 방식\nnotes\n## 보존된 과거 작업지시 — 현재 실행 기준 아님\n| **P0-01** | 구형 #243 |\n';

const q=extractCurrentQueue(current);
assert.deepEqual(q.stages,stages);
const out=formatCurrentQueue(q);
assert(out.includes('#331')&&out.includes('ISSUE_BODY_BYTES')&&!out.includes('#243')&&!out.includes('P0-01'));
assert(q.excerptBytes<q.sourceBytes);
assert.throws(()=>extractCurrentQueue(current.replace(QUEUE_MARKER,'')),/마커/);
assert.throws(()=>extractCurrentQueue(QUEUE_MARKER+'\n'+current),/중복/);
assert.throws(()=>extractCurrentQueue(current.replace('## 보존된 과거 작업지시','## 아래도 현재')),/과거 기록 경계/);
assert.throws(()=>extractCurrentQueue(current.replace(row('10'),'')),/누락/);
assert.throws(()=>extractCurrentQueue(current.replace(row('02'),row('01'))),/중복/);
assert.throws(()=>extractCurrentQueue(current.replace(row('02'),row('02')+'\n| **P0 · 구형** | old |')),/폐기된/);
assert.throws(()=>extractCurrentQueue('x'.repeat(1_000_001)),/크기/);

const policy='## 최신 질문\n규칙 변경 승인\n이전 규칙 없음\n## 과거 기록\n규칙 변경 과거\n'+'다른행\n'.repeat(50)+'규칙 변경 후보\n';
const res=searchDocument(policy,'규칙 변경',{limit:2,context:1});
assert.equal(res.matches,3);assert.equal(res.shown,2);
const search=formatSearch('docs/DECISIONS.md','규칙 변경',res);
assert(search.includes('docs/DECISIONS.md:L1-L6')&&search.includes('추가 1개')&&search.includes('최종 효력을 증명하지 않습니다'));
assert(!search.includes('규칙 변경 후보'));
assert.throws(()=>searchDocument(policy,'a'),/2~100/);
const clipped=searchDocument('a'.repeat(2000)+' 규칙 변경','규칙 변경',{maxLineChars:40});
assert(clipped.excerpts[0].lines[0].length<100);

const dir=await mkdtemp(join(tmpdir(),'lol-gm-codex-context-'));
try{
 const file=join(dir,'issue.md');await writeFile(file,current);
 const good=execFileSync(process.execPath,[script,'--queue-file',file],{encoding:'utf8'});
 assert(good.includes('LOCAL FILE INPUT')&&good.includes('01.5')&&!good.includes('#243'));
 let bad;
 try{execFileSync(process.execPath,[script,'--find','../etc/passwd','--term','secret'],{encoding:'utf8',stdio:'pipe'});}catch(e){bad=e;}
 assert.equal(bad?.status,1);assert.match(bad.stderr.toString(),/docs\/ 내부 Markdown/);
}finally{await rm(dir,{recursive:true,force:true});}
console.log('CODEX_CONTEXT_ACCEPTANCE '+JSON.stringify({
 currentOnly:true,historyExcluded:true,missingMarkersBlocked:true,duplicatesBlocked:true,
 excerptBounded:true,literalScopedSearch:true,offlineCli:true,pathGuard:true
}));
