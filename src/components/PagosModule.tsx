import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PagoConciliacion, ParametroCombustible, RegistroGastoCombustible, Viaje } from '../types';
import {
  Wallet,
  Fuel,
  Receipt,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Calendar,
  Building,
  Truck,
  TrendingUp,
  Percent,
  X,
  FileText,
  Sliders,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { exportConciliacionPDF } from '../utils/pdfExport';

export const PagosModule: React.FC = () => {
  const {
    pagos,
    facturas,
    propietarios,
    gondolas,
    viajes,
    parametrosCombustible,
    registrosCombustible,
    registrarPagoConciliacion,
    updateParametroCombustible,
    addRegistroCombustible,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'CONCILIACION' | 'LIQUIDACION_HERMANOS' | 'COMBUSTIBLE'>(
    'CONCILIACION'
  );

  // Conciliation Form Modal
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [selectedFacturaId, setSelectedFacturaId] = useState<string>(
    facturas.find((f) => f.estadoPago === 'Emitida')?.id || facturas[0]?.id || ''
  );
  const [pagoForm, setPagoForm] = useState({
    fechaPago: new Date().toISOString().slice(0, 10),
    numeroTransferencia: `TRANS-GT-${Math.floor(100000 + Math.random() * 900000)}`,
    montoNetoDepositado: 89000,
    retencionIsrAplicada: 4464.29,
    retencionIvaAplicada: 1607.14,
    numeroConstanciaRetencion: `SAT-RET-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    bancoDestinoId: propietarios[0]?.id || '',
    observaciones: 'Transferencia bancaria recibida a 10 días de emisión',
  });

  // Fuel Parameter Edit Modal
  const [editingParam, setEditingParam] = useState<ParametroCombustible | null>(null);
  const [paramGalones, setParamGalones] = useState<number>(0);

  // Fuel quick record modal
  const [showNewFuelModal, setShowNewFuelModal] = useState(false);
  const [newFuelForm, setNewFuelForm] = useState({
    placa: gondolas[0]?.placa || '',
    fecha: new Date().toISOString().slice(0, 10),
    galones: 24,
    precioGalon: 32.5,
    estacionServicio: 'Shell Puerto Barrios',
    buqueProyecto: 'Sofía',
    tipoMovimiento: 'Soya',
  });

  const canManage = currentUser.rol === 'DUENO' || currentUser.rol === 'ADMIN';

  // Open modal for conciliation
  const handleOpenConciliacion = (facturaId?: string) => {
    const fId = facturaId || facturas.find((f) => f.estadoPago === 'Emitida')?.id || facturas[0]?.id;
    if (fId) {
      const targetFactura = facturas.find((f) => f.id === fId);
      if (targetFactura) {
        setSelectedFacturaId(fId);
        setPagoForm({
          fechaPago: new Date().toISOString().slice(0, 10),
          numeroTransferencia: `TRANS-GT-${Math.floor(100000 + Math.random() * 900000)}`,
          montoNetoDepositado: targetFactura.netoEsperado,
          retencionIsrAplicada: targetFactura.retencionIsrEstimada,
          retencionIvaAplicada: targetFactura.retencionIvaEstimada,
          numeroConstanciaRetencion: `SAT-RET-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          bancoDestinoId: propietarios[0]?.id || '',
          observaciones: 'Transferencia liquidada por cliente agente retenedor',
        });
      }
    }
    setShowPagoModal(true);
  };

  const handleSavePago = (e: React.FormEvent) => {
    e.preventDefault();
    const targetFactura = facturas.find((f) => f.id === selectedFacturaId);
    if (!targetFactura) return;
    const hermano = propietarios.find((p) => p.id === pagoForm.bancoDestinoId);

    registrarPagoConciliacion({
      facturaId: targetFactura.id,
      numeroFactura: targetFactura.numeroFactura,
      clienteId: targetFactura.clienteId,
      clienteNombre: targetFactura.clienteNombre,
      fechaDeposito: pagoForm.fechaPago,
      numeroTransferencia: pagoForm.numeroTransferencia,
      bancoDestinoId: pagoForm.bancoDestinoId,
      bancoNombre: hermano?.banco || 'Banco Industrial',
      cuentaAcreditada: hermano?.numeroCuenta || '',
      titularCuenta: hermano?.nombre || 'Jairo Dannas',
      montoBrutoFacturado: targetFactura.montoBruto,
      retencionIsrAplicada: pagoForm.retencionIsrAplicada,
      retencionIvaAplicada: pagoForm.retencionIvaAplicada,
      otrosDescuentos: 0,
      montoNetoDepositado: pagoForm.montoNetoDepositado,
      saldoAceptado: 0,
      comprobanteFotoRef: `Comprobante ${pagoForm.numeroTransferencia} ${pagoForm.numeroConstanciaRetencion || ''}`,
      desglosePlacas: [],
      observaciones: pagoForm.observaciones,
    });

    setShowPagoModal(false);
  };

  // Add Fuel Record
  const handleSaveFuel = (e: React.FormEvent) => {
    e.preventDefault();
    const gondola = gondolas.find((g) => g.placa === newFuelForm.placa);
    if (!gondola) return;

    addRegistroCombustible({
      placa: newFuelForm.placa,
      propietarioId: gondola.propietarioId,
      fecha: newFuelForm.fecha,
      pilotoNombre: gondola.pilotoAsignadoNombre || 'Piloto Operador',
      buqueMovimiento: newFuelForm.buqueProyecto,
      tipoMovimiento: newFuelForm.tipoMovimiento,
      galones: newFuelForm.galones,
      precioPorGalon: newFuelForm.precioGalon,
      totalGasto: newFuelForm.galones * newFuelForm.precioGalon,
      estacionServicio: newFuelForm.estacionServicio,
    });

    setShowNewFuelModal(false);
  };

  // Fuel totals
  const totalGalones = registrosCombustible.reduce((acc, r) => acc + r.galones, 0);
  const totalGastoFuel = registrosCombustible.reduce((acc, r) => acc + r.totalGasto, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-emerald-600" />
              Conciliación, Tesorería y Cuentas Bancarias
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conciliación bancaria con retención ISR (5%) e IVA, distribución a cuentas de los 3 hermanos y control de combustible con parámetros por movimiento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={() => handleOpenConciliacion()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Registrar Pago y Conciliación
            </button>
          )}
        </div>
      </div>

      {/* Subtabs */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('CONCILIACION')}
            className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'CONCILIACION'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Conciliación Bancaria y Retenciones ({pagos.length})
          </button>

          <button
            onClick={() => setActiveTab('LIQUIDACION_HERMANOS')}
            className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'LIQUIDACION_HERMANOS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            Cuentas Hermanos Dannas y Desglose por Placa
          </button>

          <button
            onClick={() => setActiveTab('COMBUSTIBLE')}
            className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'COMBUSTIBLE'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Fuel className="w-4 h-4 text-amber-500" />
            Control de Combustible y Parámetros por Movimiento
          </button>
        </div>
      </div>

      {/* SUBTAB 1: CONCILIACION BANCARIA */}
      {activeTab === 'CONCILIACION' && (
        <div className="space-y-4">
          {/* Info callout on 7-15 days payment & retentions */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <Percent className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-xs text-emerald-900">
                Regla de Negocio: Transferencia Bancaria y Agente Retenedor
              </h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                El cliente transfiere a los 7-15 días de recibir la factura, deduciendo la retención del ISR (5% sobre subtotal) y retención del IVA con su respectiva constancia de retención SAT.
                El sistema compara automáticamente el monto esperado con el efectivamente depositado y emite alerta ante cualquier discrepancia.
              </p>
            </div>
          </div>

          {/* Conciliated Payments Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">No. Transferencia</th>
                    <th className="px-4 py-3">Factura Asociada</th>
                    <th className="px-4 py-3">Monto Facturado Bruto</th>
                    <th className="px-4 py-3">Retención ISR (5%)</th>
                    <th className="px-4 py-3">Retención IVA</th>
                    <th className="px-4 py-3">Neto Depositado</th>
                    <th className="px-4 py-3">Cuenta Destino</th>
                    <th className="px-4 py-3">Estado Conciliación</th>
                    <th className="px-4 py-3 text-right">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagos.map((pago) => {
                    const hermano = propietarios.find((p) => p.id === pago.bancoDestinoId);
                    return (
                      <tr key={pago.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-slate-900">{pago.numeroTransferencia}</div>
                          <div className="text-[10px] text-slate-400">Fecha: {pago.fechaDeposito}</div>
                          {pago.comprobanteFotoRef && (
                            <div className="text-[10px] text-blue-700 font-mono truncate max-w-xs">
                              {pago.comprobanteFotoRef}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-blue-700">{pago.numeroFactura}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-xs">{pago.clienteNombre}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          Q{pago.montoBrutoFacturado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 font-medium text-red-600">
                          -Q{pago.retencionIsrAplicada.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 font-medium text-red-600">
                          -Q{pago.retencionIvaAplicada.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-700">
                          Q{pago.montoNetoDepositado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{hermano?.nombre}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {hermano?.banco} - {hermano?.numeroCuenta}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {pago.saldoAceptado > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Saldo: Q{pago.saldoAceptado.toFixed(2)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Exacta
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => exportConciliacionPDF(pago)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                            title="Descargar Comprobante Oficial PDF"
                          >
                            <Download className="w-3 h-3 text-slate-600" />
                            PDF
                          </button>
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

      {/* SUBTAB 2: LIQUIDACION A LOS 3 HERMANOS Y POR PLACA */}
      {activeTab === 'LIQUIDACION_HERMANOS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              Estructura Real de los 3 Hermanos Propietarios (Dannas)
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Las placas vehiculares están registradas a nombre de los tres hermanos. Cada pago transferido por los clientes a las 3 cuentas bancarias
              se desglosa automáticamente por placa transportista para que cada hermano conozca con exactitud su liquidación neta.
            </p>
          </div>

          {/* Cards for each brother */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {propietarios.map((hermano) => {
              const placas = gondolas.filter((g) => g.propietarioId === hermano.id);
              const totalPagosHermano = pagos
                .filter((p) => p.bancoDestinoId === hermano.id)
                .reduce((acc, p) => acc + p.montoNetoDepositado, 0);
              const totalViajesHermano = viajes.filter((v) =>
                placas.some((pl) => pl.placa === v.placa)
              );

              return (
                <div
                  key={hermano.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{hermano.nombre}</h3>
                        <span className="text-[11px] font-semibold text-emerald-700">Socio Propietario</span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">
                        {hermano.banco}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 font-mono">
                      <div>Cuenta: <strong>{hermano.numeroCuenta}</strong></div>
                      <div>Tipo: {hermano.tipoCuenta}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Neto Depositado:</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          Q{totalPagosHermano.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Viajes Registrados:</span>
                        <span className="font-semibold text-slate-800">{totalViajesHermano.length} viajes</span>
                      </div>
                    </div>

                    {/* Plates Breakdown */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Placas Asociadas ({placas.length}):
                      </span>
                      {placas.map((g) => {
                        const viajesPlaca = viajes.filter((v) => v.placa === g.placa);
                        const generadoBruto = viajesPlaca.reduce((acc, v) => acc + v.tarifaAcordada, 0);

                        return (
                          <div
                            key={g.id}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between"
                          >
                            <span className="font-mono font-bold text-slate-800">{g.placa}</span>
                            <span className="text-slate-500">{viajesPlaca.length} viajes</span>
                            <span className="font-bold text-slate-900">Q{generadoBruto.toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: CONTROL DE COMBUSTIBLE Y PARAMETROS */}
      {activeTab === 'COMBUSTIBLE' && (
        <div className="space-y-6">
          {/* KPIs Combustible */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Galones Consumidos</span>
              <div className="text-2xl font-bold text-slate-900 mt-2">{totalGalones.toLocaleString()} gal</div>
              <div className="text-xs text-slate-500 mt-1">Registros del mes activo</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Gasto Total Combustible</span>
              <div className="text-2xl font-bold text-amber-600 mt-2">
                Q{totalGastoFuel.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 mt-1">Promedio Q32.50 / galón diésel</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Despacho Rápido</span>
                <p className="text-xs text-slate-500 mt-1">Registrar vale de combustible en estación</p>
              </div>
              <button
                onClick={() => setShowNewFuelModal(true)}
                className="mt-3 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Nuevo Vale de Combustible
              </button>
            </div>
          </div>

          {/* Configurable Parameters Table (As specified by real business: Bloque 50 gal, Piedrín 65/73/78 o 7/10/12, Trigo 7, Carbón 16/48, Soya/Maíz 24) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Tabla de Parámetros de Combustible Configurable por Movimiento
                </h3>
                <p className="text-xs text-slate-500">
                  Valores estándar levantados con el cliente para el cálculo automático de consumo y gasto mensual.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Tipo de Movimiento / Material</th>
                    <th className="px-4 py-3">Galones Sugeridos</th>
                    <th className="px-4 py-3">Rango de Galones</th>
                    <th className="px-4 py-3">Distancia / Modalidad</th>
                    <th className="px-4 py-3">Costo Est. (@ Q32.50)</th>
                    {canManage && <th className="px-4 py-3 text-right">Modificar</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parametrosCombustible.map((param) => (
                    <tr key={param.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-bold text-slate-900">{param.tipoMovimientoOMaterial}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">
                        {param.galonesSugeridos} gal
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {param.rangoGalonesMin} - {param.rangoGalonesMax} gal
                      </td>
                      <td className="px-4 py-3 text-slate-500">{param.distanciaTipo}</td>
                      <td className="px-4 py-3 font-semibold text-amber-700">
                        Q{(param.galonesSugeridos * 32.5).toFixed(2)}
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setEditingParam(param);
                              setParamGalones(param.galonesSugeridos);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Ajustar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Fuel Vouchers Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-600" />
                Historial de Despacho y Gasto de Combustible por Placa
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Placa / Unidad</th>
                    <th className="px-4 py-3">Propietario Hermano</th>
                    <th className="px-4 py-3">Buque / Proyecto</th>
                    <th className="px-4 py-3">Galones</th>
                    <th className="px-4 py-3">Precio / Galón</th>
                    <th className="px-4 py-3">Total Gasto (Q)</th>
                    <th className="px-4 py-3">Estación de Servicio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrosCombustible.map((r) => {
                    const hermano = propietarios.find((p) => p.id === r.propietarioId);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-mono text-slate-600">{r.fecha}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.placa}</td>
                        <td className="px-4 py-3 text-slate-700">{hermano?.nombre}</td>
                        <td className="px-4 py-3 font-medium text-blue-700">{r.buqueMovimiento}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.galones} gal</td>
                        <td className="px-4 py-3 font-mono text-slate-600">Q{r.precioPorGalon.toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono font-bold text-amber-700">
                          Q{r.totalGasto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{r.estacionServicio}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Conciliation & Payment Entry */}
      {showPagoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                Registrar Pago de Cliente y Conciliación
              </h3>
              <button
                onClick={() => setShowPagoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePago} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Factura a Conciliar</label>
                <select
                  value={selectedFacturaId}
                  onChange={(e) => {
                    const f = facturas.find((x) => x.id === e.target.value);
                    setSelectedFacturaId(e.target.value);
                    if (f) {
                      setPagoForm({
                        ...pagoForm,
                        montoNetoDepositado: f.netoEsperado,
                        retencionIsrAplicada: f.retencionIsrEstimada,
                        retencionIvaAplicada: f.retencionIvaEstimada,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                >
                  {facturas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.numeroFactura} - {f.clienteNombre} (Bruto: Q{f.montoBruto.toLocaleString()} • Neto Esp: Q
                      {f.netoEsperado.toLocaleString()}) [{f.estadoPago}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Transferencia</label>
                  <input
                    type="date"
                    required
                    value={pagoForm.fechaPago}
                    onChange={(e) => setPagoForm({ ...pagoForm, fechaPago: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. Transferencia / Depósito
                  </label>
                  <input
                    type="text"
                    required
                    value={pagoForm.numeroTransferencia}
                    onChange={(e) => setPagoForm({ ...pagoForm, numeroTransferencia: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              {/* Destination Bank Account (The 3 brothers) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cuenta Bancaria Receptora (Hermano Propietario)
                </label>
                <select
                  value={pagoForm.bancoDestinoId}
                  onChange={(e) => setPagoForm({ ...pagoForm, bancoDestinoId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                >
                  {propietarios.map((hermano) => (
                    <option key={hermano.id} value={hermano.id}>
                      {hermano.nombre} — {hermano.banco} ({hermano.numeroCuenta})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Neto Depositado (Q)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pagoForm.montoNetoDepositado}
                    onChange={(e) =>
                      setPagoForm({ ...pagoForm, montoNetoDepositado: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Retención ISR (Q)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pagoForm.retencionIsrAplicada}
                    onChange={(e) =>
                      setPagoForm({ ...pagoForm, retencionIsrAplicada: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-red-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Retención IVA (Q)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pagoForm.retencionIvaAplicada}
                    onChange={(e) =>
                      setPagoForm({ ...pagoForm, retencionIvaAplicada: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  No. Constancia de Retención SAT
                </label>
                <input
                  type="text"
                  value={pagoForm.numeroConstanciaRetencion}
                  onChange={(e) => setPagoForm({ ...pagoForm, numeroConstanciaRetencion: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  placeholder="SAT-RET-2026-XXXX"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  value={pagoForm.observaciones}
                  onChange={(e) => setPagoForm({ ...pagoForm, observaciones: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPagoModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  Registrar y Conciliar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Fuel Parameter */}
      {editingParam && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Ajustar Parámetro: {editingParam.tipoMovimientoOMaterial}
            </h3>
            <div className="text-xs text-slate-500">
              Ajusta los galones estándar asignados por viaje para este movimiento.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Galones Sugeridos por Viaje
              </label>
              <input
                type="number"
                value={paramGalones}
                onChange={(e) => setParamGalones(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-sm text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingParam(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  updateParametroCombustible(editingParam.tipoMovimientoOMaterial, paramGalones);
                  setEditingParam(null);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Fuel Dispatch */}
      {showNewFuelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-600" />
                Registrar Despacho de Combustible
              </h3>
              <button
                onClick={() => setShowNewFuelModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFuel} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Placa Vehicular</label>
                  <select
                    value={newFuelForm.placa}
                    onChange={(e) => setNewFuelForm({ ...newFuelForm, placa: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  >
                    {gondolas.map((g) => (
                      <option key={g.id} value={g.placa}>
                        {g.placa}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={newFuelForm.fecha}
                    onChange={(e) => setNewFuelForm({ ...newFuelForm, fecha: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Galones Despachados</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newFuelForm.galones}
                    onChange={(e) =>
                      setNewFuelForm({ ...newFuelForm, galones: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio por Galón (Q)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newFuelForm.precioGalon}
                    onChange={(e) =>
                      setNewFuelForm({ ...newFuelForm, precioGalon: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs flex justify-between font-bold text-amber-900">
                <span>Total Vale Combustible:</span>
                <span className="font-mono">
                  Q{(newFuelForm.galones * newFuelForm.precioGalon).toLocaleString('es-GT', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estación de Servicio</label>
                <input
                  type="text"
                  value={newFuelForm.estacionServicio}
                  onChange={(e) =>
                    setNewFuelForm({ ...newFuelForm, estacionServicio: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Buque / Proyecto</label>
                  <input
                    type="text"
                    value={newFuelForm.buqueProyecto}
                    onChange={(e) =>
                      setNewFuelForm({ ...newFuelForm, buqueProyecto: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Material</label>
                  <input
                    type="text"
                    value={newFuelForm.tipoMovimiento}
                    onChange={(e) =>
                      setNewFuelForm({ ...newFuelForm, tipoMovimiento: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewFuelModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-xs"
                >
                  Registrar Vale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
