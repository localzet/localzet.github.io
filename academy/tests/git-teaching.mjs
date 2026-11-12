import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
const window={ATLAS_DATA:{lessons:[{id:'git-index'}]},ATLAS_LEVELS:{junior:{}},ATLAS_EDITORIAL:{'git-index':{}}};
const load=p=>new vm.Script(readFileSync(new URL('../'+p,import.meta.url),'utf8')).runInNewContext({window});
load('subjects/git-teaching-pilot.js');load('assets/teaching.js');
const t=window.ATLAS_TEACHING,l=window.ATLAS_DATA.lessons[0];
for(const body of [l.body,window.ATLAS_LEVELS.junior['git-index'].body]){for(const m of body.matchAll(/^:::learn (\S+)$/gm))assert(t.keys.includes(m[1]),m[1]);}
let state=t.initial();for(const a of ['port','add','todo','commit'])state=t.challengeStep(state,a);assert(t.solved(state));assert(!t.solved(t.challengeStep(state,'add')));assert(!t.solved(t.challengeStep(state,'restore')));
assert.equal(t.walkthrough[3].status,'MM note.txt');assert.equal(t.walkthrough[4].w,'C');assert.equal(t.diffs[1].rows.length,2);
const code=l.body.match(/~~~sh\n([\s\S]*?)\n~~~/)[1];
const env={...process.env,LC_ALL:'C'};
for(const key of Object.keys(env))if(/^GIT_(DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|COMMON_DIR|CONFIG_COUNT|CONFIG_KEY_\d+|CONFIG_VALUE_\d+|CONFIG_PARAMETERS|AUTHOR_.*|COMMITTER_.*)$/.test(key))delete env[key];
const p=spawnSync('bash',['-c',code],{env,encoding:'utf8',timeout:30000});if(p.error)throw p.error;assert.equal(p.status,0,p.stdout+p.stderr);assert(p.stdout.includes('PASS: staged object and safe unstage'));console.log('PASS: teaching models, marker coverage and real Git experiment');
