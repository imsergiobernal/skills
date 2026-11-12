# Skills y plugins

[![Licencia MIT](https://img.shields.io/github/license/imsergiobernal/skills?style=for-the-badge)](LICENSE)

Marketplace abierto de skills y plugins para ampliar los flujos de trabajo de **Codex** y **Claude Code**.

Una skill reúne instrucciones y recursos para realizar una tarea de forma reutilizable. Un plugin empaqueta una o varias skills y puede incorporar herramientas, scripts e integraciones. Este repositorio ofrece un catálogo común desde el que descubrir e instalar esos paquetes.

[Catálogo](#catálogo) · [Instalación](#instalación) · [Actualizaciones](#actualizaciones) · [Contribuir](#contribuir)

## Catálogo

El proyecto está en su fase inicial y el catálogo público todavía está vacío. Los primeros paquetes se incorporarán al directorio `plugins/`.

[Consultar el catálogo](.claude-plugin/marketplace.json) · [Explorar los paquetes](plugins/)

## Instalación

Necesitas Git y una versión de Codex o Claude Code que incluya soporte para plugins.

### Codex

Añade el marketplace y consulta los paquetes disponibles.

```shell
codex plugin marketplace add imsergiobernal/skills
codex plugin list --marketplace imsergiobernal-skills --available --json
```

### Claude Code

Añade el marketplace y comprueba que aparece entre los orígenes registrados.

```shell
claude plugin marketplace add imsergiobernal/skills
claude plugin marketplace list
```

También puedes ejecutar `/plugin marketplace add imsergiobernal/skills` dentro de una sesión y abrir `/plugin` para explorar los paquetes.

### Instalar un paquete

Cuando haya plugins publicados, sustituye `nombre-del-plugin` por el nombre de una entrada del catálogo y ejecuta el comando de tu cliente.

```shell
# Codex
codex plugin add nombre-del-plugin@imsergiobernal-skills
```

```shell
# Claude Code
claude plugin install nombre-del-plugin@imsergiobernal-skills
```

Inicia una nueva sesión para utilizar las skills instaladas. El identificador del marketplace es `imsergiobernal-skills`.

## Actualizaciones

Actualiza el catálogo y después el plugin que quieras utilizar.

```shell
# Codex
codex plugin marketplace upgrade imsergiobernal-skills
codex plugin add nombre-del-plugin@imsergiobernal-skills
```

```shell
# Claude Code
claude plugin marketplace update imsergiobernal-skills
claude plugin update nombre-del-plugin@imsergiobernal-skills
```

## Contribuir

Puedes proponer nuevas skills, compartir un plugin o mejorar los paquetes existentes mediante una issue o un pull request. Describe qué tarea resuelve tu propuesta, sus requisitos y un ejemplo de uso. [Abrir una issue](https://github.com/imsergiobernal/skills/issues)

Para añadir un paquete, crea una carpeta independiente dentro de `plugins/`. Esta es la estructura básica de un plugin con una skill.

```text
plugins/nombre-del-plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── nombre-de-la-skill/
        └── SKILL.md
```

1. Define el nombre, la versión y la descripción del plugin en `.claude-plugin/plugin.json`, dentro de su carpeta.
2. Escribe cada skill en `skills/<nombre-de-la-skill>/SKILL.md`, con los campos `name` y `description` en su cabecera YAML y sus instrucciones en Markdown.
3. Guarda los scripts, referencias y assets que necesite el paquete dentro de su propia carpeta.
4. Añade su entrada al array `plugins` del catálogo raíz `.claude-plugin/marketplace.json`, con el mismo `name` que el manifiesto y una ruta `source` como `./plugins/nombre-del-plugin`.
5. Valida el paquete y prueba su instalación en los clientes que declares compatibles antes de enviar el pull request.

Puedes comprobar los manifiestos con Claude Code desde la raíz del repositorio, sustituyendo `nombre-del-plugin` por el nombre de tu paquete.

```shell
claude plugin validate ./plugins/nombre-del-plugin
claude plugin validate .
```

## Documentación

- [Empaquetar plugins para Codex](https://developers.openai.com/plugins/build/plugins)
- [Crear un marketplace para Claude Code](https://code.claude.com/docs/en/plugin-marketplaces)
- [Referencia del manifiesto de Claude Code](https://code.claude.com/docs/en/plugins/manifest-reference)

## Licencia

El contenido propio del repositorio se distribuye bajo la [licencia MIT](LICENSE).
