import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,chmodSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=mkdtempSync(join(tmpdir(),'atlas-junior-'));
const checker=fileURLToPath(new URL('../exercises/check-linux-junior.py',import.meta.url));
const run=(cmd,args)=>{const p=spawnSync(cmd,args,{encoding:'utf8',timeout:10000});if(p.error)throw p.error;return p;};
const write=(p,v)=>writeFileSync(join(root,p),v);
const verify=()=>run('python3',[checker,root]);
try{
 for(const dir of ['www','config','logs','reports','backup','restored'])mkdirSync(join(root,dir));
 const payload='atlas-service-v1\n';
 write('www/index.html',payload);write('restored/index.html',payload);
 write('config/service.conf','demo=1\n');chmodSync(join(root,'config'),0o700);chmodSync(join(root,'config/service.conf'),0o600);
 write('logs/service.log','INFO start\nERROR timeout\nINFO ready\nERROR timeout\nERROR disk\n');
 write('reports/errors.txt','disk 1\ntimeout 2\n');write('reports/defense.txt','synthetic CI fixture\n');
 assert.equal(run('tar',['-czf',join(root,'backup/www.tar.gz'),'-C',join(root,'www'),'index.html']).status,0);
 assert.match(verify().stdout,/PASS:/);assert.equal(verify().status,0);
 chmodSync(join(root,'config/service.conf'),0o644);assert.equal(verify().status,1);chmodSync(join(root,'config/service.conf'),0o600);
 write('restored/index.html','wrong');assert.equal(verify().status,1);write('restored/index.html',payload);
 write('reports/errors.txt','wrong');assert.equal(verify().status,1);write('reports/errors.txt','disk 1\ntimeout 2\n');
 symlinkSync('../config/service.conf',join(root,'www/leak'));assert.equal(verify().status,1);rmSync(join(root,'www/leak'));
 write('backup/www.tar.gz','broken');assert.equal(verify().status,1);
 console.log('PASS: Junior static contract and five negative acceptance cases');
}finally{rmSync(root,{recursive:true,force:true});}
