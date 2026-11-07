export const localUserEmail = "dev@example.test";
export const secondLocalUserEmail = "recepcion-b@example.test";

export const localSeed = {
  Moteles: [
    { IdMotel: "MOTEL-LOCAL-1", NombreMotel: "Hotel local norte", ZonaHoraria: "America/Mexico_City", Activo: true, CreadoEn: "" },
    { IdMotel: "MOTEL-LOCAL-2", NombreMotel: "Hotel local sur", ZonaHoraria: "America/Mexico_City", Activo: true, CreadoEn: "" },
  ],
  Usuarios: [
    { IdUsuario: "USR-LOCAL-1", IdMotel: "MOTEL-LOCAL-1", Correo: localUserEmail, Nombre: "Recepción", Apellidos: "Norte", IdRol: "ROL-LOCAL-RECEPCION", Activo: true, CreadoEn: "" },
    { IdUsuario: "USR-LOCAL-2", IdMotel: "MOTEL-LOCAL-2", Correo: secondLocalUserEmail, Nombre: "Recepción", Apellidos: "Sur", IdRol: "ROL-LOCAL-RECEPCION", Activo: true, CreadoEn: "" },
  ],
  Roles: [{ IdRol: "ROL-LOCAL-RECEPCION", NombreRol: "Recepción local", Descripcion: "Perfil compartido por fixtures de dos hoteles", Activo: true }],
  Permisos: [
    { IdPermiso: "PER-HAB-GEST", Modulo: "HABITACIONES", Accion: "GESTIONAR", Descripcion: "Fixture local" },
    { IdPermiso: "PER-CAT-GEST", Modulo: "CATALOGOS", Accion: "GESTIONAR", Descripcion: "Fixture local" },
  ],
  RolPermisos: [
    { IdRolPermiso: "RP-LOCAL-1", IdRol: "ROL-LOCAL-RECEPCION", IdPermiso: "PER-HAB-GEST", Permitido: true },
    { IdRolPermiso: "RP-LOCAL-2", IdRol: "ROL-LOCAL-RECEPCION", IdPermiso: "PER-CAT-GEST", Permitido: true },
  ],
  PersonalLimpieza: [
    { IdPersonalLimpieza: "LIM-LOCAL-1", IdMotel: "MOTEL-LOCAL-1", Nombre: "Limpieza", Apellidos: "Norte", TurnoHabitual: "MATUTINO", Activo: true, CreadoEn: "" },
    { IdPersonalLimpieza: "LIM-LOCAL-2", IdMotel: "MOTEL-LOCAL-2", Nombre: "Limpieza", Apellidos: "Sur", TurnoHabitual: "MATUTINO", Activo: true, CreadoEn: "" },
  ],
  TurnosLimpieza: [
    { IdTurnoLimpieza: "TL-LOCAL-1", IdMotel: "MOTEL-LOCAL-1", NombreTurno: "MATUTINO", HoraInicio: "00:00", HoraFin: "23:59", Activo: true, CreadoEn: "" },
    { IdTurnoLimpieza: "TL-LOCAL-2", IdMotel: "MOTEL-LOCAL-2", NombreTurno: "MATUTINO", HoraInicio: "00:00", HoraFin: "23:59", Activo: true, CreadoEn: "" },
  ],
  TiposHabitacion: [
    { IdTipo: "TIPO-LOCAL-1", IdMotel: "MOTEL-LOCAL-1", NombreTipo: "SENCILLA NORTE", PrecioPersonaExtra: 100, Activo: true },
    { IdTipo: "TIPO-LOCAL-2", IdMotel: "MOTEL-LOCAL-2", NombreTipo: "SENCILLA SUR", PrecioPersonaExtra: 100, Activo: true },
  ],
  Tarifas: [
    { IdTarifa: "TARIFA-LOCAL-1", IdTipo: "TIPO-LOCAL-1", NombreTarifa: "Bloque de prueba norte", Minutos: 240, PrecioBase: 500, PersonasIncluidas: 2, VigenciaInicio: "", VigenciaFin: "", Activo: true },
    { IdTarifa: "TARIFA-LOCAL-2", IdTipo: "TIPO-LOCAL-2", NombreTarifa: "Bloque de prueba sur", Minutos: 240, PrecioBase: 600, PersonasIncluidas: 2, VigenciaInicio: "", VigenciaFin: "", Activo: true },
  ],
  Habitaciones: [
    { IdHabitacion: "HAB-LOCAL-1", IdMotel: "MOTEL-LOCAL-1", NumeroHabitacion: "N-TEST-01", IdTipo: "TIPO-LOCAL-1", PuntosLimpieza: 1, EstadoActual: "DISPONIBLE", IdCicloActual: "", Activo: true },
    { IdHabitacion: "HAB-LOCAL-2", IdMotel: "MOTEL-LOCAL-2", NumeroHabitacion: "S-TEST-01", IdTipo: "TIPO-LOCAL-2", PuntosLimpieza: 1, EstadoActual: "DISPONIBLE", IdCicloActual: "", Activo: true },
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
  Productos: [],
  Inventario: [],
  MovimientosInventario: [],
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
  Productos: ["IdProducto", "IdMotel", "Categoria", "Nombre", "PrecioVenta", "CostoUnitario", "Activo", "CreadoEn"],
  Inventario: ["IdInventario", "IdMotel", "IdProducto", "StockBodega", "StockAnaquel", "ActualizadoEn"],
  MovimientosInventario: ["IdMovimiento", "IdMotel", "IdProducto", "TipoMovimiento", "Origen", "Destino", "Cantidad", "StockBodegaDespues", "StockAnaquelDespues", "Motivo", "IdTurno", "IdEstancia", "IdUsuario", "FechaHora"],
};
