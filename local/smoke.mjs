import assert from "node:assert/strict";

const baseUrl = process.env.FEMA_LOCAL_URL || "http://127.0.0.1:8787";

async function waitForService() {
  let lastError;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/__local/health`);
      if (response.ok) return;
      lastError = new Error(`health HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`El servicio local no quedó listo: ${lastError?.message || "timeout"}`);
}

async function rpc(method, ...args) {
  const response = await fetch(`${baseUrl}/__local/rpc`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ method, args }),
  });
  assert.equal(response.status, 200, `${method} HTTP ${response.status}`);
  const result = await response.json();
  assert.equal(result.ok, true, `${method}: ${result.error?.message || "respuesta no exitosa"}`);
  return result.data;
}

await waitForService();
const page = await fetch(baseUrl);
assert.equal(page.status, 200, "la página local responde");
assert.match(await page.text(), /FEMA/);
const health = await fetch(`${baseUrl}/__local/health`).then((response) => response.json());
assert.equal(health.runtime, "apps-script-emulator");

let initial = await rpc("apiGetInitialState");
assert.equal(initial.rooms[0].estado, "DISPONIBLE");
assert.equal(initial.shift.canOperate, false);
assert.equal(initial.entryRates.length, 1);

const openedShift = await rpc("apiOpenShift");
assert.equal(openedShift.canOperate, true);
const entry = await rpc("apiRegisterEntry", {
  idHabitacion: "HAB-LOCAL", idTarifa: "TARIFA-LOCAL", marcaModeloVehiculo: "Prueba", placas: "TEST-01",
  personasExtra: 0, formaPago: "EFECTIVO", idempotencyKey: "LOCAL-ENTRY-1",
});
assert.equal(entry.precioFinal, 500);
initial = await rpc("apiGetInitialState");
assert.equal(initial.rooms[0].estado, "OCUPADA");

const rentalReport = await rpc("apiGetRentalReport");
assert.equal(rentalReport.length, 1);
assert.equal(rentalReport[0].habitacion, "TEST-01");

await rpc("apiRegisterExit", { idHabitacion: "HAB-LOCAL", observaciones: "", idempotencyKey: "LOCAL-EXIT-1" });
initial = await rpc("apiGetInitialState");
assert.equal(initial.rooms[0].estado, "SUCIA");
await rpc("apiAssignCleaning", { idHabitacion: "HAB-LOCAL", idPersonalLimpieza: "LIM-LOCAL", idempotencyKey: "LOCAL-CLEAN-1" });
initial = await rpc("apiGetInitialState");
assert.equal(initial.rooms[0].estado, "LIMPIEZA");
await rpc("apiCompleteCleaning", { idHabitacion: "HAB-LOCAL", idempotencyKey: "LOCAL-COMPLETE-1" });
initial = await rpc("apiGetInitialState");
assert.equal(initial.rooms[0].estado, "DISPONIBLE");

const finalShift = await rpc("apiCloseShift", openedShift.activeShift.idTurno);
assert.equal(finalShift.canOperate, false);
console.log("OK: UI local, turno, entrada, reporte, salida, limpieza, disponibilidad y cierre.");
