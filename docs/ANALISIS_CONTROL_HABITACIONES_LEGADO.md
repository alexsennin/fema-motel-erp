# FEMA · Análisis funcional del sistema y pendientes

Fecha de revisión del código: 4 de octubre de 2026

Repositorio: `alexsennin/fema-motel-erp` · Rama: `codex/fema-vercel-docker-env` · HEAD al iniciar la revisión: `36ea97b`

Fuente legada contrastada: [DREAMS2025 · DASHBOARD](https://docs.google.com/spreadsheets/d/10ujsmBHqalnG_HxbiuVrhp4uDDuYHNRwDVm5FjY5X18/edit?gid=240854263#gid=240854263)

## Alcance y límites de verificación

Se revisó el código versionado de Apps Script, la interfaz HTML, el esquema de hojas declarado, el emulador Docker y su prueba de humo. No se cambió lógica, no se escribió en Sheets y no se ejecutó `clasp pull`. Por ello, el documento explica lo que hace el código fuente de esta rama; no certifica que el deployment productivo ni las hojas reales estén sincronizados con él.

De la hoja legado se consultaron metadatos, `DASHBOARD!A1:Z30` y `QUERY!A1:G40`. No se inspeccionaron el script que opera esa hoja, sus formularios, otros tabs ni el contenido completo de `QUERY`.

## Arquitectura actual

- **Interfaz:** `src/client/Index.html`, una aplicación HTML/JavaScript que se sirve con `HtmlService` y llama funciones de servidor mediante `google.script.run`.
- **Servidor:** TypeScript bajo `src/server/`, compilado por `scripts/build.mjs` a `dist/` para Apps Script/clasp.
- **Persistencia:** una hoja maestra de Google Sheets. `src/server/00_Config.ts` declara pestañas y `src/server/02_SheetRepository.ts` convierte filas a objetos usando encabezado en la fila 4 y datos desde la 5.
- **Desarrollo local:** Docker ofrece un emulador de `SpreadsheetApp`, `Session`, `Utilities` y `LockService` con fixtures; no es el runtime productivo de Google.
- **Protección de operaciones:** validación de usuario/permiso, `LockService` global y clave de idempotencia revisada contra `Bitacora` para operaciones sensibles.

La persistencia actual actualiza celdas/filas en distintas llamadas. El bloqueo evita concurrencia simultánea entre ejecuciones del script, pero no convierte una secuencia de escrituras sobre varias pestañas en una transacción con rollback automático.

## Qué hace el sistema por módulo y acción

### 1. Entrada Web App y autenticación

`doGet()` entrega la página FEMA. Antes de devolver cada estado o ejecutar cada API, `getCurrentUser_()` toma el correo de `Session.getActiveUser()`, busca un usuario activo con ese correo en `Usuarios` y obtiene su motel/rol. No existe en este código un acceso por usuario y contraseña ni emisión/validación de credenciales propias.

`assertPermission_()` comprueba permisos por rol desde `RolPermisos`. Las respuestas del servidor usan `{ok,data}` o `{ok:false,error}`. La bitácora registra acción, entidad, usuario, motel, fecha, datos antes/después y motivo.

### 2. Catálogos

La vista de catálogos permite altas, edición y baja/reactivación lógica de:

- **Hoteles:** nombre y zona horaria. Al dar de alta un hotel se crean también los turnos de limpieza matutino y vespertino predeterminados. No se permite darlo de baja si conserva habitaciones o usuarios activos.
- **Personal de recepción:** nombre, apellidos, motel y correo opcional. Se crea en rol `ROL-RECEPCION`; el correo opcional no sustituye el requisito de Google para autenticarse.
- **Personal de limpieza:** nombre, motel y turno habitual (`MATUTINO` o `VESPERTINO`).
- **Turnos de limpieza:** hora de inicio/fin por motel; valida formato, evita inicio y fin iguales y no permite traslapar horarios activos.
- **Tipos de habitación:** nombre, motel y precio unitario de persona extra.
- **Tarifas:** tipo, nombre, duración en minutos, precio base, personas incluidas y vigencia inicial/final. Evita duplicar una tarifa por duración del tipo.
- **Habitaciones:** número, motel, tipo y puntos de limpieza. Sólo se pueden editar o dar de baja si están disponibles y sin ciclo activo.

Las altas, cambios, bajas y reactivaciones generan registros de auditoría. `listCatalogs_()` entrega los catálogos al usuario con permiso `PER-CAT-GEST`.

### 3. Mapa operativo de habitaciones

`apiGetInitialState()` entrega las habitaciones activas del motel asociado al usuario, sus tarifas vigentes, turnos/personal de limpieza disponible y estado del turno. Las tarjetas muestran habitación, tipo, estado, tarifa inicial o aviso de tarifa pendiente; para habitaciones ocupadas muestran salida prevista y placas; para sucias, puntos de limpieza y disponibilidad de personal; para limpieza, personal asignado e inicio.

Estados representados por los tipos y la interfaz: `DISPONIBLE`, `OCUPADA`, `SUCIA`, `LIMPIEZA` y `MANTENIMIENTO`. No hay flujo/API para iniciar o cerrar mantenimiento; una habitación sólo puede mostrarse con ese estado si su dato ya existe en Sheets.

### 4. Turnos de recepción

- **Abrir turno:** crea un registro `ABIERTO` si el motel no tiene otro abierto. No inicializa ni cambia estados de habitaciones.
- **Operar:** el código sólo permite operar a quien abrió el turno. Las otras personas pueden consultar el estado, pero no operar mientras ese turno siga abierto.
- **Cerrar turno:** cambia el registro a `CERRADO` y conserva el resto de la información. No hay cierre de caja ni conciliación de efectivo en este flujo.
- **Consultar turno cerrado:** la interfaz muestra metadatos de cierres recientes, pero el reporte de rentas se vacía/oculta cuando ya no hay turno abierto. No hay selector ni consulta de un turno cerrado.

### 5. Registrar entrada y renta

En una habitación disponible, el usuario elige tarifa vigente del tipo correspondiente, personas extra, forma de pago (efectivo, tarjeta o transferencia) y opcionalmente vehículo/placas. El servidor vuelve a validar disponibilidad, motel, vigencia de tarifa y turno abierto.

La operación calcula precio base más personas extra; crea ciclo, estancia, evento `DISPONIBLE → OCUPADA` y pago; actualiza el estado/ciclo actual de la habitación y registra auditoría. La salida prevista se calcula usando los minutos de la tarifa.

### 6. Registrar salida

En una habitación ocupada se finaliza la estancia con hora real de salida, agrega evento `OCUPADA → SUCIA`, actualiza el estado de la habitación y deja auditoría. Las observaciones son opcionales.

### 7. Limpieza

- **Disponibilidad de personal:** filtra personal activo del mismo motel, con turno habitual vigente según horarios de limpieza y sin otra limpieza activa. El servidor repite las validaciones al asignar.
- **Asignar:** sólo desde `SUCIA`; se crea limpieza en proceso con usuario responsable y la habitación pasa a `LIMPIEZA`. No hay campo de observaciones/instrucciones de limpieza.
- **Finalizar:** marca la limpieza finalizada, calcula minutos, registra el evento `LIMPIEZA → DISPONIBLE`, cierra el ciclo y libera la habitación.
- **Corregir estado:** deshacer desde `LIMPIEZA` cancela la asignación activa y regresa a `SUCIA`.

### 8. Cambio de habitación, cancelación y edición de renta

- **Cambio de habitación:** mueve la estancia activa a una habitación disponible del mismo motel, abre ciclo para destino, deja la habitación origen `SUCIA` y mantiene el importe. Registra movimiento y eventos para ambos cuartos.
- **Cancelar renta:** exige motivo, deja la estancia `CANCELADA`, lleva su importe a cero, cancela pagos aplicados y pasa la habitación a `SUCIA`.
- **Agregar persona extra:** exige cantidad y observación; calcula el cargo usando el precio de persona extra del tipo, suma personas e importe y registra movimiento/auditoría.
- **Editar renta:** requiere observación; permite cambiar salida prevista, vehículo, placas, personas extra e importe final. Registra el cambio y auditoría.
- **Corregir/deshacer:** desde `SUCIA` puede revertir una salida/cancelación o un traslado cuando encuentra datos compatibles; las correcciones se auditan con módulo `LOG_ERRORES`. Es una reversa funcional, no un borrado del historial.

### 9. Reporte de rentas

La vista muestra rentas vinculadas por `IdTurno` al turno actualmente abierto: entrada (fecha/hora/habitación/importe/forma de pago), desocupación (estado/fecha/hora), limpieza (fecha/hora/personal/duración) y totales.

El backend incluye estancias canceladas con importe cero. En el reporte, la habitación viene de `IdHabitacionActual`; la limpieza se busca por ciclo de la estancia y se usa una fila por ciclo. Con traslados, la limpieza del ciclo de origen puede quedar fuera de esa fila. La consulta no permite elegir un turno histórico cerrado.

### 10. Módulos declarados pero todavía no funcionales

La configuración declara pestañas `Mantenimientos`, `Cargos`, `Sesiones`, además de pagos, bitácora, ciclos y movimientos. En el código inspeccionado no hay flujo de API/UI para mantenimiento, cargos/consumos, inventario, ventas ni un módulo de corte de caja. Que la hoja o la configuración tengan nombres reservados no significa que el módulo esté construido.

## Contraste resumido con DREAMS2025

La pestaña `DASHBOARD` organiza una cuadrícula fija de 31 habitaciones (1–31) con tipo, costo, estado, importe, entrada, duración, salida y tiempo restante. Fórmulas `VLOOKUP` leen `QUERY`; `NOW()` calcula el tiempo restante. En la lectura del 4 de octubre de 2026 se veían ocupadas las habitaciones 6–10 y 23. Los precios visibles incluían Sencilla ($430), Suite Confort ($1,500), Gran Suite Confort ($2,400), Junior Suite ($580), Master Suite ($650) y Contenedor 1/2 ($430); no se consideran tarifas confirmadas.

FEMA ya representa el flujo de operación con catálogos, estancias, ciclos, eventos, limpieza, pagos y auditoría. A diferencia del tablero legado, no muestra una cuenta regresiva viva. La etiqueta legada `CORTE CAJA` aparece en el tablero, pero su funcionalidad no pudo verificarse. No deben importarse precios ni datos legados sin conciliación aprobada.

## Pendientes y mejoras ajustados al código actual

### P0 · Bloqueos para el uso operativo esperado

1. **Separar la carga de catálogos de la vista operativa.** `loadAll()` inicia `apiGetCatalogs()` y `apiGetInitialState()` con `Promise.all`. Si el usuario no tiene `PER-CAT-GEST`, falla la carga conjunta y el mismo error deja sin mostrar también habitaciones/turno. Un recepcionista debería poder usar habitaciones y reportes con permiso operativo, aunque no gestione catálogos.
   - Cierre: con usuario sólo operativo, la vista de habitaciones/reporte funciona; catálogos se bloquean con mensaje propio, sin tumbar las demás vistas.
2. **Alinear autenticación con la regla de usuario/contraseña ya solicitada.** Hoy el backend autentica exclusivamente por correo de la sesión Google; el correo en catálogo es opcional y no se generan usuarios/contraseñas. Diseñar autenticación segura antes de exponer a personal que no iniciará con su Google.
   - Cierre: flujo y amenaza revisados; contraseñas con hash seguro, sesión revocable, autorización por motel/rol, restablecimiento y pruebas negativas; no guardar contraseñas en texto claro en Sheets.
3. **Permitir consultar el corte/reporte de un turno cerrado.** La pantalla actual sólo consulta el turno abierto; al cerrar, `renderRentalReport()` dice que no hay turno y no entrega su corte, contrario a la necesidad operativa de conservar consulta sin operación.
   - Cierre: abrir vista de sólo lectura por turno cerrado, con los mismos datos/totales congelados o reproducibles y controles de operación deshabilitados.
4. **Conciliar las 31 habitaciones, tipos y tarifas antes de sustituir la hoja legada.** Confirmar diferencias entre DREAMS2025 y el catálogo FEMA real; validar tarifas actuales con responsable. No cargar automáticamente los importes observados.
   - Cierre: matriz de conciliación aprobada, respaldo y comprobación habitación por habitación.

### P1 · Integridad de rentas, turnos y registros

5. **Resolver trazabilidad de traslado en el reporte.** La renta pasa a apuntar al ciclo/habitación de destino; la limpieza posterior del cuarto de origen está ligada al ciclo anterior. Definir si el reporte enseña cuarto de entrada, cuarto final o todos los traslados y la limpieza correspondiente de cada uno.
6. **Corregir/separar monto cobrado de precio final.** En edición, el código actualiza el monto de cada pago `APLICADO` al nuevo precio final. Si existen varios pagos, cada uno puede acabar reflejando el total; si hubo descuento/ajuste, se pierde la representación del cobro real. Cancelar/reactivar también cambia estados de pagos existentes. Definir cargos, pagos parciales, ajustes, devoluciones y corte antes de ampliar esta lógica.
7. **Revisar el alcance de reversas y la consistencia de escrituras multihoja.** Las reversas seleccionan movimientos históricos por habitación y deben probarse con varias estancias/traslados sucesivos. Las operaciones escriben secuencialmente en varias pestañas bajo lock, pero un error intermedio no tiene rollback automático.
8. **Aclarar alcance de turnos y autorización entre recepcionistas.** Una sola persona puede operar: el turno pertenece al usuario que lo abrió. Confirmar si el relevo esperado requiere que el titular cierre antes de que otro abra, mientras ambos puedan consultar el corte anterior.
9. **Ejecutar pruebas de aceptación amplias.** La prueba Docker visible recorre abrir turno → entrada → reporte → salida → asignar/finalizar limpieza → cerrar turno. No cubre catálogos, autenticación/roles, editar precios, personas extra, cancelación, traslado, reversas, pagos múltiples, reportes cerrados, horarios nocturnos ni fallas entre escrituras.
   - Cierre: casos automatizados locales para las reglas aprobadas, luego pruebas con cuenta de prueba y hoja de prueba; evidencia separada. No usar datos productivos como fixtures.

### P2 · Paridad y ampliación de producto

10. **Mostrar tiempo restante en habitaciones ocupadas.** FEMA presenta fecha/hora de salida prevista, pero no recalcula ni actualiza visualmente tiempo restante; el legado lo muestra con `NOW()`.
11. **Definir/planear módulos ERP aún ausentes.** Especificar por separado mantenimiento, cargos/consumos, inventario, ventas y corte de caja; hoy sólo existen algunas referencias de pestañas, no flujos funcionales.
12. **Validar interfaz responsive y revisión visual autenticada.** El repositorio define estilos y tarjetas adaptables, pero el smoke test HTTP no demuestra que el recorrido visual/teclado opere igual en Apps Script real ni en los dispositivos de recepción.

## Próximo paso recomendado

Resolver primero los pendientes P0 1–4, priorizando el acceso de recepción sin permiso de catálogos y la consulta de turnos cerrados. Después acordar los casos P1 de pagos y traslados y convertirlos en criterios de aceptación. Mantener la fuente legada intacta hasta completar conciliación y pruebas reales en entorno de prueba.

## Archivos de código revisados

- `src/server/00_Config.ts` · IDs de hoja, zona horaria y pestañas.
- `src/server/01_Types.ts` · contratos de estados, entradas/salidas, catálogos, pagos y reportes.
- `src/server/02_SheetRepository.ts` · lectura y escritura de Google Sheets.
- `src/server/03_Authorization.ts` · sesión Google, permisos, lock y bitácora.
- `src/server/04_RoomService.ts` · mapa, tarifas, rentas, movimientos, reversas, limpieza y reporte.
- `src/server/05_WebApp.ts` · entrada y endpoints RPC.
- `src/server/06_CatalogService.ts` · altas, cambios, bajas y validación de catálogos.
- `src/server/07_ShiftService.ts` · apertura/cierre y autorización de turno.
- `src/client/Index.html` · navegación, formularios, mapa y reporte.
- `local/smoke.mjs`, `local/dev-server.mjs`, `local/seed-data.mjs` · emulación y cobertura local revisada.
