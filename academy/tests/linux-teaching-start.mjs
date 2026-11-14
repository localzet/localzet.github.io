import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const ids=['linux-history','linux-lab-start','linux-shell','linux-vfs','linux-search-text','linux-bash-scripts','linux-permissions','linux-accounts','linux-processes','linux-network-admin','linux-signals','linux-monitoring','linux-systemd','linux-journal','linux-timers','linux-disks','linux-packages','linux-security-basics','linux-boot','linux-memory','linux-service-dependencies','linux-recovery','linux-cli-atlas','linux-capstone','linux-package-trust','linux-ssh-admin','linux-elf','linux-syscalls','linux-ipc'];
const window={ATLAS_DATA:{lessons:ids.map(id=>({id,body:''}))},ATLAS_LEVELS:{junior:{},minimum:{}},ATLAS_EDITORIAL:Object.fromEntries(ids.map(id=>[id,{}])),ATLAS_GUIDED_IDS:[],ATLAS_TEACHING:{keys:[],render(){},mount(){}}};
const load=p=>new vm.Script(readFileSync(new URL('../'+p,import.meta.url),'utf8')).runInNewContext({window});
load('subjects/linux-teaching-start.js');load('assets/teaching-linux-start.js');
const t=window.ATLAS_TEACHING;
assert.equal(t.linuxArgvCases.quoted.args.length,2);
assert.equal(t.linuxArgvCases.split.args.length,3);
assert.equal(t.linuxStreams.reverse.err,'Терминал');
let s=t.linuxPipeStep(0,'uniq');assert.equal(s,0);
for(const a of ['grep','sort','uniq'])s=t.linuxPipeStep(s,a);
assert.deepEqual(Array.from(t.linuxPipeOutput(s)),['1 ERROR disk','2 ERROR timeout']);
const blocks=body=>[...body.matchAll(/~~~sh\n([\s\S]*?)\n~~~/g)].map(m=>m[1]);
const lab=mkdtempSync(join(tmpdir(),'atlas-linux-start-'));
try{
const env={...process.env,LC_ALL:'C',HOME:lab,TMPDIR:lab};
const run=(code,id)=>{const p=spawnSync('bash',['--noprofile','--norc','-c',code],{cwd:lab,env,encoding:'utf8',timeout:30000});if(p.error)throw new Error(id+'\n'+p.stdout+'\n'+p.stderr,{cause:p.error});assert.equal(p.status,0,id+'\n'+p.stdout+'\n'+p.stderr);return p.stdout;};
let count=0;
for(const l of window.ATLAS_DATA.lessons){
 for(const body of [l.body,...(window.ATLAS_LEVELS.junior[l.id]?[window.ATLAS_LEVELS.junior[l.id].body]:[])]){
  const keys=[...body.matchAll(/^:::learn (\S+)$/gm)].map(m=>m[1]);assert(keys.length>=3&&keys.every(k=>t.keys.includes(k)),l.id);
 }
 for(const code of blocks(l.body).filter(code=>code.includes('PASS:'))){assert(run(code,l.id).includes('PASS:'));count++;}
}
assert.equal(count,55);
run('set -eu\n'+ids.flatMap(id=>blocks(window.ATLAS_LEVELS.junior[id]?.body||'')).join('\n')+'\ntest "$(cat www/index.html)" = atlas-service-v1\ntest "$(wc -l < logs/errors.log)" -eq 3\ntest ! -s logs/output.txt\ntest -s logs/diagnostic.txt\ntest "$(cat reports/errors.txt)" = "$(printf \'disk 1\\ntimeout 2\')"\ntest "$(bash scripts/report.sh logs/service.log)" = 3\ntest "$(stat -c %a config/service.conf)" = 600\ntest "$(cat reports/background.txt)" = 3\ntest "$(cat reports/server-exit.txt)" = 0\ngrep -q "^HTTP 200$" reports/http-timing.txt\ntest -s reports/resources.txt\ntest "$(cat reports/incident-status.txt)" = exit=2\ntest "$(cat reports/last-check.txt)" = 3\ntest -s units/atlas-lab.service\ntest -s units/atlas-check.timer\ntest -s reports/storage.txt\ntest -s reports/dependencies.txt\ntest "$(dpkg-deb -f packaging/atlas-doc.deb Package)" = atlas-doc\ngrep -q "^config: HTTP 404$" reports/security.txt\ntest -s reports/threat-model.txt\ntest -s reports/boot.txt\ngrep -q "^mapped$" reports/memory.txt\ntest -s reports/package-plan.txt\nsha256sum -c reports/package.sha256\ngrep -qx "port 2222" reports/ssh-config.txt\ntest -s reports/ssh-fingerprint.txt','continuous Junior service workspace');
console.log('PASS: fifty-five Linux labs and continuous Junior service workspace');
}finally{rmSync(lab,{recursive:true,force:true});}
