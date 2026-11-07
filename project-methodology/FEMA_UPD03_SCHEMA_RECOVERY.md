# FEMA-UPD-03 — Esquema aditivo y recuperación de operaciones

**Fase:** F1 — cerrar decisiones y contratos

**Estado:** propuesta de contrato, pendiente de FEMA-UPD-01 y FEMA-UPD-02. No describe funcionalidad implementada ni autoriza cambios en hojas remotas.

**Alcance:** diccionario lógico, vínculos, invariantes, compatibilidad y protocolo de recuperación para escrituras multihoja.

## Base observada y límites

- `00_Config.ts` fija encabezados en fila 4 y datos desde fila 5. `local/seed-data.mjs` declara esquemas locales para `Cargos`, `Pagos`, `MovimientosEstancia`, `Sesiones` y `Turnos`.
- No se encontró un journal de operaciones ni un detalle persistido de fotografías de cierre. `Cortes` no está declarado en el código local.
- El repositorio no impone claves foráneas ni unicidad de base de datos; las valida el servidor. `02_SheetRepository.ts` actualiza cada celda de un parche por separado y no ofrece transacción multihoja.
- `addExtraPerson_()` y `editActiveStay_()` pueden cambiar `Pagos.Monto` de pagos aplicados. Por eso, datos de pago anteriores a este contrato no bastan para reconstruir con certeza lo realmente recibido.
- FEMA-UPD-01 aún no cierra cobros, ajustes, ventas, devolución, cortes ni la regla de turno por acción. FEMA-UPD-02 aún no cierra identidad/sesión/credenciales ni el transporte cliente-servidor de una clave estable para reintentos. Este documento fija el contenedor aditivo y deja esos valores de negocio sujetos a esas tareas.

La operación anterior debe implementarse sólo cuando sus dependencias cierren. Los nombres y columnas que siguen son un contrato propuesto para revisar; no se agregan todavía a `FEMA_CONFIG`, los tipos TypeScript ni las fixtures.

## Convenciones físicas y tipos

Todas las hojas existentes conservan sus columnas y filas. Las columnas nuevas se agregan a la derecha de la última cabecera en fila 4. Cada hoja nueva usa sus cabeceras en fila 4 y datos desde fila 5. El contrato usa estos tipos lógicos:

| Tipo | Representación en Sheets |
|---|---|
| `ID` | Texto no vacío, estable, no reutilizable. |
| `Texto` / `Enum` | Texto UTF-8; los enums sólo aceptan valores versionados. |
| `Booleano` | Booleano real, no texto `"true"`. |
| `Entero` | Número entero. |
| `Dinero` | Número decimal en moneda del hotel, redondeado a dos decimales al registrar; no se recalcula desde un catálogo. |
| `FechaHora` | Valor fecha de Sheets, presentado con `America/Mexico_City`; serializar para hash en ISO-8601 con zona. |
| `JSON` | Texto JSON canónico, claves ordenadas y codificación UTF-8. |
| `Hash256` | 64 caracteres hexadecimales SHA-256. |
| `Nulo` | Celda vacía. No equivale a cero ni a una relación inferida. |

## Diccionario propuesto

`Req.` indica obligatoriedad en una fila nueva del modelo objetivo. En filas históricas, las nuevas columnas quedan vacías salvo que se apruebe una conciliación con evidencia.

### `UsuariosHoteles` — asignación de una cuenta a un hotel y perfil

| Columna | Tipo | Req. | Regla |
|---|---|---:|---|
| `IdUsuarioHotel` | ID | Sí | Clave primaria lógica. |
| `IdUsuario` | ID | Sí | Referencia a `Usuarios.IdUsuario`. |
| `IdMotel` | ID | Sí | Referencia a `Moteles.IdMotel`; el alcance de datos queda siempre limitado a este hotel. |
| `IdPerfil` | ID | Sí | Perfil efectivo para esta asignación. Hasta FEMA-UPD-02, mapear al catálogo existente `Roles.IdRol`; no crear una segunda taxonomía de permisos en paralelo. |
| `Activo` | Booleano | Sí | Sólo una asignación activa por usuario y hotel. |
| `CreadoEn` | FechaHora | Sí | Alta de la asignación. |
| `CreadoPor` | ID | Sí | Cuenta administradora que la creó. |

Un usuario puede tener cero o más asignaciones por hotel a lo largo del tiempo, pero como máximo una activa por par usuario-hotel. La mutación de perfiles debe auditarse; cada operación conserva el perfil que tenía al autorizarla, aunque luego cambie la asignación.

### `Habitaciones` — columnas aditivas

| Columna | Tipo | Req. | Regla |
|---|---|---:|---|
| `IdOperacionUltimaActualizacion` | ID | Nulo para legado; requerido al cambiar estado/configuración en v2 | Operación que fijó la proyección actual; no sustituye eventos históricos. |
| `PersonasIncluidas` | Entero | Sí para entradas nuevas | Mínimo 1; dato configurable por habitación. |
| `PrecioPersonaExtra` | Dinero | Sí para cargos nuevos de extras | Mayor o igual a cero; precio vigente de la habitación para el nuevo cargo. |

Estas columnas fijan configuración futura. La operación guarda el precio aplicado en el cargo inmutable. No se usa el precio actual para revaluar estancias anteriores. Las filas antiguas pueden quedar vacías hasta que una persona autorizada concilie cada habitación.

### `Operaciones` — registro/journal de comandos

| Columna | Tipo | Req. | Regla |
|---|---|---:|---|
| `IdOperacion` | ID | Sí | Clave determinista primaria lógica. |
| `ClaveIdempotencia` | Texto | Sí | Clave opaca recibida por el comando; única por hotel. No se reutiliza para otra intención. |
| `IdUsuario` | ID | Sí | Actor humano autenticado que inició el comando. |
| `IdSesion` | ID | Sí | Sesión que autenticó al actor; debe corresponder a `IdUsuario`. Requerida para operaciones nuevas una vez cerrado FEMA-UPD-02. |
| `IdUsuarioHotel` | ID | Sí | Asignación que autorizó la acción en ese hotel. |
| `IdPerfil` | ID | Sí | Perfil efectivo al autorizar; no reemplaza `IdUsuario`. |
| `IdUsuarioUltimaRecuperacion` | ID / Nulo | Condicional | Actor humano que reanudó por última vez; no reemplaza al actor original. |
| `IdSesionUltimaRecuperacion` | ID / Nulo | Condicional | Sesión usada en la última recuperación autorizada. |
| `FechaHoraUltimaRecuperacion` | FechaHora / Nulo | Condicional | Momento de la última recuperación. La secuencia completa también se agrega a `Bitacora` con `IdOperacion`. |
| `IdMotel` | ID | Sí | Hotel del alcance, aun si la política aprobada permite operar sin turno. |
| `IdTurno` | ID / Nulo | Condicional | Obligatorio cuando la política de esa acción requiere turno; vacío sólo con `ContextoTurno=NO_APLICA` permitido por política aprobada. |
| `ContextoTurno` | Enum | Sí | `REQUERIDO` o `NO_APLICA`; no se infiere desde perfil o tipo de usuario. |
| `TipoOperacion` | Enum | Sí | Nombre estable de comando, versionado junto a su contrato. |
| `VersionEsquema` | Entero | Sí | Versión física interpretada por esta operación; propuesta inicial 2 para el esquema aditivo. |
| `VersionContrato` | Texto | Sí | Versión del payload y del plan de escrituras de `TipoOperacion`. |
| `HashPayload` | Hash256 | Sí | Hash de la solicitud normalizada y el plan resuelto con precios/valores congelados. |
| `PlanJSON` | JSON | Sí | Datos mínimos ya resueltos para reanudar exactamente la misma acción; no guardar contraseñas, PIN, tokens ni identidad del huésped. El acceso al libro y la retención de campos operativos sensibles requieren cerrar FEMA-UPD-02. |
| `IdsDeterministasJSON` | JSON | Sí | Mapa de IDs que producirá el comando por tipo/ordinal de entidad. |
| `Estado` | Enum | Sí | `INICIADA`, `APLICANDO`, `CONFIRMADA` o `REQUIERE_REVISION`. |
| `ProgresoJSON` | JSON | Sí | Pasos esperados y confirmados; permite contrastar el estado aunque una escritura del marcador de progreso haya fallado. |
| `ResultadoJSON` | JSON / Nulo | Condicional | Se publica sólo junto con `CONFIRMADA`; contiene IDs/resultados, no datos de huésped. |
| `CodigoIncidencia` | Texto / Nulo | Condicional | Código breve y no sensible para `REQUIERE_REVISION`; sin stack trace ni payload. |
| `FechaHoraInicio` | FechaHora | Sí | Tiempo de negocio fijado antes de la primera mutación. |
| `FechaHoraActualizacion` | FechaHora | Sí | Último avance del journal. |
| `FechaHoraConfirmacion` | FechaHora / Nulo | Condicional | Se fija sólo al confirmar. |

`IdOperacion` se deriva de `SHA-256(IdMotel + separador + ClaveIdempotencia)`; los IDs hijos, de `SHA-256(IdOperacion + tipo-entidad + ordinal)`, con prefijos legibles. Bajo `LockService`, el servidor valida unicidad de `IdOperacion` y `(IdMotel, ClaveIdempotencia)`. Se calcula `HashPayload` sobre JSON canónico versionado, incluidos los valores de catálogo ya resueltos; así un cambio posterior de precio no altera una reanudación.

### `PeriodosEstancia` — período inicial y cada extensión

| Columna | Tipo | Req. | Regla |
|---|---|---:|---|
| `IdPeriodoEstancia` | ID | Sí | Determinista dentro de la operación. |
| `IdEstancia` | ID | Sí | Referencia a `Estancias.IdEstancia`. |
| `NumeroPeriodo` | Entero | Sí | Secuencia única por estancia; 1 es el período inicial. |
| `TipoPeriodo` | Enum | Sí | `INICIAL` o `EXTENSION`. |
| `IdTarifa` | ID | Nulo | Referencia informativa a la opción elegida, no fuente de importes históricos. |
| `Minutos` | Entero | Sí | Mayor que cero; un período por operación de extensión. |
| `FechaHoraInicio` | FechaHora | Sí | Inicio efectivo del período. |
| `FechaHoraFin` | FechaHora | Sí | Fin calculado con la duración aceptada al registrar. |
| `IdCargo` | ID | Sí | Cargo inmutable con el importe efectivamente aplicado al período. |
| `IdOperacion` | ID | Sí | Operación que creó el período. |
| `IdTurno` | ID / Nulo | Condicional | Turno de la operación según la política aprobada. |

La fila es inmutable después de confirmar. Una corrección añade un movimiento compensatorio bajo una operación posterior; no cambia duración ni monto del período previo.

### Vínculos aditivos en hojas existentes

| Hoja | Columna nueva | Tipo / regla |
|---|---|---|
| `Ciclos` | `IdOperacion` | `ID` / Nulo para legado; requerido en ciclos nuevos creados por un comando. `IdTurnoInicio` existente conserva el turno aplicable. |
| `Estancias` | `IdOperacionAlta` | `ID` / Nulo para legado; identifica la creación. `IdTurno` existente conserva su semántica original. |
| `Estancias` | `IdOperacionUltimaActualizacion` | `ID` / Nulo; proyección de última mutación, no historia. |
| `Turnos` | `IdOperacionApertura` | `ID` / Nulo para legado; identifica la operación que creó el turno. |
| `Turnos` | `IdOperacionCierre` | `ID` / Nulo para legado; permite verificar/reanudar el cierre asociado sin inferirlo sólo por estado/fecha. |
| `EventosHabitacion` | `IdOperacion` | `ID` / Nulo para legado; requerido en eventos nuevos de un comando. `IdTurno` existente se valida contra `Operaciones`. |
| `MovimientosEstancia` | `IdOperacion` | `ID` / Nulo para legado; requerido en cada movimiento nuevo. |
| `MovimientosEstancia` | `IdTurno` | `ID` / Nulo sólo en legado o acción aprobada sin turno; requerido cuando la política de la acción lo exige. |
| `Cargos` | `IdOperacion` | `ID` / Nulo para legado; requerido en cargos nuevos. |
| `Cargos` | `IdTurno` | Ya existe localmente; mantenerla. Nula sólo para legado o acción aprobada sin turno. |
| `Pagos` | `IdOperacion` | `ID` / Nulo para legado; requerido para cada nuevo registro de cobro. |
| `Pagos` | `IdTurno` | Ya existe localmente; mantenerla y aplicar la regla de turno del comando. |
| `Bitacora` | `IdOperacion` | `ID` / Nulo para legado; vincula la auditoría al journal. `IdSesion` existente se mantiene. |

En filas nuevas, `Cargos.Cantidad`, `PrecioUnitario` y `Total` guardan el valor aplicado al momento del cargo. `Pagos.Monto` registra el importe declarado recibido en ese acto y es inmutable para el nuevo contrato. `Estancias.PrecioFinal` queda como proyección informativa; no prueba ingreso recibido. No se cambia el significado retrospectivo de filas antiguas.

### `Cortes` — cabecera de cierre por turno

| Columna | Tipo | Req. | Regla |
|---|---|---:|---|
| `IdCorte` | ID | Sí | Determinista desde el turno y comando de cierre. |
| `IdMotel` | ID | Sí | Debe coincidir con el turno. |
| `IdTurno` | ID | Sí | Una cabecera por turno. |
| `Estado` | Enum | Sí | `PREPARANDO` o `CERRADO`; la vista sólo acepta `CERRADO` con operación confirmada. |
| `IdUsuarioCierre` | ID | Sí | Actor que cerró. |
| `IdSesionCierre` | ID | Sí | Sesión autenticada usada al cerrar. |
| `FechaHoraCierre` | FechaHora | Sí | Fijada en el plan de la operación. |
| `CantidadHabitaciones` | Entero | Sí | Número esperado de habitaciones en la fotografía. |
| `HashFotografia` | Hash256 | Sí | Hash de las filas de detalle ordenadas por `IdHabitacion`. |
| `IdOperacion` | ID | Sí | Comando de cierre que captura y confirma la fotografía. |
| `VersionFotografia` | Entero | Sí | Versión del formato del detalle. |

### `CorteHabitaciones` — fotografía por habitación

| Columna | Tipo | Req. | Regla |
|---|---|---:|---|
| `IdCorteHabitacion` | ID | Sí | Determinista por corte/habitación. |
| `IdCorte` | ID | Sí | Referencia a `Cortes.IdCorte`. |
| `IdMotel` | ID | Sí | Debe coincidir con el corte y la habitación. |
| `IdHabitacion` | ID | Sí | Una fila por habitación activa del hotel en el instante de cierre. |
| `EstadoHabitacion` | Enum | Sí | Estado capturado (`DISPONIBLE`, `OCUPADA`, `SUCIA`, `LIMPIEZA`, `MANTENIMIENTO`). |
| `IdCiclo` | ID / Nulo | Condicional | Ciclo vigente capturado. |
| `IdEstancia` | ID / Nulo | Condicional | Estancia activa capturada, si aplica. |
| `NumeroHabitacionSnapshot` | Texto | Sí | Valor visible congelado, aunque después se edite el catálogo. |
| `IdOperacion` | ID | Sí | Operación de cierre que creó la fila. |

La fotografía documentada aquí es operativa (estado de habitaciones), no un arqueo financiero. El contenido de un corte financiero, las diferencias y la conciliación siguen sujetos a FEMA-UPD-01. Sus futuros importes deberán proceder de cargos, cobros y ventas confirmados, sin volver a tarifarios actuales.

## Relaciones e invariantes

1. **Separación de identidad:** `IdSesion`, `IdUsuario`, `IdUsuarioHotel`/`IdPerfil`, `IdMotel` e `IdTurno` son dimensiones distintas. El perfil concede permisos, no sustituye al actor. Sesión, usuario y asignación deben coincidir al autorizar; hotel de operación y hotel de turno también.
2. **Turno:** `IdTurno` no se deduce del actor ni del perfil. `NO_APLICA` sólo se acepta para un tipo de operación expresamente autorizado por FEMA-UPD-01/015. Hasta esa decisión, una escritura administrativa sin turno no se habilita por defecto.
3. **Idempotencia y actor:** mismo hotel + clave + tipo + hash, presentado por el actor original aún autorizado, devuelve el resultado confirmado o reanuda el mismo plan. Una sesión nueva del mismo actor se anota como recuperación. Otro actor no ve el resultado ni reanuda por inferencia; sólo podrá hacerlo mediante una política explícita de recuperación autorizada, que conserva actor original y agrega actor/sesión de recuperación a `Operaciones` y `Bitacora`. Clave con hash/tipo distinto se rechaza como conflicto. No se crean IDs al azar al reintentar.
4. **Confirmación:** un registro de negocio con `IdOperacion` es visible como resultado confirmado sólo si su operación está `CONFIRMADA`. Cada escritura es comprobable por su ID determinista y contenido esperado. Un conflicto de contenido no se sobreescribe: pasa a revisión.
5. **Inmutabilidad histórica:** movimientos, períodos, cargos, pagos, eventos y fotografías confirmados se añaden; no se editan ni eliminan para corregir. La corrección crea otra operación y asientos compensatorios conforme a la política aprobada.
6. **Importes:** tarifas y configuración por habitación sólo cotizan operaciones nuevas. Cargo conserva precio/cantidad/total aplicados; pago conserva el monto recibido que reporta el actor; ambos se relacionan al turno y operación. Nunca se iguala cargo, precio final de estancia y efectivo realmente recibido.
7. **Cortes:** un turno tiene como máximo un corte confirmado. La fotografía debe contener exactamente el conjunto de habitaciones existente al cierre, coincidir con el conteo y el hash, y quedar vinculada a actor, sesión, hotel, turno y operación.
8. **Referencias por hotel:** estancia, ciclo, habitación, cargo, corte y turno referenciados deben pertenecer al `IdMotel` de la operación. Sheets no aplica FK/unique; el servicio las verifica bajo lock antes y durante recuperación.
9. **Actualización de proyecciones:** cada cambio de celdas de una misma fila se manda como una sola escritura de rango y se verifica por lectura posterior. Esto reduce puntos de falla, pero no convierte escrituras multihoja en una transacción.

## Versiones, columnas faltantes y transición

- El estado físico actual se trata como esquema legado v1, sin afirmar que la app hoy lo registre como versión. La propuesta aditiva es v2; `Operaciones.VersionEsquema` y `VersionContrato` fijan cómo interpretar cada plan pendiente. Cambios incompatibles requieren nueva versión de contrato, no reinterpretación silenciosa.
- Antes de crear `Operaciones`, el servidor verifica todas las hojas/columnas requeridas por el comando. Si falta una hoja o cabecera, rechaza la escritura sin mutaciones de negocio y devuelve un error de incompatibilidad de esquema. No crea ni renombra columnas automáticamente durante una operación.
- Columnas nuevas vacías en filas antiguas significan “no registrado/no conciliado”; jamás se completan a partir de precios actuales, actor probable, sesión aproximada o turno cercano. Las columnas existentes no se renombran ni se borran.
- Las lecturas de legado pueden seguir usando sus columnas v1 si están presentes. Un reporte monetario que mezcle legado no reconstruible y operaciones v2 indica el importe histórico como incompleto/no disponible; no lo presenta como cero ni como total exacto.
- Para activar escrituras v2 se requiere primero, en copia local/aislada, agregar cabeceras y hojas; conciliar manualmente asignaciones `UsuariosHoteles` y valores por habitación; desplegar el servicio que preflight-ea el esquema; y validar los permisos/turnos de FEMA-UPD-01/02. Los caminos actuales que reescriben `Pagos.Monto` deben dejar de ser escritores antes de habilitar operaciones v2. No hay backfill automático de `IdOperacion`, `IdSesion`, precios, cargos ni pagos anteriores.
- Si una operación pendiente tiene versión desconocida, plan/hash ausente o faltan cabeceras requeridas, se bloquea el ámbito afectado y se deriva a revisión; no se convierte ni descarta su progreso.

## Escritura y recuperación sin prometer rollback

1. Bajo `LockService`, autenticar actor/sesión, asignación, permiso, hotel, turno y precondiciones. Preflight de todas las cabeceras antes del primer cambio de datos.
2. Resolver precios/configuración una vez; canonicalizar y persistir `Operaciones` en `INICIADA`, incluyendo hash, plan congelado, IDs deterministas, actor/contextos y versiones. Si no se puede confirmar esa fila, no empezar escrituras de negocio.
3. Marcar `APLICANDO`; escribir una entidad por paso. Cada paso lleva `IdOperacion` e ID determinista, y después actualiza `ProgresoJSON` en otra escritura. Si la escritura de entidad o el marcador de progreso falla, la recuperación inspecciona la entidad destino por ID/contenido, no supone éxito ni la duplica.
4. Si se detecta una escritura faltante, repetirla con el mismo contenido e ID. Si ya existe con contenido igual, reconocerla como aplicada; si difiere, marcar `REQUIERE_REVISION` sin sobrescribirla.
5. Verificar filas y relaciones esperadas. Escribir resultado y estado `CONFIRMADA` al final. Sólo entonces responder éxito/mostrar la nueva vista.
6. En error o timeout incierto con una operación aún `INICIADA` o `APLICANDO`, conservarla. Bloquear nuevas escrituras y lecturas operativas del hotel que dependan de proyecciones mutables; mostrar una pantalla de recuperación. Se permiten el diagnóstico del journal y lecturas de cortes/operaciones ya confirmados. No abrir un nuevo turno hasta confirmar el cierre anterior.
7. El transporte de FEMA-UPD-02 debe conservar y reenviar la misma clave junto al comando durante un reintento, incluido un timeout; no generar clave nueva en el servidor al repetir. La recuperación valida payload/hash y busca primero la operación existente. Una respuesta perdida después de confirmar devuelve `ResultadoJSON` sin repetir escrituras. No reintentar RPC no idempotentes en automático.
8. No hay rollback automático de Sheets. Si el efecto externo (por ejemplo, entrega de efectivo/cobro en terminal) pudo ocurrir sin fila de pago confirmada, marcar `REQUIERE_REVISION`; verificar una fuente independiente y registrar una operación correctiva autorizada. No inferir efectivo real desde `Pagos.Monto` sobrescrito, `PrecioFinal` o tarifas.

El bloqueo por hotel sólo protege a los clientes que pasan por el servicio. La hoja debe restringirse para evitar ediciones manuales concurrentes a las tablas operativas; ninguna afirmación de atomicidad cubre un editor externo.

## Simulación focal en papel

Fixture enteramente ficticio. La regla común se aplica después de **cada** escritura listada y de cada escritura de avance a `ProgresoJSON`: si falla esa escritura o la siguiente, `Operaciones` queda sin confirmar; al mismo comando, clave y hash, se verifica la fila de ID determinista y se omite sólo si su contenido coincide. Si el marcador de progreso está atrasado, la entidad destino se verifica antes de repetir el paso. El hotel permanece bloqueado hasta confirmar o entrar a revisión. Si la última escritura de confirmación ocurrió pero el cliente perdió la respuesta, se devuelve el resultado persistido. No se ejecutaron estas secuencias en Sheets ni contra Producción.

| Flujo | Escrituras ordenadas (cada una es un punto independiente de falla) | Recuperación y control histórico |
|---|---|---|
| **Entrada** | Escenario ficticio: período de 6 horas a $500 y una persona extra a $120; pago declarado recibido por $620. 1) `Operaciones:INICIADA`; 2) `Operaciones:APLICANDO`; 3) `Estancias`; 4) `Ciclos`; 5) `EventosHabitacion`; 6) proyección `Habitaciones`; 7) período inicial; 8) cargo de hospedaje; 9) cargo de extras; 10) `Pagos`; 11) `Bitacora`; 12) `Operaciones:CONFIRMADA`. | Fallo después de cualquiera de 1–11 se reanuda por ID/hash; evento/cargo/pago existente igual no se duplica. Habitación sólo se muestra nueva tras confirmación. `PeriodosEstancia.Minutos`, cargos y pago congelan sus valores; una tarifa posterior no recalcula entrada. Si no es posible verificar si se recibió dinero fuera del sistema, revisión manual. Valores sólo ilustrativos, no tarifas aprobadas. |
| **Persona extra** | Escenario ficticio: durante una estancia activa se registra una persona a $120. 1) inicio; 2) aplicar; 3) `MovimientosEstancia`; 4) `Cargos` por una unidad y precio unitario de $120; 5) `Pagos` sólo si se confirma recepción; 6) proyección de estancia; 7) `Bitacora`; 8) confirmar. | Falla después de cada paso conserva la operación pendiente y reutiliza IDs. Precio actual de habitación no altera el cargo guardado. El medio de pago y la secuencia cobro/cargo aún requieren FEMA-UPD-01. $120 es ilustrativo. |
| **Extensión** | Escenario ficticio: una estancia de 6 horas agrega un período de 6 horas por $500. 1) inicio; 2) aplicar; 3) nuevo `PeriodosEstancia` con número 2 y 360 minutos; 4) `MovimientosEstancia`; 5) `Cargos` por $500; 6) `Pagos` si se recibió; 7) actualización de salida prevista en `Estancias`; 8) `Bitacora`; 9) confirmar. | En cada frontera, reanudar sólo el mismo período/cargo/pago. Si el período ya existe con otra duración o precio, ir a revisión. Los períodos previos conservan minutos e importe aplicado aunque cambie el catálogo. Precio/medio de pago requieren FEMA-UPD-01. Importe ilustrativo. |
| **Cierre** | Escenario ficticio: cierre de T-10 captura H-01 `OCUPADA` y H-02 `DISPONIBLE`. 1) inicio; 2) aplicar con hora y conjunto de habitaciones congelados; 3) cabecera `Cortes:PREPARANDO`; 4…N) una `CorteHabitaciones` por habitación; N+1) cerrar `Turnos`; N+2) marcar `Cortes:CERRADO`; N+3) `Bitacora`; N+4) confirmar. | Si falla tras cada fila, el conteo/hash detecta detalle ausente o distinto; sólo se agregan filas deterministas faltantes. Turno nuevo y vistas de operación siguen bloqueados hasta confirmar. El corte cerrado conserva su foto anterior; no depende del estado actual ni tarifas futuras. No se calculan importes de arqueo hasta cerrar FEMA-UPD-01. |
| **Ajuste** | Escenario ficticio: el importe a cobrar pasa de $500 a $550. 1) inicio; 2) aplicar; 3) movimiento inmutable con motivo/antes/después; 4) cargo de ajuste por $50; 5) pago adicional de $50 sólo si ocurrió; 6) actualizar la proyección de estancia; 7) `Bitacora`; 8) confirmar. | Si falla después de cada escritura, no se modifica el pago original; reanudación verifica evento/cargo/pago. Una disminución del importe no equivale a reembolso: cualquier devolución requiere su propio registro, actor y política FEMA-UPD-01. El ejemplo no aprueba reglas de ajuste ni reembolso. |
| **Venta** | Escenario ficticio para probar el envoltorio, no la política: una bebida, una unidad a $30 y una salida de una unidad de stock. A la espera de tablas/reglas FEMA-UPD-01/012: 1) inicio; 2) aplicar; 3) cabecera de venta; 4…N) detalle(s) con precio aplicado; N+1) movimiento(s) de inventario; N+2) proyección de existencias; N+3) `Pagos` si se recibió; N+4) bitácora; N+5) confirmar. | Ante fallo tras cada paso, la venta no se muestra como confirmada y el hotel queda en recuperación; detalle, movimiento de existencias y cobro usan IDs deterministas y precio/cantidad del acto. No se decide aquí venta ligada, stock negativo, devoluciones ni costo. `IdTurno` se captura si la regla aprobada lo requiere. `NO_APLICA` para recepción administrativa de inventario sólo se habilita después de aprobar exactamente esa regla; hoy la operación se rechaza antes de escribir. $30 es ilustrativo. |

La simulación valida el protocolo de reanudación por cada límite de escritura, no atomicidad física. Un registro parcial puede estar visible al editor de Sheets; la aplicación lo oculta detrás del estado pendiente. Si una persona ya recibió o entregó dinero mientras el registro permanece incierto y `Pagos` no tiene fila confirmable, la recuperación automática se detiene en `REQUIERE_REVISION`: no crea un cobro por reintento sin evidencia independiente. Sólo una conciliación autorizada puede completar o compensar la operación; no existe cálculo que recupere el hecho desde una celda sobrescrita.

## Criterios de entrada a implementación

- FEMA-UPD-01 cierra el momento/actor de cargo y cobro, ajuste/reembolso, ventas, contenido financiero del corte y la matriz por acción de `ContextoTurno`.
- FEMA-UPD-02 cierra identidad, perfil por hotel, sesión, expiración, recuperación, acceso al `PlanJSON` y el transporte/preservación de la clave de idempotencia.
- Después, implementar schema v2 y el journal como unidad independiente. Activar comandos financieros uno por uno, con deduplicación y puertas de lectura por hotel.
- El estado actual de Apps Script/Sheets, sus datos y el deployment no se inspeccionaron ni modificaron en esta tarea.
