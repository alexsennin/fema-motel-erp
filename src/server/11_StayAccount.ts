function getStayAccount_(user: FemaUser, idHabitacion: string): StayAccount {
  assertPermission_(user, "PER-HAB-GEST");

  const room = findRowById_(FEMA_CONFIG.sheets.rooms, "IdHabitacion", idHabitacion);
  if (!room || isExampleRow_(room) || String(room.IdMotel) !== user.idMotel) {
    throw new Error("Habitación no encontrada.");
  }

  const cycleId = String(room.IdCicloActual || "");
  let stay: SheetRow | undefined;

  if (cycleId) {
    stay = readRows_(FEMA_CONFIG.sheets.stays).find((r) =>
      !isExampleRow_(r) && String(r.IdCiclo) === cycleId && String(r.EstadoEstancia) === "ACTIVA"
    );
  }

  if (!stay) {
    stay = readRows_(FEMA_CONFIG.sheets.stays)
      .filter((r) => !isExampleRow_(r) && String(r.IdHabitacionActual) === idHabitacion)
      .reverse()[0];
  }

  if (!stay) {
    throw new Error("No se encontró ninguna estancia para esta habitación.");
  }

  const stayId = String(stay.IdEstancia);
  const renta = Number(stay.PrecioCatalogo || stay.PrecioFinal || 0);
  const totalRenta = Number(stay.PrecioFinal || 0);
  const personasExtra = Number(stay.PersonasExtra || 0);

  const charges = readRows_(FEMA_CONFIG.sheets.charges)
    .filter((c) => !isExampleRow_(c) && String(c.IdEstancia) === stayId);

  const consumos: StayAccountConsumption[] = charges.map((c) => ({
    idCargo: String(c.IdCargo),
    descripcion: String(c.Descripcion || ""),
    cantidad: Number(c.Cantidad || 1),
    precioUnitario: Number(c.PrecioUnitario || 0),
    total: Number(c.Total || 0),
    estado: String(c.Estado || "PENDIENTE"),
    fechaHora: formatIso_(c.FechaHora)
  }));

  const totalConsumos = consumos.reduce((acc, item) => acc + item.total, 0);

  const payments = readRows_(FEMA_CONFIG.sheets.payments)
    .filter((p) => !isExampleRow_(p) && String(p.IdEstancia) === stayId && String(p.Estado) === "APLICADO");

  const pagos: StayAccountPayment[] = payments.map((p) => ({
    idPago: String(p.IdPago),
    formaPago: String(p.FormaPago || "EFECTIVO"),
    monto: Number(p.Monto || 0),
    concepto: String(p.Concepto || p.Referencia || "PAGO"),
    fechaHora: formatIso_(p.FechaHora)
  }));

  const totalPagos = pagos.reduce((acc, item) => acc + item.monto, 0);
  const saldo = Math.max(0, Math.round((totalRenta + totalConsumos - totalPagos) * 100) / 100);

  return {
    idEstancia: stayId,
    idHabitacion: String(room.IdHabitacion),
    numeroHabitacion: String(room.NumeroHabitacion),
    renta,
    personasExtra,
    totalRenta,
    consumos,
    totalConsumos,
    pagos,
    totalPagos,
    saldo,
    estadoEstancia: String(stay.EstadoEstancia || "")
  };
}
