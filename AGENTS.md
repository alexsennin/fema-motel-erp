# Reglas de trabajo para FEMA

Este proyecto adopta **ALEX DEVELOPMENT STANDARD v1.0**, cuya fuente canónica de consulta es `alexsennin/alex-development-standard`, ruta `standards/v1.0/`. La fuente se consulta como sólo lectura; no se copian ni adaptan sus documentos canónicos dentro de este proyecto. Esta documentación está en la raíz por decisión específica del proyecto; véase [DECISIONS.md](DECISIONS.md).

## Antes de trabajar

1. Lee [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md), [PROJECT_STATE.md](PROJECT_STATE.md), [ARCHITECTURE.md](ARCHITECTURE.md), [TODO.md](TODO.md) y las decisiones pertinentes en [DECISIONS.md](DECISIONS.md). Consulta también [README.md](README.md) para instrucciones de desarrollo y límites operativos.
2. Verifica raíz, rama, `origin`, HEAD y estado Git. Conserva cambios preexistentes y trabaja sólo en el repositorio FEMA.
3. Confirma si la tarea es documentación, código, integración, datos o despliegue. No conviertas un cambio documental en una mutación de código o datos.
4. Inspecciona las implementaciones actuales antes de proponer comportamiento. Separa hechos comprobados, hipótesis, objetivo futuro y aspectos no verificados.

## Límites de seguridad y operación

- No escribas en `FEMA · Fuente Maestra`, Apps Script publicado, Drive ni otros sistemas operativos sin autorización explícita para esa operación.
- No publiques ni cambies el deployment estable por inferencia. Preservar la URL existente es un requisito operativo del producto; antes de publicar hay que confirmar el procedimiento, deployment ID y autorización.
- No registres credenciales, tokens, datos personales ni contenido sensible en código, documentos, fixtures o logs. Los archivos locales de clasp y salidas ignoradas no deben inspeccionarse ni versionarse por defecto.
- Trata autenticación y permisos como controles del servidor. No afirmes que el acceso de producción está seguro sólo porque exista una comprobación local.
- Conserva auditoría, idempotencia, locking y compatibilidad con la estructura de Sheets. Toda escritura de datos debe ser deliberada y validada.
- No ejecutes `npm run clasp:deploy` como atajo: el script ejecuta `clasp create-deployment`, operación que puede crear un deployment distinto y no demuestra conservación de la URL estable.
- No uses `clasp push --force` salvo que una tarea aprobada lo requiera y se haya revisado explícitamente el alcance de sobrescritura.

## Comandos de referencia

Desde `TARGET_ROOT`:

```bash
npm ci
npm run typecheck
npm run build
npm run clasp:status
```

`typecheck` y `build` son validaciones locales del código, no pruebas de la UI autenticada ni validación de producción. `clasp:status` consulta el estado de sincronización remoto; úsalo sólo cuando esa lectura sea necesaria. Revisa `package.json` y los flujos antes de ejecutar comandos con efectos externos.

## Git y cierre

- Usa una rama de trabajo `codex/...` siguiendo las convenciones del repo. No trabajes directamente sobre `main`.
- Antes de hacer commit, revisa `git status`, `git diff --check`, `git diff` y rutas staged; confirma que `origin` sigue apuntando a `https://github.com/alexsennin/fema-motel-erp.git`.
- No hagas push, merge, publicación ni mutación externa salvo que la tarea lo autorice y se hayan verificado sus condiciones.
- Actualiza sólo los documentos cuya verdad cambió. Al cerrar, indica archivos, rama, commit/push si aplica, validaciones efectuadas y límites no verificados.

## Mapa de documentación

- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md): propósito, usuarios, alcance y restricciones.
- [PROJECT_STATE.md](PROJECT_STATE.md): evidencia de la instantánea, estado, riesgos y siguiente paso.
- [ARCHITECTURE.md](ARCHITECTURE.md): arquitectura actual, flujos, límites y objetivo diferenciado.
- [TODO.md](TODO.md): pendientes priorizados con aceptación.
- [DECISIONS.md](DECISIONS.md): decisiones vigentes y su contexto.
- [Diseño](DESIGN_SYSTEM.md): observaciones, [tokens](TOKENS.md), [componentes](COMPONENTS.md), [layouts](LAYOUTS.md).
- [README.md](README.md): instrucciones y resumen de entrada al repositorio.
