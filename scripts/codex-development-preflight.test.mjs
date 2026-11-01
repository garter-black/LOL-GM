import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,symlink,link,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execFileSync,spawn} from 'node:child_process';
import {once} from 'node:events';
import {inspectRepository,inspectProcesses,claimLease,releaseLease,parseWorktrees,main} from './codex-development-preflight.mjs';

const fixture=()=>mkdtemp(path.join(os.tmpdir(),'lol-gm-development-'));
test('worktree parsing retains detached/branch/path boundaries',()=>{
 assert.deepEqual(parseWorktrees('worktree /tmp/a b\nHEAD abc\nbranch refs/heads/main\n\nworktree /tmp/other\nHEAD def\ndetached\n'),[{worktree:'/tmp/a b',HEAD:'abc',branch:'refs/heads/main'},{worktree:'/tmp/other',HEAD:'def',detached:true}]);
});
test('real git worktrees, dirty files and live same-UID test process block the serial queue',async()=>{
 const base=await fixture(),root=path.join(base,'repo'),other=path.join(base,'validation');await mkdir(root);const git=(...args)=>execFileSync('git',['-C',root,...args],{stdio:'pipe',encoding:'utf8'});
 let child;try{git('init');await writeFile(path.join(root,'source.txt'),'original');git('add','source.txt');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','base');git('worktree','add','--detach',other);await writeFile(path.join(root,'source.txt'),'existing work');await writeFile(path.join(root,'untracked.txt'),'keep');
  const before=await readFile(path.join(root,'source.txt'),'utf8'),head=git('rev-parse','HEAD').trim();child=spawn(process.execPath,['-e','process.stdout.write("ready");setInterval(()=>{},1000)'],{cwd:other,stdio:['ignore','pipe','pipe']});await once(child.stdout,'data');
  await assert.rejects(main(['--root',root,'--out',path.join(root,'source.txt')]),/outside every worktree/);
  // Exercise a defined process namespace containing the real child. Hosted CI
  // can legitimately deny access to unrelated same-UID service processes;
  // production must keep UNKNOWN rather than pretend that host is fully idle.
  const proc=path.join(base,'proc');await mkdir(proc);await symlink('/proc/'+child.pid,path.join(proc,String(child.pid)));
  const report=await inspectRepository(root,{proc});assert.equal(report.head,head);assert.equal(report.worktrees.length,2);assert(report.worktrees.find(x=>x.root===root).changes.some(x=>x.includes('source.txt')));assert(report.worktrees.find(x=>x.root===root).changes.some(x=>x.includes('untracked.txt')));assert.equal(report.gates.editTarget,'READY');assert.equal(report.gates.localTestQueue,'BLOCKED_ACTIVE_PROCESS');assert(report.processes.active.some(x=>x.pid===child.pid&&x.cwd===other));assert.equal(await readFile(path.join(root,'source.txt'),'utf8'),before);assert.equal(git('rev-parse','HEAD').trim(),head);
 }finally{if(child){child.kill();await once(child,'exit');}await rm(base,{recursive:true,force:true});}
});
test('process snapshot excludes zombies/other UID and never reads command arguments or environment',async()=>{
 const proc=await fixture();try{for(const [pid,uid,state,cwd] of [[101,77,'S','/game'],[102,77,'Z','/game'],[103,88,'S','/game'],[104,77,'S','/game-other']]){const d=path.join(proc,String(pid));await mkdir(d);await writeFile(path.join(d,'status'),`Name:\tnode\nState:\t${state}\nPPid:\t0\nUid:\t${uid}\n`);await symlink(cwd,path.join(d,'cwd'));await writeFile(path.join(d,'cmdline'),'PRIVATE_ARGUMENT_DO_NOT_READ');await writeFile(path.join(d,'environ'),'PRIVATE_ENV_DO_NOT_READ');}
  const report=await inspectProcesses(['/game'],{proc,uid:77,pid:999});assert.deepEqual(report.active.map(x=>x.pid),[101]);assert.equal(report.unknown.length,0);assert(!JSON.stringify(report).includes('PRIVATE_'));
 }finally{await rm(proc,{recursive:true,force:true});}
});
test('unreadable process cwd keeps both production gates UNKNOWN without touching source',async()=>{
 const base=await fixture(),root=path.join(base,'repo'),proc=path.join(base,'proc');await mkdir(root);const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8',stdio:'pipe'});
 try{git('init');await writeFile(path.join(root,'source.txt'),'keep');git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','base');const head=git('rev-parse','HEAD').trim();await mkdir(proc);await mkdir(path.join(proc,'101'));await writeFile(path.join(proc,'101/status'),`Name:\tnode\nState:\tS\nPPid:\t0\nUid:\t${process.getuid()}\n`);await writeFile(path.join(proc,'101/cwd'),'not a readable cwd link');
  const report=await inspectRepository(root,{proc});assert.deepEqual(report.processes.unknown,[{pid:101,code:'EINVAL'}]);assert.equal(report.gates.editTarget,'UNKNOWN');assert.equal(report.gates.localTestQueue,'UNKNOWN');assert.equal(await readFile(path.join(root,'source.txt'),'utf8'),'keep');assert.equal(git('rev-parse','HEAD').trim(),head);
 }finally{await rm(base,{recursive:true,force:true});}
});
test('atomic cross-worktree lease permits one claimant; age and wrong owner never release it',async()=>{
 const base=await fixture(),lease=path.join(base,'lease');try{const owners=Array.from({length:12},(_,i)=>({runId:'run-'+i,commonGitDir:'/game/.git',head:'abc',claimedAt:'2000-01-01'}));const results=await Promise.all(owners.map(owner=>claimLease(lease,owner)));assert.equal(results.filter(x=>x.status==='CLAIMED').length,1);const owner=JSON.parse(await readFile(path.join(lease,'owner.json'),'utf8'));const blocked=await claimLease(lease,{...owner,runId:'new'});assert.equal(blocked.status,'BLOCKED_EXISTING_LEASE');await assert.rejects(releaseLease(lease,{...owner,runId:'wrong'}),/refused/);await assert.rejects(releaseLease(lease,{...owner,commonGitDir:'/other/.git'}),/refused/);assert.deepEqual(JSON.parse(await readFile(path.join(lease,'owner.json'),'utf8')),owner);assert.equal((await releaseLease(lease,owner)).status,'RELEASED');assert.equal((await claimLease(lease,{...owner,runId:'next'})).status,'CLAIMED');
 }finally{await rm(base,{recursive:true,force:true});}
});
test('incomplete claim/guard remains blocked and a symlink is never removed',async()=>{
 const base=await fixture(),lease=path.join(base,'lease'),owner={runId:'x',commonGitDir:'/game/.git'};try{await mkdir(lease);assert.deepEqual(await claimLease(lease,owner),{status:'BLOCKED_EXISTING_LEASE',owner:null});await mkdir(lease+'.guard');assert.equal((await claimLease(lease,owner)).status,'BLOCKED_LEASE_MUTATION');await rm(lease+'.guard',{recursive:true});await rm(lease,{recursive:true});const target=path.join(base,'target');await mkdir(target);await writeFile(path.join(target,'owner.json'),JSON.stringify(owner));await symlink(target,lease);await assert.rejects(claimLease(lease,owner),/regular directory/);await assert.rejects(releaseLease(lease,owner),/Unsafe lease path/);assert.deepEqual(JSON.parse(await readFile(path.join(target,'owner.json'),'utf8')),owner);
 }finally{await rm(base,{recursive:true,force:true});}
});

test('CLI output and lease boundaries resolve parent aliases and never replace source or evidence links',async()=>{
 const base=await fixture(),root=path.join(base,'repo');await mkdir(root);const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8',stdio:'pipe'});
 try{git('init');await writeFile(path.join(root,'source.txt'),'preserve source');git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','base');const head=git('rev-parse','HEAD').trim();await symlink(root,path.join(base,'alias'));
  await assert.rejects(main(['--root',root,'--out',path.join(base,'alias','source.txt')]),/outside every worktree/);
  await assert.rejects(main(['--root',root,'--lease-dir',path.join(base,'alias','lease'),'--run-id','fixture']),/outside every worktree/);
  for(const kind of ['symlink','hardlink','dangling']){const out=path.join(base,kind+'.json');if(kind==='hardlink')await link(path.join(root,'source.txt'),out);else await symlink(path.join(root,kind==='dangling'?'not-created':'source.txt'),out);await assert.rejects(main(['--root',root,'--out',out]),/already exists/);assert.equal(await readFile(path.join(root,'source.txt'),'utf8'),'preserve source');}
  const out=path.join(base,'previous.json'),lease=path.join(base,'lease');await writeFile(out,'previous evidence');await assert.rejects(main(['--root',root,'--out',out,'--lease-dir',lease,'--run-id','fixture']),/already exists/);await assert.rejects(readFile(path.join(lease,'owner.json')),{code:'ENOENT'});assert.equal(await readFile(out,'utf8'),'previous evidence');assert.equal(git('rev-parse','HEAD').trim(),head);assert.equal(git('status','--porcelain').trim(),'');
 }finally{await rm(base,{recursive:true,force:true});}
});
