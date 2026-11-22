import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const ids=['git-rerere-lab','git-worktree-lab'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id}))},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}])),ATLAS_LEVELS:{juniorOrder:{git:[]}},ATLAS_GUIDED_IDS:[],ATLAS_TEACHING:{keys:[],render(){},mount(){}}};
for(const path of ['subjects/git-teaching-worktrees.js','assets/teaching-worktrees.js'])new vm.Script(readFileSync(new URL('../'+path,import.meta.url),'utf8')).runInNewContext({window});
const t=window.ATLAS_TEACHING;
let r=t.rrStart();r=t.rrStep(r,'test');assert(!r.checked);r=t.rrStep(r,'commit');assert(!r.merged);for(const a of ['forget','edit','record','test','add','commit'])r=t.rrStep(r,a);assert(r.merged);assert.equal(r.cache,35);assert.equal(r.index,35);
let w=t.wtStart();for(const a of ['stage-main','edit-hot','stage-hot','commit-hot'])w=t.wtStep(w,a);assert.equal(w.mainIndex,'staged');assert.equal(w.hotRef,'B');
let l=t.lifeStart();l=t.lifeStep(l,'lock');l=t.lifeStep(l,'remove');assert(l.exists);l=t.lifeStep(l,'unlock');l=t.lifeStep(l,'edit');l=t.lifeStep(l,'remove');assert(l.exists);l=t.lifeStep(l,'commit');l=t.lifeStep(l,'remove');assert(!l.exists&&l.saved);
const lab=mkdtempSync(join(tmpdir(),'atlas-worktrees-'));
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
assert.equal(labs,5);
console.log('PASS: five rerere and worktree labs; interactive models');
}finally{rmSync(lab,{recursive:true,force:true});}
