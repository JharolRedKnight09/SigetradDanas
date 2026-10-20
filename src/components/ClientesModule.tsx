import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cliente } from '../types';
import {
  Users,
  Search,
  Plus,
  Building,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  FileText,
  Ship,
  Receipt,
  X,
  Edit2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const ClientesModule: React.FC = () => {
  const { clientes, addCliente, updateCliente, currentUser, viajes, facturas } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClienteHistory, setSelectedClienteHistory] = useState<Cliente | null>(null);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    nit: '',
    telefono: '',
    correo: '',
    direccion: '',
    esAgenteRetenedor: true,
    buquesHabituales: 'Sofía, Sakura',
    contactoPrincipal: '',
    activo: true,
  });

  const canEdit = currentUser.rol === 'DUENO' || currentUser.rol === 'ADMIN';

  const filteredClientes = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        codigo: cliente.codigo,
        nombre: cliente.nombre,
        nit: cliente.nit,
        telefono: cliente.telefono,
        correo: cliente.correo,
        direccion: cliente.direccion,
        esAgenteRetenedor: cliente.esAgenteRetenedor,
        buquesHabituales: cliente.buquesHabituales.join(', '),
        contactoPrincipal: cliente.contactoPrincipal,
        activo: cliente.activo,
      });
    } else {
      setEditingCliente(null);
      const nextCode = `CLI-00${clientes.length + 1}`;
      setFormData({
        codigo: nextCode,
        nombre: '',
        nit: '',
        telefono: '',
        correo: '',
        direccion: '',
        esAgenteRetenedor: true,
        buquesHabituales: 'Sofía, Sakura, Barrios',
        contactoPrincipal: '',
        activo: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const buquesArray = formData.buquesHabituales
      .split(',')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    if (editingCliente) {
      updateCliente(editingCliente.id, {
        codigo: formData.codigo,
        nombre: formData.nombre,
        nit: formData.nit,
        telefono: formData.telefono,
        correo: formData.correo,
        direccion: formData.direccion,
        esAgenteRetenedor: formData.esAgenteRetenedor,
        buquesHabituales: buquesArray,
        contactoPrincipal: formData.contactoPrincipal,
        activo: formData.activo,
      });
    } else {
      addCliente({
        codigo: formData.codigo,
        nombre: formData.nombre,
        nit: formData.nit,
        telefono: formData.telefono,
        correo: formData.correo,
        direccion: formData.direccion,
        esAgenteRetenedor: formData.esAgenteRetenedor,
        buquesHabituales: buquesArray,
        contactoPrincipal: formData.contactoPrincipal,
        activo: formData.activo,
      });
    }
    setShowModal(false);
  };

  // Trips and invoices for selected history modal
  const clienteTrips = selectedClienteHistory
    ? viajes.filter((v) => v.clienteId === selectedClienteHistory.id)
    : [];
  const clienteInvoices = selectedClienteHistory
    ? facturas.filter((f) => f.clienteId === selectedClienteHistory.id)
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Cartera de Clientes y Agentes Retenedores
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              {clientes.length} registrados
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de clientes, buques asociados y condición fiscal de Agente Retenedor de ISR/IVA.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F4BA36] hover:bg-[#FFC82C] text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(244,186,54,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Nuevo Cliente
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-[#131B26] p-3.5 rounded-xl border border-[#1E293B] shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex items-center gap-3">
        <Search className="w-4 h-4 text-[#F4BA36] shrink-0" />
        <input
          type="text"
          placeholder="Buscar cliente por razón social, código o NIT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs text-white focus:outline-none placeholder-slate-500 bg-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-white"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Grid of Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.map((cliente) => {
          const tripsCount = viajes.filter((v) => v.clienteId === cliente.id).length;
          const invoicesCount = facturas.filter((f) => f.clienteId === cliente.id).length;

          return (
            <div
              key={cliente.id}
              className="bg-[#131B26] hover:bg-[#1A2433] rounded-xl border border-[#1E293B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-[#F4BA36]/40 transition-all space-y-4 group"
            >
              <div className="space-y-3">
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1A2433] text-[#FFC82C] border border-[#F4BA36]/20">
                      {cliente.codigo}
                    </span>
                    <h3 className="font-bold text-sm text-white mt-1 leading-snug group-hover:text-[#FFC82C] transition-colors">
                      {cliente.nombre}
                    </h3>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleOpenModal(cliente)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#FFC82C] hover:bg-[#1A2433] transition-colors"
                      title="Editar Cliente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Fiscal Condition: Retaining Agent Badge */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Condición Fiscal:</span>
                  {cliente.esAgenteRetenedor ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      Agente Retenedor ISR
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500">
                      Contribuyente General
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500 w-16">NIT:</span>
                    <span className="font-mono text-slate-800">{cliente.nit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{cliente.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cliente.correo}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-500 line-clamp-2">{cliente.direccion}</span>
                  </div>
                </div>

                {/* Associated Vessels / Movements */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                    <Ship className="w-3 h-3 text-blue-500" />
                    Buques / Movimientos habituales:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cliente.buquesHabituales.map((b) => (
                      <span
                        key={b}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions & Stats */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  <strong>{tripsCount}</strong> viajes • <strong>{invoicesCount}</strong> facturas
                </div>
                <button
                  onClick={() => setSelectedClienteHistory(cliente)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Ver Historial
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Client */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {editingCliente ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código de Cliente</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIT</label>
                  <input
                    type="text"
                    required
                    value={formData.nit}
                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej. 8492019-3"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre o Razón Social
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej. Corporación Granelera del Atlántico, S.A."
                />
              </div>

              {/* Fiscal condition: Agente Retenedor */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 block">¿Actúa como Agente Retenedor de ISR?</span>
                  <p className="text-[11px] text-amber-700">
                    Si se activa, el sistema deducirá automáticamente las retenciones de ISR (5%) e IVA antes del depósito.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.esAgenteRetenedor}
                  onChange={(e) => setFormData({ ...formData, esAgenteRetenedor: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+502 2334-9000"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contacto@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección Física</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Puerto Barrios / Santo Tomás de Castilla"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Buques / Movimientos Asociados (Separados por coma)
                </label>
                <input
                  type="text"
                  value={formData.buquesHabituales}
                  onChange={(e) => setFormData({ ...formData, buquesHabituales: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sofía, Sakura, Barrios, Carbón..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contacto Principal</label>
                <input
                  type="text"
                  value={formData.contactoPrincipal}
                  onChange={(e) => setFormData({ ...formData, contactoPrincipal: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre y cargo de la persona de contacto"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                >
                  {editingCliente ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Client History (Trips & Invoices) */}
      {selectedClienteHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {selectedClienteHistory.codigo}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  Historial de Operaciones: {selectedClienteHistory.nombre}
                </h3>
              </div>
              <button
                onClick={() => setSelectedClienteHistory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoices summary */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Facturación Emitida ({clienteInvoices.length})
              </h4>
              {clienteInvoices.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">No. Factura</th>
                        <th className="px-3 py-2">Fecha</th>
                        <th className="px-3 py-2">Buque / Proyecto</th>
                        <th className="px-3 py-2">Monto Bruto</th>
                        <th className="px-3 py-2">Neto Esperado</th>
                        <th className="px-3 py-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clienteInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="px-3 py-2 font-mono font-semibold text-blue-700">
                            {inv.numeroFactura}
                          </td>
                          <td className="px-3 py-2 text-slate-600">{inv.fechaEmision}</td>
                          <td className="px-3 py-2 text-slate-800 font-medium">{inv.buqueProyecto}</td>
                          <td className="px-3 py-2 font-semibold text-slate-900">
                            Q{inv.montoBruto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2 font-bold text-emerald-700">
                            Q{inv.netoEsperado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                inv.estadoPago === 'Conciliada'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {inv.estadoPago}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No hay facturas emitidas para este cliente.</p>
              )}
            </div>

            {/* Trips summary */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Ship className="w-4 h-4 text-blue-600" />
                Viajes Registrados ({clienteTrips.length})
              </h4>
              {clienteTrips.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Código</th>
                        <th className="px-3 py-2">Buque</th>
                        <th className="px-3 py-2">Material</th>
                        <th className="px-3 py-2">Placa</th>
                        <th className="px-3 py-2">Peso Carga</th>
                        <th className="px-3 py-2">Peso Descarga</th>
                        <th className="px-3 py-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clienteTrips.map((tr) => (
                        <tr key={tr.id}>
                          <td className="px-3 py-2 font-mono font-semibold text-blue-700">
                            {tr.codigoViaje}
                          </td>
                          <td className="px-3 py-2">{tr.buqueNombre}</td>
                          <td className="px-3 py-2">{tr.material}</td>
                          <td className="px-3 py-2 font-semibold text-slate-900">{tr.placa}</td>
                          <td className="px-3 py-2">{tr.pesajeCarga ? `${tr.pesajeCarga.pesoNetoTon} TM` : '-'}</td>
                          <td className="px-3 py-2 font-medium text-emerald-700">
                            {tr.pesajeDescarga ? `${tr.pesajeDescarga.pesoNetoTon} TM` : '-'}
                          </td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {tr.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No hay viajes registrados para este cliente.</p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedClienteHistory(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Cerrar Historial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
