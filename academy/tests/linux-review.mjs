import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
const root=new URL('../subjects/',import.meta.url);
const src=readFileSync(new URL('linux-review.js',root),'utf8');
const data=JSON.parse(src.match(/const data=([\s\S]*?);\nconst D=/)[1]);
const lab=mkdtempSync(join(tmpdir(),'atlas-review-'));
const run=(cmd,args)=>{const p=spawnSync(cmd,args,{cwd:lab,encoding:'utf8',timeout:30000,env:{...process.env,LC_ALL:'C'}});if(p.error)throw p.error;assert.equal(p.status,0,cmd+' '+args.join(' ')+'\n'+p.stderr+'\n'+p.stdout);return p.stdout;};
const code=(id,lang)=>data.rows.find(r=>r.id===id).body.match(new RegExp('~~~'+lang+'\\n([\\s\\S]*?)\\n~~~'))[1];
try{
 writeFileSync(join(lab,'hello.c'),code('linux-elf','c')+'\n');
 run('cc',['-Wall','-Wextra','-Werror','-O2','hello.c','-o','hello']);
 assert.equal(run('./hello',[]).trim(),'atlas ELF');
 assert.match(run('readelf',['-h','hello']),/ELF/);
 assert.match(run('readelf',['-lW','hello']),/INTERP/);
 assert.match(run('readelf',['-dW','hello']),/NEEDED/);
 console.log('PASS: ELF compile, execution and inspection');
 run('bash',['-c','set -euo pipefail\n'+code('linux-special-fs','sh')]);
 console.log('PASS: pseudo-filesystem inspection');
 const overlay=code('linux-mount-overlay','sh');
 run('bash',['-n','-c',overlay]);
 if(process.env.ATLAS_REVIEW_VM==='1'){
   assert.match(run('sudo',['unshare','--mount','--propagation','private','bash','-c',overlay]),/PASS: overlay copy-up and deletion/);
   console.log('PASS: OverlayFS copy-up and whiteout');
   const capture='set -euo pipefail\n'+'tcpdump -i lo -nn -l -c 2 "icmp and host 127.0.0.1" > "$PWD/capture.log" 2>&1 &\npid=$!\ntrap \'kill "$pid" 2>/dev/null || true\' EXIT\nfor i in $(seq 1 50); do grep -q "listening on" capture.log && break; sleep 0.1; done\ngrep -q "listening on" capture.log\nping -c 1 -W 2 127.0.0.1\nwait "$pid"\ntrap - EXIT\ncat capture.log';
   // Dedicated netns avoids capturing unrelated loopback traffic.
   const output=run('sudo',['unshare','--net','bash','-c','ip link set lo up\n'+capture]);
   assert.match(output,/echo request/);assert.match(output,/echo reply/);
   console.log('PASS: isolated ICMP packet capture');
 }else console.log('SKIP: overlay and capture require disposable VM');
}finally{rmSync(lab,{recursive:true,force:true});}
