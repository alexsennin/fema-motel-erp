# FEMA · ERP para Motel

Aplicación web de Google Apps Script para gestionar habitaciones, estancias, limpieza, inventario, ventas y cortes. Los datos viven en una única hoja maestra de Google Sheets y el código vive en GitHub.

## Fuente de verdad

- Código: este repositorio.
- Datos: `FEMA · Fuente Maestra`.
- Interfaz operativa: un único despliegue Web App de Apps Script.
- No editar código directamente en `script.google.com`; los cambios se hacen aquí y se publican con `clasp`.

## Desarrollo local

Requisitos: Node.js 22 o posterior, acceso al archivo de Google Sheets y la API de Apps Script habilitada.

```bash
npm install
npm run typecheck
npm run build
npx clasp login
npx clasp create-script --type standalone --title "FEMA · Apps Script" --rootDir dist
npm run clasp:push
```

El proyecto independiente de Apps Script vive dentro de la carpeta `FEMA` en
Google Drive y abre la fuente maestra mediante su ID. `clasp create-script`
crea `.clasp.json`; ese archivo y `~/.clasprc.json` contienen identificadores o
credenciales y no se versionan.

## Despliegue desde GitHub

Las plantillas se encuentran en `docs/github-actions/`. Para activarlas, la
cuenta que realiza el push necesita el scope `workflow`; después se mueven a
`.github/workflows/`.

El workflow manual `Deploy Apps Script` requiere dos secretos del environment `production`:

- `CLASPRC_JSON`: contenido de `~/.clasprc.json`.
- `CLASP_JSON`: contenido de `.clasp.json`.

El workflow compila, sube `dist/` mediante `clasp` y crea una versión inmutable. La primera implementación como Web App se configura una vez en Apps Script; las actualizaciones posteriores conservan el mismo enlace.

## Estructura

```text
src/server/     Servicios de Apps Script
src/client/     Interfaz HTML del Web App
scripts/        Compilación local
dist/           Salida generada para clasp; no se versiona
docs/github-actions/  Plantillas de validación y despliegue
```

## Seguridad y concurrencia

- El usuario se identifica con su cuenta de Google y debe existir activo en `Usuarios`.
- Los permisos se validan en servidor.
- Las operaciones críticas utilizan `LockService`.
- Las peticiones de escritura deben incluir una clave de idempotencia.
- Cancelaciones y modificaciones sensibles generan registros en `Bitacora`.

## Estado actual

La aplicación incluye el mapa de habitaciones, el servicio inicial para registrar entradas y el ABC de los catálogos de hoteles, personal de recepción, personal de limpieza, tipos de habitación y habitaciones. Las bajas son lógicas y cada modificación queda registrada en `Bitacora`.

El acceso a catálogos requiere `PER-CAT-GEST`. El personal de recepción utiliza el rol `ROL-RECEPCION`; una persona puede existir en el catálogo sin correo, pero necesita una cuenta de Google registrada para iniciar sesión.
