import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const ids=['git-transport-v2','git-shallow-partial'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id}))},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}])),ATLAS_LEVELS:{juniorOrder:{git:[]}},ATLAS_GUIDED_IDS:[],ATLAS_TEACHING:{keys:[],render(){},mount(){}}};
for(const path of ['subjects/git-teaching-transport.js','assets/teaching-transport.js'])new vm.Script(readFileSync(new URL('../'+path,import.meta.url),'utf8')).runInNewContext({window});
const t=window.ATLAS_TEACHING;
assert.equal(t.wireFrame([104,105,10]).prefix,'0007');assert.equal(t.wireFrame([]).prefix,'0004');
let n=t.negotiateStart();n=t.negotiateStep(n,'pack');assert.equal(n.stage,0);for(const a of ['want','have','pack','ref'])n=t.negotiateStep(n,a);assert.equal(n.tip,'D');assert.equal(n.known.length,4);
let c=t.cloneStart();c=t.cloneStep(c,'shallow');assert.equal(c.depth,1);c=t.cloneStep(c,'full');assert.equal(c.depth,6);for(const a of ['filter','sparse','offline','read'])c=t.cloneStep(c,a);assert(!c.doc&&c.sparse);assert(c.msg.includes('FAIL'));c=t.cloneStep(c,'offline');c=t.cloneStep(c,'read');assert(c.doc&&c.sparse);
const lab=mkdtempSync(join(tmpdir(),'atlas-transport-'));
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
console.log('PASS: four transport and clone labs; interactive models');
}finally{rmSync(lab,{recursive:true,force:true});}
