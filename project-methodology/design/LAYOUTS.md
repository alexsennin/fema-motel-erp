# Layouts FEMA (observados)

Fuente estática: `src/client/Index.html`.

## Aplicación

```text
Header FEMA/sesión
Nav de módulos
Main (máximo 1500px)
  Catálogos: título/alta → tabs → tabla
  Habitaciones: título → panel de turno → grid de tarjetas
  Reporte: título/actualizar → resumen → tabla agrupada
Footer
Dialogs de captura y toast global
```

## Restricciones observadas

- Contenido principal usa ancho máximo 1500px y padding 22px.
- Mapa de cuartos usa CSS grid con columnas `repeat(auto-fit,minmax(210px,1fr))`.
- En `max-width:650px`, header/navegación/espaciado/forms cambian a un layout estrecho; la tabla conserva scroll horizontal.
- Reporte requiere ancho mínimo de 1120px y tablas de catálogos de 650px.
- Captura usa dialogs de ancho máximo 560px y form de dos columnas que pasa a una columna bajo 650px.

No se verificó una sesión E2E visual, zoom, dimensiones intermedias ni navegación sólo con teclado en el runtime real.
