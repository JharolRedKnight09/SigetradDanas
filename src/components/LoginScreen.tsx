import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Building2,
  Ship,
  Scale,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [identifier, setIdentifier] = useState('jairo.dannas');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    setTimeout(() => {
      const result = login(identifier.trim(), password);
      if (!result.success) {
        setErrorMsg(result.error || 'Credenciales incorrectas. Verifique e intente de nuevo.');
        setLoading(false);
      }
    }, 250);
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-white font-sans overflow-x-hidden selection:bg-[#F59E0B] selection:text-slate-950">
      
      {/* LEFT HALF: Full-screen Immersive Visual Landscape (Warm Golden-Amber Aesthetic) */}
      <div className="w-full lg:w-1/2 xl:w-[52%] min-h-[380px] lg:min-h-screen bg-gradient-to-br from-[#F59E0B] via-[#E68A00] to-[#B45309] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden text-white shadow-2xl lg:shadow-none z-10">
        
        {/* Stylized Sun Glow and Atmospheric Highlights */}
        <div className="absolute top-12 right-16 w-32 h-32 rounded-full bg-amber-200/90 shadow-[0_0_70px_rgba(254,243,199,0.85)] pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/15 blur-2xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-amber-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Branding */}
        <div className="relative z-10 space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-xs">
            <Truck className="w-4 h-4 text-amber-100" />
            <span className="tracking-wider uppercase font-mono text-[11px]">Transportes y Servicios Dannas, S.A.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-white drop-shadow-sm font-mono">
            SIGETRAD
          </h1>
          <p className="text-amber-100/95 text-sm sm:text-base font-medium leading-relaxed max-w-md">
            Sistema Integral de Gestión de Transportes, Control de Básculas Portuarias y Flota de Góndolas.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-amber-200/90 font-medium">
            <span className="inline-flex items-center gap-1 bg-black/10 px-2.5 py-1 rounded-md backdrop-blur-xs">
              <Ship className="w-3.5 h-3.5 text-amber-200" />
              Puerto Quetzal & Sto. Tomás
            </span>
            <span className="inline-flex items-center gap-1 bg-black/10 px-2.5 py-1 rounded-md backdrop-blur-xs">
              <Scale className="w-3.5 h-3.5 text-amber-200" />
              Pesaje Muelle SAT
            </span>
          </div>
        </div>

        {/* Center: Hero Graphic Convoy Illustration (Full Width SVG matching reference) */}
        <div className="relative z-10 my-8 sm:my-12 w-full max-w-2xl mx-auto">
          <svg
            className="w-full h-48 sm:h-64 lg:h-72 drop-shadow-lg"
            viewBox="0 0 500 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Rolling Hills / Mountain Horizon */}
            <path
              d="M-30 210 L140 70 L280 210 Z"
              fill="#92400E"
              opacity="0.85"
            />
            <path
              d="M90 210 L220 90 L380 210 Z"
              fill="#78350F"
              opacity="0.75"
            />
            <path
              d="M190 210 L340 50 L520 210 Z"
              fill="#B45309"
              opacity="0.9"
            />

            {/* Coastal highway / curve path */}
            <path
              d="M-20 220 Q 200 160, 520 200"
              stroke="#FEF3C7"
              strokeWidth="7"
              strokeDasharray="12 10"
              opacity="0.8"
            />

            {/* Stylized Port Palms */}
            <g transform="translate(410, 110) scale(0.8)">
              <path d="M20 90 Q 22 40, 28 10" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
              <path d="M28 10 Q 5 15, -12 35" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M28 10 Q 40 0, 65 15" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M28 10 Q 45 25, 60 45" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M28 10 Q 25 -10, 20 -25" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M28 10 Q 5 -5, -18 5" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </g>

            {/* Lead Heavy Truck 1 */}
            <g transform="translate(70, 160) scale(1.1)">
              <path d="M40 10 L54 10 L58 22 L58 32 L36 32 L36 14 Z" fill="#0F172A" />
              <path d="M42 12 L52 12 L55 20 L42 20 Z" fill="#94A3B8" />
              <rect x="0" y="14" width="35" height="18" rx="2" fill="#1E293B" />
              <circle cx="8" cy="33" r="5" fill="#020617" />
              <circle cx="18" cy="33" r="5" fill="#020617" />
              <circle cx="28" cy="33" r="5" fill="#020617" />
              <circle cx="50" cy="33" r="5" fill="#020617" />
            </g>

            {/* Truck 2 */}
            <g transform="translate(180, 150) scale(0.9)">
              <path d="M40 10 L54 10 L58 22 L58 32 L36 32 L36 14 Z" fill="#0F172A" />
              <path d="M42 12 L52 12 L55 20 L42 20 Z" fill="#94A3B8" />
              <rect x="0" y="14" width="35" height="18" rx="2" fill="#1E293B" />
              <circle cx="8" cy="33" r="5" fill="#020617" />
              <circle cx="18" cy="33" r="5" fill="#020617" />
              <circle cx="28" cy="33" r="5" fill="#020617" />
              <circle cx="50" cy="33" r="5" fill="#020617" />
            </g>

            {/* Truck 3 */}
            <g transform="translate(270, 142) scale(0.72)">
              <path d="M40 10 L54 10 L58 22 L58 32 L36 32 L36 14 Z" fill="#1E293B" />
              <rect x="0" y="14" width="35" height="18" rx="2" fill="#334155" />
              <circle cx="8" cy="33" r="5" fill="#020617" />
              <circle cx="18" cy="33" r="5" fill="#020617" />
              <circle cx="28" cy="33" r="5" fill="#020617" />
              <circle cx="50" cy="33" r="5" fill="#020617" />
            </g>
          </svg>
        </div>

        {/* Bottom Operational Status Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-100/90 pt-4 border-t border-white/20 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            <span>Servicios de Transporte & Logística de Carga Pesada</span>
          </div>
          <span className="text-amber-200/80 font-mono text-[11px]">Escuintla • Guatemala</span>
        </div>

        {/* Organic curved transition mask on desktop */}
        <div className="hidden lg:block absolute -right-1 top-0 bottom-0 w-20 pointer-events-none">
          <svg viewBox="0 0 100 500" preserveAspectRatio="none" className="w-full h-full fill-white">
            <path d="M0,0 C65,160 25,340 100,500 L100,0 Z" />
          </svg>
        </div>
      </div>

      {/* RIGHT HALF: Full-screen Clean, Elegant Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[48%] min-h-[500px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-20 bg-white relative z-20">
        
        {/* Top Spacer or Header link */}
        <div className="hidden lg:flex items-center justify-end text-xs text-slate-400 font-medium">
          <span className="inline-flex items-center gap-1 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Conexión Segura SSL • Acceso Restringido
          </span>
        </div>

        {/* Main Form Center Box */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          
          {/* Minimalist Corporate Emblem & Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] flex items-center justify-center text-white shadow-xl shadow-amber-500/30 mb-4 border-2 border-amber-300 transform hover:scale-105 transition-transform">
              <Truck className="w-10 h-10 drop-shadow-sm" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase font-mono">
              LOGIN
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">
              Ingrese a su cuenta de SIGETRAD
            </p>
          </div>

          {/* Error Message Notice */}
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input (Golden Pill matching reference) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 ml-3">
                Usuario Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-white">
                  <UserIcon className="w-5 h-5 drop-shadow-xs" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ej: jairo.dannas"
                  className="w-full pl-13 pr-4 py-3.5 sm:py-4 rounded-full bg-[#F59E0B] text-white placeholder-amber-100 font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-amber-400/40 shadow-md shadow-amber-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Input (Golden Pill matching reference) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 ml-3">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-white">
                  <Lock className="w-5 h-5 drop-shadow-xs" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-13 pr-12 py-3.5 sm:py-4 rounded-full bg-[#F59E0B] text-white placeholder-amber-100 font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-amber-400/40 shadow-md shadow-amber-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4.5 flex items-center text-amber-100 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help Links */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer hover:text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#F59E0B] border-slate-300 focus:ring-amber-400 accent-[#F59E0B]"
                />
                <span className="font-medium text-slate-600">Recordar sesión</span>
              </label>

              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-slate-500 hover:text-amber-600 transition-colors text-xs font-semibold cursor-pointer"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#E28807] hover:to-[#B45309] text-white font-black text-sm tracking-widest uppercase shadow-lg shadow-amber-500/35 hover:shadow-xl hover:shadow-amber-500/45 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-6 active:scale-[0.99]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span>LOGIN</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Help Modal info box */}
          {showHelp && (
            <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Soporte Corporativo Dannas</span>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Para restablecer sus credenciales o solicitar acceso institucional, comuníquese con la Gerencia de Operaciones o el Administrador del Sistema.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Corporate Footer */}
        <div className="pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
          <p className="font-medium text-slate-500">
            Transportes y Servicios Dannas, S.A. • SIGETRAD Enterprise
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Todos los derechos reservados © 2026
          </p>
        </div>

      </div>
    </div>
  );
};
