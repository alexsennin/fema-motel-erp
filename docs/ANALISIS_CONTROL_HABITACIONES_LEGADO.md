# FEMA · Análisis del control de habitaciones legado

Fecha de revisión: 4 de octubre de 2026  
Fuente legada: [DREAMS2025 · DASHBOARD](https://docs.google.com/spreadsheets/d/10ujsmBHqalnG_HxbiuVrhp4uDDuYHNRwDVm5FjY5X18/edit?gid=240854263#gid=240854263)  
Repositorio revisado: `alexsennin/fema-motel-erp`, rama `codex/fema-vercel-docker-env`, HEAD `71d137cf362cbcb59b770bafd7fbf2185cbc11b2`.

## Alcance y límites

Se revisaron en modo lectura los metadatos del libro, `DASHBOARD!A1:Z30` y `QUERY!A1:G40`, además del código de FEMA relacionado con habitaciones, rentas, limpieza, movimientos y turnos. No se modificó Google Sheets ni se examinó el Apps Script legado asociado al libro, formularios, pestañas fuera de las dos consultadas o rangos de `QUERY` posteriores a la fila 40. Por tanto, este análisis describe lo visible y verificable, no certifica la totalidad del proceso legado ni reconcilia sus datos con FEMA.

## Qué hace hoy el control legado

El libro `DREAMS2025` tiene la pestaña `DASHBOARD` (gid `240854263`) y la pestaña `QUERY`. El tablero organiza las habitaciones en tres bloques: 1–11, 12–22 y 23–31; en total presenta 31 habitaciones. Por habitación muestra tipo/modelo, costo, número, estado, importe, entrada, permanencia, salida y tiempo restante.

El tablero deriva el estado y otros datos con fórmulas `VLOOKUP` que consultan `QUERY`; usa `NOW()` para calcular el tiempo restante. `QUERY!A:G` presenta una fila resumida por habitación con habitación, estado actual, fecha del último estado, hora de registro, horas de renta, indicador de limpieza y costo. En la lectura del 4 de octubre de 2026 se veían ocupadas las habitaciones 6–10 y 23; las demás aparecían disponibles.

Los tipos y precios visibles incluyen Sencilla ($430), Suite Confort ($1,500), Gran Suite Confort ($2,400), Junior Suite ($580), Master Suite ($650) y Contenedor 1/2 ($430). Son importes de la muestra observada y no una confirmación de vigencia comercial.

En la fila superior del tablero aparecen las etiquetas `REGISTRO`, `CORTE CAJA` y `CONSUMOS`. Con las pestañas y rangos consultados no se puede determinar cómo funcionan esas áreas ni qué otros datos de operación conservan.

## Contraste con FEMA actual

FEMA conserva Sheets + Apps Script como arquitectura: el código fuente se administra en GitHub, la interfaz es una Web App y los datos operativos se leen de un libro maestro separado. El modelo actual identifica motel, habitación, tipo, tarifa, turno, ciclo, estancia, limpieza, eventos, movimientos, pagos y bitácora mediante IDs.

| Capacidad | Hoja legada observada | FEMA actual verificado |
|---|---|---|
| Vista de habitaciones | Tablero fijo de 31 habitaciones en celdas y fórmulas | Mapa dinámico de habitaciones activas del motel del usuario |
| Estado | `DISPONIBLE`/`OCUPADA` visible; resumen de estado en `QUERY` | `DISPONIBLE`, `OCUPADA`, `SUCIA`, `LIMPIEZA` y `MANTENIMIENTO` en catálogo y ciclo |
| Registrar renta | El tablero muestra entrada, duración, salida y costo calculados desde `QUERY` | Alta de estancia vinculada a tarifa, habitación, usuario y turno abierto; guarda importe, pago, entrada y salida prevista |
| Registrar salida | Se muestra hora de salida calculada mientras está ocupada | Finaliza la estancia, registra evento y usuario, cambia a `SUCIA` |
| Limpieza | `QUERY` reserva columnas para indicador de limpieza y costo; el flujo completo no queda probado con lo consultado | Asignación de personal del mismo motel y turno horario; inicio/finalización, duración y cambio a `DISPONIBLE` |
| Tipos/tarifas | Precios visibles dentro del tablero por habitación | Catálogos separados de tipos, tarifas y habitaciones; las entradas requieren tarifa activa |
| Cambio/cancelación/edición | No se observan en las columnas consultadas | Cambio de habitación, cancelación con motivo e importe cero, agregar persona extra y editar renta con observación obligatoria |
| Reporte por turno | Etiqueta `CORTE CAJA`, pero no se examinó su contenido | Reporte de rentas ligado al turno abierto con renta, desocupación y limpieza |
| Auditoría y autoría | No aparecen IDs de usuario/recepcionista en `QUERY!A:G` | Los eventos y movimientos registran usuario/empleado y turno; cambios sensibles dejan bitácora |

La hoja legada favorece la lectura rápida de ocupación y tiempo restante. FEMA reemplaza esa cuadrícula fija con datos operativos identificados y transiciones auditables. El tablero legado no debe tratarse como una especificación completa de procesos ni como fuente automática de tarifas actuales.

## Pendientes y mejoras propuestas

### P0 · Antes de usar FEMA como reemplazo operativo

1. **Conciliar el catálogo real de habitaciones y tarifas.** Comparar las habitaciones 1–31 y sus tipos/precios legados con los catálogos de FEMA para Dreams. Resolver explícitamente diferencias, habitaciones faltantes/inactivas y vigencia de precios. No importar automáticamente los valores observados en el tablero.
   - Criterio de cierre: tabla de conciliación aprobada por el responsable del motel, con número, tipo, tarifa vigente y estado inicial; respaldo de la fuente antes de cargar.
2. **Validar el recorrido completo en el entorno local y luego con usuarios autorizados en la Web App.** La prueba Docker es un emulador con fixtures, no verifica acceso ni persistencia reales en Apps Script/Sheets.
   - Criterio de cierre: pruebas documentadas de entrada, salida, cambio, cancelación, asignación/finalización de limpieza y reporte; evidencia separada de prueba local y recorrido real.

### P1 · Consistencia del reporte y del historial de la renta

3. **Definir qué habitación y limpieza debe mostrar una renta que tuvo cambio de habitación.** En el código actual, el traslado actualiza la estancia a un nuevo ciclo/habitación, mientras la limpieza de la habitación de origen queda asociada al ciclo anterior. El reporte consulta la limpieza por el ciclo actual de la estancia; por ello puede no presentar la limpieza del cuarto que quedó sucio tras el traslado. Además, la fila presenta una sola habitación. Acordar si el reporte mostrará habitación de entrada, habitación final o todos los traslados y cómo representará la limpieza de cada habitación.
   - Criterio de cierre: un caso de prueba con traslado muestra trazabilidad de estancia y limpieza de origen/destino según la regla aprobada, sin duplicar ingresos.
4. **Acordar la semántica del corte de turno.** El reporte actual se filtra por el `IdTurno` guardado en cada estancia y muestra las rentas capturadas en ese turno, incluso si ya terminaron; una cancelación permanece con importe cero. Confirmar que esto coincide con el corte esperado y definir explícitamente cómo tratar traslados, cancelaciones y ediciones.
   - Criterio de cierre: ejemplos de turno con renta abierta, salida, cancelación, ajuste y traslado producen totales y estados aceptados por operación.
5. **Separar importe de la estancia de monto efectivamente cobrado.** La edición de la estancia actualiza el importe y también ajusta los registros de pago aplicados al nuevo importe. Antes de ampliar cobros, definir si `Pagos.Monto` representa lo pagado realmente o el importe de la renta y cómo se registran diferencias, pagos parciales o múltiples.
   - Criterio de cierre: regla contable aprobada y pruebas que demuestren que editar/cancelar no falsea el monto recibido ni el corte.

### P2 · Usabilidad y continuidad operativa

6. **Incorporar una vista compacta del tiempo transcurrido/restante y la hora de salida prevista en las tarjetas.** El tablero legado hace visible ese dato continuamente con `NOW()`. FEMA guarda la hora prevista y la entrada en la tarjeta, pero no se verificó una cuenta regresiva viva equivalente.
   - Criterio de cierre: la recepción distingue de un vistazo ocupación y vencimiento, con zona horaria del motel y sin alterar datos de la estancia.
7. **Mantener el reporte de turno como consulta principal, sin agregar historial individual en cada tarjeta.** La tabla actual cubre renta, desocupación y limpieza. Dejar fuera del alcance por ahora la navegación de historial por habitación, salvo que una necesidad de auditoría lo requiera después.
8. **Verificar paridad visual y accesibilidad operativa.** Confirmar en móvil/escritorio que todos los cuartos están localizables, que las acciones dependen del estado correcto y que un usuario con turno cerrado puede consultar, pero no operar.

## Riesgos, decisiones y siguientes pasos

- **Riesgo de datos:** la hoja legada refleja ocupaciones y tarifas en tiempo real, mientras FEMA usa otra hoja maestra. No hay reconciliación de datos en esta tarea; ambas fuentes podrían divergir.
- **Riesgo de alcance:** no se comprobó el flujo detrás de `REGISTRO`, `CORTE CAJA`, `CONSUMOS` ni los registros completos en la pestaña `QUERY`.
- **Decisión recomendada:** tratar el tablero como referencia de operación y paridad, no como fuente para importar precios ni como definición completa de corte/reportes.
- **Siguiente paso recomendado:** completar conciliación de habitaciones/tarifas con el usuario y resolver primero las decisiones P1 de traslados y pagos; después convertir los criterios anteriores en pruebas de aceptación antes de tocar datos reales.

## Fuente de implementación FEMA

- `README.md`
- `src/server/00_Config.ts`
- `src/server/04_RoomService.ts`
- `src/server/07_ShiftService.ts`
- `src/client/Index.html`
- `package.json` (pruebas Docker/mock disponibles)
