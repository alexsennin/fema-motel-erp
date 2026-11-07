# FEMA · Gestión hotelera sobre Apps Script

FEMA es una Web App para administrar catálogos y el flujo operativo de habitaciones de moteles. El código vive en este repositorio; el servicio usa Google Apps Script y Google Sheets.

## Estado funcional

El código actual incluye catálogos de hoteles, recepción, personal/horarios de limpieza, tipos, tarifas y habitaciones; turnos; rentas/entradas, salidas, cambios de habitación, cancelaciones, ediciones/personas extra, limpieza, correcciones y reporte del turno abierto. No están implementados todavía inventario, ventas, cargos/consumos, mantenimiento operativo ni corte de caja. La presencia de pestañas reservadas en Sheets no significa que exista un módulo de aplicación.

La autenticación vigente usa la cuenta Google activa y valida al usuario en la hoja `Usuarios`. El personal no inicia sesión con credenciales propias en esta versión.

## Fuentes y entornos

- Código fuente: este repositorio privado.
- Datos operativos: `FEMA · Fuente Maestra` en Google Sheets.
- Aplicación: Web App de Apps Script; el subdominio `fema.integratech.app` es una entrada Vercel que redirige a la URL `/exec`, no un proxy de Apps Script.
- Desarrollo aislado: emulador Docker local en `http://localhost:8787` con fixtures efímeros.
- No editar código directamente en `script.google.com`; los cambios de aplicación parten del repositorio.

## Desarrollo local

Requisitos para compilar y probar el emulador: Node.js 22 o posterior, npm y Docker Compose. La compilación local no requiere acceso a Google.

```bash
npm install
npm run typecheck
npm run build
```

`clasp push` sincroniza archivos con el proyecto Apps Script y es una operación externa; no forma parte de la prueba local. En este repositorio el proyecto de Apps Script ya está identificado por `project.config.json`. No ejecutes `clasp create-script` para desarrollo cotidiano porque crearía otro proyecto.

### Emulador local con Docker

Para desarrollar y ejecutar una prueba de humo aislada, sin leer ni escribir la hoja real:

```bash
npm run dev:docker
npm run test:docker
npm run dev:docker:logs
npm run dev:docker:stop
```

La app local queda en `http://localhost:8787`. Usa fixtures efímeros en memoria para dos hoteles y dos identidades ficticias con el mismo perfil, y un puente local compatible con las llamadas `google.script.run` usadas por la UI. No contiene credenciales Google ni importa datos de producción. El contenedor compila el TypeScript fuente al arrancar; vuelve a ejecutar `npm run dev:docker` tras cambiar código para reconstruir y reiniciar.

La prueba de humo usa un emulador de `SpreadsheetApp`, `Session`, `Utilities` y `LockService`; incluye workers concurrentes que compiten por el mock de lock y almacenamiento compartido, pero no prueba concurrencia del runtime real de Google. Tampoco es una prueba visual E2E de navegador. Un reinicio vuelve a sembrar las fixtures. El `npm ci` de la imagen reportó 11 avisos de auditoría de dependencias (7 moderados y 4 altos); quedan por revisar en una tarea aparte y no se actualizaron dependencias aquí.

El proyecto independiente de Apps Script vive dentro de la carpeta `FEMA` en
Google Drive y abre la fuente maestra mediante su ID. `clasp create-script`
crea `.clasp.json`; ese archivo y `~/.clasprc.json` contienen identificadores o
credenciales y no se versionan.

## Despliegue desde GitHub

Las plantillas se encuentran en `docs/github-actions/`. Para activarlas, la
cuenta que realiza el push necesita el scope `workflow`; después se mueven a
`.github/workflows/`.

El workflow manual `Deploy Apps Script` requiere dos secretos del environment `production`:

- `CLASPRC_JSON`: contenido de `~/.clasprc.json`.
- `CLASP_JSON`: contenido de `.clasp.json`.

El workflow compila, sube `dist/` mediante `clasp` y crea una versión inmutable. La primera implementación como Web App se configura una vez en Apps Script; las actualizaciones posteriores conservan el mismo enlace.

## URL de acceso FEMA

`vercel-entrypoint/` contiene un proyecto Vercel separado del build de Apps Script. Su redirección temporal lleva `https://fema.integratech.app` al deployment estable `/exec` de Apps Script. La autenticación sigue ocurriendo en Google y, después de redirigir, el navegador mostrará el dominio de Google; Vercel sólo proporciona una dirección fácil de recordar, no un proxy ni un dominio personalizado nativo de Apps Script.

El proyecto Vercel `fema-motel-link` ya tiene asignado `fema.integratech.app`. Su publicación actual se hizo con Vercel CLI. El intento de conectar GitHub falló porque la integración de Vercel no tiene acceso al repositorio privado; hasta autorizar esa integración, los cambios de `vercel-entrypoint/` requieren un despliegue manual desde esa carpeta. No se debe cambiar la visibilidad del repositorio.

Para actualizar manualmente la entrada, primero verifica el contenido de `vercel-entrypoint/vercel.json` y luego ejecuta `npx vercel --cwd vercel-entrypoint` para preview o `npx vercel --prod --cwd vercel-entrypoint --scope alex-sennin` para producción. Ese deploy sólo modifica el redirect Vercel: no sube ni despliega código Apps Script.

## Estructura principal

```text
src/server/     Servicios de Apps Script
src/client/     Interfaz HTML del Web App
scripts/        Compilación local
dist/           Salida generada para clasp; no se versiona
docs/github-actions/  Plantillas de validación y despliegue
```

## Documentación del proyecto

FEMA adopta **ARC DEVELOPMENT STANDARD v1.3.2**. La fuente normativa permanece en `alexsennin/alex-development-standard/standards/v1.3.2/`; no se copia al repositorio.

- [Reglas para agentes](AGENTS.md)
- [Contexto del proyecto](project-methodology/PROJECT_CONTEXT.md)
- [Estado actual](project-methodology/PROJECT_STATE.md)
- [Arquitectura](project-methodology/ARCHITECTURE.md)
- [Pendientes priorizados](project-methodology/TODO.md)
- [Decisiones](project-methodology/DECISIONS.md)
- [Entornos](project-methodology/ENVIRONMENTS.md) y [estado de publicación/despliegue](project-methodology/RELEASE_STATE.md)
- [Documentación de diseño](project-methodology/design/)
- [Análisis del control legado DREAMS2025](docs/ANALISIS_CONTROL_HABITACIONES_LEGADO.md)

## Seguridad observada y límites

- El usuario se identifica con su cuenta de Google y debe existir activo en `Usuarios`.
- Los permisos se validan en servidor.
- Las operaciones críticas utilizan `LockService`.
- Las operaciones de habitaciones verifican permisos del rol y usan `LockService`.
- Las operaciones sensibles de habitaciones verifican clave de idempotencia; no se debe generalizar esa garantía a cada acción de catálogos.
- Cancelaciones y modificaciones sensibles generan registros en `Bitacora`.
- Los cambios que afectan varias pestañas no tienen rollback transaccional automático.
