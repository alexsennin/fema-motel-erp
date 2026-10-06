# Sistema visual FEMA (observado)

Estado: documentación estática de `src/client/Index.html`; no es aprobación de un rediseño ni manual de marca autorizado.

## Principios visuales existentes

- Interfaz operativa en español, jerarquía directa por módulos y acciones.
- Fondo neutro claro, azul marino para identidad/navegación, azul para acción primaria y color de borde de habitación según estado.
- Tablas para catálogos/reporte; tarjetas para estado operativo por habitación; dialogs para captura.
- Estados vacíos, carga, error, éxito y controles deshabilitados se comunican con mensajes/toasts.
- El diseño prioriza escritorio; el CSS incluye adaptación básica a viewport estrecho. Verificar con navegador y usuarios antes de declarar accesibilidad/responsive completo.

## Identidad/jerarquía observada

Encabezado FEMA; navegación `Catálogos`, `Habitaciones`, `Reporte de rentas`; acciones agrupadas por estado de habitación; footer con copyright/versión/desarrollador. No se localizó una fuente de marca externa o manual visual aprobado.

## Inconsistencias/riesgos conocidos

- La navegación empieza en Catálogos y la carga inicial requiere que API de catálogos y API operativa resuelvan juntas; el permiso del módulo puede bloquear la pantalla completa.
- El reporte usa tabla ancha con `min-width:1120px`, requiriendo scroll horizontal en pantallas pequeñas.
- Colores se declaran como variables CSS, pero no se documentan ratios de contraste ni pruebas automatizadas de accesibilidad.
- La versión/compilación del footer es texto estático; confirmar actualización en el proceso de release.
