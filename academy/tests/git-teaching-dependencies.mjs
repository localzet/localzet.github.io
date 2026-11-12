import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const ids=['git-dependencies-lab','git-attributes-lab'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id}))},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}])),ATLAS_GUIDED_IDS:[],ATLAS_TEACHING:{keys:[],render(){},mount(){}}};
for(const path of ['subjects/git-teaching-dependencies.js','assets/teaching-dependencies.js'])new vm.Script(readFileSync(new URL('../'+path,import.meta.url),'utf8')).runInNewContext({window});
const t=window.ATLAS_TEACHING;
let p=t.pinStart();p=t.pinStep(p,'switch');assert.equal(p.index,'L1');p=t.pinStep(p,'edit');p=t.pinStep(p,'add');assert.equal(p.index,'L2');assert(p.dirty);p=t.pinStep(p,'commit');assert.equal(p.head,'L2');assert(p.dirty);
let a=t.availableStart();a=t.availableStep(a,'checkout');assert.equal(a.result,'fail');a=t.availableStep(a,'publish');a=t.availableStep(a,'checkout');assert.equal(a.result,'pass');
assert.deepEqual(Array.from(t.eol('crlf').blob),[111,110,101,10]);assert.equal(t.eol('binary').blob.length,5);assert.equal(t.eol('lf').checkout.length,4);
let n=t.normStart();n=t.normStep(n,'rule');assert.equal(n.index,'CRLF');n=t.normStep(n,'renorm');assert.equal(n.head,'CRLF');assert.equal(n.index,'LF');n=t.normStep(n,'commit');assert.equal(n.head,'LF');
const lab=mkdtempSync(join(tmpdir(),'atlas-dependencies-'));
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
console.log('PASS: six dependency and attribute labs; interactive models');
}finally{rmSync(lab,{recursive:true,force:true});}
