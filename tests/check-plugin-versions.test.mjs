import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const script = fileURLToPath(new URL('../scripts/check-plugin-versions.mjs', import.meta.url));
const tempRoot = os.tmpdir();

function fixture(t) {
  const directory = mkdtempSync(path.join(tempRoot, 'skills-version-test-'));
  t.after(() => {
    const relative = path.relative(tempRoot, directory);
    assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative));
    rmSync(directory, { recursive: true, force: true });
  });
  const git = (...args) => execFileSync('git', args, { cwd: directory, stdio: 'pipe' });
  const write = (file, contents) => {
    const target = path.join(directory, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, contents);
  };
  const writeJson = (file, value) => write(file, `${JSON.stringify(value, null, 2)}\n`);
  const manifest = 'plugins/alpha/.claude-plugin/plugin.json';
  const catalog = '.claude-plugin/marketplace.json';
  git('init', '--initial-branch=main');
  git('config', 'user.name', 'Test');
  git('config', 'user.email', 'test@example.invalid');
  writeJson(manifest, { name: 'alpha', version: '1.2.3' });
  write('plugins/alpha/skills/example/SKILL.md', 'initial\n');
  writeJson(catalog, { name: 'test', owner: { name: 'Test' }, plugins: [{ name: 'alpha', source: './plugins/alpha' }] });
  git('add', '.');
  git('commit', '-m', 'chore: create fixture');
  const check = (base = 'HEAD') => spawnSync(process.execPath, [script, '--base', base], { cwd: directory, encoding: 'utf8' });
  return { directory, write, writeJson, manifest, catalog, git, check };
}

test('acepta cambios pendientes de release y un incremento de versión', t => {
  const f = fixture(t);
  f.write('plugins/alpha/skills/example/SKILL.md', 'changed\n');
  let result = f.check();
  assert.equal(result.status, 0, result.stderr);
  f.writeJson(f.manifest, { name: 'alpha', version: '1.2.4' });
  result = f.check();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /1\.2\.3 → 1\.2\.4/);
});

test('detecta recursos nuevos sin seguimiento', t => {
  const f = fixture(t);
  f.write('plugins/alpha/skills/example/references/new.md', 'new\n');
  const result = f.check();
  assert.equal(result.status, 0, result.stderr);
});

test('permite añadir material en bruto sin incrementar versiones', t => {
  const f = fixture(t);
  f.write('src/references/example.md', 'material en bruto\n');
  const result = f.check();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /No hay cambios en plugins/);
});

test('rechaza versiones inválidas y retrocesos', t => {
  const f = fixture(t);
  for (const version of ['v1.2.4', '1.2', '1.2.2', '1.2.4\n']) {
    f.writeJson(f.manifest, { name: 'alpha', version });
    const result = f.check();
    assert.equal(result.status, 1, version);
  }
});

test('acepta nuevos plugins con una versión válida', t => {
  const f = fixture(t);
  f.writeJson('plugins/beta/.claude-plugin/plugin.json', { name: 'beta', version: '0.1.0' });
  f.writeJson(f.catalog, { name: 'test', owner: { name: 'Test' }, plugins: [
    { name: 'alpha', source: './plugins/alpha' },
    { name: 'beta', source: './plugins/beta' },
  ] });
  const result = f.check();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /beta: plugin nuevo/);
});

test('comprueba rutas y nombres del catálogo', t => {
  const f = fixture(t);
  f.writeJson(f.catalog, { name: 'test', plugins: [{ name: 'missing', source: './plugins/missing' }] });
  let result = f.check();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no existe la carpeta/);
  f.writeJson(f.catalog, { name: 'test', plugins: [{ name: 'incorrecto', source: './plugins/alpha' }] });
  result = f.check();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no coincide con el catálogo/);
});

test('detecta un plugin nuevo sin entrada en el catálogo', t => {
  const f = fixture(t);
  f.writeJson('plugins/beta/.claude-plugin/plugin.json', { name: 'beta', version: '0.1.0' });
  const result = f.check();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /falta la entrada del plugin/);
});

test('detecta retrocesos en cada plugin afectado', t => {
  const f = fixture(t);
  f.writeJson('plugins/beta/.claude-plugin/plugin.json', { name: 'beta', version: '1.0.0' });
  f.write('plugins/beta/skills/example/SKILL.md', 'initial\n');
  f.writeJson(f.catalog, { name: 'test', plugins: [
    { name: 'alpha', source: './plugins/alpha' },
    { name: 'beta', source: './plugins/beta' },
  ] });
  f.git('add', '.');
  f.git('commit', '-m', 'feat: add second plugin');
  f.write('plugins/alpha/skills/example/SKILL.md', 'changed\n');
  f.writeJson(f.manifest, { name: 'alpha', version: '1.2.4' });
  f.write('plugins/beta/skills/example/SKILL.md', 'changed\n');
  f.writeJson('plugins/beta/.claude-plugin/plugin.json', { name: 'beta', version: '0.9.0' });
  const result = f.check();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /beta: la versión no puede retroceder/);
});

test('permite eliminar un plugin si se retira su entrada', t => {
  const f = fixture(t);
  f.git('rm', '-r', 'plugins/alpha');
  f.writeJson(f.catalog, { name: 'test', plugins: [] });
  const result = f.check();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /plugin eliminado/);
});

test('rechaza una referencia base inexistente', t => {
  const f = fixture(t);
  assert.equal(f.check('missing-base').status, 1);
});
