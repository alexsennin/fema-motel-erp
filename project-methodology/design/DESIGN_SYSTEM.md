# Sistema visual FEMA (Implementado)

Estado: diseño operativo minimalista estilo Steve Jobs implementado en `src/client/Index.html`.

## Principios visuales

- **Filosofía 1-clic:** Las acciones más frecuentes se ejecutan con un solo toque (asignar limpieza, finalizar limpieza, abrir entrada, gestionar producto), eliminando pasos y diálogos intermedios.
- **Jerarquía y calma visual:** La interfaz privilegia la información operativa inmediata. Se eliminan los diálogos con botones excesivos; las opciones secundarias se resguardan en paneles laterales contextualmente.
- **Barra superior única (52px):** Encabezado y navegación integrados en una sola franja compacta, permitiendo que el tablero de habitaciones aproveche el 100% de la pantalla útil superior.
- **Panel lateral unificado (`Sheet`):** Componente tipo drawer deslizable que mantiene al operador en contexto sin interrumpir la visión general del tablero.
- **Feedback no intrusivo:** Notificaciones toast con opción de "Deshacer" para correcciones rápidas y carga asíncrona sin parpadeos molestos.

## Identidad y paleta semántica

- Fondo de aplicación neutro claro (`#f8fafc`).
- Encabezado institucional en azul marino oscuro (`var(--nav)`).
- Estados operativos con codificación de color de alto contraste:
  - Libre / Disponible: Verde sobrio (`--st-free`, `#16a34a`).
  - Ocupada: Carmesí (`--st-busy`, `#be123c`).
  - Sucia: Ámbar cálido (`--st-dirty`, `#b45309`).
  - Limpieza: Azul rey (`--st-clean`, `#2563eb`).
  - Vencida: Rojo intenso (`--st-late`, `#dc2626`).

## Inconsistencias resueltas

- Se eliminó el diálogo `#roomActionsDialog` que acumulaba hasta 8 botones simultáneos.
- Se eliminaron las 4 cajas métricas masivas de inventario, sustituidas por una barra de resumen compacta con filtros clicables.
- Se sustituyó la tabla de inventario con múltiples botones diminutos por fila por una tabla limpia de 4 columnas donde toda la fila es interactiva.
- Se desacopló la navegación de Catálogos relegándola al menú de ajustes ⚙, permitiendo arranque directo en Habitaciones.
