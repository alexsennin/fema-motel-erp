export const localUserEmail = "dev@example.test";

export const localSeed = {
  Moteles: [
    { IdMotel: "MOTEL-LOCAL", NombreMotel: "Hotel de prueba FEMA", ZonaHoraria: "America/Mexico_City", Activo: true, CreadoEn: "" },
  ],
  Usuarios: [
    { IdUsuario: "USR-LOCAL", IdMotel: "MOTEL-LOCAL", Correo: localUserEmail, Nombre: "Usuario", Apellidos: "Local", IdRol: "ROL-LOCAL", Activo: true, CreadoEn: "" },
  ],
  Roles: [{ IdRol: "ROL-LOCAL", NombreRol: "Desarrollo local", Descripcion: "Sólo fixture efímero", Activo: true }],
  Permisos: [
    { IdPermiso: "PER-HAB-GEST", Modulo: "HABITACIONES", Accion: "GESTIONAR", Descripcion: "Fixture local" },
    { IdPermiso: "PER-CAT-GEST", Modulo: "CATALOGOS", Accion: "GESTIONAR", Descripcion: "Fixture local" },
  ],
  RolPermisos: [
    { IdRolPermiso: "RP-LOCAL-1", IdRol: "ROL-LOCAL", IdPermiso: "PER-HAB-GEST", Permitido: true },
    { IdRolPermiso: "RP-LOCAL-2", IdRol: "ROL-LOCAL", IdPermiso: "PER-CAT-GEST", Permitido: true },
  ],
  PersonalLimpieza: [
    { IdPersonalLimpieza: "LIM-LOCAL", IdMotel: "MOTEL-LOCAL", Nombre: "Personal", Apellidos: "Prueba", TurnoHabitual: "MATUTINO", Activo: true, CreadoEn: "" },
  ],
  TurnosLimpieza: [
    { IdTurnoLimpieza: "TL-LOCAL", IdMotel: "MOTEL-LOCAL", NombreTurno: "MATUTINO", HoraInicio: "00:00", HoraFin: "23:59", Activo: true, CreadoEn: "" },
  ],
  TiposHabitacion: [
    { IdTipo: "TIPO-LOCAL", IdMotel: "MOTEL-LOCAL", NombreTipo: "SENCILLA PRUEBA", PrecioPersonaExtra: 100, Activo: true },
  ],
  Tarifas: [
    { IdTarifa: "TARIFA-LOCAL", IdTipo: "TIPO-LOCAL", NombreTarifa: "Bloque de prueba", Minutos: 240, PrecioBase: 500, PersonasIncluidas: 2, VigenciaInicio: "", VigenciaFin: "", Activo: true },
  ],
  Habitaciones: [
    { IdHabitacion: "HAB-LOCAL", IdMotel: "MOTEL-LOCAL", NumeroHabitacion: "TEST-01", IdTipo: "TIPO-LOCAL", PuntosLimpieza: 1, EstadoActual: "DISPONIBLE", IdCicloActual: "", Activo: true },
  ],
  Turnos: [],
  Ciclos: [],
  EventosHabitacion: [],
  Estancias: [],
  MovimientosEstancia: [],
  Limpiezas: [],
  Mantenimientos: [],
  Cargos: [],
  Pagos: [],
  Bitacora: [],
  Sesiones: [],
};

export const sheetHeaders = {
  Moteles: ["IdMotel", "NombreMotel", "ZonaHoraria", "Activo", "CreadoEn"],
  Usuarios: ["IdUsuario", "IdMotel", "Correo", "Nombre", "Apellidos", "IdRol", "Activo", "CreadoEn"],
  Roles: ["IdRol", "NombreRol", "Descripcion", "Activo"],
  Permisos: ["IdPermiso", "Modulo", "Accion", "Descripcion"],
  RolPermisos: ["IdRolPermiso", "IdRol", "IdPermiso", "Permitido"],
  PersonalLimpieza: ["IdPersonalLimpieza", "IdMotel", "Nombre", "Apellidos", "TurnoHabitual", "Activo", "CreadoEn"],
  TurnosLimpieza: ["IdTurnoLimpieza", "IdMotel", "NombreTurno", "HoraInicio", "HoraFin", "Activo", "CreadoEn"],
  TiposHabitacion: ["IdTipo", "IdMotel", "NombreTipo", "PrecioPersonaExtra", "Activo"],
  Tarifas: ["IdTarifa", "IdTipo", "NombreTarifa", "Minutos", "PrecioBase", "PersonasIncluidas", "VigenciaInicio", "VigenciaFin", "Activo"],
  Habitaciones: ["IdHabitacion", "IdMotel", "NumeroHabitacion", "IdTipo", "PuntosLimpieza", "EstadoActual", "IdCicloActual", "Activo"],
  Turnos: ["IdTurno", "IdMotel", "IdUsuarioApertura", "FechaHoraApertura", "FondoInicial", "Estado", "IdUsuarioCierre", "FechaHoraCierre"],
  Ciclos: ["IdCiclo", "IdMotel", "IdHabitacion", "TipoInicio", "ComentarioInicio", "FechaHoraInicio", "FechaHoraFin", "EstadoCiclo", "IdUsuarioInicio", "IdTurnoInicio"],
  EventosHabitacion: ["IdEvento", "IdCiclo", "IdHabitacion", "EstadoAnterior", "EstadoNuevo", "FechaHora", "IdEmpleado", "Comentario", "IdTurno"],
  Estancias: ["IdEstancia", "IdCiclo", "IdMotel", "IdHabitacionActual", "IdTarifa", "IdTurno", "FechaHoraEntrada", "FechaHoraSalidaPrevista", "FechaHoraSalidaReal", "MarcaModeloVehiculo", "Placas", "PersonasExtra", "PrecioCatalogo", "AjustePrecio", "PrecioFinal", "MotivoAjuste", "EstadoEstancia", "IdUsuario"],
  MovimientosEstancia: ["IdMovimientoEstancia", "IdEstancia", "TipoMovimiento", "FechaHora", "IdHabitacionOrigen", "IdHabitacionDestino", "MinutosAgregados", "MontoAjuste", "Comentario", "IdUsuario"],
  Limpiezas: ["IdLimpieza", "IdCiclo", "IdHabitacion", "IdPersonalLimpieza", "FechaHoraAsignacion", "FechaHoraInicio", "FechaHoraFin", "MinutosLimpieza", "Puntos", "Estado", "IdUsuarioAsigna", "IdUsuarioFinaliza"],
  Mantenimientos: ["IdMantenimiento", "IdCiclo", "IdHabitacion", "FechaHoraReporte", "Motivo", "Prioridad", "Estado", "Responsable", "FechaHoraFin", "Resolucion", "IdUsuario"],
  Cargos: ["IdCargo", "IdEstancia", "IdTurno", "TipoCargo", "Descripcion", "Cantidad", "PrecioUnitario", "Total", "FechaHora", "IdUsuario", "Estado"],
  Pagos: ["IdPago", "IdEstancia", "IdTurno", "FechaHora", "FormaPago", "Monto", "Referencia", "IdUsuario", "Estado"],
  Bitacora: ["IdBitacora", "IdMotel", "FechaHora", "IdUsuario", "Modulo", "Accion", "Entidad", "IdEntidad", "DatosAntesJSON", "DatosDespuesJSON", "Motivo", "IdSesion"],
  Sesiones: ["IdSesion", "IdUsuario", "FechaHoraInicio", "FechaHoraUltimaActividad", "FechaHoraFin", "Activa", "UserAgent"],
};
