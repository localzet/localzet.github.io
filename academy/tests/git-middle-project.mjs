import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,chmodSync,rmSync,renameSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const checker=fileURLToPath(new URL('../exercises/check-git-middle.sh',import.meta.url));
const root=mkdtempSync(join(tmpdir(),'atlas-pro-'));
try{
const env={...process.env,HOME:root,LC_ALL:'C',GIT_CONFIG_GLOBAL:'/dev/null',GIT_CONFIG_NOSYSTEM:'1'};
for(const key of Object.keys(env))if(/^GIT_(DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|COMMON_DIR|CONFIG_COUNT|CONFIG_KEY_\d+|CONFIG_VALUE_\d+|CONFIG_PARAMETERS|AUTHOR_.*|COMMITTER_.*)$/.test(key))delete env[key];
const run=(cmd,args,success=true,extra={})=>{const p=spawnSync(cmd,args,{cwd:root,env:{...env,...extra},encoding:'utf8',timeout:45000});if(p.error)throw p.error;assert.equal(p.status===0,success,p.stdout+'\n'+p.stderr);return p.stdout+p.stderr;};
const path=r=>join(root,r);
const git=(r,...args)=>run('git',['-C',path(r),...args]);
const oid=r=>git(r,'rev-parse','HEAD').trim();
const put=(r,p,d)=>writeFileSync(join(root,r,p),d+'\n');
const commit=(r,msg,...paths)=>{git(r,'add','--',...paths);git(r,'commit','-qm',msg);return oid(r);};
const setup=(r,name)=>{git(r,'config','user.name',name);git(r,'config','user.email','student@example.invalid');git(r,'config','commit.gpgsign','false');git(r,'config','tag.gpgSign','false');git(r,'config','core.autocrlf','false');};
for(const r of ['app','library']){run('git',['init','-q','-b','main',path(r)]);run('git',['init','-q','--bare','-b','main',path(r+'.git')]);setup(r,r);git(r,'remote','add','origin',path(r+'.git'));}
put('library','lib.txt','library=v1');const lib1=commit('library','Library 1','lib.txt');git('library','push','-qu','origin','main');
git('app','-c','protocol.file.allow=always','submodule','add',path('library.git'),'vendor/library');
put('app','.gitattributes','*.txt text eol=lf');put('app','behavior.txt','guard=good');put('app','version.txt','1');
const good=commit('app','Version 1','.gitattributes','behavior.txt','version.txt','.gitmodules','vendor/library');
let defect;
for(let i=2;i<=8;i++){put('app','version.txt',String(i));if(i===5){put('app','behavior.txt','guard=broken');defect=commit('app','Version 5','version.txt','behavior.txt');}else commit('app','Version '+i,'version.txt');}
const bad=oid('app');git('app','push','-qu','origin','main');
writeFileSync(path('test-regression.sh'),'#!/bin/sh\ncase "$(cat behavior.txt 2>/dev/null)" in guard=good) exit 0;; guard=broken) exit 1;; *) exit 125;; esac\n');chmodSync(path('test-regression.sh'),0o755);
git('app','bisect','start',bad,good);git('app','bisect','run',path('test-regression.sh'));assert.equal(oid('app'),defect);writeFileSync(path('bisect.log'),git('app','bisect','log'));git('app','bisect','reset');
git('app','switch','-qc','release/1',defect);put('app','support.txt','support=legacy');const release=commit('app','Legacy support','support.txt');
git('app','switch','-q','main');put('app','behavior.txt','guard=good');const fix=commit('app','Repair guard','behavior.txt');git('app','switch','-q','release/1');git('app','cherry-pick','-x',fix);const backport=oid('app');git('app','push','-qu','origin','release/1');
git('app','switch','-q','main');git('app','switch','-qc','review/search');put('app','search.txt','search=v1');const first=commit('app','Search','search.txt');put('app','guide.txt','guide=search');commit('app','Guide','guide.txt');put('app','search.txt','search=v2');git('app','add','search.txt');git('app','commit','-q','--fixup='+first);const original=oid('app');git('app','branch','original-review');
run('git',['-C',path('app'),'rebase','-i','--autosquash','--exec','test "$(cat search.txt)" = search=v2',fix],true,{GIT_SEQUENCE_EDITOR:':'});
const review=oid('app');const rangeDiff=git('app','range-diff',fix+'..'+original,fix+'..'+review);git('app','switch','-q','main');git('app','merge','--ff-only','review/search');git('app','push','-qu','origin','review/search');
put('library','lib.txt','library=v2');const lib2=commit('library','Library 2','lib.txt');git('library','push','-q','origin','main');git('app/vendor/library','fetch','-q','origin');git('app/vendor/library','switch','--detach',lib2);
run('ssh-keygen',['-q','-t','ed25519','-N','','-f',path('key')]);writeFileSync(path('allowed_signers'),'student@example.invalid '+readFileSync(path('key.pub'),'utf8'));git('app','config','gpg.format','ssh');git('app','config','user.signingkey',path('key'));git('app','config','gpg.ssh.allowedSignersFile',path('allowed_signers'));
git('app','add','vendor/library');git('app','commit','-q','-S','-m','Pin library 2');const main=oid('app');git('app','tag','-s','v1.1',backport,'-m','Legacy release');git('app','tag','-s','v2.0',main,'-m','Current release');
git('app','push','-q','origin','main','refs/tags/v1.1','refs/tags/v2.0');
writeFileSync(path('app.git/hooks/pre-receive'),'#!/bin/sh\nwhile read -r old new ref; do\n  test "$ref" != refs/heads/blocked || exit 1\ndone\n');chmodSync(path('app.git/hooks/pre-receive'),0o755);
run('git',['-C',path('app'),'push','origin','HEAD:refs/heads/probe','HEAD:refs/heads/blocked'],false);
for(const name of ['app','library']){git(name+'.git','bundle','create',path(name+'.bundle'),'--all');run('git',['clone','-q','-b','main',path(name+'.bundle'),path('restored-'+name)]);}
git('restored-app','config','submodule.vendor/library.url',path('restored-library'));
renameSync(path('library.git'),path('library.git-offline'));renameSync(path('app.git'),path('app.git-offline'));
try{git('restored-app','-c','protocol.file.allow=always','submodule','update','--init');assert.equal(oid('restored-app/vendor/library'),lib2);}
finally{renameSync(path('library.git-offline'),path('library.git'));renameSync(path('app.git-offline'),path('app.git'));}
const evidence=Object.entries({good,defect,bad,fix,original,review,release,backport,main,lib1,lib2}).map(([k,v])=>k+'='+v).join('\n')+'\n';
writeFileSync(path('evidence.txt'),evidence);writeFileSync(path('report.md'),'Fixture: range-diff\n'+rangeDiff);
const check=(ok=true)=>run('bash',[checker,root],ok);
assert(check().includes('Atlas Notes Pro machine-checkable acceptance'));
writeFileSync(path('evidence.txt'),evidence.replace('defect='+defect,'defect='+bad));assert(check(false).includes('FAIL:'));writeFileSync(path('evidence.txt'),evidence);
const policy=readFileSync(path('allowed_signers'));run('ssh-keygen',['-q','-t','ed25519','-N','','-f',path('other')]);writeFileSync(path('allowed_signers'),'student@example.invalid '+readFileSync(path('other.pub'),'utf8'));assert(check(false).includes('signature rejected'));writeFileSync(path('allowed_signers'),policy);
git('restored-app','config','submodule.vendor/library.url',path('library.git'));assert(check(false).includes('restored submodule must use restored library'));git('restored-app','config','submodule.vendor/library.url',path('restored-library'));
git('app.git','update-ref','refs/heads/later',main);assert(check(false).includes('bundle refs differ'));git('app.git','update-ref','-d','refs/heads/later');
assert(check().includes('Atlas Notes Pro machine-checkable acceptance'));
console.log('PASS: actual Middle capstone, offline dependency restoration and four negative acceptance cases');
}finally{rmSync(root,{recursive:true,force:true});}
