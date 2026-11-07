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

Con `node_modules` instalado, `node local/smoke.mjs` ejecuta esta comprobación focal directamente en el proceso Node, sin iniciar servidor ni abrir puertos. `npm run test:docker` ejecuta el mismo archivo dentro del contenedor.

La prueba inspecciona el HTML fuente y recorre apertura/cierre de turno, entrada, reporte, salida, limpieza y retorno a DISPONIBLE. Ejecuta el puente `google.script.run` fuera de orden para comprobar que cada llamada conserva su callback. También verifica dos hoteles y dos identidades con el mismo perfil, reloj controlable y fallo de una celda de escritura.

La prueba de contención arranca dos Node workers a la vez. Ambos ejecutan `apiOpenShift` contra el mismo almacenamiento de fixtures en `SharedArrayBuffer` y compiten por un lock simulado compartido; debe persistir un solo turno y el mock registra el intento de contención. Esto comprueba el arnés y la lógica bajo el lock simulado, no el runtime, el `LockService` ni la concurrencia real de Google Apps Script.

Para una escritura dirigida, `POST /__local/failure` recibe `{ "sheet": "Pagos", "row": 5, "column": 1 }` y falla una vez cuando una escritura empieza en esa celda. `GET /__local/state?sheet=Estancias` inspecciona los registros ficticios después del fallo. `POST /__local/clock` recibe `{ "now": "2026-10-07T18:34:56.000Z" }` para fijar el reloj del backend. Las identidades por RPC se limitan a los correos de fixture y se pueden cambiar desde el puente local con `window.__femaLocal.setIdentity(email)`.

## Límites de aislamiento

- Las dos identidades, hoteles, tarifas, habitaciones, permisos y empleados son fixtures de prueba (`dev@example.test` y `recepcion-b@example.test`). Ambas identidades comparten el perfil de recepción y cada una queda asociada a un hotel distinto. No son datos FEMA.
- Sheets es un almacén en memoria compartido entre el servidor y los workers del proceso de prueba; nada persiste tras recrear el contenedor.
- El contenedor sólo publica en `127.0.0.1:8787`, es read-only salvo `/tmp`, y no recibe `.clasp*`, `.clasprc.json`, `.env*`, `.vercel`, `outputs/` ni `work/` en el contexto Docker.
- No hay conexión a Google, GitHub, Vercel ni producción. Los dobles cubren las llamadas usadas por el ciclo de humo y no sustituyen pruebas contra Google Apps Script real.
- Las rutas `/__local/state`, `/__local/clock`, `/__local/failure` y `/__local/concurrency` son controles de prueba sin autenticación. Docker las publica sólo en loopback; al iniciar el servidor directamente, éste también se liga a `127.0.0.1`.
- `npm run test:docker` no debe apuntarse a una URL que no sea el servicio local. No se agregó un mecanismo de conexión remota ni una prueba de navegador E2E.
- La inyección de fallos sólo falla la escritura solicitada y no revierte escrituras previas. El caso verifica y deja visible el estado parcial; no acredita compensación ni atomicidad de Sheets.
