import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const ids=['git-tags-mirror','git-hooks-lab','git-signatures-lab'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id}))},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}])),ATLAS_GUIDED_IDS:[],ATLAS_TEACHING:{keys:[],render(){},mount(){}}};
for(const path of ['subjects/git-teaching-release.js','assets/teaching-release.js'])new vm.Script(readFileSync(new URL('../'+path,import.meta.url),'utf8')).runInNewContext({window});
const t=window.ATLAS_TEACHING;
assert.deepEqual(Array.from(t.tagPublish('normal')),[]);assert.deepEqual(Array.from(t.tagPublish('follow')),['v1']);assert.equal(t.tagPublish('all').length,3);
let m=t.mirrorStart();m=t.mirrorStep(m,'preview');assert(m.target.includes('extra'));m=t.mirrorStep(m,'sync');assert(!m.target.includes('extra')&&m.target.includes('v1'));
let h=t.hookStart();h=t.hookStep(h,'commit');assert.equal(h.result,'reject');assert.equal(h.head,'A');h=t.hookStep(h,'add');h=t.hookStep(h,'commit');assert.equal(h.result,'allow');assert.equal(h.head,'B');
assert(!t.hookRequests.both.allowed);assert(t.trustStates.revoked.signature&&!t.trustStates.revoked.trusted);
const lab=mkdtempSync(join(tmpdir(),'atlas-release-'));
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
console.log('PASS: six release, hooks and signatures labs; interactive models');
}finally{rmSync(lab,{recursive:true,force:true});}
