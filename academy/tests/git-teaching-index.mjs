import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const ids=['git-index-format','git-conflict-index-lab','git-revision-ranges'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id}))},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}])),ATLAS_GUIDED_IDS:[],ATLAS_TEACHING:{keys:[],render(){},mount(){}}};
for(const path of ['subjects/git-teaching-index.js','assets/teaching-index.js'])new vm.Script(readFileSync(new URL('../'+path,import.meta.url),'utf8')).runInNewContext({window});
const t=window.ATLAS_TEACHING;
assert.equal(t.indexStages[1].values[0],null);assert.equal(t.indexStages[2].values[2],null);
let s=t.stageResolveStart();s=t.stageResolveStep(s,'edit');s=t.stageResolveStep(s,'tree');assert(!s.tree);
s=t.stageResolveStep(s,'test');s=t.stageResolveStep(s,'add');s=t.stageResolveStep(s,'tree');assert(t.stageResolveSolved(s));
let bad=t.stageResolveStep(t.stageResolveStart(),'add');for(const a of ['edit','test','tree'])bad=t.stageResolveStep(bad,a);assert(!t.stageResolveSolved(bad));
const lab=mkdtempSync(join(tmpdir(),'atlas-index-'));
try{
const env={...process.env,HOME:lab,LC_ALL:'C',GIT_CONFIG_GLOBAL:'/dev/null',GIT_CONFIG_NOSYSTEM:'1'};
for(const key of Object.keys(env))if(/^GIT_(DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|COMMON_DIR|CONFIG_COUNT|CONFIG_KEY_\d+|CONFIG_VALUE_\d+|CONFIG_PARAMETERS|AUTHOR_.*|COMMITTER_.*)$/.test(key))delete env[key];
let labs=0;
for(const l of window.ATLAS_DATA.lessons){
 const markers=[...l.body.matchAll(/^:::learn ([a-z0-9-]+)$/gm)].map(m=>m[1]);assert(markers.length>=3&&markers.every(k=>t.keys.includes(k)));
 for(const m of l.body.matchAll(/~~~sh\n([\s\S]*?)\n~~~/g)){
  const p=spawnSync('bash',['-c',m[1]],{cwd:lab,env,encoding:'utf8',timeout:30000});assert.equal(p.status,0,l.id+'\n'+p.stdout+'\n'+p.stderr);assert(p.stdout.includes('PASS:'));labs++;
 }
}
assert.equal(labs,5);
const repo=join(lab,'graph');
const run=(...args)=>{const p=spawnSync('git',args,{cwd:lab,env,encoding:'utf8'});assert.equal(p.status,0,p.stderr);return p.stdout.trim();};
run('init','-q','-b','main',repo);
const g=(...a)=>run('-C',repo,...a);
g('config','user.name','Student');g('config','user.email','student@example.invalid');g('config','commit.gpgsign','false');
const ids={};const add=n=>{g('commit','--allow-empty','-qm',n);ids[n]=g('rev-parse','HEAD');};
add('A');add('B');g('branch','topic');add('C');add('D');g('switch','-q','topic');add('E');add('F');g('switch','-q','main');g('merge','--no-edit','topic');ids.M=g('rev-parse','HEAD');
for(const [a,b,mode] of [['D','F','two'],['F','D','two'],['D','F','three'],['F','M','two']]){
 const actual=g('rev-list',ids[a]+(mode==='two'?'..':'...')+ids[b]).split('\n').sort();
 const expected=Array.from(t.revisionRange(a,b,mode),x=>ids[x]).sort();assert.deepEqual(actual,expected);
}
for(const [suffix,id] of [['^1','D'],['^2','F'],['~2','C'],['^2~1','E']])assert.equal(g('rev-parse',ids.M+suffix),ids[id]);
console.log('PASS: five index, conflict and revision labs; range model matches real Git DAG');
}finally{rmSync(lab,{recursive:true,force:true});}
