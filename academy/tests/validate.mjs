import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const subjects = ['linux', 'git', 'docker', 'devops', 'architecture', 'assembly', 'internet', 'cryptography', 'commands', 'deepening'];
const load = path => readFileSync(new URL(path, root), 'utf8');
const win = {};
for (const path of ['content.js', ...subjects.map(name => 'subjects/' + name + '.js')]) {
  const source = load(path);
  new vm.Script(source, { filename: path }).runInNewContext({ window: win }, { timeout: 3000 });
}
new vm.Script(load('assets/app.js'), { filename: 'assets/app.js' });
new vm.Script(load('assets/theme.js'), { filename: 'assets/theme.js' });
new vm.Script(load('assets/labs.js'), {filename:'assets/labs.js'}).runInNewContext({window:win});
const labs=win.ATLAS_LABS;
assert.equal(Array.from(labs.mmuModel('0x41234567').indices).join(','),'0,1,9,52');assert.equal(labs.mmuModel('0x41234567').offset,0x567);assert.equal(labs.mmuModel('0x800000000000'),null);assert.equal(labs.mmuModel('xyz'),null);
let cow=labs.cowInitial();cow=labs.cowStep(cow,'fork');assert.equal(cow.child,'A');cow=labs.cowStep(cow,'write');assert.equal(cow.a,7);assert.equal(cow.b,9);assert.equal(cow.child,'B');assert.equal(labs.cowStep(cow,'reset').child,null);
assert(!labs.unitModel(false,true,false).included);assert(labs.unitModel(true,true,false).ordered);assert(!labs.unitModel(true,false,false).ordered);assert(labs.unitModel(false,true,true).ordered);
assert.equal(labs.subnet('192.0.2.130',26).network,'192.0.2.128');
assert.equal(labs.subnet('192.0.2.130',26).last,'192.0.2.191');
assert.equal(labs.subnet('0.0.0.0',0).size,4294967296);
assert.equal(labs.subnet('192.0.2.4',31).hostCount,2);
assert.equal(labs.subnet('192.0.2.4',32).hostCount,1);
assert.equal(labs.subnet('300.0.0.1',24),null);
assert.equal(labs.subnet('1.2.3.4',33),null);
let model=labs.gitInitial(); for(const action of ['edit','add','edit','commit'])model=labs.gitStep(model,action);
assert.equal(model.head,'V1');assert.equal(model.work,'V2');assert.equal(labs.gitStatus(model),' M');
let tcp=labs.tcpStep({},'reset');tcp=labs.tcpStep(tcp,'next');tcp=labs.tcpStep(tcp,'drop');assert(tcp.lost);tcp=labs.tcpStep(tcp,'next');assert.equal(tcp.step,1);assert(!tcp.lost);for(let i=0;i<6;i++)tcp=labs.tcpStep(tcp,'next');assert.equal(tcp.step,7);
for (const path of ['editorial.js', 'reference.js', 'levels.js', 'figures.js']) new vm.Script(load(path), {filename:path}).runInNewContext({window:win});
for(const path of ['subjects/programming.js','subjects/linux-admin.js','subjects/linux-memory.js','subjects/linux-boot.js','subjects/linux-security.js','subjects/linux-kernel.js','subjects/linux-projects.js','subjects/linux-review.js','subjects/git-foundations.js','subjects/git-internals.js','subjects/git-branching.js','subjects/git-recovery.js','subjects/git-remotes-lab.js','subjects/git-team.js','subjects/git-teaching-pilot.js','subjects/git-teaching-start.js','subjects/git-teaching-history.js','subjects/git-teaching-branches.js','subjects/git-teaching-merge.js','subjects/git-teaching-remotes.js','subjects/git-teaching-safety.js','subjects/git-teaching-reset.js','subjects/git-junior-project.js','subjects/git-teaching-objects.js','articles.js'])new vm.Script(load(path),{filename:path}).runInNewContext({window:win});
new vm.Script(load('assets/teaching.js'),{filename:'assets/teaching.js'}).runInNewContext({window:win});
new vm.Script(load('assets/teaching-start.js'),{filename:'assets/teaching-start.js'}).runInNewContext({window:win});
new vm.Script(load('assets/teaching-history.js'),{filename:'assets/teaching-history.js'}).runInNewContext({window:win});
new vm.Script(load('assets/teaching-branches.js'),{filename:'assets/teaching-branches.js'}).runInNewContext({window:win});
new vm.Script(load('assets/teaching-merge.js'),{filename:'assets/teaching-merge.js'}).runInNewContext({window:win});
new vm.Script(load('assets/teaching-remotes.js'),{filename:'assets/teaching-remotes.js'}).runInNewContext({window:win});
new vm.Script(load('assets/teaching-safety.js'),{filename:'assets/teaching-safety.js'}).runInNewContext({window:win});
new vm.Script(load('assets/teaching-reset.js'),{filename:'assets/teaching-reset.js'}).runInNewContext({window:win});
new vm.Script(load('assets/teaching-capstone.js'),{filename:'assets/teaching-capstone.js'}).runInNewContext({window:win});
new vm.Script(load('assets/teaching-objects.js'),{filename:'assets/teaching-objects.js'}).runInNewContext({window:win});
const d = win.ATLAS_DATA;
for(const id of win.ATLAS_GUIDED_IDS){const l=d.lessons.find(x=>x.id===id);for(const body of [l.body,...(win.ATLAS_LEVELS.minimum[id]===0?[win.ATLAS_LEVELS.junior[id].body]:[])]){
 const markers=[...body.matchAll(/^:::learn ([a-z0-9-]+)$/gm)].map(m=>m[1]);assert(markers.length>=3&&markers.every(k=>win.ATLAS_TEACHING.keys.includes(k)),'Guided lesson '+id);
}}
for(const body of [d.lessons.find(l=>l.id==='git-index').body,win.ATLAS_LEVELS.junior['git-index'].body]){
 assert(body.split(/\s+/).length>=600,'Teaching pilot depth');
 const markers=[...body.matchAll(/^:::learn ([a-z0-9-]+)$/gm)].map(m=>m[1]);
 assert(markers.length>=5&&markers.every(k=>win.ATLAS_TEACHING.keys.includes(k)),'Missing teaching blocks');
}
assert(win.ATLAS_ARTICLES.length>=8);const articleIds=new Set();for(const a of win.ATLAS_ARTICLES){assert(!articleIds.has(a.id));articleIds.add(a.id);assert(a.title&&a.summary&&a.category&&a.body.split(/\s+/).length>=300);assert(a.diagram.steps.length>=2);assert(a.sources.every(s=>s.title&&s.url.startsWith('https://')));assert((a.body.match(/~~~/g)||[]).length%2===0);}
assert(d && Array.isArray(d.courses) && Array.isArray(d.lessons), 'Data model not initialized');
assert.equal(d.courses.length, 11, 'All eleven directions must be available');
assert(d.lessons.length >= 187, 'Unexpectedly low number of published chapters');
const ids = new Set();
const levels=win.ATLAS_LEVELS;
assert.deepEqual(Array.from(levels.names),['Junior','Middle','Senior','God']);
assert(Object.keys(levels.junior).length>=88);
assert(Object.keys(levels.advanced).length>=7);
for(const c of d.courses){
 const ls=d.lessons.filter(l=>l.course===c.id);
 assert.equal(levels.order[c.id].length,ls.length,'Incomplete order '+c.id);
 assert.equal(new Set(levels.order[c.id]).size,ls.length,'Duplicate order '+c.id);
 assert(ls.every(l=>levels.order[c.id].includes(l.id)),'Missing order '+c.id);
 assert(levels.courses[c.id].future.length>=3);
 for(let n=0;n<4;n++)assert(ls.some(l=>levels.minimum[l.id]<=n),'Empty route '+c.id);
}
assert(d.lessons.filter(l=>l.course==='linux').length>=63);
assert.equal(levels.minimum['linux-systemd'],0);
for(const id of ['linux-accounts','linux-network-admin','linux-monitoring','linux-ipc','linux-scheduler','linux-cgroups','linux-journal','linux-ext4','linux-cow-filesystems','linux-lvm-raid','linux-encryption','linux-block-io','linux-mmu','linux-mmap-cow','linux-reclaim','linux-syscalls','linux-event-io','linux-io-uring']){const chapter=d.lessons.find(l=>l.id===id);assert(chapter&&chapter.body.split(/\s+/).length>=430&&/## (?:Практика и )?[Сс]амостоятельная работа/.test(chapter.body),'Linux editorial depth: '+id);}
for(const id of ['linux-signals','linux-capstone']){const chapter=d.lessons.find(l=>l.id===id);assert(chapter&&chapter.body.split(/\s+/).length>=430&&levels.minimum[id]===0,'Linux practice: '+id);}
for(const id of ['linux-firmware','linux-initramfs','linux-service-dependencies','linux-timers','linux-package-trust','linux-recovery']){const l=d.lessons.find(x=>x.id===id);assert(l&&l.body.split(/\s+/).length>=340&&l.body.includes('## Самостоятельная работа'),'Linux boot and maintenance: '+id);}
assert.equal(levels.minimum['linux-boot'],0);
for(const id of ['linux-netns','linux-sockets','linux-netfilter','linux-ssh-admin','linux-capabilities','linux-lsm','linux-seccomp-landlock','linux-security-basics']){const l=d.lessons.find(x=>x.id===id);assert(l&&l.body.split(/\s+/).length>=330&&l.body.includes('## Самостоятельная работа'),'Linux networking and security: '+id);}
for(const id of ['linux-kbuild','linux-modules','linux-driver-model','linux-irq-dma','linux-locking','linux-futex-rcu','linux-tracing','linux-upstream']){const l=d.lessons.find(x=>x.id===id);assert(l&&l.body.split(/\s+/).length>=360&&l.body.includes('## Самостоятельная работа')&&levels.minimum[id]===2,'Linux kernel mechanisms: '+id);}
for(const id of ['linux-storage-lab','linux-middle-project','linux-senior-project']){const l=d.lessons.find(x=>x.id===id);assert(l&&l.body.split(/\s+/).length>=450&&l.body.includes('## Самостоятельная работа'),'Linux capstone depth: '+id);}
for(const id of ['linux-elf','linux-special-fs','linux-mount-overlay','linux-packet-diagnostics']){const l=d.lessons.find(x=>x.id===id);assert(l&&l.body.split(/\s+/).length>=310&&l.body.includes('## Самостоятельная работа'),'Linux review: '+id);}
const order=levels.order.linux;
for(const [before,after] of [['linux-vfs','linux-search-text'],['linux-encryption','linux-storage-lab'],['linux-processes','linux-syscalls'],['linux-memory','linux-mmap-cow'],['linux-cgroups','linux-netns'],['linux-systemd','linux-service-dependencies'],['linux-syscalls','linux-io-uring'],['linux-capstone','linux-middle-project'],['linux-middle-project','linux-senior-project']])assert(order.indexOf(before)<order.indexOf(after),'Prerequisite order '+before+' / '+after);
for(const id of order.filter(id=>levels.minimum[id]===0))assert(levels.junior[id].body.split(/\s+/).length>=200,'Junior review depth '+id);
assert.equal(order.filter(id=>levels.minimum[id]===0).length,22);
const linuxReference=win.ATLAS_REFERENCE.find(x=>x.id==='linux').groups.flatMap(g=>g.entries);
assert.equal(new Set(linuxReference.map(e=>e.name)).size,linuxReference.length,'Duplicate Linux reference names');
assert(linuxReference.filter(e=>e.options?.length).length>=94);
for(const e of linuxReference)for(const option of e.options||[])assert(option.length===2&&option.every(Boolean),'Malformed option '+e.name);
for(const id of ['git-lab-config','git-diff-status','git-commit-quality','git-history-reading']){const l=d.lessons.find(x=>x.id===id);assert(l&&l.body.split(/\s+/).length>=320&&l.body.includes('## Самостоятельная работа')&&levels.minimum[id]===0&&levels.junior[id].body.split(/\s+/).length>=170,'Git fundamentals: '+id);}
assert.equal(levels.order.git.length,49);
const juniorGit=Array.from(levels.juniorOrder.git);
assert.equal(juniorGit.length,21);
assert.equal(juniorGit.at(-1),'git-junior-project');
assert.equal(new Set(juniorGit).size,21);
assert.deepEqual([...juniorGit].sort(),Array.from(levels.order.git).filter(id=>levels.minimum[id]===0).sort());
assert(juniorGit.every(id=>win.ATLAS_GUIDED_IDS.includes(id)),'All Junior Git chapters have guided editions');
assert(juniorGit.indexOf('git-team-review')<juniorGit.indexOf('git-revert-lab')&&juniorGit.indexOf('git-revert-lab')<juniorGit.indexOf('git-stash-lab'),'Continuous project prerequisites');
for(const [id,min] of [["git-hooks-lab",1],["git-signatures-lab",1],["git-dependencies-lab",1],["git-attributes-lab",1],["git-maintenance-lab",2],["git-repository-security",0],["git-team-review",0]]){const l=d.lessons.find(x=>x.id===id);assert(l&&l.body.split(/\s+/).length>=320&&l.body.includes('## Самостоятельная работа')&&levels.minimum[id]===min,'Git team: '+id);if(min===0)assert(levels.junior[id].body.split(/\s+/).length>=170,'Git Junior: '+id);}
for(const [before,after] of [["git-tags-mirror","git-hooks-lab"],["git-hooks-lab","git-signatures-lab"],["git-signatures-lab","git-dependencies-lab"],["git-dependencies-lab","git-attributes-lab"],["git-attributes-lab","git-maintenance-lab"],["git-maintenance-lab","git-repository-security"],["git-repository-security","git-team-review"]])assert(levels.order.git.indexOf(before)<levels.order.git.indexOf(after),'Git prerequisite '+before+' / '+after);
for(const [id,min] of [["git-fetch-push-lab",0],["git-refspec-lab",1],["git-push-lease",1],["git-transport-v2",2],["git-shallow-partial",2],["git-tags-mirror",1]]){const l=d.lessons.find(x=>x.id===id);assert(l&&l.body.split(/\s+/).length>=320&&l.body.includes('## Самостоятельная работа')&&levels.minimum[id]===min,'Git remotes: '+id);if(min===0)assert(levels.junior[id].body.split(/\s+/).length>=170,'Git Junior: '+id);}
for(const [before,after] of [["git-remotes","git-fetch-push-lab"],["git-fetch-push-lab","git-refspec-lab"],["git-refspec-lab","git-push-lease"],["git-push-lease","git-transport-v2"],["git-transport-v2","git-shallow-partial"],["git-shallow-partial","git-tags-mirror"]])assert(levels.order.git.indexOf(before)<levels.order.git.indexOf(after),'Git prerequisite '+before+' / '+after);
for(const [id,min] of [["git-restore-reset-lab",0],["git-revert-lab",0],["git-stash-lab",0],["git-reflog-recovery",1],["git-revision-ranges",1],["git-bisect-lab",1],["git-worktree-lab",2]]){const l=d.lessons.find(x=>x.id===id);assert(l&&l.body.split(/\s+/).length>=320&&l.body.includes('## Самостоятельная работа')&&levels.minimum[id]===min,'Git recovery: '+id);if(min===0)assert(levels.junior[id].body.split(/\s+/).length>=170,'Git Junior: '+id);}
for(const [before,after] of [["git-rerere-lab","git-restore-reset-lab"],["git-restore-reset-lab","git-revert-lab"],["git-revert-lab","git-stash-lab"],["git-stash-lab","git-reflog-recovery"],["git-reflog-recovery","git-revision-ranges"],["git-revision-ranges","git-bisect-lab"],["git-bisect-lab","git-worktree-lab"]])assert(levels.order.git.indexOf(before)<levels.order.git.indexOf(after),'Git prerequisite '+before+' / '+after);
for(const [id,min] of [["git-branch-lab",0],["git-merge-lab",0],["git-conflict-index-lab",1],["git-rebase-lab",1],["git-interactive-rebase",1],["git-cherry-pick-lab",1],["git-rerere-lab",2]]){const l=d.lessons.find(x=>x.id===id);assert(l&&l.body.split(/\s+/).length>=320&&l.body.includes('## Самостоятельная работа')&&levels.minimum[id]===min,'Git branching: '+id);if(min===0)assert(levels.junior[id].body.split(/\s+/).length>=170,'Git Junior: '+id);}
for(const [before,after] of [["git-undo","git-branch-lab"],["git-merge","git-merge-lab"],["git-conflicts","git-conflict-index-lab"],["git-conflict-index-lab","git-rebase-lab"],["git-rebase-lab","git-interactive-rebase"],["git-interactive-rebase","git-cherry-pick-lab"],["git-cherry-pick-lab","git-rerere-lab"]])assert(levels.order.git.indexOf(before)<levels.order.git.indexOf(after),'Git prerequisite '+before+' / '+after);
for(const [id,min] of [["git-object-bytes",1],["git-ref-model",1],["git-index-format",1],["git-pack-storage",2],["git-plumbing-commit",2]]){const l=d.lessons.find(x=>x.id===id);assert(l&&l.body.split(/\s+/).length>=320&&l.body.includes('## Самостоятельная работа')&&levels.minimum[id]===min,'Git internals: '+id);}
for(const [before,after] of [["git-objects","git-object-bytes"],["git-object-bytes","git-ref-model"],["git-history-reading","git-index-format"],["git-ref-model","git-pack-storage"],["git-index-format","git-plumbing-commit"]])assert(levels.order.git.indexOf(before)<levels.order.git.indexOf(after),'Git prerequisite '+before+' / '+after);
const editorial=win.ATLAS_EDITORIAL;
assert(editorial && win.ATLAS_REFERENCE, 'Editorial and reference data missing');
assert.equal(Object.keys(editorial).length,d.lessons.length,'Editorial coverage must match published chapters');
const refCount=win.ATLAS_REFERENCE.flatMap(r=>r.groups.flatMap(g=>g.entries)).length;
assert(refCount>=450,'Command reference lost entries');
const courseIds = new Set(d.courses.map(c => c.id));
assert.equal(courseIds.size, d.courses.length, 'Duplicate course ids');
for (const course of d.courses) {
  assert(course.title && course.longDescription, 'Missing course info');
  assert(course.roadmap.length > 0, 'Missing roadmap: ' + course.id);
  assert(d.lessons.some(l => l.course === course.id), 'No lessons for: ' + course.id);
}
let words = 0;
for (const lesson of d.lessons) {
  assert(!ids.has(lesson.id), 'Duplicate lesson id: ' + lesson.id);
  ids.add(lesson.id);
  assert(courseIds.has(lesson.course), 'Unknown course: ' + lesson.id);
  assert(lesson.title && lesson.summary && lesson.body, 'Incomplete lesson: ' + lesson.id);
  const min=levels.minimum[lesson.id];
  assert(Number.isInteger(min)&&min>=0&&min<=2,'Missing minimum '+lesson.id);
  if(min===0){const j=levels.junior[lesson.id];assert(j?.title&&j.body.includes('## '),'Missing junior text '+lesson.id);assert(j.body.split(/\s+/).length>=100,'Short junior variant '+lesson.id);assert((j.body.match(/~~~/g)||[]).length%2===0,'Unclosed junior code fence '+lesson.id);assert(levels.juniorTerms[lesson.id]?.length>=3,'Missing beginner glossary '+lesson.id);}
  if(min===0){assert(levels.juniorDiagrams[lesson.id]?.steps.length>=2,'Missing junior diagram '+lesson.id);assert(levels.juniorQuestions[lesson.id]?.length===2,'Missing junior question '+lesson.id);}
  if(levels.advanced[lesson.id])assert(levels.advancedDiagrams[lesson.id]?.steps.length>=2,'Missing senior diagram '+lesson.id);
  const e=editorial[lesson.id];
  assert(e && e.intro && e.terms.length>=3 && e.diagram.steps.length>=2 && e.questions.length,'Missing learning apparatus: '+lesson.id);
  for(const [term,meaning] of e.terms)assert(term&&meaning,'Empty glossary definition: '+lesson.id);
  for(const [title,description] of e.diagram.steps)assert(title&&description,'Invalid diagram: '+lesson.id);
  assert(lesson.body.includes('## '), 'No structure: ' + lesson.id);
  assert((lesson.body.match(/~~~/g) || []).length % 2 === 0, 'Unclosed code fence: ' + lesson.id);
  const count = lesson.body.trim().split(/\s+/).length;
  assert(count >= 180, 'Chapter is too shallow: ' + lesson.id + ' (' + count + ' words)');
  words += count;
  for (const ref of lesson.sources) {
    assert(d.sources[ref], 'Broken source reference: ' + lesson.id + ' / ' + ref);
  }
}
for (const [key, source] of Object.entries(d.sources)) {
  assert(/^https:\/\//.test(source.url), 'Non-HTTPS source: ' + key);
  assert(source.title && source.description, 'Incomplete source: ' + key);
}
const html = load('index.html');
for (const subject of subjects) {
  assert(html.includes('./subjects/' + subject + '.js'), 'Subject is not loaded: ' + subject);
}
assert(html.includes('src="./assets/theme.js"'),'Early theme initialization missing');
assert(!load('assets/app.js').includes('closest("[data-theme]")'),'Theme toggle must not match the document root');
assert(html.indexOf('src="./assets/theme.js"')<html.indexOf('rel="stylesheet"'),'Theme must initialize before CSS');
assert(html.indexOf('src="./content.js') < html.indexOf('src="./subjects/linux.js"'), 'Invalid script load order');
assert(html.indexOf('src="./subjects/cryptography.js"') < html.indexOf('src="./assets/app.js'), 'App runs before lesson data');
assert(Object.keys(win.ATLAS_FIGURES).length>=15,'Missing vector diagrams');
for(const id of Object.keys(win.ATLAS_FIGURES))assert(ids.has(id.replace(/^junior-/,'')),'Orphan SVG '+id);
console.log('Learning levels: %d Junior editions, %d Senior expansions; %d SVG diagrams.',Object.keys(levels.junior).length,Object.keys(levels.advanced).length,Object.keys(win.ATLAS_FIGURES).length);
const roadmapTopics = d.courses.reduce((n, c) => n + c.roadmap.reduce((k, g) => k + g.topics.length, 0), 0);
assert(roadmapTopics >= 300, 'Lost roadmap topics');
console.log('Editorial: %d chapters; command index: %d entries.',Object.keys(editorial).length,refCount);
console.log('Atlas validated: %d courses, %d lessons, %d words, %d roadmap topics, %d sources.', d.courses.length, d.lessons.length, words, roadmapTopics, Object.keys(d.sources).length);
