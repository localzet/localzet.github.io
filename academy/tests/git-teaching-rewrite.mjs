import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const ids=['git-rebase-lab','git-interactive-rebase','git-cherry-pick-lab'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id}))},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}])),ATLAS_GUIDED_IDS:[],ATLAS_TEACHING:{keys:[],render(){},mount(){}}};
for(const path of ['subjects/git-teaching-rewrite.js','assets/teaching-rewrite.js'])new vm.Script(readFileSync(new URL('../'+path,import.meta.url),'utf8')).runInNewContext({window});
const t=window.ATLAS_TEACHING;
let todo=t.startTodo();let result=t.simulateTodo(todo);assert(result.same&&!result.checkpoints&&!result.solved);
todo=t.todoMove(todo,2,-1);todo[1].action='fixup';result=t.simulateTodo(todo);assert(result.same&&result.checkpoints&&result.solved);
let wrong=t.startTodo();wrong[2].action='fixup';assert(!t.simulateTodo(wrong).solved);
wrong=t.startTodo();wrong[2].action='drop';assert(!t.simulateTodo(wrong).same);
wrong=t.todoMove(t.startTodo(),2,-1);wrong=t.todoMove(wrong,1,-1);assert(t.simulateTodo(wrong).error);
assert.equal(t.replayModes.onto.nodes.find(n=>n[0]==='T1′')[3][0],'M');
const lab=mkdtempSync(join(tmpdir(),'atlas-rewrite-'));
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
console.log('PASS: six rewrite labs, todo success and negative cases');
}finally{rmSync(lab,{recursive:true,force:true});}
