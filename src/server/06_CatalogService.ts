const CATALOG_PERMISSION = "PER-CAT-GEST";
const RECEPTION_ROLE = "ROL-RECEPCION";
const VALID_SHIFTS = Object.freeze(["MATUTINO", "VESPERTINO", "NOCTURNO", "MIXTO"]);

function requiredText_(value: unknown, label: string): string {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} es obligatorio.`);
  return text;
}

function normalizedEmail_(value: unknown): string {
  const email = String(value ?? "").trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("El correo no tiene un formato válido.");
  return email;
}

function assertActiveMotel_(idMotel: string): void {
  const motel = requireRowById_(FEMA_CONFIG.sheets.motels, "IdMotel", idMotel);
  if (motel.Activo !== true) throw new Error("El hotel seleccionado no está activo.");
}

function listCatalogs_(user: FemaUser): CatalogState {
  assertPermission_(user, CATALOG_PERMISSION);
  const motels = readRows_(FEMA_CONFIG.sheets.motels).filter((row) => !isExampleRow_(row)).map((row) => ({
    idMotel: String(row.IdMotel), nombre: String(row.NombreMotel), zonaHoraria: String(row.ZonaHoraria), activo: row.Activo === true
  })).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const receptionists = readRows_(FEMA_CONFIG.sheets.users)
    .filter((row) => !isExampleRow_(row) && String(row.IdRol) === RECEPTION_ROLE)
    .map((row) => ({ idUsuario: String(row.IdUsuario), idMotel: String(row.IdMotel), correo: String(row.Correo ?? ""), nombre: String(row.Nombre), apellidos: String(row.Apellidos ?? ""), activo: row.Activo === true }))
    .sort((a, b) => `${a.nombre} ${a.apellidos}`.localeCompare(`${b.nombre} ${b.apellidos}`, "es"));
  const cleaningStaff = readRows_(FEMA_CONFIG.sheets.cleaningStaff).filter((row) => !isExampleRow_(row)).map((row) => ({
    idPersonalLimpieza: String(row.IdPersonalLimpieza), idMotel: String(row.IdMotel), nombre: String(row.Nombre), apellidos: String(row.Apellidos ?? ""), turnoHabitual: String(row.TurnoHabitual), activo: row.Activo === true
  })).sort((a, b) => `${a.nombre} ${a.apellidos}`.localeCompare(`${b.nombre} ${b.apellidos}`, "es"));
  return { user, motels, receptionists, cleaningStaff };
}

function saveMotel_(user: FemaUser, input: MotelInput): string {
  assertPermission_(user, CATALOG_PERMISSION);
  return withScriptLock_(() => {
    const nombre = requiredText_(input.nombre, "El nombre del hotel");
    const zonaHoraria = requiredText_(input.zonaHoraria || FEMA_CONFIG.timeZone, "La zona horaria");
    const duplicate = readRows_(FEMA_CONFIG.sheets.motels).find((row) => !isExampleRow_(row) && String(row.NombreMotel).trim().toLowerCase() === nombre.toLowerCase() && String(row.IdMotel) !== String(input.idMotel ?? ""));
    if (duplicate) throw new Error("Ya existe un hotel con ese nombre.");
    if (input.idMotel) {
      const before = requireRowById_(FEMA_CONFIG.sheets.motels, "IdMotel", input.idMotel);
      const patch = { NombreMotel: nombre, ZonaHoraria: zonaHoraria };
      updateRowById_(FEMA_CONFIG.sheets.motels, "IdMotel", input.idMotel, patch);
      writeAudit_(user, "CAMBIO", "MOTEL", input.idMotel, before, patch, "Edición desde catálogo", "CATALOGOS");
      return input.idMotel;
    }
    const id = newId_("MOTEL");
    const record = { IdMotel: id, NombreMotel: nombre, ZonaHoraria: zonaHoraria, Activo: true, CreadoEn: now_() };
    appendRow_(FEMA_CONFIG.sheets.motels, record);
    writeAudit_(user, "ALTA", "MOTEL", id, null, record, "Alta desde catálogo", "CATALOGOS");
    return id;
  });
}

function setMotelActive_(user: FemaUser, idMotel: string, active: boolean): void {
  assertPermission_(user, CATALOG_PERMISSION);
  withScriptLock_(() => {
    const before = requireRowById_(FEMA_CONFIG.sheets.motels, "IdMotel", idMotel);
    if (!active) {
      const hasActiveUsers = readRows_(FEMA_CONFIG.sheets.users).some((row) => String(row.IdMotel) === idMotel && row.Activo === true);
      const hasActiveRooms = readRows_(FEMA_CONFIG.sheets.rooms).some((row) => String(row.IdMotel) === idMotel && row.Activo === true);
      if (hasActiveUsers || hasActiveRooms) throw new Error("No se puede dar de baja: el hotel tiene usuarios o habitaciones activas.");
    }
    updateRowById_(FEMA_CONFIG.sheets.motels, "IdMotel", idMotel, { Activo: active });
    writeAudit_(user, active ? "REACTIVACION" : "BAJA", "MOTEL", idMotel, before, { Activo: active }, "Cambio de estado desde catálogo", "CATALOGOS");
  });
}

function saveReceptionist_(user: FemaUser, input: ReceptionistInput): string {
  assertPermission_(user, CATALOG_PERMISSION);
  return withScriptLock_(() => {
    const idMotel = requiredText_(input.idMotel, "El hotel");
    assertActiveMotel_(idMotel);
    const nombre = requiredText_(input.nombre, "El nombre");
    const apellidos = String(input.apellidos ?? "").trim();
    const correo = normalizedEmail_(input.correo);
    if (correo) {
      const duplicate = readRows_(FEMA_CONFIG.sheets.users).find((row) => String(row.Correo).trim().toLowerCase() === correo && String(row.IdUsuario) !== String(input.idUsuario ?? ""));
      if (duplicate) throw new Error("Ese correo ya está asignado a otro usuario.");
    }
    if (input.idUsuario) {
      const before = requireRowById_(FEMA_CONFIG.sheets.users, "IdUsuario", input.idUsuario);
      if (String(before.IdRol) !== RECEPTION_ROLE) throw new Error("El registro no pertenece al catálogo de recepción.");
      const patch = { IdMotel: idMotel, Correo: correo, Nombre: nombre, Apellidos: apellidos };
      updateRowById_(FEMA_CONFIG.sheets.users, "IdUsuario", input.idUsuario, patch);
      writeAudit_(user, "CAMBIO", "RECEPCIONISTA", input.idUsuario, before, patch, "Edición desde catálogo", "CATALOGOS");
      return input.idUsuario;
    }
    const id = newId_("USR");
    const record = { IdUsuario: id, IdMotel: idMotel, Correo: correo, Nombre: nombre, Apellidos: apellidos, IdRol: RECEPTION_ROLE, Activo: true, CreadoEn: now_() };
    appendRow_(FEMA_CONFIG.sheets.users, record);
    writeAudit_(user, "ALTA", "RECEPCIONISTA", id, null, record, "Alta desde catálogo", "CATALOGOS");
    return id;
  });
}

function setReceptionistActive_(user: FemaUser, idUsuario: string, active: boolean): void {
  assertPermission_(user, CATALOG_PERMISSION);
  withScriptLock_(() => {
    const before = requireRowById_(FEMA_CONFIG.sheets.users, "IdUsuario", idUsuario);
    if (String(before.IdRol) !== RECEPTION_ROLE) throw new Error("El registro no pertenece al catálogo de recepción.");
    updateRowById_(FEMA_CONFIG.sheets.users, "IdUsuario", idUsuario, { Activo: active });
    writeAudit_(user, active ? "REACTIVACION" : "BAJA", "RECEPCIONISTA", idUsuario, before, { Activo: active }, "Cambio de estado desde catálogo", "CATALOGOS");
  });
}

function saveCleaningStaff_(user: FemaUser, input: CleaningStaffInput): string {
  assertPermission_(user, CATALOG_PERMISSION);
  return withScriptLock_(() => {
    const idMotel = requiredText_(input.idMotel, "El hotel");
    assertActiveMotel_(idMotel);
    const nombre = requiredText_(input.nombre, "El nombre");
    const apellidos = String(input.apellidos ?? "").trim();
    const turnoHabitual = requiredText_(input.turnoHabitual, "El turno habitual").toUpperCase();
    if (!VALID_SHIFTS.includes(turnoHabitual)) throw new Error("El turno habitual no es válido.");
    if (input.idPersonalLimpieza) {
      const before = requireRowById_(FEMA_CONFIG.sheets.cleaningStaff, "IdPersonalLimpieza", input.idPersonalLimpieza);
      const patch = { IdMotel: idMotel, Nombre: nombre, Apellidos: apellidos, TurnoHabitual: turnoHabitual };
      updateRowById_(FEMA_CONFIG.sheets.cleaningStaff, "IdPersonalLimpieza", input.idPersonalLimpieza, patch);
      writeAudit_(user, "CAMBIO", "PERSONAL_LIMPIEZA", input.idPersonalLimpieza, before, patch, "Edición desde catálogo", "CATALOGOS");
      return input.idPersonalLimpieza;
    }
    const id = newId_("LIM");
    const record = { IdPersonalLimpieza: id, IdMotel: idMotel, Nombre: nombre, Apellidos: apellidos, TurnoHabitual: turnoHabitual, Activo: true, CreadoEn: now_() };
    appendRow_(FEMA_CONFIG.sheets.cleaningStaff, record);
    writeAudit_(user, "ALTA", "PERSONAL_LIMPIEZA", id, null, record, "Alta desde catálogo", "CATALOGOS");
    return id;
  });
}

function setCleaningStaffActive_(user: FemaUser, id: string, active: boolean): void {
  assertPermission_(user, CATALOG_PERMISSION);
  withScriptLock_(() => {
    const before = requireRowById_(FEMA_CONFIG.sheets.cleaningStaff, "IdPersonalLimpieza", id);
    updateRowById_(FEMA_CONFIG.sheets.cleaningStaff, "IdPersonalLimpieza", id, { Activo: active });
    writeAudit_(user, active ? "REACTIVACION" : "BAJA", "PERSONAL_LIMPIEZA", id, before, { Activo: active }, "Cambio de estado desde catálogo", "CATALOGOS");
  });
}
