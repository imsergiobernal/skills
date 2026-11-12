---
name: workshop-bug-search
description: Busca y reproduce bugs en software y entrega un informe, un parche Git y capturas por cada fallo confirmado. Úsala cuando se pidan fallos con evidencia reproducible y correcciones organizadas por bug.
---

# Workshop Bug Search

Busca fallos dentro del alcance solicitado, contrástalos con los requisitos y entrega un conjunto de archivos por cada bug confirmado.

## Entrega por bug

Usa la carpeta de entrega indicada por el usuario. Si no hay una, elige una carpeta de entrega dentro del proyecto e indica su ubicación. Cada bug ocupa su propia subcarpeta:

```text
001/
  report-001.md
  bugfix-001.patch
  screenshot-001.jpg
  screenshot-002.jpg
002/
  report-002.md
  bugfix-002.patch
  screenshot-001.jpg
```

- Usa un número correlativo con al menos tres cifras (ej. `001`, `002`) como identificador para cada bug y nombre de su carpeta. Si ya hay entregas, continúa con el siguiente número y conserva los archivos existentes.
- Mantén el mismo identificador numérico en el informe `report-NNN.md` y el parche `bugfix-NNN.patch` de cada carpeta.
- El informe y un parche Git real son los archivos requeridos de cada entrega completa. No agrupes bugs independientes en un único informe o parche.
- Añade capturas cuando el fallo pueda mostrarse visualmente. Usa nombres `screenshot-NNN.jpg` y numéralas desde `001` dentro de cada bug. Guarda tantas como aporten evidencia, sin exigir dos si una basta. Usa archivos JPEG reales con extensión `.jpg`.
- No crees imágenes simuladas ni archivos vacíos para completar la estructura. Si faltan acceso, código o evidencias para completar una entrega, explica qué falta y no la presentes como completa.

## Búsqueda y reproducción

1. Lee las instrucciones aplicables y comprueba el estado de Git. Identifica la versión o commit de partida y conserva los cambios del usuario.
2. Usa los contratos, requisitos o reglas de negocio disponibles como referencia. Comprueba la implementación y el comportamiento antes de afirmar que los incumple.
3. Reproduce cada sospecha con la interfaz, el navegador, la API o pruebas adecuadas al fallo. Si el usuario pide una herramienta o entorno concreto, úsalo. Guarda entradas, resultados y errores observados, y anota cuántos intentos se realizaron.
4. Distingue los resultados del sistema real de los obtenidos con mocks, respuestas guionizadas o fallos inyectados. No atribuyas una reproducción controlada al servicio real.
5. Confirma que el problema no está resuelto en otra parte antes de preparar el informe y su corrección. Si no encuentras bugs confirmados, dilo sin fabricar entregas.

## Parche Git

Prepara la corrección en una copia o worktree aislado para entregar un parche revisable. Aplica cambios al proyecto original solo cuando el usuario lo haya solicitado. Esta skill no implica crear commits ni publicar cambios.

- Genera `bugfix-NNN.patch` como una diferencia Git compatible con `git apply`, incluyendo los archivos nuevos necesarios y excluyendo cambios ajenos al bug, secretos y archivos locales de ejecución.
- Indica la base del parche en `Environment`. Si depende de otro parche, declara también esa dependencia y el orden de aplicación en ese apartado.
- Comprueba `git apply --check` sobre la base indicada y verifica la corrección con las comprobaciones apropiadas. Para cambios de comportamiento, conserva una reproducción anterior y comprueba el resultado después de corregirlo.
- Describe la validación observada en `Evidence` y `Scope and impact`. No presentes como ejecutadas pruebas que solo has propuesto ni amplíes la afirmación más allá del entorno probado.

## Informe

Lee y utiliza [assets/report-template.md](assets/report-template.md) para crear cada `report-NNN.md`. Sustituye el `001` del encabezado de archivo por el identificador correspondiente y completa el contenido; no entregues las instrucciones de la plantilla como si fueran resultados.

Conserva los encabezados, su orden y los campos de la plantilla. Escribe el contenido en el idioma del usuario salvo que solicite otro. No añadas secciones salvo petición expresa; `Suspected cause (optional)` se omite cuando no hay una pista concreta.

- `Bug`: una línea que identifique qué falla, dónde y bajo qué condición.
- `Summary`: dos o tres frases sobre lo observado, a quién afecta y por qué importa.
- `Environment`: producto, versión/build/commit si se conocen, URL o pantalla, sistema y navegador/dispositivo, tipo de cuenta, rol y región verificados.
- `Steps to reproduce`: pasos numerados suficientes para repetir el fallo, incluyendo las condiciones previas necesarias.
- `Expected result`: comportamiento exigido por los requisitos o contrato; cita la referencia cuando esté disponible.
- `Actual result`: lo sucedido y el texto exacto del error si existe.
- `Evidence`: enlaces relativos a las capturas o grabaciones, estado y cuerpo de petición/respuesta y líneas de logs pertinentes. Enlaza también el parche y resume su validación aquí. Si una evidencia no se capturó o no aplica, indícalo. Oculta secretos sin alterar los hechos relevantes.
- `Scope and impact`: frecuencia observada `N/N`, entornos comparados realmente, usuarios afectados y número de informes conocidos. Marca los datos no comprobados como desconocidos; no inventes un entorno donde no se reproduce.
- `Workaround`: alternativa comprobada que el usuario puede utilizar ahora, o `none` si no se conoce ninguna.
- `Suspected cause (optional)`: solo una pista concreta y contrastable, como un punto del código, PR, commit o cambio de configuración. Distingue la sospecha de una causa demostrada.


