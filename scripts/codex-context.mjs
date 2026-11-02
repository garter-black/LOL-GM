// Small, fail-closed context excerpts for Codex. Do not promote historical notes to active instructions.
import {execFileSync} from 'node:child_process';
import {readFile,realpath,stat} from 'node:fs/promises';
import {resolve,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

export const QUEUE_MARKER='<!-- CANONICAL-EXECUTION-LANES-20261101 -->';
const HISTORY_HEADING='## 보존된 과거 작업지시';
const QUEUE_HEADING='## 실제 재편된 순서';
const QUEUE_END='**단계 밖의 두 필수 역할:**';
const REPO='lkh0802a/LOL-GM';
const ROOT=fileURLToPath(new URL('../',import.meta.url));

export function extractCurrentQueue(body){
 if(typeof body!=='string'||Buffer.byteLength(body)>1_000_000)throw Error('이슈 #242 원문이 없거나 허용 크기를 넘었습니다');
 const p=body.indexOf(QUEUE_MARKER);
 if(p<0||p>4096||body.indexOf(QUEUE_MARKER,p+QUEUE_MARKER.length)>=0)throw Error('현재 실행표 마커 누락·중복: #242 최신 이슈를 직접 확인하세요');
 const h=body.indexOf(HISTORY_HEADING,p+QUEUE_MARKER.length);
 if(h<0)throw Error('과거 기록 경계 누락: 현재 지시와 역사를 안전하게 분리할 수 없습니다');
 const current=body.slice(p,h), a=current.indexOf(QUEUE_HEADING), b=current.indexOf(QUEUE_END,a+QUEUE_HEADING.length);
 if(a<0||b<0||b<=a)throw Error('실행표 시작/종료 경계 변경: #242 직접 확인 필요');
 const section=current.slice(a,b).trim();
 if(Buffer.byteLength(section)>18_000)throw Error('현재 실행표 출력 한도 초과: 임의 절단 없이 #242 직접 확인 필요');
 const rows=section.split('\n').filter(s=>/^\| \*\*\d+(?:\.\d+)? ·/.test(s));
 const stages=rows.map(s=>s.match(/^\| \*\*(\d+(?:\.\d+)?) ·/)[1]);
 if(rows.length<10||rows.length>16||new Set(stages).size!==rows.length||!stages.includes('01')||!stages.includes('01.5')||!stages.includes('02')||!stages.includes('10'))
  throw Error('실행 단계 누락·중복 또는 예상 체계 불일치: #242 직접 확인 필요');
 if(/\|\s*\*\*P[012]\b/.test(section))throw Error('폐기된 P0/P1/P2 분류가 현재 실행표에 혼입됨');
 return {section,stages,sourceBytes:Buffer.byteLength(body),excerptBytes:Buffer.byteLength(section)};
}

export function formatCurrentQueue({section,sourceBytes,excerptBytes}){
 return 'SOURCE: https://github.com/'+REPO+'/issues/242 (현재 실행표만; 과거 기록 제외)\n'
  +'ISSUE_BODY_BYTES '+sourceBytes+' / EXCERPT_BYTES '+excerptBytes+'\n'
  +'주의: 착수 순서일 뿐 완료·Codex 실행·CI PASS 증거 아님. 현재 PR/HEAD/체크포인트 재확인 필수.\n\n'
  +section+'\n';
}

export function searchDocument(text,term,{limit=4,context=2,maxLineChars=420}={}){
 if(typeof term!=='string'||term.trim().length<2||term.length>100)throw Error('검색어는 2~100자 리터럴로 입력하세요');
 if(!Number.isInteger(limit)||limit<1||limit>10||!Number.isInteger(context)||context<0||context>4)throw Error('검색 범위 오류');
 const lines=text.split(/\r?\n/),needle=term.toLocaleLowerCase('ko'),matches=[];
 for(let i=0;i<lines.length;i++)if(lines[i].toLocaleLowerCase('ko').includes(needle))matches.push(i);
 const windows=[];
 for(const i of matches.slice(0,limit)){
  const start=Math.max(0,i-context),end=Math.min(lines.length-1,i+context);
  if(windows.length&&start<=windows[windows.length-1].end+1)windows[windows.length-1].end=Math.max(end,windows[windows.length-1].end);
  else windows.push({start,end});
 }
 const excerpts=windows.map(w=>({startLine:w.start+1,endLine:w.end+1,lines:lines.slice(w.start,w.end+1).map((value,j)=>{
  const clipped=value.length>maxLineChars?value.slice(0,maxLineChars)+' … [긴 행 생략; 원문 확인]':value;
  return (w.start+j+1)+': '+clipped;
 })}));
 return {matches:matches.length,shown:Math.min(matches.length,limit),totalLines:lines.length,excerpts};
}

export function formatSearch(path,term,r){
 const out=['SOURCE: '+path+' / 검색어 '+JSON.stringify(term)+' / 전체 일치 행 '+r.matches+' / 표시 '+r.shown+' / 총 '+r.totalLines+'행',
  '경고: 검색 결과는 역사·설계·철회 기록일 수 있으며 현행 승인/최종 효력을 증명하지 않습니다. 원문·#331/룰북·후속 결정을 교차 확인하세요.'];
 for(const p of r.excerpts)out.push('\n'+path+':L'+p.startLine+'-L'+p.endLine+'\n'+p.lines.join('\n'));
 if(r.shown<r.matches)out.push('\n추가 '+(r.matches-r.shown)+'개 일치 행 미표시. 검색어 구체화 또는 원문 범위 확인 필요.');
 return out.join('\n')+'\n';
}

async function liveIssue(){
 let data,ghError='';
 try{
  const raw=execFileSync('gh',['issue','view','242','--repo',REPO,'--json','number,title,state,body'],{
   encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:15_000,maxBuffer:1_500_000});
  data=JSON.parse(raw);
 }catch(e){ghError=e.message;}
 if(!data){
  // Public-repository fallback: no new dependency or GitHub CLI auth required.
  const headers={'Accept':'application/vnd.github+json','User-Agent':'LOL-GM-Codex-Context'};
  const token=process.env.GH_TOKEN||process.env.GITHUB_TOKEN;
  if(token)headers.Authorization='Bearer '+token;
  try{
   const response=await fetch('https://api.github.com/repos/'+REPO+'/issues/242',{
    headers,signal:AbortSignal.timeout(15_000)});
   if(!response.ok)throw Error('HTTP '+response.status);
   const issue=await response.json();
   data={number:issue.number,state:issue.state,body:issue.body,title:issue.title};
  }catch(e){throw Error('실시간 #242 조회 실패 (gh: '+ghError+'; REST: '+e.message+'). 직접 GitHub 확인 또는 --queue-file 수동 입력 필요');}
 }
 if(data.number!==242||String(data.state).toUpperCase()!=='OPEN')throw Error('#242 번호·상태 불일치: 자동 착수 중단');
 return data.body;
}

async function safeDoc(path){
 if(!/^docs\/[\w./-]+\.md$/.test(path)||path.split('/').includes('..'))throw Error('docs/ 내부 Markdown 경로만 허용합니다');
 const full=resolve(ROOT,path),real=await realpath(full),rel=relative(ROOT,real);
 if(!rel||rel==='..'||rel.startsWith('..'+sep))throw Error('저장소 밖 symlink/경로 읽기 거부');
 const info=await stat(real);if(!info.isFile()||info.size>5_000_000)throw Error('문서 형식 또는 크기 제한 초과');
 return readFile(real,'utf8');
}

async function main(args){
 if(args.length===1&&args[0]==='--queue'){
  console.log(formatCurrentQueue(extractCurrentQueue(await liveIssue())).trimEnd());return;
 }
 if(args.length===2&&args[0]==='--queue-file'){
  const info=await stat(args[1]);if(!info.isFile()||info.size>1_000_000)throw Error('오프라인 이슈 입력 파일이 너무 큼');
  console.log('LOCAL FILE INPUT: GitHub 실시간 검증 아님');
  console.log(formatCurrentQueue(extractCurrentQueue(await readFile(args[1],'utf8'))).trimEnd());return;
 }
 if(args.length===4&&args[0]==='--find'&&args[2]==='--term'){
  const doc=await safeDoc(args[1]),result=searchDocument(doc,args[3]);
  console.log(formatSearch(args[1],args[3],result).trimEnd());return;
 }
 throw Error('사용법: node scripts/codex-context.mjs --queue | --queue-file <242-issue-body.md> | --find docs/DECISIONS.md --term <검색어>');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main(process.argv.slice(2)).catch(e=>{console.error('CODEX_CONTEXT_BLOCKED:',e.message);process.exitCode=1;});
}
