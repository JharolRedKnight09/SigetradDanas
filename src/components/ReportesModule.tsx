import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Ship,
  Truck,
  Receipt,
  Fuel,
  Wallet,
  Users,
  Building,
} from 'lucide-react';
import { exportViajesToExcel } from '../utils/excelExport';

export const ReportesModule: React.FC = () => {
  const { viajes, facturas, pagos, gondolas, propietarios, registrosCombustible, clientes } = useApp();

  const [selectedReportType, setSelectedReportType] = useState<
    'BUQUES_MOVIMIENTO' | 'FACTURACION_COBRANZA' | 'LIQUIDACION_PLACAS' | 'COMBUSTIBLE'
  >('BUQUES_MOVIMIENTO');

  const [selectedBuque, setSelectedBuque] = useState<string>('TODOS');
  const [selectedCliente, setSelectedCliente] = useState<string>('TODOS');

  // Vessel list
  const buquesList = Array.from(new Set(viajes.map((v) => v.buqueNombre)));

  // Filtered trips
  const filteredTrips = viajes.filter((v) => {
    const matchesBuque = selectedBuque === 'TODOS' || v.buqueNombre === selectedBuque;
    const matchesCli = selectedCliente === 'TODOS' || v.clienteId === selectedCliente;
    return matchesBuque && matchesCli;
  });

  // Export current report
  const handleExportExcel = () => {
    exportViajesToExcel(filteredTrips, selectedReportType);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Centro de Reportes Ejecutivos y Exportación
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Informes consolidados por buque, cobranza con retenciones fiscales, liquidación a los 3 hermanos y combustible mensual.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Exportar a Excel (.xlsx)
          </button>
          <button
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* Report Types Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            id: 'BUQUES_MOVIMIENTO',
            title: '1. Viajes y Toneladas por Buque',
            desc: 'Detalle por buque (Sofía, Sakura), toneladas y placas',
            icon: Ship,
            color: 'text-blue-600 bg-blue-50 border-blue-200',
          },
          {
            id: 'FACTURACION_COBRANZA',
            title: '2. Facturación y Retenciones',
            desc: 'Monto bruto, retención ISR (5%), IVA y neto depositado',
            icon: Receipt,
            color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          },
          {
            id: 'LIQUIDACION_PLACAS',
            title: '3. Liquidación por Hermano y Placa',
            desc: 'Desglose a cuentas de Jairo, Carlos y Edwin Dannas',
            icon: Truck,
            color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
          },
          {
            id: 'COMBUSTIBLE',
            title: '4. Gasto Mensual de Combustible',
            desc: 'Consumo de galones por viaje y costo total en Quetzales',
            icon: Fuel,
            color: 'text-amber-600 bg-amber-50 border-amber-200',
          },
        ].map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReportType === rep.id;
          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReportType(rep.id as any)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rep.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs text-slate-900">{rep.title}</h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{rep.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Buque / Proyecto:</span>
            <select
              value={selectedBuque}
              onChange={(e) => setSelectedBuque(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
            >
              <option value="TODOS">Todos los Buques ({buquesList.length})</option>
              {buquesList.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Cliente:</span>
            <select
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
            >
              <option value="TODOS">Todos los Clientes ({clientes.length})</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Mostrando datos consolidados para: <strong>{selectedBuque}</strong>
        </div>
      </div>

      {/* REPORT 1: VIAJES Y TONELADAS POR BUQUE */}
      {selectedReportType === 'BUQUES_MOVIMIENTO' && (
        <div className="space-y-4">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block font-semibold uppercase">Total Viajes</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {filteredTrips.length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block font-semibold uppercase">Total TM Carga</span>
              <span className="text-2xl font-bold text-blue-700 mt-1 block">
                {filteredTrips.reduce((acc, v) => acc + (v.pesajeCarga?.pesoNetoTon || 0), 0).toFixed(2)} TM
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block font-semibold uppercase">Total TM Descarga</span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                {filteredTrips.reduce((acc, v) => acc + (v.pesajeDescarga?.pesoNetoTon || 0), 0).toFixed(2)} TM
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Buque / Proyecto</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Material</th>
                    <th className="px-4 py-3">Código Viaje</th>
                    <th className="px-4 py-3">Placa</th>
                    <th className="px-4 py-3">Piloto</th>
                    <th className="px-4 py-3">TM Carga</th>
                    <th className="px-4 py-3">TM Descarga</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTrips.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-bold text-slate-900">{v.buqueNombre}</td>
                      <td className="px-4 py-3 text-slate-500">{v.categoriaMovimiento}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{v.material}</td>
                      <td className="px-4 py-3 font-mono text-blue-700">{v.codigoViaje}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{v.placa}</td>
                      <td className="px-4 py-3 text-slate-600">{v.pilotoNombre}</td>
                      <td className="px-4 py-3 font-mono">
                        {v.pesajeCarga ? `${v.pesajeCarga.pesoNetoTon} TM` : '-'}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                        {v.pesajeDescarga ? `${v.pesajeDescarga.pesoNetoTon} TM` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {v.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: FACTURACION Y COBRANZA */}
      {selectedReportType === 'FACTURACION_COBRANZA' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block font-semibold uppercase">Total Facturado Bruto</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                Q{facturas.reduce((acc, f) => acc + f.montoBruto, 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block font-semibold uppercase">Retenciones Aplicadas (ISR/IVA)</span>
              <span className="text-xl font-bold text-red-600 mt-1 block">
                -Q{(pagos.reduce((acc, p) => acc + p.retencionIsrAplicada + p.retencionIvaAplicada, 0)).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block font-semibold uppercase">Total Neto Cobrado / Depositado</span>
              <span className="text-xl font-bold text-emerald-700 mt-1 block">
                Q{pagos.reduce((acc, p) => acc + p.montoNetoDepositado, 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block font-semibold uppercase">Saldo Pendiente de Cobro</span>
              <span className="text-xl font-bold text-amber-600 mt-1 block">
                Q{facturas
                  .filter((f) => f.estadoPago === 'Emitida')
                  .reduce((acc, f) => acc + f.netoEsperado, 0)
                  .toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Factura</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Buque</th>
                    <th className="px-4 py-3">Bruto</th>
                    <th className="px-4 py-3">Retención ISR (5%)</th>
                    <th className="px-4 py-3">Retención IVA</th>
                    <th className="px-4 py-3">Neto Esperado</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facturas.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">{f.numeroFactura}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{f.clienteNombre}</td>
                      <td className="px-4 py-3 text-slate-600">{f.buqueProyecto}</td>
                      <td className="px-4 py-3 font-mono">Q{f.montoBruto.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-red-600">
                        {f.esAgenteRetenedor ? `-Q${f.retencionIsrEstimada.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 font-mono text-red-600">
                        {f.esAgenteRetenedor ? `-Q${f.retencionIvaEstimada.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                        Q{f.netoEsperado.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.estadoPago === 'Conciliada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {f.estadoPago}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: LIQUIDACION POR PLACA Y PROPIETARIO HERMANO */}
      {selectedReportType === 'LIQUIDACION_PLACAS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Placa Vehicular</th>
                    <th className="px-4 py-3">Hermano Propietario</th>
                    <th className="px-4 py-3">Banco y No. Cuenta</th>
                    <th className="px-4 py-3">Viajes Totales</th>
                    <th className="px-4 py-3">Ingresos Brutos</th>
                    <th className="px-4 py-3">Gasto Combustible</th>
                    <th className="px-4 py-3">Margen Operativo Neto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gondolas.map((g) => {
                    const hermano = propietarios.find((p) => p.id === g.propietarioId);
                    const viajesPlaca = viajes.filter((v) => v.placa === g.placa);
                    const ingresosPlaca = viajesPlaca.reduce((acc, v) => acc + v.tarifaAcordada, 0);
                    const fuelPlaca = registrosCombustible
                      .filter((r) => r.placa === g.placa)
                      .reduce((acc, r) => acc + r.totalGasto, 0);
                    const margen = ingresosPlaca - fuelPlaca;

                    return (
                      <tr key={g.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{g.placa}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{hermano?.nombre}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {hermano?.banco} ({hermano?.numeroCuenta})
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-700">{viajesPlaca.length} viajes</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          Q{ingresosPlaca.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 font-mono text-amber-700">
                          -Q{fuelPlaca.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                          Q{margen.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 4: GASTO MENSUAL DE COMBUSTIBLE */}
      {selectedReportType === 'COMBUSTIBLE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block font-semibold uppercase">Total Galones Consumidos</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {registrosCombustible.reduce((acc, r) => acc + r.galones, 0).toLocaleString()} gal
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block font-semibold uppercase">Gasto Total en Quetzales</span>
              <span className="text-2xl font-bold text-amber-600 mt-1 block">
                Q{registrosCombustible.reduce((acc, r) => acc + r.totalGasto, 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block font-semibold uppercase">Promedio por Despacho</span>
              <span className="text-2xl font-bold text-slate-700 mt-1 block">
                {(registrosCombustible.reduce((acc, r) => acc + r.galones, 0) / (registrosCombustible.length || 1)).toFixed(1)} gal
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Placa</th>
                    <th className="px-4 py-3">Buque / Proyecto</th>
                    <th className="px-4 py-3">Material / Movimiento</th>
                    <th className="px-4 py-3">Galones</th>
                    <th className="px-4 py-3">Precio Unitario</th>
                    <th className="px-4 py-3">Total Quetzales</th>
                    <th className="px-4 py-3">Estación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrosCombustible.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono text-slate-600">{r.fecha}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.placa}</td>
                      <td className="px-4 py-3 font-medium text-blue-700">{r.buqueProyecto}</td>
                      <td className="px-4 py-3 text-slate-800">{r.tipoMovimiento}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.galones} gal</td>
                      <td className="px-4 py-3 font-mono text-slate-500">Q{r.precioPorGalon.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-700">
                        Q{r.totalGasto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{r.estacionServicio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
