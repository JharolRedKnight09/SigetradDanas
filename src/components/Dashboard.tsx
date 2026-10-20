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
    theme,
    toggleTheme,
  } = useApp();

  // Operational metrics
  const totalViajes = viajes.length;
  const viajesActivos = viajes.filter((v) => v.estado === 'En Curso');
  const viajesPendientes = viajes.filter((v) => v.estado === 'Pendiente');
  const viajesFinalizados = viajes.filter((v) => v.estado === 'Finalizado' || v.estado === 'Facturado');

  // Financial & Tax metrics
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

  // Fuel metrics
  const totalGalonesMes = registrosCombustible.reduce((acc, r) => acc + r.galones, 0);
  const totalGastoCombustible = registrosCombustible.reduce((acc, r) => acc + r.totalGasto, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Corporate Executive Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 rounded-3xl p-6 sm:p-7 text-white shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50 uppercase tracking-wider font-mono shadow-xs">
              Terminal Central Escuintla y Puerto Quetzal
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-300 font-medium">
              Empresa: <strong className="text-white">Transportes y Servicios Dannas, S.A.</strong>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Tablero de Control Ejecutivo • SIGETRAD
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Consolidado operativo en tiempo real: control de viajes por buque, báscula en muelle, liquidaciones bancarias a cuentas de los tres hermanos y retenciones tributarias SAT.
          </p>
        </div>

        {/* Corporate Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <button
            onClick={() => onNavigate('viajes')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Despacho</span>
          </button>

          <button
            onClick={() => onNavigate('facturacion')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer shadow-xs"
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>Cobros WhatsApp ({instruccionesCobro.filter((i) => !i.procesada).length})</span>
          </button>

          <button
            onClick={() => exportViajesToExcel(viajes)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer shadow-xs"
            title="Exportar archivo idéntico a las pestañas del Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel Maestro</span>
          </button>

          {/* Theme switcher button in Dashboard */}
          <button
            onClick={toggleTheme}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
              theme === 'dark'
                ? 'bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border-amber-400/40'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
            }`}
            title={theme === 'dark' ? 'Cambiar el panel a Modo Claro' : 'Cambiar el panel a Modo Oscuro'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Modo Oscuro</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Financial & Operational Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Facturación Bruta */}
        <div className="bg-[#131B26] hover:bg-[#1A2433] rounded-2xl p-5 border border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all relative overflow-hidden border-t-2 border-t-[#F4BA36] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Monto Facturado Bruto
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F4BA36]/15 text-[#FFC82C] flex items-center justify-center border border-[#F4BA36]/30 shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              Q {totalFacturadoBruto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-slate-300">{facturas.length} facturas emitidas</span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Pendiente de cobro:</span>
            <span className="font-bold text-[#FFC82C] font-mono">
              Q {saldoPendienteCobro.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* KPI 2: Retenciones SAT de Ley */}
        <div className="bg-[#131B26] hover:bg-[#1A2433] rounded-2xl p-5 border border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all relative overflow-hidden border-t-2 border-t-[#EF4444] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>ISR (5%): <strong className="text-slate-200">Q {totalRetencionesIsr.toLocaleString('es-GT', { minimumFractionDigits: 0 })}</strong></span>
              <span>•</span>
              <span>IVA (15%): <strong className="text-slate-200">Q {totalRetencionesIva.toLocaleString('es-GT', { minimumFractionDigits: 0 })}</strong></span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Estado fiscal:</span>
            <span className="font-bold text-[#10B981]">Constancias Aplicadas</span>
          </div>
        </div>

        {/* KPI 3: Neto Conciliado a Cuentas */}
        <div className="bg-[#131B26] hover:bg-[#1A2433] rounded-2xl p-5 border border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all relative overflow-hidden border-t-2 border-t-[#10B981] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
            <div className="text-xs text-slate-400 mt-1">
              Repartido a los 3 Hermanos Dannas
            </div>
          </div>
          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Bancos destino:</span>
            <span className="font-semibold text-slate-300 font-mono text-[10px]">Banrural • BI • G&T</span>
          </div>
        </div>

        {/* KPI 4: Flota en Operación */}
        <div className="bg-[#131B26] hover:bg-[#1A2433] rounded-2xl p-5 border border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all relative overflow-hidden border-t-2 border-t-[#0EA5E9] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Flota en Operación
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#0EA5E9]/15 text-[#0EA5E9] flex items-center justify-center border border-[#0EA5E9]/30 shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-2">
              <span>{viajesActivos.length}</span>
              <span className="text-xs font-sans text-slate-400 font-normal">en ruta</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {viajesFinalizados.length} entregados • Total: {totalViajes}
            </div>
          </div>
          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Consumo diésel:</span>
            <span className="font-bold text-slate-200 font-mono">Q {totalGastoCombustible.toLocaleString('es-GT', { minimumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Main Split: Operations por Buque + Financial Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Movement Tabs + Recent Trips Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Movement Categories (Excel Tabs replication) */}
          <div className="bg-[#131B26] rounded-2xl border border-[#1E293B] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#F4BA36]" />
                  Pestañas Operativas del Maestro (Categorías de Transporte)
                </h2>
                <p className="text-xs text-slate-400">
                  Mapeo exacto de las pestañas del Excel: Buques, Barrios, Carbón, Clinkers, Mi Guate, Palo Gordo.
                </p>
              </div>
              <button
                onClick={() => onNavigate('viajes')}
                className="text-xs font-bold text-[#FFC82C] hover:text-[#F4BA36] flex items-center gap-1 cursor-pointer transition-colors"
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
                  className="p-3.5 rounded-xl border border-[#1E293B] bg-[#1A2433] hover:bg-[#222F42] hover:border-[#F4BA36]/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-150 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white group-hover:text-[#FFC82C] transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 bg-[#131B26] px-1.5 py-0.2 rounded border border-[#1E293B]">
                      {cat.tag}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">{cat.sub}</div>
                  <div className="mt-2 text-base font-black text-[#FFC82C] font-mono">
                    {cat.count} <span className="text-[10px] font-normal text-slate-400 font-sans">viajes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trips Table with Scales and PDF Export */}
          <div className="bg-[#131B26] rounded-2xl border border-[#1E293B] shadow-[0_4px_24px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#0EA5E9]" />
                  Últimos Despachos y Registro de Básculas Portuarias
                </h2>
                <p className="text-xs text-slate-400">
                  Control de pesaje en muelle (Carga) versus báscula en silos de cliente (Descarga).
                </p>
              </div>
              <button
                onClick={() => onNavigate('viajes')}
                className="text-xs font-bold text-[#FFC82C] hover:text-[#F4BA36] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Ver todos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0B0F17] text-slate-400 font-semibold border-b border-[#1E293B]">
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
                <tbody className="divide-y divide-[#1E293B]">
                  {viajes.slice(0, 5).map((viaje) => (
                    <tr key={viaje.id} className="hover:bg-[#1A2433] transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#FFC82C]">
                        {viaje.codigoViaje}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{viaje.buqueNombre}</div>
                        <div className="text-[10px] text-slate-400">{viaje.categoriaMovimiento}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-[#1A2433] text-slate-200 text-[11px] font-semibold border border-[#1E293B]">
                          {viaje.material}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white font-mono">{viaje.placa}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                          {viaje.pilotoNombre}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {viaje.pesajeCarga ? (
                          <div>
                            <span className="font-bold text-white font-mono">
                              {viaje.pesajeCarga.pesoNetoTon} MT
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Bol. #{viaje.pesajeCarga.numeroBoleta}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#FFC82C] font-semibold italic text-[11px]">Pendiente</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {viaje.pesajeDescarga ? (
                          <div>
                            <span className="font-bold text-[#10B981] font-mono">
                              {viaje.pesajeDescarga.pesoNetoTon} MT
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Bol. #{viaje.pesajeDescarga.numeroBoleta}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">En ruta</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            viaje.estado === 'Finalizado' || viaje.estado === 'Facturado'
                              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                              : viaje.estado === 'En Curso'
                              ? 'bg-[#0EA5E9]/15 text-[#0EA5E9] border-[#0EA5E9]/30'
                              : 'bg-[#FFC82C]/15 text-[#FFC82C] border-[#FFC82C]/30'
                          }`}
                        >
                          {viaje.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => exportViajePDF(viaje)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-200 bg-[#1A2433] hover:bg-[#222F42] hover:text-[#FFC82C] transition-colors border border-[#1E293B] cursor-pointer"
                          title="Descargar Comprobante Oficial PDF"
                        >
                          <Download className="w-3 h-3 text-[#FFC82C]" />
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

        {/* Right 4 Cols: 3 Brothers Accounts & WhatsApp Instructions */}
        <div className="lg:col-span-4 space-y-6">
          {/* 3 Brothers Accounts Distribution */}
          <div className="bg-[#131B26] rounded-2xl border border-[#1E293B] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)] space-y-4">
            <div className="border-b border-[#1E293B] pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#10B981]" />
                Cuentas de los 3 Hermanos Dannas
              </h2>
              <p className="text-xs text-slate-400">
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
                    className="p-3.5 rounded-xl bg-[#1A2433] border border-[#1E293B] space-y-2 hover:bg-[#222F42] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{hermano.nombre}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#131B26] text-slate-300 border border-[#1E293B]">
                        {hermano.banco}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      No. Cuenta: {hermano.numeroCuenta}
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#1E293B] text-xs">
                      <span className="text-slate-400">Total Liquidado:</span>
                      <span className="font-bold text-[#10B981] font-mono">
                        Q {totalDepositado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-[#1A2433] border border-[#1E293B] text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-[#FFC82C] block">Normativa SAT de Retenciones:</span>
              <p>
                Los clientes catalogados como Agente Retenedor retienen el 5% de ISR y el 15% de IVA sobre el total de la factura antes del depósito.
              </p>
            </div>
          </div>

          {/* WhatsApp Instructions Callout */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-600" />
                  Instrucciones de Cobro WhatsApp
                </h2>
                <p className="text-xs text-slate-500">
                  Fotos de Excel enviadas por clientes para facturar.
                </p>
              </div>
              <button
                onClick={() => onNavigate('facturacion')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Ver
              </button>
            </div>

            <div className="space-y-3">
              {instruccionesCobro.slice(0, 3).map((inst) => (
                <div
                  key={inst.id}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 text-xs hover:bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{inst.clienteNombre}</span>
                    {inst.procesada ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Facturada
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    {inst.cantidadViajes} viajes • <strong className="text-slate-900 font-mono">Q {inst.montoAcordadoTotal.toLocaleString()}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">
                    Ref: {inst.referenciaWhatsApp}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('facturacion')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-200/80 text-center cursor-pointer shadow-2xs"
            >
              Gestionar Instrucciones de Cobro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
