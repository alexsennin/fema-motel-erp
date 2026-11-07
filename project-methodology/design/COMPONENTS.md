# Componentes y patrones FEMA (observados)

Fuente: HTML/CSS/JavaScript inline de `src/client/Index.html`; no existe un sistema de componentes JavaScript separado.

| Patrón | Clases/elementos | Uso y estados |
|---|---|---|
| Navegación | `nav`, `.nav-btn` | Cambia vistas (Habitaciones por defecto, Reporte, Catálogos); activa una clase `active`. |
| Tablero de habitaciones | `.rooms-grid-numeric`, `.room` | Vista limpia directa pegada al menú superior sin barras intermedias; tablero de 8 columnas x 4 filas uniformes. |
| Tabs de catálogo | `.catalog-tabs`, `.catalog-tab` | Selección entre siete listas/catálogos. |
| Panel/tarjeta | `.card`, `.room`, `.rack-header`, `.rack-body`, `.rack-hero-center`, `.rack-card-content` | Contenedores de resumen de reporte y tarjeta flash-card motelera cuadrada (proporción 1:1; franja superior en 1 sola línea fija con precio y texto auto-ajustable; cuerpo con color de estado continuo al 100% en todas las tarjetas; datos de limpieza y ocupada integrados directamente sobre el color con texto en blanco de alto contraste; cuadrícula optimizada de 8 columnas x 4 filas uniformes cubriendo la mayor área posible hasta 1800px con separación amplia de 16px; efecto táctil al clic con resplandor en hover). |
| Control de turno | `#headerShiftSlot`, `.header-shift-btn.close-shift`, `.header-shift-btn.open` | Botón contextual integrado en el encabezado superior para abrir o cerrar turno sin ocupar espacio vertical sobre el tablero de habitaciones. |
| Estado | `.status.on`, `.status.off`, `.room-status-badge`, `[data-status]` | Disponibilidad, baja/activo, estado de habitación y etiqueta visual por estado. |
| Botones | `.btn`, `.primary`, `.secondary`, `.danger`, `.exit-btn`, `.cleaning-btn` | Acciones; `.btn:disabled` baja opacidad y bloquea click; `:focus-visible` accesible. |
| Tablas | `.table-wrap[role="region"][tabindex="0"]`, `table`, `.report-table` | Catálogos y reporte; scroll horizontal accesible con encabezado fijo (`thead sticky`). |
| Captura | `<dialog>`, `.form`, `.field`, `.entry-summary` | Formularios modales con contención de overscroll y fondo oscurecido; soporte de cotización defensiva e incremento de extras. |
| Gestión de habitación | `#roomActionsDialog`, `.room-actions-content`, `.modal-actions-grid` | Ventana emergente activada al hacer clic o presionar Enter en una tarjeta de habitación; concentra las acciones operativas contextuales y su información detallada. |
| Espera y feedback RPC | `#loadingModal`, `.loading-card`, `.loading-spinner-ring`, `.loading-badge-tag`, `.loading-progress-bar` | Ventana modal nativa de alta prioridad para llamadas remotas a Apps Script / Sheets. Proporciona retroalimentación contextual (`CARGANDO`, `PROCESANDO`, `REVISANDO`, `GUARDANDO`), previene doble clic accidental en top-layer y evita cierre accidental por Escape durante el tránsito. |
| Módulo de Inventario | `#inventoryView`, `.inventory-metric-cards`, `.inv-card`, `.inventory-filter-bar`, `.inv-cat-tabs`, `.inventory-table`, `.stock-badge` | Vista completa de inventario con métricas en tiempo real (total productos, unidades bodega, unidades anaquel, agotados), pestañas de categorías, buscador y tabla de productos con acciones directas. |
| Modal de Ventas a Habitación | `#saleModal`, `.modal-large`, `.sale-room-bar`, `.sale-columns-grid`, `.sale-category-chips`, `.sale-products-grid`, `.sale-prod-card`, `.sale-cart-table`, `.qty-control`, `.sale-summary-box` | Modal optimizado de ventas a habitación ocupada con dos columnas (catálogo interactivo con chips y carrito en tiempo real). Precio bloqueado del catálogo, cantidad editable con botones `+`/`-`, cargo a cuenta o pago inmediato, y descuento directo de anaquel. |
| Modales de Operación de Stock | `#productEditorModal`, `#transferStockModal`, `#adjustStockModal`, `#movementsModal` | Diálogos para altas de nuevos productos, modificación de precios, traspasos bidireccionales Bodega ↔ Anaquel, corrección física de stock con motivo obligatorio y consulta de auditoría de movimientos. |
| Feedback | `.message`, `.error`, `.empty`, `.toast` | Carga, error, vacío y notificación temporal tipo toast con animación de entrada. |

## Reglas de interacción observadas

- Botones operativos se deshabilitan según estado de habitación y propiedad del turno.
- Formularios validan requeridos en navegador y el backend revalida condiciones importantes.
- Acciones de riesgo usan `confirm()`; errores del servidor aparecen en toast.
- No todos los flujos tienen pruebas de teclado/foco, cierre Escape, lector de pantalla o prevención de pérdida de formularios; verificar antes de cambiar dialogs.
