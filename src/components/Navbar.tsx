import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Shield,
  UserCheck,
  RotateCcw,
  Menu,
  X,
  ChevronDown,
  Building2,
  FileSpreadsheet,
  AlertCircle,
  Smartphone,
  LogOut,
  Ship,
  CheckCircle2,
  SlidersHorizontal,
  Sun,
  Moon,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onOpenPilotoModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, onOpenPilotoModal }) => {
  const { currentUser, setCurrentUser, users, restaurarDatosDemo, viajes, facturas, logout, theme, toggleTheme } = useApp();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const viajesActivos = viajes.filter((v) => v.estado === 'En Curso').length;
  const facturasPendientes = facturas.filter((f) => f.estadoPago === 'Emitida').length;

  const getRoleBadgeColor = (rol: UserRole) => {
    switch (rol) {
      case 'DUENO':
      case 'ADMIN':
        return 'bg-blue-900/60 text-blue-300 border-blue-700/60';
      case 'SUPERVISOR':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      case 'OPERADOR':
      case 'PILOTO':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getRoleLabel = (rol: UserRole) => {
    switch (rol) {
      case 'DUENO':
      case 'ADMIN':
        return 'Administrador';
      case 'SUPERVISOR':
        return 'Supervisor Operaciones';
      case 'OPERADOR':
      case 'PILOTO':
        return 'Piloto / Operador';
    }
  };

  return (
    <header className="bg-[#0B0F17]/95 backdrop-blur-xl text-white border-b border-[#1E293B] sticky top-0 z-40 shadow-[0_1px_12px_rgba(0,0,0,0.6)]">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Corporate Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1A2433] lg:hidden cursor-pointer transition-colors"
              aria-label="Abrir Menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4BA36]/15 border border-[#F4BA36]/40 flex items-center justify-center text-[#FFC82C] shadow-[0_0_15px_rgba(244,186,54,0.25)] shrink-0">
                <Truck className="w-5 h-5 drop-shadow-xs" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white font-mono uppercase">
                    SIGETRAD
                  </span>
                  <div className="w-2 h-2 rounded-full bg-[#F4BA36] shadow-[0_0_8px_rgba(244,186,54,0.9)]"></div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1A2433] text-[#FFC82C] border border-[#F4BA36]/30 shadow-xs">
                    Enterprise TMS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Transportes y Servicios Dannas, S.A. • Carga Pesada y Granel
                </p>
              </div>
            </div>
          </div>

          {/* Center: Live Corporate Operational Telemetry */}
          <div className="hidden lg:flex items-center gap-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131B26] border border-[#1E293B] text-[11px] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span className="text-slate-400">Puerto:</span>
              <span className="font-semibold text-slate-200">Barrios y Sto. Tomás</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131B26] border border-[#1E293B] text-[11px] shadow-xs">
              <Ship className="w-3.5 h-3.5 text-[#0EA5E9]" />
              <span className="text-slate-400">Viajes en Ruta:</span>
              <strong className="text-[#0EA5E9] font-mono">{viajesActivos}</strong>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131B26] border border-[#1E293B] text-[11px] shadow-xs">
              <AlertCircle className="w-3.5 h-3.5 text-[#FFC82C]" />
              <span className="text-slate-400">Por Conciliar:</span>
              <strong className="text-[#FFC82C] font-mono">{facturasPendientes}</strong>
            </div>
          </div>

          {/* Right: User Profile & Corporate Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Pilot View Quick Trigger */}
            {onOpenPilotoModal && (
              <button
                onClick={onOpenPilotoModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1A2433] hover:bg-[#1E293B] text-slate-200 hover:text-[#FFC82C] border border-[#1E293B] transition-all cursor-pointer shadow-xs"
                title="Abrir interfaz móvil para registrar pesajes en muelle"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#FFC82C]" />
                <span className="text-[11px]">Portal Piloto</span>
              </button>
            )}

            {/* Corporate User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#131B26] hover:bg-[#1A2433] border border-[#1E293B] transition-all text-xs cursor-pointer shadow-xs"
                title="Perfil corporativo activo"
              >
                <div className="w-7 h-7 rounded-lg bg-[#F4BA36] text-slate-950 font-bold flex items-center justify-center text-xs shadow-xs">
                  {currentUser.nombre.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-bold text-slate-100 leading-tight">{currentUser.nombre}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className={`px-1.5 py-0.2 rounded-md font-bold border ${getRoleBadgeColor(currentUser.rol)}`}>
                      {currentUser.rol === 'DUENO' ? 'ADMIN' : currentUser.rol}
                    </span>
                    <span className="truncate max-w-[110px]">• {currentUser.cargo}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role & Session Dropdown */}
              {showRoleSelector && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60">
                    <div className="font-bold text-white text-sm">{currentUser.nombre}</div>
                    <div className="text-slate-400 text-[11px]">{currentUser.email}</div>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Rol Activo:</span>
                      <span className={`px-2 py-0.5 rounded font-bold border ${getRoleBadgeColor(currentUser.rol)}`}>
                        {getRoleLabel(currentUser.rol)}
                      </span>
                    </div>
                  </div>

                  <div className="px-4 py-3 text-slate-400 text-[11px] leading-relaxed border-b border-slate-800">
                    <span className="text-slate-300 font-semibold block mb-0.5">Terminal Autenticada</span>
                    Para cambiar de usuario, cierre su sesión actual e ingrese con las nuevas credenciales en la pantalla de inicio de sesión.
                  </div>

                  <div className="p-2 bg-slate-950/40">
                    <button
                      onClick={() => {
                        setShowRoleSelector(false);
                        logout();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button (Modo Claro / Modo Oscuro) */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border ${
                theme === 'dark'
                  ? 'bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border-amber-400/30'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
              }`}
              title={theme === 'dark' ? 'Cambiar a Modo Claro en el panel central' : 'Cambiar a Modo Oscuro en el panel central'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="hidden sm:inline">Modo Oscuro</span>
                </>
              )}
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => setShowConfirmReset(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition-colors cursor-pointer border border-transparent hover:border-slate-800"
              title="Restablecer datos originales de levantamiento"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Preview Login Screen Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 text-[#FFC82C] border border-[#F59E0B]/40 transition-all cursor-pointer shadow-xs"
              title="Cerrar sesión para ver y probar la nueva pantalla de Login"
            >
              <LogOut className="w-3.5 h-3.5 text-[#FFC82C]" />
              <span>Ver Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Confirm Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              ¿Restablecer datos corporativos demo?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Esto restaurará todos los registros de viajes, facturas, clientes, góndolas y parámetros de combustible a los valores iniciales.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  restaurarDatosDemo();
                  setShowConfirmReset(false);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
              >
                Sí, Restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
