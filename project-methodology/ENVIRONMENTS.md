# Entornos FEMA

| Entorno / destino | Propósito | Fuente/configuración observada | Límite y política |
|---|---|---|---|
| Local Docker | Desarrollo y smoke test sin Google | `docker-compose.yml`, `docker/Dockerfile`, `local/`; `127.0.0.1:8787`, identidad/fixtures ficticios | Efímero en memoria; no usar URL remota como `FEMA_LOCAL_URL`; no demuestra comportamiento real de GAS. |
| GitHub | Fuente/versionamiento de código | Repo privado `alexsennin/fema-motel-erp`; ramas `codex/...` y `main` | Publicar commit no equivale a merge, despliegue ni respaldo de Sheets. Confirmar si push dispara acciones. |
| Apps Script | Runtime de Web App | `project.config.json` identifica script y `/exec`; `appsscript.json` contiene V8, `ANYONE`, `USER_ACCESSING` | Deployment/configuración activa y revisión servida no se inspeccionaron en adopción. No usar `clasp push` sin autorización/destino explícito. |
| Google Sheets | Persistencia operativa | `project.config.json` referencia `FEMA · Fuente Maestra` | Datos y esquema real no leídos aquí. No modificar sin autorización; fixtures locales son ficticios. |
| Vercel | Subdominio de entrada | Proyecto `fema-motel-link`, carpeta `vercel-entrypoint/`, redirect a GAS | Es proyecto separado; despliegue desde esa carpeta afecta el redirect, no el código GAS. Estado vivo no revalidado en esta adopción. |

## Separación de estados

Local, GitHub, Apps Script, Google Sheets y Vercel son destinos distintos. Confirmar en cada tarea qué capa cambia. La configuración local o un branch publicado no demuestran qué código está sirviendo `/exec` ni qué datos hay en Sheets.
