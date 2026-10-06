# Decisiones FEMA

Las decisiones registran acuerdos duraderos, no propuestas ni actividad de cada sesión.

## DEC-001 — Adoptar ARC DEVELOPMENT STANDARD v1.3.2

- Fecha: 2026-10-06.
- Estado: aceptada por solicitud del usuario.
- Contexto: el usuario pidió revisar GitHub y adoptar el estándar más actual. En el repositorio fuente se identificó `standards/v1.3.2/` como versión vigente, con fecha 2026-10-06.
- Opciones: mantener sin adopción o adoptar la versión vigente. Se adopta v1.3.2.
- Decisión/razón: v1.3.2 pasa a ser la metodología del repo; fuente `alexsennin/alex-development-standard` se mantiene sólo lectura. No copiar documentos canónicos.
- Consecuencias: documentos de proyecto bajo `project-methodology/`, `AGENTS.md` en raíz; Codex Desktop aplica routing manual de compatibilidad, no se presupone AXIOM.
- Sustituye: adopción ALEX DEVELOPMENT STANDARD v1.0 registrada en la rama `codex/adopt-alex-standard-v1`; v1.0 ya no es la versión activa para esta rama.

## DEC-002 — Google Apps Script + Sheets sigue como stack vigente

- Fecha: 2026-10-06.
- Estado: vigente como arquitectura actual; no autoriza despliegues ni migraciones.
- Contexto: el usuario pidió continuar con Apps Script/Sheets y la implementación versionada confirma ese stack.
- Opciones: conservar el stack actual o iniciar migración. Se conserva.
- Consecuencias: nuevos cambios se evalúan dentro de ese stack hasta una decisión explícita distinta; las limitaciones de Sheets se deben resolver con controles adecuados, no con supuestos de transacciones SQL.
- Alcance: arquitectura de aplicación/datos; no impide estudiar alternativas como propuesta separada.

## DEC-003 — Conservar la URL estable de Apps Script

- Fecha: 2026-10-06.
- Estado: requisito operativo aceptado; procedimiento de actualización aún no verificado.
- Contexto: el producto debe redesplegar en el mismo enlace `/exec`.
- Decisión: una publicación futura debe actualizar el deployment estable y comprobar el mismo enlace; no crear deployment nuevo por comodidad.
- Consecuencias: requiere cerrar FEMA-009 antes de automatizar o desplegar.

## DEC-004 — Vercel se limita a redirect de entrada

- Fecha: 2026-10-06.
- Estado: configuración/documentación observada; destino vivo no verificado en esta adopción.
- Contexto: `project.config.json`, `vercel-entrypoint/` y README describen proyecto Vercel separado para `fema.integratech.app`.
- Decisión: mantener responsabilidad acotada de redirect hacia Apps Script; no presentarlo como proxy ni como hospedaje del backend.

## DEC-005 — Docker local usa sólo fixtures aislados

- Fecha: 2026-10-06.
- Estado: vigente en configuración revisada.
- Contexto: `docker-compose.yml`, `local/` y README muestran un emulador local que no conecta a Google.
- Decisión: conservar el emulador aislado para desarrollo y pruebas; no cargar datos operativos/credenciales reales.

## Registro previo de metodología

La adopción ALEX v1.0 de 2026-10-04 se conserva como antecedente en la rama `codex/adopt-alex-standard-v1`; fue decisión correcta para el alcance de entonces. Esta adopción la sustituye en la rama actual y no copia archivos canónicos de ninguna versión del estándar.
