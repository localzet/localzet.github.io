import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const root=new URL('../',import.meta.url);
const ids=['docker-origin','docker-runtime'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id,body:''}))},ATLAS_LEVELS:{junior:{}},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}])),ATLAS_GUIDED_IDS:[],ATLAS_TEACHING:{keys:[],render(){},mount(){}}};
for(const file of ['subjects/docker-teaching-start.js','assets/teaching-docker-start.js'])new vm.Script(readFileSync(new URL(file,root),'utf8')).runInNewContext({window});
assert.deepEqual(Array.from(window.ATLAS_GUIDED_IDS),ids);
let count=0;
for(const l of window.ATLAS_DATA.lessons){
 for(const body of [l.body,window.ATLAS_LEVELS.junior[l.id].body]){
   const keys=[...body.matchAll(/^:::learn ([a-z0-9-]+)$/gm)].map(m=>m[1]);
   assert.equal(keys.length,3);
   for(const key of keys)assert(window.ATLAS_TEACHING.render(key).includes('data-teach="'+key+'"'));
 }
 for(const m of l.body.matchAll(/~~~sh\n([\s\S]*?)\n~~~/g)){
   if(!m[1].includes('PASS:'))continue;
   const p=spawnSync('bash',['--noprofile','--norc','-c',m[1]],{encoding:'utf8',timeout:120000,env:{...process.env,LC_ALL:'C',ATLAS_DOCKER_LAB:'1'}});
   if(p.error)throw p.error;
   assert.equal(p.status,0,l.id+'\n'+p.stdout+'\n'+p.stderr);
   assert(p.stdout.includes('PASS:'),l.id);console.log(p.stdout.trim());count++;
 }
}
assert.equal(count,2);
console.log('PASS: two real Docker labs, four edition variants and six training blocks');
