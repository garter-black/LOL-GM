import test from 'node:test';
import assert from 'node:assert/strict';
import {selectMergedBranches} from './prune-merged-branches.mjs';
const repo='lkh0802a/LOL-GM',now=Date.parse('2026-11-01');
const b=(name,sha='a',protectedFlag=false)=>({name,commit:{sha},protected:protectedFlag});
const p=(number,ref,sha,{merged=true,state='closed',base='main',owner=repo,date='2026-10-15'}={})=>({
  number,state,head:{ref,sha,repo:{full_name:owner}},base:{ref:base},merged_at:merged?date:null});
test('only exact current SHA of an already merged repo PR may be deleted',()=>{
  const x=selectMergedBranches([b('yes'),b('changed','b'),b('no-pr'),b('unmerged')],[p(1,'yes','a'),p(2,'changed','a'),p(3,'unmerged','a',{merged:false})],{repository:repo,now});
  assert.deepEqual(x.eligible.map(y=>y.name),['yes']);assert.equal(x.excluded.changedSha,1);
});
test('active head/base, main and protected branch never qualify',()=>{
  const x=selectMergedBranches([b('main'),b('open'),b('base'),b('protected','a',true),b('yes')],[
    p(1,'open','a'),p(2,'base','a'),p(3,'protected','a'),p(4,'yes','a'),
    p(5,'open','a',{merged:false,state:'open',base:'base'})],{repository:repo,now});
  assert.deepEqual(x.eligible.map(y=>y.name),['yes']);
});
test('fork and newly merged branches are not eligible',()=>{
  const x=selectMergedBranches([b('fork'),b('recent')],[
    p(1,'fork','a',{owner:'another/repo'}),p(2,'recent','a',{date:'2026-10-31'})],
    {repository:repo,now,minAgeDays:2});
  assert.equal(x.eligible.length,0);
});
