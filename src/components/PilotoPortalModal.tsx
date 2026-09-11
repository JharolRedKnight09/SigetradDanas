import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Viaje, BoletaPesaje } from '../types';
import {
  Smartphone,
  Truck,
  Scale,
  CheckCircle2,
  Navigation,
  Clock,
  MapPin,
  Calendar,
  X,
  Ship,
  Fuel,
} from 'lucide-react';

interface PilotoPortalModalProps {
  onClose: () => void;
}

export const PilotoPortalModal: React.FC<PilotoPortalModalProps> = ({ onClose }) => {
  const { currentUser, viajes, updateViaje } = useApp();
  const [selectedViaje, setSelectedViaje] = useState<Viaje | null>(null);

  // Form for scale entry by pilot
  const [scaleType, setScaleType] = useState<'CARGA' | 'DESCARGA'>('CARGA');
  const [numeroBoleta, setNumeroBoleta] = useState(`B-${Math.floor(10000 + Math.random() * 90000)}`);
  const [pesoBruto, setPesoBruto] = useState(50200);
  const [tara, setTara] = useState(14200);
  const [basculaNombre, setBasculaNombre] = useState('Báscula Muelle Puerto Santo Tomás');

  // Filter trips for this pilot (or all trips if admin testing)
  const misViajes = viajes.filter((v) =>
    currentUser.rol === 'PILOTO' ? v.pilotoId === currentUser.id : true
  );

  const handleSaveBoleta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedViaje) return;

    const netoKg = pesoBruto - tara;
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

    setSelectedViaje(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-800 space-y-4 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                Portal Móvil del Operador (Piloto)
              </h2>
              <span className="text-[11px] text-blue-400 font-medium">
                {currentUser.nombre} • Transportes Dannas
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info banner */}
        <div className="p-3 rounded-2xl bg-blue-950/60 border border-blue-800/80 text-xs text-blue-200">
          🚛 <strong>Vista de Campo en Muelle:</strong> Diseñada para registrar boletas de pesaje en báscula y actualizar estado del viaje directamente desde el smartphone del piloto.
        </div>

        {/* Trips List */}
        {!selectedViaje ? (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Mis Viajes Asignados ({misViajes.length})
            </div>

            {misViajes.map((viaje) => (
              <div
                key={viaje.id}
                className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {viaje.codigoViaje}
                    </span>
                    <span className="text-xs font-bold text-white">{viaje.buqueNombre}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      viaje.estado === 'Finalizado'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : viaje.estado === 'En Curso'
                        ? 'bg-blue-500/20 text-blue-300 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {viaje.estado}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <div>
                    Placa: <strong className="text-white font-mono">{viaje.placa}</strong> • Material:{' '}
                    <strong>{viaje.material}</strong>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Cliente: {viaje.clienteNombre}
                  </div>
                </div>

                {/* Scales status */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-700/60">
                  <div>
                    <span className="text-slate-400 block">Báscula Carga:</span>
                    <span className="font-bold text-white">
                      {viaje.pesajeCarga ? `${viaje.pesajeCarga.pesoNetoTon} TM` : '⚠️ Sin registrar'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Báscula Descarga:</span>
                    <span className="font-bold text-emerald-400">
                      {viaje.pesajeDescarga ? `${viaje.pesajeDescarga.pesoNetoTon} TM` : 'En camino'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedViaje(viaje)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md mt-1"
                >
                  <Scale className="w-4 h-4" />
                  Registrar Pesaje de Báscula
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Pilot Scale Entry Form */
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block">Viaje Seleccionado:</span>
                <strong className="text-white text-sm">
                  {selectedViaje.codigoViaje} - {selectedViaje.buqueNombre}
                </strong>
                <div className="text-[11px] text-blue-300 font-mono">Placa {selectedViaje.placa}</div>
              </div>
              <button
                onClick={() => setSelectedViaje(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Volver
              </button>
            </div>

            <form onSubmit={handleSaveBoleta} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Momento del Pesaje</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setScaleType('CARGA');
                      setBasculaNombre('Báscula Muelle Puerto Santo Tomás');
                    }}
                    className={`py-2 rounded-xl font-bold transition-all border ${
                      scaleType === 'CARGA'
                        ? 'bg-blue-600 border-white text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    1. Carga Inicial (Muelle)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScaleType('DESCARGA');
                      setBasculaNombre('Báscula Destino Silos / Planta');
                    }}
                    className={`py-2 rounded-xl font-bold transition-all border ${
                      scaleType === 'DESCARGA'
                        ? 'bg-emerald-600 border-white text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    2. Descarga Final
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Número de Boleta</label>
                <input
                  type="text"
                  required
                  value={numeroBoleta}
                  onChange={(e) => setNumeroBoleta(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  placeholder="Ej. B-88190"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Peso Bruto (kg)</label>
                  <input
                    type="number"
                    required
                    value={pesoBruto}
                    onChange={(e) => setPesoBruto(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tara (kg)</label>
                  <input
                    type="number"
                    required
                    value={tara}
                    onChange={(e) => setTara(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-sm"
                  />
                </div>
              </div>

              {/* Net ton result */}
              <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-700 flex items-center justify-between text-xs">
                <span className="text-blue-300 font-semibold">Peso Neto Calculado:</span>
                <span className="font-mono text-base font-bold text-emerald-400">
                  {((pesoBruto - tara) / 1000).toFixed(2)} Toneladas (TM)
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Báscula</label>
                <input
                  type="text"
                  required
                  value={basculaNombre}
                  onChange={(e) => setBasculaNombre(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedViaje(null)}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  Guardar y Confirmar Pesaje
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
