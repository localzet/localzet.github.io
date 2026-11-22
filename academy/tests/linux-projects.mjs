import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
const root=new URL('../subjects/',import.meta.url);
const source=readFileSync(new URL('linux-projects.js',root),'utf8');
const win={ATLAS_DATA:{lessons:[],sources:{}},ATLAS_LEVELS:{minimum:{},order:{linux:['linux-lvm-raid','linux-capstone']}},ATLAS_EDITORIAL:{}};
new vm.Script(source).runInNewContext({window:win});
const lab=mkdtempSync(join(tmpdir(),'atlas-projects-'));
const run=(cmd,args,timeout=60000)=>{const p=spawnSync(cmd,args,{cwd:lab,encoding:'utf8',timeout,env:{...process.env,LC_ALL:'C'}});if(p.error)throw p.error;return p;};
const ok=(cmd,args,timeout)=>{const p=run(cmd,args,timeout);assert.equal(p.status,0,cmd+' '+args.join(' ')+'\n'+p.stderr+'\n'+p.stdout);return p.stdout;};
const blocks=(body,lang)=>[...body.matchAll(new RegExp('~~~'+lang+'\\n([\\s\\S]*?)\\n~~~','g'))].map(x=>x[1]);
const body=id=>win.ATLAS_DATA.lessons.find(x=>x.id===id).body;
try{
 const admin=readFileSync(new URL('linux-admin.js',root),'utf8');
 const cap=JSON.parse(admin.match(/const data=([\s\S]*?);\nconst D=/)[1]).rows.find(x=>x.id==='linux-capstone');
 const [setup,archive]=blocks(cap.junior.body,'sh');
 // Run the published commands, replacing only the fixed port with a reserved
 // local ephemeral port and moving the foreground service to a child process.
 const junior='set -euo pipefail\n'+setup.replace('python3 -m http.server 18080 --bind 127.0.0.1','python3 -m http.server "$port" --bind 127.0.0.1 >server.log 2>&1 &\npid=$!\ntrap \'kill "$pid" 2>/dev/null || true\' EXIT')+'\nfor i in $(seq 1 50); do if curl -fsS --max-time 1 "http://127.0.0.1:$port/" >response 2>/dev/null; then break; fi; sleep 0.1; done\ngrep -qx atlas-service response\ncd ..\n'+archive+'\nkill -TERM "$pid"\nwait "$pid" || true\ntrap - EXIT\nif curl -fsS --max-time 1 "http://127.0.0.1:$port/" >/dev/null 2>&1; then exit 1; fi\n';
 const port=ok('python3',['-c','import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1])']).trim();
 ok('bash',['-c','port='+port+'\n'+junior]);console.log('PASS: Junior service and archive restore');
 assert.match(ok('bash',['-c',blocks(body('linux-middle-project'),'sh')[0]]),/PASS: service, failure, restore, shutdown/);
 writeFileSync(join(lab,'atlas-middle.service'),blocks(body('linux-middle-project'),'ini')[0]+'\n');
 ok('systemd-analyze',['verify','./atlas-middle.service']);console.log('PASS: Middle acceptance and unit validation');
 writeFileSync(join(lab,'senior_project.py'),blocks(body('linux-senior-project'),'python')[0]+'\n');
 for(const size of [1,8]){const report=JSON.parse(ok('python3',['senior_project.py',String(size)]));assert.equal(report.bytes,size*1024*1024);assert.equal(report.cow,'pass');assert.equal(report.socket,'pass');assert(report.minor_fault_delta>=0);}
 ok('strace',['-f','-c','-o','trace-summary.txt','python3','senior_project.py','8']);assert.match(readFileSync(join(lab,'trace-summary.txt'),'utf8'),/total/);console.log('PASS: Senior memory, COW, TCP and strace report');
 const storage=blocks(body('linux-storage-lab'),'sh')[0];
 ok('bash',['-n','-c',storage]);console.log('PASS: storage script syntax');
 if(process.env.ATLAS_STORAGE_VM==='1'){
   const probe=run('sudo',['bash','-c','modprobe loop && modprobe raid1 && modprobe dm_crypt && losetup --find']);
   if(probe.status!==0)console.log('SKIP: VM lacks loop/RAID/device-mapper support: '+probe.stderr.trim());
   else{assert.match(ok('sudo',['env','ATLAS_DISPOSABLE_VM=1','bash','-c',storage],180000),/PASS: storage stack readback/);console.log('PASS: RAID/LVM/LUKS/ext4 stack and cleanup');}
 }else console.log('SKIP: privileged storage stack requires disposable VM');
}finally{rmSync(lab,{recursive:true,force:true});}
