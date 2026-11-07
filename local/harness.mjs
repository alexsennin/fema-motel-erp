import { randomUUID } from "node:crypto";
import { localSeed, sheetHeaders } from "./seed-data.mjs";

const DATA_CAPACITY_BYTES = 4 * 1024 * 1024;
const DATA_HEADER_BYTES = 8;

export function createDatabaseBuffers(seed = localSeed) {
  const dataBuffer = new SharedArrayBuffer(DATA_HEADER_BYTES + DATA_CAPACITY_BYTES);
  const databaseLockBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
  const database = Object.fromEntries(Object.entries(sheetHeaders).map(([name, headers]) => [
    name,
    (seed[name] || []).map((record) => headers.map((header) => record[header] ?? "")),
  ]));
  writeDatabase(dataBuffer, database);
  return { dataBuffer, databaseLockBuffer };
}

function acquireMutex(buffer, timeoutMs = 30_000) {
  const mutex = new Int32Array(buffer);
  const deadline = Date.now() + timeoutMs;
  while (Atomics.compareExchange(mutex, 0, 0, 1) !== 0) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error("Se agotó el tiempo de espera del lock local compartido.");
    Atomics.wait(mutex, 0, 1, Math.min(remaining, 100));
  }
  return () => {
    Atomics.store(mutex, 0, 0);
    Atomics.notify(mutex, 0, 1);
  };
}

function writeDatabase(buffer, database) {
  const encoded = new TextEncoder().encode(JSON.stringify(database));
  if (encoded.length > DATA_CAPACITY_BYTES) throw new Error("El almacén local compartido excedió su capacidad.");
  new Uint8Array(buffer, DATA_HEADER_BYTES, encoded.length).set(encoded);
  Atomics.store(new Int32Array(buffer, 0, 2), 1, encoded.length);
}

function readDatabase(buffer) {
  const length = Atomics.load(new Int32Array(buffer, 0, 2), 1);
  const bytes = new Uint8Array(buffer, DATA_HEADER_BYTES, length);
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function createLocalStore({
  dataBuffer,
  databaseLockBuffer,
  failureState = null,
  writeHoldMs = 0,
} = {}) {
  const headersBySheet = sheetHeaders;
  let shouldHoldWrite = writeHoldMs > 0;

  function snapshot() {
    const release = acquireMutex(databaseLockBuffer);
    try { return readDatabase(dataBuffer); }
    finally { release(); }
  }

  function writeRange(name, row, column, values) {
    if (failureState?.next) {
      const failure = failureState.next;
      const matches = failure.sheet === name && failure.row === row && failure.column === column;
      if (matches) {
        failureState.next = null;
        throw new Error(`FEMA_LOCAL_INJECTED_WRITE_FAILURE: ${name}!R${row}C${column}`);
      }
    }

    if (shouldHoldWrite) {
      shouldHoldWrite = false;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)), 0, 0, writeHoldMs);
    }

    const release = acquireMutex(databaseLockBuffer);
    try {
      const database = readDatabase(dataBuffer);
      const rows = database[name];
      if (!rows) throw new Error(`No existe la pestaña local: ${name}`);
      values.forEach((newRow, rowOffset) => {
        const targetRow = row + rowOffset - 5;
        while (rows.length <= targetRow) rows.push(Array(headersBySheet[name].length).fill(""));
        newRow.forEach((value, columnOffset) => {
          rows[targetRow][column + columnOffset - 1] = value;
        });
      });
      writeDatabase(dataBuffer, database);
    } finally {
      release();
    }
  }

  function sheet(name) {
    const headers = headersBySheet[name];
    if (!headers) return null;
    return {
      getLastColumn: () => headers.length,
      getLastRow: () => 4 + (snapshot()[name] || []).length,
      getRange(row, column, numberOfRows = 1, numberOfColumns = 1) {
        const readCell = (r, c) => {
          if (r === 4) return headers[c - 1] ?? "";
          const rows = snapshot()[name] || [];
          return rows[r - 5]?.[c - 1] ?? "";
        };
        const display = (value) => value instanceof Date ? value.toISOString() : String(value ?? "");
        return {
          getValues: () => {
            const rows = snapshot()[name] || [];
            return Array.from({ length: numberOfRows }, (_, rowOffset) => Array.from({ length: numberOfColumns }, (_, columnOffset) => {
              const currentRow = row + rowOffset;
              const currentColumn = column + columnOffset;
              if (currentRow === 4) return headers[currentColumn - 1] ?? "";
              return rows[currentRow - 5]?.[currentColumn - 1] ?? "";
            }));
          },
          getDisplayValues: () => Array.from({ length: numberOfRows }, (_, rowOffset) => Array.from({ length: numberOfColumns }, (_, columnOffset) => display(readCell(row + rowOffset, column + columnOffset)))),
          setValue(value) { this.setValues([[value]]); },
          setValues(values) { writeRange(name, row, column, values); },
        };
      },
    };
  }

  return {
    dataBuffer,
    databaseLockBuffer,
    sheet,
    inspect(name) {
      const headers = headersBySheet[name];
      if (!headers) throw new Error(`Pestaña local desconocida: ${name}`);
      return (snapshot()[name] || []).map((row) => headers.reduce((record, header, index) => {
        record[header] = row[index] ?? "";
        return record;
      }, {}));
    },
    armWriteFailure({ sheet: name, row, column }) {
      if (!headersBySheet[name]) throw new Error(`Pestaña local desconocida: ${name}`);
      if (!Number.isInteger(row) || row < 5 || !Number.isInteger(column) || column < 1 || column > headersBySheet[name].length) {
        throw new Error("La falla local requiere una celda de datos válida (fila >= 5 y columna dentro de la pestaña).");
      }
      if (!failureState) throw new Error("La inyección de fallos no está habilitada para este runtime.");
      failureState.next = { sheet: name, row, column };
    },
  };
}

export function createScriptLockBuffer() {
  return new SharedArrayBuffer(2 * Int32Array.BYTES_PER_ELEMENT);
}

export function createScriptLock(buffer) {
  const state = new Int32Array(buffer);
  return {
    waitLock(timeoutMs = 30_000) {
      const deadline = Date.now() + timeoutMs;
      while (Atomics.compareExchange(state, 0, 0, 1) !== 0) {
        Atomics.add(state, 1, 1);
        const remaining = deadline - Date.now();
        if (remaining <= 0) throw new Error("No fue posible obtener el lock local de Apps Script simulado.");
        Atomics.wait(state, 0, 1, Math.min(remaining, 100));
      }
    },
    releaseLock() {
      Atomics.store(state, 0, 0);
      Atomics.notify(state, 0, 1);
    },
  };
}

export function createClock(epochMs = Date.now()) {
  return {
    now: () => epochMs,
    set(value) { epochMs = value; },
  };
}

function controlledDate(clock) {
  const NativeDate = Date;
  return class LocalDate extends NativeDate {
    constructor(...args) {
      if (args.length === 0) super(clock.now());
      else super(...args);
    }
    static now() { return clock.now(); }
  };
}

function formatDate(date, timeZone, pattern) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date).map(({ type, value }) => [type, value]));
  if (pattern === "HH:mm") return `${parts.hour}:${parts.minute}`;
  if (pattern === "yyyy-MM-dd") return `${parts.year}-${parts.month}-${parts.day}`;
  const localAsUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
  const offsetMinutes = Math.round((localAsUtc - date.getTime()) / 60000);
  const sign = offsetMinutes < 0 ? "-" : "+";
  const offset = Math.abs(offsetMinutes);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${sign}${String(Math.floor(offset / 60)).padStart(2, "0")}:${String(offset % 60).padStart(2, "0")}`;
}

export function createLocalRuntime({ store, identity, clock, scriptLockBuffer, logger = console }) {
  const spreadsheet = { getSheetByName: (name) => store.sheet(name) };
  return {
    console: logger,
    Error,
    Date: controlledDate(clock),
    SpreadsheetApp: { openById: () => spreadsheet },
    Session: {
      getActiveUser: () => ({ getEmail: () => identity }),
      getEffectiveUser: () => ({ getEmail: () => identity }),
    },
    LockService: { getScriptLock: () => createScriptLock(scriptLockBuffer) },
    Utilities: { getUuid: randomUUID, formatDate },
  };
}

export function sharedLockContentions(buffer) {
  return Atomics.load(new Int32Array(buffer), 1);
}
