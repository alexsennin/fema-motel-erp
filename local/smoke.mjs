import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { runInNewContext, Script } from "node:vm";
import { localUserEmail, secondLocalUserEmail } from "./seed-data.mjs";
import { runConcurrentRpc } from "./concurrency.mjs";
import {
  createClock,
  createDatabaseBuffers,
  createLocalRuntime,
  createLocalStore,
  createScriptLockBuffer,
} from "./harness.mjs";

const outputPath = "/tmp/fema-local-smoke-Code.js";

function compileAppsScript() {
  return new Promise((resolve, reject) => {
    const child = spawn("./node_modules/.bin/tsc", ["--project", "tsconfig.json", "--outFile", outputPath], { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", async (code) => {
      if (code !== 0) reject(new Error(`tsc terminó con código ${code}`));
      else {
        try { resolve(await readFile(outputPath, "utf8")); }
        catch (error) { reject(error); }
      }
    });
  });
}

const compiledSource = await compileAppsScript();
const bridgeSource = await readFile(new URL("./bridge.js", import.meta.url), "utf8");
const pageSource = await readFile("src/client/Index.html", "utf8");
assert.match(pageSource, /FEMA/, "el HTML principal local existe");
assert.match(pageSource, /data-add-entry-person/, "la entrada ofrece un botón para agregar personas extra");
assert.match(pageSource, /form\.elements\.personasExtra\.value=String\(Number\(form\.elements\.personasExtra\.value\|\|0\)\+1\)/, "el botón incrementa las personas extra en el formulario");
assert.match(pageSource, /data-entry-hours[\s\S]*data-entry-price[\s\S]*data-entry-included/, "la entrada muestra horas, precio e incluidos");
const clientScript = pageSource.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(clientScript, "el HTML incluye su script de cliente");
new Script(clientScript, { filename: "Index.html inline script" });

const buffers = createDatabaseBuffers();
const failureState = { next: null };
const store = createLocalStore({ ...buffers, failureState });
const scriptLockBuffer = createScriptLockBuffer();
const clock = createClock();
const silentLogger = { log() {}, warn() {}, error() {} };
const identities = new Map([
  [localUserEmail, createLocalRuntime({ store, identity: localUserEmail, clock, scriptLockBuffer, logger: silentLogger })],
  [secondLocalUserEmail, createLocalRuntime({ store, identity: secondLocalUserEmail, clock, scriptLockBuffer, logger: silentLogger })],
]);
for (const context of identities.values()) runInNewContext(compiledSource, context, { filename: "FEMA-Code.js" });

function rpc(method, args = [], identity = localUserEmail) {
  const context = identities.get(identity);
  assert.ok(context, `identidad local conocida: ${identity}`);
  const response = context[method](...args);
  assert.equal(response.ok, true, `${method}: ${response.error?.message || "respuesta no exitosa"}`);
  return response.data;
}

async function verifyBridgeCallbacks() {
  const pending = new Map();
  const requests = [];
  const localWindow = {};
  const localFetch = (url, options) => {
    assert.equal(url, "/__local/rpc");
    const request = JSON.parse(options.body);
    requests.push(request);
    if (request.args[0] === "network-error") {
      return new Promise((_resolve, reject) => pending.set(request.args[0], { reject }));
    }
    const result = identities.get(request.identity)[request.method](...request.args);
    return new Promise((resolve) => pending.set(request.args[0], { resolve: () => resolve({ json: async () => result }) }));
  };
  runInNewContext(bridgeSource, { window: localWindow, fetch: localFetch });

  localWindow.__femaLocal.setIdentity(localUserEmail);
  const first = new Promise((resolve, reject) => localWindow.google.script.run
    .withSuccessHandler((value) => resolve({ callback: "first", value }))
    .withFailureHandler(reject)
    .apiGetInitialState("first"));
  localWindow.__femaLocal.setIdentity(secondLocalUserEmail);
  const second = new Promise((resolve, reject) => localWindow.google.script.run
    .withSuccessHandler((value) => resolve({ callback: "second", value }))
    .withFailureHandler(reject)
    .apiGetInitialState("second"));
  assert.equal(requests.length, 2);
  assert.equal(requests[0].identity, localUserEmail);
  assert.equal(requests[1].identity, secondLocalUserEmail);

  pending.get("second").resolve();
  pending.get("first").resolve();
  const [firstResult, secondResult] = await Promise.all([first, second]);
  assert.equal(firstResult.callback, "first");
  assert.equal(firstResult.value.data.user.email, localUserEmail);
  assert.equal(secondResult.callback, "second");
  assert.equal(secondResult.value.data.user.email, secondLocalUserEmail);

  const succeedingCall = new Promise((resolve, reject) => localWindow.google.script.run
    .withSuccessHandler((value) => resolve({ callback: "third-success", value }))
    .withFailureHandler(reject)
    .apiGetInitialState("succeed-later"));
  const failingCall = new Promise((resolve, reject) => localWindow.google.script.run
    .withSuccessHandler((value) => resolve({ callback: "wrong-success", value }))
    .withFailureHandler((error) => resolve({ callback: "fourth-failure", message: error.message }))
    .apiGetInitialState("network-error"));
  pending.get("network-error").reject(new Error("fallo de transporte simulado"));
  pending.get("succeed-later").resolve();
  const [succeedingResult, failingResult] = await Promise.all([succeedingCall, failingCall]);
  assert.equal(succeedingResult.callback, "third-success");
  assert.equal(failingResult.callback, "fourth-failure");
  assert.match(failingResult.message, /fallo de transporte simulado/);
}

clock.set(Date.parse("2026-10-07T18:34:56.000Z"));
await verifyBridgeCallbacks();

const concurrent = await runConcurrentRpc({
  compiledSource,
  ...buffers,
  scriptLockBuffer,
  identity: localUserEmail,
  clockEpochMs: clock.now(),
  method: "apiOpenShift",
  writeHoldMs: 120,
});
assert.equal(concurrent.results.length, 2);
assert.equal(concurrent.results.filter((result) => result.ok).length, 1, "sólo una apertura concurrente del mismo hotel debe ganar");
assert.equal(concurrent.results.filter((result) => !result.ok).length, 1, "la segunda llamada debe observar el turno ya abierto");
assert.match(concurrent.results.find((result) => !result.ok).error.message, /Ya existe un turno abierto/);
assert.ok(concurrent.contendedLockAttempts >= 1, "ambos workers disputaron el mismo lock compartido");
assert.equal(store.inspect("Turnos").filter((shift) => shift.Estado === "ABIERTO").length, 1);

const initial = rpc("apiGetInitialState");
assert.equal(initial.user.idMotel, "MOTEL-LOCAL-1");
assert.equal(initial.user.roleId, "ROL-LOCAL-RECEPCION");
assert.equal(initial.rooms.length, 1);
assert.equal(initial.rooms[0].estado, "DISPONIBLE");
assert.equal(initial.rooms[0].numeroHabitacion, "N-TEST-01");
assert.equal(initial.entryRates.length, 1);
assert.equal(initial.shift.canOperate, true);
assert.equal(initial.generatedAt, "2026-10-07T12:34:56-06:00");

const secondInitial = rpc("apiGetInitialState", [], secondLocalUserEmail);
assert.equal(secondInitial.user.idMotel, "MOTEL-LOCAL-2");
assert.equal(secondInitial.user.roleId, initial.user.roleId, "los usuarios de hoteles distintos comparten perfil");
assert.equal(secondInitial.rooms.length, 1);
assert.equal(secondInitial.rooms[0].numeroHabitacion, "S-TEST-01");
assert.equal(secondInitial.shift.canOperate, false);
const secondShift = rpc("apiOpenShift", [], secondLocalUserEmail);
assert.equal(secondShift.canOperate, true);

const entryInput = {
  idHabitacion: "HAB-LOCAL-1", idTarifa: "TARIFA-LOCAL-1", medioLlegada: "VEHICULO", marcaModeloVehiculo: "Prueba", placas: "TEST-01",
  personasExtra: 1, formaPago: "TARJETA", minutosCotizados: 240, precioBaseCotizado: 500,
  personasIncluidasCotizadas: 2, precioPersonaExtraCotizado: 100, idempotencyKey: "LOCAL-ENTRY-1",
  idMotel: "MOTEL-LOCAL-2", idTipo: "TIPO-LOCAL-2", precioFinal: 1,
};
const incompleteVehicle = identities.get(localUserEmail).apiRegisterEntry({ ...entryInput, marcaModeloVehiculo: "", idempotencyKey: "LOCAL-INCOMPLETE-VEHICLE" });
assert.equal(incompleteVehicle.ok, false);
assert.match(incompleteVehicle.error.message, /marca y modelo/);
const incompleteVehiclePlates = identities.get(localUserEmail).apiRegisterEntry({ ...entryInput, placas: "", idempotencyKey: "LOCAL-INCOMPLETE-PLATES" });
assert.equal(incompleteVehiclePlates.ok, false);
assert.match(incompleteVehiclePlates.error.message, /placas/);
const invalidPayment = identities.get(localUserEmail).apiRegisterEntry({ ...entryInput, formaPago: "TRANSFERENCIA", idempotencyKey: "LOCAL-TRANSFER-ENTRY" });
assert.equal(invalidPayment.ok, false);
const forgedQuote = identities.get(localUserEmail).apiRegisterEntry({ ...entryInput, precioBaseCotizado: 1, idempotencyKey: "LOCAL-FORGED-QUOTE" });
assert.equal(forgedQuote.ok, false);
assert.match(forgedQuote.error.message, /tarifa cambió/);
const ratesSheet = identities.get(localUserEmail).SpreadsheetApp.openById("local").getSheetByName("Tarifas");
ratesSheet.getRange(5, 9).setValue(false);
const inactiveRate = identities.get(localUserEmail).apiRegisterEntry({ ...entryInput, idempotencyKey: "LOCAL-INACTIVE-RATE" });
assert.equal(inactiveRate.ok, false);
assert.match(inactiveRate.error.message, /Tarifa no válida/);
ratesSheet.getRange(5, 9).setValue(true);
const wrongTypeRate = identities.get(localUserEmail).apiRegisterEntry({ ...entryInput, idTarifa: "TARIFA-LOCAL-2", idempotencyKey: "LOCAL-WRONG-TYPE-RATE" });
assert.equal(wrongTypeRate.ok, false);
assert.match(wrongTypeRate.error.message, /Tarifa no válida/);

const concurrentEntry = await runConcurrentRpc({
  compiledSource,
  ...buffers,
  scriptLockBuffer,
  identity: localUserEmail,
  clockEpochMs: clock.now(),
  method: "apiRegisterEntry",
  args: [entryInput],
  writeHoldMs: 120,
});
assert.equal(concurrentEntry.results.filter((result) => result.ok).length, 2, "un reintento con la misma clave recupera el resultado confirmado");
const entry = concurrentEntry.results[0].data;
assert.equal(entry.precioBase, 500);
assert.equal(entry.personasIncluidas, 2);
assert.equal(entry.personasExtra, 1);
assert.equal(entry.importePersonasExtra, 100);
assert.equal(entry.precioFinal, 600, "el precio enviado no cambia el cálculo de catálogo");
assert.equal(entry.formaPago, "TARJETA");
assert.equal(store.inspect("Pagos").filter((payment) => payment.IdEstancia === entry.idEstancia).length, 1);
assert.equal(Number(store.inspect("Pagos").find((payment) => payment.IdEstancia === entry.idEstancia).Monto), 600);
const storedEntry = store.inspect("Estancias").find((stay) => stay.IdEstancia === entry.idEstancia);
assert.equal(Number(storedEntry.PrecioCatalogo), 500);
assert.equal(Number(storedEntry.AjustePrecio), 100);
assert.equal(Number(storedEntry.PrecioFinal), 600);
const rejectedSecondEntry = identities.get(localUserEmail).apiRegisterEntry({ ...entryInput, idempotencyKey: "LOCAL-ENTRY-DIFFERENT-KEY" });
assert.equal(rejectedSecondEntry.ok, false, "un segundo intento independiente no vuelve a cobrar una habitación ocupada");
assert.match(rejectedSecondEntry.error.message, /ya no está disponible/);
let primaryState = rpc("apiGetInitialState");
assert.equal(primaryState.rooms[0].estado, "OCUPADA");
assert.equal(primaryState.vehicleSuggestions.length, 1);
assert.equal(primaryState.vehicleSuggestions[0], "Prueba");
assert.equal(rpc("apiGetInitialState", [], secondLocalUserEmail).vehicleSuggestions.length, 0, "las sugerencias no cruzan hoteles");

const rentalReport = rpc("apiGetRentalReport");
assert.equal(rentalReport.length, 1);
assert.equal(rentalReport[0].habitacion, "N-TEST-01");

rpc("apiRegisterExit", [{ idHabitacion: "HAB-LOCAL-1", observaciones: "", idempotencyKey: "LOCAL-EXIT-1" }]);
primaryState = rpc("apiGetInitialState");
assert.equal(primaryState.rooms[0].estado, "SUCIA");
rpc("apiAssignCleaning", [{ idHabitacion: "HAB-LOCAL-1", idPersonalLimpieza: "LIM-LOCAL-1", idempotencyKey: "LOCAL-CLEAN-1" }]);
primaryState = rpc("apiGetInitialState");
assert.equal(primaryState.rooms[0].estado, "LIMPIEZA");
rpc("apiCompleteCleaning", [{ idHabitacion: "HAB-LOCAL-1", idempotencyKey: "LOCAL-COMPLETE-1" }]);
primaryState = rpc("apiGetInitialState");
assert.equal(primaryState.rooms[0].estado, "DISPONIBLE");
const taxiInput = {
  ...entryInput, medioLlegada: "TAXI", marcaModeloVehiculo: "", placas: "PLACAS-FORJADAS", personasExtra: 0,
  formaPago: "EFECTIVO", idempotencyKey: "LOCAL-TAXI-ENTRY",
};
identities.get(localUserEmail).apiRegisterEntry(taxiInput); // Respuesta inicial descartada para simular pérdida de respuesta.
const taxiEntry = rpc("apiRegisterEntry", [taxiInput]);
const taxiStay = store.inspect("Estancias").find((stay) => stay.IdEstancia === taxiEntry.idEstancia);
assert.equal(taxiStay.MarcaModeloVehiculo, "TAXI");
assert.equal(taxiStay.Placas, "No aplica");
assert.equal(store.inspect("Pagos").filter((payment) => payment.IdEstancia === taxiEntry.idEstancia).length, 1);
rpc("apiRegisterExit", [{ idHabitacion: "HAB-LOCAL-1", observaciones: "", idempotencyKey: "LOCAL-TAXI-EXIT" }]);
rpc("apiAssignCleaning", [{ idHabitacion: "HAB-LOCAL-1", idPersonalLimpieza: "LIM-LOCAL-1", idempotencyKey: "LOCAL-TAXI-CLEAN" }]);
rpc("apiCompleteCleaning", [{ idHabitacion: "HAB-LOCAL-1", idempotencyKey: "LOCAL-TAXI-COMPLETE" }]);
const walkingEntry = rpc("apiRegisterEntry", [{
  ...entryInput, medioLlegada: "CAMINANDO", marcaModeloVehiculo: "", placas: "", personasExtra: 0,
  formaPago: "TARJETA", idempotencyKey: "LOCAL-WALKING-ENTRY",
}]);
const walkingStay = store.inspect("Estancias").find((stay) => stay.IdEstancia === walkingEntry.idEstancia);
assert.equal(walkingStay.MarcaModeloVehiculo, "CAMINANDO");
assert.equal(walkingStay.Placas, "No aplica");

// Prueba de Inventario y Ventas a Habitación
const products = rpc("apiGetProductsAndInventory");
assert.ok(products.length >= 68, "el catálogo auto-siembra los 68 productos del menú");
const beerProd = products.find((p) => p.nombre.includes("CORONA LIGHT"));
assert.ok(beerProd, "se encuentra CORONA LIGHT en el catálogo");
assert.equal(beerProd.precioVenta, 38, "el precio de CORONA LIGHT es $38.00");

// Traspaso de Bodega a Anaquel
rpc("apiTransferInventory", [{
  idProducto: beerProd.idProducto,
  cantidad: 10,
  direccion: "BODEGA_A_ANAQUEL",
  motivo: "Surtido inicial a anaquel"
}]);
const productsAfterTransfer = rpc("apiGetProductsAndInventory");
const beerAfterTransfer = productsAfterTransfer.find((p) => p.idProducto === beerProd.idProducto);
assert.equal(beerAfterTransfer.stockAnaquel, beerProd.stockAnaquel + 10);
assert.equal(beerAfterTransfer.stockBodega, beerProd.stockBodega - 10);

// Habitaciones ocupadas para venta
const occupiedRooms = rpc("apiGetOccupiedRoomsForSale");
assert.ok(occupiedRooms.some((r) => r.idHabitacion === "HAB-LOCAL-1"), "la habitación ocupada aparece en la lista de ventas");

// Venta a habitación con descuento de anaquel
const saleResult = rpc("apiRegisterRoomSale", [{
  idHabitacion: "HAB-LOCAL-1",
  items: [{ idProducto: beerProd.idProducto, cantidad: 2 }],
  cobrarInmediato: false,
  idempotencyKey: "LOCAL-SALE-TEST-1"
}]);
assert.equal(saleResult.total, 76, "el total de 2 cervezas a $38 es $76");
assert.equal(saleResult.itemsVendidos, 2);

const productsAfterSale = rpc("apiGetProductsAndInventory");
const beerAfterSale = productsAfterSale.find((p) => p.idProducto === beerProd.idProducto);
assert.equal(beerAfterSale.stockAnaquel, beerAfterTransfer.stockAnaquel - 2, "el stock de anaquel se descuenta tras la venta");

// Corrección de inventario (Ajuste)
rpc("apiAdjustInventory", [{
  idProducto: beerProd.idProducto,
  ubicacion: "ANAQUEL",
  nuevoStock: 25,
  motivo: "Conteo físico de fin de turno"
}]);
const productsAfterAdjust = rpc("apiGetProductsAndInventory");
const beerAfterAdjust = productsAfterAdjust.find((p) => p.idProducto === beerProd.idProducto);
assert.equal(beerAfterAdjust.stockAnaquel, 25, "la corrección actualiza el stock físico de anaquel");

// Modificar precio
rpc("apiSaveProduct", [{
  idProducto: beerProd.idProducto,
  nombre: beerProd.nombre,
  categoria: beerProd.categoria,
  precioVenta: 42
}]);
const productsAfterPrice = rpc("apiGetProductsAndInventory");
const beerAfterPrice = productsAfterPrice.find((p) => p.idProducto === beerProd.idProducto);
assert.equal(beerAfterPrice.precioVenta, 42, "el precio se actualizó a $42");

// Movimientos de inventario
const movements = rpc("apiGetInventoryMovements");
assert.ok(movements.length >= 3, "los movimientos quedan registrados en auditoría");
assert.ok(movements.some((m) => m.tipoMovimiento === "VENTA" && m.destino.startsWith("HABITACION")));
assert.ok(movements.some((m) => m.tipoMovimiento === "TRASPASO_A_ANAQUEL"));
assert.ok(movements.some((m) => m.tipoMovimiento === "AJUSTE"));

const secondHotelEntryInput = {
  idHabitacion: "HAB-LOCAL-2", idTarifa: "TARIFA-LOCAL-2", medioLlegada: "VEHICULO", marcaModeloVehiculo: "Recuperación", placas: "TEST-02",
  personasExtra: 0, formaPago: "EFECTIVO", minutosCotizados: 240, precioBaseCotizado: 600,
  personasIncluidasCotizadas: 2, precioPersonaExtraCotizado: 100, idempotencyKey: "LOCAL-ROOM-STATUS-FAIL-1",
};
store.armWriteFailure({ sheet: "Habitaciones", row: 6, column: 6 });
const failedRoomConfirmation = identities.get(secondLocalUserEmail).apiRegisterEntry(secondHotelEntryInput);
assert.equal(failedRoomConfirmation.ok, false);
assert.equal(store.inspect("Habitaciones").find((room) => room.IdHabitacion === "HAB-LOCAL-2").EstadoActual, "DISPONIBLE");
const recoveredRoomEntry = rpc("apiRegisterEntry", [secondHotelEntryInput], secondLocalUserEmail);
assert.equal(store.inspect("Habitaciones").find((room) => room.IdHabitacion === "HAB-LOCAL-2").EstadoActual, "OCUPADA");
assert.equal(store.inspect("Pagos").filter((payment) => payment.IdEstancia === recoveredRoomEntry.idEstancia).length, 1);
rpc("apiRegisterExit", [{ idHabitacion: "HAB-LOCAL-2", observaciones: "", idempotencyKey: "LOCAL-ROOM-STATUS-EXIT" }], secondLocalUserEmail);
rpc("apiAssignCleaning", [{ idHabitacion: "HAB-LOCAL-2", idPersonalLimpieza: "LIM-LOCAL-2", idempotencyKey: "LOCAL-ROOM-STATUS-CLEAN" }], secondLocalUserEmail);
rpc("apiCompleteCleaning", [{ idHabitacion: "HAB-LOCAL-2", idempotencyKey: "LOCAL-ROOM-STATUS-COMPLETE" }], secondLocalUserEmail);

const paymentsBeforeFailure = store.inspect("Pagos");
store.armWriteFailure({ sheet: "Pagos", row: 5 + paymentsBeforeFailure.length, column: 1 });
const failedEntry = identities.get(secondLocalUserEmail).apiRegisterEntry({
  ...secondHotelEntryInput, marcaModeloVehiculo: "Fallo controlado", idempotencyKey: "LOCAL-FAIL-PAYMENT-1",
});
assert.equal(failedEntry.ok, false);
assert.match(failedEntry.error.message, /FEMA_LOCAL_INJECTED_WRITE_FAILURE/);

const failedRoom = store.inspect("Habitaciones").find((room) => room.IdHabitacion === "HAB-LOCAL-2");
assert.equal(failedRoom.EstadoActual, "DISPONIBLE", "la habitación sólo se ocupa después de guardar el pago y confirmar la operación");
const partialStay = store.inspect("Estancias").find((stay) => stay.IdHabitacionActual === "HAB-LOCAL-2" && stay.EstadoEstancia === "ACTIVA");
assert.ok(partialStay, "la estancia escrita antes del fallo queda inspeccionable");
assert.equal(store.inspect("Pagos").some((payment) => payment.IdEstancia === partialStay.IdEstancia), false);
assert.equal(store.inspect("Bitacora").some((record) => record.IdEntidad === partialStay.IdEstancia), false);

rpc("apiCloseShift", [initial.shift.activeShift.idTurno]);
rpc("apiCloseShift", [secondShift.activeShift.idTurno], secondLocalUserEmail);
console.log("OK: HTML local; callbacks aislados; dos hoteles/identidades; idempotencia y reintentos de entrada; tarifa/cotización/pagos; vehículo/taxi/caminando; lock compartido; fallo de pago deja disponible la habitación.");
