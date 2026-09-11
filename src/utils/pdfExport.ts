import { jsPDF } from 'jspdf';
import { Viaje, Factura, PagoConciliacion, Cliente } from '../types';

export const exportViajePDF = (viaje: Viaje, cliente?: Cliente) => {
  const doc = new jsPDF();

  // Header banner
  doc.setFillColor(26, 54, 93); // Dark Navy Blue
  doc.rect(0, 0, 210, 32, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('TRANSPORTES Y SERVICIOS DANNAS', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(220, 230, 245);
  doc.text('Transporte de Góndolas de Materiales a Granel | Puerto Barrios, Izabal', 14, 22);
  doc.text('COMPROBANTE OFICIAL DE VIAJE - BÁSCULA Y TRANSPORTE', 14, 28);

  // Status badge on header
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(155, 8, 42, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(26, 54, 93);
  doc.text('CÓDIGO VIAJE', 160, 14);
  doc.setFontSize(11);
  doc.setTextColor(220, 38, 38);
  doc.text(viaje.codigoViaje, 160, 21);

  // General Details Section
  let y = 42;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(26, 54, 93);
  doc.text('1. INFORMACIÓN GENERAL DEL SERVICIO', 14, y);

  doc.setDrawColor(200, 210, 225);
  doc.line(14, y + 2, 196, y + 2);

  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 70, 85);
  doc.text('Cliente:', 14, y);
  doc.text('Categoría / Pestaña:', 110, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 25, 35);
  doc.text(viaje.clienteNombre, 35, y);
  doc.text(viaje.categoriaMovimiento, 155, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 70, 85);
  doc.text('Buque / Proyecto:', 14, y);
  doc.text('Material Transportado:', 110, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 25, 35);
  doc.text(viaje.buqueNombre, 52, y);
  doc.text(viaje.material, 155, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 70, 85);
  doc.text('Placa de Góndola:', 14, y);
  doc.text('Piloto Asignado:', 110, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 25, 35);
  doc.text(viaje.placa, 52, y);
  doc.text(viaje.pilotoNombre, 155, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 70, 85);
  doc.text('Fecha Salida:', 14, y);
  doc.text('Estado del Viaje:', 110, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 25, 35);
  doc.text(viaje.fechaSalida, 52, y);
  doc.text(viaje.estado.toUpperCase(), 155, y);

  // Section 2: Básculas y Pesaje
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(26, 54, 93);
  doc.text('2. REGISTRO DE BÁSCULAS (CARGA Y DESCARGA)', 14, y);
  doc.line(14, y + 2, 196, y + 2);

  y += 10;
  // Box for Carga
  doc.setFillColor(245, 248, 255);
  doc.roundedRect(14, y, 88, 55, 3, 3, 'F');
  doc.setDrawColor(200, 220, 245);
  doc.roundedRect(14, y, 88, 55, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 64, 175);
  doc.text('Báscula Inicial (Carga)', 20, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 60, 75);
  if (viaje.pesajeCarga) {
    doc.text(`Boleta No: ${viaje.pesajeCarga.numeroBoleta}`, 20, y + 16);
    doc.text(`Báscula: ${viaje.pesajeCarga.basculaNombre}`, 20, y + 23);
    doc.text(`Peso Bruto: ${viaje.pesajeCarga.pesoBrutoKg.toLocaleString()} kg`, 20, y + 30);
    doc.text(`Tara: ${viaje.pesajeCarga.taraKg.toLocaleString()} kg`, 20, y + 37);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 100, 50);
    doc.text(`PESO NETO: ${viaje.pesajeCarga.pesoNetoKg.toLocaleString()} kg (${viaje.pesajeCarga.pesoNetoTon} TM)`, 20, y + 46);
  } else {
    doc.setTextColor(150, 100, 20);
    doc.text('Pendiente de registro de báscula de carga.', 20, y + 25);
  }

  // Box for Descarga
  doc.setFillColor(245, 252, 248);
  doc.roundedRect(108, y, 88, 55, 3, 3, 'F');
  doc.setDrawColor(200, 235, 215);
  doc.roundedRect(108, y, 88, 55, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 100, 60);
  doc.text('Báscula Destino (Descarga)', 114, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 60, 75);
  if (viaje.pesajeDescarga) {
    doc.text(`Boleta No: ${viaje.pesajeDescarga.numeroBoleta}`, 114, y + 16);
    doc.text(`Báscula: ${viaje.pesajeDescarga.basculaNombre}`, 114, y + 23);
    doc.text(`Peso Bruto: ${viaje.pesajeDescarga.pesoBrutoKg.toLocaleString()} kg`, 114, y + 30);
    doc.text(`Tara: ${viaje.pesajeDescarga.taraKg.toLocaleString()} kg`, 114, y + 37);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 100, 50);
    doc.text(`PESO NETO: ${viaje.pesajeDescarga.pesoNetoKg.toLocaleString()} kg (${viaje.pesajeDescarga.pesoNetoTon} TM)`, 114, y + 46);
  } else {
    doc.setTextColor(150, 100, 20);
    doc.text('Pendiente de boleta de descarga en destino.', 114, y + 25);
  }

  // Section 3: Combustible y Operación
  y += 65;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(26, 54, 93);
  doc.text('3. CONTROL DE COMBUSTIBLE Y TARIFA', 14, y);
  doc.line(14, y + 2, 196, y + 2);

  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 60, 75);
  doc.text(`Tarifa Pactada por Viaje: Q${viaje.tarifaAcordada.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 14, y);
  if (viaje.combustible) {
    doc.text(`Galones Despachados: ${viaje.combustible.galonesReales} gal (Estimado: ${viaje.combustible.galonesEstimados} gal)`, 110, y);
    y += 7;
    doc.text(`Estación: ${viaje.combustible.estacionServicio}`, 14, y);
    doc.text(`Costo Combustible: Q${viaje.combustible.costoTotal.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 110, y);
  }

  // Signatures
  y += 35;
  doc.setDrawColor(150, 160, 180);
  doc.line(20, y, 75, y);
  doc.line(130, y, 185, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 90, 105);
  doc.text('Firma y Sello Piloto Operador', 24, y + 5);
  doc.text('Recepción / Báscula Destino', 136, y + 5);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(140, 150, 165);
  doc.text(`Documento generado por SIGETRAD - Transportes Dannas | ${new Date().toLocaleString()}`, 14, 285);

  doc.save(`Comprobante_Viaje_${viaje.codigoViaje}.pdf`);
};

export const exportFacturaPDF = (factura: Factura) => {
  const doc = new jsPDF();

  // Header banner
  doc.setFillColor(26, 54, 93);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('TRANSPORTES Y SERVICIOS DANNAS', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(215, 225, 245);
  doc.text('NIT: 9812450-4 | Puerto Barrios, Izabal, Guatemala', 14, 22);
  doc.text('Góndolas de Materiales a Granel | Carbón, Clinker, Soya, Maíz, Soda, Trigo', 14, 28);

  // Invoice Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(145, 8, 55, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 54, 93);
  doc.text('FACTURA COMERCIAL', 149, 15);
  doc.setFontSize(12);
  doc.setTextColor(220, 38, 38);
  doc.text(factura.numeroFactura, 149, 23);

  // Client Info Box
  let y = 46;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 34, 2, 2, 'F');
  doc.setDrawColor(220, 230, 240);
  doc.roundedRect(14, y, 182, 34, 2, 2, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 50, 65);
  doc.text('DATOS DEL CLIENTE / RECEPTOR:', 20, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.text(`Cliente: ${factura.clienteNombre}`, 20, y + 16);
  doc.text(`NIT: ${factura.nitCliente}`, 20, y + 23);
  doc.text(`Condición Fiscal: ${factura.esAgenteRetenedor ? 'AGENTE RETENEDOR DE ISR / IVA' : 'Contribuyente General'}`, 20, y + 30);

  doc.text(`Fecha Emisión: ${factura.fechaEmision}`, 125, y + 16);
  doc.text(`Fecha Vence: ${factura.fechaVencimiento}`, 125, y + 23);
  doc.text(`Estado: ${factura.estadoPago.toUpperCase()}`, 125, y + 30);

  // Service Details Table
  y += 44;
  doc.setFillColor(26, 54, 93);
  doc.rect(14, y, 182, 9, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPCIÓN DEL SERVICIO', 18, y + 6);
  doc.text('CANT. VIAJES', 110, y + 6);
  doc.text('BUQUE / MOVIMIENTO', 135, y + 6);
  doc.text('MONTO BRUTO', 170, y + 6);

  y += 9;
  doc.setFillColor(255, 255, 255);
  doc.rect(14, y, 182, 22, 'F');
  doc.setDrawColor(220, 230, 240);
  doc.rect(14, y, 182, 22, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 40, 55);
  doc.text(`Servicio de flete y acarreo de góndolas de material granel:`, 18, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.text(`${factura.material} a granel`, 18, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(`Instrucción de cobro WhatsApp asociada`, 18, y + 19);

  doc.text(`${factura.cantidadViajes} viajes`, 110, y + 11);
  doc.text(`${factura.buqueProyecto}`, 135, y + 11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Q${factura.montoBruto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 166, y + 11);

  // Financial Breakdown Box (Withholding highlights!)
  y += 32;
  doc.setFillColor(245, 248, 255);
  doc.roundedRect(100, y, 96, 58, 2, 2, 'F');
  doc.setDrawColor(200, 215, 240);
  doc.roundedRect(100, y, 96, 58, 2, 2, 'S');

  let boxY = y + 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 60, 75);
  doc.text('Subtotal / Monto Bruto:', 106, boxY);
  doc.text(`Q${factura.montoBruto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 162, boxY);

  if (factura.esAgenteRetenedor) {
    boxY += 8;
    doc.setTextColor(220, 38, 38);
    doc.text('(-) Retención ISR Agente Retenedor (5%):', 106, boxY);
    doc.text(`-Q${factura.retencionIsrEstimada.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 162, boxY);

    boxY += 8;
    doc.text('(-) Retención IVA s/factura:', 106, boxY);
    doc.text(`-Q${factura.retencionIvaEstimada.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 162, boxY);

    boxY += 10;
    doc.setDrawColor(180, 200, 230);
    doc.line(106, boxY - 3, 190, boxY - 3);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 100, 50);
    doc.text('NETO ESPERADO A DEPOSITAR:', 106, boxY + 4);
    doc.text(`Q${factura.netoEsperado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 155, boxY + 4);
  } else {
    boxY += 12;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 100, 50);
    doc.text('TOTAL A DEPOSITAR:', 106, boxY);
    doc.text(`Q${factura.montoBruto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 158, boxY);
  }

  // Bank instructions for client
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 50, 65);
  doc.text('Cuentas Bancarias para Transferencias:', 14, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 70, 85);
  doc.text('• Banrural Monetaria: 3401-0982-11 (Jairo Dannas)', 14, y + 16);
  doc.text('• Banco Industrial: 045-298172-1 (Carlos Dannas)', 14, y + 23);
  doc.text('• G&T Continental: 018-0091823-9 (Edwin Dannas)', 14, y + 30);
  doc.text('* Enviar comprobante de transferencia al emitir el depósito.', 14, y + 37);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(140, 150, 165);
  doc.text(`Factura registrada en SIGETRAD | Repositorio Centralizado de Facturas`, 14, 285);

  doc.save(`Factura_${factura.numeroFactura}.pdf`);
};

export const exportPagoPDF = (pago: PagoConciliacion) => {
  const doc = new jsPDF();

  doc.setFillColor(26, 54, 93);
  doc.rect(0, 0, 210, 34, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text('TRANSPORTES Y SERVICIOS DANNAS', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(215, 225, 245);
  doc.text('COMPROBANTE DE CONCILIACIÓN DE PAGO Y RETENCIONES ISR / IVA', 14, 23);
  doc.text(`Comprobante Bancario: ${pago.numeroTransferencia}`, 14, 29);

  let y = 44;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 54, 93);
  doc.text('1. INFORMACIÓN DE LA TRANSFERENCIA RECIBIDA', 14, y);
  doc.line(14, y + 2, 196, y + 2);

  y += 9;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 50, 65);
  doc.text(`Cliente: ${pago.clienteNombre}`, 14, y);
  doc.text(`Factura Cancelada: ${pago.numeroFactura}`, 120, y);

  y += 7;
  doc.text(`Fecha de Depósito: ${pago.fechaDeposito}`, 14, y);
  doc.text(`Cuenta Acreditada: ${pago.bancoNombre} - ${pago.cuentaAcreditada}`, 120, y);

  y += 7;
  doc.text(`Titular de la Cuenta: ${pago.titularCuenta}`, 14, y);
  doc.text(`Referencia: ${pago.comprobanteFotoRef}`, 120, y);

  // Financial reconciliation block
  y += 14;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 38, 2, 2, 'F');
  doc.setDrawColor(200, 215, 235);
  doc.roundedRect(14, y, 182, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 54, 93);
  doc.text('CONCILIACIÓN FINANCIERA:', 20, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 60, 75);
  doc.text(`Monto Bruto Facturado: Q${pago.montoBrutoFacturado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 20, y + 17);
  doc.setTextColor(220, 38, 38);
  doc.text(`(-) Retención ISR Aplicada: -Q${pago.retencionIsrAplicada.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 20, y + 24);
  doc.text(`(-) Retención IVA Aplicada: -Q${pago.retencionIvaAplicada.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 20, y + 31);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(16, 100, 50);
  doc.text(`NETO DEPOSITADO EN BANCO:`, 110, y + 20);
  doc.text(`Q${pago.montoNetoDepositado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 110, y + 28);

  // Section 2: Distribution per plate & brother
  y += 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 54, 93);
  doc.text('2. DISTRIBUCIÓN POR PLACA Y HERMANO PROPIETARIO', 14, y);
  doc.line(14, y + 2, 196, y + 2);

  y += 8;
  doc.setFillColor(26, 54, 93);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PLACA', 18, y + 5);
  doc.text('PROPIETARIO', 45, y + 5);
  doc.text('VIAJES', 95, y + 5);
  doc.text('BRUTO PLACA', 120, y + 5);
  doc.text('NETO PLACA', 160, y + 5);

  y += 7;
  pago.desglosePlacas.forEach((item, index) => {
    doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    doc.rect(14, y, 182, 7, 'F');
    doc.setDrawColor(230, 235, 240);
    doc.rect(14, y, 182, 7, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 50, 60);
    doc.text(item.placa, 18, y + 5);
    doc.text(item.propietarioNombre, 45, y + 5);
    doc.text(`${item.cantidadViajes} viajes`, 95, y + 5);
    doc.text(`Q${item.montoBrutoPlaca.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 120, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 100, 50);
    doc.text(`Q${item.montoNetoPlaca.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 160, y + 5);

    y += 7;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(140, 150, 165);
  doc.text(`Conciliación realizada por: ${pago.creadoPor} | Fecha: ${pago.fechaRegistro}`, 14, 285);

  doc.save(`Conciliacion_${pago.numeroFactura}_${pago.numeroTransferencia}.pdf`);
};

export const exportConciliacionPDF = exportPagoPDF;
