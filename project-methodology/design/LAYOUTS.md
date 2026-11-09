# Layouts FEMA (Implementados)

Fuente: `src/client/Index.html`.

## Estructura general

```text
Header app-bar (52px fijo): Marca FEMA | Nav (Habitaciones, Tienda, Corte) | Reloj, Turno, Usuario, Ajustes ⚙
Main (ancho completo, pegado a 6px del app-bar):
  Habitaciones: cuadrícula interactiva de 8 columnas x 4 filas sin barras intermedias
  Tienda: barra de resumen y stock pills | pestañas de categoría y buscador | tabla limpia de 4 columnas
  Corte: tarjetas de balance financiero (Total, Efectivo, Tarjeta, Cuartos) | tabla agrupada de rentas
  Catálogos: accesible desde menú ⚙ | tabs de entidad | tabla sticky
Sheet lateral (440px derecha en desktop / hoja inferior <768px):
  - Sucia: lista de camaristas para asignación 1-clic
  - Limpieza: duración y botón finalizar 1-clic
  - Ocupada: cuenta de estancia, balance de saldo, consumo embebido y liquidación
  - Producto: existencias anaquel/bodega, traspaso stepper, edición y ajuste físico
Footer discreto de copyright y versión
```

## Restricciones y comportamiento

- **Espacio vertical optimizado:** La fusión de encabezado y navegación en una barra de 52px ahorra 45px de altura muerta, colocando las habitaciones inmediatamente accesibles al abrir la app.
- **Tablero de rack hotelero:** Cuadrícula de 8 columnas en desktop para distribuir las 31 habitaciones de forma equilibrada sin scroll innecesario.
- **Interacción directa 1-clic:** No hay menús emergentes intermedios. Tocar una habitación abre directamente el formulario de entrada o el Sheet específico del estado.
- **Panel lateral (`Sheet`):** Se superpone con backdrop semitransparente suave (`rgba(15, 23, 42, 0.6)` con blur), se cierra con Escape, con el botón ✕ o tocando fuera.
- **Adaptabilidad móvil:** En pantallas menores a 768px, el `Sheet` se proyecta como bottom-sheet (hoja inferior del 85vh de alto) y la cuadrícula de habitaciones se reorganiza a 3 columnas.
