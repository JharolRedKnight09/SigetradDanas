import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Ship,
  Scale,
  Building2,
  FileCheck2,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    setTimeout(() => {
      const result = login(identifier, password);
      if (!result.success) {
        setErrorMsg(result.error || 'Credenciales no válidas. Verifique su usuario y contraseña.');
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans relative overflow-hidden">
      {/* Background subtle radial illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Corporate Status Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="tracking-wide uppercase font-bold text-[11px] text-slate-300">
              Transportes y Servicios Dannas, S.A.
            </span>
          </div>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            NIT: 9845120-4 • Escuintla / Puerto Quetzal, Guatemala
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Sistema Operativo</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="font-mono text-[11px] text-slate-400">SIGETRAD Enterprise v2.4</span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-950">
          
          {/* Left Column: Corporate Brand & Operational Highlights */}
          <div className="lg:col-span-6 p-8 sm:p-10 bg-gradient-to-br from-slate-900/95 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Logo & Corporate Identity */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-blue-400/30">
                  <Truck className="w-6 h-6 drop-shadow-xs" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white tracking-tight font-mono flex items-center gap-2">
                    SIGETRAD
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-blue-900/80 to-indigo-900/80 text-blue-300 border border-blue-700/60 uppercase tracking-wider shadow-xs">
                      Empresarial
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Sistema de Gestión de Transportes y Básculas Dannas
                  </p>
                </div>
              </div>

              {/* Mission statement */}
              <div className="space-y-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                  Plataforma Centralizada de Operaciones de Carga Pesada y Granel
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Solución institucional de gestión logística para la flota de góndolas triaxiales. Control estricto de buques, básculas portuarias de entrada y destino, liquidación bancaria centralizada a cuentas de propietarios y cálculo automático de retenciones fiscales.
                </p>
              </div>

              {/* Institutional feature list */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-xs">
                  <div className="p-2 rounded-xl bg-slate-800/80 text-blue-400 border border-slate-700/80 mt-0.5 shadow-2xs">
                    <Ship className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 block">Pestañas Operativas por Buque</span>
                    <span className="text-slate-400 text-[11px]">
                      Control de operaciones portuarias con asignación de fechas, buques y materiales (Carbón, Clinker, Soya, Maíz, Trigo).
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="p-2 rounded-xl bg-slate-800/80 text-emerald-400 border border-slate-700/80 mt-0.5 shadow-2xs">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 block">Pesaje en Básculas Muelle vs. Destino</span>
                    <span className="text-slate-400 text-[11px]">
                      Detección instantánea de mermas y diferencias de tonelaje entre peso origen y peso final.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="p-2 rounded-xl bg-slate-800/80 text-amber-400 border border-slate-700/80 mt-0.5 shadow-2xs">
                    <FileCheck2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 block">Conciliación Tributaria y Liquidación de Cuentas</span>
                    <span className="text-slate-400 text-[11px]">
                      Cálculo automático de retenciones con dispersión bancaria individualizada para las unidades de cada propietario.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Footer */}
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Auditoría Inmutable y Seguridad RBAC
              </span>
              <span className="font-mono">Guatemala, C.A.</span>
            </div>
          </div>

          {/* Right Column: Clean Enterprise Authentication Card */}
          <div className="lg:col-span-6 p-8 sm:p-10 bg-slate-900/90 flex flex-col justify-between space-y-6">
            <div>
              <div className="border-b border-slate-800/80 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-400" />
                    Acceso a la Terminal
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/80">
                    Seguro TLS 1.3
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Ingrese sus credenciales asignadas para acceder al sistema.
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Usuario o Correo Corporativo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Ingrese su usuario o correo"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Recordar sesión en este equipo</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Autenticando en servidor...
                    </span>
                  ) : (
                    <>
                      <span>Ingresar al Sistema</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Corporate Security Advisory */}
            <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Control de Acceso Seguro y Confidencial</span>
              </div>
              <p className="leading-relaxed">
                Este sistema es de uso exclusivo para el personal autorizado de Transportes y Servicios Dannas, S.A. Cada intento de inicio de sesión queda registrado en la bitácora de auditoría.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 sm:px-8 py-3 text-center text-slate-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10">
        <span>
          © 2026 Transportes y Servicios Dannas, Sociedad Anónima. Todos los derechos reservados.
        </span>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Términos de Servicio</span>
          <span>•</span>
          <span>Políticas de Privacidad</span>
          <span>•</span>
          <span>Soporte TI: +502 5521-8900</span>
        </div>
      </footer>
    </div>
  );
};
