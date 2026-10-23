import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Gondola, EstadoGondola } from '../types';
import {
  Truck,
  Search,
  Plus,
  Wallet,
  CheckCircle2,
  Wrench,
  Navigation,
  Edit2,
  X,
  Gauge,
  Calendar,
  Layers,
  Fuel,
} from 'lucide-react';

export const GondolasModule: React.FC = () => {
  const { gondolas, addGondola, updateGondola, propietarios, currentUser, viajes, pagos, theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwner, setFilterOwner] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingGondola, setEditingGondola] = useState<Gondola | null>(null);

  const canManage = currentUser.rol === 'DUENO' || currentUser.rol === 'ADMIN' || currentUser.rol === 'SUPERVISOR';

  const [formData, setFormData] = useState<{
    placa: string;
    tipoUnidad: string;
    capacidadTon: number;
    capacidadM3: number;
    propietarioId: string;
    estado: EstadoGondola;
    kilometraje: number;
    anio: number;
    observaciones: string;
  }>({
    placa: '',
    tipoUnidad: 'Cabezal Freightliner + Góndola de Volteo 3 Ejes',
    capacidadTon: 36,
    capacidadM3: 42,
    propietarioId: propietarios[0]?.id || '',
    estado: 'Disponible',
    kilometraje: 180000,
    anio: 2021,
    observaciones: '',
  });

  const filteredGondolas = gondolas.filter((g) => {
    const matchesSearch =
      g.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.tipoUnidad.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOwner = filterOwner === 'ALL' || g.propietarioId === filterOwner;
    return matchesSearch && matchesOwner;
  });

  const getStatusBadge = (estado: EstadoGondola) => {
    switch (estado) {
      case 'Disponible':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Disponible
          </span>
        );
      case 'En Ruta':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            <Navigation className="w-3 h-3" /> En Ruta
          </span>
        );
      case 'Mantenimiento':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            <Wrench className="w-3 h-3" /> En Mantenimiento
          </span>
        );
    }
  };

  const handleOpenModal = (gondola?: Gondola) => {
    if (gondola) {
      setEditingGondola(gondola);
      setFormData({
        placa: gondola.placa,
        tipoUnidad: gondola.tipoUnidad,
        capacidadTon: gondola.capacidadTon,
        capacidadM3: gondola.capacidadM3,
        propietarioId: gondola.propietarioId,
        estado: gondola.estado,
        kilometraje: gondola.kilometraje,
        anio: gondola.anio,
        observaciones: gondola.observaciones || '',
      });
    } else {
      setEditingGondola(null);
      setFormData({
        placa: `C-${Math.floor(100 + Math.random() * 899)}B${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        tipoUnidad: 'Cabezal Freightliner Cascadia + Góndola 3 Ejes',
        capacidadTon: 36,
        capacidadM3: 42,
        propietarioId: propietarios[0]?.id || '',
        estado: 'Disponible',
        kilometraje: 190000,
        anio: 2021,
        observaciones: 'Unidad en óptimas condiciones mecánicas',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGondola) {
      updateGondola(editingGondola.id, formData);
    } else {
      addGondola(formData);
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
              <Truck className="w-6 h-6 text-blue-600" />
              Flota de Góndolas Triaxiales y Propietarios
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              {gondolas.length} unidades
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Vinculación de placas a los 3 hermanos propietarios (Jairo, Carlos, Edwin) para liquidación bancaria de viajes.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Registrar Unidad (Placa)
          </button>
        )}
      </div>

      {/* 3 Brothers Summary Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {propietarios.map((hermano) => {
          const placasHermano = gondolas.filter((g) => g.propietarioId === hermano.id);
          const isSelected = filterOwner === hermano.id;

          return (
            <div
              key={hermano.id}
              onClick={() => setFilterOwner(isSelected ? 'ALL' : hermano.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{hermano.nombre}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {hermano.banco}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">{hermano.numeroCuenta}</div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Placas asignadas:</span>
                <span className="font-bold text-slate-800">
                  {placasHermano.length} ({placasHermano.map((p) => p.placa).join(', ')})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por placa o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-slate-800 focus:outline-none placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Filtrar por hermano:</span>
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
          >
            <option value="ALL">Todos los Propietarios ({gondolas.length})</option>
            {propietarios.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.banco})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gondolas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGondolas.map((gondola) => {
          const hermano = propietarios.find((p) => p.id === gondola.propietarioId);
          const viajesPlaca = viajes.filter((v) => v.placa === gondola.placa);
          const viajesCompletados = viajesPlaca.filter(
            (v) => v.estado === 'Finalizado' || v.estado === 'Facturado'
          );

          // Calculate accumulated gross earnings generated by this plate
          const totalGeneradoBruto = viajesCompletados.reduce((acc, v) => acc + v.tarifaAcordada, 0);

          return (
            <div
              key={gondola.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="sigetrad-plate-badge text-base font-mono font-black tracking-wider px-3 py-1 rounded-lg border shadow-xs transition-colors inline-flex items-center gap-1.5"
                        style={{
                          backgroundColor: theme === 'light' ? '#FFFFFF' : '#1A2433',
                          color: theme === 'light' ? '#0F172A' : '#38BDF8',
                          borderColor: theme === 'light' ? '#94A3B8' : 'rgba(56, 189, 248, 0.4)',
                          boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.08)' : '0 0 10px rgba(56, 189, 248, 0.15)',
                        }}
                      >
                        <span
                          className="text-[10px] font-sans font-extrabold px-1 py-0.5 rounded"
                          style={{
                            backgroundColor: theme === 'light' ? '#E0F2FE' : 'rgba(56, 189, 248, 0.2)',
                            color: theme === 'light' ? '#0369A1' : '#38BDF8',
                          }}
                        >
                          GT
                        </span>
                        <span>{gondola.placa}</span>
                      </span>
                      {getStatusBadge(gondola.estado)}
                    </div>
                    <h3 className="font-semibold text-xs text-slate-800 mt-2 leading-snug">
                      {gondola.tipoUnidad}
                    </h3>
                  </div>

                  {canManage && (
                    <button
                      onClick={() => handleOpenModal(gondola)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title="Editar Góndola"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Owner Brother Box */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Hermano Propietario:</span>
                    <span className="font-bold text-slate-900">{hermano?.nombre}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{hermano?.banco}:</span>
                    <span>{hermano?.numeroCuenta}</span>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div className="p-2 rounded-lg bg-slate-50/70 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">CAPACIDAD TON</span>
                    <span className="font-bold text-slate-800 text-sm">{gondola.capacidadTon} Ton</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50/70 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">VOLUMEN M³</span>
                    <span className="font-bold text-slate-800 text-sm">{gondola.capacidadM3} m³</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-500 pt-1">
                  <div className="flex items-center justify-between">
                    <span>Año / Modelo:</span>
                    <span className="font-medium text-slate-800">{gondola.anio}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Kilometraje Odómetro:</span>
                    <span className="font-mono text-slate-800">{gondola.kilometraje.toLocaleString()} km</span>
                  </div>
                  {gondola.observaciones && (
                    <div className="text-[11px] text-slate-500 italic mt-1">
                      {gondola.observaciones}
                    </div>
                  )}
                </div>
              </div>

              {/* Financial stats of this plate */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Viajes: <strong className="text-slate-900">{viajesCompletados.length}</strong>
                </span>
                <span className="text-emerald-700 font-bold">
                  Generado: Q{totalGeneradoBruto.toLocaleString('es-GT', { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Gondola */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                {editingGondola ? 'Editar Unidad / Góndola' : 'Registrar Nueva Unidad'}
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
                  <label className="block font-semibold text-slate-700 mb-1">Placa Vehicular</label>
                  <input
                    type="text"
                    required
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    placeholder="C-182BKZ"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hermano Propietario</label>
                  <select
                    value={formData.propietarioId}
                    onChange={(e) => setFormData({ ...formData, propietarioId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {propietarios.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.banco})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Unidad / Descripción</label>
                <input
                  type="text"
                  required
                  value={formData.tipoUnidad}
                  onChange={(e) => setFormData({ ...formData, tipoUnidad: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cabezal Freightliner + Góndola de Volteo 3 Ejes"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacidad (Toneladas)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.capacidadTon}
                    onChange={(e) => setFormData({ ...formData, capacidadTon: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacidad (m³)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.capacidadM3}
                    onChange={(e) => setFormData({ ...formData, capacidadM3: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Año</label>
                  <input
                    type="number"
                    value={formData.anio}
                    onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) || 2020 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kilometraje</label>
                  <input
                    type="number"
                    value={formData.kilometraje}
                    onChange={(e) => setFormData({ ...formData, kilometraje: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoGondola })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En Ruta">En Ruta</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Estado de llantas, lona, servicios mecánicos..."
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
                  {editingGondola ? 'Guardar Cambios' : 'Registrar Unidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
