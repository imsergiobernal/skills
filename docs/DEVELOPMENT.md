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
| `plugins/<plugin>/` | Archivos que componen un paquete instalable |
| `plugins/<plugin>/.claude-plugin/plugin.json` | Nombre, versión y metadatos del plugin |
| `plugins/<plugin>/skills/<skill>/SKILL.md` | Metadatos e instrucciones de una skill |
| `README.md` | Presentación y uso público del marketplace |
| `CONTRIBUTING.md` | Preparación y envío de contribuciones |
| `docs/DEVELOPMENT.md` | Desarrollo y comprobaciones locales |

El catálogo utiliza el formato Claude-compatible admitido por Codex. El identificador público del marketplace es `imsergiobernal-skills`.

## Preparación inicial

Clona el repositorio y crea una rama para el cambio. Si contribuyes desde un fork, utiliza su URL en el comando de clonación.

```shell
git clone https://github.com/imsergiobernal/skills.git
cd skills
git switch -c feat/nueva-skill
npm ci
```

La instalación activa el hook `commit-msg` mediante Husky. Commitlint comprueba el formato Conventional Commits, por ejemplo `fix(mi-plugin): corrige el saludo`. GitHub Actions comprueba también los mensajes de los commits de cada pull request y los enviados a `main`.

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

`check:versions` compara los archivos locales, incluidos los nuevos sin seguimiento, con `origin/main`. Para seleccionar otra base, usa `npm run check:versions -- --base <referencia>`. Revisa cada plugin afectado, su entrada de catálogo y una versión SemVer mayor que la de la base. Los plugins nuevos necesitan una versión válida. La versión se indica en `.claude-plugin/plugin.json` dentro del plugin; los metadatos opcionales de cada skill no afectan a esta comprobación.

Para un cambio compatible que corrige un fallo, incrementa `patch`; para una funcionalidad compatible, incrementa `minor`; para una modificación incompatible, incrementa `major`. Las versiones `0.x` corresponden al desarrollo inicial. El autor elige el incremento y explica su alcance en el pull request.

GitHub Actions ejecuta las comprobaciones en los pull requests y después de los pushes a `main`. Para impedir la integración cuando fallen, configura la comprobación como requerida en las reglas de la rama. Los commits directos a `main` se comprueban después del push.

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

Incrementa la versión en el manifiesto cuando modifiques el contenido del plugin. Para refrescar una instalación existente desde la copia local, ejecuta el comando de tu cliente con el perfil en el que esté instalado.

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
