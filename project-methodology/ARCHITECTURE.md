# Arquitectura FEMA

## Arquitectura actual (evidencia del repositorio)

```text
Recepción / administración
        │ navegador
        ▼
Vercel: fema.integratech.app (redirect; proyecto separado)
        │ HTTP 307 / redirect temporal
        ▼
Google Apps Script Web App (/exec)
  ├─ src/client/Index.html (HTML/CSS/JS, google.script.run)
  └─ src/server/*.ts (API RPC + servicios)
        │ SpreadsheetApp.openById
        ▼
Google Sheets · FEMA Fuente Maestra

GitHub ── scripts/build.mjs ──> dist/ ── clasp ──> proyecto Apps Script
Docker local ──> Node + emulador Apps Script + fixtures en memoria
```

La redirección Vercel no proxifica la aplicación ni la identidad de Google. El navegador termina en el dominio de Google para abrir la Web App.

## Componentes y responsabilidades

- **`00_Config.ts`:** spreadsheet ID, zona horaria, fila de encabezados 4, inicio de datos 5, timeout de lock y nombres de pestañas.
- **`01_Types.ts`:** contratos de usuarios, estado de habitación, tarifas, estancias, limpieza, turnos, catálogos, movimientos y reporte.
- **`02_SheetRepository.ts`:** lee encabezados/filas, mapea registros, busca por ID, agrega filas y actualiza celdas. No provee transacciones multihoja.
- **`03_Authorization.ts`:** identifica usuario por correo de Google, verifica permiso del rol, envuelve escrituras críticas en `LockService` y agrega auditoría a `Bitacora`.
- **`04_RoomService.ts`:** mapa de habitaciones, tarifas vigentes, disponibilidad de limpieza, entradas/salidas, pagos de entrada, cambios, cancelaciones, ediciones, personas extra, correcciones, limpieza y reporte de rentas.
- **`05_WebApp.ts`:** `doGet()` y funciones RPC `api*`; transforma excepciones en respuestas `{ok,data}` / `{ok:false,error}`.
- **`06_CatalogService.ts`:** lectura/escritura de catálogos, validación, bajas lógicas y auditoría.
- **`07_ShiftService.ts`:** consulta, apertura/cierre y propietario de turno.
- **`Index.html`:** vistas de catálogos, habitaciones y reporte; formularios/dialogs; validación básica cliente y llamadas RPC.
- **`local/`, `docker/`:** servicio Node y emuladores/fakes para prueba aislada. No conecta a Google.
- **`vercel-entrypoint/`:** configuración de proyecto distinto que redirige todo el tráfico a `/exec`.

## Datos

Pestañas declaradas en `FEMA_CONFIG.sheets`: `Usuarios`, `Roles`, `RolPermisos`, `Permisos`, `Moteles`, `PersonalLimpieza`, `TurnosLimpieza`, `TiposHabitacion`, `Tarifas`, `Habitaciones`, `Turnos`, `Ciclos`, `EventosHabitacion`, `Estancias`, `MovimientosEstancia`, `Limpiezas`, `Mantenimientos`, `Cargos`, `Pagos`, `Bitacora` y `Sesiones`.

El flujo funcional consultado usa principalmente usuarios/permisos, catálogos, habitaciones, turnos, ciclos, eventos, estancias, movimientos, limpiezas, pagos y bitácora. `Mantenimientos`, `Cargos` y `Sesiones` están declaradas, pero no hay API/UI correspondiente en el código inspeccionado. La lista de pestañas del código no garantiza que la hoja real tenga encabezados compatibles.

Los IDs representan relaciones entre hojas. La persistencia está en Google Sheets, por lo que las integridades y unicidades se validan en lógica de aplicación, no por constraints de base relacional. Varias operaciones mutan varias hojas en secuencia: lock e idempotencia reducen ciertos riesgos, pero no garantizan rollback atómico ante error intermedio.

## Flujos funcionales

1. La Web App sirve `Index.html`; `apiGetInitialState()` obtiene el usuario actual, habitaciones, tarifas, personal de limpieza y turno.
2. Los cambios de catálogos pasan por `PER-CAT-GEST`; el uso operativo de habitaciones/reporte pasa por `PER-HAB-GEST`.
3. Cada comando de habitación valida estado, motel, ciclo/estancia y turno; operaciones críticas usan lock y clave revisada contra bitácora.
4. Entrada crea ciclo/estancia/evento/pago y actualiza habitación; salida finaliza estancia y la deja sucia; limpieza mueve sucia→limpieza→disponible; traslado/cancelación/edición registran movimientos/auditoría.
5. El reporte consulta rentas asociadas al turno abierto. No hay API/UI para seleccionar y consultar un turno cerrado.

Para el detalle funcional por pantalla/acción, ver [análisis del control de habitaciones](../docs/ANALISIS_CONTROL_HABITACIONES_LEGADO.md).

## Construcción, pruebas y publicación

- `npm run typecheck`: TypeScript sin emisión.
- `npm run build`: genera `dist/` mediante TypeScript, `appsscript.json` e `Index.html`.
- `npm run dev:docker` / `npm run test:docker`: emulador local y smoke test del ciclo básico; mocks, no prueba Google real.
- `docs/github-actions/ci.yml` y `deploy-appsscript.yml` son plantillas: están fuera de `.github/workflows/` y no se activan como workflows desde esas rutas.
- README documenta el flujo de `clasp`; sincronizar el script remoto y desplegar son operaciones distintas. El procedimiento que conserva la URL estable no fue verificado en esta adopción.
- Vercel se despliega por proyecto/directorio separado y sólo cambia el redirect, según README/configuración. No se verificó el destino vivo durante esta adopción.

## Límites y arquitectura objetivo

La meta declarada es evolucionar FEMA a un ERP hotelero integrado; no existe aquí una arquitectura futura aprobada más detallada. Google Sheets + Apps Script sigue siendo la arquitectura vigente por instrucción del proyecto. No se inicia una migración de base/plataforma como parte de esta adopción.

Riesgos actuales: autenticación por cuenta Google aunque se solicitó usuario/contraseña; `appsscript.json` declara `access: ANYONE` junto a `executeAs: USER_ACCESSING` y no se comprobó el efecto real; la UI acopla carga de catálogo y carga operativa; reportes de turnos cerrados no disponibles; manejo de pagos puede alterar registros aplicados al editar una estancia; varias escrituras no son transaccionales; mantenimiento/inventario/ventas/caja no son módulos funcionales confirmados.
