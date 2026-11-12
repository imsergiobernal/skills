import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));
const cli = fileURLToPath(new URL('../node_modules/@commitlint/cli/cli.js', import.meta.url));

function lint(message) {
  return spawnSync(process.execPath, [cli], { cwd: root, input: `${message}\n`, encoding: 'utf8' });
}

test('acepta scopes en kebab-case y commits sin scope', () => {
  for (const message of ['docs(src): añade documentación', 'fix(mi-plugin): corrige el saludo', 'fix(mi-plugin/otro-plugin): corrige las skills', 'chore: actualiza dependencias']) {
    const result = lint(message);
    assert.equal(result.status, 0, `${message}\n${result.stdout}\n${result.stderr}`);
  }
});

test('rechaza scopes que incumplen kebab-case', () => {
  for (const message of ['docs(LO-QUE-SEA): actualiza la guía', 'fix(mi_plugin): corrige el saludo']) {
    const result = lint(message);
    assert.equal(result.status, 1, message);
    assert.match(result.stdout, /scope-case/);
  }
});
