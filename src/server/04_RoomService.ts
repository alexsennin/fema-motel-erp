function listRoomCards_(user: FemaUser): RoomCard[] {
  const roomTypes = new Map(readRows_(FEMA_CONFIG.sheets.roomTypes)
    .filter((row) => row.Activo === true)
    .map((row) => [String(row.IdTipo), String(row.NombreTipo)]));
  const rates = readRows_(FEMA_CONFIG.sheets.rates).filter((row) => row.Activo === true);

  return readRows_(FEMA_CONFIG.sheets.rooms)
    .filter((room) => room.Activo === true && String(room.IdMotel) === user.idMotel && !isExampleRow_(room))
    .map((room) => {
      const typeId = String(room.IdTipo);
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
        idCicloActual: room.IdCicloActual ? String(room.IdCicloActual) : null
      };
    })
    .sort((a, b) => a.numeroHabitacion.localeCompare(b.numeroHabitacion, "es", { numeric: true }));
}

function listEntryRates_(user: FemaUser): EntryRate[] {
  const roomTypes = new Map(readRows_(FEMA_CONFIG.sheets.roomTypes)
    .filter((row) => row.Activo === true && String(row.IdMotel) === user.idMotel && !isExampleRow_(row))
    .map((row) => [String(row.IdTipo), Number(row.PrecioPersonaExtra) || 0]));
  const today = now_().getTime();

  return readRows_(FEMA_CONFIG.sheets.rates)
    .filter((row) => {
      if (row.Activo !== true || isExampleRow_(row) || !roomTypes.has(String(row.IdTipo))) return false;
      const startText = String(row.VigenciaInicio ?? "");
      const endText = String(row.VigenciaFin ?? "");
      const starts = startText ? new Date(startText.length === 10 ? `${startText}T00:00:00` : startText).getTime() : null;
      const ends = endText ? new Date(endText.length === 10 ? `${endText}T23:59:59` : endText).getTime() : null;
      return (!starts || starts <= today) && (!ends || ends >= today);
    })
    .map((row) => ({
      idTarifa: String(row.IdTarifa),
      idTipo: String(row.IdTipo),
      nombre: String(row.NombreTarifa),
      minutos: Number(row.Minutos) || 0,
      precioBase: Number(row.PrecioBase) || 0,
      personasIncluidas: Number(row.PersonasIncluidas) || 0,
      precioPersonaExtra: roomTypes.get(String(row.IdTipo)) ?? 0
    }))
    .sort((a, b) => a.idTipo.localeCompare(b.idTipo) || a.minutos - b.minutos);
}

function registerEntry_(user: FemaUser, input: EntryInput): EntryResult {
  assertPermission_(user, "PER-HAB-GEST");
  if (!input.idempotencyKey) throw new Error("Falta la clave de idempotencia de la operación.");
  if (!input.idHabitacion || !input.idTarifa) throw new Error("Selecciona una habitación y una tarifa.");
  if (!["EFECTIVO", "TARJETA", "TRANSFERENCIA"].includes(String(input.formaPago))) throw new Error("Selecciona una forma de pago válida.");
  const requestedExtraPeople = Number(input.personasExtra);
  if (!Number.isInteger(requestedExtraPeople) || requestedExtraPeople < 0) throw new Error("Las personas extra deben ser un número entero igual o mayor que cero.");

  return withScriptLock_(() => {
    const duplicate = readRows_(FEMA_CONFIG.sheets.audit).find((row) => String(row.Motivo) === input.idempotencyKey);
    if (duplicate) throw new Error("Esta operación ya fue registrada.");

    const room = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion);
    if (!room || String(room.IdMotel) !== user.idMotel) throw new Error("Habitación no encontrada.");
    if (String(room.EstadoActual) !== "DISPONIBLE") throw new Error("La habitación ya no está disponible.");

    const rate = listEntryRates_(user).find((item) => item.idTarifa === input.idTarifa && item.idTipo === String(room.IdTipo));
    if (!rate) throw new Error("Tarifa no válida o fuera de vigencia para la habitación.");
    const shift = requireOpenShiftForUser_(user);
    const shiftId = String(shift.IdTurno);

    const createdAt = now_();
    const cycleId = newId_("CIC");
    const stayId = newId_("EST");
    const eventId = newId_("EVT");
    const basePrice = rate.precioBase;
    const extraPeople = requestedExtraPeople;
    const extraPrice = rate.precioPersonaExtra;
    const finalPrice = basePrice + (extraPeople * extraPrice);
    const expectedExit = new Date(createdAt.getTime() + rate.minutos * 60000);

    appendRow_(FEMA_CONFIG.sheets.cycles, {
      IdCiclo: cycleId, IdMotel: user.idMotel, IdHabitacion: input.idHabitacion,
      TipoInicio: "OCUPADA", ComentarioInicio: "", FechaHoraInicio: createdAt,
      FechaHoraFin: "", EstadoCiclo: "ABIERTO", IdUsuarioInicio: user.idUsuario, IdTurnoInicio: shiftId
    });
    appendRow_(FEMA_CONFIG.sheets.stays, {
      IdEstancia: stayId, IdCiclo: cycleId, IdMotel: user.idMotel, IdHabitacionActual: input.idHabitacion,
      IdTarifa: input.idTarifa, IdTurno: shiftId, FechaHoraEntrada: createdAt,
      FechaHoraSalidaPrevista: expectedExit, FechaHoraSalidaReal: "", MarcaModeloVehiculo: input.marcaModeloVehiculo,
      Placas: input.placas, PersonasExtra: extraPeople, PrecioCatalogo: basePrice, AjustePrecio: extraPeople * extraPrice,
      PrecioFinal: finalPrice, MotivoAjuste: extraPeople ? "PERSONAS_EXTRA" : "", EstadoEstancia: "ACTIVA", IdUsuario: user.idUsuario
    });
    appendRow_(FEMA_CONFIG.sheets.roomEvents, {
      IdEvento: eventId, IdCiclo: cycleId, IdHabitacion: input.idHabitacion, EstadoAnterior: "DISPONIBLE",
      EstadoNuevo: "OCUPADA", FechaHora: createdAt, IdEmpleado: user.idUsuario, Comentario: "Entrada registrada", IdTurno: String(shift.IdTurno)
    });
    updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion, { EstadoActual: "OCUPADA", IdCicloActual: cycleId });

    appendRow_(FEMA_CONFIG.sheets.payments, {
      IdPago: newId_("PAG"), IdEstancia: stayId, IdTurno: shiftId, FechaHora: createdAt,
      FormaPago: input.formaPago, Monto: finalPrice, Referencia: "ENTRADA", IdUsuario: user.idUsuario, Estado: "APLICADO"
    });

    writeAudit_(user, "REGISTRAR_ENTRADA", "ESTANCIA", stayId, room, { cycleId, stayId, finalPrice }, input.idempotencyKey);
    return {
      idCiclo: cycleId,
      idEstancia: stayId,
      precioFinal: finalPrice,
      fechaHoraSalidaPrevista: Utilities.formatDate(expectedExit, FEMA_CONFIG.timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX")
    };
  });
}
