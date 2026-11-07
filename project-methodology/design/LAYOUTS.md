# Layouts FEMA (observados)

Fuente estática: `src/client/Index.html`.

## Aplicación

```text
Header FEMA / reloj digital / píldora de sesión / botón de turno (Cerrar turno / Abrir turno)
Nav de módulos (Habitaciones por defecto, Reporte, Catálogos)
Main (aprovechamiento visual completo hasta 1800px, pegado directamente al menú superior)
  Habitaciones: grid directo de tarjetas cuadradas interactivas (8 columnas x 4 filas uniformes) sin barras intermedias
  Reporte: título/actualizar → tarjetas de resumen métrico → tabla agrupada sticky
  Catálogos: título/alta → tabs redondeadas → tabla sticky
Footer institucional
Dialogs de captura accesibles y toast global
```

## Restricciones observadas

- Contenido principal aprovecha el 100% del viewport hasta 1800px y padding superior ultra-compacto de 6px para posicionar las tarjetas inmediatamente debajo del menú superior.
- Tablero de habitaciones tipo rack hotelero: vista numérica directa y limpia (sin barras intermedias ni filtros innecesarios). Usa CSS grid optimizado de 8 columnas en escritorio para distribuir uniformemente las 31 habitaciones en 4 filas (8 + 8 + 8 + 7), maximizando la cobertura de pantalla sin desbordes verticales y adaptándose dinámicamente a tablet (6 / 4 cols) y móvil (3 cols).
- Tarjetas flash-card cuadradas exactas (`aspect-ratio: 1 / 1;`): cabecera superior fija en 1 sola línea con nombre auto-ajustable y precio base; cuerpo 100% en color de estado sólido para todas las tarjetas (disponibles, sucias, ocupadas y limpieza); datos de ocupación y limpieza integrados sobre el color con tipografía blanca de alto contraste; cuadrícula centrada con separación amplia (gap 16px); y efecto de pulsación física al clic/selección (`scale(0.96)`).
- Interacción: clic o Enter en una tarjeta disponible abre directamente el registro de entrada; en tarjetas ocupadas, sucias o en limpieza abre `#roomActionsDialog` para sus respectivas opciones múltiples.
- En `max-width:650px`, header/navegación/espaciado/forms cambian a un layout estrecho; la tabla conserva scroll horizontal.
- Reporte requiere ancho mínimo de 1120px y tablas de catálogos de 650px.
- Captura usa dialogs de ancho máximo 580px y form de dos columnas que pasa a una columna bajo 768px.

No se verificó una sesión E2E visual, zoom, dimensiones intermedias ni navegación sólo con teclado en el runtime real.
