function getMasterSpreadsheet_(): GoogleAppsScript.Spreadsheet.Spreadsheet {
  return SpreadsheetApp.openById(FEMA_CONFIG.spreadsheetId);
}

const DEFAULT_SHEET_HEADERS_: Record<string, string[]> = {
  Productos: ["IdProducto", "IdMotel", "Categoria", "Nombre", "PrecioVenta", "CostoUnitario", "Activo", "CreadoEn"],
  Inventario: ["IdInventario", "IdMotel", "IdProducto", "StockBodega", "StockAnaquel", "ActualizadoEn"],
  MovimientosInventario: ["IdMovimiento", "IdMotel", "IdProducto", "TipoMovimiento", "Origen", "Destino", "Cantidad", "StockBodegaDespues", "StockAnaquelDespues", "Motivo", "IdTurno", "IdEstancia", "IdUsuario", "FechaHora"],
  Cargos: ["IdCargo", "IdEstancia", "IdTurno", "TipoCargo", "Descripcion", "Cantidad", "PrecioUnitario", "Total", "FechaHora", "IdUsuario", "Estado", "IdMotel", "IdVenta", "IdProducto"],
  Pagos: ["IdPago", "IdEstancia", "IdTurno", "FechaHora", "FormaPago", "Monto", "Referencia", "IdUsuario", "Estado", "IdMotel", "Concepto"],
  Operaciones: ["IdOperacion", "IdMotel", "Tipo", "Estado", "ResultadoJSON", "IdUsuario", "FechaHora"],
  Ventas: ["IdVenta", "IdMotel", "IdEstancia", "IdTurno", "Total", "Items", "Estado", "IdPago", "IdUsuario", "FechaHora"],
  CategoriasProducto: ["IdCategoria", "IdMotel", "Nombre", "Orden", "Activo"]
};

function getRequiredSheet_(name: string): GoogleAppsScript.Spreadsheet.Sheet {
  const ss = getMasterSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    const headers = DEFAULT_SHEET_HEADERS_[name];
    if (headers && headers.length > 0) {
      sheet = ss.insertSheet(name);
      sheet.getRange(FEMA_CONFIG.headerRow, 1, 1, headers.length).setValues([headers]);
      return sheet;
    }
    throw new Error(`No existe la pestaña requerida: ${name}`);
  }
  return sheet;
}

const ROWS_CACHE_: Record<string, SheetRow[]> = {};

function clearRowsCache_(sheetName?: string): void {
  if (sheetName) {
    delete ROWS_CACHE_[sheetName];
  } else {
    Object.keys(ROWS_CACHE_).forEach((k) => delete ROWS_CACHE_[k]);
  }
}

function readRows_(sheetName: string): SheetRow[] {
  if (ROWS_CACHE_[sheetName]) {
    return ROWS_CACHE_[sheetName].map((r) => ({ ...r }));
  }

  const sheet = getRequiredSheet_(sheetName);
  const lastColumn = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  if (lastColumn === 0 || lastRow < FEMA_CONFIG.dataStartRow) return [];

  const headers = sheet
    .getRange(FEMA_CONFIG.headerRow, 1, 1, lastColumn)
    .getDisplayValues()[0]
    .map((header) => header.trim());
  const values = sheet
    .getRange(FEMA_CONFIG.dataStartRow, 1, lastRow - FEMA_CONFIG.dataStartRow + 1, lastColumn)
    .getValues();

  const rows = values
    .filter((row) => row.some((value) => value !== "" && value !== null))
    .map((row) => headers.reduce<SheetRow>((record, header, index) => {
      if (header) record[header] = (row[index] ?? null) as CellValue;
      return record;
    }, {}));

  ROWS_CACHE_[sheetName] = rows;
  return rows.map((r) => ({ ...r }));
}

function readDisplayRows_(sheetName: string): SheetRow[] {
  const sheet = getRequiredSheet_(sheetName);
  const lastColumn = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  if (lastColumn === 0 || lastRow < FEMA_CONFIG.dataStartRow) return [];
  const headers = sheet.getRange(FEMA_CONFIG.headerRow, 1, 1, lastColumn).getDisplayValues()[0].map((header) => header.trim());
  return sheet.getRange(FEMA_CONFIG.dataStartRow, 1, lastRow - FEMA_CONFIG.dataStartRow + 1, lastColumn).getDisplayValues()
    .filter((row) => row.some((value) => value !== ""))
    .map((row) => headers.reduce<SheetRow>((record, header, index) => {
      if (header) record[header] = row[index] ?? "";
      return record;
    }, {}));
}

function appendRow_(sheetName: string, record: SheetRow): void {
  delete ROWS_CACHE_[sheetName];
  const sheet = getRequiredSheet_(sheetName);
  const lastColumn = sheet.getLastColumn();
  const headers = sheet
    .getRange(FEMA_CONFIG.headerRow, 1, 1, lastColumn)
    .getDisplayValues()[0]
    .map((header) => header.trim());
  const row = headers.map((header) => record[header] ?? "");
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
}

function findRowById_(sheetName: string, idColumn: string, id: string): SheetRow | null {
  return readRows_(sheetName).find((row) => String(row[idColumn]) === id) ?? null;
}

function requireRowById_(sheetName: string, idColumn: string, id: string): SheetRow {
  const row = findRowById_(sheetName, idColumn, id);
  if (!row || isExampleRow_(row)) throw new Error(`No se encontró ${id} en ${sheetName}`);
  return row;
}

function updateRowById_(sheetName: string, idColumn: string, id: string, patch: SheetRow): void {
  delete ROWS_CACHE_[sheetName];
  const sheet = getRequiredSheet_(sheetName);
  const lastColumn = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  const headers = sheet.getRange(FEMA_CONFIG.headerRow, 1, 1, lastColumn).getDisplayValues()[0];
  const idColumnIndex = headers.indexOf(idColumn);
  if (idColumnIndex < 0) throw new Error(`No existe la columna ${idColumn} en ${sheetName}`);
  if (lastRow < FEMA_CONFIG.dataStartRow) throw new Error(`No se encontró ${id} en ${sheetName}`);

  // Validar que todas las columnas del patch existan en la hoja
  Object.keys(patch).forEach((columnName) => {
    if (headers.indexOf(columnName) < 0) throw new Error(`No existe la columna ${columnName} en ${sheetName}`);
  });

  const ids = sheet
    .getRange(FEMA_CONFIG.dataStartRow, idColumnIndex + 1, lastRow - FEMA_CONFIG.dataStartRow + 1, 1)
    .getDisplayValues();
  const offset = ids.findIndex(([value]) => value === id);
  if (offset < 0) throw new Error(`No se encontró ${id} en ${sheetName}`);
  const rowNumber = FEMA_CONFIG.dataStartRow + offset;

  // Escritura de fila completa con setValues en una sola llamada
  const rowValues = sheet.getRange(rowNumber, 1, 1, lastColumn).getValues()[0];
  Object.keys(patch).forEach((columnName) => {
    const columnIndex = headers.indexOf(columnName);
    rowValues[columnIndex] = patch[columnName];
  });
  sheet.getRange(rowNumber, 1, 1, lastColumn).setValues([rowValues]);
}

function newId_(prefix: string): string {
  return `${prefix}-${Utilities.getUuid()}`;
}

function now_(): Date {
  return new Date();
}

function formatIso_(date: CellValue | Date): string {
  if (!date || typeof date === "boolean") return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return Utilities.formatDate(d, FEMA_CONFIG.timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function isRowActive_(value: CellValue): boolean {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  const text = String(value ?? "").trim().toUpperCase();
  if (text === "FALSE" || text === "FALSO" || text === "0" || text === "NO" || text === "INACTIVO" || text === "BAJA") {
    return false;
  }
  if (text === "TRUE" || text === "VERDADERO" || text === "1" || text === "SI" || text === "S" || text === "ACTIVO" || text === "ACTIVA") {
    return true;
  }
  return text === "";
}

function isExampleRow_(row: SheetRow): boolean {
  return Object.values(row).some((value) => String(value).includes(FEMA_CONFIG.exampleMarker));
}
