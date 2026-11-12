import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const ids=['git-maintenance-lab'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id}))},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}])),ATLAS_LEVELS:{juniorOrder:{git:[]}},ATLAS_GUIDED_IDS:[],ATLAS_TEACHING:{keys:[],render(){},mount(){}}};
for(const path of ['subjects/git-teaching-maintenance.js','assets/teaching-maintenance.js'])new vm.Script(readFileSync(new URL('../'+path,import.meta.url),'utf8')).runInNewContext({window});
const t=window.ATLAS_TEACHING;
assert.deepEqual(Array.from(t.maintenanceBitmap('union')),[1,1,1,1,1,1,1,1]);
assert.deepEqual(Array.from(t.maintenanceBitmap('intersection')),[1,1,0,0,1,0,1,0]);
assert.deepEqual(Array.from(t.maintenanceBitmap('difference')),[0,0,1,0,0,1,0,0]);
let r=t.retStart();r=t.retStep(r,'maintain');assert(!r.backup);for(const a of ['inspect','rescue','backup','maintain'])r=t.retStep(r,a);assert(r.ref&&r.backup&&r.verified);
const lab=mkdtempSync(join(tmpdir(),'atlas-maintenance-'));
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
assert.equal(labs,3);
console.log('PASS: three maintenance, bitmap and recovery labs; interactive models');
}finally{rmSync(lab,{recursive:true,force:true});}
