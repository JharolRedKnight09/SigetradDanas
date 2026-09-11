export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'OPERADOR' | 'PILOTO' | 'DUENO';

export interface User {
  id: string;
  username: string;
  nombre: string;
  email: string;
  rol: UserRole;
  cargo: string;
  telefono: string;
  avatar?: string;
  pilotoId?: string; // If role is OPERADOR
  password?: string;
  fechaCreacion?: string;
  estado?: 'Activo' | 'Inactivo';
}

export type MaterialType =
  | 'Soya'
  | 'Maíz'
  | 'Soda'
  | 'Carbón Local'
  | 'Carbón Largo'
  | 'Trigo'
  | 'Clinker (Cemento)'
  | 'Piedrín / Grava'
  | 'Bloque';

export type CategoriaMovimiento =
  | 'Buques'
  | 'Barrios'
  | 'Carbón'
  | 'Clinkers'
  | 'Mi Guate'
  | 'Palo Gordo';

export type EstadoViaje = 'Pendiente' | 'En Curso' | 'Finalizado' | 'Facturado';

export type EstadoGondola = 'Disponible' | 'En Ruta' | 'Mantenimiento';
export type EstadoPiloto = 'Disponible' | 'En Viaje' | 'Descanso' | 'Inactivo';

export interface PropietarioHermano {
  id: string;
  nombre: string;
  banco: string;
  numeroCuenta: string;
  tipoCuenta: string;
  telefono: string;
}

export interface Gondola {
  id: string;
  placa: string;
  tipoUnidad: string; // ej. Cabezal Freightliner + Góndola 3 Ejes
  capacidadTon: number;
  capacidadM3: number;
  propietarioId: string; // Uno de los 3 hermanos
  estado: EstadoGondola;
  kilometraje: number;
  anio: number;
  observaciones?: string;
}

export interface Piloto {
  id: string;
  nombreCompleto: string;
  licencia: string;
  tipoLicencia: string; // 'A', 'B', etc.
  vencimientoLicencia: string;
  telefono: string;
  dpi: string;
  estado: EstadoPiloto;
  fechaIngreso: string;
  gondolaHabitual?: string;
}

export interface Cliente {
  id: string;
  codigo: string;
  nombre: string;
  nit: string;
  telefono: string;
  correo: string;
  direccion: string;
  esAgenteRetenedor: boolean; // Retiene IVA e ISR
  buquesHabituales: string[];
  contactoPrincipal: string;
  activo: boolean;
}

export interface BoletaPesaje {
  numeroBoleta: string;
  pesoBrutoKg: number;
  taraKg: number;
  pesoNetoKg: number;
  pesoNetoTon: number;
  fechaHora: string;
  basculaNombre: string;
  observaciones?: string;
  adjuntoUrl?: string;
}

export interface ConsumoCombustibleViaje {
  galonesEstimados: number;
  galonesReales: number;
  precioPorGalon: number;
  costoTotal: number;
  estacionServicio: string;
  numeroComprobante?: string;
}

export interface Viaje {
  id: string;
  codigoViaje: string; // e.g. VJ-2025-0101
  clienteId: string;
  clienteNombre: string;
  categoriaMovimiento: CategoriaMovimiento; // Pestaña del Excel
  buqueNombre: string; // e.g. "Sofía", "Sakura", o nombre de proyecto
  material: MaterialType;
  pilotoId: string;
  pilotoNombre: string;
  gondolaId: string;
  placa: string;
  propietarioHermanoId: string; // ID del hermano dueño de la góndola
  fechaSalida: string;
  fechaEntrega?: string;
  estado: EstadoViaje;
  tarifaAcordada: number; // Monto por viaje en Quetzales (Q)
  
  // Básculas reales
  pesajeCarga?: BoletaPesaje;
  pesajeDescarga?: BoletaPesaje;
  
  // Combustible
  combustible?: ConsumoCombustibleViaje;
  
  facturaId?: string;
  instruccionCobroId?: string;
  notas?: string;
}

export interface InstruccionCobro {
  id: string;
  clienteId: string;
  clienteNombre: string;
  fechaRecepcion: string; // Fecha en que se recibió la foto de WhatsApp
  cantidadViajes: number;
  montoAcordadoTotal: number;
  buqueProyecto: string;
  material: MaterialType;
  descripcion: string;
  referenciaWhatsApp: string; // ej. "Foto Excel enviada por Lic. Morales"
  procesada: boolean;
  facturaId?: string;
}

export type EstadoFactura = 'Emitida' | 'Conciliada' | 'Parcial' | 'Anulada';

export interface FacturaModificacion {
  fecha: string;
  usuario: string;
  descripcion: string;
}

export interface Factura {
  id: string;
  numeroFactura: string; // e.g. FAC-2025-0089
  clienteId: string;
  clienteNombre: string;
  nitCliente: string;
  fechaEmision: string;
  fechaVencimiento: string;
  buqueProyecto: string;
  material: MaterialType;
  viajesIds: string[];
  cantidadViajes: number;
  
  // Montos
  montoBruto: number; // Monto facturado acordado en Q
  esAgenteRetenedor: boolean;
  retencionIsrEstimada: number; // Típicamente 5% s/monto base
  retencionIvaEstimada: number; // 15% del IVA o retención formal
  netoEsperado: number;
  
  estadoPago: EstadoFactura;
  pagoId?: string;
  observaciones?: string;
  instruccionCobroId?: string;
  bitacora: FacturaModificacion[];
}

export interface DetallePagoPlaca {
  placa: string;
  propietarioId: string;
  propietarioNombre: string;
  cantidadViajes: number;
  montoBrutoPlaca: number;
  descuentoCombustible: number;
  montoNetoPlaca: number;
}

export interface PagoConciliacion {
  id: string;
  numeroTransferencia: string;
  fechaDeposito: string; // 7 a 15 días después de emitida
  facturaId: string;
  numeroFactura: string;
  clienteId: string;
  clienteNombre: string;
  bancoDestinoId: string; // Uno de los 3 hermanos
  bancoNombre: string;
  cuentaAcreditada: string;
  titularCuenta: string;
  
  // Valores financieros reales
  montoBrutoFacturado: number;
  retencionIsrAplicada: number; // Agente retenedor de ISR
  retencionIvaAplicada: number; // Descuento de IVA
  otrosDescuentos: number;
  montoNetoDepositado: number;
  
  saldoAceptado: number; // Saldo deudor o aceptado
  comprobanteFotoRef: string; // "Comprobante BI No. 8912389"
  
  desglosePlacas: DetallePagoPlaca[];
  observaciones?: string;
  creadoPor: string;
  fechaRegistro: string;
}

export interface ParametroCombustible {
  tipoMovimientoOMaterial: string;
  galonesSugeridos: number;
  descripcion: string;
}

export interface RegistroGastoCombustible {
  id: string;
  fecha: string;
  placa: string;
  pilotoNombre: string;
  viajeCodigo?: string;
  buqueMovimiento: string;
  galones: number;
  precioGalon: number;
  totalGasto: number;
  estacion: string;
  observaciones?: string;
}

export interface BitacoraAccion {
  id: string;
  fecha: string;
  usuario: string;
  modulo: string;
  accion: string;
  detalle: string;
}
