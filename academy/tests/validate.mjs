import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const subjects = ['linux', 'git', 'docker', 'devops', 'architecture', 'assembly', 'internet', 'cryptography', 'commands'];
const load = path => readFileSync(new URL(path, root), 'utf8');
const win = {};
for (const path of ['content.js', ...subjects.map(name => 'subjects/' + name + '.js')]) {
  const source = load(path);
  new vm.Script(source, { filename: path }).runInNewContext({ window: win }, { timeout: 3000 });
}
new vm.Script(load('assets/app.js'), { filename: 'assets/app.js' });
const d = win.ATLAS_DATA;
assert(d && Array.isArray(d.courses) && Array.isArray(d.lessons), 'Data model not initialized');
assert.equal(d.courses.length, 7, 'The seven requested directions must be available');
assert(d.lessons.length >= 40, 'Unexpectedly low number of published chapters');
const ids = new Set();
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
assert(html.indexOf('src="./content.js"') < html.indexOf('src="./subjects/linux.js"'), 'Invalid script load order');
assert(html.indexOf('src="./subjects/cryptography.js"') < html.indexOf('src="./assets/app.js"'), 'App runs before lesson data');
const roadmapTopics = d.courses.reduce((n, c) => n + c.roadmap.reduce((k, g) => k + g.topics.length, 0), 0);
assert(roadmapTopics >= 300, 'Lost roadmap topics');
console.log('Atlas validated: %d courses, %d lessons, %d words, %d roadmap topics, %d sources.', d.courses.length, d.lessons.length, words, roadmapTopics, Object.keys(d.sources).length);
