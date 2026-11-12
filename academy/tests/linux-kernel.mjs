import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
const source=readFileSync(new URL('../subjects/linux-kernel.js',import.meta.url),'utf8');
const win={ATLAS_DATA:{lessons:[],sources:{}},ATLAS_LEVELS:{minimum:{},order:{linux:['linux-reclaim']}},ATLAS_EDITORIAL:{}};
new vm.Script(source).runInNewContext({window:win});
const lab=mkdtempSync(join(tmpdir(),'atlas-kernel-'));
const run=(cmd,args)=>{const p=spawnSync(cmd,args,{cwd:lab,encoding:'utf8',timeout:120000,env:{...process.env,LC_ALL:'C'}});if(p.error)throw p.error;return p;};
const ok=(cmd,args)=>{const p=run(cmd,args);assert.equal(p.status,0,cmd+' '+args.join(' ')+'\n'+p.stderr+'\n'+p.stdout);return p.stdout;};
const blocks=(id,lang)=>[...win.ATLAS_DATA.lessons.find(x=>x.id===id).body.matchAll(new RegExp('~~~'+lang+'\\n([\\s\\S]*?)\\n~~~','g'))].map(x=>x[1]);
function compile(name,code,flags=[]){writeFileSync(join(lab,name+'.c'),code+'\n');ok('cc',['-std=c11','-Wall','-Wextra','-Werror','-O2',...flags,name+'.c','-o',name]);}
try{
 compile('atomic_demo',blocks('linux-locking','c')[0],['-pthread']);
 assert.equal(ok('./atomic_demo',[]).trim(),'count: 400000');
 console.log('PASS: atomic counter');
 const [futex,publish]=blocks('linux-futex-rcu','c');
 compile('futex_demo',futex);assert.equal(ok('./futex_demo',[]).trim(),'value changed: no wait');
 compile('publish_demo',publish,['-pthread']);assert.equal(ok('./publish_demo',[]).trim(),'published: 42');
 console.log('PASS: futex mismatch and release/acquire publication');
 writeFileSync(join(lab,'atlas_bpf.c'),blocks('linux-tracing','c')[0]+'\n');
 const clang=process.env.ATLAS_CLANG||'/usr/bin/clang';
 ok(clang,['-target','bpf','-O2','-g','-Wall','-Wextra','-Werror','-c','atlas_bpf.c','-o','atlas_bpf.o']);
 assert.match(ok('readelf',['-h','atlas_bpf.o']),/BPF/);
 assert.match(ok('readelf',['-SW','atlas_bpf.o']),/tracepoint\/syscalls\/sys_enter_getpid/);
 console.log('PASS: BPF ELF build (no load)');
 const running=join('/lib/modules',ok('uname',['-r']).trim(),'build');
 const candidates=readdirSync('/lib/modules').map(n=>join('/lib/modules',n,'build')).filter(p=>existsSync(join(p,'Makefile')));
 const headers=process.env.ATLAS_KERNEL_HEADERS|| (existsSync(join(running,'Makefile'))?running:candidates.find(p=>p.includes('-generic/'))||candidates[0]);
 assert(headers&&existsSync(join(headers,'Makefile')),'No prepared kernel headers');
 writeFileSync(join(lab,'atlas_module.c'),blocks('linux-modules','c')[0]+'\n');
 writeFileSync(join(lab,'Makefile'),blocks('linux-modules','makefile')[0]+'\n');
 ok('make',['-C',headers,'M='+lab,'modules']);
 assert(existsSync(join(lab,'atlas_module.ko')));
 assert.match(ok('modinfo',[join(lab,'atlas_module.ko')]),/Atlas build-only teaching module/);
 console.log('PASS: module build against '+headers+' (no load)');
}finally{rmSync(lab,{recursive:true,force:true});}
