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

Consulta la guía de contribución para preparar tu propuesta y la guía de desarrollo para crear un plugin, validar sus archivos y probarlo localmente. [Contribuir](CONTRIBUTING.md) · [Desarrollo](docs/DEVELOPMENT.md)

## Documentación

- [Guía de contribución](CONTRIBUTING.md)
- [Guía de desarrollo](docs/DEVELOPMENT.md)
- [Empaquetar plugins para Codex](https://developers.openai.com/plugins/build/plugins)
- [Crear un marketplace para Claude Code](https://code.claude.com/docs/en/plugin-marketplaces)
- [Referencia del manifiesto de Claude Code](https://code.claude.com/docs/en/plugins/manifest-reference)

## Licencia

El contenido propio del repositorio se distribuye bajo la [licencia MIT](LICENSE).
