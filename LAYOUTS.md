# Layouts y comportamiento adaptable observados

- **Aplicación:** cuerpo flex vertical; cabecera de color de marca, navegación horizontal, contenido con ancho máximo `1500px` y pie de página inferior.
- **Vistas:** Catálogos, Habitaciones y Reporte de rentas se muestran como secciones alternables en el mismo documento.
- **Catálogos:** tabs con wrapping; tablas en contenedor con overflow horizontal.
- **Habitaciones:** tarjetas en CSS Grid `repeat(auto-fit, minmax(210px, 1fr))`; borde izquierdo coloreado por estado.
- **Reporte:** tabla ancha con mínimo `1120px` y scroll horizontal, grupos visuales para renta/salida/limpieza.
- **Formularios:** diálogos centrados; grid de dos columnas y campos que pueden ocupar ambas.
- **Breakpoint observado:** hasta `650px`, header y formularios cambian a flujo vertical; padding lateral disminuye.

No se validó visualmente en tamaños concretos ni con zoom/teclado/lector de pantalla. No alterar responsive o navegación como parte de una tarea documental.
