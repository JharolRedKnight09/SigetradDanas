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
  RefreshCw,
} from 'lucide-react';

export const ClientesModule: React.FC = () => {
  const { clientes, addCliente, updateCliente, currentUser, viajes, facturas, theme, syncStatus, sincronizarAhora } = useApp();
  const isLight = theme === 'light';
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
      const maxNum = clientes.reduce((acc, c) => {
        const num = parseInt((c.codigo || '').replace(/[^0-9]/g, ''), 10);
        return !isNaN(num) && num > acc ? num : acc;
      }, 0);
      const nextNum = maxNum + 1;
      const nextCode = `CLI-${nextNum < 10 ? '00' + nextNum : nextNum < 100 ? '0' + nextNum : nextNum}`;
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
            <h1 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Users className="w-6 h-6 text-[#2563EB]" />
              Cartera de Clientes y Agentes Retenedores
            </h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              isLight
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-blue-900/40 text-[#38BDF8] border-blue-500/30'
            }`}>
              {clientes.length} registrados
            </span>
          </div>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Gestión de clientes, buques asociados y condición fiscal de Agente Retenedor de ISR/IVA.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Indicador de estado de base de datos MySQL */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
            syncStatus.error
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : syncStatus.isOnline
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              syncStatus.isSyncing
                ? 'bg-amber-400 animate-ping'
                : syncStatus.isOnline
                ? 'bg-emerald-400'
                : 'bg-rose-400'
            }`} />
            <span>
              {syncStatus.isSyncing
                ? 'Sincronizando...'
                : syncStatus.isOnline
                ? 'MySQL Sincronizado'
                : 'Sin Conexión'}
            </span>
          </div>

          <button
            onClick={() => sincronizarAhora()}
            disabled={syncStatus.isSyncing}
            title="Forzar sincronización inmediata con la base de datos MySQL"
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-[#1E293B] hover:bg-[#334155] border-slate-700 text-slate-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin text-[#38BDF8]' : ''}`} />
            <span className="hidden md:inline">Sincronizar</span>
          </button>

          {canEdit && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-[0_0_15px_rgba(37,99,235,0.35)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Registrar Nuevo Cliente
            </button>
          )}
        </div>
      </div>

      {/* Alerta de sincronización si hubo error o desconexión */}
      {syncStatus.error && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{syncStatus.error}</span>
          </div>
          <button
            onClick={() => sincronizarAhora()}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded text-xs cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
          : 'bg-[#131B26] border-[#1E293B] text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
      }`}>
        <Search className="w-4 h-4 text-[#38BDF8] shrink-0" />
        <input
          type="text"
          placeholder="Buscar cliente por razón social, código o NIT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full text-xs focus:outline-none bg-transparent ${
            isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-slate-500'
          }`}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className={`text-xs ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
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
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all space-y-4 group ${
                isLight
                  ? 'bg-white hover:bg-slate-50/70 border-slate-200 hover:border-blue-300 shadow-sm text-slate-800'
                  : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] hover:border-blue-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)] text-slate-200'
              }`}
            >
              <div className="space-y-3">
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isLight
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-[#1A2433] text-[#38BDF8] border-blue-500/30'
                    }`}>
                      {cliente.codigo}
                    </span>
                    <h3 className={`font-bold text-sm mt-1 leading-snug transition-colors ${
                      isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-[#38BDF8]'
                    }`}>
                      {cliente.nombre}
                    </h3>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleOpenModal(cliente)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isLight
                          ? 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                          : 'text-slate-400 hover:text-[#38BDF8] hover:bg-[#1A2433]'
                      }`}
                      title="Editar Cliente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Fiscal Condition: Retaining Agent Badge */}
                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  isLight
                    ? 'bg-slate-50 border-slate-200/70 text-slate-700'
                    : 'bg-[#0D131C] border-[#1E293B] text-slate-300'
                }`}>
                  <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Condición Fiscal:</span>
                  {cliente.esAgenteRetenedor ? (
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                      isLight
                        ? 'bg-blue-50 text-blue-900 border-blue-200'
                        : 'bg-blue-950/70 text-[#38BDF8] border-blue-800/60'
                    }`}>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                      Agente Retenedor ISR
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500">
                      Contribuyente General
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className={`space-y-1.5 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold w-16 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>NIT:</span>
                    <span className={`font-mono font-medium ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{cliente.nit}</span>
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
                    <span className={`text-[11px] line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{cliente.direccion}</span>
                  </div>
                </div>

                {/* Associated Vessels / Movements */}
                <div>
                  <div className={`text-[11px] font-semibold mb-1 flex items-center gap-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <Ship className="w-3 h-3 text-[#2563EB]" />
                    Buques / Movimientos habituales:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cliente.buquesHabituales.map((b) => (
                      <span
                        key={b}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                          isLight
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-[#1A2433] text-[#38BDF8] border-blue-500/30'
                        }`}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions & Stats */}
              <div className={`pt-3 border-t flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-[#1E293B]'}`}>
                <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <strong className={isLight ? 'text-slate-900' : 'text-white'}>{tripsCount}</strong> viajes • <strong className={isLight ? 'text-slate-900' : 'text-white'}>{invoicesCount}</strong> facturas
                </div>
                <button
                  onClick={() => setSelectedClienteHistory(cliente)}
                  className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4 my-8 transition-colors ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-[#131B26] border-[#1E293B] text-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-[#1E293B]'}`}>
              <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Users className="w-5 h-5 text-[#2563EB]" />
                {editingCliente ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Código de Cliente</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0D131C] border-[#1E293B] text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>NIT</label>
                  <input
                    type="text"
                    required
                    value={formData.nit}
                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0D131C] border-[#1E293B] text-white'
                    }`}
                    placeholder="Ej. 8492019-3"
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Nombre o Razón Social
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0D131C] border-[#1E293B] text-white'
                  }`}
                  placeholder="Ej. Corporación Granelera del Atlántico, S.A."
                />
              </div>

              {/* Fiscal condition: Agente Retenedor */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                isLight
                  ? 'bg-blue-50/60 border-blue-200'
                  : 'bg-[#0D131C] border-blue-500/30'
              }`}>
                <div>
                  <span className={`font-bold block ${isLight ? 'text-blue-950' : 'text-[#38BDF8]'}`}>¿Actúa como Agente Retenedor de ISR?</span>
                  <p className={`text-[11px] ${isLight ? 'text-blue-800' : 'text-slate-400'}`}>
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
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0D131C] border-[#1E293B] text-white'
                    }`}
                    placeholder="+502 2334-9000"
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0D131C] border-[#1E293B] text-white'
                    }`}
                    placeholder="contacto@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Dirección Física</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0D131C] border-[#1E293B] text-white'
                  }`}
                  placeholder="Puerto Barrios / Santo Tomás de Castilla"
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Buques / Movimientos Asociados (Separados por coma)
                </label>
                <input
                  type="text"
                  value={formData.buquesHabituales}
                  onChange={(e) => setFormData({ ...formData, buquesHabituales: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0D131C] border-[#1E293B] text-white'
                  }`}
                  placeholder="Sofía, Sakura, Barrios, Carbón..."
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Contacto Principal</label>
                <input
                  type="text"
                  value={formData.contactoPrincipal}
                  onChange={(e) => setFormData({ ...formData, contactoPrincipal: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0D131C] border-[#1E293B] text-white'
                  }`}
                  placeholder="Nombre y cargo de la persona de contacto"
                />
              </div>

              <div className={`flex justify-end gap-2 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-[#1E293B]'}`}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-xl font-semibold cursor-pointer ${
                    isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-blue-600/30 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`rounded-2xl max-w-3xl w-full p-6 shadow-2xl border space-y-5 my-8 transition-colors ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-[#131B26] border-[#1E293B] text-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-[#1E293B]'}`}>
              <div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-[#1A2433] text-[#38BDF8] border-blue-500/30'
                }`}>
                  {selectedClienteHistory.codigo}
                </span>
                <h3 className={`font-bold text-base mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Historial de Operaciones: {selectedClienteHistory.nombre}
                </h3>
              </div>
              <button
                onClick={() => setSelectedClienteHistory(null)}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoices summary */}
            <div className="space-y-3">
              <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                <Receipt className="w-4 h-4 text-emerald-500" />
                Facturación Emitida ({clienteInvoices.length})
              </h4>
              {clienteInvoices.length > 0 ? (
                <div className={`overflow-x-auto rounded-xl border ${isLight ? 'border-slate-200' : 'border-[#1E293B]'}`}>
                  <table className="w-full text-left text-xs">
                    <thead className={`font-semibold border-b ${
                      isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-[#0D131C] text-slate-300 border-[#1E293B]'
                    }`}>
                      <tr>
                        <th className="px-3 py-2">No. Factura</th>
                        <th className="px-3 py-2">Fecha</th>
                        <th className="px-3 py-2">Buque / Proyecto</th>
                        <th className="px-3 py-2">Monto Bruto</th>
                        <th className="px-3 py-2">Neto Esperado</th>
                        <th className="px-3 py-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1E293B]'}`}>
                      {clienteInvoices.map((inv) => (
                        <tr key={inv.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1A2433]/50'}>
                          <td className="px-3 py-2 font-mono font-semibold text-[#2563EB]">
                            {inv.numeroFactura}
                          </td>
                          <td className={`px-3 py-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{inv.fechaEmision}</td>
                          <td className={`px-3 py-2 font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{inv.buqueProyecto}</td>
                          <td className={`px-3 py-2 font-semibold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            Q{inv.montoBruto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2 font-bold font-mono text-[#10B981]">
                            Q{inv.netoEsperado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                inv.estadoPago === 'Conciliada'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
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
              <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                <Ship className="w-4 h-4 text-[#2563EB]" />
                Viajes Registrados ({clienteTrips.length})
              </h4>
              {clienteTrips.length > 0 ? (
                <div className={`overflow-x-auto rounded-xl border ${isLight ? 'border-slate-200' : 'border-[#1E293B]'}`}>
                  <table className="w-full text-left text-xs">
                    <thead className={`font-semibold border-b ${
                      isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-[#0D131C] text-slate-300 border-[#1E293B]'
                    }`}>
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
                    <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1E293B]'}`}>
                      {clienteTrips.map((tr) => (
                        <tr key={tr.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1A2433]/50'}>
                          <td className="px-3 py-2 font-mono font-semibold text-[#2563EB]">
                            {tr.codigoViaje}
                          </td>
                          <td className={`px-3 py-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{tr.buqueNombre}</td>
                          <td className={`px-3 py-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{tr.material}</td>
                          <td className={`px-3 py-2 font-semibold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{tr.placa}</td>
                          <td className="px-3 py-2 font-mono">{tr.pesajeCarga ? `${tr.pesajeCarga.pesoNetoTon} TM` : '-'}</td>
                          <td className="px-3 py-2 font-medium font-mono text-[#10B981]">
                            {tr.pesajeDescarga ? `${tr.pesajeDescarga.pesoNetoTon} TM` : '-'}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#1A2433] text-slate-300 border border-[#1E293B]'
                            }`}>
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

            <div className={`flex justify-end pt-3 border-t ${isLight ? 'border-slate-200' : 'border-[#1E293B]'}`}>
              <button
                onClick={() => setSelectedClienteHistory(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
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
