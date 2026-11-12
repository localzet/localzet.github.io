import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const ids=['git-objects','git-object-bytes','git-ref-model'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id}))},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}])),ATLAS_GUIDED_IDS:[],ATLAS_TEACHING:{keys:[],render(){},mount(){}}};
for(const path of ['subjects/git-teaching-objects.js','assets/teaching-objects.js'])new vm.Script(readFileSync(new URL('../'+path,import.meta.url),'utf8')).runInNewContext({window,TextEncoder,Uint8Array});
const t=window.ATLAS_TEACHING;
const lab=mkdtempSync(join(tmpdir(),'atlas-object-'));
try{
const env={...process.env,HOME:lab,LC_ALL:'C',GIT_CONFIG_GLOBAL:'/dev/null',GIT_CONFIG_NOSYSTEM:'1'};
for(const key of Object.keys(env))if(/^GIT_(DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|COMMON_DIR|CONFIG_COUNT|CONFIG_KEY_\d+|CONFIG_VALUE_\d+|CONFIG_PARAMETERS|AUTHOR_.*|COMMITTER_.*)$/.test(key))delete env[key];
for(const format of ['sha1','sha256']){
 const repo=join(lab,format);
 const init=spawnSync('git',['init','-q','-b','main','--object-format='+format,repo],{env,encoding:'utf8'});assert.equal(init.status,0,init.stderr);
 for(const [value,lf] of [['atlas',false],['atlas',true],['кот',true],['',false],['🚀',false]]){
  const b=t.objectBytes(value,lf),oid=createHash(format).update(b.all).digest('hex');
  const p=spawnSync('git',['-C',repo,'hash-object','--stdin'],{env,input:Buffer.from(b.payload),encoding:'utf8'});assert.equal(p.status,0,p.stderr);assert.equal(oid,p.stdout.trim());
 }
}
assert.equal(t.objectBytes('кот',true).payload.length,7);
let s=t.casStart();for(const a of ['read1','read2','write1','write2'])s=t.casStep(s,a);assert.equal(s.ref,'B');assert(s.msg.includes('Отказ'));s=t.casStep(t.casStep(s,'read2'),'write2');assert.equal(s.ref,'C');
let labs=0;
for(const l of window.ATLAS_DATA.lessons){
 const markers=[...l.body.matchAll(/^:::learn ([a-z0-9-]+)$/gm)].map(m=>m[1]);assert(markers.length>=3&&markers.every(k=>t.keys.includes(k)));
 for(const m of l.body.matchAll(/~~~sh\n([\s\S]*?)\n~~~/g)){
  const p=spawnSync('bash',['-c',m[1]],{cwd:lab,env,encoding:'utf8',timeout:30000});assert.equal(p.status,0,l.id+'\n'+p.stdout+'\n'+p.stderr);assert(p.stdout.includes('PASS:'));labs++;
 }
}
assert.equal(labs,4);
console.log('PASS: four guided object labs, ten Git hash vectors and guarded ref update model');
}finally{rmSync(lab,{recursive:true,force:true});}
