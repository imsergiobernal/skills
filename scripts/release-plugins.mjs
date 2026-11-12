import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { GitHub, Manifest } from 'release-please';
import versionModule from 'release-please/build/src/version.js';
import semver from 'semver';

const { Version } = versionModule;
const sections = [
  ['feat', 'Novedades'], ['fix', 'Correcciones'], ['perf', 'Rendimiento'],
  ['refactor', 'Refactorización'], ['docs', 'Documentación'],
  ['build', 'Compilación'], ['ci', 'Integración continua'],
  ['chore', 'Mantenimiento'], ['style', 'Estilo'], ['test', 'Pruebas'],
  ['revert', 'Reversiones'],
].map(([type, section]) => ({ type, section }));

function readJson(root, file) {
  return JSON.parse(readFileSync(path.join(root, file), 'utf8'));
}

export function configuration(root) {
  const catalog = readJson(root, '.claude-plugin/marketplace.json');
  const ledger = readJson(root, '.release-please-manifest.json');
  const packages = {};
  const versions = {};
  for (const entry of catalog.plugins) {
    if (typeof entry.source !== 'string' || !entry.source.startsWith('./')) continue;
    const relative = path.relative(root, path.resolve(root, entry.source));
    const parts = relative.split(path.sep);
    if (parts[0] !== 'plugins') continue;
    if (parts.length !== 2 || entry.source !== `./plugins/${parts[1]}`) {
      throw new Error(`${entry.name}: usa la ruta canónica ./plugins/<nombre> en el catálogo`);
    }
    const pluginPath = `plugins/${parts[1]}`;
    const manifest = readJson(root, `${pluginPath}/.claude-plugin/plugin.json`);
    if (manifest.name !== entry.name || entry.name !== pluginPath.slice('plugins/'.length)) {
      throw new Error(`Nombre o ruta inconsistentes para ${entry.name}`);
    }
    if ('version' in entry) {
      throw new Error(`${entry.name}: elimina la versión del catálogo; se usa la del manifiesto del plugin`);
    }
    const version = ledger[pluginPath] ?? manifest.version;
    if (typeof version !== 'string' || version !== version.trim() ||
        !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/.test(version) ||
        !semver.valid(version)) {
      throw new Error(`${entry.name}: versión inválida: ${version}`);
    }
    packages[pluginPath] = {
      releaseType: 'simple',
      component: entry.name,
      includeComponentInTag: true,
      changelogSections: sections,
      extraFiles: [{ type: 'json', path: '.claude-plugin/plugin.json', jsonpath: '$.version' }],
    };
    versions[pluginPath] = Version.parse(version);
  }
  return { packages, versions };
}

export async function run(root = process.cwd(), env = process.env) {
  const { packages, versions } = configuration(root);
  if (Object.keys(packages).length === 0) {
    console.log('No hay plugins locales que publicar.');
    return;
  }
  const [owner, repo, ...extra] = (env.GITHUB_REPOSITORY ?? '').split('/');
  if (!owner || !repo || extra.length || !env.GITHUB_TOKEN) {
    throw new Error('Se necesitan GITHUB_REPOSITORY y GITHUB_TOKEN para gestionar releases.');
  }
  const github = await GitHub.create({
    owner, repo, token: env.GITHUB_TOKEN, defaultBranch: 'main',
    apiUrl: env.GITHUB_API_URL,
    graphqlUrl: env.GITHUB_GRAPHQL_URL?.replace(/\/graphql$/, ''),
  });
  const manifest = new Manifest(github, 'main', packages, versions, {
    separatePullRequests: false,
  });
  await manifest.createReleases();
  await manifest.createPullRequests();
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  run().catch(error => {
    console.error(`Error de publicación: ${error.message}`);
    process.exitCode = 1;
  });
}
