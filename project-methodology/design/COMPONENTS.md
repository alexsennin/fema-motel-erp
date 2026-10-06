# Componentes y patrones FEMA (observados)

Fuente: HTML/CSS/JavaScript inline de `src/client/Index.html`; no existe un sistema de componentes JavaScript separado.

| Patrón | Clases/elementos | Uso y estados |
|---|---|---|
| Navegación | `nav`, `.nav-btn` | Cambia vistas; activa una clase `active`. |
| Tabs de catálogo | `.catalog-tabs`, `.catalog-tab` | Selección entre siete listas/catálogos. |
| Panel/tarjeta | `.card`, `.room` | Contenedores de turno/reporte y cada habitación. |
| Estado | `.status.on`, `.status.off`, `[data-status]` | Disponibilidad, baja/activo, estado de habitación. |
| Botones | `.btn`, `.primary`, `.secondary`, `.danger`, `.exit-btn`, `.cleaning-btn` | Acciones; `.btn:disabled` baja opacidad y bloquea click. |
| Tablas | `.table-wrap`, `table`, `.report-table` | Catálogos y reporte; overflow horizontal. |
| Captura | `<dialog>`, `.form`, `.field`, `.entry-summary` | Formularios de catálogo, entrada/salida, limpieza, traslado, cancelación y edición. |
| Feedback | `.message`, `.error`, `.empty`, `.toast` | Carga, error, vacío y notificación temporal. |

## Reglas de interacción observadas

- Botones operativos se deshabilitan según estado de habitación y propiedad del turno.
- Formularios validan requeridos en navegador y el backend revalida condiciones importantes.
- Acciones de riesgo usan `confirm()`; errores del servidor aparecen en toast.
- No todos los flujos tienen pruebas de teclado/foco, cierre Escape, lector de pantalla o prevención de pérdida de formularios; verificar antes de cambiar dialogs.
