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

function registerEntry_(user: FemaUser, input: EntryInput): { idCiclo: string; idEstancia: string } {
  assertPermission_(user, "PER-HAB-GEST");
  if (!input.idempotencyKey) throw new Error("Falta la clave de idempotencia de la operación.");

  return withScriptLock_(() => {
    const duplicate = readRows_(FEMA_CONFIG.sheets.audit).find((row) => String(row.Motivo) === input.idempotencyKey);
    if (duplicate) throw new Error("Esta operación ya fue registrada.");

    const room = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion);
    if (!room || String(room.IdMotel) !== user.idMotel) throw new Error("Habitación no encontrada.");
    if (String(room.EstadoActual) !== "DISPONIBLE") throw new Error("La habitación ya no está disponible.");

    const rate = findRowById_(FEMA_CONFIG.sheets.rates, "IdTarifa", input.idTarifa);
    if (!rate || rate.Activo !== true || String(rate.IdTipo) !== String(room.IdTipo)) throw new Error("Tarifa no válida para la habitación.");
    const shift = findRowById_(FEMA_CONFIG.sheets.shifts, "IdTurno", input.idTurno);
    if (!shift || String(shift.IdMotel) !== user.idMotel || String(shift.Estado) !== "ABIERTO") throw new Error("No existe un turno abierto válido.");

    const createdAt = now_();
    const cycleId = newId_("CIC");
    const stayId = newId_("EST");
    const eventId = newId_("EVT");
    const basePrice = Number(rate.PrecioBase) || 0;
    const extraPeople = Math.max(0, Number(input.personasExtra) || 0);
    const roomType = findRowById_(FEMA_CONFIG.sheets.roomTypes, "IdTipo", String(room.IdTipo));
    const extraPrice = Number(roomType?.PrecioPersonaExtra) || 0;
    const finalPrice = basePrice + (extraPeople * extraPrice);
    const expectedExit = new Date(createdAt.getTime() + (Number(rate.Minutos) || 0) * 60000);

    appendRow_(FEMA_CONFIG.sheets.cycles, {
      IdCiclo: cycleId, IdMotel: user.idMotel, IdHabitacion: input.idHabitacion,
      TipoInicio: "OCUPADA", ComentarioInicio: "", FechaHoraInicio: createdAt,
      FechaHoraFin: "", EstadoCiclo: "ABIERTO", IdUsuarioInicio: user.idUsuario, IdTurnoInicio: input.idTurno
    });
    appendRow_(FEMA_CONFIG.sheets.stays, {
      IdEstancia: stayId, IdCiclo: cycleId, IdMotel: user.idMotel, IdHabitacionActual: input.idHabitacion,
      IdTarifa: input.idTarifa, IdTurno: input.idTurno, FechaHoraEntrada: createdAt,
      FechaHoraSalidaPrevista: expectedExit, FechaHoraSalidaReal: "", MarcaModeloVehiculo: input.marcaModeloVehiculo,
      Placas: input.placas, PersonasExtra: extraPeople, PrecioCatalogo: basePrice, AjustePrecio: extraPeople * extraPrice,
      PrecioFinal: finalPrice, MotivoAjuste: extraPeople ? "PERSONAS_EXTRA" : "", EstadoEstancia: "ACTIVA", IdUsuario: user.idUsuario
    });
    appendRow_(FEMA_CONFIG.sheets.roomEvents, {
      IdEvento: eventId, IdCiclo: cycleId, IdHabitacion: input.idHabitacion, EstadoAnterior: "DISPONIBLE",
      EstadoNuevo: "OCUPADA", FechaHora: createdAt, IdUsuario: user.idUsuario, Comentario: "Entrada registrada", Origen: "WEBAPP"
    });
    updateRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", input.idHabitacion, { EstadoActual: "OCUPADA", IdCicloActual: cycleId });

    if (Number(input.montoPago) > 0) {
      appendRow_(FEMA_CONFIG.sheets.payments, {
        IdPago: newId_("PAG"), IdEstancia: stayId, IdTurno: input.idTurno, FechaHora: createdAt,
        FormaPago: input.formaPago, Monto: Number(input.montoPago), Referencia: "ENTRADA", IdUsuario: user.idUsuario, Estado: "APLICADO"
      });
    }

    writeAudit_(user, "REGISTRAR_ENTRADA", "ESTANCIA", stayId, room, { cycleId, stayId, finalPrice }, input.idempotencyKey);
    return { idCiclo: cycleId, idEstancia: stayId };
  });
}

