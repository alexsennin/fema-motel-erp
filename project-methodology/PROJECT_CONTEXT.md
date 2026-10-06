# Contexto del proyecto — FEMA

## Producto y usuarios

FEMA es un sistema de gestión hotelera para los moteles de la organización. El módulo implementado se enfoca en catálogos y operación de habitaciones: recepción opera rentas y turnos; limpieza atiende habitaciones asignadas; personal con permiso de catálogo administra datos maestros.

## Stack y fuentes

- Web App: Google Apps Script V8.
- Backend: TypeScript compilado; UI: HTML/CSS/JavaScript, comunicación mediante `google.script.run`.
- Persistencia operativa: Google Sheets `FEMA · Fuente Maestra`.
- Código: repositorio privado `alexsennin/fema-motel-erp` y sincronización con `clasp`.
- Desarrollo/pruebas aisladas: Docker local con fixtures en memoria.
- Entrada con marca: `fema.integratech.app` en Vercel redirige al `/exec` de Apps Script; no es proxy ni reemplazo del hosting.
- Zona horaria configurada: `America/Mexico_City`.

## Restricciones vigentes

- El despliegue productivo de Apps Script y la hoja maestra son sistemas operativos externos; no mutarlos sin autorización específica.
- La URL estable de Web App debe conservarse en despliegues autorizados.
- La autenticación implementada usa el correo de la cuenta Google activa. El usuario debe estar activo en `Usuarios`; permisos se asignan por rol. El acceso propio mediante usuario/contraseña ha sido solicitado como dirección futura, pero no está implementado ni se ha acordado su diseño.
- Los ciclos, estados de habitación, estancia, limpieza y pagos se relacionan mediante IDs en Sheets. No hay constraints relacionales ni transacción de varias pestañas automática.
- No inferir implementación de inventario, ventas, consumos/cargos, caja o mantenimiento operativo por la existencia de pestañas/configuración.
- El emulador local no contiene información operativa real ni valida integración de Google.

## Metodología adoptada y clasificación

Se adopta ARC DEVELOPMENT STANDARD v1.3.2, fuente canónica de sólo lectura en `alexsennin/alex-development-standard/standards/v1.3.2/`.

| Clasificación | Aplicación a FEMA |
|---|---|
| Adoptar | Comprender el estado antes de editar; aceptación observable; cambios pequeños; autorización por destino; seguridad de secretos/datos; pruebas proporcionales; distinguir local/Git/despliegue/producción; trazabilidad; atomicidad/idempotencia/compensación según riesgo; actualizar sólo documentos cuya verdad cambió. |
| Adaptar | ARC es neutral en stack: su contexto, tareas, pruebas y despliegues se documentan para Apps Script, Sheets, clasp, Docker, GitHub y Vercel. Codex Desktop opera con routing manual; no se presupone AXIOM/Codex CLI. |
| Mantener como excepción | Código Apps Script se compila/sube con el flujo propio de `clasp`; la entrada Vercel vive en `vercel-entrypoint/` como proyecto separado. Las plantillas de workflow siguen fuera de `.github/workflows/` hasta que se autorice/configure su activación. |
| No aplica | Reglas que presuponen un ORM/SQL o proveedor de base relacional no se copian literalmente; se traducen a invariantes, bloqueo, idempotencia, compensación y verificación de Sheets cuando corresponda. |
| Deuda técnica | Atomicidad multihoja, pruebas funcionales amplias, autenticación con credenciales propias pendiente, cobertura de turnos cerrados y validación de despliegues independientes. Ver `TODO.md`. |
| Riesgo | Identidad Google efectiva en deployment, permisos/alcance por motel, pagos, fallos parciales en Sheets, historial de traslados y actualización del deployment estable. No operar producción sin verificación/autorización aplicable. |

## Enlaces del repositorio

- [README y comandos](../README.md)
- [Arquitectura actual](ARCHITECTURE.md)
- [Estado y límites de verificación](PROJECT_STATE.md)
- [Pendientes con aceptación](TODO.md)
- [Decisiones](DECISIONS.md)
- [Análisis de la hoja legada DREAMS2025](../docs/ANALISIS_CONTROL_HABITACIONES_LEGADO.md)
