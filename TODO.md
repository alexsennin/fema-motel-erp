# Trabajo pendiente

Inventario documental inicial bajo ALEX DEVELOPMENT STANDARD v1.0. No implica autorización para operar servicios, cambiar datos o publicar.

| ID | Prioridad | Pendiente / problema | Dependencia | Criterio de aceptación | Estado |
|---|---|---|---|---|---|
| FEMA-001 | P1 | Confirmar y documentar el mecanismo de publicación que actualiza el deployment estable de Apps Script; la plantilla observada crea versión pero no actualiza deployment. | Acceso y autorización del responsable del deployment; preservar URL. | Ensayo controlado identifica deployment ID, versión objetivo, rollback y demuestra que URL estable se conserva; documentación coherente con comandos reales. | Pendiente; no verificado |
| FEMA-002 | P1 | Verificar configuración efectiva de acceso del deployment (`ANYONE` en manifest vs identidad Google exigida por código). | Responsable de Workspace/deployment y cuentas de prueba aprobadas. | Prueba autenticada/no autenticada documenta resultados y configuración efectiva sin exponer datos ni alterar usuarios reales. | Pendiente; riesgo |
| FEMA-003 | P1 | Establecer validación reproducible para flujos operativos de habitaciones; no se observó suite de pruebas. | Definir entorno de prueba y datos no productivos o escenarios controlados. | Casos de entrada, salida, traslado, cancelación, limpieza, turno y reporte cubren aceptación, permisos, idempotencia/concurrencia y regresión sin tocar producción. | Pendiente |
| FEMA-004 | P1 | Aclarar el alcance funcional ERP: pestañas de inventario, ventas y caja existen, pero módulos de app no fueron encontrados en la superficie inspeccionada. | Decisión de producto y procesos de hoteles. | Alcance priorizado, usuarios, flujos, requisitos no funcionales y límites aprobados; separar existente/futuro. | Pendiente |
| FEMA-005 | P2 | Los YAML de CI y deploy están en `docs/github-actions/`, fuera de `.github/workflows/`; no se ejecutan automáticamente desde esa ubicación. | Autorización para cambiar configuración CI y acceso con scope GitHub `workflow`. | CI visible y ejecutado en PR; evidencia de typecheck/build, y despliegue manual protegido sigue las reglas aprobadas. | Deuda técnica |
| FEMA-006 | P2 | Revisar si `clasp push --force` y `clasp create-deployment` corresponden al proceso seguro requerido. | Identificar propósito y deployment estable. | Procedimiento no sobrescribe inesperadamente ni crea URL nueva; permisos, rollback, versionado y confirmación documentados. | Deuda/riesgo |
| FEMA-007 | P2 | Verificar si la bitácora, claves de idempotencia y locks cubren de extremo a extremo fallas parciales y concurrencia real en los flujos sensibles. | Casos de prueba aislados; inspección de servicios y estructura de Sheets. | Cada operación crítica tiene evidencia de consistencia, reintento seguro, auditoría y tratamiento de falla parcial. | Pendiente |

## Convenciones de seguimiento

Actualizar estado sólo con evidencia de implementación/verificación. No marcar como terminado por crear documentación o por ejecutar una validación distinta del criterio de aceptación.
