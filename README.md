# Skills y plugins de Sergio Bernal

Marketplace de skills y plugins para Codex y Claude Code. Cada plugin agrupa skills y los recursos que necesitan para realizar un flujo de trabajo.

El catálogo inicial está vacío y preparado para recibir sus primeros plugins. Puedes consultar su contenido en el [catálogo del marketplace](.claude-plugin/marketplace.json).

## Añadir el marketplace

Necesitas Git y una versión de tu cliente que incluya los comandos de plugins.

### Codex

```shell
codex plugin marketplace add imsergiobernal/skills
codex plugin list --marketplace imsergiobernal-skills --available --json
```

### Claude Code

```shell
claude plugin marketplace add imsergiobernal/skills
claude plugin marketplace list
```

Dentro de una sesión de Claude Code también puedes ejecutar `/plugin marketplace add imsergiobernal/skills` y abrir `/plugin` para explorar el catálogo.

## Instalar un plugin

Cuando haya plugins publicados, sustituye `nombre-del-plugin` por el nombre de una entrada del catálogo.

### Codex

```shell
codex plugin add nombre-del-plugin@imsergiobernal-skills
```

### Claude Code

```shell
claude plugin install nombre-del-plugin@imsergiobernal-skills
```

Inicia una nueva sesión para usar las skills instaladas. El identificador del marketplace es `imsergiobernal-skills`.

## Actualizar

### Codex

```shell
codex plugin marketplace upgrade imsergiobernal-skills
codex plugin add nombre-del-plugin@imsergiobernal-skills
```

El primer comando actualiza el catálogo. El segundo instala o actualiza el plugin seleccionado.

### Claude Code

```shell
claude plugin marketplace update imsergiobernal-skills
claude plugin update nombre-del-plugin@imsergiobernal-skills
```

## Organización

```text
.claude-plugin/
    marketplace.json
plugins/
    .gitkeep
.gitignore
AGENTS.md
LICENSE
README.md
```

El catálogo usa el formato Claude-compatible admitido por Codex. Las rutas de sus entradas se resuelven desde la raíz del repositorio. [Documentación de Codex](https://developers.openai.com/plugins/build/plugins) · [Documentación de Claude Code](https://code.claude.com/docs/en/plugin-marketplaces)

## Publicar un plugin

### Crear el paquete

Crea una carpeta `plugins/mi-plugin/` con el manifiesto y sus skills.

```text
plugins/mi-plugin/
    .claude-plugin/
        plugin.json
    skills/
        saludar/
            SKILL.md
```

Guarda los metadatos del plugin en `plugins/mi-plugin/.claude-plugin/plugin.json`.

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

Guarda las instrucciones de la skill en `plugins/mi-plugin/skills/saludar/SKILL.md`.

```markdown
---
name: saludar
description: Redacta un saludo breve en español cuando el usuario solicita un saludo.
---

Escribe un saludo breve en español, adaptado al contexto que haya dado el usuario.
```

Coloca los scripts, referencias y assets que necesite una skill dentro de su propia carpeta. Un plugin también puede incluir configuraciones de MCP y hooks. Comprueba la compatibilidad de esos componentes con cada cliente. [Manifiesto de Claude Code](https://code.claude.com/docs/en/plugins/manifest-reference) · [Empaquetado para Codex](https://developers.openai.com/plugins/build/plugins)

### Añadirlo al catálogo

Añade una entrada a `plugins` en `.claude-plugin/marketplace.json`.

```json
{
  "name": "mi-plugin",
  "source": "./plugins/mi-plugin",
  "description": "Un saludo breve en español."
}
```

Usa el mismo `name` en la entrada y en el manifiesto del plugin. Mantén todos los archivos que necesita el plugin dentro de su carpeta para que se incluyan en la instalación.

### Validarlo e instalarlo localmente

Ejecuta estos comandos desde la raíz del repositorio.

```shell
claude plugin validate ./plugins/mi-plugin
claude plugin validate .
```

La validación del catálogo vacío devuelve una advertencia sobre la ausencia de plugins. [Referencia de validación](https://code.claude.com/docs/en/plugins/marketplace-reference#validation-messages)

Para probar la copia local, añade su ruta absoluta como origen del marketplace en el cliente elegido e instala el plugin con su identificador completo.

```shell
codex plugin marketplace add "D:/imsergiobernal/skills"
codex plugin add mi-plugin@imsergiobernal-skills
```

```shell
claude plugin marketplace add "D:/imsergiobernal/skills"
claude plugin install mi-plugin@imsergiobernal-skills
claude plugin details mi-plugin
```

En Claude Code, la skill del ejemplo se invoca con `/mi-plugin:saludar`. En Codex puedes seleccionarla entre las skills del plugin instalado.

### Compartir la actualización

Incrementa la versión del plugin cuando cambie su contenido y sube el paquete y su entrada del catálogo a la rama `main`. Los usuarios podrán obtenerlos con los comandos de actualización anteriores.

## Licencia

El contenido propio de este repositorio se distribuye con la [licencia MIT](LICENSE).
