type CellValue = string | number | boolean | Date | null;
type SheetRow = Record<string, CellValue>;

type RoomStatus = "DISPONIBLE" | "OCUPADA" | "SUCIA" | "LIMPIEZA" | "MANTENIMIENTO";
type CycleStartType = "OCUPADA" | "LIMPIEZA" | "MANTENIMIENTO";

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
  placas: string;
  precioFinal: number;
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

interface EntryInput {
  idHabitacion: string;
  idTarifa: string;
  marcaModeloVehiculo: string;
  placas: string;
  personasExtra: number;
  formaPago: string;
  idempotencyKey: string;
}

interface EntryResult {
  idCiclo: string;
  idEstancia: string;
  precioFinal: number;
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

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}
