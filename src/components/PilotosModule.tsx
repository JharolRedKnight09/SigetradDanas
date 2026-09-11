import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Piloto, EstadoPiloto } from '../types';
import {
  UserSquare2,
  Search,
  Plus,
  Phone,
  CreditCard,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  Coffee,
  XCircle,
  Edit2,
  X,
  Ship,
} from 'lucide-react';

export const PilotosModule: React.FC = () => {
  const { pilotos, addPiloto, updatePiloto, currentUser, viajes, gondolas } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPiloto, setEditingPiloto] = useState<Piloto | null>(null);

  const canManage = currentUser.rol === 'DUENO' || currentUser.rol === 'ADMIN' || currentUser.rol === 'SUPERVISOR';

  const [formData, setFormData] = useState<{
    nombreCompleto: string;
    licencia: string;
    tipoLicencia: string;
    vencimientoLicencia: string;
    telefono: string;
    dpi: string;
    estado: EstadoPiloto;
    fechaIngreso: string;
    gondolaHabitual: string;
  }>({
    nombreCompleto: '',
    licencia: '',
    tipoLicencia: 'A',
    vencimientoLicencia: '2027-12-31',
    telefono: '',
    dpi: '',
    estado: 'Disponible',
    fechaIngreso: new Date().toISOString().slice(0, 10),
    gondolaHabitual: '',
  });

  const filteredPilotos = pilotos.filter(
    (p) =>
      p.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.licencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dpi.includes(searchTerm)
  );

  const getStatusBadge = (estado: EstadoPiloto) => {
    switch (estado) {
      case 'Disponible':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Disponible
          </span>
        );
      case 'En Viaje':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3" /> En Viaje
          </span>
        );
      case 'Descanso':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            <Coffee className="w-3 h-3" /> En Descanso
          </span>
        );
      case 'Inactivo':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
            <XCircle className="w-3 h-3" /> Inactivo
          </span>
        );
    }
  };

  const handleOpenModal = (piloto?: Piloto) => {
    if (piloto) {
      setEditingPiloto(piloto);
      setFormData({
        nombreCompleto: piloto.nombreCompleto,
        licencia: piloto.licencia,
        tipoLicencia: piloto.tipoLicencia,
        vencimientoLicencia: piloto.vencimientoLicencia,
        telefono: piloto.telefono,
        dpi: piloto.dpi,
        estado: piloto.estado,
        fechaIngreso: piloto.fechaIngreso,
        gondolaHabitual: piloto.gondolaHabitual || '',
      });
    } else {
      setEditingPiloto(null);
      setFormData({
        nombreCompleto: '',
        licencia: `LIC-A-${Math.floor(100000 + Math.random() * 900000)}`,
        tipoLicencia: 'A',
        vencimientoLicencia: '2028-06-30',
        telefono: '+502 ',
        dpi: '',
        estado: 'Disponible',
        fechaIngreso: new Date().toISOString().slice(0, 10),
        gondolaHabitual: gondolas[0]?.placa || '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPiloto) {
      updatePiloto(editingPiloto.id, formData);
    } else {
      addPiloto(formData);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserSquare2 className="w-6 h-6 text-blue-600" />
              Gestión de Pilotos y Operadores de Góndola
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              {pilotos.length} pilotos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de pilotos de góndolas de Dannas, licencias pesadas y asignación a buques.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Registrar Piloto
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar piloto por nombre, licencia o DPI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs text-slate-800 focus:outline-none placeholder-slate-400"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600">
            Limpiar
          </button>
        )}
      </div>

      {/* Pilots Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPilotos.map((piloto) => {
          // Check active trip
          const activeTrip = viajes.find(
            (v) => v.pilotoId === piloto.id && v.estado === 'En Curso'
          );
          const totalViajesRealizados = viajes.filter(
            (v) => v.pilotoId === piloto.id && (v.estado === 'Finalizado' || v.estado === 'Facturado')
          ).length;

          return (
            <div
              key={piloto.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-700">
                      {piloto.nombreCompleto.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {piloto.nombreCompleto}
                      </h3>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{piloto.licencia}</span>
                        <span>(Tipo {piloto.tipoLicencia})</span>
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <button
                      onClick={() => handleOpenModal(piloto)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title="Editar Piloto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500">Disponibilidad:</span>
                  {getStatusBadge(piloto.estado)}
                </div>

                {/* Info List */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">DPI:</span>
                    <span className="font-mono text-slate-800">{piloto.dpi}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Teléfono:</span>
                    <span className="text-slate-800">{piloto.telefono}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Vence Licencia:</span>
                    <span className="text-slate-800 font-medium">{piloto.vencimientoLicencia}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Góndola Asignada:</span>
                    <span className="font-bold text-blue-700">{piloto.gondolaHabitual || 'Por asignar'}</span>
                  </div>
                </div>

                {/* Active Trip Banner if any */}
                {activeTrip && (
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1">
                        <Ship className="w-3.5 h-3.5 text-blue-600" />
                        Buque {activeTrip.buqueNombre}
                      </span>
                      <span className="font-mono text-[11px] text-blue-700">{activeTrip.codigoViaje}</span>
                    </div>
                    <div className="text-[11px] text-blue-800">
                      Transportando: <strong>{activeTrip.material}</strong> en placa {activeTrip.placa}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Viajes Completados: <strong className="text-slate-900">{totalViajesRealizados}</strong>
                </span>
                <span className="text-[11px] text-slate-400">
                  Ingreso: {piloto.fechaIngreso}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Pilot */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <UserSquare2 className="w-5 h-5 text-blue-600" />
                {editingPiloto ? 'Editar Datos del Piloto' : 'Registrar Nuevo Piloto'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.nombreCompleto}
                  onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej. Pedro Ramírez"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número de Licencia</label>
                  <input
                    type="text"
                    required
                    value={formData.licencia}
                    onChange={(e) => setFormData({ ...formData, licencia: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="LIC-A-XXXXXX"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Licencia</label>
                  <select
                    value={formData.tipoLicencia}
                    onChange={(e) => setFormData({ ...formData, tipoLicencia: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">Tipo A (Pesada / Góndola)</option>
                    <option value="B">Tipo B (Pesada básica)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">DPI</label>
                  <input
                    type="text"
                    required
                    value={formData.dpi}
                    onChange={(e) => setFormData({ ...formData, dpi: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2415 88910 1801"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+502 3341-9988"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vencimiento Licencia</label>
                  <input
                    type="date"
                    required
                    value={formData.vencimientoLicencia}
                    onChange={(e) => setFormData({ ...formData, vencimientoLicencia: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoPiloto })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En Viaje">En Viaje</option>
                    <option value="Descanso">Descanso</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Góndola Habitual Asignada</label>
                <select
                  value={formData.gondolaHabitual}
                  onChange={(e) => setFormData({ ...formData, gondolaHabitual: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar góndola...</option>
                  {gondolas.map((g) => (
                    <option key={g.id} value={g.placa}>
                      {g.placa} ({g.tipoUnidad})
                    </option>
                  ))}
                </select>
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
                  {editingPiloto ? 'Guardar Cambios' : 'Registrar Piloto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
