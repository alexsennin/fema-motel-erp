# Estado de publicación y despliegue FEMA

Instantánea documental: 2026-10-06. No es registro histórico de cada publicación.

| Capa | Estado comprobado en esta adopción | Estado no comprobado / siguiente verificación |
|---|---|---|
| Código local/Git | Base revisada `6653423c6ad1d030f795c29e87987c17b0feec39`; se inició rama documental `codex/adopt-arc-v1.3.2`. | Commit/push final de adopción se actualizará al cerrar; no confundirlo con despliegue. |
| Código Apps Script | Sincronizado a `@HEAD` mediante `clasp push` y versionado como versión inmutable `43`. | Ninguno pendiente en esta versión. |
| Web App `/exec` | Deployment estable `AKfycby7DLyTqq84WHrAf3ajNjNE-4xeWNTvfCHE8OP7U7LP1UoG6GU7Xj20qAFX4rY9Wpv3eQ` actualizado exitosamente a la versión `@43` (acceso público universal `ANYONE_ANONYMOUS`, ejecución `USER_DEPLOYING`, módulo completo de inventario/ventas y validación previa de habitaciones ocupadas). | Probar recorrido operativo continuo en entorno real. |
| Datos Google Sheets | El repositorio declara el libro fuente. | Esquema actual, permisos y registros no verificados; no se mutaron. |
| Vercel `fema.integratech.app` | Verificado redirect HTTP 307 vivo hacia el deployment estable `/exec` de Apps Script. | No requirió cambios en `vercel-entrypoint/` dado que la URL `/exec` se conservó intacta. |
| CI | YAML presentes sólo en `docs/github-actions/`. | No son workflows activos en esa ruta; ejecución GitHub no verificada. |

## Condición de publicación/despliegue

El push de documentación a una rama no autoriza merge, Apps Script, Vercel ni Producción. Cualquier release debe identificar destino, revisión, autorización, mecanismo que conserva URL, prueba posterior y límites. Para Apps Script, `npm run clasp:deploy` ejecuta `clasp create-deployment`; no usarlo como sinónimo de actualizar el deployment estable.
