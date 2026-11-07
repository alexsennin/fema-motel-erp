import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sheetHeaders } from "./seed-data.mjs";
import { createSchemaTransitionFixture } from "./schema-transition-fixtures.mjs";

const ADDITIVE_COLUMNS = {
  Habitaciones: ["IdOperacionUltimaActualizacion", "PersonasIncluidas", "PrecioPersonaExtra"],
  Ciclos: ["IdOperacion"],
  Estancias: ["IdOperacionAlta", "IdOperacionUltimaActualizacion"],
  Turnos: ["IdOperacionApertura", "IdOperacionCierre"],
  EventosHabitacion: ["IdOperacion"],
  MovimientosEstancia: ["IdOperacion", "IdTurno"],
  Cargos: ["IdOperacion"],
  Pagos: ["IdOperacion"],
  Bitacora: ["IdOperacion"],
};

const NEW_TABLES = {
  UsuariosHoteles: ["IdUsuarioHotel", "IdUsuario", "IdMotel", "IdPerfil", "Activo", "CreadoEn", "CreadoPor"],
  Operaciones: [
    "IdOperacion", "ClaveIdempotencia", "IdUsuario", "IdSesion", "IdUsuarioHotel", "IdPerfil",
    "IdUsuarioUltimaRecuperacion", "IdSesionUltimaRecuperacion", "FechaHoraUltimaRecuperacion", "IdMotel",
    "IdTurno", "ContextoTurno", "TipoOperacion", "VersionEsquema", "VersionContrato", "HashPayload",
    "PlanJSON", "IdsDeterministasJSON", "Estado", "ProgresoJSON", "ResultadoJSON", "CodigoIncidencia",
    "FechaHoraInicio", "FechaHoraActualizacion", "FechaHoraConfirmacion",
  ],
  PeriodosEstancia: [
    "IdPeriodoEstancia", "IdEstancia", "NumeroPeriodo", "TipoPeriodo", "IdTarifa", "Minutos",
    "FechaHoraInicio", "FechaHoraFin", "IdCargo", "IdOperacion", "IdTurno",
  ],
  Cortes: [
    "IdCorte", "IdMotel", "IdTurno", "Estado", "IdUsuarioCierre", "IdSesionCierre", "FechaHoraCierre",
    "CantidadHabitaciones", "HashFotografia", "IdOperacion", "VersionFotografia",
  ],
  CorteHabitaciones: [
    "IdCorteHabitacion", "IdCorte", "IdMotel", "IdHabitacion", "EstadoHabitacion", "IdCiclo", "IdEstancia",
    "NumeroHabitacionSnapshot", "IdOperacion",
  ],
};

const REFERENCE_RULES = [
  ["Usuarios", "IdUsuario", "IdMotel", "Moteles", "IdMotel"],
  ["Usuarios", "IdUsuario", "IdRol", "Roles", "IdRol"],
  ["PersonalLimpieza", "IdPersonalLimpieza", "IdMotel", "Moteles", "IdMotel"],
  ["Habitaciones", "IdHabitacion", "IdMotel", "Moteles", "IdMotel"],
  ["Habitaciones", "IdHabitacion", "IdTipo", "TiposHabitacion", "IdTipo"],
  ["Habitaciones", "IdHabitacion", "IdCicloActual", "Ciclos", "IdCiclo"],
  ["Turnos", "IdTurno", "IdMotel", "Moteles", "IdMotel"],
  ["Turnos", "IdTurno", "IdUsuarioApertura", "Usuarios", "IdUsuario"],
  ["Ciclos", "IdCiclo", "IdMotel", "Moteles", "IdMotel"],
  ["Ciclos", "IdCiclo", "IdHabitacion", "Habitaciones", "IdHabitacion"],
  ["Ciclos", "IdCiclo", "IdUsuarioInicio", "Usuarios", "IdUsuario"],
  ["Ciclos", "IdCiclo", "IdTurnoInicio", "Turnos", "IdTurno"],
  ["EventosHabitacion", "IdEvento", "IdCiclo", "Ciclos", "IdCiclo"],
  ["EventosHabitacion", "IdEvento", "IdHabitacion", "Habitaciones", "IdHabitacion"],
  ["EventosHabitacion", "IdEvento", "IdTurno", "Turnos", "IdTurno"],
  ["Estancias", "IdEstancia", "IdCiclo", "Ciclos", "IdCiclo"],
  ["Estancias", "IdEstancia", "IdMotel", "Moteles", "IdMotel"],
  ["Estancias", "IdEstancia", "IdHabitacionActual", "Habitaciones", "IdHabitacion"],
  ["Estancias", "IdEstancia", "IdTarifa", "Tarifas", "IdTarifa"],
  ["Estancias", "IdEstancia", "IdTurno", "Turnos", "IdTurno"],
  ["Estancias", "IdEstancia", "IdUsuario", "Usuarios", "IdUsuario"],
  ["Limpiezas", "IdLimpieza", "IdCiclo", "Ciclos", "IdCiclo"],
  ["Limpiezas", "IdLimpieza", "IdHabitacion", "Habitaciones", "IdHabitacion"],
  ["Limpiezas", "IdLimpieza", "IdPersonalLimpieza", "PersonalLimpieza", "IdPersonalLimpieza"],
  ["Pagos", "IdPago", "IdEstancia", "Estancias", "IdEstancia"],
  ["Pagos", "IdPago", "IdTurno", "Turnos", "IdTurno"],
  ["Pagos", "IdPago", "IdUsuario", "Usuarios", "IdUsuario"],
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function assertPreflight(state) {
  for (const [name, originalHeaders] of Object.entries(sheetHeaders)) {
    const table = state.tables[name];
    assert.ok(table, `Falta la hoja v1 requerida: ${name}.`);
    assert.deepEqual(table.headers.slice(0, originalHeaders.length), originalHeaders, `Cambió el prefijo v1 de ${name}.`);
    assert.equal(new Set(table.headers).size, table.headers.length, `Hay cabeceras duplicadas en ${name}.`);
    assert.ok(table.headers.every((header) => typeof header === "string" && header.trim()), `Hay cabeceras vacías en ${name}.`);
    for (const [index, row] of table.rows.entries()) {
      assert.equal(row.length, table.headers.length, `Ancho inválido en ${name}, fila ${index + 5}.`);
    }
  }

  for (const [name, headers] of Object.entries(NEW_TABLES)) {
    const table = state.tables[name];
    if (!table) continue;
    assert.equal(new Set(table.headers).size, table.headers.length, `Hay cabeceras duplicadas en ${name}.`);
    assert.ok(table.headers.every((header) => typeof header === "string" && header.trim()), `Hay cabeceras vacías en ${name}.`);
    for (const [index, row] of table.rows.entries()) {
      assert.equal(row.length, table.headers.length, `Ancho inválido en ${name}, fila ${index + 5}.`);
    }
    if (!Object.keys(ADDITIVE_COLUMNS).includes(name) && table.rows.length) {
      assert.fail(`La hoja nueva ${name} ya contiene filas; requiere revisión antes de esta transición.`);
    }
    for (const header of headers) {
      assert.equal(typeof header, "string");
    }
  }
}

function persistStep(filePath, state, metrics, failAfterSteps) {
  writeJson(filePath, state);
  metrics.stepsApplied += 1;
  if (metrics.stepsApplied === failAfterSteps) {
    throw new Error(`FEMA_UPD23_INJECTED_FAILURE: paso ${metrics.stepsApplied}`);
  }
}

function rehearseAdditiveTransition(filePath, { failAfterSteps = Number.POSITIVE_INFINITY } = {}) {
  const state = readJson(filePath);
  assertPreflight(state);
  const metrics = { stepsApplied: 0, columnsAdded: 0, sheetsCreated: 0 };

  for (const [sheetName, additions] of Object.entries(ADDITIVE_COLUMNS)) {
    const table = state.tables[sheetName];
    for (const header of additions) {
      if (table.headers.includes(header)) continue;
      table.headers.push(header);
      table.rows = table.rows.map((row) => [...row, ""]);
      metrics.columnsAdded += 1;
      persistStep(filePath, state, metrics, failAfterSteps);
    }
  }

  for (const [sheetName, headers] of Object.entries(NEW_TABLES)) {
    if (state.tables[sheetName]) {
      const table = state.tables[sheetName];
      for (const header of headers) {
        if (table.headers.includes(header)) continue;
        table.headers.push(header);
        table.rows = table.rows.map((row) => [...row, ""]);
        metrics.columnsAdded += 1;
        persistStep(filePath, state, metrics, failAfterSteps);
      }
      continue;
    }
    state.tables[sheetName] = { headers: [...headers], rows: [] };
    metrics.sheetsCreated += 1;
    persistStep(filePath, state, metrics, failAfterSteps);
  }

  return metrics;
}

function records(state, sheetName) {
  const table = state.tables[sheetName];
  return table.rows.map((cells) => Object.fromEntries(table.headers.map((header, index) => [header, cells[index] ?? ""])));
}

function primaryKeys(state) {
  const keys = {};
  for (const sheetName of Object.keys(sheetHeaders)) {
    const table = state.tables[sheetName];
    const primaryKey = sheetHeaders[sheetName].find((header) => /^Id[A-Z]/.test(header));
    keys[sheetName] = table.rows.map((row) => String(row[table.headers.indexOf(primaryKey)] ?? "")).filter(Boolean).sort();
  }
  return keys;
}

function duplicateIds(state) {
  const duplicates = [];
  for (const [sheetName, ids] of Object.entries(primaryKeys(state))) {
    const counts = new Map();
    for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
    for (const [id, count] of counts) if (count > 1) duplicates.push({ sheet: sheetName, id, count });
  }
  return duplicates.sort((a, b) => `${a.sheet}:${a.id}`.localeCompare(`${b.sheet}:${b.id}`));
}

function referenceIssues(state) {
  const issues = [];
  for (const [sheetName, rowId, sourceColumn, targetSheet, targetColumn] of REFERENCE_RULES) {
    const targetIds = new Set(records(state, targetSheet).map((row) => String(row[targetColumn] ?? "")).filter(Boolean));
    for (const row of records(state, sheetName)) {
      const value = String(row[sourceColumn] ?? "");
      if (value && !targetIds.has(value)) issues.push({
        sheet: sheetName, id: String(row[rowId] ?? ""), column: sourceColumn, value, target: targetSheet,
      });
    }
  }
  return issues.sort((a, b) => `${a.sheet}:${a.id}:${a.column}`.localeCompare(`${b.sheet}:${b.id}:${b.column}`));
}

function amountDiscrepancies(state) {
  const paymentsByStay = new Map();
  for (const payment of records(state, "Pagos")) {
    if (!payment.IdEstancia || !payment.Monto) continue;
    const cents = Math.round(Number(payment.Monto) * 100);
    if (!Number.isFinite(cents)) continue;
    paymentsByStay.set(payment.IdEstancia, (paymentsByStay.get(payment.IdEstancia) || 0) + cents);
  }
  return records(state, "Estancias").flatMap((stay) => {
    if (!stay.IdEstancia || !stay.PrecioFinal || !paymentsByStay.has(stay.IdEstancia)) return [];
    const expectedCents = Math.round(Number(stay.PrecioFinal) * 100);
    const observedCents = paymentsByStay.get(stay.IdEstancia);
    if (!Number.isFinite(expectedCents) || expectedCents === observedCents) return [];
    return [{
      idEstancia: stay.IdEstancia,
      precioFinalCents: expectedCents,
      pagosRegistradosCents: observedCents,
      disposition: "RESOLVER_MANUAL; no ajustar datos durante la transición",
    }];
  }).sort((a, b) => a.idEstancia.localeCompare(b.idEstancia));
}

function rowContent(state, sheetName, originalHeaders) {
  const table = state.tables[sheetName];
  return table.rows.map((row) => row.slice(0, originalHeaders.length));
}

function stateSnapshot(state) {
  const allRows = Object.values(state.tables).reduce((sum, table) => sum + table.rows.length, 0);
  const allIds = Object.values(primaryKeys(state)).flat();
  return {
    headers: Object.fromEntries(Object.keys(sheetHeaders).map((name) => [name, state.tables[name].headers])),
    rowCounts: Object.fromEntries(Object.keys(sheetHeaders).map((name) => [name, state.tables[name].rows.length])),
    totalRows: allRows,
    totalIds: allIds.length,
    ids: primaryKeys(state),
    duplicates: duplicateIds(state),
    references: referenceIssues(state),
    amountDiscrepancies: amountDiscrepancies(state),
  };
}

function assertPreserved(baseline, after, originalHeaders) {
  assert.deepEqual(primaryKeys(after), primaryKeys(baseline), "Cambió la lista o multiplicidad de IDs v1.");
  assert.deepEqual(duplicateIds(after), duplicateIds(baseline), "Cambió la lista de IDs duplicados preexistentes.");
  assert.deepEqual(referenceIssues(after), referenceIssues(baseline), "Cambió una referencia de legado.");
  assert.deepEqual(amountDiscrepancies(after), amountDiscrepancies(baseline), "Cambió una discrepancia monetaria.");

  for (const [sheetName, headers] of Object.entries(originalHeaders)) {
    assert.deepEqual(after.tables[sheetName].headers.slice(0, headers.length), headers, `Se alteró el encabezado v1 de ${sheetName}.`);
    assert.deepEqual(rowContent(after, sheetName, headers), baseline.tables[sheetName].rows, `Cambió historia/datos v1 en ${sheetName}.`);
  }
  for (const [sheetName, additions] of Object.entries(ADDITIVE_COLUMNS)) {
    const table = after.tables[sheetName];
    for (const header of additions) {
      const columnIndex = table.headers.indexOf(header);
      for (const row of table.rows) assert.equal(row[columnIndex], "", `Se hizo backfill no aprobado en ${sheetName}.${header}.`);
    }
  }
  for (const [sheetName, headers] of Object.entries(NEW_TABLES)) {
    assert.deepEqual(after.tables[sheetName].headers, headers, `Estructura inesperada en ${sheetName}.`);
    assert.equal(after.tables[sheetName].rows.length, 0, `La transición creó datos en ${sheetName}.`);
  }

  const amountBefore = records(baseline, "Pagos").reduce((sum, payment) => sum + Math.round(Number(payment.Monto || 0) * 100), 0);
  const amountAfter = records(after, "Pagos").reduce((sum, payment) => sum + Math.round(Number(payment.Monto || 0) * 100), 0);
  assert.equal(amountAfter, amountBefore, "Cambió el total de pagos registrados.");

  const activeRoomStates = (state) => records(state, "Habitaciones")
    .map(({ IdHabitacion, EstadoActual, IdCicloActual }) => [IdHabitacion, EstadoActual, IdCicloActual]);
  assert.deepEqual(activeRoomStates(after), activeRoomStates(baseline), "Cambió el estado activo de habitaciones/ciclos.");
  assert.equal(records(after, "Turnos").find((row) => row.IdTurno === "SYN-TURNO-B")?.Estado, "ABIERTO");
  assert.equal(records(after, "Limpiezas").find((row) => row.IdLimpieza === "SYN-LIMPIEZA-ACTIVA")?.Estado, "EN_PROCESO");
}

function assertTransitionPreflightIsFailClosed(baseline, tempDir) {
  const invalidPath = join(tempDir, "invalid-fixture.json");
  const invalid = clone(baseline);
  invalid.tables.Habitaciones.headers.push("IdHabitacion");
  invalid.tables.Habitaciones.rows = invalid.tables.Habitaciones.rows.map((row) => [...row, ""]);
  writeJson(invalidPath, invalid);
  const before = stable(readJson(invalidPath));
  assert.throws(() => rehearseAdditiveTransition(invalidPath), /cabeceras duplicadas/);
  assert.equal(stable(readJson(invalidPath)), before, "Preflight fallido mutó el almacén local.");
}

function assertSameHotelCrossingTurnFixture(state) {
  const stay = records(state, "Estancias").find((row) => row.IdEstancia === "SYN-ESTANCIA-MULTIPAGO");
  const activeRoom = records(state, "Habitaciones").find((row) => row.IdHabitacion === "SYN-HAB-OCUPADA");
  assert.equal(stay.IdTurno, "SYN-TURNO-A");
  assert.equal(stay.EstadoEstancia, "ACTIVA");
  assert.equal(activeRoom.EstadoActual, "OCUPADA");
  assert.equal(records(state, "Turnos").find((row) => row.IdTurno === "SYN-TURNO-B").Estado, "ABIERTO");
}

const tempDir = mkdtempSync(join(tmpdir(), "fema-upd23-"));
const statePath = join(tempDir, "synthetic-store.json");
const backupPath = join(tempDir, "synthetic-backup.json");

try {
  const baseline = createSchemaTransitionFixture();
  const originalHeaders = Object.fromEntries(Object.entries(baseline.tables).map(([name, table]) => [name, [...table.headers]]));
  writeJson(statePath, baseline);
  copyFileSync(statePath, backupPath);

  assertSameHotelCrossingTurnFixture(baseline);
  assert.equal(records(baseline, "Limpiezas").find((row) => row.IdLimpieza === "SYN-LIMPIEZA-ACTIVA").FechaHoraFin, "");
  assertTransitionPreflightIsFailClosed(baseline, tempDir);

  assert.throws(() => rehearseAdditiveTransition(statePath, { failAfterSteps: 4 }), /FEMA_UPD23_INJECTED_FAILURE/);
  assert.notEqual(stable(readJson(statePath)), stable(baseline), "La inyección no dejó un estado parcial para probar recuperación.");
  copyFileSync(backupPath, statePath);
  assert.equal(stable(readJson(statePath)), stable(baseline), "La restauración local no recuperó el respaldo sintético.");

  const firstRun = rehearseAdditiveTransition(statePath);
  const afterFirstRun = readJson(statePath);
  assertPreserved(baseline, afterFirstRun, originalHeaders);
  const secondRun = rehearseAdditiveTransition(statePath);
  const afterSecondRun = readJson(statePath);
  assert.equal(secondRun.stepsApplied, 0, "La segunda transición agregó estructuras o campos.");
  assert.equal(stable(afterSecondRun), stable(afterFirstRun), "La segunda transición alteró filas o estructura.");
  assertPreserved(baseline, afterSecondRun, originalHeaders);

  const before = stateSnapshot(baseline);
  const after = stateSnapshot(afterSecondRun);
  const report = {
    task: "FEMA-UPD-23",
    result: "PASS — ensayo local aislado con fixture sintético",
    storage: "JSON temporal bajo el directorio privado del sistema; eliminado al terminar",
    recovery: "Fallo inyectado tras 4 escrituras locales; copia sintética restaurada y comparada byte-lógicamente",
    transition: {
      firstRun,
      secondRun,
      addedColumns: firstRun.columnsAdded,
      newSheetsCreated: firstRun.sheetsCreated,
    },
    comparison: {
      rowsBefore: before.totalRows,
      rowsAfter: after.totalRows,
      idsBefore: before.totalIds,
      idsAfter: after.totalIds,
      paymentsCentsBefore: records(baseline, "Pagos").reduce((sum, row) => sum + Math.round(Number(row.Monto) * 100), 0),
      paymentsCentsAfter: records(afterSecondRun, "Pagos").reduce((sum, row) => sum + Math.round(Number(row.Monto) * 100), 0),
      duplicateIdsPreserved: after.duplicates,
      referencesPreservedForResolution: after.references,
      amountsPreservedForResolution: after.amountDiscrepancies,
      activeRoomStates: records(afterSecondRun, "Habitaciones").map(({ IdHabitacion, EstadoActual, IdCicloActual }) => ({ IdHabitacion, EstadoActual, IdCicloActual })),
      activeCleaning: records(afterSecondRun, "Limpiezas").filter((row) => ["ASIGNADA", "EN_PROCESO"].includes(row.Estado)).map(({ IdLimpieza, IdHabitacion, Estado, FechaHoraInicio, FechaHoraFin }) => ({ IdLimpieza, IdHabitacion, Estado, FechaHoraInicio, FechaHoraFin })),
    },
    limitations: [
      "Valida sólo el contrato propuesto contra encabezados v1 locales y datos sintéticos; no inspecciona el esquema real de Sheets.",
      "No implementa ni activa el esquema v2 en Apps Script, Sheets, Docker o Producción.",
      "Las discrepancias y duplicados de la fixture quedan intactos y requieren resolución previa a una operación real.",
    ],
  };
  console.log(JSON.stringify(report, null, 2));
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
