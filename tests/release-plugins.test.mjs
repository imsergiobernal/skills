import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { Manifest } from 'release-please';
import { configuration } from '../scripts/release-plugins.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'release-plugins-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  function write(file, data) {
    const target = path.join(root, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`);
  }
  write('.release-please-manifest.json', {});
  write('.claude-plugin/marketplace.json', { plugins: [
    { name: 'alpha', source: './plugins/alpha' },
    { name: 'beta', source: './plugins/beta' },
  ] });
  write('plugins/alpha/.claude-plugin/plugin.json', { name: 'alpha', version: '1.2.3' });
  write('plugins/beta/.claude-plugin/plugin.json', { name: 'beta', version: '0.4.0' });
  return { root, write };
}

function fakeScm(commits) {
  return {
    repository: { owner: 'owner', repo: 'repo', defaultBranch: 'main' },
    async *releaseIterator() {},
    async *tagIterator() {},
    async *mergeCommitIterator() { yield* commits; },
  };
}

test('calcula versiones independientes por archivos usando Release Please', async t => {
  const f = fixture(t);
  const { packages, versions } = configuration(f.root);
  const commits = [
    { sha: 'aaa', message: 'feat(alpha): nueva skill', files: ['plugins/alpha/skills/a/SKILL.md'] },
    { sha: 'bbb', message: 'fix(beta): corregir skill', files: ['plugins/beta/skills/b/SKILL.md'] },
    { sha: 'ccc', message: 'feat(src): material', files: ['src/reference.md'] },
  ];
  const manifest = new Manifest(fakeScm(commits), 'main', packages, versions, { separatePullRequests: false });
  const prs = await manifest.buildPullRequests();
  assert.equal(prs.length, 1);
  const updates = prs[0].updates;
  const alpha = updates.find(update => update.path === 'plugins/alpha/.claude-plugin/plugin.json');
  const beta = updates.find(update => update.path === 'plugins/beta/.claude-plugin/plugin.json');
  assert.ok(alpha);
  assert.ok(beta);
  assert.equal(JSON.parse(alpha.updater.updateContent('{"name":"alpha","version":"1.2.3"}')).version, '1.3.0');
  assert.equal(JSON.parse(beta.updater.updateContent('{"name":"beta","version":"0.4.0"}')).version, '0.4.1');
  const ledger = updates.find(update => update.path === '.release-please-manifest.json');
  assert.ok(ledger);
  assert.deepEqual(JSON.parse(ledger.updater.updateContent('{}')), {
    'plugins/alpha': '1.3.0', 'plugins/beta': '0.4.1',
  });
});

test('aplica major a cambios incompatibles y patch a documentación del plugin', async t => {
  const f = fixture(t);
  const { packages, versions } = configuration(f.root);
  const commits = [
    { sha: 'aaa', message: 'feat(alpha)!: cambia la interfaz', files: ['plugins/alpha/skills/a/SKILL.md'] },
    { sha: 'bbb', message: 'docs(beta): aclara el uso', files: ['plugins/beta/README.md'] },
  ];
  const prs = await new Manifest(fakeScm(commits), 'main', packages, versions, {
    separatePullRequests: false,
  }).buildPullRequests();
  const updates = prs[0].updates;
  const alpha = updates.find(update => update.path === 'plugins/alpha/.claude-plugin/plugin.json');
  const beta = updates.find(update => update.path === 'plugins/beta/.claude-plugin/plugin.json');
  assert.equal(JSON.parse(alpha.updater.updateContent('{"version":"1.2.3"}')).version, '2.0.0');
  assert.equal(JSON.parse(beta.updater.updateContent('{"version":"0.4.0"}')).version, '0.4.1');
});

test('no propone una release para cambios exclusivos de src', async t => {
  const f = fixture(t);
  const { packages, versions } = configuration(f.root);
  const commits = [{ sha: 'aaa', message: 'feat(src): material', files: ['src/reference.md'] }];
  const prs = await new Manifest(fakeScm(commits), 'main', packages, versions).buildPullRequests();
  assert.equal(prs.length, 0);
});

test('prepara tags de cada plugin al integrar el pull request de release', async t => {
  const f = fixture(t);
  const { packages, versions } = configuration(f.root);
  const scm = fakeScm([
    { sha: 'aaa', message: 'feat(alpha): nueva skill', files: ['plugins/alpha/skills/a/SKILL.md'] },
    { sha: 'bbb', message: 'fix(beta): corregir skill', files: ['plugins/beta/skills/b/SKILL.md'] },
  ]);
  const manifest = new Manifest(scm, 'main', packages, versions, { separatePullRequests: false });
  const [candidate] = await manifest.buildPullRequests();
  scm.pullRequestIterator = async function* () {
    yield {
      number: 42, title: candidate.title.toString(), body: candidate.body.toString(),
      labels: candidate.labels, headBranchName: candidate.headRefName,
      baseBranchName: 'main', sha: 'merged-sha', files: [],
    };
  };
  const releases = await manifest.buildReleases();
  assert.deepEqual(releases.map(release => release.tag.toString()).sort(), [
    'alpha-v1.3.0', 'beta-v0.4.1',
  ]);
});

test('usa la versión publicada como base y evita versiones duplicadas en el catálogo', t => {
  const f = fixture(t);
  f.write('.release-please-manifest.json', { 'plugins/alpha': '1.1.0' });
  assert.equal(configuration(f.root).versions['plugins/alpha'].toString(), '1.1.0');
  f.write('.claude-plugin/marketplace.json', { plugins: [
    { name: 'alpha', source: './plugins/alpha', version: '1.2.3' },
  ] });
  assert.throws(() => configuration(f.root), /elimina la versión del catálogo/);
  f.write('.claude-plugin/marketplace.json', { plugins: [
    { name: 'alpha', source: './plugins/alpha/' },
  ] });
  assert.throws(() => configuration(f.root), /ruta canónica/);
});
