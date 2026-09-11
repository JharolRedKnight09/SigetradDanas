import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Viaje,
  CategoriaMovimiento,
  MaterialType,
  EstadoViaje,
  BoletaPesaje,
} from '../types';
import {
  Ship,
  Search,
  Plus,
  Scale,
  Download,
  FileSpreadsheet,
  Filter,
  Calendar,
  Truck,
  UserSquare2,
  CheckCircle2,
  Clock,
  Navigation,
  X,
  Edit2,
  Trash2,
  FileText,
  Building,
} from 'lucide-react';
import { exportViajePDF } from '../utils/pdfExport';
import { exportViajesToExcel } from '../utils/excelExport';

export const ViajesModule: React.FC = () => {
  const {
    viajes,
    addViaje,
    updateViaje,
    deleteViaje,
    clientes,
    pilotos,
    gondolas,
    propietarios,
    parametrosCombustible,
    currentUser,
  } = useApp();

  // Selected Excel-style tab
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaMovimiento | 'TODOS'>('TODOS');
  const [selectedBuque, setSelectedBuque] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingPesajeViaje, setEditingPesajeViaje] = useState<Viaje | null>(null);

  const canCreate = currentUser.rol === 'DUENO' || currentUser.rol === 'ADMIN' || currentUser.rol === 'SUPERVISOR';
  const canDelete = currentUser.rol === 'DUENO' || currentUser.rol === 'ADMIN';

  // Movement categories matching the Master Excel tabs
  const CATEGORIAS: CategoriaMovimiento[] = [
    'Buques',
    'Barrios',
    'Carbón',
    'Clinkers',
    'Mi Guate',
    'Palo Gordo',
  ];

  // Distinct vessels in dataset
  const buquesDisponibles = Array.from(
    new Set(viajes.map((v) => v.buqueNombre).filter(Boolean))
  );

  // Filtered trips
  const filteredViajes = viajes.filter((v) => {
    const matchesCat = selectedCategoria === 'TODOS' || v.categoriaMovimiento === selectedCategoria;
    const matchesBuque = selectedBuque === 'TODOS' || v.buqueNombre === selectedBuque;
    const matchesSearch =
      v.codigoViaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.pilotoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.material.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesBuque && matchesSearch;
  });

  // Calculate accumulated totals for current view
  const totalViajesVista = filteredViajes.length;
  const totalToneladasCarga = filteredViajes.reduce(
    (acc, v) => acc + (v.pesajeCarga?.pesoNetoTon || 0),
    0
  );
  const totalToneladasDescarga = filteredViajes.reduce(
    (acc, v) => acc + (v.pesajeDescarga?.pesoNetoTon || 0),
    0
  );

  // New Trip Form State
  const [newTripData, setNewTripData] = useState<{
    clienteId: string;
    categoriaMovimiento: CategoriaMovimiento;
    buqueNombre: string;
    material: MaterialType;
    pilotoId: string;
    gondolaId: string;
    fechaSalida: string;
    tarifaAcordada: number;
    estado: EstadoViaje;
    // Scale initial ticket optional on creation
    hasInitialScale: boolean;
    boletaCargaNo: string;
    pesoBrutoCarga: number;
    taraCarga: number;
    basculaCargaNombre: string;
  }>({
    clienteId: clientes[0]?.id || '',
    categoriaMovimiento: 'Buques',
    buqueNombre: 'Sofía',
    material: 'Soya',
    pilotoId: pilotos[0]?.id || '',
    gondolaId: gondolas[0]?.id || '',
    fechaSalida: new Date().toISOString().replace('T', ' ').slice(0, 16),
    tarifaAcordada: 1000,
    estado: 'En Curso',
    hasInitialScale: true,
    boletaCargaNo: `BC-${Math.floor(80000 + Math.random() * 19999)}`,
    pesoBrutoCarga: 50200,
    taraCarga: 14200,
    basculaCargaNombre: 'Báscula Muelle Norte Santo Tomás',
  });

  // Scale ticket editing state (Carga and Descarga)
  const [pesajeData, setPesajeData] = useState<{
    // Carga
    cargaBoleta: string;
    cargaBruto: number;
    cargaTara: number;
    cargaBascula: string;
    cargaObservaciones: string;
    // Descarga
    descargaBoleta: string;
    descargaBruto: number;
    descargaTara: number;
    descargaBascula: string;
    descargaObservaciones: string;
    estado: EstadoViaje;
  }>({
    cargaBoleta: '',
    cargaBruto: 0,
    cargaTara: 0,
    cargaBascula: '',
    cargaObservaciones: '',
    descargaBoleta: '',
    descargaBruto: 0,
    descargaTara: 0,
    descargaBascula: '',
    descargaObservaciones: '',
    estado: 'En Curso',
  });

  const handleOpenPesajeModal = (viaje: Viaje) => {
    setEditingPesajeViaje(viaje);
    setPesajeData({
      cargaBoleta: viaje.pesajeCarga?.numeroBoleta || `BC-${Math.floor(80000 + Math.random() * 19999)}`,
      cargaBruto: viaje.pesajeCarga?.pesoBrutoKg || 50000,
      cargaTara: viaje.pesajeCarga?.taraKg || 14200,
      cargaBascula: viaje.pesajeCarga?.basculaNombre || 'Báscula Muelle Santo Tomás',
      cargaObservaciones: viaje.pesajeCarga?.observaciones || '',
      descargaBoleta: viaje.pesajeDescarga?.numeroBoleta || `BD-${Math.floor(40000 + Math.random() * 19999)}`,
      descargaBruto: viaje.pesajeDescarga?.pesoBrutoKg || (viaje.pesajeCarga?.pesoBrutoKg ? viaje.pesajeCarga.pesoBrutoKg - 50 : 49950),
      descargaTara: viaje.pesajeDescarga?.taraKg || viaje.pesajeCarga?.taraKg || 14200,
      descargaBascula: viaje.pesajeDescarga?.basculaNombre || 'Báscula Destino Silos / Planta',
      descargaObservaciones: viaje.pesajeDescarga?.observaciones || 'Descarga conforme',
      estado: viaje.estado,
    });
  };

  const handleSavePesaje = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPesajeViaje) return;

    const netoCargaKg = pesajeData.cargaBruto - pesajeData.cargaTara;
    const pesajeCarga: BoletaPesaje = {
      numeroBoleta: pesajeData.cargaBoleta,
      pesoBrutoKg: pesajeData.cargaBruto,
      taraKg: pesajeData.cargaTara,
      pesoNetoKg: netoCargaKg,
      pesoNetoTon: parseFloat((netoCargaKg / 1000).toFixed(2)),
      fechaHora: editingPesajeViaje.fechaSalida,
      basculaNombre: pesajeData.cargaBascula,
      observaciones: pesajeData.cargaObservaciones,
    };

    let pesajeDescarga: BoletaPesaje | undefined = undefined;
    if (pesajeData.descargaBruto > 0) {
      const netoDescargaKg = pesajeData.descargaBruto - pesajeData.descargaTara;
      pesajeDescarga = {
        numeroBoleta: pesajeData.descargaBoleta,
        pesoBrutoKg: pesajeData.descargaBruto,
        taraKg: pesajeData.descargaTara,
        pesoNetoKg: netoDescargaKg,
        pesoNetoTon: parseFloat((netoDescargaKg / 1000).toFixed(2)),
        fechaHora: new Date().toISOString().replace('T', ' ').slice(0, 16),
        basculaNombre: pesajeData.descargaBascula,
        observaciones: pesajeData.descargaObservaciones,
      };
    }

    updateViaje(editingPesajeViaje.id, {
      pesajeCarga,
      pesajeDescarga,
      estado: pesajeData.estado,
      fechaEntrega: pesajeDescarga ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined,
    });

    setEditingPesajeViaje(null);
  };

  const handleCreateTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cliente = clientes.find((c) => c.id === newTripData.clienteId);
    const piloto = pilotos.find((p) => p.id === newTripData.pilotoId);
    const gondola = gondolas.find((g) => g.id === newTripData.gondolaId);

    if (!cliente || !piloto || !gondola) return;

    // Estimate fuel based on material or movement
    const param = parametrosCombustible.find(
      (p) =>
        p.tipoMovimientoOMaterial.toLowerCase() === newTripData.material.toLowerCase() ||
        p.tipoMovimientoOMaterial.toLowerCase() === newTripData.categoriaMovimiento.toLowerCase()
    );
    const galonesEst = param ? param.galonesSugeridos : 24;

    const netoCarga = newTripData.pesoBrutoCarga - newTripData.taraCarga;

    addViaje({
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      categoriaMovimiento: newTripData.categoriaMovimiento,
      buqueNombre: newTripData.buqueNombre,
      material: newTripData.material,
      pilotoId: piloto.id,
      pilotoNombre: piloto.nombreCompleto,
      gondolaId: gondola.id,
      placa: gondola.placa,
      propietarioHermanoId: gondola.propietarioId,
      fechaSalida: newTripData.fechaSalida,
      estado: newTripData.estado,
      tarifaAcordada: newTripData.tarifaAcordada,
      pesajeCarga: newTripData.hasInitialScale
        ? {
            numeroBoleta: newTripData.boletaCargaNo,
            pesoBrutoKg: newTripData.pesoBrutoCarga,
            taraKg: newTripData.taraCarga,
            pesoNetoKg: netoCarga,
            pesoNetoTon: parseFloat((netoCarga / 1000).toFixed(2)),
            fechaHora: newTripData.fechaSalida,
            basculaNombre: newTripData.basculaCargaNombre,
          }
        : undefined,
      combustible: {
        galonesEstimados: galonesEst,
        galonesReales: galonesEst,
        precioPorGalon: 32.5,
        costoTotal: galonesEst * 32.5,
        estacionServicio: 'Shell Puerto Barrios',
      },
    });

    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Ship className="w-6 h-6 text-blue-600" />
              Operaciones y Básculas: Control por Buque y Despachos
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              {viajes.length} registrados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reemplaza las pestañas del Excel maestro: Buques (Sofía, Sakura), Barrios, Carbón, Clinkers, Mi Guate, Palo Gordo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportViajesToExcel(filteredViajes, selectedCategoria)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            title="Exportar hoja Excel actual"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Exportar Excel
          </button>

          {canCreate && (
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Viaje
            </button>
          )}
        </div>
      </div>

      {/* Movement Tabs (Excel Tabs Replica) */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto pb-px">
          <button
            onClick={() => setSelectedCategoria('TODOS')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              selectedCategoria === 'TODOS'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            📋 Todos los Movimientos ({viajes.length})
          </button>

          {CATEGORIAS.map((cat) => {
            const count = viajes.filter((v) => v.categoriaMovimiento === cat).length;
            const isSelected = selectedCategoria === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategoria(cat);
                  setSelectedBuque('TODOS');
                }}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Filter by Vessel + Metrics summary */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Vessel Filter & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Filtrar por Buque:</span>
            <select
              value={selectedBuque}
              onChange={(e) => setSelectedBuque(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-medium focus:outline-none"
            >
              <option value="TODOS">Todos los Buques / Proyectos</option>
              {buquesDisponibles.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por código, placa, piloto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none w-56"
            />
          </div>
        </div>

        {/* Real-time Accumulator Box for filtered view */}
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">Total Viajes</span>
            <span className="font-bold text-slate-900 text-sm">{totalViajesVista}</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">Ton. Carga</span>
            <span className="font-bold text-blue-700 text-sm">{totalToneladasCarga.toFixed(2)} TM</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">Ton. Descarga</span>
            <span className="font-bold text-emerald-700 text-sm">{totalToneladasDescarga.toFixed(2)} TM</span>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Pestaña / Buque</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Placa / Piloto</th>
                <th className="px-4 py-3">Báscula Inicial (Carga)</th>
                <th className="px-4 py-3">Báscula Destino (Descarga)</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredViajes.length > 0 ? (
                filteredViajes.map((viaje) => (
                  <tr key={viaje.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      {viaje.codigoViaje}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{viaje.buqueNombre}</div>
                      <div className="text-[10px] text-slate-400">{viaje.categoriaMovimiento}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={viaje.clienteNombre}>
                      <span className="font-medium text-slate-800">{viaje.clienteNombre}</span>
                      <div className="text-[10px] text-slate-400">Salida: {viaje.fechaSalida}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium">
                        {viaje.material}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 font-mono">{viaje.placa}</div>
                      <div className="text-[10px] text-slate-500">{viaje.pilotoNombre}</div>
                    </td>

                    {/* Scale Initial */}
                    <td className="px-4 py-3">
                      {viaje.pesajeCarga ? (
                        <div>
                          <span className="font-bold text-slate-900">
                            {viaje.pesajeCarga.pesoNetoTon} TM
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Boleta: {viaje.pesajeCarga.numeroBoleta}
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-600 text-[11px] italic">Sin boleta</span>
                      )}
                    </td>

                    {/* Scale Final */}
                    <td className="px-4 py-3">
                      {viaje.pesajeDescarga ? (
                        <div>
                          <span className="font-bold text-emerald-700">
                            {viaje.pesajeDescarga.pesoNetoTon} TM
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Boleta: {viaje.pesajeDescarga.numeroBoleta}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Pendiente</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          viaje.estado === 'Finalizado' || viaje.estado === 'Facturado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : viaje.estado === 'En Curso'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {viaje.estado}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Scale Button */}
                        <button
                          onClick={() => handleOpenPesajeModal(viaje)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="Registrar / Modificar Boletas de Báscula"
                        >
                          <Scale className="w-4 h-4" />
                        </button>

                        {/* PDF Voucher Button */}
                        <button
                          onClick={() => exportViajePDF(viaje)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                          title="Descargar Comprobante Oficial PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {canDelete && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar viaje ${viaje.codigoViaje}?`)) {
                                deleteViaje(viaje.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                            title="Eliminar Viaje"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-xs text-slate-400 italic">
                    No se encontraron viajes registrados en este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register / Edit Scale Tickets (Carga y Descarga) */}
      {editingPesajeViaje && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {editingPesajeViaje.codigoViaje}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  Registro de Báscula: Carga y Descarga
                </h3>
              </div>
              <button
                onClick={() => setEditingPesajeViaje(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <div>
                <strong>Buque/Movimiento:</strong> {editingPesajeViaje.buqueNombre} •{' '}
                <strong>Material:</strong> {editingPesajeViaje.material}
              </div>
              <div>
                <strong>Placa:</strong> {editingPesajeViaje.placa} •{' '}
                <strong>Piloto:</strong> {editingPesajeViaje.pilotoNombre}
              </div>
            </div>

            <form onSubmit={handleSavePesaje} className="space-y-4 text-xs">
              {/* Box 1: Báscula de Carga Inicial */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                <h4 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-blue-600" />
                  1. Báscula Inicial de Carga (Origen / Muelle)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Boleta No.</label>
                    <input
                      type="text"
                      required
                      value={pesajeData.cargaBoleta}
                      onChange={(e) => setPesajeData({ ...pesajeData, cargaBoleta: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                      placeholder="BC-88910"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre Báscula</label>
                    <input
                      type="text"
                      required
                      value={pesajeData.cargaBascula}
                      onChange={(e) => setPesajeData({ ...pesajeData, cargaBascula: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="Báscula Muelle Santo Tomás"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Peso Bruto (kg)</label>
                    <input
                      type="number"
                      required
                      value={pesajeData.cargaBruto}
                      onChange={(e) => setPesajeData({ ...pesajeData, cargaBruto: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tara (kg)</label>
                    <input
                      type="number"
                      required
                      value={pesajeData.cargaTara}
                      onChange={(e) => setPesajeData({ ...pesajeData, cargaTara: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Peso Neto Carga</label>
                    <div className="px-3 py-2 rounded-lg bg-blue-100 border border-blue-300 font-bold text-blue-900 font-mono">
                      {((pesajeData.cargaBruto - pesajeData.cargaTara) / 1000).toFixed(2)} TM
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Báscula de Descarga Final */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  2. Báscula Destino al Descargar (Boleta de Recepción)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Boleta No. Descarga</label>
                    <input
                      type="text"
                      value={pesajeData.descargaBoleta}
                      onChange={(e) => setPesajeData({ ...pesajeData, descargaBoleta: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                      placeholder="BD-44201"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Báscula Destino</label>
                    <input
                      type="text"
                      value={pesajeData.descargaBascula}
                      onChange={(e) => setPesajeData({ ...pesajeData, descargaBascula: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="Silos Granelera / Planta"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Peso Bruto (kg)</label>
                    <input
                      type="number"
                      value={pesajeData.descargaBruto}
                      onChange={(e) => setPesajeData({ ...pesajeData, descargaBruto: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tara (kg)</label>
                    <input
                      type="number"
                      value={pesajeData.descargaTara}
                      onChange={(e) => setPesajeData({ ...pesajeData, descargaTara: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Peso Neto Descarga</label>
                    <div className="px-3 py-2 rounded-lg bg-emerald-100 border border-emerald-300 font-bold text-emerald-900 font-mono">
                      {((pesajeData.descargaBruto - pesajeData.descargaTara) / 1000).toFixed(2)} TM
                    </div>
                  </div>
                </div>
              </div>

              {/* Status change */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estado del Viaje</label>
                <select
                  value={pesajeData.estado}
                  onChange={(e) => setPesajeData({ ...pesajeData, estado: e.target.value as EstadoViaje })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                >
                  <option value="En Curso">En Curso</option>
                  <option value="Finalizado">Finalizado (Descarga Completada)</option>
                  <option value="Facturado">Facturado</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPesajeViaje(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                >
                  Guardar Boletas y Estado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Trip */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Ship className="w-5 h-5 text-blue-600" />
                Registrar Nuevo Viaje
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTripSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cliente</label>
                  <select
                    value={newTripData.clienteId}
                    onChange={(e) => {
                      const cli = clientes.find((c) => c.id === e.target.value);
                      setNewTripData({
                        ...newTripData,
                        clienteId: e.target.value,
                        buqueNombre: cli?.buquesHabituales[0] || 'Sofía',
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
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Categoría de Movimiento (Pestaña Excel)
                  </label>
                  <select
                    value={newTripData.categoriaMovimiento}
                    onChange={(e) =>
                      setNewTripData({
                        ...newTripData,
                        categoriaMovimiento: e.target.value as CategoriaMovimiento,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre de Buque o Proyecto
                  </label>
                  <input
                    type="text"
                    required
                    value={newTripData.buqueNombre}
                    onChange={(e) => setNewTripData({ ...newTripData, buqueNombre: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    placeholder="Ej. Sofía, Sakura, Palo Gordo..."
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Material Transportado</label>
                  <select
                    value={newTripData.material}
                    onChange={(e) =>
                      setNewTripData({ ...newTripData, material: e.target.value as MaterialType })
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
                  <label className="block font-semibold text-slate-700 mb-1">Góndola (Placa)</label>
                  <select
                    value={newTripData.gondolaId}
                    onChange={(e) => setNewTripData({ ...newTripData, gondolaId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  >
                    {gondolas.map((g) => {
                      const hermano = propietarios.find((p) => p.id === g.propietarioId);
                      return (
                        <option key={g.id} value={g.id}>
                          {g.placa} ({hermano?.nombre} - {g.estado})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Piloto Asignado</label>
                  <select
                    value={newTripData.pilotoId}
                    onChange={(e) => setNewTripData({ ...newTripData, pilotoId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    {pilotos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombreCompleto} ({p.estado})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha y Hora Salida</label>
                  <input
                    type="text"
                    required
                    value={newTripData.fechaSalida}
                    onChange={(e) => setNewTripData({ ...newTripData, fechaSalida: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tarifa Acordada (Q / Viaje)</label>
                  <input
                    type="number"
                    required
                    value={newTripData.tarifaAcordada}
                    onChange={(e) =>
                      setNewTripData({ ...newTripData, tarifaAcordada: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Initial Scale Inputs */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Boleta Báscula de Carga Inicial</span>
                  <input
                    type="checkbox"
                    checked={newTripData.hasInitialScale}
                    onChange={(e) => setNewTripData({ ...newTripData, hasInitialScale: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </div>

                {newTripData.hasInitialScale && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">No. Boleta</label>
                      <input
                        type="text"
                        value={newTripData.boletaCargaNo}
                        onChange={(e) => setNewTripData({ ...newTripData, boletaCargaNo: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Bruto (kg)</label>
                      <input
                        type="number"
                        value={newTripData.pesoBrutoCarga}
                        onChange={(e) =>
                          setNewTripData({ ...newTripData, pesoBrutoCarga: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Tara (kg)</label>
                      <input
                        type="number"
                        value={newTripData.taraCarga}
                        onChange={(e) =>
                          setNewTripData({ ...newTripData, taraCarga: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                >
                  Crear Viaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
