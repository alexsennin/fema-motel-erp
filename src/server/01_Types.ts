type CellValue = string | number | boolean | Date | null;
type SheetRow = Record<string, CellValue>;

type RoomStatus = "DISPONIBLE" | "OCUPADA" | "SUCIA" | "LIMPIEZA" | "MANTENIMIENTO";
type CycleStartType = "OCUPADA" | "TRASLADO" | "LIMPIEZA" | "MANTENIMIENTO";

interface FemaUser {
  idUsuario: string;
  idMotel: string;
  email: string;
  name: string;
  roleId: string;
}

interface RoomCard {
  idHabitacion: string;
  idMotel: string;
  idTipo: string;
  numeroHabitacion: string;
  tipoHabitacion: string;
  precioDesde: number;
  puntosLimpieza: number;
  estado: RoomStatus;
  idCicloActual: string | null;
  idEstanciaActiva: string | null;
  fechaHoraEntrada: string;
  fechaHoraSalidaPrevista: string;
  marcaModeloVehiculo: string;
  placas: string;
  personasExtra: number;
  precioCatalogo: number;
  ajustePrecio: number;
  precioFinal: number;
  precioPersonaExtra: number;
  idLimpiezaActiva: string | null;
  personalLimpieza: string;
  fechaHoraInicioLimpieza: string;
}

interface EntryRate {
  idTarifa: string;
  idTipo: string;
  nombre: string;
  minutos: number;
  precioBase: number;
  personasIncluidas: number;
  precioPersonaExtra: number;
}

interface InitialState {
  user: FemaUser;
  generatedAt: string;
  rooms: RoomCard[];
  entryRates: EntryRate[];
  vehicleSuggestions: string[];
  cleaningStaff: CleaningStaffOption[];
  shift: ShiftState;
}

interface CleaningStaffOption {
  idPersonalLimpieza: string;
  idMotel: string;
  nombre: string;
  turnoHabitual: string;
  disponible: boolean;
  habitacionAsignada: string;
}

type ShiftStatus = "ABIERTO" | "CERRADO";

interface ShiftView {
  idTurno: string;
  idMotel: string;
  idEmpleadoApertura: string;
  empleadoApertura: string;
  fechaHoraApertura: string;
  fechaHoraCierre: string;
  estado: ShiftStatus;
}

interface ShiftState {
  activeShift: ShiftView | null;
  recentShifts: ShiftView[];
  canOperate: boolean;
}

interface CatalogMotel { idMotel: string; nombre: string; zonaHoraria: string; activo: boolean; }
interface CatalogReceptionist { idUsuario: string; idMotel: string; correo: string; nombre: string; apellidos: string; activo: boolean; }
interface CatalogCleaningStaff { idPersonalLimpieza: string; idMotel: string; nombre: string; apellidos: string; turnoHabitual: string; activo: boolean; }
interface CatalogCleaningShift { idTurnoLimpieza: string; idMotel: string; nombreTurno: string; horaInicio: string; horaFin: string; activo: boolean; }
interface CatalogRoomType { idTipo: string; idMotel: string; nombre: string; precioPersonaExtra: number; activo: boolean; }
interface CatalogRate { idTarifa: string; idTipo: string; idMotel: string; nombre: string; minutos: number; precioBase: number; personasIncluidas: number; vigenciaInicio: string; vigenciaFin: string; activo: boolean; }
interface CatalogRoom { idHabitacion: string; idMotel: string; numero: string; idTipo: string; puntosLimpieza: number; estado: RoomStatus; idCicloActual: string; activo: boolean; }
interface CatalogState { user: FemaUser; motels: CatalogMotel[]; receptionists: CatalogReceptionist[]; cleaningStaff: CatalogCleaningStaff[]; cleaningShifts: CatalogCleaningShift[]; roomTypes: CatalogRoomType[]; rates: CatalogRate[]; catalogRooms: CatalogRoom[]; }
interface MotelInput { idMotel?: string; nombre: string; zonaHoraria: string; }
interface ReceptionistInput { idUsuario?: string; idMotel: string; correo: string; nombre: string; apellidos: string; }
interface CleaningStaffInput { idPersonalLimpieza?: string; idMotel: string; nombre: string; apellidos: string; turnoHabitual: string; }
interface CleaningShiftInput { idTurnoLimpieza: string; idMotel: string; nombreTurno: string; horaInicio: string; horaFin: string; }
interface RoomTypeInput { idTipo?: string; idMotel: string; nombre: string; precioPersonaExtra: number; }
interface RateInput { idTarifa?: string; idTipo: string; nombre: string; minutos: number; precioBase: number; personasIncluidas: number; vigenciaInicio: string; vigenciaFin: string; }
interface RoomInput { idHabitacion?: string; idMotel: string; numero: string; idTipo: string; puntosLimpieza: number; }

type EntryArrivalMode = "VEHICULO" | "TAXI" | "CAMINANDO";

interface EntryInput {
  idHabitacion: string;
  idTarifa: string;
  medioLlegada: EntryArrivalMode;
  marcaModeloVehiculo: string;
  placas: string;
  personasExtra: number;
  formaPago: string;
  minutosCotizados: number;
  precioBaseCotizado: number;
  personasIncluidasCotizadas: number;
  precioPersonaExtraCotizado: number;
  idempotencyKey: string;
}

interface EntryResult {
  idCiclo: string;
  idEstancia: string;
  medioLlegada: EntryArrivalMode;
  minutos: number;
  precioBase: number;
  personasIncluidas: number;
  personasExtra: number;
  precioPersonaExtra: number;
  importePersonasExtra: number;
  precioFinal: number;
  formaPago: string;
  fechaHoraSalidaPrevista: string;
}

interface ExitInput {
  idHabitacion: string;
  observaciones: string;
  idempotencyKey: string;
}

interface ExitResult {
  idCiclo: string;
  idEstancia: string;
  fechaHoraSalidaReal: string;
  estadoHabitacion: "SUCIA";
}

interface TransferRoomInput {
  idHabitacionOrigen: string;
  idHabitacionDestino: string;
  idempotencyKey: string;
}

interface TransferRoomResult {
  idEstancia: string;
  idHabitacionOrigen: string;
  idHabitacionDestino: string;
}

interface CancelStayInput {
  idHabitacion: string;
  comentario: string;
  idempotencyKey: string;
}

interface CancelStayResult {
  idEstancia: string;
  estadoHabitacion: "SUCIA";
  precioFinal: 0;
}

interface UndoRoomStateInput {
  idHabitacion: string;
  idempotencyKey: string;
}

interface UndoRoomStateResult {
  idHabitacion: string;
  estadoHabitacion: "OCUPADA" | "SUCIA";
}

interface AddExtraPersonInput {
  idHabitacion: string;
  cantidad: number;
  observaciones: string;
  idempotencyKey: string;
}

interface AddExtraPersonResult {
  idEstancia: string;
  personasExtra: number;
  precioFinal: number;
}

interface EditActiveStayInput {
  idHabitacion: string;
  fechaHoraSalidaPrevista: string;
  marcaModeloVehiculo: string;
  placas: string;
  personasExtra: number;
  precioFinal: number;
  observaciones: string;
  idempotencyKey: string;
}

interface EditActiveStayResult {
  idEstancia: string;
  precioFinal: number;
}

interface CleaningAssignmentInput {
  idHabitacion: string;
  idPersonalLimpieza: string;
  idempotencyKey: string;
}

interface CleaningAssignmentResult {
  idLimpieza: string;
  idCiclo: string;
  estadoHabitacion: "LIMPIEZA";
}

interface CleaningCompletionInput {
  idHabitacion: string;
  idempotencyKey: string;
}

interface CleaningCompletionResult {
  idLimpieza: string;
  idCiclo: string;
  minutosLimpieza: number;
  estadoHabitacion: "DISPONIBLE";
}

interface RentalReportRow {
  idEstancia: string;
  habitacion: string;
  fechaHoraEntrada: string;
  fechaHoraSalidaReal: string;
  estadoDesocupacion: string;
  precioFinal: number;
  formaPago: string;
  fechaHoraLimpieza: string;
  personalLimpieza: string;
  minutosLimpieza: number | null;
}

interface ProductInventoryItem {
  idProducto: string;
  idMotel: string;
  categoria: string;
  nombre: string;
  precioVenta: number;
  costoUnitario: number;
  activo: boolean;
  stockBodega: number;
  stockAnaquel: number;
  stockTotal: number;
}

interface InventoryMovementRecord {
  idMovimiento: string;
  idMotel: string;
  idProducto: string;
  nombreProducto: string;
  categoria: string;
  tipoMovimiento: "ENTRADA" | "TRASPASO_A_ANAQUEL" | "TRASPASO_A_BODEGA" | "AJUSTE" | "VENTA";
  origen: string;
  destino: string;
  cantidad: number;
  stockBodegaDespues: number;
  stockAnaquelDespues: number;
  motivo: string;
  idTurno: string;
  idEstancia: string;
  idUsuario: string;
  fechaHora: string;
}

interface SaleItemInput {
  idProducto: string;
  cantidad: number;
}

interface RegisterSaleInput {
  idHabitacion: string;
  items: SaleItemInput[];
  cobrarInmediato: boolean;
  formaPago?: "EFECTIVO" | "TARJETA";
  idempotencyKey?: string;
}

interface RegisterSaleResult {
  idCargo: string;
  total: number;
  habitacion: string;
  itemsVendidos: number;
}

interface TransferInventoryInput {
  idProducto: string;
  cantidad: number;
  direccion: "BODEGA_A_ANAQUEL" | "ANAQUEL_A_BODEGA";
  motivo?: string;
}

interface AdjustInventoryInput {
  idProducto: string;
  ubicacion: "BODEGA" | "ANAQUEL";
  nuevoStock: number;
  motivo: string;
}

interface SaveProductInput {
  idProducto?: string;
  categoria: string;
  nombre: string;
  precioVenta: number;
  costoUnitario?: number;
  stockBodegaInicial?: number;
  stockAnaquelInicial?: number;
}

interface OccupiedRoomOption {
  idHabitacion: string;
  numeroHabitacion: string;
  tipoHabitacion: string;
  idEstancia: string;
  precioFinal: number;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}
