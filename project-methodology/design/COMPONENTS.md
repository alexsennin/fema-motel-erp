# Componentes y patrones FEMA (Implementados)

Fuente: HTML/CSS/JavaScript modular de `src/client/Index.html`.

| Patrón | Clases/elementos | Uso y estados |
|---|---|---|
| Barra superior unificada | `header.app-bar`, `.app-bar-left`, `.brand-logo`, `.app-nav`, `.nav-btn` | Franja de 52px sticky con FEMA, pestañas (`Habitaciones`, `Tienda`, `Corte`), reloj, píldora de turno y menú ⚙. |
| Menú de ajustes | `.settings-wrap`, `.settings-btn`, `.settings-dropdown`, `.settings-item` | Popover desplegable para acceso a Catálogos del sistema y verificación administrativa de inventario. |
| Tablero de habitaciones | `.rooms-grid-numeric`, `.room` | Vista limpia directa pegada al menú superior sin barras intermedias; tablero de 8 columnas x 4 filas uniformes. |
| Tarjeta flash-card | `.room`, `.rack-header`, `.rack-body`, `.rack-hero-center`, `.rack-card-content` | Proporción 1:1; franja superior con precio y nombre; cuerpo con color de estado sólido al 100%; tiempo restante y placas; clic enruta directamente al panel correspondiente. |
| Panel lateral unificado | `#sheet`, `dialog.sheet`, `.sheet-header`, `.sheet-body`, `.sheet-footer` | Drawer lateral deslizante a la derecha (440px en desktop / inferior en móvil). Unifica la interacción contextual de habitaciones y productos. |
| Asignación de camaristas | `.staff-picker-wrap`, `.staff-picker-btn`, `.staff-picker-name` | Panel lateral de habitación sucia: lista de camaristas para asignación en 1 toque con toast de deshacer. |
| Finalización de limpieza | `.clean-finish-wrap`, `.sheet-clean-summary`, `.clean-stat-box` | Panel lateral de habitación en limpieza: minutos transcurridos y botón para finalizar a Disponible en 1 toque. |
| Cuenta de estancia | `.stay-sheet-wrap`, `.stay-balance-card`, `.stay-items-list`, `.stay-item-row` | Panel lateral de habitación ocupada: balance de cuenta en alto contraste, desglose de renta/extras/consumos, y cobro directo. |
| Consumo embebido | `.sheet-picker-zone`, `.sheet-picker-chips`, `.sheet-picker-grid` | Catálogo interactivo embebido dentro de la cuenta de la habitación para cargar productos con un solo clic. |
| Tabla limpia de tienda | `.inventory-table-clean`, `.inv-row-clickable`, `.inv-badge-anaquel` | Tabla de 4 columnas (Producto, Precio, Anaquel, Bodega). Fila completa interactiva sin botones secundarios. |
| Resumen de inventario | `.inv-summary-bar`, `.inv-summary-text`, `.inv-filter-pills`, `.inv-pill` | Barra compacta de conteo total, bajo stock y agotados, con píldoras de filtrado inmediato. |
| Gestión de producto | `.prod-sheet-container`, `.sheet-stock-grid`, `.sheet-stepper-row` | Panel lateral para surtir anaquel desde bodega con stepper, editar nombre/precio y registrar corrección física obligatoria. |
| Resumen financiero de corte | `.corte-summary-grid`, `.corte-card`, `.corte-card-title`, `.corte-card-val` | Tarjetas de balance del turno: Total recaudado, Efectivo (caja chica), Tarjeta/Terminal y Conteo de habitaciones. |
| Notificación con Deshacer | `.toast`, `#toast`, `.toast-undo-btn` | Aviso contextual emergente con botón de acción reversa para mitigar errores de clic rápido. |

## Reglas de interacción observadas

- Botones operativos se deshabilitan según estado de habitación y propiedad del turno.
- Formularios validan requeridos en navegador y el backend revalida condiciones importantes.
- Acciones de riesgo usan `confirm()`; errores del servidor aparecen en toast.
- No todos los flujos tienen pruebas de teclado/foco, cierre Escape, lector de pantalla o prevención de pérdida de formularios; verificar antes de cambiar dialogs.
