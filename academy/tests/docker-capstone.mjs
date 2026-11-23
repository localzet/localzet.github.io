import assert from 'node:assert/strict';
import {chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const script = join(repo, 'academy/projects/docker/capstone.sh');
const lessonSource = readFileSync(join(repo, 'academy/subjects/docker-teaching.js'), 'utf8');
const teachingSource = readFileSync(join(repo, 'academy/assets/teaching-docker.js'), 'utf8');
const lessonIds = [
  'docker-origin',
  'docker-isolation',
  'docker-images',
  'docker-runtime',
  'docker-networking',
  'docker-volumes',
  'dockerfile-complete',
  'docker-compose',
  'docker-health',
  'docker-diagnostics',
  'docker-command-atlas'
];

const window = {
  ATLAS_DATA: {lessons: lessonIds.map(id => ({id, body: ''}))},
  ATLAS_LEVELS: {junior: {}, advanced: {}},
  ATLAS_EDITORIAL: Object.fromEntries(lessonIds.map(id => [id, {}])),
  ATLAS_GUIDED_IDS: [],
  ATLAS_TEACHING: {keys: [], render() { return ''; }, mount() {}}
};
new vm.Script(lessonSource).runInNewContext({window});
new vm.Script(teachingSource).runInNewContext({window});

const lesson = window.ATLAS_DATA.lessons.find(item => item.id === 'docker-command-atlas');
const interactiveKeys = ['docker-rollback-flow', 'docker-rollback-choice', 'docker-rollback-check'];
for (const key of interactiveKeys) {
  assert.match(lesson.body, new RegExp(`^:::learn ${key}$`, 'm'));
  assert(window.ATLAS_TEACHING.render(key).includes(`data-teach="${key}"`));
}
assert.equal(window.ATLAS_TEACHING.dockerQuestions['docker-rollback-choice'].correct, 1);

const capstone = readFileSync(script, 'utf8');
assert.match(capstone, /DOCKER_HOST/);
assert.match(capstone, /DOCKER_CONTEXT/);
assert.match(capstone, /--read-only/);
assert.match(capstone, /--cap-drop ALL/);
assert.match(capstone, /no-new-privileges:true/);
assert.match(capstone, /127\.0\.0\.1/);
assert.doesNotMatch(capstone, /\bprune\b|compose\s+down\s+-v/);
assert.match(capstone, /docker_host\(\)\s*\{\s*command docker --host "\$endpoint"/);
assert.doesNotMatch(capstone, /^\s*docker\s+(?!context\b)/m);
assert.equal((capstone.match(/if resources="\$\(docker_host (?:ps|network ls|image ls)[^\n]*\)"; then/g) ?? []).length, 3);
assert.equal((capstone.match(/else\n\s+cleanup_failed=1\n\s+fi/g) ?? []).length, 3);

const temp = mkdtempSync(join(tmpdir(), 'atlas-docker-capstone-test-'));
try {
  const mockDir = join(temp, 'bin');
  const mockLog = join(temp, 'docker.log');
  const mockDocker = join(mockDir, 'docker');
  mkdirSync(mockDir);
  writeFileSync(mockDocker, `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "${mockLog}"
case "${'${1:-}'} ${'${2:-}'}" in
  "context show") printf 'default\\n' ;;
  "context inspect") printf '%s\\n' "${'${ATLAS_MOCK_ENDPOINT:?}'}" ;;
  *) exit 97 ;;
esac
`);
  chmodSync(mockDocker, 0o755);
  writeFileSync(mockLog, '');

  const baseEnv = {...process.env, PATH: `${mockDir}:${process.env.PATH ?? ''}`};
  delete baseEnv.DOCKER_HOST;
  delete baseEnv.DOCKER_CONTEXT;
  delete baseEnv.ATLAS_DOCKER_PROJECT;

  const runPreflight = extra => spawnSync('bash', [script], {
    cwd: repo,
    encoding: 'utf8',
    env: {...baseEnv, ATLAS_MOCK_DOCKER_LOG: mockLog, ...extra}
  });

  let result = runPreflight({});
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ATLAS_DOCKER_PROJECT=1/);
  assert.equal(readFileSync(mockLog, 'utf8').trim(), '');

  result = runPreflight({ATLAS_DOCKER_PROJECT: '1', DOCKER_HOST: 'tcp://example.invalid:2376'});
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /DOCKER_HOST/);
  assert.equal(readFileSync(mockLog, 'utf8').trim(), '');

  result = runPreflight({ATLAS_DOCKER_PROJECT: '1', DOCKER_CONTEXT: 'remote'});
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /DOCKER_CONTEXT/);
  assert.equal(readFileSync(mockLog, 'utf8').trim(), '');

  writeFileSync(mockLog, '');
  result = runPreflight({
    ATLAS_DOCKER_PROJECT: '1',
    ATLAS_MOCK_ENDPOINT: 'tcp://127.0.0.1:2376'
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /локальный Unix socket/);
  assert.equal(readFileSync(mockLog, 'utf8').trim().split('\n').length, 2);

  writeFileSync(mockLog, '');
  result = runPreflight({
    ATLAS_DOCKER_PROJECT: '1',
    ATLAS_MOCK_ENDPOINT: 'unix:///tmp/atlas-docker-capstone-missing.sock'
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /недоступен локально/);
  assert.equal(readFileSync(mockLog, 'utf8').trim().split('\n').length, 2);
} finally {
  rmSync(temp, {recursive: true, force: true});
}

if (process.env.ATLAS_DOCKER_VM === '1') {
  const result = spawnSync('bash', [script], {
    cwd: repo,
    encoding: 'utf8',
    timeout: 180000,
    env: {...process.env, ATLAS_DOCKER_PROJECT: '1'}
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Исходный релиз: healthy, stable-v1/);
  assert.match(result.stdout, /Кандидат отклонён: unhealthy, HTTP 503, candidate-v2/);
  assert.match(result.stdout, /Откат подтверждён: прежний image ID восстановлен/);

  const labId = result.stdout.match(/^Лаборатория: ([a-z0-9-]+)$/m)?.[1];
  assert(labId, 'capstone must report the exact lab label used for cleanup');
  const checks = [
    ['ps', '-aq', '--filter', `label=com.localzet.atlas.lab=${labId}`],
    ['network', 'ls', '-q', '--filter', `label=com.localzet.atlas.lab=${labId}`],
    ['image', 'ls', '-q', '--no-trunc', '--filter', `label=com.localzet.atlas.lab=${labId}`]
  ];
  for (const args of checks) {
    const cleanup = spawnSync('docker', args, {cwd: repo, encoding: 'utf8'});
    assert.equal(cleanup.status, 0, cleanup.stderr);
    assert.equal(cleanup.stdout.trim(), '', `resources remain for ${labId}: ${args.join(' ')}`);
  }
  console.log(result.stdout.trim());
  console.log('PASS: Docker rollback project ran locally and removed its labeled resources');
} else {
  console.log('SKIP: real Engine scenario requires ATLAS_DOCKER_VM=1');
}

console.log('PASS: Docker project guards, course blocks and rollback contract');
