# Desarrollo del marketplace

Sigue esta guía para preparar una copia local, crear un plugin y validar su instalación en Codex y Claude Code. Ejecuta los comandos desde la raíz del repositorio, salvo que se indique otra ubicación. Los ejemplos de perfiles temporales usan PowerShell.

## Requisitos

- Instala Git para clonar el repositorio y revisar los cambios.
- Instala Node.js 22.12 o posterior y npm para ejecutar las comprobaciones del repositorio.
- Utiliza una versión de Codex o Claude Code que incluya los comandos `plugin` y `plugin marketplace`.
- Utiliza Claude Code para ejecutar `claude plugin validate`.
- Prepara las herramientas y dependencias adicionales que necesite el plugin que vayas a modificar.

Comprueba los clientes que vayas a utilizar y consulta la ayuda de sus comandos.

```shell
git --version
node --version
npm --version
codex --version
codex plugin --help
claude --version
claude plugin --help
```

## Estructura del repositorio

| Ubicación | Responsabilidad |
| --- | --- |
| `.claude-plugin/marketplace.json` | Identidad del marketplace y entradas de los plugins |
| `src/` | Documentación, ejemplos y otros materiales en bruto |
| `plugins/<plugin>/` | Archivos que componen un paquete instalable |
| `plugins/<plugin>/.claude-plugin/plugin.json` | Nombre, versión y metadatos del plugin |
| `plugins/<plugin>/skills/<skill>/SKILL.md` | Metadatos e instrucciones de una skill |
| `README.md` | Presentación y uso público del marketplace |
| `CONTRIBUTING.md` | Preparación y envío de contribuciones |
| `docs/DEVELOPMENT.md` | Desarrollo y comprobaciones locales |

El catálogo utiliza el formato Claude-compatible admitido por Codex. El identificador público del marketplace es `imsergiobernal-skills`.

Utiliza `src/` para reunir materiales de partida. Al preparar un paquete, incorpora dentro de `plugins/<plugin>/` los recursos que necesite para su instalación y uso.

## Preparación inicial

Clona el repositorio y crea una rama para el cambio. Si contribuyes desde un fork, utiliza su URL en el comando de clonación.

```shell
git clone https://github.com/imsergiobernal/skills.git
cd skills
git switch -c feat/nueva-skill
npm ci
```

La instalación activa el hook `commit-msg` mediante Husky. Commitlint comprueba el formato Conventional Commits, por ejemplo `fix(mi-plugin): corrige el saludo`. GitHub Actions comprueba también los mensajes de los commits de cada pull request y los enviados a `main`.

El scope es opcional. Cuando se utiliza, sigue el formato `kebab-case`, con minúsculas y guiones. Por ejemplo, usa `docs(src): añade documentación` para material de partida y `feat(mi-plugin): añade una skill` para un plugin. Si incluyes varios ámbitos separados por `/` o `,`, commitlint comprueba el formato de cada uno.

Consulta el estado de la copia local y el catálogo antes de modificarlo.

```shell
git status --short --branch
claude plugin validate .
```

El catálogo inicial contiene `plugins: []`. Claude Code lo valida con la advertencia `Marketplace has no plugins defined`. Al incorporar el primer paquete, la validación comprueba su entrada.

La carpeta `work/` está incluida en `.gitignore` y sirve para guardar perfiles y resultados temporales de las pruebas.

## Crear un plugin

El siguiente ejemplo define `mi-plugin`, un paquete con la skill `saludar`. Adapta los nombres y las instrucciones al flujo de trabajo que quieras publicar.

```text
plugins/mi-plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── saludar/
        └── SKILL.md
```

### Define el manifiesto

Crea `plugins/mi-plugin/.claude-plugin/plugin.json`.

```json
{
  "name": "mi-plugin",
  "version": "0.1.0",
  "description": "Un saludo breve en español.",
  "author": {
    "name": "Sergio Bernal"
  },
  "license": "MIT"
}
```

Sustituye los datos de autoría por los del autor del paquete. Usa el campo `version` para identificar las actualizaciones del contenido.

### Escribe la skill

Crea `plugins/mi-plugin/skills/saludar/SKILL.md`.

```markdown
---
name: saludar
description: Redacta un saludo breve en español cuando el usuario solicita un saludo.
---

Escribe un saludo breve en español, adaptado al contexto que haya dado el usuario.
```

Describe en la cabecera qué hace la skill y cuándo utilizarla. Explica el procedimiento en el cuerpo y añade los scripts, referencias o assets que necesite dentro de su carpeta.

Mantén los recursos del plugin dentro de `plugins/mi-plugin/` para que formen parte de la instalación. Documenta los requisitos y la compatibilidad de los componentes MCP o hooks que añadas.

### Registra el paquete

Añade este objeto al array `plugins` del catálogo raíz `.claude-plugin/marketplace.json`.

```json
{
  "name": "mi-plugin",
  "source": "./plugins/mi-plugin",
  "description": "Un saludo breve en español."
}
```

Conserva la identidad del marketplace y las entradas existentes. El `name` de la entrada coincide con el del manifiesto. La ruta `source` comienza en la raíz del repositorio y utiliza barras `/`.

## Validar los archivos

Comprueba el plugin y el catálogo después de crear o modificar un paquete.

```shell
git fetch origin main
npm run check:versions
npm test
claude plugin validate ./plugins/mi-plugin
claude plugin validate .
git diff --check
```

La validación del manifiesto comprueba su formato y los campos declarados. Completa la revisión verificando las rutas, los recursos incluidos y el comportamiento de los scripts o integraciones que utilice el paquete.

`check:versions` compara los archivos locales, incluidos los nuevos sin seguimiento, con `origin/main`. Para seleccionar otra base, usa `npm run check:versions -- --base <referencia>`. Revisa cada plugin afectado, su entrada de catálogo y una versión SemVer que no retroceda respecto a la base. Los plugins nuevos necesitan una versión válida. La versión se indica en `.claude-plugin/plugin.json` dentro del plugin; los metadatos opcionales de cada skill no afectan a esta comprobación.

Los cambios exclusivos en `src/` quedan fuera de la comprobación y del versionado de plugins. Cuando el material se incorpora a un plugin, el commit que modifica ese paquete determina el incremento.

GitHub Actions ejecuta las comprobaciones en los pull requests y después de los pushes a `main`. Para impedir la integración cuando fallen, configura la comprobación como requerida en las reglas de la rama. Los commits directos a `main` se comprueban después del push.

## Versiones y releases

Cada plugin tiene su propia versión en `plugins/<plugin>/.claude-plugin/plugin.json`. Las skills incluidas se publican con la versión de su plugin; no se versionan de forma independiente. Para un plugin nuevo, asigna una versión inicial SemVer, por ejemplo `0.1.0`. No incluyas `version` en su entrada del catálogo: los clientes deben leer la versión del manifiesto del plugin.

Al integrar cambios en `main`, GitHub Actions ejecuta [Release Please](https://github.com/googleapis/release-please). La herramienta identifica los plugins afectados por las rutas modificadas y prepara un pull request conjunto con las nuevas versiones, un `CHANGELOG.md` por plugin y el registro `.release-please-manifest.json`. El nombre del scope es orientativo; lo que determina los plugins afectados son los archivos del commit. Si un commit afecta a varios plugins, su tipo se aplica a todos ellos.

| Commit que modifica un plugin | Incremento |
| --- | --- |
| `fix(plugin): ...` | Patch: `1.2.3` → `1.2.4` |
| `feat(plugin): ...` | Minor: `1.2.3` → `1.3.0` |
| `feat(plugin)!: ...` o cuerpo con `BREAKING CHANGE:` | Major: `1.2.3` → `2.0.0` |
| Otros tipos convencionales admitidos, como `docs`, `refactor` o `chore` | Patch |

Se aplica el incremento más alto de los commits pendientes. También se aplica major a los cambios incompatibles en `0.x`. La primera propuesta usa la versión inicial del manifiesto como base y aplica el incremento del commit que incorpora el plugin; por ejemplo, un `feat` sobre `0.1.0` propone `0.2.0`.

1. Abre un pull request con commits convencionales y revisa el tipo y la compatibilidad de cada cambio. Si utilizas squash, el mensaje resultante también debe seguir Conventional Commits e incluir `!` o `BREAKING CHANGE:` cuando corresponda. Un squash que agrupe varios plugins aplicará el mismo tipo a todos los afectados.
2. Integra el pull request en `main`. Release Please abre o actualiza el pull request de release. El contenido del plugin ya está en `main` mientras la versión anterior sigue vigente, hasta que se integre el pull request de release.
3. Revisa las versiones y los changelogs. Aprueba la ejecución de las comprobaciones si GitHub lo solicita y, cuando estén correctas, integra el pull request de release.
4. Actions crea un tag y una GitHub Release por plugin, por ejemplo `mi-plugin-v1.3.0`. Los usuarios pueden actualizar el marketplace para obtener los cambios de `main`.

El repositorio debe tener activada en **Settings → Actions → General → Workflow permissions** la opción **Allow GitHub Actions to create and approve pull requests**. Si el pull request lo crea `GITHUB_TOKEN`, GitHub puede dejar sus comprobaciones pendientes de aprobación; consulta [la documentación de GitHub](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow). La automatización necesita permisos de escritura sobre contenidos, pull requests e issues para crear releases y gestionar etiquetas.

## Probar la instalación local

Los ejemplos siguientes registran la copia local con perfiles guardados en `work/`, instalan el plugin de ejemplo, consultan su estado y retiran la instalación de prueba. Cada bloque restaura la variable de configuración al terminar.

### Codex

```powershell
$repositoryPath = (Get-Location).Path
$testProfilePath = Join-Path $repositoryPath 'work/codex'
$previousCodexConfigPath = $env:CODEX_HOME

try {
    New-Item -ItemType Directory -Path $testProfilePath -Force | Out-Null
    $env:CODEX_HOME = $testProfilePath
    codex plugin marketplace add $repositoryPath
    codex plugin add mi-plugin@imsergiobernal-skills
    codex plugin list --marketplace imsergiobernal-skills --json
    codex plugin remove mi-plugin@imsergiobernal-skills
    codex plugin marketplace remove imsergiobernal-skills
} finally {
    $env:CODEX_HOME = $previousCodexConfigPath
}
```

Comprueba que el resultado de `plugin list` incluye el plugin instalado y habilitado. Para una prueba interactiva, ejecuta `codex` dentro del bloque antes de retirar el plugin.

### Claude Code

```powershell
$repositoryPath = (Get-Location).Path
$testProfilePath = Join-Path $repositoryPath 'work/claude'
$previousClaudeConfigPath = $env:CLAUDE_CONFIG_DIR

try {
    New-Item -ItemType Directory -Path $testProfilePath -Force | Out-Null
    $env:CLAUDE_CONFIG_DIR = $testProfilePath
    claude plugin marketplace add $repositoryPath
    claude plugin install mi-plugin@imsergiobernal-skills
    claude plugin list --json
    claude plugin details mi-plugin
    claude plugin uninstall mi-plugin@imsergiobernal-skills
    claude plugin marketplace remove imsergiobernal-skills
} finally {
    $env:CLAUDE_CONFIG_DIR = $previousClaudeConfigPath
}
```

Comprueba que el inventario de componentes de `plugin details` incluye la skill `saludar`. Para una prueba interactiva, ejecuta `claude` dentro del bloque antes de desinstalar el plugin.

### Comprueba el flujo de trabajo

Prueba también las instrucciones con el plugin cargado en una sesión del cliente compatible. En Claude Code, la skill del ejemplo se invoca con `/mi-plugin:saludar`. En Codex puedes seleccionarla entre las skills del plugin instalado.

Verifica el resultado esperado, el acceso a los recursos del paquete y los errores que pueda producir la falta de una herramienta o dependencia. Si corriges un fallo, repite los pasos que lo reproducían y comprueba el resultado después del cambio.

## Probar una actualización

Para probar una actualización de forma local antes del release, utiliza un perfil de pruebas y, si el cliente necesita detectar una versión distinta, incrementa temporalmente la versión del manifiesto en esa copia. La versión definitiva la prepara el pull request de release. Ejecuta el comando de tu cliente con el perfil en el que esté instalado.

```shell
codex plugin add mi-plugin@imsergiobernal-skills
```

```shell
claude plugin update mi-plugin@imsergiobernal-skills
claude plugin details mi-plugin
```

Comprueba la versión instalada y los archivos que haya cambiado la actualización. Para actualizar el origen Git publicado, utiliza los comandos de actualización del marketplace descritos en el README. [Actualizaciones públicas](../README.md#actualizaciones)

## Preparar la contribución

Revisa el diff, selecciona los archivos del paquete y su entrada de catálogo, y documenta las comprobaciones realizadas. La guía de contribución explica qué información incluir en el pull request. [Preparar la propuesta de cambios](../CONTRIBUTING.md#prepara-la-propuesta-de-cambios)

## Referencias

- [Empaquetar plugins para Codex](https://developers.openai.com/plugins/build/plugins)
- [Crear un marketplace para Claude Code](https://code.claude.com/docs/en/plugin-marketplaces)
- [Referencia del manifiesto de Claude Code](https://code.claude.com/docs/en/plugins/manifest-reference)
- [Comandos de plugins de Claude Code](https://code.claude.com/docs/en/plugins/cli-reference)
