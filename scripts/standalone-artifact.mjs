import {execFileSync} from 'node:child_process';
import {readFile,writeFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
async function regularFile(file){const stat=await lstat(file);if(!stat.isFile()||stat.isSymbolicLink())throw Error('Standalone artifact must contain regular files');return readFile(file);}
function identity({cwd,head,repository,runId}){
 if(!/^[a-f0-9]{40}$/.test(head||'')||!/^\d+$/.test(String(runId||''))||!/^[-\w.]+\/[-\w.]+$/.test(repository||''))throw Error('Exact standalone head, repository and run ID are required');
 const actual=execFileSync('git',['rev-parse','HEAD'],{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();if(actual!==head)throw Error('Standalone requires the tested checkout SHA');
 return {schemaVersion:1,head,repository,runId:String(runId)};
}
export async function recordStandalone({cwd=process.cwd(),directory,...expected}){
 const provenance=identity({cwd,...expected}),bytes=await regularFile(path.join(directory,'index.html'));
 if(!bytes.length)throw Error('Empty standalone artifact');
 const manifest={...provenance,bytes:bytes.length,sha256:digest(bytes)};
 await writeFile(path.join(directory,'standalone-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx',mode:0o600});return manifest;
}
export async function verifyStandalone({cwd=process.cwd(),directory,...expected}){
 const provenance=identity({cwd,...expected}),manifest=JSON.parse(await regularFile(path.join(directory,'standalone-manifest.json')));
 for(const [key,value] of Object.entries(provenance))if(manifest[key]!==value)throw Error('Standalone provenance mismatch: '+key);
 const bytes=await regularFile(path.join(directory,'index.html'));
 if(!bytes.length||!Number.isSafeInteger(manifest.bytes)||manifest.bytes!==bytes.length||manifest.sha256!==digest(bytes))throw Error('Standalone artifact bytes/hash mismatch');
 return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [action,directory,...rest]=process.argv.slice(2);const options={directory,head:process.env.STANDALONE_HEAD||process.env.GITHUB_SHA,repository:process.env.GITHUB_REPOSITORY,runId:process.env.STANDALONE_RUN_ID||process.env.GITHUB_RUN_ID};
 if(!directory||rest.length||!['record','verify'].includes(action)){console.error('Usage: standalone-artifact.mjs record|verify DIRECTORY');process.exitCode=1;}
 else try{const manifest=await (action==='record'?recordStandalone:verifyStandalone)(options);console.log('STANDALONE_ARTIFACT',JSON.stringify({action,...manifest}));}catch(error){console.error('STANDALONE_ARTIFACT',error.message);process.exitCode=1;}
}
