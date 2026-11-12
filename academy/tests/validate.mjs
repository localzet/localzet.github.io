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
for (const path of ['editorial.js', 'reference.js', 'levels.js']) new vm.Script(load(path), {filename:path}).runInNewContext({window:win});
const d = win.ATLAS_DATA;
assert(d && Array.isArray(d.courses) && Array.isArray(d.lessons), 'Data model not initialized');
assert.equal(d.courses.length, 7, 'The seven requested directions must be available');
assert(d.lessons.length >= 64, 'Unexpectedly low number of published chapters');
const ids = new Set();
const levels=win.ATLAS_LEVELS;
assert.deepEqual(Array.from(levels.names),['Junior','Middle','Senior','God']);
assert(Object.keys(levels.junior).length>=35);
assert(Object.keys(levels.advanced).length>=7);
for(const c of d.courses){
 const ls=d.lessons.filter(l=>l.course===c.id);
 assert.equal(levels.order[c.id].length,ls.length,'Incomplete order '+c.id);
 assert.equal(new Set(levels.order[c.id]).size,ls.length,'Duplicate order '+c.id);
 assert(ls.every(l=>levels.order[c.id].includes(l.id)),'Missing order '+c.id);
 assert(levels.courses[c.id].future.length>=3);
 for(let n=0;n<4;n++)assert(ls.some(l=>levels.minimum[l.id]<=n),'Empty route '+c.id);
}
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
  if(min===0){const j=levels.junior[lesson.id];assert(j?.title&&j.body.includes('## '),'Missing junior text '+lesson.id);assert(j.body.split(/\s+/).length>=100,'Short junior variant '+lesson.id);}
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
assert(html.indexOf('src="./content.js"') < html.indexOf('src="./subjects/linux.js"'), 'Invalid script load order');
assert(html.indexOf('src="./subjects/cryptography.js"') < html.indexOf('src="./assets/app.js'), 'App runs before lesson data');
const roadmapTopics = d.courses.reduce((n, c) => n + c.roadmap.reduce((k, g) => k + g.topics.length, 0), 0);
assert(roadmapTopics >= 300, 'Lost roadmap topics');
console.log('Editorial: %d chapters; command index: %d entries.',Object.keys(editorial).length,refCount);
console.log('Atlas validated: %d courses, %d lessons, %d words, %d roadmap topics, %d sources.', d.courses.length, d.lessons.length, words, roadmapTopics, Object.keys(d.sources).length);
