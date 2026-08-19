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

