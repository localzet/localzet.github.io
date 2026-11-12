import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const ids=['git-revisions','git-recovery','git-command-atlas'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id}))},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}])),ATLAS_LEVELS:{juniorOrder:{git:[]}},ATLAS_GUIDED_IDS:[],ATLAS_TEACHING:{keys:[],render(){},mount(){}}};
for(const path of ['subjects/git-teaching-review.js','assets/teaching-review.js'])new vm.Script(readFileSync(new URL('../'+path,import.meta.url),'utf8')).runInNewContext({window});
const t=window.ATLAS_TEACHING;
assert.deepEqual(Array.from(t.reviewSelectPaths('literal')),['docs/[x].md']);
assert.equal(t.reviewSelectPaths('direct').length,4);assert.equal(t.reviewSelectPaths('recursive').length,5);assert.equal(t.reviewSelectPaths('exclude').length,4);
let s=t.incidentStart();s=t.incidentStep(s,'rescue');assert(!s.ref);s=t.incidentStep(s,'inspect');s=t.incidentStep(s,'rescue');assert(s.ref);
assert(!t.reviewIntegrity.missing.ok&&t.reviewIntegrity.unreachable.ok);
assert.equal(t.reviewChoices.length,5);
const lab=mkdtempSync(join(tmpdir(),'atlas-review-'));
try{
const env={...process.env,HOME:lab,LC_ALL:'C',GIT_CONFIG_GLOBAL:'/dev/null',GIT_CONFIG_NOSYSTEM:'1'};
for(const key of Object.keys(env))if(/^GIT_(DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|COMMON_DIR|CONFIG_COUNT|CONFIG_KEY_\d+|CONFIG_VALUE_\d+|CONFIG_PARAMETERS|AUTHOR_.*|COMMITTER_.*)$/.test(key))delete env[key];
let labs=0;
for(const l of window.ATLAS_DATA.lessons){
 const markers=[...l.body.matchAll(/^:::learn ([a-z0-9-]+)$/gm)].map(m=>m[1]);assert(markers.length>=4&&markers.every(k=>t.keys.includes(k)));
 for(const m of l.body.matchAll(/~~~sh\n([\s\S]*?)\n~~~/g)){
  const p=spawnSync('bash',['-c',m[1]],{cwd:lab,env,encoding:'utf8',timeout:30000});assert.equal(p.status,0,l.id+'\n'+p.stdout+'\n'+p.stderr);assert(p.stdout.includes('PASS:'));labs++;
 }
}
assert.equal(labs,6);
console.log('PASS: six selector, recovery and command labs; interactive models');
}finally{rmSync(lab,{recursive:true,force:true});}
