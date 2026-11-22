import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const ids=['git-origins','git-setup','git-lab-config','git-diff-status','git-commit-quality','git-history-reading','git-ignore-attributes','git-undo','git-branch-lab','git-merge','git-merge-lab','git-conflicts'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id}))},ATLAS_LEVELS:{junior:{}},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}]))};
const load=p=>new vm.Script(readFileSync(new URL('../'+p,import.meta.url),'utf8')).runInNewContext({window});
load('subjects/git-teaching-start.js');load('subjects/git-teaching-history.js');load('subjects/git-teaching-branches.js');load('subjects/git-teaching-merge.js');load('assets/teaching.js');load('assets/teaching-start.js');load('assets/teaching-history.js');load('assets/teaching-branches.js');load('assets/teaching-merge.js');
const t=window.ATLAS_TEACHING;
let s=t.stageInitial();s=t.stageStep(s,'port');assert.equal(t.stagedContent(s),'port=9090\ntimeout=10');s=t.stageStep(s,'commit');assert(t.stageSolved(s));assert(!t.stageSolved(t.stageStep(t.stageInitial(),'commit')));let bad=t.stageStep(t.stageStep(t.stageStep(t.stageInitial(),'port'),'timeout'),'commit');assert(!t.stageSolved(bad));assert.equal(t.history.at(-2).timeout,10);assert.equal(t.history.at(-1).timeout,30);
assert(t.ignoreRules.find(r=>r.path==='.env').ignored);assert(!t.ignoreRules.find(r=>r.path==='.env.example').ignored);assert(t.undoSolved(t.undoStep(t.undoStart(),'unstage')));assert(!t.undoSolved(t.undoStep(t.undoStart(),'restore')));assert.equal(t.branchSteps.at(-1).main,'C');assert.equal(t.branchSteps.at(-1).feature,'B');
assert.equal(t.mergeTopologies.merge.nodes.at(-1)[3].length,2);assert.equal(t.mergeTopologies.squash.nodes.at(-1)[3].length,1);assert.equal(t.mergeCases.at(-1).result,null);assert(!t.validateConflict(t.conflictOriginal).ok);assert(!t.validateConflict('port=9090\ntimeout=40\nmode=demo').ok);assert(t.validateConflict('port=9090\ntimeout=45\nmode=demo').ok);
const lab=mkdtempSync(join(tmpdir(),'atlas-history-'));
try{
const env={...process.env,LC_ALL:'C',HOME:lab,GIT_CONFIG_GLOBAL:'/dev/null',GIT_CONFIG_NOSYSTEM:'1',TMPDIR:lab};
for(const key of Object.keys(env))if(/^GIT_(DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|COMMON_DIR|CONFIG_COUNT|CONFIG_KEY_\d+|CONFIG_VALUE_\d+|CONFIG_PARAMETERS|AUTHOR_.*|COMMITTER_.*)$/.test(key))delete env[key];
const run=(code,id)=>{const p=spawnSync('bash',['-c',code],{cwd:lab,env,encoding:'utf8',timeout:30000});if(p.error)throw p.error;assert.equal(p.status,0,id+'\n'+p.stdout+'\n'+p.stderr);return p.stdout;};
const j=window.ATLAS_LEVELS.junior;
const blocks=id=>[...j[id].body.matchAll(/~~~sh\n([\s\S]*?)\n~~~/g)].map(m=>m[1]==='git add -p -- app.conf'?"printf 'y\\nn\\n' | git add -p -- app.conf":m[1]).join('\n');
for(const l of window.ATLAS_DATA.lessons.slice(9)){for(const body of [l.body,j[l.id].body]){const keys=[...body.matchAll(/^:::learn (\S+)$/gm)].map(m=>m[1]);assert(keys.length>=3&&keys.every(k=>t.keys.includes(k)),l.id);}assert(run(l.body.match(/~~~sh\n([\s\S]*?)\n~~~/)[1],l.id).includes('PASS:'));}
run('set -euo pipefail\n'+['git-setup','git-lab-config','git-diff-status','git-commit-quality','git-history-reading','git-ignore-attributes','git-undo','git-branch-lab','git-merge','git-merge-lab','git-conflicts'].map(blocks).join('\n')+'\ntest "$(git rev-list --count main)" = 17\ntest "$(git rev-list --count --all)" = 17\ntest "$(git branch --show-current)" = main\ntest -z "$(git status --porcelain)"\ntest -z "$(git ls-files -u)"\ntest -f search.txt && test -f search-help.txt\ngit show HEAD:app.conf | grep -Fx timeout=45\ngit show HEAD:app.conf | grep -Fx mode=demo\ngit show HEAD^1:app.conf | grep -Fx timeout=40\ngit show HEAD^2:app.conf | grep -Fx timeout=60\ntest "$(git rev-parse HEAD^2)" = "$(git rev-parse feature/timeout)"\ngit merge-base --is-ancestor feature/search main','Continuous Junior project through merge and conflict');
console.log('PASS: merge graphs, conflict editor and three technical labs; 17-commit Junior project');
}finally{rmSync(lab,{recursive:true,force:true});}
