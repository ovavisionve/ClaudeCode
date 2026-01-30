// User types
export interface User {
  id: string;
  username: string;
  nombreCompleto: string;
  email: string;
  rol: 'admin' | 'manager' | 'usuario' | 'readonly';
  permisos: UserPermissions;
  activo: boolean;
  ultimoAcceso?: Date | string;
}

export interface UserPermissions {
  reuniones: PermissionLevel;
  tareas: PermissionLevel;
  contactos: PermissionLevel;
  documentos: PermissionLevel;
  pipeline: PermissionLevel;
  cotizaciones: PermissionLevel;
  reportes: PermissionLevel;
  usuarios: PermissionLevel;
  configuracion: PermissionLevel;
}

export type PermissionLevel = 'ninguno' | 'lectura' | 'escritura' | 'admin';

// Session types
export interface Session {
  id: string;
  usuarioId: string;
  token: string;
  expiracion: Date | string;
  creacion: Date | string;
}

// Reuniones types
export interface Reunion {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  ubicacion: string;
  asistentes: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  recordatorio: number;
  creadoPor: string;
  fechaCreacion: Date | string;
  eventCalendarId?: string;
}

// Tareas types
export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: 'por_hacer' | 'en_progreso' | 'completada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fechaVencimiento: Date | string;
  asignadoA: string;
  tags: string;
  creadoPor: string;
  fechaCreacion: Date | string;
}

// Contactos types
export interface Contacto {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  empresa: string;
  cargo: string;
  tipo: 'cliente' | 'prospecto' | 'proveedor' | 'socio';
  etapa: string;
  ultimoContacto: Date | string;
  notas: string;
  creadoPor: string;
  fechaCreacion: Date | string;
}

// Pipeline types
export interface Pipeline {
  id: string;
  nombre: string;
  empresa: string;
  contactoId: string;
  valor: number;
  etapa: 'prospecto' | 'calificado' | 'propuesta' | 'negociacion' | 'cerrado_ganado' | 'cerrado_perdido';
  probabilidad: number;
  fechaCierre: Date | string;
  descripcion: string;
  asignadoA: string;
  origen: string;
  fechaCreacion: Date | string;
}

// Cotizaciones types
export interface Cotizacion {
  id: string;
  numero: string;
  clienteId: string;
  fecha: Date | string;
  validezDias: number;
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada';
  subtotal: number;
  iva: number;
  total: number;
  notas: string;
  creadoPor: string;
  fechaCreacion: Date | string;
}

export interface ItemCotizacion {
  id: string;
  cotizacionId: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

// Documentos types
export interface Documento {
  id: string;
  nombre: string;
  tipo: string;
  url: string;
  relacionadoTipo: 'reunion' | 'tarea' | 'contacto' | 'pipeline' | 'cotizacion';
  relacionadoId: string;
  creadoPor: string;
  fechaCreacion: Date | string;
}

// Chat IA types
export interface Conversacion {
  id: string;
  usuarioId: string;
  titulo: string;
  fechaCreacion: Date | string;
  ultimaActividad: Date | string;
}

export interface MensajeChat {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date | string;
}

// Dashboard types
export interface MetricaDashboard {
  id: string;
  metrica: string;
  valor: number;
  fecha: Date | string;
  categoria: string;
}

// Reportes types
export interface ReporteVentas {
  id: string;
  periodo: string;
  totalVentas: number;
  numCotizaciones: number;
  tasaConversion: number;
  ingresosRecurrentes: number;
  fechaGeneracion: Date | string;
}

// Notificaciones types
export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: 'recordatorio' | 'alerta' | 'info';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: Date | string;
  relacionadoTipo?: string;
  relacionadoId?: string;
}

// API Response types
export interface APIResponse<T = any> {
  exito: boolean;
  mensaje?: string;
  error?: string;
  data?: T;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  exito: boolean;
  mensaje?: string;
  error?: string;
  token?: string;
  usuario?: User;
}

// Configuration types
export interface Configuracion {
  clave: string;
  valor: string;
  descripcion: string;
}
