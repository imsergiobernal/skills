# Contribuir al marketplace

Esta guía explica cómo proponer mejoras, añadir skills y publicar plugins en el marketplace `imsergiobernal-skills`, compatible con Codex y Claude Code.

## Antes de empezar

- Consulta el [README](README.md) para conocer el propósito del proyecto y el catálogo disponible.
- Sigue la [guía de desarrollo](docs/DEVELOPMENT.md) para preparar el entorno, crear un paquete y probar su instalación.
- Explica el problema que quieres resolver y el resultado esperado. Para cambios amplios, describe también su efecto sobre los paquetes existentes y sus usuarios.
- Mantén cada contribución centrada en un objetivo y selecciona los archivos relacionados con ese cambio.

Puedes utilizar las issues para comunicar fallos, sugerir nuevas skills o comentar una propuesta antes de desarrollarla. [Abrir una issue](https://github.com/imsergiobernal/skills/issues)

## Prepara el entorno

Instala Git, Node.js 22.12 o posterior, npm y el cliente en el que vayas a probar el paquete. Claude Code proporciona el comando `claude plugin validate` para comprobar los manifiestos. Ejecuta `npm ci` en la raíz para instalar las comprobaciones y activar el hook de mensajes de commit.

Clona tu fork o el repositorio y crea una rama para la contribución. La guía de desarrollo incluye los comandos de preparación y los ejemplos de perfiles temporales. [Preparación inicial](docs/DEVELOPMENT.md#preparación-inicial)

## Localiza el cambio

| Área | Ubicación | Qué modificar |
| --- | --- | --- |
| Catálogo | `.claude-plugin/marketplace.json` | Entradas que permiten descubrir e instalar los plugins |
| Paquetes | `plugins/` | Manifiestos, skills y recursos de cada plugin |
| Presentación pública | `README.md` | Propósito, catálogo y uso del marketplace |
| Documentación de desarrollo | `docs/DEVELOPMENT.md` | Preparación, ejemplos y comprobaciones locales |

Cada plugin ocupa una carpeta independiente. Sus scripts, referencias y assets forman parte del paquete que se instala.

## Implementa el cambio

- Usa nombres en minúsculas y con guiones para los nuevos plugins y skills. Mantén el mismo nombre en el manifiesto del plugin y en su entrada del catálogo.
- Explica en la descripción qué tarea resuelve el paquete y cuándo resulta apropiado utilizarlo.
- Escribe las instrucciones y la documentación propia en español. Conserva los identificadores y comandos técnicos con su nombre original.
- Incluye los recursos que necesita el paquete y documenta sus herramientas, dependencias y configuración.
- Indica los clientes compatibles y prueba los componentes que dependan de un cliente concreto, como integraciones MCP o hooks.
- Incrementa la versión del plugin cuando cambie su contenido y documenta los cambios que afecten a su uso.
- Conserva los avisos y las licencias de los recursos de terceros e indica su procedencia.

La guía de desarrollo contiene un ejemplo completo de manifiesto, skill y entrada de catálogo. [Crear un plugin](docs/DEVELOPMENT.md#crear-un-plugin)

## Valida el cambio

Ejecuta los comandos desde la raíz del repositorio. Sustituye `nombre-del-plugin` por el nombre del paquete afectado.

```shell
npm run check:versions
npm test
claude plugin validate ./plugins/nombre-del-plugin
claude plugin validate .
git diff --check
```

Comprueba que el plugin se instala, que sus skills se descubren y que el flujo de trabajo descrito funciona en los clientes declarados. Si modificas scripts, ejecútalos con entradas representativas y revisa sus resultados. Para una corrección, reproduce el fallo y verifica el comportamiento corregido.

La comprobación de versiones compara los archivos locales con `origin/main`. Actualiza la referencia con `git fetch origin main` antes de ejecutarla y usa `npm run check:versions -- --base <referencia>` si necesitas otra base. GitHub Actions ejecuta la comprobación con la rama de destino de cada pull request.

Puedes utilizar los perfiles temporales de la guía para comprobar la instalación. [Pruebas locales](docs/DEVELOPMENT.md#probar-la-instalación-local)

## Prepara la propuesta de cambios

1. Revisa `git status` y el diff. Selecciona expresamente los archivos de la contribución.
2. Agrupa los cambios en commits con formato Conventional Commits, por ejemplo `fix(mi-plugin): corrige el saludo` o `feat(mi-plugin): añade una skill`. Usa `!` o `BREAKING CHANGE:` para los cambios incompatibles.
3. Describe en el pull request el problema, el comportamiento resultante y los plugins o documentos afectados. Enlaza la issue relacionada si existe.
4. Indica los comandos de validación ejecutados y sus resultados. Explica las comprobaciones pendientes y el requisito que impidió realizarlas.
5. Incluye un ejemplo de uso y señala los cambios de configuración, dependencias o compatibilidad que deba conocer quien revise la propuesta.

Revisa el contenido que vas a compartir para excluir credenciales, archivos de configuración personal y resultados temporales de las pruebas.

Elige el incremento `major`, `minor` o `patch` según la compatibilidad del cambio y explícalo en la propuesta. La comprobación verifica el formato y que la versión avance, y la revisión valora el tipo de incremento.

## Comunica un fallo

Incluye el plugin y su versión, las versiones de los clientes, el sistema operativo, los pasos mínimos para reproducir el problema y los resultados esperado y observado. Adjunta los registros relevantes con las credenciales y los datos personales eliminados. [Crear un informe](https://github.com/imsergiobernal/skills/issues/new)

## Licencia

El contenido propio del repositorio se distribuye bajo la [licencia MIT](LICENSE). Indica las condiciones aplicables cuando una contribución incorpore recursos de terceros.
