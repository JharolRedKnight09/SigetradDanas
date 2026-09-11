import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Factura, InstruccionCobro, MaterialType, Viaje } from '../types';
import {
  Receipt,
  Search,
  Plus,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  History,
  Calendar,
  DollarSign,
  Filter,
  X,
  Edit2,
  Ship,
  Layers,
} from 'lucide-react';
import { exportFacturaPDF } from '../utils/pdfExport';

export const FacturacionModule: React.FC = () => {
  const {
    facturas,
    instruccionesCobro,
    addInstruccionCobro,
    generarFacturaDesdeInstruccion,
    addFactura,
    updateFactura,
    clientes,
    viajes,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'FACTURAS' | 'INSTRUCCIONES_WHATSAPP' | 'NUEVA_FACTURA'>('FACTURAS');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [selectedBuque, setSelectedBuque] = useState<string>('TODOS');
  const [selectedFacturaDetail, setSelectedFacturaDetail] = useState<Factura | null>(null);

  // WhatsApp instruction modal / form
  const [showInstruccionModal, setShowInstruccionModal] = useState(false);
  const [instruccionForm, setInstruccionForm] = useState({
    clienteId: clientes[0]?.id || '',
    buqueProyecto: 'Sofía',
    cantidadViajes: 100,
    montoAcordadoTotal: 100000,
    material: 'Soya' as MaterialType,
    referenciaWhatsApp: 'WhatsApp Chat Granelera Atlántico - Foto Excel Recibida',
    observaciones: 'Instrucción de cobro recibida por la secretaria según liquidación de buque',
  });

  // Direct Invoice form
  const [directInvoiceForm, setDirectInvoiceForm] = useState({
    clienteId: clientes[0]?.id || '',
    buqueProyecto: 'Sofía',
    material: 'Soya' as MaterialType,
    cantidadViajes: 50,
    montoBruto: 50000,
    ivaMonto: 6000,
    observaciones: 'Facturación directa por servicios de transporte',
  });

  // Edit invoice modal state
  const [editingFactura, setEditingFactura] = useState<Factura | null>(null);
  const [editForm, setEditForm] = useState({
    montoBruto: 0,
    observaciones: '',
    motivoCambio: '',
  });

  const canEdit = currentUser.rol === 'DUENO' || currentUser.rol === 'ADMIN';

  // Filtered invoices
  const filteredFacturas = facturas.filter((f) => {
    const matchesSearch =
      f.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.buqueProyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'TODOS' || f.estadoPago === filterEstado;
    const matchesBuque = selectedBuque === 'TODOS' || f.buqueProyecto === selectedBuque;
    return matchesSearch && matchesEstado && matchesBuque;
  });

  // Vessel list
  const buquesList = Array.from(new Set(facturas.map((f) => f.buqueProyecto)));

  const handleSaveInstruccion = (e: React.FormEvent) => {
    e.preventDefault();
    const cliente = clientes.find((c) => c.id === instruccionForm.clienteId);
    if (!cliente) return;

    addInstruccionCobro({
      fechaRecepcion: new Date().toISOString().replace('T', ' ').slice(0, 16),
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      buqueProyecto: instruccionForm.buqueProyecto,
      cantidadViajes: instruccionForm.cantidadViajes,
      montoAcordadoTotal: instruccionForm.montoAcordadoTotal,
      material: instruccionForm.material,
      referenciaWhatsApp: instruccionForm.referenciaWhatsApp,
      observaciones: instruccionForm.observaciones,
      procesada: false,
    });

    setShowInstruccionModal(false);
    setActiveTab('INSTRUCCIONES_WHATSAPP');
  };

  const handleCreateDirectInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cliente = clientes.find((c) => c.id === directInvoiceForm.clienteId);
    if (!cliente) return;

    const subtotal = directInvoiceForm.montoBruto / 1.12;
    const iva = directInvoiceForm.montoBruto - subtotal;
    const retIsr = cliente.esAgenteRetenedor ? subtotal * 0.05 : 0;
    const retIva = cliente.esAgenteRetenedor ? iva * 0.15 : 0;
    const neto = directInvoiceForm.montoBruto - (retIsr + retIva);

    const nextNo = `FACT-DAN-${new Date().getFullYear()}-${100 + facturas.length + 1}`;

    addFactura({
      numeroFactura: nextNo,
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      clienteNit: cliente.nit,
      fechaEmision: new Date().toISOString().slice(0, 10),
      buqueProyecto: directInvoiceForm.buqueProyecto,
      material: directInvoiceForm.material,
      cantidadViajes: directInvoiceForm.cantidadViajes,
      viajesIds: [],
      montoBruto: directInvoiceForm.montoBruto,
      subtotal,
      ivaMonto: iva,
      esAgenteRetenedor: cliente.esAgenteRetenedor,
      tasaIsr: 0.05,
      retencionIsrEstimada: retIsr,
      retencionIvaEstimada: retIva,
      netoEsperado: neto,
      estadoPago: 'Emitida',
      observaciones: directInvoiceForm.observaciones,
      historialCambios: [
        {
          fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
          usuario: currentUser.nombre,
          motivo: 'Emisión inicial de factura',
          montoAnterior: directInvoiceForm.montoBruto,
          montoNuevo: directInvoiceForm.montoBruto,
        },
      ],
    });

    setActiveTab('FACTURAS');
  };

  const handleSaveEditFactura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFactura) return;

    const cliente = clientes.find((c) => c.id === editingFactura.clienteId);
    const esAgente = cliente ? cliente.esAgenteRetenedor : editingFactura.esAgenteRetenedor;
    const subtotal = editForm.montoBruto / 1.12;
    const iva = editForm.montoBruto - subtotal;
    const retIsr = esAgente ? subtotal * 0.05 : 0;
    const retIva = esAgente ? iva * 0.15 : 0;
    const neto = editForm.montoBruto - (retIsr + retIva);

    const historial = [
      ...editingFactura.historialCambios,
      {
        fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
        usuario: currentUser.nombre,
        motivo: editForm.motivoCambio || 'Ajuste de monto solicitado',
        montoAnterior: editingFactura.montoBruto,
        montoNuevo: editForm.montoBruto,
      },
    ];

    updateFactura(editingFactura.id, {
      montoBruto: editForm.montoBruto,
      subtotal,
      ivaMonto: iva,
      retencionIsrEstimada: retIsr,
      retencionIvaEstimada: retIva,
      netoEsperado: neto,
      observaciones: editForm.observaciones,
      historialCambios: historial,
    });

    setEditingFactura(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-blue-600" />
              Centro de Facturación y Desglose Fiscal
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              {facturas.length} facturas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Repositorio unificado de facturación, recepción de órdenes de cobro y cálculo automatizado de retenciones SAT (ISR 5% / IVA 15%).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInstruccionModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            Registrar Orden de Cobro
          </button>
          <button
            onClick={() => setActiveTab('NUEVA_FACTURA')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Nueva Factura
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('FACTURAS')}
            className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'FACTURAS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Repositorio Centralizado de Facturas ({facturas.length})
          </button>

          <button
            onClick={() => setActiveTab('INSTRUCCIONES_WHATSAPP')}
            className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'INSTRUCCIONES_WHATSAPP'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-500" />
            Órdenes de Cobro Recibidas ({instruccionesCobro.length})
          </button>

          <button
            onClick={() => setActiveTab('NUEVA_FACTURA')}
            className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'NUEVA_FACTURA'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            Emisión Directa de Factura
          </button>
        </div>
      </div>

      {/* VIEW 1: REPOSITORIO DE FACTURAS */}
      {activeTab === 'FACTURAS' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por factura, cliente, buque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-medium">Buque:</span>
                <select
                  value={selectedBuque}
                  onChange={(e) => setSelectedBuque(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="TODOS">Todos</option>
                  {buquesList.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-medium">Estado:</span>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="TODOS">Todos</option>
                  <option value="Emitida">Emitida (Pendiente de Pago)</option>
                  <option value="Conciliada">Conciliada / Pagada</option>
                  <option value="Anulada">Anulada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">No. Factura</th>
                    <th className="px-4 py-3">Cliente / NIT</th>
                    <th className="px-4 py-3">Buque / Proyecto</th>
                    <th className="px-4 py-3">Monto Bruto</th>
                    <th className="px-4 py-3">Retención ISR (5%)</th>
                    <th className="px-4 py-3">Retención IVA</th>
                    <th className="px-4 py-3">Neto a Cobrar</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFacturas.map((factura) => (
                    <tr key={factura.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-blue-700">{factura.numeroFactura}</div>
                        <div className="text-[10px] text-slate-400">Emisión: {factura.fechaEmision}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{factura.clienteNombre}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NIT: {factura.clienteNit}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{factura.buqueProyecto}</div>
                        <div className="text-[10px] text-slate-500">
                          {factura.cantidadViajes} viajes • {factura.material}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        Q{factura.montoBruto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 font-medium text-red-600">
                        {factura.esAgenteRetenedor ? (
                          <span>-Q{factura.retencionIsrEstimada.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-red-600">
                        {factura.esAgenteRetenedor ? (
                          <span>-Q{factura.retencionIvaEstimada.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        Q{factura.netoEsperado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            factura.estadoPago === 'Conciliada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : factura.estadoPago === 'Emitida'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {factura.estadoPago}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedFacturaDetail(factura)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            title="Ver Detalle y Bitácora"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => exportFacturaPDF(factura)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                            title="Descargar Factura PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => {
                                setEditingFactura(factura);
                                setEditForm({
                                  montoBruto: factura.montoBruto,
                                  observaciones: factura.observaciones || '',
                                  motivoCambio: '',
                                });
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                              title="Modificar Monto / Datos"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INSTRUCCIONES DE COBRO (WHATSAPP) */}
      {activeTab === 'INSTRUCCIONES_WHATSAPP' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-xs text-amber-900">
                Flujo Operativo Real: Instrucciones Recibidas por WhatsApp
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                El cliente envía al WhatsApp de la secretaria una foto o captura de un Excel indicando el acuerdo (ej. "100 viajes por Q100,000" para el buque Sofía).
                Aquí se registran para no perderlas en el chat y se genera la factura fiscal formal con un solo clic.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instruccionesCobro.map((inst) => (
              <div
                key={inst.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{inst.clienteNombre}</span>
                    {inst.procesada ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Facturada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3" /> Pendiente de Emisión
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Buque / Proyecto:</span>
                      <strong className="text-slate-900">{inst.buqueProyecto}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Material Transportado:</span>
                      <span className="font-medium text-slate-800">{inst.material}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Viajes Acordados:</span>
                      <strong className="text-slate-900">{inst.cantidadViajes} viajes</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-sm">
                      <span className="text-slate-700 font-semibold">Monto Acordado Total:</span>
                      <strong className="text-emerald-700 font-mono">
                        Q{inst.montoAcordadoTotal.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    <div>📱 <strong>Origen:</strong> {inst.referenciaWhatsApp}</div>
                    <div className="text-slate-400 mt-0.5">Recibido: {inst.fechaRecepcion}</div>
                    {inst.observaciones && (
                      <div className="italic text-slate-600 mt-1 bg-slate-50 p-2 rounded">
                        "{inst.observaciones}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  {!inst.procesada ? (
                    <button
                      onClick={() => {
                        generarFacturaDesdeInstruccion(inst.id);
                        setActiveTab('FACTURAS');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Generar Factura Oficial
                    </button>
                  ) : (
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <span>Factura generada:</span>
                      <span className="font-mono font-bold text-blue-700">{inst.facturaGeneradaId}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: NUEVA FACTURA DIRECTA */}
      {activeTab === 'NUEVA_FACTURA' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Emisión Directa de Factura de Transporte
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Genera una factura formal con cálculo automático de retención ISR (5%) e IVA según la calidad del cliente.
            </p>
          </div>

          <form onSubmit={handleCreateDirectInvoice} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cliente</label>
              <select
                value={directInvoiceForm.clienteId}
                onChange={(e) => {
                  const cli = clientes.find((c) => c.id === e.target.value);
                  setDirectInvoiceForm({
                    ...directInvoiceForm,
                    clienteId: e.target.value,
                    buqueProyecto: cli?.buquesHabituales[0] || 'Sofía',
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
              >
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} (NIT: {c.nit}) {c.esAgenteRetenedor ? '• [Agente Retenedor]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Buque o Proyecto</label>
                <input
                  type="text"
                  required
                  value={directInvoiceForm.buqueProyecto}
                  onChange={(e) =>
                    setDirectInvoiceForm({ ...directInvoiceForm, buqueProyecto: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  placeholder="Sofía, Sakura, Barrios..."
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material</label>
                <select
                  value={directInvoiceForm.material}
                  onChange={(e) =>
                    setDirectInvoiceForm({
                      ...directInvoiceForm,
                      material: e.target.value as MaterialType,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                >
                  <option value="Soya">Soya</option>
                  <option value="Maíz">Maíz</option>
                  <option value="Soda">Soda</option>
                  <option value="Carbón Local">Carbón Local</option>
                  <option value="Carbón Largo">Carbón Largo</option>
                  <option value="Trigo">Trigo</option>
                  <option value="Clinker (Cemento)">Clinker (Cemento)</option>
                  <option value="Piedrín / Grava">Piedrín / Grava</option>
                  <option value="Bloque">Bloque</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cantidad de Viajes</label>
                <input
                  type="number"
                  required
                  value={directInvoiceForm.cantidadViajes}
                  onChange={(e) =>
                    setDirectInvoiceForm({
                      ...directInvoiceForm,
                      cantidadViajes: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monto Bruto Total (Q)</label>
                <input
                  type="number"
                  required
                  value={directInvoiceForm.montoBruto}
                  onChange={(e) =>
                    setDirectInvoiceForm({
                      ...directInvoiceForm,
                      montoBruto: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Fiscal Breakdown Preview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-xs text-slate-800 block">
                Cálculo Automático de Retenciones Fiscales:
              </span>
              {(() => {
                const cli = clientes.find((c) => c.id === directInvoiceForm.clienteId);
                const isAgente = cli?.esAgenteRetenedor ?? true;
                const subtotal = directInvoiceForm.montoBruto / 1.12;
                const iva = directInvoiceForm.montoBruto - subtotal;
                const retIsr = isAgente ? subtotal * 0.05 : 0;
                const retIva = isAgente ? iva * 0.15 : 0;
                const neto = directInvoiceForm.montoBruto - (retIsr + retIva);

                return (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Monto Facturado (Total):</span>
                      <span className="font-mono font-bold">
                        Q{directInvoiceForm.montoBruto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal (Base Imponible):</span>
                      <span className="font-mono">
                        Q{subtotal.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>IVA (12%):</span>
                      <span className="font-mono">
                        Q{iva.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {isAgente ? (
                      <>
                        <div className="flex justify-between text-red-600 font-medium">
                          <span>(-) Retención ISR Agente Retenedor (5%):</span>
                          <span className="font-mono">
                            -Q{retIsr.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-red-600 font-medium">
                          <span>(-) Retención IVA Agente Retenedor:</span>
                          <span className="font-mono">
                            -Q{retIva.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-400 italic text-[11px]">
                        * Cliente NO es agente retenedor. Pagará el monto bruto completo.
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-emerald-800">
                      <span>Neto que depositará el cliente:</span>
                      <span className="font-mono">
                        Q{neto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Observaciones</label>
              <textarea
                rows={2}
                value={directInvoiceForm.observaciones}
                onChange={(e) =>
                  setDirectInvoiceForm({ ...directInvoiceForm, observaciones: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                placeholder="Detalles sobre entrega o instrucciones..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('FACTURAS')}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs"
              >
                Emitir Factura
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: New WhatsApp Instruction */}
      {showInstruccionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                Registrar Instrucción de Cobro (WhatsApp)
              </h3>
              <button
                onClick={() => setShowInstruccionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInstruccion} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cliente</label>
                <select
                  value={instruccionForm.clienteId}
                  onChange={(e) => {
                    const cli = clientes.find((c) => c.id === e.target.value);
                    setInstruccionForm({
                      ...instruccionForm,
                      clienteId: e.target.value,
                      buqueProyecto: cli?.buquesHabituales[0] || 'Sofía',
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                >
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Buque / Proyecto</label>
                  <input
                    type="text"
                    required
                    value={instruccionForm.buqueProyecto}
                    onChange={(e) =>
                      setInstruccionForm({ ...instruccionForm, buqueProyecto: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    placeholder="Sofía, Sakura, Barrios..."
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Material</label>
                  <select
                    value={instruccionForm.material}
                    onChange={(e) =>
                      setInstruccionForm({
                        ...instruccionForm,
                        material: e.target.value as MaterialType,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="Soya">Soya</option>
                    <option value="Maíz">Maíz</option>
                    <option value="Soda">Soda</option>
                    <option value="Carbón Local">Carbón Local</option>
                    <option value="Carbón Largo">Carbón Largo</option>
                    <option value="Trigo">Trigo</option>
                    <option value="Clinker (Cemento)">Clinker (Cemento)</option>
                    <option value="Piedrín / Grava">Piedrín / Grava</option>
                    <option value="Bloque">Bloque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cantidad de Viajes en la Foto
                  </label>
                  <input
                    type="number"
                    required
                    value={instruccionForm.cantidadViajes}
                    onChange={(e) =>
                      setInstruccionForm({
                        ...instruccionForm,
                        cantidadViajes: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Monto Acordado Total (Q)
                  </label>
                  <input
                    type="number"
                    required
                    value={instruccionForm.montoAcordadoTotal}
                    onChange={(e) =>
                      setInstruccionForm({
                        ...instruccionForm,
                        montoAcordadoTotal: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Referencia de WhatsApp / Archivo
                </label>
                <input
                  type="text"
                  required
                  value={instruccionForm.referenciaWhatsApp}
                  onChange={(e) =>
                    setInstruccionForm({
                      ...instruccionForm,
                      referenciaWhatsApp: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  placeholder="Foto enviada por Don Carlos en chat de Granos Básicos"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas u Observaciones</label>
                <textarea
                  rows={2}
                  value={instruccionForm.observaciones}
                  onChange={(e) =>
                    setInstruccionForm({ ...instruccionForm, observaciones: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  placeholder="Detalles sobre boletas o diferencias en báscula..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInstruccionModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-xs"
                >
                  Guardar Instrucción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Invoice Details & Audit Trail */}
      {selectedFacturaDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {selectedFacturaDetail.numeroFactura}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  Ficha de Factura y Bitácora de Modificaciones
                </h3>
              </div>
              <button
                onClick={() => setSelectedFacturaDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div><strong>Cliente:</strong> {selectedFacturaDetail.clienteNombre}</div>
                <div><strong>NIT:</strong> {selectedFacturaDetail.clienteNit}</div>
                <div><strong>Buque:</strong> {selectedFacturaDetail.buqueProyecto}</div>
                <div><strong>Material:</strong> {selectedFacturaDetail.material} ({selectedFacturaDetail.cantidadViajes} viajes)</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex justify-between">
                  <span>Monto Bruto:</span>
                  <strong className="font-mono">Q{selectedFacturaDetail.montoBruto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Retención ISR (5%):</span>
                  <span className="font-mono">-Q{selectedFacturaDetail.retencionIsrEstimada.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Retención IVA:</span>
                  <span className="font-mono">-Q{selectedFacturaDetail.retencionIvaEstimada.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-emerald-800 font-bold">
                  <span>Neto Esperado:</span>
                  <span className="font-mono">Q{selectedFacturaDetail.netoEsperado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Audit Log (Bitácora de modificaciones) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-600" />
                Bitácora de Modificaciones (Auditoría)
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {selectedFacturaDetail.historialCambios && selectedFacturaDetail.historialCambios.length > 0 ? (
                  selectedFacturaDetail.historialCambios.map((h, i) => (
                    <div key={i} className="p-3 flex items-start justify-between gap-3 bg-white">
                      <div>
                        <div className="font-semibold text-slate-800">{h.motivo}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Por: <strong>{h.usuario}</strong> • {h.fecha}
                        </div>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-slate-400 line-through">Q{h.montoAnterior.toLocaleString()}</span>
                        <span className="text-emerald-700 font-bold ml-2">Q{h.montoNuevo.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-slate-400 italic">No hay modificaciones registradas.</div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => exportFacturaPDF(selectedFacturaDetail)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              >
                <Download className="w-4 h-4" />
                Descargar Factura PDF
              </button>
              <button
                onClick={() => setSelectedFacturaDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Factura */}
      {editingFactura && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                Modificar Factura {editingFactura.numeroFactura}
              </h3>
              <button
                onClick={() => setEditingFactura(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditFactura} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nuevo Monto Bruto (Q)</label>
                <input
                  type="number"
                  required
                  value={editForm.montoBruto}
                  onChange={(e) => setEditForm({ ...editForm, montoBruto: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motivo de la Modificación (Requerido para la Bitácora)
                </label>
                <input
                  type="text"
                  required
                  value={editForm.motivoCambio}
                  onChange={(e) => setEditForm({ ...editForm, motivoCambio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  placeholder="Ej. Ajuste de tarifa acordado con gerencia de planta"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observaciones Generales</label>
                <textarea
                  rows={2}
                  value={editForm.observaciones}
                  onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFactura(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                >
                  Guardar y Registrar en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
