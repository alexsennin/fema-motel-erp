function formatShiftDate_(value: CellValue): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return Utilities.formatDate(date, FEMA_CONFIG.timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function shiftEmployeeNames_(): Map<string, string> {
  return new Map(readRows_(FEMA_CONFIG.sheets.users)
    .filter((row) => !isExampleRow_(row))
    .map((row) => [String(row.IdUsuario), `${String(row.Nombre)} ${String(row.Apellidos)}`.trim()]));
}

function toShiftView_(row: SheetRow, names: Map<string, string>): ShiftView {
  const employeeId = String(row.IdUsuarioApertura);
  return {
    idTurno: String(row.IdTurno),
    idMotel: String(row.IdMotel),
    idEmpleadoApertura: employeeId,
    empleadoApertura: names.get(employeeId) ?? employeeId,
    fechaHoraApertura: formatShiftDate_(row.FechaHoraApertura),
    fechaHoraCierre: formatShiftDate_(row.FechaHoraCierre),
    estado: String(row.Estado) as ShiftStatus
  };
}

function getShiftState_(user: FemaUser): ShiftState {
  const names = shiftEmployeeNames_();
  const shifts = readRows_(FEMA_CONFIG.sheets.shifts)
    .filter((row) => !isExampleRow_(row) && String(row.IdMotel) === user.idMotel)
    .sort((a, b) => new Date(String(b.FechaHoraApertura)).getTime() - new Date(String(a.FechaHoraApertura)).getTime());
  const activeRow = shifts.find((row) => String(row.Estado) === "ABIERTO") ?? null;
  const activeShift = activeRow ? toShiftView_(activeRow, names) : null;
  return {
    activeShift,
    recentShifts: shifts.slice(0, 10).map((row) => toShiftView_(row, names)),
    canOperate: Boolean(activeRow && String(activeRow.IdUsuarioApertura) === user.idUsuario)
  };
}

function requireOpenShiftForUser_(user: FemaUser, idTurno?: string): SheetRow {
  const shift = readRows_(FEMA_CONFIG.sheets.shifts).find((row) =>
    !isExampleRow_(row) && String(row.IdMotel) === user.idMotel && String(row.Estado) === "ABIERTO"
  );
  if (!shift) throw new Error("Debes abrir un turno antes de operar habitaciones.");
  if (idTurno && String(shift.IdTurno) !== idTurno) throw new Error("El turno de la operación ya no está vigente.");
  if (String(shift.IdUsuarioApertura) !== user.idUsuario) {
    throw new Error("El turno abierto pertenece a otro recepcionista. Podrás operar cuando cierre y abras tu turno.");
  }
  return shift;
}

function openShift_(user: FemaUser): ShiftState {
  assertPermission_(user, "PER-HAB-GEST");
  return withScriptLock_(() => {
    const openShift = readRows_(FEMA_CONFIG.sheets.shifts).find((row) =>
      !isExampleRow_(row) && String(row.IdMotel) === user.idMotel && String(row.Estado) === "ABIERTO"
    );
    if (openShift) throw new Error("Ya existe un turno abierto para este hotel.");

    appendRow_(FEMA_CONFIG.sheets.shifts, {
      IdTurno: newId_("TUR"),
      IdMotel: user.idMotel,
      IdUsuarioApertura: user.idUsuario,
      FechaHoraApertura: now_(),
      FondoInicial: 0,
      Estado: "ABIERTO",
      IdUsuarioCierre: "",
      FechaHoraCierre: ""
    });
    return getShiftState_(user);
  });
}

function closeShift_(user: FemaUser, idTurno: string): ShiftState {
  assertPermission_(user, "PER-HAB-GEST");
  return withScriptLock_(() => {
    const shift = requireOpenShiftForUser_(user, idTurno);
    updateRowById_(FEMA_CONFIG.sheets.shifts, "IdTurno", String(shift.IdTurno), {
      Estado: "CERRADO",
      IdUsuarioCierre: user.idUsuario,
      FechaHoraCierre: now_()
    });
    return getShiftState_(user);
  });
}
