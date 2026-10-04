# Contexto del proyecto — FEMA ERP para Motel

## Producto y usuarios

FEMA es una aplicación operativa para hoteles/moteles de la organización FEMA. La versión presente permite a usuarios autorizados gestionar la operación de habitaciones desde una Web App de Google Apps Script. Los usuarios operativos se identifican con Google; su cuenta debe estar activa en la hoja `Usuarios`. Los permisos se asignan mediante roles y permisos en Google Sheets.

## Alcance comprobado

La aplicación incluye catálogos de hoteles, recepción, personal y turnos de limpieza, tipos de habitación, tarifas y habitaciones; mapa/estado de habitaciones; apertura y cierre de turno; entradas y salidas; personas extra; edición, traslado y cancelación de rentas; asignación/finalización de limpieza; correcciones de estado y reporte de rentas del turno. Esta lista describe rutas y servicios encontrados en el código, no certifica recorridos completos en el despliegue publicado.

La fuente maestra también contiene pestañas de productos, ubicaciones, inventario, ventas, movimientos de caja y cortes. Su existencia en la hoja no significa que esos módulos estén implementados en la interfaz inspeccionada.

## Stack y fuentes de verdad

- Código versionado: este repositorio privado de GitHub, `alexsennin/fema-motel-erp`.
- Backend: Google Apps Script V8, servicios TypeScript compilados al global `Code.js`.
- Interfaz: HTML, CSS y JavaScript cliente en `src/client/Index.html`, usando `google.script.run`.
- Persistencia: Google Sheets `FEMA · Fuente Maestra`; filas de datos desde la fila 5 y encabezados en la fila 4, según `src/server/00_Config.ts` y `02_SheetRepository.ts`.
- Build/sincronización: Node.js 22+, TypeScript, `scripts/build.mjs`, `@google/clasp`; `dist/` es salida generada e ignorada.
- Configuración: `appsscript.json`, `project.config.json` (inventario de IDs/URLs no secretos) y configuración local de clasp ignorada.
- Zona horaria: `America/Mexico_City` en configuración de aplicación y hoja consultada.

## Restricciones y contexto operativo

- El producto debe conservar el enlace de Web App estable durante redespliegues autorizados.
- El estado actual vive en una hoja compartida; cambios de esquema o datos afectan el sistema operativo y requieren autorización, plan de validación y reversión apropiados.
- Las operaciones deben mantener autorización de servidor, separación por motel, consistencia del ciclo de habitación, idempotencia, bloqueo de concurrencia y auditoría conforme a los patrones existentes.
- La configuración visible de `appsscript.json` usa `access: ANYONE` y `executeAs: USER_ACCESSING`; `getCurrentUser_()` depende de `Session.getActiveUser().getEmail()` y la hoja `Usuarios`. La efectividad de esa combinación en el deployment publicado no está verificada.
- No hay evidencia en este checkout de pruebas automatizadas, ejecución de CI, salud de producción ni un recorrido de navegador autenticado completo.

## Metodología y procedencia

El proyecto adopta ALEX DEVELOPMENT STANDARD v1.0 con fuente `alexsennin/alex-development-standard/standards/v1.0/`. El repositorio fuente permanece separado y es sólo lectura. La fuente accesible recomienda v1.1 en su `USAGE.md`; el alcance aquí es v1.0 por solicitud expresa, sin mezclar reglas de versiones.
