import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Viaje, BoletaPesaje } from '../types';
import {
  Smartphone,
  Truck,
  Scale,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  X,
  Search,
  ArrowLeft,
  Filter,
  Check,
} from 'lucide-react';

interface PilotoPortalModalProps {
  onClose: () => void;
}

export const PilotoPortalModal: React.FC<PilotoPortalModalProps> = ({ onClose }) => {
  const { currentUser, viajes, updateViaje, theme } = useApp();
  const [selectedViaje, setSelectedViaje] = useState<Viaje | null>(null);
  const [activeTab, setActiveTab] = useState<'TODOS' | 'EN_CURSO' | 'FINALIZADOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Form for scale entry by pilot
  const [scaleType, setScaleType] = useState<'CARGA' | 'DESCARGA'>('CARGA');
  const [numeroBoleta, setNumeroBoleta] = useState(`B-${Math.floor(10000 + Math.random() * 90000)}`);
  const [pesoBruto, setPesoBruto] = useState(50200);
  const [tara, setTara] = useState(14200);
  const [basculaNombre, setBasculaNombre] = useState('Báscula Muelle Puerto Santo Tomás');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter trips for this pilot (or all trips if admin/supervisor testing)
  const misViajes = viajes.filter((v) =>
    currentUser.rol === 'PILOTO' ? v.pilotoId === currentUser.id : true
  );

  const viajesFiltrados = misViajes.filter((v) => {
    const matchesTab =
      activeTab === 'TODOS'
        ? true
        : activeTab === 'EN_CURSO'
        ? v.estado === 'En Curso' || v.estado === 'Pendiente'
        : v.estado === 'Finalizado';

    const matchesSearch =
      searchTerm.trim() === '' ||
      v.codigoViaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.buqueNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const countEnCurso = misViajes.filter((v) => v.estado === 'En Curso' || v.estado === 'Pendiente').length;
  const countFinalizados = misViajes.filter((v) => v.estado === 'Finalizado').length;

  const handleOpenPesaje = (viaje: Viaje) => {
    setSelectedViaje(viaje);
    // Pre-select mode based on what's already filled
    if (viaje.pesajeCarga && !viaje.pesajeDescarga) {
      setScaleType('DESCARGA');
      setBasculaNombre('Báscula Destino Silos / Planta');
      setNumeroBoleta(`B-${Math.floor(10000 + Math.random() * 90000)}`);
      setPesoBruto(viaje.pesajeCarga.pesoBrutoKg || 50200);
      setTara(viaje.pesajeCarga.taraKg || 14200);
    } else {
      setScaleType('CARGA');
      setBasculaNombre('Báscula Muelle Puerto Santo Tomás');
      setNumeroBoleta(viaje.pesajeCarga?.numeroBoleta || `B-${Math.floor(10000 + Math.random() * 90000)}`);
      setPesoBruto(viaje.pesajeCarga?.pesoBrutoKg || 50200);
      setTara(viaje.pesajeCarga?.taraKg || 14200);
    }
  };

  const handleSaveBoleta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedViaje) return;

    const netoKg = Math.max(0, pesoBruto - tara);
    const boleta: BoletaPesaje = {
      numeroBoleta,
      pesoBrutoKg: pesoBruto,
      taraKg: tara,
      pesoNetoKg: netoKg,
      pesoNetoTon: parseFloat((netoKg / 1000).toFixed(2)),
      fechaHora: new Date().toISOString().replace('T', ' ').slice(0, 16),
      basculaNombre,
      observaciones: 'Registrado desde portal móvil por el operador',
    };

    if (scaleType === 'CARGA') {
      updateViaje(selectedViaje.id, {
        pesajeCarga: boleta,
        estado: 'En Curso',
      });
    } else {
      updateViaje(selectedViaje.id, {
        pesajeDescarga: boleta,
        estado: 'Finalizado',
        fechaEntrega: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });
    }

    setSaveSuccessMessage(`Pesaje de ${scaleType} registrado con éxito para ${selectedViaje.codigoViaje}`);
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 3500);

    setSelectedViaje(null);
  };

  const isLight = theme === 'light';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col rounded-3xl shadow-2xl border transition-all duration-200 overflow-hidden my-auto ${
          isLight
            ? 'bg-white text-slate-900 border-slate-200 shadow-slate-900/20'
            : 'bg-[#0F172A] text-slate-100 border-[#1E293B] shadow-black/70'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================
            FIXED HEADER (Always visible, never clipped)
           ======================================================== */}
        <div
          className={`shrink-0 px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-3 ${
            isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-[#131B26] border-[#1E293B]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-600/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className={`text-sm sm:text-base font-extrabold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Portal Móvil del Piloto
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Campo
                </span>
              </div>
              <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {currentUser.nombre} • <span className="text-blue-500 font-semibold">Transportes Dannas</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0 ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Cerrar ventana (Esc)"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================
            SUCCESS ALERT NOTIFICATION (If just saved)
           ======================================================== */}
        {saveSuccessMessage && (
          <div className="shrink-0 px-4 sm:px-6 pt-3">
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{saveSuccessMessage}</span>
            </div>
          </div>
        )}

        {/* ========================================================
            INFO BANNER (Contextual notice)
           ======================================================== */}
        <div className="shrink-0 px-4 sm:px-6 pt-3 pb-1">
          <div
            className={`p-2.5 sm:p-3 rounded-2xl border text-[11px] sm:text-xs flex items-center gap-2.5 ${
              isLight
                ? 'bg-blue-50 border-blue-200 text-blue-950'
                : 'bg-blue-950/40 border-blue-800/60 text-blue-200'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <p className="leading-tight">
              <strong>Terminal de Muelle y Destino:</strong> Registre y confirme boletas de báscula en tiempo real para sus viajes asignados.
            </p>
          </div>
        </div>

        {/* ========================================================
            INTERNAL SCROLLABLE BODY (Scrolls cleanly inside dialog)
           ======================================================== */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 space-y-3 overscroll-contain">
          {!selectedViaje ? (
            /* TRIPS LIST VIEW */
            <div className="space-y-3">
              {/* Filter Tabs and Search Bar */}
              <div className="space-y-2">
                <div
                  className={`p-1 rounded-xl border flex items-center gap-1 text-xs font-semibold ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#131B26] border-[#1E293B]'
                  }`}
                >
                  <button
                    onClick={() => setActiveTab('TODOS')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                      activeTab === 'TODOS'
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos ({misViajes.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('EN_CURSO')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                      activeTab === 'EN_CURSO'
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    En Curso ({countEnCurso})
                  </button>
                  <button
                    onClick={() => setActiveTab('FINALIZADOS')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                      activeTab === 'FINALIZADOS'
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Completados ({countFinalizados})
                  </button>
                </div>

                {/* Quick Search */}
                {misViajes.length > 2 && (
                  <div className="relative">
                    <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por placa, viaje o buque..."
                      className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs transition-colors ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500'
                          : 'bg-[#131B26] border-[#1E293B] text-slate-200 placeholder-slate-500 focus:border-blue-500'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Trip Cards */}
              {viajesFiltrados.length === 0 ? (
                <div
                  className={`p-8 text-center rounded-2xl border ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#131B26] border-[#1E293B] text-slate-400'
                  }`}
                >
                  <p className="text-xs font-medium">No se encontraron viajes con este filtro.</p>
                </div>
              ) : (
                viajesFiltrados.map((viaje) => (
                  <div
                    key={viaje.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      isLight
                        ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800 shadow-xs'
                        : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] text-slate-200 shadow-sm'
                    }`}
                  >
                    {/* Top Row: Code + Vessel + Status Badge */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/40 dark:border-slate-800/60">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-500 dark:text-blue-300 border border-blue-500/30 shrink-0">
                          {viaje.codigoViaje}
                        </span>
                        <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {viaje.buqueNombre}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          viaje.estado === 'Finalizado'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                            : viaje.estado === 'En Curso'
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/40 animate-pulse'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {viaje.estado}
                      </span>
                    </div>

                    {/* Middle Row: Vehicle Plate Badge + Material */}
                    <div className="py-2.5 flex items-center justify-between gap-2 text-xs flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Placa:</span>
                        <div className="sigetrad-plate-badge text-xs px-2 py-0.5 rounded font-mono font-black shadow-xs">
                          <span className="text-[9px] text-blue-600 font-extrabold mr-1">GT</span>
                          {viaje.placa}
                        </div>
                      </div>

                      <div className="text-right min-w-0">
                        <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Material: </span>
                        <strong className={isLight ? 'text-slate-900' : 'text-white'}>{viaje.material}</strong>
                      </div>
                    </div>

                    <div className={`text-[11px] truncate pb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Cliente: <strong className={isLight ? 'text-slate-700' : 'text-slate-300'}>{viaje.clienteNombre}</strong>
                    </div>

                    {/* Scales Status Indicators */}
                    <div
                      className={`grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl border mb-3 ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F17] border-[#1E293B]'
                      }`}
                    >
                      <div>
                        <span className={`block text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          1. Báscula Carga
                        </span>
                        <span className={`font-mono font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {viaje.pesajeCarga ? `${viaje.pesajeCarga.pesoNetoTon} TM` : '⚠️ Sin registrar'}
                        </span>
                      </div>
                      <div>
                        <span className={`block text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          2. Báscula Descarga
                        </span>
                        <span className="font-mono font-bold text-xs text-emerald-500">
                          {viaje.pesajeDescarga ? `${viaje.pesajeDescarga.pesoNetoTon} TM` : 'En camino'}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleOpenPesaje(viaje)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 cursor-pointer active:scale-[0.99]"
                    >
                      <Scale className="w-4 h-4" />
                      <span>
                        {viaje.pesajeCarga && !viaje.pesajeDescarga
                          ? 'Registrar Descarga Final'
                          : viaje.pesajeDescarga
                          ? 'Modificar Pesajes de Báscula'
                          : 'Registrar Pesaje de Báscula'}
                      </span>
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* SCALE REGISTRATION FORM VIEW */
            <div className="space-y-4">
              {/* Back button & Selected Trip Header */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#131B26] border-[#1E293B]'
                }`}
              >
                <div className="min-w-0">
                  <span className={`text-[10px] uppercase font-bold tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Viaje Seleccionado
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {selectedViaje.codigoViaje}
                    </span>
                    <strong className={`text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {selectedViaje.buqueNombre}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="sigetrad-plate-badge text-[11px] px-2 py-0.5 rounded font-mono font-black">
                      <span className="text-[9px] text-blue-600 font-extrabold mr-1">GT</span>
                      {selectedViaje.placa}
                    </div>
                    <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      • {selectedViaje.material}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedViaje(null)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver</span>
                </button>
              </div>

              {/* Scale Ticket Form */}
              <form onSubmit={handleSaveBoleta} className="space-y-3.5 text-xs">
                {/* Scale Step Selector */}
                <div>
                  <label className={`block font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Momento del Pesaje
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setScaleType('CARGA');
                        setBasculaNombre('Báscula Muelle Puerto Santo Tomás');
                      }}
                      className={`py-2.5 px-3 rounded-xl font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                        scaleType === 'CARGA'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/30'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                          : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] text-slate-400'
                      }`}
                    >
                      <span>1. Carga (Muelle)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScaleType('DESCARGA');
                        setBasculaNombre('Báscula Destino Silos / Planta');
                      }}
                      className={`py-2.5 px-3 rounded-xl font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                        scaleType === 'DESCARGA'
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                          : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] text-slate-400'
                      }`}
                    >
                      <span>2. Descarga (Planta)</span>
                    </button>
                  </div>
                </div>

                {/* Ticket Number */}
                <div>
                  <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Número de Boleta de Báscula
                  </label>
                  <input
                    type="text"
                    required
                    value={numeroBoleta}
                    onChange={(e) => setNumeroBoleta(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold text-xs transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500'
                        : 'bg-[#131B26] border-[#1E293B] text-white focus:border-blue-500'
                    }`}
                    placeholder="Ej. B-88190"
                  />
                </div>

                {/* Weights: Gross & Tare */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Peso Bruto (kg)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="10"
                      value={pesoBruto}
                      onChange={(e) => setPesoBruto(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold text-sm transition-colors ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500'
                          : 'bg-[#131B26] border-[#1E293B] text-white focus:border-blue-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Tara Cabezal/Góndola (kg)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="10"
                      value={tara}
                      onChange={(e) => setTara(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold text-sm transition-colors ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500'
                          : 'bg-[#131B26] border-[#1E293B] text-white focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Auto Calculated Net Weight in Toneladas */}
                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    isLight
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                  }`}
                >
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                      Peso Neto Calculado
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {Math.max(0, pesoBruto - tara).toLocaleString()} kg
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {(Math.max(0, pesoBruto - tara) / 1000).toFixed(2)} TM
                    </span>
                    <span className="block text-[10px] text-slate-400">Toneladas Métricas</span>
                  </div>
                </div>

                {/* Scale Station Name */}
                <div>
                  <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Nombre de la Báscula
                  </label>
                  <input
                    type="text"
                    required
                    value={basculaNombre}
                    onChange={(e) => setBasculaNombre(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500'
                        : 'bg-[#131B26] border-[#1E293B] text-white focus:border-blue-500'
                    }`}
                    placeholder="Ej. Báscula Muelle Puerto Santo Tomás"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedViaje(null)}
                    className={`w-1/3 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    Guardar y Confirmar Pesaje
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ========================================================
            FIXED MODAL FOOTER (Quick status & close)
           ======================================================== */}
        <div
          className={`shrink-0 px-4 sm:px-6 py-2.5 border-t flex items-center justify-between text-xs ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#131B26] border-[#1E293B] text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-medium">Sincronizado con SIGETRAD</span>
          </div>

          <button
            onClick={onClose}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};