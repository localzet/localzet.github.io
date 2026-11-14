import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const load=p=>readFileSync(new URL(p,root),'utf8');
const window={};
for(const m of load('index.html').matchAll(/<script defer src="\.\/([^"?]+)(?:\?[^"]*)?"><\/script>/g)){
  if(m[1]==='assets/app.js')break;
  new vm.Script(load(m[1]),{filename:m[1]}).runInNewContext({window});
}
const D=window.ATLAS_DATA,L=window.ATLAS_LEVELS,T=window.ATLAS_TEACHING;
const ids=L.order.linux, byId=id=>D.lessons.find(x=>x.id===id);
assert.equal(ids.length,63);
assert.equal(new Set(T.keys).size,T.keys.length,'Duplicate teaching key');
assert.deepEqual(Array.from(ids).sort(),Array.from(window.ATLAS_GUIDED_IDS.filter(id=>id.startsWith('linux-'))).sort());
let editions=0,markersTotal=0;
const counts=[];
for(const n of [0,1,2]){
  let count=0;
  for(const id of ids.filter(id=>L.minimum[id]<=n)){
    const l=byId(id);
    const body=n===0?L.junior[id].body:l.body+(n===2&&L.advanced[id]?'\n\n'+L.advanced[id]:'');
    const markers=[...body.matchAll(/^:::learn ([a-z0-9-]+)$/gm)].map(m=>m[1]);
    assert(markers.length>=3,id+' level '+n);
    assert(l.sources.length&&l.sources.every(s=>D.sources[s]),id+' sources');
    assert.equal((body.match(/^~~~.*$/gm)||[]).length%2,0,id+' fences');
    for(const key of markers){
      assert(T.keys.includes(key),key);
      const html=T.render(key);
      assert(html.includes('data-teach="'+key+'"'),key+' renderer');
      for(const a of html.matchAll(/href="#\/lesson\/([^"/]+)\/(junior|middle|senior)"/g)){
        assert(byId(a[1])&&L.minimum[a[1]]<=['junior','middle','senior'].indexOf(a[2]),'broken lesson link '+a[0]);
      }
      for(const a of html.matchAll(/href="\.\/(exercises\/[^"]+)"/g))assert(existsSync(new URL(a[1],root)),a[1]);
      markersTotal++;
    }
    editions++;count++;
  }
  counts.push(count);
}
assert.equal(editions,133);
assert.equal(counts[0],23);
assert.equal(counts[2],63);
console.log('PASS: Linux '+counts.join('/')+' cumulative editions; '+editions+' routes; '+markersTotal+' rendered marker occurrences in actual site script order');
