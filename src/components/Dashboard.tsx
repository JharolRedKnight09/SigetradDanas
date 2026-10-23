import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Ship,
  Receipt,
  Wallet,
  Fuel,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  FileSpreadsheet,
  Download,
  Plus,
  Scale,
  Calendar,
  Layers,
  ChevronRight,
  Building2,
  TrendingUp,
  FileCheck2,
  CreditCard,
  Sun,
  Moon,
  Smartphone,
  ShieldCheck,
  MapPin,
  FileText,
} from 'lucide-react';
import { exportViajesToExcel } from '../utils/excelExport';
import { exportViajePDF } from '../utils/pdfExport';
import { ModuleTab } from './Sidebar';

interface DashboardProps {
  onNavigate: (tab: ModuleTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    viajes,
    facturas,
    pagos,
    registrosCombustible,
    instruccionesCobro,
    propietarios,
    pilotos,
    gondolas,
    theme,
    toggleTheme,
  } = useApp();

  const isOperador = currentUser.rol === 'OPERADOR' || currentUser.rol === 'PILOTO';
  const isSupervisor = currentUser.rol === 'SUPERVISOR';
  const isAdmin = currentUser.rol === 'ADMIN' || currentUser.rol === 'DUENO';

  // Filtro de viajes para operador
  const misViajes = isOperador
    ? viajes.filter(
        (v) =>
          (currentUser.pilotoId && v.pilotoId === currentUser.pilotoId) ||
          (v.pilotoNombre && v.pilotoNombre.toLowerCase().includes(currentUser.nombre.toLowerCase())) ||
          (currentUser.nombre && currentUser.nombre.toLowerCase().includes(v.pilotoNombre.toLowerCase()))
      )
    : viajes;

  const viajesOperadorAMostrar = isOperador && misViajes.length > 0 ? misViajes : viajes;

  // Operational metrics
  const totalViajes = viajes.length;
  const viajesActivos = viajes.filter((v) => v.estado === 'En Curso');
  const viajesPendientes = viajes.filter((v) => v.estado === 'Pendiente');
  const viajesFinalizados = viajes.filter((v) => v.estado === 'Finalizado' || v.estado === 'Facturado');

  // Metricas especificas del operador
  const opViajesActivos = viajesOperadorAMostrar.filter((v) => v.estado === 'En Curso');
  const opViajesFinalizados = viajesOperadorAMostrar.filter((v) => v.estado === 'Finalizado' || v.estado === 'Facturado');
  const opBasculasCompletadas = viajesOperadorAMostrar.filter((v) => v.pesajeCarga && v.pesajeDescarga).length;
  const opToneladas = viajesOperadorAMostrar.reduce((acc, v) => acc + (v.pesajeDescarga?.pesoNetoTon || v.pesajeCarga?.pesoNetoTon || 0), 0);

  // Financial & Tax metrics (solo para administradores)
  const facturasEmitidas = facturas.filter((f) => f.estadoPago === 'Emitida');
  const totalFacturadoBruto = facturas.reduce((acc, f) => acc + f.montoBruto, 0);
  const totalNetoDepositado = pagos.reduce((acc, p) => acc + p.montoNetoDepositado, 0);
  const totalRetencionesIsr = pagos.reduce((acc, p) => acc + p.retencionIsrAplicada, 0);
  const totalRetencionesIva = pagos.reduce((acc, p) => acc + p.retencionIvaAplicada, 0);
  const totalRetenciones = totalRetencionesIsr + totalRetencionesIva;
  const saldoPendienteCobro = facturasEmitidas.reduce(
    (acc, f) => acc + (f.esAgenteRetenedor ? f.netoEsperado : f.montoBruto),
    0
  );

  // Supervisor metrics
  const gondolasEnRuta = gondolas.filter((g) => g.estado === 'En Ruta').length;
  const basculasPendientes = viajes.filter((v) => !v.pesajeDescarga).length;
  const totalTonCarga = viajes.reduce((acc, v) => acc + (v.pesajeCarga?.pesoNetoTon || 0), 0);
  const totalTonDescarga = viajes.reduce((acc, v) => acc + (v.pesajeDescarga?.pesoNetoTon || 0), 0);

  // Fuel metrics
  const totalGastoCombustible = registrosCombustible.reduce((acc, r) => acc + r.totalGasto, 0);

  const isLight = theme === 'light';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Adaptativo por Rol */}
      <div
        className={`border rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative overflow-hidden transition-all ${
          isLight
            ? 'bg-gradient-to-r from-blue-50 via-sky-50/50 to-white border-blue-200/80 text-slate-800 shadow-md shadow-blue-500/5'
            : 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-slate-800/90 text-white'
        }`}
      >
        <div
          className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
            isLight ? 'bg-blue-400/10' : 'bg-blue-600/10'
          }`}
        />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono shadow-xs border ${
                isOperador
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300'
                  : isSupervisor
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/60 dark:text-blue-300'
              }`}
            >
              {isOperador
                ? 'Terminal de Conductor • Carga Pesada'
                : isSupervisor
                ? 'Supervisión de Muelle • Puerto Quetzal'
                : 'Terminal Central Escuintla y Puerto Quetzal'}
            </span>
            <span className={isLight ? 'text-slate-400' : 'text-slate-600'}>•</span>
            <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Empresa: <strong className={isLight ? 'text-slate-900' : 'text-white'}>Transportes y Servicios Dannas, S.A.</strong>
            </span>
          </div>

          <h1
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {isOperador
              ? `Consola de Conductor • ${currentUser.nombre}`
              : isSupervisor
              ? 'Consola de Supervisión Operativa • Puerto y Muelle'
              : 'Tablero de Control Ejecutivo • SIGETRAD'}
          </h1>
          <p
            className={`text-xs sm:text-sm leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            {isOperador
              ? `Bienvenido a su terminal de viajes asignados. Aquí puede consultar sus despachos en ruta y capturar las boletas de báscula en muelle puerto y silos. Cargo: ${currentUser.cargo || 'Chofer de Góndola'}.`
              : isSupervisor
              ? 'Panel de control de operaciones portuarias: coordinación de pilotos, validación de boletas de báscula en muelle y seguimiento de tonelaje movilizado.'
              : 'Consolidado operativo y financiero en tiempo real: control de viajes por buque, báscula en muelle, liquidaciones bancarias a cuentas de los tres hermanos y retenciones tributarias SAT.'}
          </p>
        </div>

        {/* Action Buttons Adaptativos */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <button
            onClick={() => onNavigate('viajes')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>{isOperador ? 'Ver Mis Básculas' : 'Operaciones y Básculas'}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => onNavigate('facturacion')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
              }`}
            >
              <Receipt className="w-4 h-4 text-amber-500" />
              <span>Cobros WhatsApp ({instruccionesCobro.filter((i) => !i.procesada).length})</span>
            </button>
          )}

          {!isOperador && (
            <button
              onClick={() => exportViajesToExcel(viajes)}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
              }`}
              title="Exportar archivo idéntico a las pestañas del Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel Maestro</span>
            </button>
          )}

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
              !isLight
                ? 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border-blue-500/30'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
            }`}
            title={!isLight ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            {!isLight ? (
              <>
                <Sun className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline">Modo Oscuro</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Grid Adaptativo por Rol */}
      {isOperador ? (
        /* RAMA OPERADOR / CONDUCTOR */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`rounded-2xl p-5 border transition-all relative overflow-hidden border-t-2 border-t-[#2563EB] space-y-3 ${
              isLight
                ? 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Mis Viajes Asignados
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center border border-blue-500/30 shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className={`text-2xl font-black font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {viajesOperadorAMostrar.length} viajes
              </div>
              <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {opViajesFinalizados.length} completados con entrega
              </div>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Estado:</span>
              <span className="font-bold text-emerald-500">Piloto Habilitado</span>
            </div>
          </div>

          <div
            className={`rounded-2xl p-5 border transition-all relative overflow-hidden border-t-2 border-t-[#0EA5E9] space-y-3 ${
              isLight
                ? 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                En Ruta / Tránsito
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#0EA5E9]/15 text-[#0EA5E9] flex items-center justify-center border border-[#0EA5E9]/30 shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#0EA5E9] font-mono tracking-tight">
                {opViajesActivos.length} activos
              </div>
              <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Viajes en muelle o en carretera
              </div>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Pendientes de salida:</span>
              <span className="font-bold font-mono">{viajesOperadorAMostrar.filter((v) => v.estado === 'Pendiente').length}</span>
            </div>
          </div>

          <div
            className={`rounded-2xl p-5 border transition-all relative overflow-hidden border-t-2 border-t-[#10B981] space-y-3 ${
              isLight
                ? 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Básculas Completadas
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-[#10B981]/30 shadow-xs">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#10B981] font-mono tracking-tight">
                {opBasculasCompletadas} boletas
              </div>
              <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Pesaje en Puerto y Silos validado
              </div>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Pendientes:</span>
              <span className="font-bold text-amber-500 font-mono">
                {viajesOperadorAMostrar.length - opBasculasCompletadas}
              </span>
            </div>
          </div>

          <div
            className={`rounded-2xl p-5 border transition-all relative overflow-hidden border-t-2 border-t-[#F59E0B] space-y-3 ${
              isLight
                ? 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Toneladas Movilizadas
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30 shadow-xs">
                <Ship className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className={`text-2xl font-black font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {opToneladas.toLocaleString('es-GT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} TM
              </div>
              <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Carga granel agrícola y mineral
              </div>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Capacidad góndola:</span>
              <span className="font-bold font-mono">38.00 TM</span>
            </div>
          </div>
        </div>
      ) : isSupervisor ? (
        /* RAMA SUPERVISOR */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`rounded-2xl p-5 border transition-all relative overflow-hidden border-t-2 border-t-[#2563EB] space-y-3 ${
              isLight
                ? 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Viajes Activos en Muelle
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center border border-blue-500/30 shadow-xs">
                <Ship className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#2563EB] font-mono tracking-tight">
                {viajesActivos.length} despachos
              </div>
              <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Total programados: {totalViajes}
              </div>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Finalizados:</span>
              <span className="font-bold text-emerald-500 font-mono">{viajesFinalizados.length}</span>
            </div>
          </div>

          <div
            className={`rounded-2xl p-5 border transition-all relative overflow-hidden border-t-2 border-t-[#0EA5E9] space-y-3 ${
              isLight
                ? 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Flota de Góndolas en Ruta
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#0EA5E9]/15 text-[#0EA5E9] flex items-center justify-center border border-[#0EA5E9]/30 shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#0EA5E9] font-mono tracking-tight">
                {gondolasEnRuta} unidades
              </div>
              <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Flota total: {gondolas.length} triaxiales
              </div>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Disponibles:</span>
              <span className="font-bold text-emerald-500 font-mono">{gondolas.filter((g) => g.estado === 'Disponible').length}</span>
            </div>
          </div>

          <div
            className={`rounded-2xl p-5 border transition-all relative overflow-hidden border-t-2 border-t-[#10B981] space-y-3 ${
              isLight
                ? 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Toneladas en Muelle Puerto
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-[#10B981]/30 shadow-xs">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#10B981] font-mono tracking-tight">
                {totalTonCarga.toLocaleString('es-GT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} TM
              </div>
              <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Descargado silos: {totalTonDescarga.toFixed(1)} TM
              </div>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Diferencial báscula:</span>
              <span className="font-bold font-mono text-slate-600 dark:text-slate-300">
                {(totalTonCarga - totalTonDescarga).toFixed(1)} TM
              </span>
            </div>
          </div>

          <div
            className={`rounded-2xl p-5 border transition-all relative overflow-hidden border-t-2 border-t-[#F59E0B] space-y-3 ${
              isLight
                ? 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Básculas Pendientes Cierre
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30 shadow-xs">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-500 font-mono tracking-tight">
                {basculasPendientes} por registrar
              </div>
              <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Requieren boleta de pesaje destino
              </div>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Pilotos en turno:</span>
              <span className="font-bold font-mono">{pilotos.filter((p) => p.estado === 'En Viaje').length}</span>
            </div>
          </div>
        </div>
      ) : (
        /* RAMA ADMINISTRADOR / GERENCIA */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Facturación Bruta */}
          <div
            className={`rounded-2xl p-5 border transition-all relative overflow-hidden border-t-2 border-t-[#2563EB] space-y-3 ${
              isLight
                ? 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Monto Facturado Bruto
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center border border-blue-500/30 shadow-xs">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className={`text-2xl font-black font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Q {totalFacturadoBruto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-xs mt-1 flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{facturas.length} facturas emitidas</span>
              </div>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Pendiente de cobro:</span>
              <span className="font-bold text-[#2563EB] font-mono">
                Q {saldoPendienteCobro.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* KPI 2: Retenciones SAT de Ley */}
          <div
            className={`rounded-2xl p-5 border transition-all relative overflow-hidden border-t-2 border-t-[#EF4444] space-y-3 ${
              isLight
                ? 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Retenciones SAT de Ley
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center border border-[#EF4444]/30 shadow-xs">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#EF4444] font-mono tracking-tight">
                Q {totalRetenciones.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-xs mt-1 flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>ISR (5%): <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>Q {totalRetencionesIsr.toLocaleString('es-GT', { minimumFractionDigits: 0 })}</strong></span>
                <span>•</span>
                <span>IVA: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>Q {totalRetencionesIva.toLocaleString('es-GT', { minimumFractionDigits: 0 })}</strong></span>
              </div>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Estado fiscal:</span>
              <span className="font-bold text-[#10B981]">Constancias Aplicadas</span>
            </div>
          </div>

          {/* KPI 3: Neto Conciliado a Cuentas */}
          <div
            className={`rounded-2xl p-5 border transition-all relative overflow-hidden border-t-2 border-t-[#10B981] space-y-3 ${
              isLight
                ? 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Liquidado en Cuentas Bancarias
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-[#10B981]/30 shadow-xs">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#10B981] font-mono tracking-tight">
                Q {totalNetoDepositado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Repartido a los 3 Hermanos Dannas
              </div>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Bancos destino:</span>
              <span className={`font-semibold font-mono text-[10px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Banrural • BI • G&T</span>
            </div>
          </div>

          {/* KPI 4: Flota en Operación */}
          <div
            className={`rounded-2xl p-5 border transition-all relative overflow-hidden border-t-2 border-t-[#0EA5E9] space-y-3 ${
              isLight
                ? 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] hover:bg-[#1A2433] border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Flota en Operación
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#0EA5E9]/15 text-[#0EA5E9] flex items-center justify-center border border-[#0EA5E9]/30 shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className={`text-2xl font-black font-mono tracking-tight flex items-baseline gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span>{viajesActivos.length}</span>
                <span className={`text-xs font-sans font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>en ruta</span>
              </div>
              <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {viajesFinalizados.length} entregados • Total: {totalViajes}
              </div>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Consumo diésel:</span>
              <span className={`font-bold font-mono ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                Q {totalGastoCombustible.toLocaleString('es-GT', { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Split: Operations por Buque + Financial Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Movement Tabs + Recent Trips Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Movement Categories (Excel Tabs replication) */}
          <div
            className={`rounded-2xl border p-5 space-y-4 ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] border-[#1E293B] shadow-[0_4px_24px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${
              isLight ? 'border-slate-100' : 'border-[#1E293B]'
            }`}>
              <div>
                <h2 className={`text-sm font-bold flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <Layers className="w-4 h-4 text-[#2563EB]" />
                  Pestañas Operativas del Maestro (Categorías de Transporte)
                </h2>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Mapeo exacto de las pestañas del Excel: Buques, Barrios, Carbón, Clinkers, Mi Guate, Palo Gordo.
                </p>
              </div>
              <button
                onClick={() => onNavigate('viajes')}
                className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Ver Módulo Completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tab Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Buques', sub: 'Sofía y Sakura', count: viajes.filter((v) => v.categoriaMovimiento === 'Buques').length, tag: 'Descarga Puerto' },
                { name: 'Barrios', sub: 'Puerto y Silos', count: viajes.filter((v) => v.categoriaMovimiento === 'Barrios').length, tag: 'Granel Agrícola' },
                { name: 'Carbón', sub: 'Local y Largo', count: viajes.filter((v) => v.categoriaMovimiento === 'Carbón').length, tag: 'Combustible Mineral' },
                { name: 'Clinkers', sub: 'Muelle Cemento', count: viajes.filter((v) => v.categoriaMovimiento === 'Clinkers').length, tag: 'Materia Prima' },
                { name: 'Mi Guate', sub: 'Planta Cemento', count: viajes.filter((v) => v.categoriaMovimiento === 'Mi Guate').length, tag: 'Ruta Nacional' },
                { name: 'Palo Gordo', sub: 'Ingenio Azucarero', count: viajes.filter((v) => v.categoriaMovimiento === 'Palo Gordo').length, tag: 'Agroindustria' },
              ].map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => onNavigate('viajes')}
                  className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer group ${
                    isLight
                      ? 'bg-slate-50 hover:bg-blue-50/50 border-slate-200 hover:border-blue-400 shadow-2xs'
                      : 'bg-[#1A2433] hover:bg-[#222F42] border-[#1E293B] hover:border-blue-500/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-xs group-hover:text-[#2563EB] transition-colors ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {cat.name}
                    </span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                      isLight
                        ? 'bg-white text-slate-600 border-slate-200'
                        : 'bg-[#131B26] text-slate-400 border-[#1E293B]'
                    }`}>
                      {cat.tag}
                    </span>
                  </div>
                  <div className={`text-[11px] mt-0.5 truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{cat.sub}</div>
                  <div className="mt-2 text-base font-black text-[#2563EB] font-mono">
                    {cat.count} <span className={`text-[10px] font-normal font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>viajes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trips Table with Scales and PDF Export */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm text-slate-800'
                : 'bg-[#131B26] border-[#1E293B] shadow-[0_4px_24px_rgba(0,0,0,0.5)] text-white'
            }`}
          >
            <div className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isLight ? 'border-slate-100' : 'border-[#1E293B]'
            }`}>
              <div>
                <h2 className={`text-sm font-bold flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <Scale className="w-4 h-4 text-[#2563EB]" />
                  Últimos Despachos y Registro de Básculas Portuarias
                </h2>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Control de pesaje en muelle (Carga) versus báscula en silos de cliente (Descarga).
                </p>
              </div>
              <button
                onClick={() => onNavigate('viajes')}
                className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Ver todos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className={`w-full text-left text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <thead className={`font-semibold border-b ${
                  isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-[#0B0F17] text-slate-400 border-[#1E293B]'
                }`}>
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Buque y Categoría</th>
                    <th className="px-4 py-3">Material</th>
                    <th className="px-4 py-3">Góndola / Piloto</th>
                    <th className="px-4 py-3">Báscula Origen</th>
                    <th className="px-4 py-3">Báscula Destino</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Comprobante</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1E293B]'}`}>
                  {viajes.slice(0, 5).map((viaje) => (
                    <tr
                      key={viaje.id}
                      className={`transition-colors ${
                        isLight ? 'hover:bg-slate-50/80' : 'hover:bg-[#1A2433]'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#2563EB]">
                        {viaje.codigoViaje}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{viaje.buqueNombre}</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{viaje.categoriaMovimiento}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          isLight
                            ? 'bg-slate-100 text-slate-800 border-slate-200'
                            : 'bg-[#1A2433] text-slate-200 border-[#1E293B]'
                        }`}>
                          {viaje.material}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{viaje.placa}</div>
                        <div className={`text-[11px] truncate max-w-[120px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {viaje.pilotoNombre}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {viaje.pesajeCarga ? (
                          <div>
                            <span className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {viaje.pesajeCarga.pesoNetoTon} MT
                            </span>
                            <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              Bol. #{viaje.pesajeCarga.numeroBoleta}
                            </div>
                          </div>
                        ) : (
                          <span className="text-amber-500 font-semibold italic text-[11px]">Pendiente</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {viaje.pesajeDescarga ? (
                          <div>
                            <span className="font-bold text-[#10B981] font-mono">
                              {viaje.pesajeDescarga.pesoNetoTon} MT
                            </span>
                            <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              Bol. #{viaje.pesajeDescarga.numeroBoleta}
                            </div>
                          </div>
                        ) : (
                          <span className={`${isLight ? 'text-slate-400' : 'text-slate-500'} italic text-[11px]`}>En ruta</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            viaje.estado === 'Finalizado' || viaje.estado === 'Facturado'
                              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                              : viaje.estado === 'En Curso'
                              ? 'bg-[#0EA5E9]/15 text-[#0EA5E9] border-[#0EA5E9]/30'
                              : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                          }`}
                        >
                          {viaje.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => exportViajePDF(viaje)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border cursor-pointer ${
                            isLight
                              ? 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-200 hover:text-blue-600'
                              : 'text-slate-200 bg-[#1A2433] hover:bg-[#222F42] border-[#1E293B] hover:text-[#38BDF8]'
                          }`}
                          title="Descargar Comprobante Oficial PDF"
                        >
                          <Download className="w-3 h-3 text-[#2563EB]" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Rol-specific information */}
        <div className="lg:col-span-4 space-y-6">
          {isOperador ? (
            /* Tarjeta para Operador / Conductor */
            <div
              className={`rounded-2xl border p-5 space-y-4 ${
                isLight
                  ? 'bg-white border-slate-200 shadow-sm text-slate-800'
                  : 'bg-[#131B26] border-[#1E293B] shadow-[0_4px_24px_rgba(0,0,0,0.5)] text-white'
              }`}
            >
              <div className={`border-b pb-3 ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
                <h2 className={`text-sm font-bold flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <Truck className="w-4 h-4 text-[#2563EB]" />
                  Mi Unidad y Turno de Operación
                </h2>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Información técnica y asignaciones del conductor en ruta.
                </p>
              </div>

              <div className="space-y-3">
                <div
                  className={`p-3.5 rounded-xl border space-y-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1A2433] border-[#1E293B]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{currentUser.nombre}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                      Conductor Activo
                    </span>
                  </div>
                  <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Cargo: {currentUser.cargo || 'Operador de Góndola Dannas'}
                  </div>
                  <div className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Celular: {currentUser.telefono || '+502 5500-0000'}
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    isLight ? 'bg-blue-50/70 border-blue-200 text-blue-950' : 'bg-[#1A2433] border-blue-500/30 text-blue-200'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-xs text-[#2563EB]">
                    <Scale className="w-4 h-4" />
                    <span>Protocolo de Básculas Portuarias</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    1. Al cargar en muelle o barco, registre el peso bruto y tara en báscula puerto.<br />
                    2. Al descargar en silos de destino, registre el peso neto y adjunte foto de boleta.
                  </p>
                </div>

                <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#0D131C] border-[#1E293B] text-slate-400'
                }`}>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">
                    Asistencia y Despacho Dannas:
                  </span>
                  <p>Escuintla Central: +502 5521-8900 • Muelle Puerto Quetzal</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('viajes')}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors text-center cursor-pointer shadow-md"
              >
                Abrir Mis Básculas y Boletas
              </button>
            </div>
          ) : isSupervisor ? (
            /* Tarjeta para Supervisor */
            <div
              className={`rounded-2xl border p-5 space-y-4 ${
                isLight
                  ? 'bg-white border-slate-200 shadow-sm text-slate-800'
                  : 'bg-[#131B26] border-[#1E293B] shadow-[0_4px_24px_rgba(0,0,0,0.5)] text-white'
              }`}
            >
              <div className={`border-b pb-3 ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
                <h2 className={`text-sm font-bold flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <Truck className="w-4 h-4 text-emerald-500" />
                  Estado de Flota y Turnos de Muelle
                </h2>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Monitoreo de unidades triaxiales y disponibilidad de choferes.
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1A2433] border-[#1E293B]'
                }`}>
                  <span className="font-semibold">Góndolas en Ruta:</span>
                  <span className="font-mono font-bold text-[#0EA5E9]">{gondolasEnRuta} unidades</span>
                </div>
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1A2433] border-[#1E293B]'
                }`}>
                  <span className="font-semibold">Góndolas Disponibles:</span>
                  <span className="font-mono font-bold text-emerald-500">{gondolas.filter((g) => g.estado === 'Disponible').length} unidades</span>
                </div>
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1A2433] border-[#1E293B]'
                }`}>
                  <span className="font-semibold">Choferes en Tránsito:</span>
                  <span className="font-mono font-bold text-blue-500">{pilotos.filter((p) => p.estado === 'En Viaje').length} pilotos</span>
                </div>
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1A2433] border-[#1E293B]'
                }`}>
                  <span className="font-semibold">Básculas sin Cerrar:</span>
                  <span className="font-mono font-bold text-amber-500">{basculasPendientes} viajes</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('viajes')}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors text-center cursor-pointer shadow-md"
              >
                Supervisar Básculas en Muelle
              </button>
            </div>
          ) : (
            /* Tarjeta para Administradores (Cuentas 3 Hermanos + Instrucciones WhatsApp) */
            <>
              {/* 3 Brothers Accounts Distribution */}
              <div
                className={`rounded-2xl border p-5 space-y-4 ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm text-slate-800'
                    : 'bg-[#131B26] border-[#1E293B] shadow-[0_4px_24px_rgba(0,0,0,0.5)] text-white'
                }`}
              >
                <div className={`border-b pb-3 ${isLight ? 'border-slate-100' : 'border-[#1E293B]'}`}>
                  <h2 className={`text-sm font-bold flex items-center gap-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <CreditCard className="w-4 h-4 text-[#10B981]" />
                    Cuentas de los 3 Hermanos Dannas
                  </h2>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Dispersión y asignación de fondos según la placa de cada camión.
                  </p>
                </div>

                <div className="space-y-3">
                  {propietarios.map((hermano) => {
                    const totalDepositado = pagos
                      .filter((p) => p.bancoDestinoId === hermano.id)
                      .reduce((acc, p) => acc + p.montoNetoDepositado, 0);

                    return (
                      <div
                        key={hermano.id}
                        className={`p-3.5 rounded-xl border space-y-2 transition-colors ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 hover:bg-blue-50/40'
                            : 'bg-[#1A2433] border-[#1E293B] hover:bg-[#222F42]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{hermano.nombre}</span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                            isLight
                              ? 'bg-white text-slate-700 border-slate-200'
                              : 'bg-[#131B26] text-slate-300 border-[#1E293B]'
                          }`}>
                            {hermano.banco}
                          </span>
                        </div>
                        <div className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          No. Cuenta: {hermano.numeroCuenta}
                        </div>
                        <div className={`flex items-center justify-between pt-1.5 border-t text-xs ${
                          isLight ? 'border-slate-200/70' : 'border-[#1E293B]'
                        }`}>
                          <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Total Liquidado:</span>
                          <span className="font-bold text-[#10B981] font-mono">
                            Q {totalDepositado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
                  isLight
                    ? 'bg-blue-50/70 border-blue-200/70 text-slate-600'
                    : 'bg-[#1A2433] border-[#1E293B] text-slate-400'
                }`}>
                  <span className={`font-bold block ${isLight ? 'text-blue-900' : 'text-[#38BDF8]'}`}>
                    Normativa SAT de Retenciones:
                  </span>
                  <p>
                    Los clientes catalogados como Agente Retenedor retienen el 5% de ISR y el 15% de IVA sobre el total de la factura antes del depósito.
                  </p>
                </div>
              </div>

              {/* WhatsApp Instructions Callout */}
              <div
                className={`rounded-2xl border p-5 space-y-4 ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm text-slate-800'
                    : 'bg-[#131B26] border-[#1E293B] shadow-[0_4px_24px_rgba(0,0,0,0.5)] text-white'
                }`}
              >
                <div className={`flex items-center justify-between border-b pb-3 ${
                  isLight ? 'border-slate-100' : 'border-[#1E293B]'
                }`}>
                  <div>
                    <h2 className={`text-sm font-bold flex items-center gap-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      <Receipt className="w-4 h-4 text-amber-500" />
                      Instrucciones de Cobro WhatsApp
                    </h2>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Fotos de Excel enviadas por clientes para facturar.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('facturacion')}
                    className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
                  >
                    Ver
                  </button>
                </div>

                <div className="space-y-3">
                  {instruccionesCobro.slice(0, 3).map((inst) => (
                    <div
                      key={inst.id}
                      className={`p-3 rounded-xl border space-y-1.5 text-xs transition-colors ${
                        isLight
                          ? 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
                          : 'bg-[#1A2433] border-[#1E293B] hover:bg-[#222F42]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{inst.clienteNombre}</span>
                        {inst.procesada ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Facturada
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Pendiente
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {inst.cantidadViajes} viajes • <strong className={`font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>Q {inst.montoAcordadoTotal.toLocaleString()}</strong>
                      </div>
                      <div className={`text-[10px] italic ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        Ref: {inst.referenciaWhatsApp}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigate('facturacion')}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-colors border text-center cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 shadow-2xs'
                      : 'bg-[#1A2433] hover:bg-[#222F42] text-slate-200 border-[#1E293B]'
                  }`}
                >
                  Gestionar Instrucciones de Cobro
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};