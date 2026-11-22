import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const source=readFileSync(new URL('../subjects/linux-memory.js',import.meta.url),'utf8');
const win={ATLAS_DATA:{lessons:[],sources:{}},ATLAS_LEVELS:{minimum:{},order:{linux:['linux-memory']}},ATLAS_EDITORIAL:{}};
new vm.Script(source).runInNewContext({window:win});
const lab=mkdtempSync(join(tmpdir(),'atlas-memory-'));
const run=(cmd,args,options={})=>{
 const p=spawnSync(cmd,args,{cwd:lab,encoding:'utf8',timeout:15000,...options});
 if(p.error)throw p.error;
 return p;
};
const ok=(cmd,args)=>{const p=run(cmd,args);assert.equal(p.status,0,cmd+' '+args.join(' ')+'\n'+p.stderr);return p.stdout;};
function code(id,lang){
 const l=win.ATLAS_DATA.lessons.find(x=>x.id===id);
 const re=new RegExp('~~~'+lang+'\\n([\\s\\S]*?)\\n~~~');
 const m=l.body.match(re);assert(m,'Missing example '+id);
 return m[1]+'\n';
}
function compile(id,name,extra=[]){
 writeFileSync(join(lab,name+'.c'),code(id,'c'));
 ok('cc',['-Wall','-Wextra','-Werror','-O2',name+'.c','-o',name,...extra]);
}
try{
 writeFileSync(join(lab,'mmu.py'),code('linux-mmu','python'));
 assert.equal(ok('python3',['mmu.py']),'PML4 0\nPDPT 1\nPD 9\nPT 52\noffset 0x567\n');
 console.log('PASS: MMU indices');
 compile('linux-mmap-cow','cow');
 assert.match(ok('./cow',[]),/parent byte: 7/);
 const shared=code('linux-mmap-cow','c').replace('MAP_PRIVATE | MAP_ANONYMOUS','MAP_SHARED | MAP_ANONYMOUS').replace('p[0] == 7','p[0] == 9');
 writeFileSync(join(lab,'shared.c'),shared);ok('cc',['-Wall','-Wextra','-Werror','-O2','shared.c','-o','shared']);
 assert.match(ok('./shared',[]),/parent byte: 9/);
 console.log('PASS: mmap private/shared and fork');
 compile('linux-syscalls','syscalls');
 ok('./syscalls',[]);
 assert.equal(readFileSync(join(lab,'note.txt'),'utf8'),'atlas syscall\n');
 const duplicate=run('./syscalls',[]);assert.equal(duplicate.status,1);assert.match(duplicate.stderr,/open:/);
 rmSync(join(lab,'note.txt'));
 const traced=run('strace',['-o','trace.txt','-e','trace=openat,write,close','./syscalls']);
 assert.equal(traced.status,0,traced.stderr);assert.match(readFileSync(join(lab,'trace.txt'),'utf8'),/openat\(.*"note\.txt".*O_EXCL/);
 console.log('PASS: syscall and strace');
 compile('linux-event-io','epoll_demo');
 assert.equal(ok('./epoll_demo',[]),'read: hello\n');
 console.log('PASS: epoll and nonblocking pipe');
 compile('linux-io-uring','ring',['-luring']);
 writeFileSync(join(lab,'ring.txt'),'hello');
 const ring=run('./ring',[]);
 if(ring.status===77){assert.match(ring.stderr,/io_uring unavailable/);console.log('SKIP runtime: '+ring.stderr.trim()+' (compile passed)');}
 else {assert.equal(ring.status,0,ring.stderr);assert.equal(ring.stdout,'completion: hello\n');console.log('PASS: io_uring completion');}
}finally{rmSync(lab,{recursive:true,force:true});}
