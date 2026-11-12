import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import semver from 'semver';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const args = process.argv.slice(2);
if (args.length > 0 && (args.length !== 2 || args[0] !== '--base')) {
  console.error('Uso: npm run check:versions -- [--base <referencia>]');
  process.exit(1);
}
const base = args[1] ?? 'origin/main';

function git(args, options = {}) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', ...options });
}

function readJson(file, contents) {
  try {
    return JSON.parse(contents);
  } catch (error) {
    throw new Error(`${file}: JSON inválido (${error.message})`);
  }
}

function validVersion(value) {
  return typeof value === 'string' && value === value.trim() && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/.test(value) && semver.valid(value) !== null;
}

try {
  git(['rev-parse', '--verify', `${base}^{tree}`], { stdio: 'pipe' });
  const changed = git(['diff', '--name-only', '-z', '--no-renames', base, '--', 'plugins/']);
  const untracked = git(['ls-files', '--others', '--exclude-standard', '-z', '--', 'plugins/']);
  const names = new Set();
  for (const file of `${changed}${untracked}`.split('\0').filter(Boolean)) {
    const parts = file.split('/');
    if (parts.length >= 3) names.add(parts[1]);
  }

  const catalogPath = '.claude-plugin/marketplace.json';
  const catalog = readJson(catalogPath, readFileSync(path.join(root, catalogPath), 'utf8'));
  if (!Array.isArray(catalog.plugins)) throw new Error(`${catalogPath}: falta el array plugins`);
  for (const entry of catalog.plugins) {
    if (typeof entry.source !== 'string' || (!entry.source.startsWith('./') && entry.source !== '.')) continue;
    const target = path.resolve(root, entry.source);
    const relative = path.relative(root, target);
    const parts = relative.split(path.sep);
    if (parts[0] === 'plugins') {
      if (parts.length !== 2 || entry.source !== `./plugins/${parts[1]}`) {
        throw new Error(`${entry.name}: usa la ruta canónica ./plugins/<nombre> en el catálogo`);
      }
      if ('version' in entry) {
        throw new Error(`${entry.name}: elimina la versión del catálogo; se usa la del manifiesto del plugin`);
      }
    }
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error(`${entry.name}: la ruta del catálogo sale del repositorio`);
    }
    if (!existsSync(target) || !statSync(target).isDirectory()) {
      throw new Error(`${entry.name}: no existe la carpeta ${entry.source}`);
    }
    const manifestPath = path.join(target, '.claude-plugin', 'plugin.json');
    if (existsSync(manifestPath)) {
      const manifest = readJson(manifestPath, readFileSync(manifestPath, 'utf8'));
      if (manifest.name !== entry.name) throw new Error(`${entry.name}: el nombre del manifiesto no coincide con el catálogo`);
    }
  }

  for (const name of [...names].sort()) {
    const pluginDir = `plugins/${name}`;
    const manifestPath = `${pluginDir}/.claude-plugin/plugin.json`;
    const catalogEntry = catalog.plugins.find(entry => entry.name === name && typeof entry.source === 'string' && path.resolve(root, entry.source) === path.join(root, pluginDir));
    const remainingFiles = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', `${pluginDir}/`])
      .split('\0').filter(file => file && existsSync(path.join(root, file)));
    if (remainingFiles.length === 0) {
      if (catalogEntry) throw new Error(`${name}: el plugin eliminado todavía figura en el catálogo`);
      console.log(`${name}: plugin eliminado`);
      continue;
    }
    if (!catalogEntry) throw new Error(`${name}: falta la entrada del plugin en el catálogo`);
    if (!existsSync(path.join(root, manifestPath))) throw new Error(`${name}: falta ${manifestPath}`);
    const manifest = readJson(manifestPath, readFileSync(path.join(root, manifestPath), 'utf8'));
    if (manifest.name !== name) throw new Error(`${name}: el nombre del manifiesto debe coincidir con la carpeta`);
    if (!validVersion(manifest.version)) throw new Error(`${name}: versión SemVer inválida: ${manifest.version}`);

    const previous = spawnSync('git', ['show', `${base}:${manifestPath}`], { cwd: root, encoding: 'utf8' });
    if (previous.error) throw previous.error;
    if (previous.status !== 0) {
      console.log(`${name}: plugin nuevo (${manifest.version})`);
      continue;
    }
    const oldVersion = readJson(`${base}:${manifestPath}`, previous.stdout).version;
    if (!validVersion(oldVersion)) throw new Error(`${name}: la versión base no es SemVer válida: ${oldVersion}`);
    if (semver.lt(manifest.version, oldVersion)) {
      throw new Error(`${name}: la versión no puede retroceder (${oldVersion} → ${manifest.version})`);
    }
    console.log(`${name}: ${oldVersion} → ${manifest.version}`);
  }
  if (names.size === 0) console.log('No hay cambios en plugins.');
} catch (error) {
  console.error(`Error de validación: ${error.message}`);
  process.exitCode = 1;
}
