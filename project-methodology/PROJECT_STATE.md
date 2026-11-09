# Estado actual de FEMA

Fecha de instantánea: 6 de octubre de 2026.

## Estado de repositorio y metodología

- Repositorio: `alexsennin/fema-motel-erp`.
- Base revisada antes de adopción: `codex/fema-vercel-docker-env`, HEAD `6653423c6ad1d030f795c29e87987c17b0feec39`, limpio y alineado con su rama `origin`.
- Rama de adopción: `codex/adopt-arc-v1.3.2` (trabajo documental en curso durante esta instantánea).
- ARC DEVELOPMENT STANDARD v1.3.2 fue leído desde GitHub `main` en modo sólo lectura; HEAD de esa fuente al consultar: `9e1a10a28147194203cfb6a74b6dd6dbcfa6ea53`.

## Implementación presente según el código versionado

- Catálogos de hoteles, recepción, personal y turnos de limpieza, tipos, tarifas y habitaciones.
- Autenticación basada en cuenta Google activa y registro `Usuarios`; permisos por rol.
- Turnos de recepción, entradas/salidas, pagos al ingreso, cambios/cancelaciones/ediciones, personas extra, limpieza, correcciones y reporte del turno abierto.
- Módulo de inventario, catálogo de productos con 9 categorías fijas de menú, existencias en Bodega y Anaquel, traspasos, correcciones físicas y auditoría de movimientos.
- Registro de ventas y consumos a habitación con descuento automático de anaquel, vinculación con `Ventas`, `Cargos` y `Pagos`, y cuenta de estancia `StayAccount`.
- Salida de habitación con validación y liquidación obligatoria de saldo pendiente.
- Capa de datos firme: caché por ejecución, escrituras atómicas de fila completa en Sheets, fechas ISO normalizadas e idempotencia transversal con hoja `Operaciones` (`runIdempotent_`).
- Rediseño de interfaz minimalista estilo Steve Jobs: barra superior única de 52px (Habitaciones, Tienda, Corte, reloj, turno, ajustes ⚙), panel lateral unificado `Sheet` para asignación de camaristas en 1 clic con toast de deshacer, finalización de limpieza en 1 clic, cuenta de estancia con catálogo de consumo embebido, tienda con tabla limpia clicable y resumen de corte financiero.

## Riesgos y trabajo no verificado

- No se comparó este checkout con el código remoto de Apps Script ni con el deployment productivo; no se ejecutó `clasp status` ni `clasp pull`.
- La configuración versionada de `appsscript.json` declara `access: ANYONE` y `executeAs: USER_ACCESSING`; su efecto real y autenticación en el deployment no se probaron.
- La hoja maestra operativa no se consultó en esta adopción. Sus datos, esquema real y permisos no se verificaron.
- Los workflows de CI/despliegue están en `docs/github-actions/`, fuera de la ruta que GitHub Actions descubre; no se encontró ejecución activa en `.github/workflows/`.
- La prueba Docker cubre un flujo básico de entrada/reporte/salida/limpieza/turno; no es E2E navegador ni prueba de Google.
- No se desplegó ni verificó producción en esta adopción.

## Siguiente acción recomendada

Revisar y aceptar los documentos de adopción. Después atender primero la separación de carga de catálogos y la consulta de reportes de turnos cerrados; antes de cambios a pagos/auth o publicación en Apps Script, definir aceptación y entorno aislado correspondiente. Ver tareas activas en `TODO.md`.
