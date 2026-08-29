function getMasterSpreadsheet_(): GoogleAppsScript.Spreadsheet.Spreadsheet {
  return SpreadsheetApp.openById(FEMA_CONFIG.spreadsheetId);
}

function getRequiredSheet_(name: string): GoogleAppsScript.Spreadsheet.Sheet {
  const sheet = getMasterSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error(`No existe la pestaña requerida: ${name}`);
  return sheet;
}

function readRows_(sheetName: string): SheetRow[] {
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

  return values
    .filter((row) => row.some((value) => value !== "" && value !== null))
    .map((row) => headers.reduce<SheetRow>((record, header, index) => {
      if (header) record[header] = (row[index] ?? null) as CellValue;
      return record;
    }, {}));
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
  const sheet = getRequiredSheet_(sheetName);
  const lastColumn = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  const headers = sheet.getRange(FEMA_CONFIG.headerRow, 1, 1, lastColumn).getDisplayValues()[0];
  const idColumnIndex = headers.indexOf(idColumn);
  if (idColumnIndex < 0) throw new Error(`No existe la columna ${idColumn} en ${sheetName}`);
  if (lastRow < FEMA_CONFIG.dataStartRow) throw new Error(`No se encontró ${id} en ${sheetName}`);

  const ids = sheet
    .getRange(FEMA_CONFIG.dataStartRow, idColumnIndex + 1, lastRow - FEMA_CONFIG.dataStartRow + 1, 1)
    .getDisplayValues();
  const offset = ids.findIndex(([value]) => value === id);
  if (offset < 0) throw new Error(`No se encontró ${id} en ${sheetName}`);
  const rowNumber = FEMA_CONFIG.dataStartRow + offset;

  Object.keys(patch).forEach((columnName) => {
    const columnIndex = headers.indexOf(columnName);
    if (columnIndex < 0) throw new Error(`No existe la columna ${columnName} en ${sheetName}`);
    sheet.getRange(rowNumber, columnIndex + 1).setValue(patch[columnName]);
  });
}

function newId_(prefix: string): string {
  return `${prefix}-${Utilities.getUuid()}`;
}

function now_(): Date {
  return new Date();
}

function isExampleRow_(row: SheetRow): boolean {
  return Object.values(row).some((value) => String(value).includes(FEMA_CONFIG.exampleMarker));
}
