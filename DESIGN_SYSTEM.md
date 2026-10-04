# Sistema de diseño observado

Esta documentación describe la interfaz actual inspeccionada en `src/client/Index.html`; no es una propuesta de rediseño ni deriva de otros proyectos.

## Principios observados

- Interfaz operativa en español, con vocabulario de habitaciones, estados y turnos.
- Una navegación primaria por vistas (Catálogos, Habitaciones, Reporte de rentas); dentro de catálogos hay pestañas por entidad.
- Acciones de operación aparecen junto a la tarjeta de habitación correspondiente; modales alojan formularios.
- El color comunica navegación, acción primaria, estados/advertencias y acciones destructivas; los estados también se escriben como texto.
- Las llamadas de cliente pasan por `google.script.run`; resultados y errores se comunican en la propia vista o mediante toast.
- Layout de tarjetas adaptable con CSS Grid y breakpoint para pantallas estrechas; tablas permiten scroll horizontal.

## Limitaciones de la auditoría visual

Se inspeccionó el código, no se tomó una captura de la UI desplegada ni se verificaron navegadores/dispositivos. Por tanto, el documento registra tokens y patrones fuente, no garantiza fidelidad visual renderizada, accesibilidad completa ni consistencia de todos los estados.

Consulta [TOKENS.md](TOKENS.md), [COMPONENTS.md](COMPONENTS.md) y [LAYOUTS.md](LAYOUTS.md) para inventarios puntuales.
