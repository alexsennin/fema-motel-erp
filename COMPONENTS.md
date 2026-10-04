# Componentes observados

Inventario de `src/client/Index.html`; los nombres son descripciones y no significan que existan como componentes reutilizables independientes.

| Componente/patrón | Uso |
|---|---|
| Header y sesión | Marca FEMA, descripción corta, nombre de usuario |
| Navegación principal | Botones de Catálogos, Habitaciones y Reporte |
| Tabs de catálogo | Selección de entidad catalogada |
| Tabla de catálogo | Encabezado, filas, estado Activo/Baja y acciones |
| Botones | Primario, secundario, peligro, salida y limpieza; acciones se deshabilitan según estado/permisos del estado cargado |
| Tarjeta de habitación | Número, tipo, estado, detalle contextual y acciones válidas |
| Panel de turno | Estado operativo, datos del turno y controles de apertura/cierre |
| Reporte tabular | Grupos de renta, salida y limpieza; resumen del turno |
| Dialog/form | Formularios para catálogo, entrada, salida, persona extra, editar renta, traslado, cancelación y asignar limpieza |
| Toast/mensaje | Confirmación breve y error; estado vacío/carga/error en contenedores |
| Footer | FEMA, año, versión de compilación y atribución IntegraTech |

No se encontró una biblioteca de componentes ni pruebas visuales automatizadas. La autorización final corresponde siempre al servidor; deshabilitar una acción en cliente no sustituye el control de API.
