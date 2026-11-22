import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const ids=['git-origins','git-setup','git-lab-config'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id}))},ATLAS_LEVELS:{junior:{}},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}]))};
const load=p=>new vm.Script(readFileSync(new URL('../'+p,import.meta.url),'utf8')).runInNewContext({window});
load('subjects/git-teaching-start.js');load('assets/teaching.js');load('assets/teaching-start.js');
const t=window.ATLAS_TEACHING;
assert.equal(t.effective('global'),'Developer');assert.equal(t.effective('local'),'Atlas Student');assert.equal(t.effective('command'),'Temporary');assert.equal(t.startSteps.at(-1)[3],'Запуск');
const lab=mkdtempSync(join(tmpdir(),'atlas-start-'));
try{
const env={...process.env,LC_ALL:'C',HOME:lab,GIT_CONFIG_GLOBAL:'/dev/null',GIT_CONFIG_NOSYSTEM:'1',TMPDIR:lab};
for(const key of Object.keys(env))if(/^GIT_(DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|COMMON_DIR|CONFIG_COUNT|CONFIG_KEY_\d+|CONFIG_VALUE_\d+|CONFIG_PARAMETERS|AUTHOR_.*|COMMITTER_.*)$/.test(key))delete env[key];
const run=(code,id)=>{const p=spawnSync('bash',['-c',code],{cwd:lab,env,encoding:'utf8',timeout:30000});if(p.error)throw p.error;assert.equal(p.status,0,id+'\n'+p.stdout+'\n'+p.stderr);};
for(const l of window.ATLAS_DATA.lessons){for(const body of [l.body,window.ATLAS_LEVELS.junior[l.id].body]){const keys=[...body.matchAll(/^:::learn (\S+)$/gm)].map(m=>m[1]);assert(keys.length>=3&&keys.every(k=>t.keys.includes(k)),l.id);}
run(l.body.match(/~~~sh\n([\s\S]*?)\n~~~/)[1],l.id);}
const j=window.ATLAS_LEVELS.junior;
const blocks=id=>[...j[id].body.matchAll(/~~~sh\n([\s\S]*?)\n~~~/g)].map(m=>m[1]).join('\n');
run('set -euo pipefail\n'+blocks('git-setup')+'\n'+blocks('git-lab-config')+'\ntest "$(git rev-list --count HEAD)" = 2\ntest "$(git show HEAD:note.txt)" = "$(printf \'Запуск\\nПорт: 8080\')"\ntest -z "$(git status --porcelain)"','Junior continuous project');
console.log('PASS: three technical labs and continuous Junior project');
}finally{rmSync(lab,{recursive:true,force:true});}
