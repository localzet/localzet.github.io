import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=new URL('../',import.meta.url);
const load=p=>readFileSync(new URL(p,root),'utf8');
const window={};
// Match the actual published script order, not a separate hand-maintained list.
for(const m of load('index.html').matchAll(/<script defer src="\.\/([^"?]+)(?:\?[^"]*)?"><\/script>/g)){
  if(m[1]==='assets/app.js')break;
  new vm.Script(load(m[1]),{filename:m[1]}).runInNewContext({window});
}
const D=window.ATLAS_DATA,L=window.ATLAS_LEVELS,T=window.ATLAS_TEACHING;
const markers=body=>[...body.matchAll(/^:::learn ([a-z0-9-]+)$/gm)].map(x=>x[1]);
const blocks=body=>[...body.matchAll(/~~~sh\n([\s\S]*?)\n~~~/g)].map(x=>x[1]);
const byId=id=>D.lessons.find(x=>x.id===id);
assert.equal(new Set(T.keys).size,T.keys.length,'Duplicate teaching key');
assert.equal(L.seniorOrder.git.length,51);
assert.deepEqual(Array.from(L.seniorOrder.git.slice(0,43)),Array.from(L.middleOrder.git));
assert.deepEqual(Array.from(L.middleOrder.git.slice(0,21)),Array.from(L.juniorOrder.git));
let editions=0;
for(const [n,order] of [L.juniorOrder.git,L.middleOrder.git,L.seniorOrder.git].entries()){
 for(const id of order){
  const l=byId(id),body=n===0?L.junior[id].body:l.body+(n===2&&L.advanced[id]?'\n\n'+L.advanced[id]:'');
  assert(markers(body).length>=3,id);
  assert(l.sources.length&&l.sources.every(s=>D.sources[s]),id+' sources');
  assert.equal((body.match(/~~~/g)||[]).length%2,0,id+' fences');
  for(const key of markers(body)){
    assert(T.keys.includes(key),key);
    const html=T.render(key);
    assert(html.includes('data-teach="'+key+'"'),key+' renderer');
    for(const a of html.matchAll(/href="#\/lesson\/([^"/]+)\/(junior|middle|senior)"/g)){
      assert(byId(a[1])&&L.minimum[a[1]]<=['junior','middle','senior'].indexOf(a[2]),'broken lesson link '+a[0]);
    }
    for(const a of html.matchAll(/href="\.\/(exercises\/[^"]+)"/g))assert(existsSync(new URL(a[1],root)),a[1]);
  }
  editions++;
 }
}
assert.equal(editions,115);
const lab=mkdtempSync(join(tmpdir(),'atlas-final-audit-'));
try{
 const env={...process.env,LC_ALL:'C',HOME:lab,GIT_CONFIG_GLOBAL:'/dev/null',GIT_CONFIG_NOSYSTEM:'1',TMPDIR:lab};
 for(const k of Object.keys(env))if(/^GIT_(DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|COMMON_DIR|CONFIG_COUNT|CONFIG_KEY_\d+|CONFIG_VALUE_\d+|CONFIG_PARAMETERS|AUTHOR_.*|COMMITTER_.*)$/.test(k))delete env[k];
 const run=(code,name)=>{const p=spawnSync('bash',['-c',code],{cwd:lab,env,encoding:'utf8',timeout:45000});if(p.error)throw p.error;assert.equal(p.status,0,name+'\n'+p.stdout+'\n'+p.stderr);return p.stdout;};
 // Include the previously separate index lesson and its return to the main training repository.
 const route=L.juniorOrder.git.filter(id=>!['git-origins','git-junior-project'].includes(id));
 const code=route.flatMap(id=>blocks(L.junior[id].body)).map(s=>s==='git add -p -- app.conf'?"printf 'y\\nn\\n' | git add -p -- app.conf":s).join('\n');
 run('set -euo pipefail\n'+code+'\ntest "$(git rev-list --count main)" = 28\ntest -z "$(git status --porcelain)"\ntest -z "$(git stash list)"\ntest "$(git rev-parse HEAD)" = "$(git --git-dir="$atlas_exchange/server.git" rev-parse main)"\ntest "$(git rev-parse HEAD)" = "$(git -C "$atlas_exchange/peer" rev-parse HEAD)"','complete Junior route including index pilot');
 assert(run(blocks(L.advanced['git-merge'])[0],'Senior merge bases').includes('PASS: multiple best bases'));
 console.log('PASS: 115 Git editions, rendered markers and internal links; continuous Junior and multiple best merge bases');
}finally{rmSync(lab,{recursive:true,force:true});}
