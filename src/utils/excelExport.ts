import * as XLSX from 'xlsx';
import { Viaje, Factura, PagoConciliacion, RegistroGastoCombustible } from '../types';

export const exportViajesToExcel = (viajes: Viaje[], nombreHoja: string = 'Viajes_Dannas') => {
  const data = viajes.map((v) => ({
    'Código de Viaje': v.codigoViaje,
    'Categoría / Pestaña': v.categoriaMovimiento,
    'Buque / Proyecto': v.buqueNombre,
    'Cliente': v.clienteNombre,
    'Material': v.material,
    'Piloto': v.pilotoNombre,
    'Placa Góndola': v.placa,
    'Fecha Salida': v.fechaSalida,
    'Fecha Entrega': v.fechaEntrega || 'En Curso',
    'Estado': v.estado,
    'Tarifa Pactada (Q)': v.tarifaAcordada,
    'Boleta Carga': v.pesajeCarga?.numeroBoleta || 'N/A',
    'Peso Bruto Carga (kg)': v.pesajeCarga?.pesoBrutoKg || 0,
    'Tara Carga (kg)': v.pesajeCarga?.taraKg || 0,
    'Peso Neto Carga (Ton)': v.pesajeCarga?.pesoNetoTon || 0,
    'Boleta Descarga': v.pesajeDescarga?.numeroBoleta || 'N/A',
    'Peso Neto Descarga (Ton)': v.pesajeDescarga?.pesoNetoTon || 0,
    'Báscula Destino': v.pesajeDescarga?.basculaNombre || 'N/A',
    'Galones Combustible': v.combustible?.galonesReales || 0,
    'Gasto Combustible (Q)': v.combustible?.costoTotal || 0,
    'Factura Asignada': v.facturaId || 'Pendiente',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);
  XLSX.writeFile(workbook, `SIGETRAD_Viajes_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportFacturasToExcel = (facturas: Factura[]) => {
  const data = facturas.map((f) => ({
    'No. Factura': f.numeroFactura,
    'Cliente': f.clienteNombre,
    'NIT': f.nitCliente,
    'Fecha Emisión': f.fechaEmision,
    'Fecha Vencimiento': f.fechaVencimiento,
    'Buque / Proyecto': f.buqueProyecto,
    'Material': f.material,
    'Cantidad Viajes': f.cantidadViajes,
    'Monto Bruto Facturado (Q)': f.montoBruto,
    'Es Agente Retenedor': f.esAgenteRetenedor ? 'SÍ' : 'NO',
    'Retención ISR (Q)': f.retencionIsrEstimada,
    'Retención IVA (Q)': f.retencionIvaEstimada,
    'Neto a Recibir (Q)': f.netoEsperado,
    'Estado de Pago': f.estadoPago,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Facturación');
  XLSX.writeFile(workbook, `SIGETRAD_Facturas_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportConciliacionesToExcel = (pagos: PagoConciliacion[]) => {
  const data = pagos.map((p) => ({
    'No. Transferencia': p.numeroTransferencia,
    'Fecha Depósito': p.fechaDeposito,
    'Factura Cancelada': p.numeroFactura,
    'Cliente': p.clienteNombre,
    'Banco Destino': p.bancoNombre,
    'Cuenta Acreditada': p.cuentaAcreditada,
    'Titular Cuenta (Hermano)': p.titularCuenta,
    'Monto Bruto Facturado (Q)': p.montoBrutoFacturado,
    'Retención ISR Aplicada (Q)': p.retencionIsrAplicada,
    'Retención IVA Aplicada (Q)': p.retencionIvaAplicada,
    'Neto Depositado (Q)': p.montoNetoDepositado,
    'Saldo Aceptado': p.saldoAceptado,
    'Referencia / Comprobante': p.comprobanteFotoRef,
    'Registrado Por': p.creadoPor,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Conciliaciones_Pagos');
  XLSX.writeFile(workbook, `SIGETRAD_Conciliaciones_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportCombustibleToExcel = (gastos: RegistroGastoCombustible[]) => {
  const data = gastos.map((g) => ({
    'Fecha': g.fecha,
    'Placa Góndola': g.placa,
    'Piloto': g.pilotoNombre,
    'Viaje': g.viajeCodigo || 'Varios',
    'Movimiento / Buque': g.buqueMovimiento,
    'Galones': g.galones,
    'Precio por Galón (Q)': g.precioGalon,
    'Total Gasto (Q)': g.totalGasto,
    'Estación de Servicio': g.estacion,
    'Observaciones': g.observaciones || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Gasto_Combustible');
  XLSX.writeFile(workbook, `SIGETRAD_Combustible_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
