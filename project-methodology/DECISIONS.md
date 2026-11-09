# Decisiones FEMA

Las decisiones registran acuerdos duraderos, no propuestas ni actividad de cada sesión.

## DEC-001 — Adoptar ARC DEVELOPMENT STANDARD v1.3.2

- Fecha: 2026-10-06.
- Estado: aceptada por solicitud del usuario.
- Contexto: el usuario pidió revisar GitHub y adoptar el estándar más actual. En el repositorio fuente se identificó `standards/v1.3.2/` como versión vigente, con fecha 2026-10-06.
- Opciones: mantener sin adopción o adoptar la versión vigente. Se adopta v1.3.2.
- Decisión/razón: v1.3.2 pasa a ser la metodología del repo; fuente `alexsennin/alex-development-standard` se mantiene sólo lectura. No copiar documentos canónicos.
- Consecuencias: documentos de proyecto bajo `project-methodology/`, `AGENTS.md` en raíz; Codex Desktop aplica routing manual de compatibilidad, no se presupone AXIOM.
- Sustituye: adopción ALEX DEVELOPMENT STANDARD v1.0 registrada en la rama `codex/adopt-alex-standard-v1`; v1.0 ya no es la versión activa para esta rama.

## DEC-002 — Google Apps Script + Sheets sigue como stack vigente

- Fecha: 2026-10-06.
- Estado: vigente como arquitectura actual; no autoriza despliegues ni migraciones.
- Contexto: el usuario pidió continuar con Apps Script/Sheets y la implementación versionada confirma ese stack.
- Opciones: conservar el stack actual o iniciar migración. Se conserva.
- Consecuencias: nuevos cambios se evalúan dentro de ese stack hasta una decisión explícita distinta; las limitaciones de Sheets se deben resolver con controles adecuados, no con supuestos de transacciones SQL.
- Alcance: arquitectura de aplicación/datos; no impide estudiar alternativas como propuesta separada.

## DEC-003 — Conservar la URL estable de Apps Script

- Fecha: 2026-10-06.
- Estado: requisito operativo aceptado; procedimiento de actualización aún no verificado.
- Contexto: el producto debe redesplegar en el mismo enlace `/exec`.
- Decisión: una publicación futura debe actualizar el deployment estable y comprobar el mismo enlace; no crear deployment nuevo por comodidad.
- Consecuencias: requiere cerrar FEMA-009 antes de automatizar o desplegar.

## DEC-004 — Vercel se limita a redirect de entrada

- Fecha: 2026-10-06.
- Estado: configuración/documentación observada; destino vivo no verificado en esta adopción.
- Contexto: `project.config.json`, `vercel-entrypoint/` y README describen proyecto Vercel separado para `fema.integratech.app`.
- Decisión: mantener responsabilidad acotada de redirect hacia Apps Script; no presentarlo como proxy ni como hospedaje del backend.

## DEC-005 — Docker local usa sólo fixtures aislados

- Fecha: 2026-10-06.
- Estado: vigente en configuración revisada.
- Contexto: `docker-compose.yml`, `local/` y README muestran un emulador local que no conecta a Google.
- Decisión: conservar el emulador aislado para desarrollo y pruebas; no cargar datos operativos/credenciales reales.

## DEC-006 — Módulo de inventario y ventas acoplado a habitación

- Fecha: 2026-11-06.
- Estado: implementado y verificado en emulador local.
- Contexto: el usuario requirió control de existencias en bodega y anaquel para 68 productos de menú, traspasos auditables, corrección física y registro de consumos a habitación con bloqueo de precio.
- Decisión: implementar catálogo maestro ordenado por 9 categorías fijas (`CategoriasProducto`), control de existencias en hoja `Inventario`, auditoría en `MovimientosInventario` y ventas directas con deducción de anaquel vinculadas a la estancia y cargadas a `Ventas` y `Cargos`.
- Consecuencias: las ventas a habitación descuentan existencias físicas al confirmar; no se permite vender si no hay estancia activa ocupada para asociar la cuenta.

## DEC-007 — Idempotencia transversal y liquidación en salida

- Fecha: 2026-11-07.
- Estado: implementado y verificado en pruebas unitarias y de humo.
- Contexto: Google Sheets no ofrece atomicidad transaccional; reintentos de red o doble clic en la interfaz podían generar cargos duplicados o desincronización de inventario. Además, se desocupaban habitaciones dejando consumos sin cobrar.
- Decisión: incorporar la hoja `Operaciones` con el helper `runIdempotent_` bajo `LockService` para validar unicidad por clave (`idempotencyKey`). Consolidar el estado de cuenta mediante `StayAccount` e impedir la liberación de una habitación a `SUCIA` si presenta saldo pendiente, a menos que se registre el pago de liquidación en el mismo acto.
- Consecuencias: previene dobles cargos y pérdidas financieras por cobros omitidos en recepción.

## DEC-008 — Rediseño minimalista de interfaz Steve Jobs (1-clic)

- Fecha: 2026-11-07.
- Estado: implementado en cliente `Index.html`.
- Contexto: el usuario reportó sobrecarga visual de ventanas emergentes y opciones secundarias con el diálogo de 8 botones (`#roomActionsDialog`).
- Decisión: eliminar `#roomActionsDialog` y adoptar un panel lateral deslizable (`Sheet`) contextual con flujo 1-clic por estado:
  - Habitación Disponible: apertura directa de entrada.
  - Habitación Sucia: listado de camaristas para asignación en 1 toque con opción de deshacer en toast.
  - Habitación en Limpieza: finalización en 1 toque con opción de deshacer.
  - Habitación Ocupada: cuenta de estancia, saldo en alto contraste, catálogo de consumo embebido y cobro/liberación directo.
  - Barra superior unificada de 52px con tabs `Habitaciones · Tienda · Corte` pegada a las flashcards de habitaciones.
  - Tienda limpia con tabla de 4 columnas clicable y Sheet de producto.

## Registro previo de metodología

La adopción ALEX v1.0 de 2026-10-04 se conserva como antecedente en la rama `codex/adopt-alex-standard-v1`; fue decisión correcta para el alcance de entonces. Esta adopción la sustituye en la rama actual y no copia archivos canónicos de ninguna versión del estándar.
