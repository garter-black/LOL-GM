import {execFileSync} from 'node:child_process';
import {writeFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Conservative triage, never an approval or an automatic merge authorization.
export function classifyFile(status,file){
 if(!file||file.startsWith('/')||file.split('/').includes('..'))return {level:3,reason:'invalid or unscoped path'};
 if(status!=='A'&&status!=='M')return {level:3,reason:'deletion, type change or unrecognized change requires review'};
 if(/^\.github\//.test(file)||/^(AGENTS\.md|package(-lock)?\.json|.*lock.*|.*SECURITY.*)$/.test(file)||/^scripts\/codex-(change-risk|development-preflight)/.test(file))return {level:3,reason:'automation, dependencies, permissions or risk policy'};
 if(/^docs\/(DECISIONS|LOL_GM_SPEC|DEVELOPMENT|ARCHITECTURE|CODEX_DOMAIN_.*|CODEX_EXECUTION|CODEX_MASTER_BLUEPRINT|CODEX_AUTOMATION_5H|design\/.*)\.md$/.test(file))return {level:3,reason:'confirmed design or development authority'};
 if(/^src\/artifact\/(save(?:-|\.)|state(?:-|\.)|match-core-|engine\.|competition(?:-|\.)|qualification-|registration-|negotiation-final\.|contract-window\.)/.test(file))return {level:3,reason:'sensitive game rules, state, save or engine boundary'};
 if(/^src\/(artifact|ui-v2)\/.*\.js$/.test(file))return {level:2,reason:'runtime behavior or system interaction; human review required'};
 if(/^scripts\/.*(?:-acceptance|\.test)\.mjs$/.test(file))return {level:status==='A'?1:2,reason:'new tests may be low-risk; changing existing expectations requires review'};
 if(/^(docs\/.*\.md|README\.md|CHANGELOG\.md)$/.test(file)||/^src\/ui-v2\/.*\.css$/.test(file))return {level:1,reason:'documentation or presentation candidate'};
 return {level:2,reason:'outside the narrow low-risk candidates; review required'};
}
export function classifyChanges(changes){
 const files=changes.map(({status,path:file})=>({status,path:file,...classifyFile(status,file)}));return {schemaVersion:1,level:Math.max(1,...files.map(x=>x.level)),files,automaticMergeAllowed:false,approval:'HUMAN_REVIEW_REQUIRED',policy:'Initial operation is PR creation only. File heuristics cannot prove semantic safety or replace branch protection, security checks or user approval.'};
}
export function parseNameStatus(text){
 const fields=text.split('\0');if(fields.at(-1)==='')fields.pop();if(fields.length%2)throw Error('Incomplete Git name-status output');const out=[];for(let i=0;i<fields.length;i+=2)out.push({status:fields[i],path:fields[i+1]});return out;
}
export async function main(args){
 const options={};for(let i=0;i<args.length;i++){const flag=args[i];if(!['--root','--base','--head','--out'].includes(flag)||!args[i+1]||args[i+1].startsWith('--'))throw Error('Usage: --base REF [--head REF] [--root PATH] [--out FILE]');options[flag]=args[++i];}if(!options['--base'])throw Error('--base is required');
 const root=options['--root']||process.cwd(),git=(...xs)=>execFileSync('git',['-C',root,...xs],{encoding:'utf8',stdio:['ignore','pipe','pipe']}),base=git('rev-parse','--verify',options['--base']+'^{commit}').trim(),head=git('rev-parse','--verify',(options['--head']||'HEAD')+'^{commit}').trim(),changes=parseNameStatus(git('diff','--no-renames','--name-status','-z',base,head,'--'));
 if(options['--out']){options['--out']=path.join(await realpath(path.dirname(path.resolve(options['--out']))),path.basename(options['--out']));const top=await realpath(git('rev-parse','--show-toplevel').trim()),relative=path.relative(top,options['--out']);if(!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative)&&git('ls-files','-z','--',':(literal)'+relative))throw Error('Risk output must not overwrite a tracked file');}
 const report={...classifyChanges(changes),base,head,observedAt:new Date().toISOString()},json=JSON.stringify(report,null,2)+'\n';if(options['--out'])await writeFile(options['--out'],json,{mode:0o600,flag:'wx'});else process.stdout.write(json);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main(process.argv.slice(2)).catch(error=>{console.error('CODEX_CHANGE_RISK',error.message);process.exitCode=1;});
