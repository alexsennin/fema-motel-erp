# Decisiones del proyecto

Registro breve de decisiones observadas o aprobadas. Las propuestas abiertas van en [TODO.md](TODO.md), no se presentan como decisiones.

## DEC-001 — Adoptar ALEX DEVELOPMENT STANDARD v1.0

- Estado: aceptada para esta adopción documental.
- Fecha: 2026-10-04.
- Contexto: el usuario solicitó explícitamente `standards/v1.0/` para este repo. `USAGE.md` del repositorio fuente recomienda actualmente v1.1.
- Decisión: emplear v1.0 solamente; no trasladar reglas de v1.1. Consultar el repositorio fuente en modo sólo lectura y mantenerlo intacto.
- Consecuencia: cualquier actualización de versión metodológica requiere una decisión/adopción separada; estos documentos describen FEMA, no reproducen los canónicos.

## DEC-002 — Documentación de adopción en la raíz

- Estado: aceptada por instrucción específica de este proyecto.
- Fecha: 2026-10-04.
- Contexto: v1.0 propone organizar el material de metodología en una carpeta de proyecto; la solicitud exige `AGENTS.md`, contexto, estado, arquitectura, TODO, decisiones y documentación visual en `TARGET_ROOT`.
- Decisión: mantener los documentos de FEMA en la raíz y enlazarlos desde README/AGENTS, sin duplicar documentos canónicos.
- Consecuencia: la estructura raíz es una adaptación local intencional.

## DEC-003 — Apps Script y Sheets como arquitectura vigente

- Estado: observada; no se registró aprobación de migración.
- Contexto: README, `package.json`, configuración, servicios y hoja maestra muestran arquitectura actual Google Apps Script + TypeScript/HTML + Sheets.
- Decisión operativa para documentación: describir ese stack como vigente; no inferir ni iniciar migración a otra plataforma a partir de la meta ERP.
- Consecuencia: cualquier sustitución de stack requiere decisión independiente, plan de datos/reversión y autorización.

## DEC-004 — Conservar URL estable de la Web App

- Estado: requisito documentado por el proyecto; procedimiento técnico pendiente de verificación.
- Contexto: el README indica que las actualizaciones posteriores a primera implementación conservan el mismo enlace; el historial de solicitudes del producto también pide redesplegar a la misma URL.
- Decisión: tratar la URL estable como requisito y no usar comandos que creen deployment nuevo sin autorización y confirmación expresa.
- Consecuencia: FEMA-001 y FEMA-006 deben cerrarse antes de automatizar/publicar.
