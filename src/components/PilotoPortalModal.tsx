import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Viaje, BoletaPesaje, GastoRutaPiloto, TipoGastoRuta, EstadoViaje } from '../types';
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
  Fuel,
  Receipt,
  Plus,
  CircleDollarSign,
  Navigation,
  Wrench,
  AlertCircle,
} from 'lucide-react';

interface PilotoPortalModalProps {
  onClose: () => void;
}

export const PilotoPortalModal: React.FC<PilotoPortalModalProps> = ({ onClose }) => {
  const { currentUser, viajes, updateViaje, theme } = useApp();
  const [selectedViaje, setSelectedViaje] = useState<Viaje | null>(null);
  const [viewMode, setViewMode] = useState<'LISTA' | 'PESAJE' | 'GASTOS'>('LISTA');
  const [activeTab, setActiveTab] = useState<'TODOS' | 'EN_CURSO' | 'ENTREGADOS' | 'FINALIZADOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Form for scale entry by pilot
  const [scaleType, setScaleType] = useState<'CARGA' | 'DESCARGA'>('CARGA');
  const [numeroBoleta, setNumeroBoleta] = useState(`B-${Math.floor(10000 + Math.random() * 90000)}`);
  const [pesoBruto, setPesoBruto] = useState(50200);
  const [tara, setTara] = useState(14200);
  const [basculaNombre, setBasculaNombre] = useState('Báscula Muelle Puerto Santo Tomás');

  // Form for route expenses by pilot
  const [showAddGastoForm, setShowAddGastoForm] = useState(false);
  const [tipoGasto, setTipoGasto] = useState<TipoGastoRuta>('Viaticos');
  const [montoGasto, setMontoGasto] = useState<number>(150);
  const [descripcionGasto, setDescripcionGasto] = useState('Viáticos alimentación y hospedaje en muelle');
  const [comprobanteGasto, setComprobanteGasto] = useState('');

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
        ? v.estado === 'En Curso' || v.estado === 'En Ruta' || v.estado === 'Pendiente'
        : activeTab === 'ENTREGADOS'
        ? v.estado === 'Entregado'
        : v.estado === 'Finalizado' || v.estado === 'Facturado';

    const matchesSearch =
      searchTerm.trim() === '' ||
      v.codigoViaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.buqueNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const countEnCurso = misViajes.filter((v) => v.estado === 'En Curso' || v.estado === 'En Ruta' || v.estado === 'Pendiente').length;
  const countEntregados = misViajes.filter((v) => v.estado === 'Entregado').length;
  const countFinalizados = misViajes.filter((v) => v.estado === 'Finalizado' || v.estado === 'Facturado').length;

  const handleOpenPesaje = (viaje: Viaje) => {
    setSelectedViaje(viaje);
    setViewMode('PESAJE');
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

  const handleOpenGastos = (viaje: Viaje) => {
    setSelectedViaje(viaje);
    setViewMode('GASTOS');
    setShowAddGastoForm(false);
  };

  const handleCambiarEstado = (viaje: Viaje, nuevoEstado: EstadoViaje) => {
    const updatePayload: Partial<Viaje> = {
      estado: nuevoEstado,
    };
    if (nuevoEstado === 'Entregado' || nuevoEstado === 'Finalizado') {
      updatePayload.fechaEntrega = new Date().toISOString().replace('T', ' ').slice(0, 16);
    }
    updateViaje(viaje.id, updatePayload);
    setSaveSuccessMessage(`Estado del viaje ${viaje.codigoViaje} actualizado a "${nuevoEstado}"`);
    setTimeout(() => setSaveSuccessMessage(null), 3500);
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
      observaciones: 'Registrado desde portal móvil por el operador de campo',
    };

    if (scaleType === 'CARGA') {
      updateViaje(selectedViaje.id, {
        pesajeCarga: boleta,
        estado: 'En Ruta',
      });
    } else {
      updateViaje(selectedViaje.id, {
        pesajeDescarga: boleta,
        estado: 'Entregado',
        fechaEntrega: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });
    }

    setSaveSuccessMessage(`Pesaje de ${scaleType} registrado con éxito para ${selectedViaje.codigoViaje}`);
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 3500);

    setViewMode('LISTA');
    setSelectedViaje(null);
  };

  const handleAddGasto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedViaje) return;

    const nuevoGasto: GastoRutaPiloto = {
      id: `gst-${Date.now()}`,
      tipo: tipoGasto,
      monto: Number(montoGasto) || 0,
      descripcion: descripcionGasto,
      comprobante: comprobanteGasto || undefined,
      fechaHora: new Date().toISOString().replace('T', ' ').slice(0, 16),
      confirmadoPorPiloto: true,
    };

    const gastosActuales = selectedViaje.gastosRuta || [];
    const gastosActualizados = [...gastosActuales, nuevoGasto];

    updateViaje(selectedViaje.id, {
      gastosRuta: gastosActualizados,
    });

    // Update local selected viaje state
    setSelectedViaje({
      ...selectedViaje,
      gastosRuta: gastosActualizados,
    });

    setSaveSuccessMessage(`Gasto de ${tipoGasto} registrado correctamente (Q${montoGasto})`);
    setTimeout(() => setSaveSuccessMessage(null), 3500);
    setShowAddGastoForm(false);
    setMontoGasto(100);
    setDescripcionGasto('');
    setComprobanteGasto('');
  };

  const handleToggleConfirmGasto = (gastoId: string) => {
    if (!selectedViaje || !selectedViaje.gastosRuta) return;

    const actualizados = selectedViaje.gastosRuta.map((g) =>
      g.id === gastoId ? { ...g, confirmadoPorPiloto: !g.confirmadoPorPiloto } : g
    );

    updateViaje(selectedViaje.id, {
      gastosRuta: actualizados,
    });

    setSelectedViaje({
      ...selectedViaje,
      gastosRuta: actualizados,
    });
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
        className={`w-full max-w-xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col rounded-3xl shadow-2xl border transition-all duration-200 overflow-hidden my-auto ${
          isLight
            ? 'bg-white text-slate-900 border-slate-200 shadow-slate-900/20'
            : 'bg-[#0F172A] text-slate-100 border-[#1E293B] shadow-black/70'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================
            FIXED HEADER (Always visible)
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
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
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
            className={`p-2.5 sm:p-3 rounded-2xl border text-[11px] sm:text-xs flex items-center justify-between gap-2.5 ${
              isLight
                ? 'bg-blue-50 border-blue-200 text-blue-950'
                : 'bg-blue-950/40 border-blue-800/60 text-blue-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <p className="leading-tight">
                <strong>Control de Transporte y Gastos:</strong> Actualice el estado de su flete, confirme viáticos, combustible y básculas en muelle.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            INTERNAL SCROLLABLE BODY
           ======================================================== */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 space-y-3 overscroll-contain">
          {viewMode === 'LISTA' ? (
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
                    En Ruta ({countEnCurso})
                  </button>
                  <button
                    onClick={() => setActiveTab('ENTREGADOS')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                      activeTab === 'ENTREGADOS'
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Entregados ({countEntregados})
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
                    Completos ({countFinalizados})
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
                viajesFiltrados.map((viaje) => {
                  const totalGastosRegistrados = (viaje.gastosRuta || []).reduce((acc, g) => acc + g.monto, 0);

                  return (
                    <div
                      key={viaje.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all space-y-3 ${
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
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                            viaje.estado === 'Finalizado' || viaje.estado === 'Facturado'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                              : viaje.estado === 'Entregado'
                              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30'
                              : viaje.estado === 'En Curso' || viaje.estado === 'En Ruta'
                              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/40 animate-pulse'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {viaje.estado}
                        </span>
                      </div>

                      {/* Middle Row: Vehicle Plate Badge + Material */}
                      <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Góndola:</span>
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

                      <div className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Cliente: <strong className={isLight ? 'text-slate-700' : 'text-slate-300'}>{viaje.clienteNombre}</strong>
                      </div>

                      {/* Scales Status Indicators */}
                      <div
                        className={`grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl border ${
                          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F17] border-[#1E293B]'
                        }`}
                      >
                        <div>
                          <span className={`block text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            1. Carga (Muelle)
                          </span>
                          <span className={`font-mono font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {viaje.pesajeCarga ? `${viaje.pesajeCarga.pesoNetoTon} TM` : '⚠️ Sin registrar'}
                          </span>
                        </div>
                        <div>
                          <span className={`block text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            2. Descarga (Planta)
                          </span>
                          <span className="font-mono font-bold text-xs text-emerald-500">
                            {viaje.pesajeDescarga ? `${viaje.pesajeDescarga.pesoNetoTon} TM` : 'En camino'}
                          </span>
                        </div>
                      </div>

                      {/* PILOT ACTION BAR: Estado + Báscula + Gastos */}
                      <div className="space-y-2 pt-1">
                        {/* Quick Status Setter for Pilot */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Cambiar mi estado:
                          </span>
                          {viaje.estado !== 'En Ruta' && viaje.estado !== 'En Curso' && (
                            <button
                              onClick={() => handleCambiarEstado(viaje, 'En Ruta')}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>En Ruta</span>
                            </button>
                          )}
                          {viaje.estado !== 'Entregado' && (
                            <button
                              onClick={() => handleCambiarEstado(viaje, 'Entregado')}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Marcar Entregado</span>
                            </button>
                          )}
                          {viaje.estado === 'Entregado' && (
                            <button
                              onClick={() => handleCambiarEstado(viaje, 'Finalizado')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Finalizar Flete</span>
                            </button>
                          )}
                        </div>

                        {/* Two Primary Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleOpenPesaje(viaje)}
                            className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer active:scale-[0.99]"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>Pesaje Báscula</span>
                          </button>

                          <button
                            onClick={() => handleOpenGastos(viaje)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] ${
                              isLight
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-amber-700/60'
                            }`}
                          >
                            <CircleDollarSign className="w-3.5 h-3.5 text-amber-500" />
                            <span>
                              Gastos / Viáticos {totalGastosRegistrados > 0 ? `(Q${totalGastosRegistrados})` : ''}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : viewMode === 'GASTOS' && selectedViaje ? (
            /* PILOT ROUTE EXPENSES VIEW (Viáticos, Gasolina, Llantas, etc.) */
            <div className="space-y-4">
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#131B26] border-[#1E293B]'
                }`}
              >
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Control de Gastos y Viáticos de Ruta
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {selectedViaje.codigoViaje}
                    </span>
                    <strong className={`text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {selectedViaje.buqueNombre}
                    </strong>
                    <div className="sigetrad-plate-badge text-[10px] px-1.5 py-0.5 rounded font-mono font-black">
                      {selectedViaje.placa}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setViewMode('LISTA');
                    setSelectedViaje(null);
                  }}
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

              {/* Expense summary card */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-amber-50/80 border-amber-200 text-amber-950' : 'bg-amber-950/20 border-amber-700/60 text-amber-200'
                }`}
              >
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                    Total Gastos del Viaje
                  </span>
                  <span className="text-[11px] opacity-80">
                    Viáticos, combustible, llantas y peajes
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl font-black text-amber-600 dark:text-amber-400">
                    Q{((selectedViaje.gastosRuta || []).reduce((acc, g) => acc + g.monto, 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* List of current expenses for this trip */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Comprobantes y Gastos en Ruta ({selectedViaje.gastosRuta?.length || 0})
                  </span>
                  <button
                    onClick={() => setShowAddGastoForm(!showAddGastoForm)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddGastoForm ? 'Ocultar Formulario' : 'Registrar Nuevo Gasto'}</span>
                  </button>
                </div>

                {/* Add Expense Form */}
                {showAddGastoForm && (
                  <form
                    onSubmit={handleAddGasto}
                    className={`p-3.5 rounded-2xl border space-y-3 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#131B26] border-[#1E293B]'
                    }`}
                  >
                    <h4 className="text-xs font-bold text-blue-500">Nuevo Gasto / Viático de Campo</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          Tipo de Gasto
                        </label>
                        <select
                          value={tipoGasto}
                          onChange={(e) => setTipoGasto(e.target.value as TipoGastoRuta)}
                          className={`w-full px-2.5 py-1.5 rounded-xl border text-xs ${
                            isLight ? 'bg-white border-slate-300' : 'bg-[#0B0F17] border-[#1E293B] text-white'
                          }`}
                        >
                          <option value="Viaticos">🍽️ Viáticos (Comida / Hospedaje)</option>
                          <option value="Combustible">⛽ Combustible (Diésel / Gasolina)</option>
                          <option value="Llantas">🛞 Llantas / Pinchazos</option>
                          <option value="Peajes">🛣️ Peajes / Báscula</option>
                          <option value="Mecanica">🔧 Mecánica de Emergencia</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          Monto en Quetzales (Q)
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          step="0.5"
                          value={montoGasto}
                          onChange={(e) => setMontoGasto(parseFloat(e.target.value) || 0)}
                          className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                            isLight ? 'bg-white border-slate-300' : 'bg-[#0B0F17] border-[#1E293B] text-white'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Descripción / Concepto
                      </label>
                      <input
                        type="text"
                        required
                        value={descripcionGasto}
                        onChange={(e) => setDescripcionGasto(e.target.value)}
                        placeholder="Ej. Almuerzo y cena en muelle Santo Tomás"
                        className={`w-full px-2.5 py-1.5 rounded-xl border text-xs ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#0B0F17] border-[#1E293B] text-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        No. Comprobante / Factura de Gasolinera o Taller (Opcional)
                      </label>
                      <input
                        type="text"
                        value={comprobanteGasto}
                        onChange={(e) => setComprobanteGasto(e.target.value)}
                        placeholder="Ej. Ticket #88412 Gasolinera Shell"
                        className={`w-full px-2.5 py-1.5 rounded-xl border text-xs ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#0B0F17] border-[#1E293B] text-white'
                        }`}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddGastoForm(false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                          isLight ? 'bg-white text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
                      >
                        Guardar Gasto
                      </button>
                    </div>
                  </form>
                )}

                {/* Expense List Items */}
                {(!selectedViaje.gastosRuta || selectedViaje.gastosRuta.length === 0) ? (
                  <div
                    className={`p-6 text-center rounded-2xl border text-xs ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#131B26] border-[#1E293B] text-slate-400'
                    }`}
                  >
                    <p>No se han registrado gastos para este viaje aún.</p>
                    <button
                      onClick={() => setShowAddGastoForm(true)}
                      className="mt-2 text-blue-500 font-bold hover:underline"
                    >
                      + Registrar el primer gasto o viático
                    </button>
                  </div>
                ) : (
                  selectedViaje.gastosRuta.map((g) => (
                    <div
                      key={g.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#131B26] border-[#1E293B]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {g.tipo === 'Viaticos' ? '🍽️ Viáticos' : g.tipo === 'Combustible' ? '⛽ Combustible' : g.tipo === 'Llantas' ? '🛞 Llantas' : g.tipo === 'Peajes' ? '🛣️ Peajes' : '🔧 Mecánica'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {g.fechaHora}
                          </span>
                        </div>
                        <p className={`text-[11px] truncate ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          {g.descripcion}
                        </p>
                        {g.comprobante && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Comprobante: {g.comprobante}
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                          Q{g.monto.toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleToggleConfirmGasto(g.id)}
                          className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                            g.confirmadoPorPiloto
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {g.confirmadoPorPiloto ? '✓ Confirmado' : 'Pendiente Confirmar'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : viewMode === 'PESAJE' && selectedViaje ? (
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
                    Registro de Báscula en Muelle
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
                  onClick={() => {
                    setViewMode('LISTA');
                    setSelectedViaje(null);
                  }}
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
                    onClick={() => {
                      setViewMode('LISTA');
                      setSelectedViaje(null);
                    }}
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
          ) : null}
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