import {execFileSync} from 'node:child_process';
import {readFile,readdir,readlink,mkdir,writeFile,realpath,unlink,rmdir,lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const git=(root,args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trimEnd();
export function parseWorktrees(text){return text.trim().split(/\n\n+/).filter(Boolean).map(block=>Object.fromEntries(block.split('\n').map(line=>{const i=line.indexOf(' ');return i<0?[line,true]:[line.slice(0,i),line.slice(i+1)];})));}
export const inside=(cwd,root)=>cwd===root||cwd.startsWith(root+path.sep);
export async function inspectProcesses(roots,{proc='/proc',uid=process.getuid?.(),pid=process.pid}={}){
 const ignored=new Set();let current=pid;
 while(current&&!ignored.has(current)){ignored.add(current);try{const status=await readFile(path.join(proc,String(current),'status'),'utf8');current=Number(status.match(/^PPid:\s+(\d+)/m)?.[1]);}catch{break;}}
 const active=[],unknown=[];
 for(const item of await readdir(proc)){if(!/^\d+$/.test(item)||ignored.has(Number(item)))continue;const base=path.join(proc,item);try{
  const status=await readFile(path.join(base,'status'),'utf8');if(Number(status.match(/^Uid:\s+(\d+)/m)?.[1])!==uid||/^State:\s+Z/m.test(status))continue;
  let cwd;try{cwd=await readlink(path.join(base,'cwd'));}catch(error){if(['ENOENT','ESRCH'].includes(error.code))continue;unknown.push({pid:Number(item),code:error.code||'UNKNOWN'});continue;}
  if(!roots.some(root=>inside(cwd,root)))continue;
  active.push({pid:Number(item),cwd,name:status.match(/^Name:\s+(.+)$/m)?.[1]||'unknown',roots:roots.filter(root=>inside(cwd,root))});
 }catch(error){if(!['ENOENT','ESRCH'].includes(error.code))unknown.push({pid:Number(item),code:error.code||'UNKNOWN'});}}
 return {active:active.sort((a,b)=>a.pid-b.pid),unknown:unknown.sort((a,b)=>a.pid-b.pid),scope:'same UID, worktree cwd; no command arguments or environment read'};
}
export async function inspectRepository(root,options={}){
 const target=await realpath(git(root,['rev-parse','--show-toplevel'])),common=await realpath(git(root,['rev-parse','--path-format=absolute','--git-common-dir'])),rows=parseWorktrees(git(root,['worktree','list','--porcelain']));
 const worktrees=rows.map(row=>{const changes=git(row.worktree,['status','--porcelain=v1','-z']).split('\0').filter(Boolean);return {root:row.worktree,head:row.HEAD,branch:row.branch||null,detached:!!row.detached,changes};});
 const processes=await inspectProcesses(worktrees.map(x=>x.root),options),unknown=processes.unknown.length>0,targetActive=processes.active.some(p=>inside(p.cwd,target));
 return {schemaVersion:1,observedAt:new Date().toISOString(),target,commonGitDir:common,head:git(target,['rev-parse','HEAD']),branch:git(target,['branch','--show-current'])||null,worktrees,processes,gates:{editTarget:unknown?'UNKNOWN':targetActive?'BLOCKED_ACTIVE_PROCESS':'READY',localTestQueue:unknown?'UNKNOWN':processes.active.length?'BLOCKED_ACTIVE_PROCESS':'READY'},limits:['Snapshot only: not an atomic process or Git lock.','Does not observe other machines, GitHub CI, scheduler workers or processes whose cwd is outside worktrees.','Confirm the latest checkpoint and exact remote HEAD/CI separately. Dirty work is reported and never reset.']};
}
async function claimLeaseUnlocked(directory,owner){
 if(!owner.runId||!owner.commonGitDir)throw Error('Lease requires runId and commonGitDir');
 try{await mkdir(directory,{mode:0o700});}catch(error){if(error.code!=='EEXIST')throw error;const type=await lstat(directory);if(!type.isDirectory()||type.isSymbolicLink())throw Error('Lease path is not a regular directory');let recorded=null;try{recorded=JSON.parse(await readFile(path.join(directory,'owner.json'),'utf8'));}catch{}return {status:'BLOCKED_EXISTING_LEASE',owner:recorded};}
 try{await writeFile(path.join(directory,'owner.json'),JSON.stringify(owner,null,2),{flag:'wx',mode:0o600});}catch(error){throw new Error('Lease directory retained after incomplete claim: inspect before recovery',{cause:error});}
 return {status:'CLAIMED',owner};
}
async function releaseLeaseUnlocked(directory,expected){
 const type=await lstat(directory),record=await lstat(path.join(directory,'owner.json'));if(!type.isDirectory()||type.isSymbolicLink()||!record.isFile()||record.isSymbolicLink())throw Error('Unsafe lease path; release refused');
 const owner=JSON.parse(await readFile(path.join(directory,'owner.json'),'utf8'));
 if(owner.runId!==expected.runId||owner.commonGitDir!==expected.commonGitDir)throw Error('Lease owner or repository changed; release refused');
 // Never expire a lease from elapsed time or the short-lived CLI process PID.
 await unlink(path.join(directory,'owner.json'));await rmdir(directory);return {status:'RELEASED',owner};
}
async function withLeaseGuard(directory,action){
 const guard=directory+'.guard';try{await mkdir(guard,{mode:0o700});}catch(error){if(error.code==='EEXIST')return {status:'BLOCKED_LEASE_MUTATION'};throw error;}
 try{return await action();}finally{await rmdir(guard);}
}
export const claimLease=(directory,owner)=>withLeaseGuard(directory,()=>claimLeaseUnlocked(directory,owner));
export const releaseLease=(directory,owner)=>withLeaseGuard(directory,()=>releaseLeaseUnlocked(directory,owner));
export async function main(args){
 const values={};for(let i=0;i<args.length;i++){const flag=args[i];if(['--require-idle','--release'].includes(flag)){values[flag]=true;continue;}if(!['--root','--out','--lease-dir','--run-id'].includes(flag)||!args[i+1]||args[i+1].startsWith('--'))throw Error('Usage: --root PATH [--out FILE] [--require-idle] [--lease-dir DIR --run-id ID [--release]]');values[flag]=args[++i];}
 const report=await inspectRepository(values['--root']||process.cwd());let code=0;
 for(const flag of ['--out','--lease-dir'])if(values[flag]){
  // Resolve parent aliases before applying worktree boundaries. Keep the final
  // component un-followed: leases validate it and report creation uses wx.
  values[flag]=path.join(await realpath(path.dirname(path.resolve(values[flag]))),path.basename(values[flag]));
  for(const w of report.worktrees)if(inside(values[flag],await realpath(w.root)))throw Error(flag+' must be outside every worktree; existing source and dirty files are preserved');
 }
 if(values['--out']){try{await lstat(values['--out']);throw Error('Report output already exists; use a new evidence path');}catch(error){if(error.code!=='ENOENT')throw error;}}
 if(values['--require-idle']&&report.gates.localTestQueue!=='READY')code=2;
 if(values['--lease-dir']){if(!values['--run-id'])throw Error('--lease-dir requires --run-id');const owner={runId:values['--run-id'],commonGitDir:report.commonGitDir,head:report.head,claimedAt:report.observedAt};
  if(code||report.gates.editTarget!=='READY'||report.processes.unknown.length){report.lease={status:'BLOCKED_PROCESS_STATE'};code=2;}
  else{report.lease=values['--release']?await releaseLease(values['--lease-dir'],owner):await claimLease(values['--lease-dir'],owner);if(report.lease.status.startsWith('BLOCKED_'))code=2;}
 }else if(values['--release']||values['--run-id'])throw Error('--release/--run-id requires --lease-dir');
 const text=JSON.stringify(report,null,2)+'\n';if(values['--out'])await writeFile(values['--out'],text,{mode:0o600,flag:'wx'});else process.stdout.write(text);return code;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main(process.argv.slice(2)).then(code=>{process.exitCode=code;}).catch(error=>{console.error('CODEX_DEVELOPMENT_PREFLIGHT',error.message);process.exitCode=1;});
