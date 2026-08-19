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
  numeroHabitacion: string;
  tipoHabitacion: string;
  precioDesde: number;
  puntosLimpieza: number;
  estado: RoomStatus;
  idCicloActual: string | null;
}

interface InitialState {
  user: FemaUser;
  generatedAt: string;
  rooms: RoomCard[];
}

interface CatalogMotel { idMotel: string; nombre: string; zonaHoraria: string; activo: boolean; }
interface CatalogReceptionist { idUsuario: string; idMotel: string; correo: string; nombre: string; apellidos: string; activo: boolean; }
interface CatalogCleaningStaff { idPersonalLimpieza: string; idMotel: string; nombre: string; apellidos: string; turnoHabitual: string; activo: boolean; }
interface CatalogState { user: FemaUser; motels: CatalogMotel[]; receptionists: CatalogReceptionist[]; cleaningStaff: CatalogCleaningStaff[]; }
interface MotelInput { idMotel?: string; nombre: string; zonaHoraria: string; }
interface ReceptionistInput { idUsuario?: string; idMotel: string; correo: string; nombre: string; apellidos: string; }
interface CleaningStaffInput { idPersonalLimpieza?: string; idMotel: string; nombre: string; apellidos: string; turnoHabitual: string; }

interface EntryInput {
  idHabitacion: string;
  idTarifa: string;
  idTurno: string;
  marcaModeloVehiculo: string;
  placas: string;
  personasExtra: number;
  formaPago: string;
  montoPago: number;
  idempotencyKey: string;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}
