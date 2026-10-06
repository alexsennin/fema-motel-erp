# Estado de publicación y despliegue FEMA

Instantánea documental: 2026-10-06. No es registro histórico de cada publicación.

| Capa | Estado comprobado en esta adopción | Estado no comprobado / siguiente verificación |
|---|---|---|
| Código local/Git | Base revisada `6653423c6ad1d030f795c29e87987c17b0feec39`; se inició rama documental `codex/adopt-arc-v1.3.2`. | Commit/push final de adopción se actualizará al cerrar; no confundirlo con despliegue. |
| Código Apps Script | El repositorio identifica el proyecto y genera `dist/`; no se ejecutó sincronización remota. | Revisar `clasp status`/remoto sólo en una tarea autorizada; identificar código desplegado y método de actualizar deployment existente. |
| Web App `/exec` | URL configurada en inventario del proyecto. | Deployment ID/revisión servida, login real, continuidad de URL y recorrido autenticado no verificados en esta adopción. |
| Datos Google Sheets | El repositorio declara el libro fuente. | Esquema actual, permisos y registros no verificados; no se mutaron. |
| Vercel `fema.integratech.app` | Configuración de redirect presente en `vercel-entrypoint/` y en inventario del proyecto. | Deployment vivo/dominio no revalidado durante esta adopción. No desplegado. |
| CI | YAML presentes sólo en `docs/github-actions/`. | No son workflows activos en esa ruta; ejecución GitHub no verificada. |

## Condición de publicación/despliegue

El push de documentación a una rama no autoriza merge, Apps Script, Vercel ni Producción. Cualquier release debe identificar destino, revisión, autorización, mecanismo que conserva URL, prueba posterior y límites. Para Apps Script, `npm run clasp:deploy` ejecuta `clasp create-deployment`; no usarlo como sinónimo de actualizar el deployment estable.
