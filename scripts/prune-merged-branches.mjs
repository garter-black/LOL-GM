import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const DAY=86400000;
export function selectMergedBranches(branches,prs,{repository,defaultBranch='main',now=Date.now(),minAgeDays=2}){
  const active=new Set([defaultBranch,...prs.filter(x=>x.state==='open').flatMap(x=>[x.head?.ref,x.base?.ref])]);
  const merged=new Map();
  for(const pr of prs){
    if(!pr.merged_at||pr.head?.repo?.full_name!==repository||Date.parse(pr.merged_at)>now-minAgeDays*DAY)continue;
    const arr=merged.get(pr.head.ref)||[];arr.push(pr);merged.set(pr.head.ref,arr);
  }
  const eligible=[],excluded={active:0,protected:0,unverified:0,changedSha:0};
  for(const br of branches){
    if(active.has(br.name)){excluded.active++;continue;}
    if(br.protected){excluded.protected++;continue;}
    const prsForBranch=merged.get(br.name)||[];
    if(!prsForBranch.length){excluded.unverified++;continue;}
    const match=prsForBranch.find(pr=>pr.head.sha===br.commit.sha);
    if(!match){excluded.changedSha++;continue;}
    eligible.push({name:br.name,sha:br.commit.sha,pr:match.number});
  }
  eligible.sort((a,b)=>a.name.localeCompare(b.name));
  return {eligible,excluded};
}

const e=process.env,repo=e.GITHUB_REPOSITORY,token=e.GH_TOKEN;
const api=(e.GITHUB_API_URL||'https://api.github.com').replace(/\/$/,'');
async function req(path,method='GET'){
  const response=await fetch(api+'/repos/'+repo+'/'+path,{method,headers:{
    Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}});
  if(method==='DELETE'&&response.status===204)return null;
  if(!response.ok)throw new Error(method+' '+path+': HTTP '+response.status+' '+(await response.text()).slice(0,250));
  return response.json();
}
async function list(path){
  const all=[];
  for(let page=1;page<=50;page++){
    const items=await req(path+(path.includes('?')?'&':'?')+'per_page=100&page='+page);
    if(!Array.isArray(items))throw new Error('Invalid API array for '+path);
    all.push(...items);if(items.length<100)return all;
  }
  throw new Error('More than 5000 records; abort instead of incomplete scan');
}
const now=()=>Date.now();
async function main(){
  if(!repo||!token)throw new Error('GitHub credentials are required');
  const execute=process.argv.includes('--execute');
  if(execute && (e.BRANCH_CLEANUP_CONFIRMATION!=='DELETE_MERGED_BRANCHES'||
     e.GITHUB_EVENT_NAME!=='workflow_dispatch'||e.GITHUB_REF!=='refs/heads/main')){
    throw new Error('Deletion requires manual run on main and explicit DELETE_MERGED_BRANCHES confirmation');
  }
  const age=Number(e.BRANCH_CLEANUP_MIN_AGE_DAYS??2);
  if(!Number.isInteger(age)||age<0||age>3650)throw new Error('Invalid minimum age');
  const [info,branches,prs]=await Promise.all([req(''),list('branches'),list('pulls?state=all')]);
  const result=selectMergedBranches(branches,prs,{repository:repo,defaultBranch:info.default_branch,minAgeDays:age,now:now()});
  const report={schema:1,mode:execute?'delete':'dry-run',repository:repo,branchesScanned:branches.length,prsScanned:prs.length,
    eligible:result.eligible,excluded:result.excluded,deleted:[],skipped:[],errors:[]};
  if(execute){
    let freshOpen=new Set();
    for(let i=0;i<result.eligible.length;i++){
      const candidate=result.eligible[i];
      try{
        if(i%10===0){
          const current=await list('pulls?state=open');
          freshOpen=new Set([info.default_branch,...current.flatMap(p=>[p.head?.ref,p.base?.ref])]);
        }
        if(freshOpen.has(candidate.name)){report.skipped.push({name:candidate.name,reason:'active PR'});continue;}
        const path='git/refs/heads/'+candidate.name.split('/').map(encodeURIComponent).join('/');
        const ref=await req(path);
        if(ref.object?.sha!==candidate.sha){report.skipped.push({name:candidate.name,reason:'HEAD changed'});continue;}
        await req(path,'DELETE');
        report.deleted.push(candidate.name);
      }catch(error){report.errors.push({name:candidate.name,error:String(error)});}
    }
  }
  mkdirSync('reports',{recursive:true});
  writeFileSync('reports/merged-branch-cleanup.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({mode:report.mode,eligible:report.eligible.length,excluded:report.excluded,
    deleted:report.deleted.length,skipped:report.skipped.length,errors:report.errors.length}));
  if(e.GITHUB_STEP_SUMMARY)writeFileSync(e.GITHUB_STEP_SUMMARY,
    '### Branch cleanup '+report.mode+'\n\nEligible: '+report.eligible.length+
    '\n\nDeleted: '+report.deleted.length+'\n\nErrors: '+report.errors.length+'\n',{flag:'a'});
  if(report.errors.length)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  main().catch(err=>{console.error(err);process.exitCode=1;});
}
