# Arquitectura FEMA

## Arquitectura actual (observada)

```text
Navegador
  └─ src/client/Index.html (HTML/CSS/JS, google.script.run)
       └─ funciones API globales en Apps Script (src/server/05_WebApp.ts)
            ├─ autenticación y permisos (03_Authorization.ts)
            ├─ reglas de catálogo, habitaciones y turnos
            │    (04_RoomService.ts, 06_CatalogService.ts, 07_ShiftService.ts)
            └─ repositorio por nombres de pestaña (02_SheetRepository.ts)
                 └─ Google Sheets: FEMA · Fuente Maestra

TypeScript + HTML ── scripts/build.mjs ──> dist/ ── clasp ──> Apps Script Web App
```

`00_Config.ts` concentra spreadsheet ID, zona horaria, filas de encabezado/datos, timeout de lock y nombres de hojas. Los servicios exponen operaciones mediante `05_WebApp.ts`, que transforma excepciones en una respuesta `ApiResponse`. `getCurrentUser_()` identifica cuenta Google y busca usuario activo; `assertPermission_()` verifica grants del rol. La persistencia lee encabezados de fila 4 y registros desde fila 5. Las operaciones críticas usan `LockService`; se encuentran generación de IDs, claves de idempotencia y escrituras de auditoría en los servicios.

## Dominio operativo observado

Catálogos describen moteles, usuarios, permisos, personal, turnos de limpieza, tipos, tarifas y habitaciones. La operación relaciona habitaciones, turnos, estancias/movimientos, eventos de habitación, limpieza, cargos/pagos y bitácora. El reporte de rentas consume el turno, según su endpoint y UI. No se afirma aquí que todas las relaciones estén protegidas por constraints: Sheets no ofrece integridad referencial relacional.

Las pestañas adicionales `Productos`, `Ubicaciones`, `MovInventario`, `Ventas`, `DetalleVentas`, `MovimientosCaja` y `Cortes` existen en la hoja consultada. No se localizaron endpoints UI equivalentes en la superficie de app revisada; inventario/ventas/caja son alcance futuro/no verificado.

## Construcción y publicación (configuración observada)

`npm run typecheck` ejecuta `tsc --noEmit`. `npm run build` ejecuta `scripts/build.mjs`, que genera `dist/`, transpila TypeScript, incorpora `appsscript.json` e `Index.html`. `clasp` usa `dist` como rootDir según `project.config.json`/README. El README afirma que la primera Web App se configura una sola vez y futuras actualizaciones conservan el enlace, pero el mecanismo real para actualizar el deployment estable no se verificó.

Las acciones `docs/github-actions/ci.yml` y `deploy-appsscript.yml` están bajo `docs/`, no en `.github/workflows/`, por lo que GitHub no las descubre como workflows en esa ubicación. La plantilla de despliegue sube con `clasp push --force` y crea una versión; no contiene actualización de un deployment existente. No hay evidencia de que se haya ejecutado.

## Arquitectura objetivo

La meta declarada es evolucionar hacia un ERP que integre hoteles. No se encontró una arquitectura objetivo aprobada más detallada ni decisión que sustituya Apps Script/Sheets. Mantener el stack actual como arquitectura vigente hasta que una decisión formal autorice y describa cualquier migración. No inferir Neon, Supabase, Vercel u otra plataforma.

## Límites y riesgos

- La hoja es almacenamiento compartido sin constraints transaccionales de base relacional; el locking de Apps Script ayuda a serializar operaciones que comparten script, pero los límites concretos deben revisarse frente a concurrencia, cuotas y múltiples entrypoints.
- `webapp.access` es `ANYONE`, aunque la app requiere identidad de usuario Google en código. Verificar el efecto real del despliegue antes de sacar conclusiones de seguridad.
- Un API wrapper devuelve mensaje de excepción al cliente; evaluar exposición de detalles en una tarea de seguridad separada.
- Los IDs/configuración de Apps Script y Sheets aparecen en archivos del repo; no son credenciales, pero deben tratarse como referencias operativas.
- No se verificó el deployment activo, controles de Google Workspace, datos de producción, latencia/cuotas, ni comportamiento de navegador autenticado.
