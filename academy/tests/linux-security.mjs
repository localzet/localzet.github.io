import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
const source=readFileSync(new URL('../subjects/linux-security.js',import.meta.url),'utf8');
const win={ATLAS_DATA:{lessons:[],sources:{}},ATLAS_LEVELS:{minimum:{},order:{linux:['linux-network-admin','linux-cgroups','linux-accounts']},junior:{},juniorTerms:{},juniorDiagrams:{},juniorQuestions:{}},ATLAS_EDITORIAL:{}};
new vm.Script(source).runInNewContext({window:win});
const lab=mkdtempSync(join(tmpdir(),'atlas-security-'));
const run=(cmd,args)=>{const p=spawnSync(cmd,args,{cwd:lab,encoding:'utf8',timeout:30000,env:{...process.env,LC_ALL:'C'}});if(p.error)throw p.error;return p;};
const ok=(cmd,args)=>{const p=run(cmd,args);assert.equal(p.status,0,cmd+' '+args.join(' ')+'\n'+p.stderr+'\n'+p.stdout);return p.stdout;};
const blocks=(id,lang)=>[...win.ATLAS_DATA.lessons.find(x=>x.id===id).body.matchAll(new RegExp('~~~'+lang+'\\n([\\s\\S]*?)\\n~~~','g'))].map(x=>x[1]);
const compile=(name,code,libs=[])=>{writeFileSync(join(lab,name+'.c'),code+'\n');ok('cc',['-Wall','-Wextra','-Werror','-O2',name+'.c','-o',name,...libs]);};
try{
 writeFileSync(join(lab,'socket_demo.py'),blocks('linux-sockets','python')[0]);assert.equal(ok('python3',['socket_demo.py']).trim(),'received: hello');
 console.log('PASS: loopback TCP socket');
 ok('bash',['-c',blocks('linux-ssh-admin','sh')[0]]);
 writeFileSync(join(lab,'ssh_config'),blocks('linux-ssh-admin','text')[0]);
 assert.match(ok('ssh',['-G','-F','ssh_config','atlas-example']),/^hostname 192\.0\.2\.10$/m);
 console.log('PASS: temporary SSH key and offline config');
 assert.match(ok('setpriv',['--no-new-privs','sh','-c','grep "^NoNewPrivs:" /proc/self/status']),/NoNewPrivs:\s+1/);
 console.log('PASS: no_new_privs');
 const [seccomp,landlock]=blocks('linux-seccomp-landlock','c');
 compile('seccomp_demo',seccomp,['-lseccomp']);
 const sc=run('./seccomp_demo',[]);
 if(sc.status===77)console.log('SKIP: seccomp unavailable: '+sc.stderr.trim());
 else{assert.equal(sc.status,0,sc.stderr);assert.match(sc.stdout,/getppid denied/);console.log('PASS: seccomp denial');}
 compile('landlock_demo',landlock);
 writeFileSync(join(lab,'allow.txt'),'allowed\n');writeFileSync(join(lab,'deny.txt'),'denied\n');
 assert.equal(ok('cat',['deny.txt']),'denied\n');
 const ll=run('./landlock_demo',[]);
 if(ll.status===77)console.log('SKIP: Landlock ABI unavailable: '+ll.stderr.trim());
 else{assert.equal(ll.status,0,ll.stderr);assert.match(ll.stdout,/allow.txt readable; deny.txt denied/);console.log('PASS: Landlock allowed and denied file');}
 // Privileged network labs are opt-in and run only on a dedicated disposable CI VM.
 if(process.env.ATLAS_NETWORK_VM==='1'){
   const net=ok('sudo',['bash','-c',blocks('linux-netns','sh')[0]]);
   assert.match(net,/2 received/);console.log('PASS: isolated veth connectivity');
   const nft=ok('sudo',['bash','-c',blocks('linux-netfilter','sh')[0]]);
   assert.match(nft,/1 received/);assert.match(nft,/counter packets [1-9]/);console.log('PASS: isolated nftables policy');
   const negative=`set -euo pipefail
ip link set lo up
nft -f - <<'NFT'
table inet atlas {
  chain input {
    type filter hook input priority 0; policy accept;
    iifname "lo" icmp type echo-request counter drop
  }
}
NFT
if ping -c 1 -W 1 127.0.0.1; then exit 1; fi
nft list table inet atlas
`;
   const denied=ok('sudo',['unshare','--net','bash','-c',negative]);
   assert.match(denied,/counter packets [1-9][0-9]* bytes [0-9]+ drop/);
   console.log('PASS: isolated nftables denied ICMP and rule counter');
 }else console.log('SKIP: privileged namespace labs (enable only on disposable VM)');
}finally{rmSync(lab,{recursive:true,force:true});}
