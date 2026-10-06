# Instrucciones para agentes — FEMA

Este proyecto adopta **ARC DEVELOPMENT STANDARD v1.3.2**. La fuente normativa es [`alexsennin/alex-development-standard`, `standards/v1.3.2/`](https://github.com/alexsennin/alex-development-standard/tree/main/standards/v1.3.2/) y se consulta en modo sólo lectura. No copiar aquí los documentos canónicos.

## Recuperación antes de trabajar

1. Confirma `TARGET_REPO`, raíz, rama, remoto `origin`, HEAD y estado Git. El objetivo autorizado es `alexsennin/fema-motel-erp`; no modifiques el repositorio fuente ARC.
2. Lee [contexto](project-methodology/PROJECT_CONTEXT.md), [estado](project-methodology/PROJECT_STATE.md), [arquitectura](project-methodology/ARCHITECTURE.md), [pendientes](project-methodology/TODO.md) y las [decisiones](project-methodology/DECISIONS.md) relevantes. Lee [entornos](project-methodology/ENVIRONMENTS.md) y [estado de publicación/despliegue](project-methodology/RELEASE_STATE.md) cuando la tarea toque servicios externos; consulta [diseño](project-methodology/design/) si afecta la UI.
3. Para una tarea, carga el módulo afectado y el contexto mínimo adicional que justifique la evidencia. Separa lo implementado de lo propuesto y de lo no verificado.

## Alcance y protección

- El stack vigente es Google Apps Script + TypeScript/HTML + Google Sheets. Docker es emulación local; Vercel proporciona un redirect de entrada. No iniciar migración de stack por inferencia.
- No escribir en Sheets, Drive, Apps Script remoto, Vercel ni Producción, ni desplegar, sin autorización explícita para la operación y destino concretos. Un push no autoriza despliegue.
- Preserva la URL estable de Apps Script al desplegar. No usar comandos que creen otro deployment/proyecto sin revisar el procedimiento y recibir autorización.
- Trata autenticación, roles, permisos, pagos, persistencia y concurrencia como riesgos sensibles. Valida autorización en servidor y nunca expongas credenciales o datos personales en código, fixtures, documentos o logs.
- Conserva historial, bitácora, idempotencia y comportamiento operativo. Google Sheets no aporta transacciones relacionales; revisa escrituras parciales y compensación donde aplique.
- Preserva cambios ajenos. No hagas reset, clean, restore o force push que pueda eliminar trabajo.

## Comprobaciones locales disponibles

Desde la raíz del repo:

```bash
npm ci
npm run typecheck
npm run build
npm run dev:docker
npm run test:docker
npm run dev:docker:stop
```

El emulador Docker usa fixtures efímeros; no valida el runtime Google, el login real ni producción. `npm run clasp:push` escribe en el proyecto Apps Script conectado; no es una prueba local. `npm run clasp:deploy` ejecuta `clasp create-deployment` y no debe usarse para actualizar la URL estable sin un procedimiento aprobado.

Las plantillas de CI/despliegue están en `docs/github-actions/`, no en `.github/workflows/`; por ahora no son workflows activos de GitHub Actions. Comprueba configuración y automatizaciones antes de publicar una rama.

## Flujo y cierre

Clasifica modo, nivel y capacidad según ARC v1.3.2. En Codex Desktop el routing es manual y AXIOM no se presume instalado; esto no cambia el estándar. Para cambios funcionales define aceptación y prueba del comportamiento; para cambios de datos/auth/servicios amplía el análisis y separa preparación de operación externa.

Actualiza sólo documentación cuya verdad cambió. Los documentos del proyecto viven en `project-methodology/`; `AGENTS.md` permanece en la raíz. Antes de commit, revisa `git diff --check`, diff, rutas staged y remoto. Publica cambios importantes sólo en la rama/destino autorizados; nunca despliegues en Producción por inferencia. Entrega por separado estado local, commit, push, despliegue y verificación.

## Mapa documental

- [Contexto del proyecto](project-methodology/PROJECT_CONTEXT.md)
- [Estado actual](project-methodology/PROJECT_STATE.md)
- [Arquitectura](project-methodology/ARCHITECTURE.md)
- [TODO](project-methodology/TODO.md)
- [Decisiones](project-methodology/DECISIONS.md)
- [Entornos](project-methodology/ENVIRONMENTS.md)
- [Estado de publicación/despliegue](project-methodology/RELEASE_STATE.md)
- [Diseño](project-methodology/design/)
