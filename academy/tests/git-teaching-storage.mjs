import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const ids=['git-pack-storage','git-plumbing-commit'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id}))},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}])),ATLAS_LEVELS:{juniorOrder:{git:[]}},ATLAS_GUIDED_IDS:[],ATLAS_TEACHING:{keys:[],render(){},mount(){}}};
for(const path of ['subjects/git-teaching-storage.js','assets/teaching-storage.js'])new vm.Script(readFileSync(new URL('../'+path,import.meta.url),'utf8')).runInNewContext({window});
const t=window.ATLAS_TEACHING;
let d=t.deltaStart();d=t.deltaStep(d,'insert');assert.equal(d.step,0);d=t.deltaStep(d,'copy');d=t.deltaStep(d,'insert');assert.equal(d.output,'hello atlas\n');
assert.equal(t.fanRange(18).start,1);assert.equal(t.fanRange(18).end,3);assert.equal(t.fanRange(19).items.length,0);assert.equal(t.fanRange(255).end,5);
let b=t.buildStart();b=t.buildStep(b,'publish');assert.equal(b.stage,0);for(const a of ['blob','index','tree','commit','publish'])b=t.buildStep(b,a);assert.equal(b.stage,5);
let x=t.txnStart();x=t.txnStep(x,'peer');x=t.txnStep(x,'prepare');assert.equal(x.phase,'rejected');assert.equal(x.candidate,'A');assert.equal(x.audit,'B');x=t.txnStep(x,'inspect');x=t.txnStep(x,'prepare');x=t.txnStep(x,'commit');assert.equal(x.phase,'committed');assert.equal(x.candidate,'C');
const lab=mkdtempSync(join(tmpdir(),'atlas-storage-'));
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
assert.equal(labs,4);
console.log('PASS: four pack and plumbing labs; interactive models');
}finally{rmSync(lab,{recursive:true,force:true});}
