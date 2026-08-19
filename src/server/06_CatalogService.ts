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
  const roomTypes = readRows_(FEMA_CONFIG.sheets.roomTypes).filter((row) => !isExampleRow_(row)).map((row) => ({
    idTipo: String(row.IdTipo), idMotel: String(row.IdMotel), nombre: String(row.NombreTipo), precioPersonaExtra: Number(row.PrecioPersonaExtra) || 0, activo: row.Activo === true
  })).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const catalogRooms = readRows_(FEMA_CONFIG.sheets.rooms).filter((row) => !isExampleRow_(row)).map((row) => ({
    idHabitacion: String(row.IdHabitacion), idMotel: String(row.IdMotel), numero: String(row.NumeroHabitacion), idTipo: String(row.IdTipo),
    puntosLimpieza: Number(row.PuntosLimpieza) || 0, estado: String(row.EstadoActual) as RoomStatus, idCicloActual: String(row.IdCicloActual ?? ""), activo: row.Activo === true
  })).sort((a, b) => a.numero.localeCompare(b.numero, "es", { numeric: true }));
  return { user, motels, receptionists, cleaningStaff, roomTypes, catalogRooms };
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

function saveRoomType_(user: FemaUser, input: RoomTypeInput): string {
  assertPermission_(user, CATALOG_PERMISSION);
  return withScriptLock_(() => {
    const idMotel = requiredText_(input.idMotel, "El hotel");
    assertActiveMotel_(idMotel);
    const nombre = requiredText_(input.nombre, "El nombre del tipo").toUpperCase();
    const precioPersonaExtra = Math.max(0, Number(input.precioPersonaExtra) || 0);
    const duplicate = readRows_(FEMA_CONFIG.sheets.roomTypes).find((row) => !isExampleRow_(row) && String(row.IdMotel) === idMotel && String(row.NombreTipo).trim().toUpperCase() === nombre && String(row.IdTipo) !== String(input.idTipo ?? ""));
    if (duplicate) throw new Error("Ya existe ese tipo de habitación en el hotel seleccionado.");
    if (input.idTipo) {
      const before = requireRowById_(FEMA_CONFIG.sheets.roomTypes, "IdTipo", input.idTipo);
      const patch = { IdMotel: idMotel, NombreTipo: nombre, PrecioPersonaExtra: precioPersonaExtra };
      updateRowById_(FEMA_CONFIG.sheets.roomTypes, "IdTipo", input.idTipo, patch);
      writeAudit_(user, "CAMBIO", "TIPO_HABITACION", input.idTipo, before, patch, "Edición desde catálogo", "CATALOGOS");
      return input.idTipo;
    }
    const id = newId_("TIP");
    const record = { IdTipo: id, IdMotel: idMotel, NombreTipo: nombre, PrecioPersonaExtra: precioPersonaExtra, Activo: true };
    appendRow_(FEMA_CONFIG.sheets.roomTypes, record);
    writeAudit_(user, "ALTA", "TIPO_HABITACION", id, null, record, "Alta desde catálogo", "CATALOGOS");
    return id;
  });
}

function setRoomTypeActive_(user: FemaUser, idTipo: string, active: boolean): void {
  assertPermission_(user, CATALOG_PERMISSION);
  withScriptLock_(() => {
    const before = requireRowById_(FEMA_CONFIG.sheets.roomTypes, "IdTipo", idTipo);
    if (!active) {
      const hasRooms = readRows_(FEMA_CONFIG.sheets.rooms).some((row) => String(row.IdTipo) === idTipo && row.Activo === true);
      const hasRates = readRows_(FEMA_CONFIG.sheets.rates).some((row) => String(row.IdTipo) === idTipo && row.Activo === true);
      if (hasRooms || hasRates) throw new Error("No se puede dar de baja: el tipo tiene habitaciones o tarifas activas.");
    }
    updateRowById_(FEMA_CONFIG.sheets.roomTypes, "IdTipo", idTipo, { Activo: active });
    writeAudit_(user, active ? "REACTIVACION" : "BAJA", "TIPO_HABITACION", idTipo, before, { Activo: active }, "Cambio de estado desde catálogo", "CATALOGOS");
  });
}

function saveRoom_(user: FemaUser, input: RoomInput): string {
  assertPermission_(user, CATALOG_PERMISSION);
  return withScriptLock_(() => {
    const idMotel = requiredText_(input.idMotel, "El hotel");
    assertActiveMotel_(idMotel);
    const numero = requiredText_(input.numero, "El número de habitación");
    const idTipo = requiredText_(input.idTipo, "El tipo de habitación");
    const roomType = requireRowById_(FEMA_CONFIG.sheets.roomTypes, "IdTipo", idTipo);
    if (roomType.Activo !== true || String(roomType.IdMotel) !== idMotel) throw new Error("El tipo de habitación no corresponde al hotel seleccionado.");
    const puntosLimpieza = Math.max(0, Math.floor(Number(input.puntosLimpieza) || 0));
    const duplicate = readRows_(FEMA_CONFIG.sheets.rooms).find((row) => !isExampleRow_(row) && String(row.IdMotel) === idMotel && String(row.NumeroHabitacion).trim().toLowerCase() === numero.toLowerCase() && String(row.IdHabitacion) !== String(input.idHabitacion ?? ""));
    if (duplicate) throw new Error("Ya existe una habitación con ese número en el hotel seleccionado.");
    if (input.idHabitacion) {
      const before = requireRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion);
      if (String(before.EstadoActual) !== "DISPONIBLE" || before.IdCicloActual) throw new Error("Solo se puede editar una habitación disponible y sin ciclo activo.");
      const patch = { IdMotel: idMotel, NumeroHabitacion: numero, IdTipo: idTipo, PuntosLimpieza: puntosLimpieza };
      updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion, patch);
      writeAudit_(user, "CAMBIO", "HABITACION", input.idHabitacion, before, patch, "Edición desde catálogo", "CATALOGOS");
      return input.idHabitacion;
    }
    const id = newId_("HAB");
    const record = { IdHabitacion: id, IdMotel: idMotel, NumeroHabitacion: numero, IdTipo: idTipo, PuntosLimpieza: puntosLimpieza, EstadoActual: "DISPONIBLE", IdCicloActual: "", Activo: true };
    appendRow_(FEMA_CONFIG.sheets.rooms, record);
    writeAudit_(user, "ALTA", "HABITACION", id, null, record, "Alta desde catálogo", "CATALOGOS");
    return id;
  });
}

function setRoomActive_(user: FemaUser, idHabitacion: string, active: boolean): void {
  assertPermission_(user, CATALOG_PERMISSION);
  withScriptLock_(() => {
    const before = requireRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", idHabitacion);
    if (!active && (String(before.EstadoActual) !== "DISPONIBLE" || before.IdCicloActual)) throw new Error("Solo se puede dar de baja una habitación disponible y sin ciclo activo.");
    updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", idHabitacion, { Activo: active });
    writeAudit_(user, active ? "REACTIVACION" : "BAJA", "HABITACION", idHabitacion, before, { Activo: active }, "Cambio de estado desde catálogo", "CATALOGOS");
  });
}
