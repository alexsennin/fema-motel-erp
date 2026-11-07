import { sheetHeaders } from "./seed-data.mjs";

function rowFor(sheetName, record) {
  const headers = sheetHeaders[sheetName];
  if (!headers) throw new Error(`No existe esquema local v1 para ${sheetName}.`);
  const unknown = Object.keys(record).filter((key) => !headers.includes(key));
  if (unknown.length) throw new Error(`Fixture ${sheetName} contiene campos fuera de v1: ${unknown.join(", ")}.`);
  return headers.map((header) => record[header] ?? "");
}

export function createSchemaTransitionFixture() {
  const tables = Object.fromEntries(Object.entries(sheetHeaders).map(([name, headers]) => [
    name,
    { headers: [...headers], rows: [] },
  ]));

  const add = (sheetName, ...records) => {
    tables[sheetName].rows.push(...records.map((record) => rowFor(sheetName, record)));
  };

  add("Moteles", {
    IdMotel: "SYN-MOTEL-1", NombreMotel: "Fixture sintético", ZonaHoraria: "America/Mexico_City", Activo: true,
  });
  add("Roles", { IdRol: "SYN-ROL-1", NombreRol: "Perfil sintético", Descripcion: "Fixture FEMA-UPD-23", Activo: true });
  add("Usuarios", {
    IdUsuario: "SYN-USER-1", IdMotel: "SYN-MOTEL-1", Correo: "fema-upd23@example.test",
    Nombre: "Fixture", Apellidos: "Sintético", IdRol: "SYN-ROL-1", Activo: true,
  });
  add("TiposHabitacion", {
    IdTipo: "SYN-TIPO-1", IdMotel: "SYN-MOTEL-1", NombreTipo: "Tipo sintético", Activo: true,
  });
  add("Tarifas", {
    IdTarifa: "SYN-TARIFA-1", IdTipo: "SYN-TIPO-1", NombreTarifa: "Registro sintético sin precio",
    Minutos: 0, PrecioBase: "", PersonasIncluidas: "", VigenciaInicio: "", VigenciaFin: "", Activo: true,
  });
  add("PersonalLimpieza", {
    IdPersonalLimpieza: "SYN-LIMPIEZA-1", IdMotel: "SYN-MOTEL-1", Nombre: "Fixture", Apellidos: "Sintético",
    TurnoHabitual: "MATUTINO", Activo: true,
  });
  add("TurnosLimpieza", {
    IdTurnoLimpieza: "SYN-TLIM-1", IdMotel: "SYN-MOTEL-1", NombreTurno: "MATUTINO",
    HoraInicio: "00:00", HoraFin: "23:59", Activo: true,
  });

  add("Turnos",
    {
      IdTurno: "SYN-TURNO-A", IdMotel: "SYN-MOTEL-1", IdUsuarioApertura: "SYN-USER-1",
      FechaHoraApertura: "2026-10-07T22:00:00-06:00", FondoInicial: 0, Estado: "CERRADO",
      IdUsuarioCierre: "SYN-USER-1", FechaHoraCierre: "2026-10-08T00:00:00-06:00",
    },
    {
      IdTurno: "SYN-TURNO-B", IdMotel: "SYN-MOTEL-1", IdUsuarioApertura: "SYN-USER-1",
      FechaHoraApertura: "2026-10-08T00:00:00-06:00", FondoInicial: 0, Estado: "ABIERTO",
      IdUsuarioCierre: "", FechaHoraCierre: "",
    },
  );

  add("Ciclos",
    {
      IdCiclo: "SYN-CICLO-CRUZA-TURNO", IdMotel: "SYN-MOTEL-1", IdHabitacion: "SYN-HAB-OCUPADA",
      TipoInicio: "OCUPADA", ComentarioInicio: "Fixture sintético; cruza el relevo",
      FechaHoraInicio: "2026-10-07T23:55:00-06:00", FechaHoraFin: "", EstadoCiclo: "ABIERTO",
      IdUsuarioInicio: "SYN-USER-1", IdTurnoInicio: "SYN-TURNO-A",
    },
    {
      IdCiclo: "SYN-CICLO-LIMPIEZA", IdMotel: "SYN-MOTEL-1", IdHabitacion: "SYN-HAB-LIMPIEZA",
      TipoInicio: "LIMPIEZA", ComentarioInicio: "Fixture sintético; limpieza activa",
      FechaHoraInicio: "2026-10-08T00:05:00-06:00", FechaHoraFin: "", EstadoCiclo: "ABIERTO",
      IdUsuarioInicio: "SYN-USER-1", IdTurnoInicio: "SYN-TURNO-B",
    },
  );

  add("Habitaciones",
    {
      IdHabitacion: "SYN-HAB-OCUPADA", IdMotel: "SYN-MOTEL-1", NumeroHabitacion: "S-TEST-01",
      IdTipo: "SYN-TIPO-1", PuntosLimpieza: 1, EstadoActual: "OCUPADA",
      IdCicloActual: "SYN-CICLO-CRUZA-TURNO", Activo: true,
    },
    {
      IdHabitacion: "SYN-HAB-LIMPIEZA", IdMotel: "SYN-MOTEL-1", NumeroHabitacion: "S-TEST-02",
      IdTipo: "SYN-TIPO-1", PuntosLimpieza: 1, EstadoActual: "LIMPIEZA",
      IdCicloActual: "SYN-CICLO-LIMPIEZA", Activo: true,
    },
    {
      IdHabitacion: "SYN-HAB-HISTORICA", IdMotel: "SYN-MOTEL-1", NumeroHabitacion: "S-TEST-03",
      IdTipo: "SYN-TIPO-1", PuntosLimpieza: 1, EstadoActual: "DISPONIBLE", IdCicloActual: "", Activo: true,
    },
  );

  add("EventosHabitacion",
    {
      IdEvento: "SYN-EVENTO-OCUPADA", IdCiclo: "SYN-CICLO-CRUZA-TURNO", IdHabitacion: "SYN-HAB-OCUPADA",
      EstadoAnterior: "DISPONIBLE", EstadoNuevo: "OCUPADA", FechaHora: "2026-10-07T23:55:00-06:00",
      IdEmpleado: "SYN-USER-1", Comentario: "Fixture sintético", IdTurno: "SYN-TURNO-A",
    },
    {
      IdEvento: "SYN-EVENTO-LIMPIEZA", IdCiclo: "SYN-CICLO-LIMPIEZA", IdHabitacion: "SYN-HAB-LIMPIEZA",
      EstadoAnterior: "SUCIA", EstadoNuevo: "LIMPIEZA", FechaHora: "2026-10-08T00:05:00-06:00",
      IdEmpleado: "SYN-USER-1", Comentario: "Fixture sintético", IdTurno: "SYN-TURNO-B",
    },
  );

  add("Estancias",
    {
      IdEstancia: "SYN-ESTANCIA-MULTIPAGO", IdCiclo: "SYN-CICLO-CRUZA-TURNO", IdMotel: "SYN-MOTEL-1",
      IdHabitacionActual: "SYN-HAB-OCUPADA", IdTarifa: "SYN-TARIFA-1", IdTurno: "SYN-TURNO-A",
      FechaHoraEntrada: "2026-10-07T23:55:00-06:00", FechaHoraSalidaPrevista: "2026-10-08T03:55:00-06:00",
      FechaHoraSalidaReal: "", MarcaModeloVehiculo: "Fixture", Placas: "No aplica", PersonasExtra: 0,
      PrecioCatalogo: "12.51", AjustePrecio: 0, PrecioFinal: "12.51", MotivoAjuste: "",
      EstadoEstancia: "ACTIVA", IdUsuario: "SYN-USER-1",
    },
    {
      IdEstancia: "SYN-ESTANCIA-LEGADO", IdCiclo: "SYN-CICLO-AUSENTE", IdMotel: "SYN-MOTEL-1",
      IdHabitacionActual: "SYN-HAB-HISTORICA", IdTarifa: "SYN-TARIFA-AUSENTE", IdTurno: "SYN-TURNO-A",
      FechaHoraEntrada: "2026-10-06T10:00:00-06:00", FechaHoraSalidaPrevista: "2026-10-06T14:00:00-06:00",
      FechaHoraSalidaReal: "2026-10-06T13:50:00-06:00", MarcaModeloVehiculo: "", Placas: "No aplica",
      PersonasExtra: 0, PrecioCatalogo: "", AjustePrecio: "", PrecioFinal: "", MotivoAjuste: "",
      EstadoEstancia: "FINALIZADA", IdUsuario: "SYN-USER-1",
    },
  );

  add("Limpiezas", {
    IdLimpieza: "SYN-LIMPIEZA-ACTIVA", IdCiclo: "SYN-CICLO-LIMPIEZA", IdHabitacion: "SYN-HAB-LIMPIEZA",
    IdPersonalLimpieza: "SYN-LIMPIEZA-1", FechaHoraAsignacion: "2026-10-08T00:05:00-06:00",
    FechaHoraInicio: "2026-10-08T00:06:00-06:00", FechaHoraFin: "", MinutosLimpieza: "", Puntos: 1,
    Estado: "EN_PROCESO", IdUsuarioAsigna: "SYN-USER-1", IdUsuarioFinaliza: "",
  });

  add("Pagos",
    {
      IdPago: "SYN-PAGO-1", IdEstancia: "SYN-ESTANCIA-MULTIPAGO", IdTurno: "SYN-TURNO-A",
      FechaHora: "2026-10-07T23:56:00-06:00", FormaPago: "EFECTIVO", Monto: "8.25",
      Referencia: "", IdUsuario: "SYN-USER-1", Estado: "APLICADO",
    },
    {
      IdPago: "SYN-PAGO-2", IdEstancia: "SYN-ESTANCIA-MULTIPAGO", IdTurno: "SYN-TURNO-A",
      FechaHora: "2026-10-07T23:57:00-06:00", FormaPago: "TARJETA", Monto: "4.25",
      Referencia: "SYN-REF-2", IdUsuario: "SYN-USER-1", Estado: "APLICADO",
    },
  );

  add("Bitacora",
    {
      IdBitacora: "SYN-BITACORA-DUPLICADA", IdMotel: "SYN-MOTEL-1", FechaHora: "2026-10-07T23:55:00-06:00",
      IdUsuario: "SYN-USER-1", Modulo: "FIXTURE", Accion: "EVENTO", Entidad: "CICLO",
      IdEntidad: "SYN-CICLO-CRUZA-TURNO", DatosAntesJSON: "", DatosDespuesJSON: "{}", Motivo: "", IdSesion: "",
    },
    {
      IdBitacora: "SYN-BITACORA-DUPLICADA", IdMotel: "SYN-MOTEL-1", FechaHora: "2026-10-07T23:55:00-06:00",
      IdUsuario: "SYN-USER-1", Modulo: "FIXTURE", Accion: "EVENTO", Entidad: "CICLO",
      IdEntidad: "SYN-CICLO-CRUZA-TURNO", DatosAntesJSON: "", DatosDespuesJSON: "{}", Motivo: "", IdSesion: "",
    },
  );

  return { fixture: "FEMA-UPD-23 synthetic only", tables };
}
