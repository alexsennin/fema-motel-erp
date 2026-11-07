function listRoomCards_(user: FemaUser): RoomCard[] {
  const roomTypes = new Map(readRows_(FEMA_CONFIG.sheets.roomTypes)
    .filter((row) => isRowActive_(row.Activo) && !isExampleRow_(row))
    .map((row) => [String(row.IdTipo), String(row.NombreTipo)]));
  const extraPersonPrices = new Map(readRows_(FEMA_CONFIG.sheets.roomTypes)
    .filter((row) => isRowActive_(row.Activo) && !isExampleRow_(row))
    .map((row) => [String(row.IdTipo), Number(row.PrecioPersonaExtra) || 0]));
  const rates = readRows_(FEMA_CONFIG.sheets.rates).filter((row) => isRowActive_(row.Activo) && !isExampleRow_(row));
  const activeStays = new Map(readRows_(FEMA_CONFIG.sheets.stays)
    .filter((row) => !isExampleRow_(row) && String(row.IdMotel) === user.idMotel && String(row.EstadoEstancia) === "ACTIVA")
    .map((row) => [String(row.IdCiclo), row]));
  const cleaningNames = new Map(readRows_(FEMA_CONFIG.sheets.cleaningStaff)
    .filter((row) => !isExampleRow_(row))
    .map((row) => [String(row.IdPersonalLimpieza), `${String(row.Nombre)} ${String(row.Apellidos ?? "")}`.trim()]));
  const activeCleanings = new Map(readRows_(FEMA_CONFIG.sheets.cleanings)
    .filter((row) => !isExampleRow_(row) && ["ASIGNADA", "EN_PROCESO"].includes(String(row.Estado)))
    .map((row) => [String(row.IdCiclo), row]));

  return readRows_(FEMA_CONFIG.sheets.rooms)
    .filter((room) => room.Activo === true && String(room.IdMotel) === user.idMotel && !isExampleRow_(room))
    .map((room) => {
      const typeId = String(room.IdTipo);
      const activeStay = room.IdCicloActual ? activeStays.get(String(room.IdCicloActual)) : null;
      const activeCleaning = room.IdCicloActual ? activeCleanings.get(String(room.IdCicloActual)) : null;
      const prices = rates.filter((rate) => String(rate.IdTipo) === typeId).map((rate) => Number(rate.PrecioBase) || 0);
      return {
        idHabitacion: String(room.IdHabitacion),
        idMotel: String(room.IdMotel),
        idTipo: typeId,
        numeroHabitacion: String(room.NumeroHabitacion),
        tipoHabitacion: roomTypes.get(typeId) ?? "Sin tipo",
        precioDesde: prices.length ? Math.min(...prices) : 0,
        puntosLimpieza: Number(room.PuntosLimpieza) || 0,
        estado: String(room.EstadoActual) as RoomStatus,
        idCicloActual: room.IdCicloActual ? String(room.IdCicloActual) : null,
        idEstanciaActiva: activeStay ? String(activeStay.IdEstancia) : null,
        fechaHoraEntrada: activeStay ? formatShiftDate_(activeStay.FechaHoraEntrada) : "",
        fechaHoraSalidaPrevista: activeStay ? formatShiftDate_(activeStay.FechaHoraSalidaPrevista) : "",
        marcaModeloVehiculo: activeStay ? String(activeStay.MarcaModeloVehiculo ?? "") : "",
        placas: activeStay ? String(activeStay.Placas ?? "") : "",
        personasExtra: activeStay ? Number(activeStay.PersonasExtra) || 0 : 0,
        precioCatalogo: activeStay ? Number(activeStay.PrecioCatalogo) || 0 : 0,
        ajustePrecio: activeStay ? Number(activeStay.AjustePrecio) || 0 : 0,
        precioFinal: activeStay ? Number(activeStay.PrecioFinal) || 0 : 0,
        precioPersonaExtra: extraPersonPrices.get(typeId) ?? 0,
        idLimpiezaActiva: activeCleaning ? String(activeCleaning.IdLimpieza) : null,
        personalLimpieza: activeCleaning ? cleaningNames.get(String(activeCleaning.IdPersonalLimpieza)) ?? String(activeCleaning.IdPersonalLimpieza) : "",
        fechaHoraInicioLimpieza: activeCleaning ? formatShiftDate_(activeCleaning.FechaHoraInicio || activeCleaning.FechaHoraAsignacion) : ""
      };
    })
    .sort((a, b) => a.numeroHabitacion.localeCompare(b.numeroHabitacion, "es", { numeric: true }));
}

function listCleaningStaffOptions_(user: FemaUser): CleaningStaffOption[] {
  const motel = requireRowById_(FEMA_CONFIG.sheets.motels, "IdMotel", user.idMotel);
  const timeZone = String(motel.ZonaHoraria || FEMA_CONFIG.timeZone);
  const currentTime = Utilities.formatDate(now_(), timeZone, "HH:mm");
  const activeShiftNames = new Set(readCleaningShiftRows_()
    .filter((row) => !isExampleRow_(row) && String(row.Activo).toUpperCase() === "TRUE" && String(row.IdMotel) === user.idMotel && timeInRange_(currentTime, clockValue_(row.HoraInicio), clockValue_(row.HoraFin)))
    .map((row) => String(row.NombreTurno)));
  const roomNumbers = new Map(readRows_(FEMA_CONFIG.sheets.rooms)
    .filter((row) => String(row.IdMotel) === user.idMotel && !isExampleRow_(row))
    .map((row) => [String(row.IdHabitacion), String(row.NumeroHabitacion)]));
  const activeByStaff = new Map(readRows_(FEMA_CONFIG.sheets.cleanings)
    .filter((row) => !isExampleRow_(row) && ["ASIGNADA", "EN_PROCESO"].includes(String(row.Estado)))
    .map((row) => [String(row.IdPersonalLimpieza), row]));

  return readRows_(FEMA_CONFIG.sheets.cleaningStaff)
    .filter((row) => !isExampleRow_(row) && row.Activo === true && String(row.IdMotel) === user.idMotel && activeShiftNames.has(String(row.TurnoHabitual)))
    .map((row) => {
      const active = activeByStaff.get(String(row.IdPersonalLimpieza));
      return {
        idPersonalLimpieza: String(row.IdPersonalLimpieza),
        idMotel: String(row.IdMotel),
        nombre: `${String(row.Nombre)} ${String(row.Apellidos ?? "")}`.trim(),
        turnoHabitual: String(row.TurnoHabitual),
        disponible: !active,
        habitacionAsignada: active ? roomNumbers.get(String(active.IdHabitacion)) ?? String(active.IdHabitacion) : ""
      };
    })
    .sort((a, b) => Number(b.disponible) - Number(a.disponible) || a.nombre.localeCompare(b.nombre, "es"));
}

function timeInRange_(current: string, start: string, end: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end) || start === end) return false;
  return start < end ? current >= start && current < end : current >= start || current < end;
}

function assertCleaningStaffOnCurrentShift_(staff: SheetRow, idMotel: string): void {
  const motel = requireRowById_(FEMA_CONFIG.sheets.motels, "IdMotel", idMotel);
  const currentTime = Utilities.formatDate(now_(), String(motel.ZonaHoraria || FEMA_CONFIG.timeZone), "HH:mm");
  const shift = readCleaningShiftRows_().find((row) =>
    !isExampleRow_(row) && String(row.Activo).toUpperCase() === "TRUE" && String(row.IdMotel) === idMotel &&
    String(row.NombreTurno) === String(staff.TurnoHabitual) && timeInRange_(currentTime, clockValue_(row.HoraInicio), clockValue_(row.HoraFin))
  );
  if (!shift) throw new Error("El personal seleccionado no se encuentra dentro de su horario de trabajo.");
}

function assignCleaning_(user: FemaUser, input: CleaningAssignmentInput): CleaningAssignmentResult {
  assertPermission_(user, "PER-HAB-GEST");
  if (!input.idempotencyKey) throw new Error("Falta la clave de idempotencia de la operación.");

  return withScriptLock_(() => {
    const duplicate = readRows_(FEMA_CONFIG.sheets.audit).find((row) => String(row.Motivo) === input.idempotencyKey);
    if (duplicate) throw new Error("Esta operación ya fue registrada.");
    const room = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion);
    if (!room || isExampleRow_(room) || String(room.IdMotel) !== user.idMotel) throw new Error("Habitación no encontrada.");
    if (String(room.EstadoActual) !== "SUCIA" || !room.IdCicloActual) throw new Error("La habitación ya no está sucia o no tiene un ciclo activo.");
    const cycleId = String(room.IdCicloActual);
    const existingCleaning = readRows_(FEMA_CONFIG.sheets.cleanings).find((row) =>
      !isExampleRow_(row) && String(row.IdCiclo) === cycleId && ["ASIGNADA", "EN_PROCESO"].includes(String(row.Estado))
    );
    if (existingCleaning) throw new Error("La habitación ya tiene una limpieza activa.");
    const staff = requireRowById_(FEMA_CONFIG.sheets.cleaningStaff, "IdPersonalLimpieza", input.idPersonalLimpieza);
    if (staff.Activo !== true || String(staff.IdMotel) !== String(room.IdMotel)) throw new Error("El personal seleccionado no pertenece al mismo motel de la habitación o no está activo.");
    assertCleaningStaffOnCurrentShift_(staff, String(room.IdMotel));
    const staffBusy = readRows_(FEMA_CONFIG.sheets.cleanings).some((row) =>
      !isExampleRow_(row) && String(row.IdPersonalLimpieza) === input.idPersonalLimpieza && ["ASIGNADA", "EN_PROCESO"].includes(String(row.Estado))
    );
    if (staffBusy) throw new Error("El personal seleccionado ya está atendiendo otra habitación.");
    const shift = requireOpenShiftForUser_(user);
    const assignedAt = now_();
    const cleaningId = newId_("LMP");

    appendRow_(FEMA_CONFIG.sheets.cleanings, {
      IdLimpieza: cleaningId, IdCiclo: cycleId, IdHabitacion: input.idHabitacion,
      IdPersonalLimpieza: input.idPersonalLimpieza, FechaHoraAsignacion: assignedAt,
      FechaHoraInicio: assignedAt, FechaHoraFin: "", MinutosLimpieza: "",
      Puntos: Number(room.PuntosLimpieza) || 0, Estado: "EN_PROCESO",
      IdUsuarioAsigna: user.idUsuario, IdUsuarioFinaliza: ""
    });
    appendRow_(FEMA_CONFIG.sheets.roomEvents, {
      IdEvento: newId_("EVT"), IdCiclo: cycleId, IdHabitacion: input.idHabitacion,
      EstadoAnterior: "SUCIA", EstadoNuevo: "LIMPIEZA", FechaHora: assignedAt,
      IdEmpleado: user.idUsuario, Comentario: `Limpieza asignada a ${String(staff.Nombre)}`,
      IdTurno: String(shift.IdTurno)
    });
    updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion, { EstadoActual: "LIMPIEZA" });
    writeAudit_(user, "ASIGNAR_LIMPIEZA", "LIMPIEZA", cleaningId, room,
      { cycleId, idPersonalLimpieza: input.idPersonalLimpieza, EstadoHabitacion: "LIMPIEZA" }, input.idempotencyKey);
    return { idLimpieza: cleaningId, idCiclo: cycleId, estadoHabitacion: "LIMPIEZA" };
  });
}

function completeCleaning_(user: FemaUser, input: CleaningCompletionInput): CleaningCompletionResult {
  assertPermission_(user, "PER-HAB-GEST");
  if (!input.idempotencyKey) throw new Error("Falta la clave de idempotencia de la operación.");
  return withScriptLock_(() => {
    const duplicate = readRows_(FEMA_CONFIG.sheets.audit).find((row) => String(row.Motivo) === input.idempotencyKey);
    if (duplicate) throw new Error("Esta operación ya fue registrada.");
    const room = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion);
    if (!room || isExampleRow_(room) || String(room.IdMotel) !== user.idMotel) throw new Error("Habitación no encontrada.");
    if (String(room.EstadoActual) !== "LIMPIEZA" || !room.IdCicloActual) throw new Error("La habitación ya no se encuentra en limpieza.");
    const cycleId = String(room.IdCicloActual);
    const cleaning = readRows_(FEMA_CONFIG.sheets.cleanings).find((row) =>
      !isExampleRow_(row) && String(row.IdCiclo) === cycleId && String(row.IdHabitacion) === input.idHabitacion &&
      ["ASIGNADA", "EN_PROCESO"].includes(String(row.Estado))
    );
    if (!cleaning) throw new Error("No se encontró una limpieza activa para la habitación.");
    const shift = requireOpenShiftForUser_(user);
    const finishedAt = now_();
    const startedAt = cleaning.FechaHoraInicio instanceof Date ? cleaning.FechaHoraInicio : new Date(String(cleaning.FechaHoraInicio || cleaning.FechaHoraAsignacion));
    const minutes = Number.isNaN(startedAt.getTime()) ? 0 : Math.max(0, Math.round((finishedAt.getTime() - startedAt.getTime()) / 60000));
    const cleaningId = String(cleaning.IdLimpieza);

    updateRowById_(FEMA_CONFIG.sheets.cleanings, "IdLimpieza", cleaningId, {
      FechaHoraFin: finishedAt, MinutosLimpieza: minutes, Estado: "FINALIZADA", IdUsuarioFinaliza: user.idUsuario
    });
    appendRow_(FEMA_CONFIG.sheets.roomEvents, {
      IdEvento: newId_("EVT"), IdCiclo: cycleId, IdHabitacion: input.idHabitacion,
      EstadoAnterior: "LIMPIEZA", EstadoNuevo: "DISPONIBLE", FechaHora: finishedAt,
      IdEmpleado: user.idUsuario, Comentario: "Limpieza finalizada", IdTurno: String(shift.IdTurno)
    });
    updateRowById_(FEMA_CONFIG.sheets.cycles, "IdCiclo", cycleId, { FechaHoraFin: finishedAt, EstadoCiclo: "CERRADO" });
    updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion, { EstadoActual: "DISPONIBLE", IdCicloActual: "" });
    writeAudit_(user, "FINALIZAR_LIMPIEZA", "LIMPIEZA", cleaningId, cleaning,
      { FechaHoraFin: finishedAt, MinutosLimpieza: minutes, Estado: "FINALIZADA", EstadoHabitacion: "DISPONIBLE" }, input.idempotencyKey);
    return { idLimpieza: cleaningId, idCiclo: cycleId, minutosLimpieza: minutes, estadoHabitacion: "DISPONIBLE" };
  });
}

function listRentalReport_(user: FemaUser): RentalReportRow[] {
  assertPermission_(user, "PER-HAB-GEST");
  const activeShift = readRows_(FEMA_CONFIG.sheets.shifts).find((row) =>
    !isExampleRow_(row) && String(row.IdMotel) === user.idMotel && String(row.Estado) === "ABIERTO"
  );
  if (!activeShift) return [];
  const shiftId = String(activeShift.IdTurno);
  const roomNumbers = new Map(readRows_(FEMA_CONFIG.sheets.rooms)
    .filter((row) => !isExampleRow_(row) && String(row.IdMotel) === user.idMotel)
    .map((row) => [String(row.IdHabitacion), String(row.NumeroHabitacion)]));
  const cleaningNames = new Map(readRows_(FEMA_CONFIG.sheets.cleaningStaff)
    .filter((row) => !isExampleRow_(row))
    .map((row) => [String(row.IdPersonalLimpieza), `${String(row.Nombre)} ${String(row.Apellidos ?? "")}`.trim()]));
  const cleanings = new Map(readRows_(FEMA_CONFIG.sheets.cleanings)
    .filter((row) => !isExampleRow_(row))
    .map((row) => [String(row.IdCiclo), row]));
  const payments = new Map(readRows_(FEMA_CONFIG.sheets.payments)
    .filter((row) => !isExampleRow_(row) && String(row.IdTurno) === shiftId && String(row.Estado) === "APLICADO")
    .map((row) => [String(row.IdEstancia), String(row.FormaPago)]));
  return readRows_(FEMA_CONFIG.sheets.stays)
    .filter((row) => !isExampleRow_(row) && String(row.IdMotel) === user.idMotel && String(row.IdTurno) === shiftId)
    .map((row) => {
      const roomId = String(row.IdHabitacionActual);
      const cleaning = cleanings.get(String(row.IdCiclo));
      const hasExit = Boolean(row.FechaHoraSalidaReal);
      return {
        idEstancia: String(row.IdEstancia), habitacion: roomNumbers.get(roomId) ?? roomId,
        fechaHoraEntrada: formatShiftDate_(row.FechaHoraEntrada),
        fechaHoraSalidaReal: formatShiftDate_(row.FechaHoraSalidaReal),
        estadoDesocupacion: String(row.EstadoEstancia) === "CANCELADA" ? "CANCELADA" : hasExit ? "SUCIA" : "OCUPADA", precioFinal: Number(row.PrecioFinal) || 0,
        formaPago: payments.get(String(row.IdEstancia)) ?? "",
        fechaHoraLimpieza: cleaning ? formatShiftDate_(cleaning.FechaHoraInicio || cleaning.FechaHoraAsignacion) : "",
        personalLimpieza: cleaning ? cleaningNames.get(String(cleaning.IdPersonalLimpieza)) ?? String(cleaning.IdPersonalLimpieza) : "",
        minutosLimpieza: cleaning && cleaning.MinutosLimpieza !== "" && cleaning.MinutosLimpieza != null ? Number(cleaning.MinutosLimpieza) : null
      };
    })
    .sort((a, b) => new Date(b.fechaHoraEntrada).getTime() - new Date(a.fechaHoraEntrada).getTime());
}

function addExtraPerson_(user: FemaUser, input: AddExtraPersonInput): AddExtraPersonResult {
  assertPermission_(user, "PER-HAB-GEST");
  if (!input.idempotencyKey) throw new Error("Falta la clave de idempotencia de la operación.");
  const quantity = Number(input.cantidad);
  const observations = String(input.observaciones ?? "").trim();
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("La cantidad debe ser un número entero mayor que cero.");
  if (!observations) throw new Error("Las observaciones son obligatorias.");
  if (observations.length > 300) throw new Error("Las observaciones no pueden superar 300 caracteres.");
  return withScriptLock_(() => {
    if (readRows_(FEMA_CONFIG.sheets.audit).some((row) => String(row.Motivo) === input.idempotencyKey)) throw new Error("Esta operación ya fue registrada.");
    const room = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion);
    if (!room || isExampleRow_(room) || String(room.IdMotel) !== user.idMotel || String(room.EstadoActual) !== "OCUPADA" || !room.IdCicloActual) throw new Error("La habitación ya no está ocupada.");
    const stay = readRows_(FEMA_CONFIG.sheets.stays).find((row) => !isExampleRow_(row) && String(row.IdCiclo) === String(room.IdCicloActual) && String(row.IdHabitacionActual) === input.idHabitacion && String(row.EstadoEstancia) === "ACTIVA");
    if (!stay) throw new Error("No se encontró una estancia activa.");
    const roomType = requireRowById_(FEMA_CONFIG.sheets.roomTypes, "IdTipo", String(room.IdTipo));
    const unitPrice = Number(roomType.PrecioPersonaExtra) || 0;
    if (unitPrice <= 0) throw new Error("El tipo de habitación no tiene precio para persona extra.");
    requireOpenShiftForUser_(user);
    const changedAt = now_();
    const amount = quantity * unitPrice;
    const currentPeople = Number(stay.PersonasExtra) || 0;
    const currentPrice = Number(stay.PrecioFinal) || 0;
    const newPrice = currentPrice + amount;
    updateRowById_(FEMA_CONFIG.sheets.stays, "IdEstancia", String(stay.IdEstancia), {
      PersonasExtra: currentPeople + quantity, AjustePrecio: (Number(stay.AjustePrecio) || 0) + amount,
      PrecioFinal: newPrice, MotivoAjuste: observations
    });
    readRows_(FEMA_CONFIG.sheets.payments).filter((row) => !isExampleRow_(row) && String(row.IdEstancia) === String(stay.IdEstancia) && String(row.Estado) === "APLICADO").forEach((payment) => updateRowById_(FEMA_CONFIG.sheets.payments, "IdPago", String(payment.IdPago), { Monto: newPrice }));
    appendRow_(FEMA_CONFIG.sheets.stayMovements, {
      IdMovimientoEstancia: newId_("ME"), IdEstancia: String(stay.IdEstancia), TipoMovimiento: "PERSONA_EXTRA",
      FechaHora: changedAt, IdHabitacionOrigen: input.idHabitacion, IdHabitacionDestino: input.idHabitacion,
      MinutosAgregados: 0, MontoAjuste: amount, Comentario: observations, IdUsuario: user.idUsuario
    });
    writeAudit_(user, "AGREGAR_PERSONA_EXTRA", "ESTANCIA", String(stay.IdEstancia), stay, { PersonasExtra: currentPeople + quantity, PrecioFinal: newPrice }, input.idempotencyKey);
    return { idEstancia: String(stay.IdEstancia), personasExtra: currentPeople + quantity, precioFinal: newPrice };
  });
}

function editActiveStay_(user: FemaUser, input: EditActiveStayInput): EditActiveStayResult {
  assertPermission_(user, "PER-HAB-GEST");
  if (!input.idempotencyKey) throw new Error("Falta la clave de idempotencia de la operación.");
  const observations = String(input.observaciones ?? "").trim();
  const extraPeople = Number(input.personasExtra);
  const finalPrice = Number(input.precioFinal);
  const expectedExit = new Date(String(input.fechaHoraSalidaPrevista));
  const vehicle = String(input.marcaModeloVehiculo ?? "").trim();
  const plates = String(input.placas ?? "").trim().toUpperCase();
  if (!observations) throw new Error("Las observaciones son obligatorias para editar una renta.");
  if (observations.length > 300) throw new Error("Las observaciones no pueden superar 300 caracteres.");
  if (!Number.isInteger(extraPeople) || extraPeople < 0) throw new Error("Las personas extra deben ser un entero igual o mayor que cero.");
  if (!Number.isFinite(finalPrice) || finalPrice < 0) throw new Error("El importe final debe ser igual o mayor que cero.");
  if (Number.isNaN(expectedExit.getTime())) throw new Error("Indica una fecha y hora de salida válida.");
  if (vehicle.length > 100 || plates.length > 15) throw new Error("Revisa la longitud de los datos del vehículo.");
  return withScriptLock_(() => {
    if (readRows_(FEMA_CONFIG.sheets.audit).some((row) => String(row.Motivo) === input.idempotencyKey)) throw new Error("Esta operación ya fue registrada.");
    const room = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion);
    if (!room || isExampleRow_(room) || String(room.IdMotel) !== user.idMotel || String(room.EstadoActual) !== "OCUPADA" || !room.IdCicloActual) throw new Error("La habitación ya no está ocupada.");
    const stay = readRows_(FEMA_CONFIG.sheets.stays).find((row) => !isExampleRow_(row) && String(row.IdCiclo) === String(room.IdCicloActual) && String(row.IdHabitacionActual) === input.idHabitacion && String(row.EstadoEstancia) === "ACTIVA");
    if (!stay) throw new Error("No se encontró una estancia activa.");
    requireOpenShiftForUser_(user);
    const previousPrice = Number(stay.PrecioFinal) || 0;
    const priceDifference = finalPrice - previousPrice;
    const before = { FechaHoraSalidaPrevista: stay.FechaHoraSalidaPrevista, MarcaModeloVehiculo: stay.MarcaModeloVehiculo, Placas: stay.Placas, PersonasExtra: stay.PersonasExtra, PrecioFinal: stay.PrecioFinal };
    const after = { FechaHoraSalidaPrevista: expectedExit, MarcaModeloVehiculo: vehicle, Placas: plates, PersonasExtra: extraPeople, PrecioFinal: finalPrice };
    updateRowById_(FEMA_CONFIG.sheets.stays, "IdEstancia", String(stay.IdEstancia), {
      ...after, AjustePrecio: finalPrice - (Number(stay.PrecioCatalogo) || 0), MotivoAjuste: observations
    });
    readRows_(FEMA_CONFIG.sheets.payments).filter((row) => !isExampleRow_(row) && String(row.IdEstancia) === String(stay.IdEstancia) && String(row.Estado) === "APLICADO").forEach((payment) => updateRowById_(FEMA_CONFIG.sheets.payments, "IdPago", String(payment.IdPago), { Monto: finalPrice }));
    appendRow_(FEMA_CONFIG.sheets.stayMovements, {
      IdMovimientoEstancia: newId_("ME"), IdEstancia: String(stay.IdEstancia), TipoMovimiento: "EDICION",
      FechaHora: now_(), IdHabitacionOrigen: input.idHabitacion, IdHabitacionDestino: input.idHabitacion,
      MinutosAgregados: 0, MontoAjuste: priceDifference, Comentario: observations, IdUsuario: user.idUsuario
    });
    writeAudit_(user, "EDITAR_ESTANCIA", "ESTANCIA", String(stay.IdEstancia), before, after, input.idempotencyKey);
    return { idEstancia: String(stay.IdEstancia), precioFinal: finalPrice };
  });
}

function transferOccupiedRoom_(user: FemaUser, input: TransferRoomInput): TransferRoomResult {
  assertPermission_(user, "PER-HAB-GEST");
  if (!input.idempotencyKey) throw new Error("Falta la clave de idempotencia de la operación.");
  if (!input.idHabitacionOrigen || !input.idHabitacionDestino || input.idHabitacionOrigen === input.idHabitacionDestino) throw new Error("Selecciona una habitación destino diferente.");
  return withScriptLock_(() => {
    if (readRows_(FEMA_CONFIG.sheets.audit).some((row) => String(row.Motivo) === input.idempotencyKey)) throw new Error("Esta operación ya fue registrada.");
    const origin = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacionOrigen);
    const destination = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacionDestino);
    if (!origin || !destination || isExampleRow_(origin) || isExampleRow_(destination) || String(origin.IdMotel) !== user.idMotel || String(destination.IdMotel) !== user.idMotel) throw new Error("Habitación no encontrada.");
    if (String(origin.EstadoActual) !== "OCUPADA" || !origin.IdCicloActual) throw new Error("La habitación de origen ya no está ocupada.");
    if (destination.Activo !== true || String(destination.EstadoActual) !== "DISPONIBLE" || destination.IdCicloActual) throw new Error("La habitación destino ya no está disponible.");
    const stay = readRows_(FEMA_CONFIG.sheets.stays).find((row) => !isExampleRow_(row) && String(row.IdCiclo) === String(origin.IdCicloActual) && String(row.IdHabitacionActual) === input.idHabitacionOrigen && String(row.EstadoEstancia) === "ACTIVA");
    if (!stay) throw new Error("No se encontró una estancia activa en la habitación de origen.");
    const shift = requireOpenShiftForUser_(user);
    const changedAt = now_();
    const oldCycleId = String(origin.IdCicloActual);
    const newCycleId = newId_("CIC");
    appendRow_(FEMA_CONFIG.sheets.cycles, {
      IdCiclo: newCycleId, IdMotel: user.idMotel, IdHabitacion: input.idHabitacionDestino,
      TipoInicio: "TRASLADO", ComentarioInicio: `Desde habitación ${String(origin.NumeroHabitacion)}`, FechaHoraInicio: changedAt,
      FechaHoraFin: "", EstadoCiclo: "ABIERTO", IdUsuarioInicio: user.idUsuario, IdTurnoInicio: String(shift.IdTurno)
    });
    updateRowById_(FEMA_CONFIG.sheets.stays, "IdEstancia", String(stay.IdEstancia), { IdCiclo: newCycleId, IdHabitacionActual: input.idHabitacionDestino });
    updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacionOrigen, { EstadoActual: "SUCIA" });
    updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacionDestino, { EstadoActual: "OCUPADA", IdCicloActual: newCycleId });
    appendRow_(FEMA_CONFIG.sheets.stayMovements, {
      IdMovimientoEstancia: newId_("ME"), IdEstancia: String(stay.IdEstancia), TipoMovimiento: "TRASLADO",
      FechaHora: changedAt, IdHabitacionOrigen: input.idHabitacionOrigen, IdHabitacionDestino: input.idHabitacionDestino,
      MinutosAgregados: 0, MontoAjuste: 0, Comentario: "Cambio de habitación", IdUsuario: user.idUsuario
    });
    appendRow_(FEMA_CONFIG.sheets.roomEvents, {
      IdEvento: newId_("EVT"), IdCiclo: oldCycleId, IdHabitacion: input.idHabitacionOrigen, EstadoAnterior: "OCUPADA",
      EstadoNuevo: "SUCIA", FechaHora: changedAt, IdEmpleado: user.idUsuario, Comentario: `Traslado a habitación ${String(destination.NumeroHabitacion)}`, IdTurno: String(shift.IdTurno)
    });
    appendRow_(FEMA_CONFIG.sheets.roomEvents, {
      IdEvento: newId_("EVT"), IdCiclo: newCycleId, IdHabitacion: input.idHabitacionDestino, EstadoAnterior: "DISPONIBLE",
      EstadoNuevo: "OCUPADA", FechaHora: changedAt, IdEmpleado: user.idUsuario, Comentario: `Traslado desde habitación ${String(origin.NumeroHabitacion)}`, IdTurno: String(shift.IdTurno)
    });
    writeAudit_(user, "CAMBIAR_HABITACION", "ESTANCIA", String(stay.IdEstancia), { origin, stay }, { idHabitacionDestino: input.idHabitacionDestino, newCycleId }, input.idempotencyKey);
    return { idEstancia: String(stay.IdEstancia), idHabitacionOrigen: input.idHabitacionOrigen, idHabitacionDestino: input.idHabitacionDestino };
  });
}

function cancelOccupiedStay_(user: FemaUser, input: CancelStayInput): CancelStayResult {
  assertPermission_(user, "PER-HAB-GEST");
  if (!input.idempotencyKey) throw new Error("Falta la clave de idempotencia de la operación.");
  const comment = String(input.comentario ?? "").trim();
  if (!comment) throw new Error("Escribe el motivo de la cancelación.");
  if (comment.length > 300) throw new Error("El motivo no puede superar 300 caracteres.");
  return withScriptLock_(() => {
    if (readRows_(FEMA_CONFIG.sheets.audit).some((row) => String(row.Motivo) === input.idempotencyKey)) throw new Error("Esta operación ya fue registrada.");
    const room = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion);
    if (!room || isExampleRow_(room) || String(room.IdMotel) !== user.idMotel || String(room.EstadoActual) !== "OCUPADA" || !room.IdCicloActual) throw new Error("La habitación ya no está ocupada.");
    const stay = readRows_(FEMA_CONFIG.sheets.stays).find((row) => !isExampleRow_(row) && String(row.IdCiclo) === String(room.IdCicloActual) && String(row.IdHabitacionActual) === input.idHabitacion && String(row.EstadoEstancia) === "ACTIVA");
    if (!stay) throw new Error("No se encontró una estancia activa para cancelar.");
    const shift = requireOpenShiftForUser_(user);
    const cancelledAt = now_();
    const originalPrice = Number(stay.PrecioFinal) || 0;
    updateRowById_(FEMA_CONFIG.sheets.stays, "IdEstancia", String(stay.IdEstancia), {
      FechaHoraSalidaReal: cancelledAt, AjustePrecio: (Number(stay.AjustePrecio) || 0) - originalPrice,
      PrecioFinal: 0, MotivoAjuste: `CANCELACION: ${comment}`, EstadoEstancia: "CANCELADA"
    });
    readRows_(FEMA_CONFIG.sheets.payments)
      .filter((row) => !isExampleRow_(row) && String(row.IdEstancia) === String(stay.IdEstancia) && String(row.Estado) === "APLICADO")
      .forEach((payment) => updateRowById_(FEMA_CONFIG.sheets.payments, "IdPago", String(payment.IdPago), { Estado: "CANCELADO" }));
    appendRow_(FEMA_CONFIG.sheets.stayMovements, {
      IdMovimientoEstancia: newId_("ME"), IdEstancia: String(stay.IdEstancia), TipoMovimiento: "CANCELACION",
      FechaHora: cancelledAt, IdHabitacionOrigen: input.idHabitacion, IdHabitacionDestino: "",
      MinutosAgregados: 0, MontoAjuste: -originalPrice, Comentario: comment, IdUsuario: user.idUsuario
    });
    appendRow_(FEMA_CONFIG.sheets.roomEvents, {
      IdEvento: newId_("EVT"), IdCiclo: String(room.IdCicloActual), IdHabitacion: input.idHabitacion,
      EstadoAnterior: "OCUPADA", EstadoNuevo: "SUCIA", FechaHora: cancelledAt, IdEmpleado: user.idUsuario,
      Comentario: "Estancia cancelada", IdTurno: String(shift.IdTurno)
    });
    updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion, { EstadoActual: "SUCIA" });
    writeAudit_(user, "CANCELAR_ESTANCIA", "ESTANCIA", String(stay.IdEstancia), stay, { PrecioFinal: 0, EstadoEstancia: "CANCELADA", EstadoHabitacion: "SUCIA" }, input.idempotencyKey);
    return { idEstancia: String(stay.IdEstancia), estadoHabitacion: "SUCIA", precioFinal: 0 };
  });
}

function undoRoomState_(user: FemaUser, input: UndoRoomStateInput): UndoRoomStateResult {
  assertPermission_(user, "PER-HAB-GEST");
  if (!input.idempotencyKey) throw new Error("Falta la clave de idempotencia de la operación.");
  return withScriptLock_(() => {
    if (readRows_(FEMA_CONFIG.sheets.audit).some((row) => String(row.Motivo) === input.idempotencyKey)) throw new Error("Esta operación ya fue registrada.");
    const room = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion);
    if (!room || isExampleRow_(room) || String(room.IdMotel) !== user.idMotel || !room.IdCicloActual) throw new Error("Habitación no encontrada o sin ciclo activo.");
    const state = String(room.EstadoActual);
    if (!["SUCIA", "LIMPIEZA"].includes(state)) throw new Error("Solo se puede deshacer una habitación SUCIA o en LIMPIEZA.");
    const shift = requireOpenShiftForUser_(user);
    const changedAt = now_();
    const cycleId = String(room.IdCicloActual);
    if (state === "LIMPIEZA") {
      const cleaning = readRows_(FEMA_CONFIG.sheets.cleanings).find((row) => !isExampleRow_(row) && String(row.IdCiclo) === cycleId && String(row.IdHabitacion) === input.idHabitacion && ["ASIGNADA", "EN_PROCESO"].includes(String(row.Estado)));
      if (!cleaning) throw new Error("No se encontró la limpieza activa que se debe deshacer.");
      updateRowById_(FEMA_CONFIG.sheets.cleanings, "IdLimpieza", String(cleaning.IdLimpieza), { Estado: "CANCELADA", FechaHoraFin: changedAt, IdUsuarioFinaliza: user.idUsuario });
      updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion, { EstadoActual: "SUCIA" });
      appendRow_(FEMA_CONFIG.sheets.roomEvents, { IdEvento: newId_("EVT"), IdCiclo: cycleId, IdHabitacion: input.idHabitacion, EstadoAnterior: "LIMPIEZA", EstadoNuevo: "SUCIA", FechaHora: changedAt, IdEmpleado: user.idUsuario, Comentario: "Corrección de estado", IdTurno: String(shift.IdTurno) });
      writeAudit_(user, "CORREGIR_ESTADO", "HABITACION", input.idHabitacion, room, { EstadoActual: "SUCIA", limpiezaCancelada: String(cleaning.IdLimpieza) }, input.idempotencyKey, "LOG_ERRORES");
      return { idHabitacion: input.idHabitacion, estadoHabitacion: "SUCIA" };
    }
    const transfer = readRows_(FEMA_CONFIG.sheets.stayMovements).filter((row) => !isExampleRow_(row) && String(row.TipoMovimiento) === "TRASLADO" && String(row.IdHabitacionOrigen) === input.idHabitacion).pop();
    if (transfer) {
      const transferredStay = readRows_(FEMA_CONFIG.sheets.stays).find((row) => !isExampleRow_(row) && String(row.IdEstancia) === String(transfer.IdEstancia) && String(row.IdHabitacionActual) === String(transfer.IdHabitacionDestino) && String(row.EstadoEstancia) === "ACTIVA");
      const destination = transferredStay ? findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", String(transfer.IdHabitacionDestino)) : null;
      if (transferredStay && destination && String(destination.EstadoActual) === "OCUPADA" && String(destination.IdCicloActual) === String(transferredStay.IdCiclo)) {
        const destinationCycleId = String(transferredStay.IdCiclo);
        updateRowById_(FEMA_CONFIG.sheets.stays, "IdEstancia", String(transferredStay.IdEstancia), { IdCiclo: cycleId, IdHabitacionActual: input.idHabitacion });
        updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", String(destination.IdHabitacion), { EstadoActual: "DISPONIBLE", IdCicloActual: "" });
        updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion, { EstadoActual: "OCUPADA" });
        updateRowById_(FEMA_CONFIG.sheets.cycles, "IdCiclo", destinationCycleId, { EstadoCiclo: "CERRADO", FechaHoraFin: changedAt });
        appendRow_(FEMA_CONFIG.sheets.stayMovements, { IdMovimientoEstancia: newId_("ME"), IdEstancia: String(transferredStay.IdEstancia), TipoMovimiento: "REVERSA_TRASLADO", FechaHora: changedAt, IdHabitacionOrigen: String(destination.IdHabitacion), IdHabitacionDestino: input.idHabitacion, MinutosAgregados: 0, MontoAjuste: 0, Comentario: "Corrección de estado", IdUsuario: user.idUsuario });
        appendRow_(FEMA_CONFIG.sheets.roomEvents, { IdEvento: newId_("EVT"), IdCiclo: cycleId, IdHabitacion: input.idHabitacion, EstadoAnterior: "SUCIA", EstadoNuevo: "OCUPADA", FechaHora: changedAt, IdEmpleado: user.idUsuario, Comentario: "Corrección de traslado", IdTurno: String(shift.IdTurno) });
        appendRow_(FEMA_CONFIG.sheets.roomEvents, { IdEvento: newId_("EVT"), IdCiclo: destinationCycleId, IdHabitacion: String(destination.IdHabitacion), EstadoAnterior: "OCUPADA", EstadoNuevo: "DISPONIBLE", FechaHora: changedAt, IdEmpleado: user.idUsuario, Comentario: "Corrección de traslado", IdTurno: String(shift.IdTurno) });
        writeAudit_(user, "CORREGIR_TRASLADO", "HABITACION", input.idHabitacion, { room, destination }, { EstadoActual: "OCUPADA", destinoRestaurado: "DISPONIBLE" }, input.idempotencyKey, "LOG_ERRORES");
        return { idHabitacion: input.idHabitacion, estadoHabitacion: "OCUPADA" };
      }
    }
    const stay = readRows_(FEMA_CONFIG.sheets.stays).find((row) => !isExampleRow_(row) && String(row.IdCiclo) === cycleId && String(row.IdHabitacionActual) === input.idHabitacion && ["FINALIZADA", "CANCELADA"].includes(String(row.EstadoEstancia)));
    if (!stay) throw new Error("No se encontró una salida o cancelación que se pueda deshacer.");
    const wasCancelled = String(stay.EstadoEstancia) === "CANCELADA";
    let restoredPrice = Number(stay.PrecioFinal) || 0;
    if (wasCancelled) {
      const cancellation = readRows_(FEMA_CONFIG.sheets.stayMovements).filter((row) => !isExampleRow_(row) && String(row.IdEstancia) === String(stay.IdEstancia) && String(row.TipoMovimiento) === "CANCELACION").pop();
      restoredPrice = cancellation ? Math.abs(Number(cancellation.MontoAjuste) || 0) : Number(stay.PrecioCatalogo) || 0;
      readRows_(FEMA_CONFIG.sheets.payments).filter((row) => !isExampleRow_(row) && String(row.IdEstancia) === String(stay.IdEstancia) && String(row.Estado) === "CANCELADO").forEach((payment) => updateRowById_(FEMA_CONFIG.sheets.payments, "IdPago", String(payment.IdPago), { Estado: "APLICADO" }));
    }
    updateRowById_(FEMA_CONFIG.sheets.stays, "IdEstancia", String(stay.IdEstancia), {
      FechaHoraSalidaReal: "", EstadoEstancia: "ACTIVA", PrecioFinal: restoredPrice,
      AjustePrecio: restoredPrice - (Number(stay.PrecioCatalogo) || 0), MotivoAjuste: Number(stay.PersonasExtra) > 0 ? "PERSONAS_EXTRA" : ""
    });
    appendRow_(FEMA_CONFIG.sheets.stayMovements, { IdMovimientoEstancia: newId_("ME"), IdEstancia: String(stay.IdEstancia), TipoMovimiento: wasCancelled ? "REVERSA_CANCELACION" : "REVERSA_SALIDA", FechaHora: changedAt, IdHabitacionOrigen: input.idHabitacion, IdHabitacionDestino: input.idHabitacion, MinutosAgregados: 0, MontoAjuste: wasCancelled ? restoredPrice : 0, Comentario: "Corrección de estado", IdUsuario: user.idUsuario });
    updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion, { EstadoActual: "OCUPADA" });
    appendRow_(FEMA_CONFIG.sheets.roomEvents, { IdEvento: newId_("EVT"), IdCiclo: cycleId, IdHabitacion: input.idHabitacion, EstadoAnterior: "SUCIA", EstadoNuevo: "OCUPADA", FechaHora: changedAt, IdEmpleado: user.idUsuario, Comentario: "Corrección de estado", IdTurno: String(shift.IdTurno) });
    writeAudit_(user, "CORREGIR_ESTADO", "HABITACION", input.idHabitacion, room, { EstadoActual: "OCUPADA", estanciaRestaurada: String(stay.IdEstancia) }, input.idempotencyKey, "LOG_ERRORES");
    return { idHabitacion: input.idHabitacion, estadoHabitacion: "OCUPADA" };
  });
}

function registerExit_(user: FemaUser, input: ExitInput): ExitResult {
  assertPermission_(user, "PER-HAB-GEST");
  if (!input.idempotencyKey) throw new Error("Falta la clave de idempotencia de la operación.");
  const observations = String(input.observaciones ?? "").trim();
  if (observations.length > 300) throw new Error("Las observaciones no pueden superar 300 caracteres.");

  return withScriptLock_(() => {
    const duplicate = readRows_(FEMA_CONFIG.sheets.audit).find((row) => String(row.Motivo) === input.idempotencyKey);
    if (duplicate) throw new Error("Esta operación ya fue registrada.");

    const room = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion);
    if (!room || isExampleRow_(room) || String(room.IdMotel) !== user.idMotel) throw new Error("Habitación no encontrada.");
    if (String(room.EstadoActual) !== "OCUPADA" || !room.IdCicloActual) throw new Error("La habitación ya no está ocupada o no tiene un ciclo activo.");
    const cycleId = String(room.IdCicloActual);
    const stay = readRows_(FEMA_CONFIG.sheets.stays).find((row) =>
      !isExampleRow_(row) && String(row.IdCiclo) === cycleId && String(row.IdHabitacionActual) === input.idHabitacion && String(row.EstadoEstancia) === "ACTIVA"
    );
    if (!stay) throw new Error("No se encontró una estancia activa para la habitación.");
    const shift = requireOpenShiftForUser_(user);
    const shiftId = String(shift.IdTurno);
    const finishedAt = now_();

    updateRowById_(FEMA_CONFIG.sheets.stays, "IdEstancia", String(stay.IdEstancia), {
      FechaHoraSalidaReal: finishedAt,
      EstadoEstancia: "FINALIZADA"
    });
    appendRow_(FEMA_CONFIG.sheets.roomEvents, {
      IdEvento: newId_("EVT"), IdCiclo: cycleId, IdHabitacion: input.idHabitacion,
      EstadoAnterior: "OCUPADA", EstadoNuevo: "SUCIA", FechaHora: finishedAt,
      IdEmpleado: user.idUsuario, Comentario: observations || "Salida registrada", IdTurno: shiftId
    });
    updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion, { EstadoActual: "SUCIA" });
    writeAudit_(user, "REGISTRAR_SALIDA", "ESTANCIA", String(stay.IdEstancia), stay,
      { FechaHoraSalidaReal: finishedAt, EstadoEstancia: "FINALIZADA", EstadoHabitacion: "SUCIA" }, input.idempotencyKey);

    return {
      idCiclo: cycleId,
      idEstancia: String(stay.IdEstancia),
      fechaHoraSalidaReal: Utilities.formatDate(finishedAt, FEMA_CONFIG.timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      estadoHabitacion: "SUCIA"
    };
  });
}

function parseRateMinutes_(value: CellValue, defaultHours = 6): number {
  if (typeof value === "number") {
    if (value <= 0) return defaultHours * 60;
    if (value <= 24) return Math.round(value * 60);
    return Math.round(value);
  }
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return defaultHours * 60;
  const hoursMatch = text.match(/^(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hora|horas)$/i);
  if (hoursMatch) return Math.round(parseFloat(hoursMatch[1]) * 60);
  const minsMatch = text.match(/^(\d+(?:\.\d+)?)\s*(?:m|min|mins|minuto|minutos)$/i);
  if (minsMatch) return Math.round(parseFloat(minsMatch[1]));
  const num = parseFloat(text);
  if (!isNaN(num) && num > 0) {
    if (num <= 24) return Math.round(num * 60);
    return Math.round(num);
  }
  return defaultHours * 60;
}

function listEntryRates_(user: FemaUser): EntryRate[] {
  const roomTypesRows = readRows_(FEMA_CONFIG.sheets.roomTypes)
    .filter((row) => !isExampleRow_(row) && String(row.IdMotel).trim() === user.idMotel.trim() && isRowActive_(row.Activo));

  const typeIdByAlias = new Map<string, string>();
  const extraPersonPrices = new Map<string, number>();
  const allTypeIds: string[] = [];

  for (const row of roomTypesRows) {
    const id = String(row.IdTipo ?? "").trim();
    const name = String(row.NombreTipo ?? "").trim();
    const price = Number(row.PrecioPersonaExtra) || 0;
    if (id) {
      typeIdByAlias.set(id.toUpperCase(), id);
      extraPersonPrices.set(id, price);
      allTypeIds.push(id);
    }
    if (name) {
      typeIdByAlias.set(name.toUpperCase(), id);
    }
  }

  const motel = readRows_(FEMA_CONFIG.sheets.motels).find((m) => String(m.IdMotel).trim() === user.idMotel.trim());
  const motelName = motel ? String(motel.NombreMotel ?? "").trim().toUpperCase() : "";

  const allRatesRows = readRows_(FEMA_CONFIG.sheets.rates).filter((row) => !isExampleRow_(row) && isRowActive_(row.Activo));
  const results: EntryRate[] = [];

  for (const row of allRatesRows) {
    const rawTypeVal = String(row.IdTipo || row.TipoHabitacion || row.Tipo || row.IdTipoHabitacion || "").trim();
    const rawTypeUpper = rawTypeVal.toUpperCase();

    const rawMinutes = parseRateMinutes_(row.Minutos);
    const hours = rawMinutes / 60;
    const rawName = String(row.NombreTarifa || row.Nombre || "").trim();
    const name = rawName || `${hours} horas`;
    const precioBase = Number(row.PrecioBase || row.Precio || row.Costo || 0);
    const personasIncluidas = Number(row.PersonasIncluidas) || 2;
    const rateId = String(row.IdTarifa || row.Id || "").trim() || `TAR-${rawTypeVal}-${rawMinutes}`;

    if (typeIdByAlias.has(rawTypeUpper)) {
      const canonicalTypeId = typeIdByAlias.get(rawTypeUpper)!;
      results.push({
        idTarifa: rateId,
        idTipo: canonicalTypeId,
        nombre: name,
        minutos: rawMinutes,
        precioBase,
        personasIncluidas,
        precioPersonaExtra: extraPersonPrices.get(canonicalTypeId) ?? 0
      });
    } else if (!rawTypeUpper || rawTypeUpper === user.idMotel.toUpperCase() || (motelName && rawTypeUpper === motelName)) {
      for (const canonicalTypeId of allTypeIds) {
        results.push({
          idTarifa: `${rateId}-${canonicalTypeId}`,
          idTipo: canonicalTypeId,
          nombre: name,
          minutos: rawMinutes,
          precioBase,
          personasIncluidas,
          precioPersonaExtra: extraPersonPrices.get(canonicalTypeId) ?? 0
        });
      }
    } else {
      for (const [alias, canonicalTypeId] of typeIdByAlias.entries()) {
        if (alias.includes(rawTypeUpper) || rawTypeUpper.includes(alias)) {
          results.push({
            idTarifa: rateId,
            idTipo: canonicalTypeId,
            nombre: name,
            minutos: rawMinutes,
            precioBase,
            personasIncluidas,
            precioPersonaExtra: extraPersonPrices.get(canonicalTypeId) ?? 0
          });
          break;
        }
      }
    }
  }

  const seenKeys = new Set<string>();
  const deduped: EntryRate[] = [];
  for (const item of results) {
    const key = `${item.idTipo}|${item.minutos}|${item.precioBase}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      deduped.push(item);
    }
  }

  return deduped.sort((a, b) => a.idTipo.localeCompare(b.idTipo) || a.minutos - b.minutos || a.precioBase - b.precioBase);
}

function listVehicleSuggestions_(user: FemaUser): string[] {
  const seen = new Set<string>();
  const suggestions: string[] = [];
  const stays = readRows_(FEMA_CONFIG.sheets.stays);
  for (let index = stays.length - 1; index >= 0 && suggestions.length < 20; index -= 1) {
    const row = stays[index];
    if (isExampleRow_(row) || String(row.IdMotel) !== user.idMotel) continue;
    const value = String(row.MarcaModeloVehiculo ?? "").trim();
    const normalized = value.toLocaleUpperCase();
    if (!value || value.length > 100 || ["TAXI", "CAMINANDO", "NO APLICA"].includes(normalized)) continue;
    const key = normalized.replace(/\s+/g, " ");
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push(value);
  }
  return suggestions;
}

function entryRequestSignature_(user: FemaUser, input: EntryInput): string {
  return JSON.stringify([
    user.idUsuario, user.idMotel, input.idHabitacion, input.idTarifa, input.medioLlegada,
    Number(input.personasExtra), String(input.formaPago),
    Number(input.minutosCotizados), Number(input.precioBaseCotizado),
    Number(input.personasIncluidasCotizadas), Number(input.precioPersonaExtraCotizado)
  ]);
}

function replayEntry_(user: FemaUser, duplicate: SheetRow, signature: string, vehicle: string, plates: string): EntryResult {
  if (String(duplicate.Accion) !== "REGISTRAR_ENTRADA" || String(duplicate.Entidad) !== "ESTANCIA" ||
      String(duplicate.IdMotel) !== user.idMotel || String(duplicate.IdUsuario) !== user.idUsuario) {
    throw new Error("La clave de idempotencia ya corresponde a otra operación.");
  }
  let stored: { firmaEntrada?: string; resultado?: EntryResult; idHabitacion?: string };
  try {
    stored = JSON.parse(String(duplicate.DatosDespuesJSON ?? "{}")) as { firmaEntrada?: string; resultado?: EntryResult; idHabitacion?: string };
  } catch {
    throw new Error("La entrada ya fue registrada; no se pudo recuperar su resultado.");
  }
  if (!stored.resultado || stored.firmaEntrada !== signature) throw new Error("La clave de idempotencia ya se utilizó con otros datos.");

  const result = stored.resultado;
  const room = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", String(stored.idHabitacion ?? ""));
  const cycle = findRowById_(FEMA_CONFIG.sheets.cycles, "IdCiclo", result.idCiclo);
  const stay = findRowById_(FEMA_CONFIG.sheets.stays, "IdEstancia", result.idEstancia);
  const payment = readRows_(FEMA_CONFIG.sheets.payments).find((row) => !isExampleRow_(row) && String(row.IdEstancia) === result.idEstancia && String(row.Referencia) === "ENTRADA");
  if (!room || !cycle || !stay || !payment || String(room.IdMotel) !== user.idMotel || String(cycle.IdMotel) !== user.idMotel ||
      String(stay.IdCiclo) !== result.idCiclo || String(stay.IdHabitacionActual) !== String(stored.idHabitacion) ||
      String(stay.MarcaModeloVehiculo ?? "") !== vehicle || String(stay.Placas ?? "") !== plates ||
      Number(stay.PersonasExtra) !== Number(result.personasExtra) || Number(stay.PrecioFinal) !== Number(result.precioFinal) ||
      Number(payment.Monto) !== Number(result.precioFinal) || String(payment.FormaPago) !== result.formaPago || String(payment.Estado) !== "APLICADO") {
    throw new Error("La entrada no quedó completa y requiere revisión antes de reintentar.");
  }
  if (String(room.EstadoActual) === "DISPONIBLE" && !room.IdCicloActual) {
    updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", String(room.IdHabitacion), { EstadoActual: "OCUPADA", IdCicloActual: result.idCiclo });
  } else if (String(room.EstadoActual) === "OCUPADA" && !room.IdCicloActual) {
    updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", String(room.IdHabitacion), { IdCicloActual: result.idCiclo });
  } else if (String(room.EstadoActual) !== "OCUPADA" || String(room.IdCicloActual) !== result.idCiclo) {
    throw new Error("La entrada ya existe, pero la habitación cambió de estado y requiere revisión.");
  }
  return result;
}

function registerEntry_(user: FemaUser, input: EntryInput): EntryResult {
  assertPermission_(user, "PER-HAB-GEST");
  const idempotencyKey = typeof input.idempotencyKey === "string" ? input.idempotencyKey.trim() : "";
  if (!idempotencyKey) throw new Error("Falta la clave de idempotencia de la operación.");
  if (idempotencyKey.length > 160) throw new Error("La clave de idempotencia no es válida.");
  if (typeof input.idHabitacion !== "string" || typeof input.idTarifa !== "string" || !input.idHabitacion || !input.idTarifa) throw new Error("Selecciona una habitación y una tarifa.");
  if (!["EFECTIVO", "TARJETA"].includes(input.formaPago)) throw new Error("Las entradas nuevas sólo aceptan efectivo o tarjeta.");
  const requestedExtraPeople = Number(input.personasExtra);
  if (!Number.isInteger(requestedExtraPeople) || requestedExtraPeople < 0) throw new Error("Las personas extra deben ser un número entero igual o mayor que cero.");
  const arrivalMode = input.medioLlegada;
  if (!["VEHICULO", "TAXI", "CAMINANDO"].includes(arrivalMode)) throw new Error("Selecciona un medio de llegada válido.");
  if (arrivalMode === "VEHICULO" && (typeof input.marcaModeloVehiculo !== "string" || typeof input.placas !== "string")) {
    throw new Error("Escribe la marca, modelo y placas del vehículo.");
  }
  // The current Estancias sheet has no separate arrival-mode column; retain taxi/walking in MarcaModeloVehiculo.
  const vehicle = arrivalMode === "VEHICULO" ? String(input.marcaModeloVehiculo ?? "").trim() : arrivalMode;
  const plates = arrivalMode === "VEHICULO" ? String(input.placas ?? "").trim().toLocaleUpperCase() : "No aplica";
  if (arrivalMode === "VEHICULO" && !vehicle) throw new Error("Escribe la marca y modelo del vehículo.");
  if (arrivalMode === "VEHICULO" && !plates) throw new Error("Escribe las placas del vehículo.");
  if (vehicle.length > 100 || plates.length > 15) throw new Error("Revisa la longitud de la marca/modelo o las placas.");
  const quotedMinutes = Number(input.minutosCotizados);
  const quotedBasePrice = Number(input.precioBaseCotizado);
  const quotedIncludedPeople = Number(input.personasIncluidasCotizadas);
  const quotedExtraPrice = Number(input.precioPersonaExtraCotizado);
  if (![quotedMinutes, quotedBasePrice, quotedIncludedPeople, quotedExtraPrice].every(Number.isFinite)) {
    throw new Error("Actualiza la cotización antes de registrar la entrada.");
  }
  const signature = entryRequestSignature_(user, input);

  return withScriptLock_(() => {
    const duplicate = readRows_(FEMA_CONFIG.sheets.audit).find((row) => String(row.Motivo) === idempotencyKey);
    if (duplicate) return replayEntry_(user, duplicate, signature, vehicle, plates);

    const room = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion);
    if (!room || isExampleRow_(room) || room.Activo !== true || String(room.IdMotel) !== user.idMotel) throw new Error("Habitación no encontrada.");
    if (String(room.EstadoActual) !== "DISPONIBLE") throw new Error("La habitación ya no está disponible.");
    const pendingCycle = readRows_(FEMA_CONFIG.sheets.cycles).find((row) => !isExampleRow_(row) &&
      String(row.IdMotel) === user.idMotel && String(row.IdHabitacion) === input.idHabitacion && String(row.EstadoCiclo) === "ABIERTO");
    if (room.IdCicloActual || pendingCycle) throw new Error("La habitación tiene un ciclo sin cerrar y requiere revisión antes de registrar otra entrada.");

    const roomTypeId = String(room.IdTipo ?? "").trim().toUpperCase();
    const rate = listEntryRates_(user).find((item) =>
      (item.idTarifa === input.idTarifa || item.idTarifa.startsWith(input.idTarifa + "-")) &&
      String(item.idTipo).trim().toUpperCase() === roomTypeId
    );
    if (!rate) throw new Error("Tarifa no válida o fuera de vigencia para la habitación.");
    if (rate.minutos <= 0 || rate.precioBase < 0 || rate.personasIncluidas < 0 || rate.precioPersonaExtra < 0) throw new Error("La tarifa tiene valores de catálogo no válidos.");
    if (rate.minutos !== quotedMinutes || rate.precioBase !== quotedBasePrice ||
        rate.personasIncluidas !== quotedIncludedPeople || rate.precioPersonaExtra !== quotedExtraPrice) {
      throw new Error("La tarifa cambió desde que abriste la entrada. Actualiza el formulario para confirmar el precio vigente.");
    }
    if (requestedExtraPeople > 0 && rate.precioPersonaExtra <= 0) throw new Error("El tipo de habitación no tiene precio para personas extra.");
    const shift = requireOpenShiftForUser_(user);
    const shiftId = String(shift.IdTurno);

    const createdAt = now_();
    const cycleId = newId_("CIC");
    const stayId = newId_("EST");
    const eventId = newId_("EVT");
    const basePrice = rate.precioBase;
    const extraPeople = requestedExtraPeople;
    const extraPrice = rate.precioPersonaExtra;
    const extraAmount = extraPeople * extraPrice;
    const finalPrice = basePrice + extraAmount;
    const expectedExit = new Date(createdAt.getTime() + rate.minutos * 60000);
    const result: EntryResult = {
      idCiclo: cycleId,
      idEstancia: stayId,
      medioLlegada: arrivalMode,
      minutos: rate.minutos,
      precioBase: basePrice,
      personasIncluidas: rate.personasIncluidas,
      personasExtra: extraPeople,
      precioPersonaExtra: extraPrice,
      importePersonasExtra: extraAmount,
      precioFinal: finalPrice,
      formaPago: String(input.formaPago),
      fechaHoraSalidaPrevista: Utilities.formatDate(expectedExit, FEMA_CONFIG.timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX")
    };

    appendRow_(FEMA_CONFIG.sheets.cycles, {
      IdCiclo: cycleId, IdMotel: user.idMotel, IdHabitacion: input.idHabitacion,
      TipoInicio: "OCUPADA", ComentarioInicio: "", FechaHoraInicio: createdAt,
      FechaHoraFin: "", EstadoCiclo: "ABIERTO", IdUsuarioInicio: user.idUsuario, IdTurnoInicio: shiftId
    });
    appendRow_(FEMA_CONFIG.sheets.stays, {
      IdEstancia: stayId, IdCiclo: cycleId, IdMotel: user.idMotel, IdHabitacionActual: input.idHabitacion,
      IdTarifa: input.idTarifa, IdTurno: shiftId, FechaHoraEntrada: createdAt,
      FechaHoraSalidaPrevista: expectedExit, FechaHoraSalidaReal: "", MarcaModeloVehiculo: vehicle,
      Placas: plates, PersonasExtra: extraPeople, PrecioCatalogo: basePrice, AjustePrecio: extraAmount,
      PrecioFinal: finalPrice, MotivoAjuste: extraPeople ? "PERSONAS_EXTRA" : "", EstadoEstancia: "ACTIVA", IdUsuario: user.idUsuario
    });
    appendRow_(FEMA_CONFIG.sheets.roomEvents, {
      IdEvento: eventId, IdCiclo: cycleId, IdHabitacion: input.idHabitacion, EstadoAnterior: "DISPONIBLE",
      EstadoNuevo: "OCUPADA", FechaHora: createdAt, IdEmpleado: user.idUsuario, Comentario: "Entrada registrada", IdTurno: String(shift.IdTurno)
    });
    appendRow_(FEMA_CONFIG.sheets.payments, {
      IdPago: newId_("PAG"), IdEstancia: stayId, IdTurno: shiftId, FechaHora: createdAt,
      FormaPago: input.formaPago, Monto: finalPrice, Referencia: "ENTRADA", IdUsuario: user.idUsuario, Estado: "APLICADO"
    });

    writeAudit_(user, "REGISTRAR_ENTRADA", "ESTANCIA", stayId, room, {
      firmaEntrada: signature,
      resultado: result,
      idHabitacion: String(room.IdHabitacion)
    }, idempotencyKey);
    updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion, { EstadoActual: "OCUPADA", IdCicloActual: cycleId });
    return result;
  });
}
