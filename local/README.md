# FEMA local en Docker

## Inicio

Desde la raíz del repositorio:

```bash
npm run dev:docker
```

Abre `http://localhost:8787`. La API de salud local es `http://localhost:8787/__local/health`. Para reiniciar el entorno con los datos de prueba desde cero, vuelve a ejecutar `npm run dev:docker`.

## Prueba de humo

Con el contenedor arriba y recién reiniciado:

```bash
npm run test:docker
```

La prueba recorre la UI servida y las funciones de servidor de apertura/cierre de turno, entrada, reporte, salida, asignación de limpieza y retorno a DISPONIBLE. El cliente recibe un shim de `google.script.run`; el backend ejecuta el TypeScript compilado en Node con dobles mínimos de `SpreadsheetApp`, `Session`, `Utilities` y `LockService`.

## Límites de aislamiento

- Toda identidad, motel, tarifa, habitación, permiso y empleado son fixtures de prueba (`dev@example.test`, `MOTEL-LOCAL`, `HAB-LOCAL`). No son datos FEMA.
- Sheets es un almacén en memoria del proceso; nada persiste tras recrear el contenedor.
- El contenedor sólo publica en `127.0.0.1:8787`, es read-only salvo `/tmp`, y no recibe `.clasp*`, `.clasprc.json`, `.env*`, `.vercel`, `outputs/` ni `work/` en el contexto Docker.
- No hay conexión a Google, GitHub, Vercel ni producción. Los dobles cubren las llamadas usadas por el ciclo de humo y no sustituyen pruebas contra Google Apps Script real.
- `npm run test:docker` no debe apuntarse a una URL que no sea el servicio local. No se agregó un mecanismo de conexión remota.
