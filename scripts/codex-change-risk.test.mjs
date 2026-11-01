import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,symlink,link,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import {classifyChanges,parseNameStatus,main} from './codex-change-risk.mjs';

test('path/status risk is conservative and cannot authorize merge from labels or passed tests',()=>{
 for(const [file,expected] of [['docs/guide.md',1],['scripts/new-acceptance.mjs',2],['src/ui-v2/contracts.js',2],['src/artifact/finance.js',2],['src/artifact/engine.js',3],['src/artifact/match-core-state.js',3],['src/artifact/save.js',3],['src/artifact/competition-worlds.js',3],['.github/workflows/ci.yml',3],['AGENTS.md',3],['docs/DECISIONS.md',3],['package.json',3],['scripts/codex-change-risk.mjs',3],['unknown.js',2],['../outside',3]]){
  const result=classifyChanges([{status:'M',path:file,label:'low-risk',tests:'PASS'}]);assert.equal(result.level,expected,file);assert.equal(result.automaticMergeAllowed,false);assert.equal(result.approval,'HUMAN_REVIEW_REQUIRED');
 }
 assert.equal(classifyChanges([{status:'A',path:'scripts/new-acceptance.mjs'}]).level,1);
 for(const status of ['D','T','R100','?'])assert.equal(classifyChanges([{status,path:'scripts/old.test.mjs'}]).level,3);
 assert.equal(classifyChanges([]).automaticMergeAllowed,false);assert.equal(classifyChanges([{status:'M',path:'README.md'},{status:'M',path:'.github/workflows/ci.yml'}]).level,3);
});
test('NUL name-status parser preserves special names and refuses incomplete output',()=>{
 assert.deepEqual(parseNameStatus('A\0docs/a b.md\0D\0old\nfile.js\0'),[{status:'A',path:'docs/a b.md'},{status:'D',path:'old\nfile.js'}]);assert.throws(()=>parseNameStatus('M\0'),/Incomplete/);
});
test('actual committed diff binds report to exact base/head and detects removed test as high risk',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'lol-gm-risk-'));const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8',stdio:'pipe'});try{git('init');await mkdir(path.join(root,'scripts'));await writeFile(path.join(root,'scripts/old.test.mjs'),'original assertions');git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','base');const base=git('rev-parse','HEAD').trim();await rm(path.join(root,'scripts/old.test.mjs'));await writeFile(path.join(root,'README.md'),'new docs');git('add','-A');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','change');const head=git('rev-parse','HEAD').trim(),out=path.join(root,'risk.json');await main(['--root',root,'--base',base,'--head',head,'--out',out]);const report=JSON.parse(await readFile(out,'utf8'));assert.equal(report.base,base);assert.equal(report.head,head);assert.equal(report.level,3);assert.equal(report.automaticMergeAllowed,false);await assert.rejects(main(['--root',root,'--base',base,'--head',head,'--out',path.join(root,'README.md')]),/tracked file/);assert.equal(await readFile(path.join(root,'README.md'),'utf8'),'new docs');assert(report.files.some(f=>f.path==='scripts/old.test.mjs'&&f.status==='D'&&f.level===3));await assert.rejects(main(['--root',root,'--base','missing']),/failed/i);assert.equal(git('rev-parse','HEAD').trim(),head);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('report paths cannot overwrite tracked files through parent aliases, final links or prior evidence',async()=>{
 const base=await mkdtemp(path.join(os.tmpdir(),'lol-gm-risk-output-')),root=path.join(base,'repo');await mkdir(root);const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8',stdio:'pipe'});
 try{git('init');await writeFile(path.join(root,'README.md'),'preserve source');git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','base');const head=git('rev-parse','HEAD').trim(),args=['--root',root,'--base',head];
  await symlink(root,path.join(base,'alias'));await assert.rejects(main([...args,'--out',path.join(base,'alias','README.md')]),/tracked file/);
  for(const kind of ['symlink','hardlink','dangling']){const out=path.join(base,kind+'.json');if(kind==='hardlink')await link(path.join(root,'README.md'),out);else await symlink(path.join(root,kind==='dangling'?'not-created':'README.md'),out);await assert.rejects(main([...args,'--out',out]),{code:'EEXIST'});assert.equal(await readFile(path.join(root,'README.md'),'utf8'),'preserve source');}
  const out=path.join(base,'evidence.json');await main([...args,'--out',out]);const before=await readFile(out);await assert.rejects(main([...args,'--out',out]),{code:'EEXIST'});assert.deepEqual(await readFile(out),before);assert.equal(git('rev-parse','HEAD').trim(),head);assert.equal(git('status','--porcelain').trim(),'');
 }finally{await rm(base,{recursive:true,force:true});}
});
