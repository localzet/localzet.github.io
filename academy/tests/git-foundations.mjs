import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const source=readFileSync(new URL('../subjects/git-foundations.js',import.meta.url),'utf8');
const data=JSON.parse(source.match(/const data=([\s\S]*?);\nconst D=/)[1]);
const lab=mkdtempSync(join(tmpdir(),'atlas-git-'));
try{
 const env={...process.env,LC_ALL:'C',HOME:lab,GIT_CONFIG_GLOBAL:'/dev/null',GIT_CONFIG_NOSYSTEM:'1'};
 for(const key of Object.keys(env))if(/^GIT_(DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|COMMON_DIR|CONFIG_COUNT|CONFIG_KEY_\d+|CONFIG_VALUE_\d+|CONFIG_PARAMETERS|AUTHOR_.*|COMMITTER_.*)$/.test(key))delete env[key];
 for(const [id,expected] of [['git-lab-config','PASS: first commit'],['git-diff-status','PASS: staged snapshot preserved'],['git-commit-quality','PASS: three focused commits'],['git-history-reading','PASS: locate historical change']]){
  const body=data.rows.find(r=>r.id===id).body;
  const code=body.match(/~~~sh\n([\s\S]*?)\n~~~/)[1];
  const p=spawnSync('bash',['-c',code],{cwd:lab,env,encoding:'utf8',timeout:30000});
  if(p.error)throw p.error;
  assert.equal(p.status,0,id+'\n'+p.stdout+'\n'+p.stderr);
  assert(p.stdout.includes(expected),id+' missing result');
  console.log(expected);
 }
}finally{rmSync(lab,{recursive:true,force:true});}
