import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
const base=new URL('../',import.meta.url), win={};
for(const path of ['content.js','subjects/linux.js','subjects/commands.js','subjects/deepening.js','editorial.js','levels.js','reference.js','subjects/linux-admin.js','subjects/linux-memory.js','subjects/linux-boot.js','subjects/linux-security.js','subjects/linux-kernel.js','subjects/linux-projects.js','subjects/linux-review.js']){
 new vm.Script(readFileSync(new URL(path,base),'utf8'),{filename:path}).runInNewContext({window:win});
}
const used=new Set(win.ATLAS_DATA.lessons.filter(l=>l.course==='linux').flatMap(l=>l.sources));
const targets=[...used].map(key=>({key,url:win.ATLAS_DATA.sources[key].url}));
const refs=win.ATLAS_REFERENCE.find(x=>x.id==='linux').groups.flatMap(g=>g.entries);
for(const e of refs.filter(e=>e.options?.length))targets.push({key:'ref:'+e.name,url:e.url});
const unique=[...new Set(targets.map(t=>t.url))];
const results=new Map();
async function probe(url){
 for(let attempt=0;attempt<2;attempt++){
  try{
   const res=await fetch(url,{method:'GET',headers:{'User-Agent':'Localzet-Atlas-Link-Audit/1.0','Range':'bytes=0-4095'},redirect:'follow',signal:AbortSignal.timeout(12000)});
   await res.body?.cancel();
   if(res.status>=200&&res.status<300)return {state:'ok',status:res.status,final:res.url};
   if(res.status===404||res.status===410)return {state:'broken',status:res.status,final:res.url};
   if(attempt===1)return {state:'unconfirmed',status:res.status,final:res.url};
  }catch(e){if(attempt===1)return {state:'unconfirmed',error:String(e)};}
 }
}
let cursor=0;
await Promise.all(Array.from({length:16},async()=>{while(cursor<unique.length){const url=unique[cursor++];results.set(url,await probe(url));}}));
const report=targets.map(t=>({...t,...results.get(t.url)}));
writeFileSync(process.env.ATLAS_LINK_REPORT||'linux-link-audit.json',JSON.stringify(report,null,2)+'\n');
const counts={};for(const result of results.values())counts[result.state]=(counts[result.state]||0)+1;
console.log('Linux link audit:',unique.length,JSON.stringify(counts));
for(const r of report.filter(r=>r.state!=='ok'))console.log(r.state,r.key,r.status||r.error,r.url);
if(report.some(r=>r.state==='broken'))process.exitCode=1;
