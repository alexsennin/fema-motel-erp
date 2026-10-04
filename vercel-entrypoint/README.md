# FEMA Vercel entrypoint

Proyecto Vercel `fema-motel-link`, servido por [fema.integratech.app](https://fema.integratech.app). El único propósito de este pequeño proyecto es redirigir temporalmente al deployment estable de Apps Script guardado en `project.config.json` y `vercel.json`.

No es una copia ni un proxy del ERP. Tras abrir el enlace, Google gestiona autenticación y el navegador usa el hostname de Apps Script. No añadir datos, credenciales ni lógica de negocio a este proyecto.

## Publicación

El proyecto está vinculado en Vercel con root directory `vercel-entrypoint`. Los previews CLI están protegidos; el dominio personalizado sirve el redirect público hacia el login de Google. La integración automática GitHub aún requiere autorizar acceso de Vercel al repositorio privado `alexsennin/fema-motel-erp`; no se debe hacer público el repositorio.

```bash
npx vercel --cwd vercel-entrypoint --scope alex-sennin
npx vercel --prod --cwd vercel-entrypoint --scope alex-sennin
```

Antes de publicar, confirma que `vercel.json` y `index.html` apuntan al URL estable correcto y que una solicitud a `/` responde con HTTP 307 al `/exec`. Publicar aquí sólo actualiza el alias Vercel; los cambios de la aplicación siguen usando el flujo de Apps Script/clasp y no deben crear un deployment nuevo si eso cambia la URL estable.
