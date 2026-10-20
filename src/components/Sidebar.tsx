import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  Truck,
  Receipt,
  Wallet,
  FileBarChart,
  ShieldCheck,
  Ship,
  Lock,
  Building2,
  CreditCard,
  ChevronRight,
} from 'lucide-react';

export type ModuleTab =
  | 'dashboard'
  | 'clientes'
  | 'pilotos'
  | 'gondolas'
  | 'viajes'
  | 'facturacion'
  | 'pagos'
  | 'reportes'
  | 'seguridad';

interface SidebarProps {
  currentTab: ModuleTab;
  onSelectTab: (tab: ModuleTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: ModuleTab;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  roles: string[];
}

interface NavSection {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isOpen, onClose }) => {
  const { currentUser, viajes, facturas, instruccionesCobro, propietarios, theme } = useApp();

  const pendientesViaje = viajes.filter((v) => v.estado === 'Pendiente' || v.estado === 'En Curso').length;
  const pendientesFactura = facturas.filter((f) => f.estadoPago === 'Emitida').length;
  const pendientesInstrucciones = instruccionesCobro.filter((i) => !i.procesada).length;

  const sections: NavSection[] = [
    {
      title: 'OPERACIONES PORTUARIAS',
      items: [
        {
          id: 'dashboard',
          label: 'Panel Ejecutivo',
          sublabel: 'Resumen Operativo Global',
          icon: LayoutDashboard,
          roles: ['ADMIN', 'DUENO', 'SUPERVISOR', 'OPERADOR', 'PILOTO'],
        },
        {
          id: 'viajes',
          label: 'Operaciones y Básculas',
          sublabel: 'Pestañas por Buque y Pesajes',
          icon: Ship,
          badge: pendientesViaje > 0 ? `${pendientesViaje} activos` : undefined,
          badgeColor: 'bg-blue-600',
          roles: ['ADMIN', 'DUENO', 'SUPERVISOR', 'OPERADOR', 'PILOTO'],
        },
      ],
    },
    {
      title: 'COMERCIAL Y FINANZAS',
      items: [
        {
          id: 'clientes',
          label: 'Cartera de Clientes',
          sublabel: 'Agentes Retenedores SAT',
          icon: Users,
          roles: ['ADMIN', 'DUENO', 'SUPERVISOR'],
        },
        {
          id: 'facturacion',
          label: 'Centro de Facturación',
          sublabel: 'Registro y Emisión',
          icon: Receipt,
          badge: pendientesInstrucciones > 0 ? `${pendientesInstrucciones} pendientes` : undefined,
          badgeColor: 'bg-amber-600',
          roles: ['ADMIN', 'DUENO'],
        },
        {
          id: 'pagos',
          label: 'Conciliación y Tesorería',
          sublabel: 'Cuentas 3 Hermanos y Retenciones',
          icon: Wallet,
          badge: pendientesFactura > 0 ? `${pendientesFactura} pendientes` : undefined,
          badgeColor: 'bg-emerald-600',
          roles: ['ADMIN', 'DUENO'],
        },
      ],
    },
    {
      title: 'RECURSOS Y FLOTA',
      items: [
        {
          id: 'gondolas',
          label: 'Flota de Góndolas',
          sublabel: 'Unidades Triaxiales y Propietarios',
          icon: Truck,
          roles: ['ADMIN', 'DUENO', 'SUPERVISOR'],
        },
        {
          id: 'pilotos',
          label: 'Gestión de Pilotos',
          sublabel: 'Operadores y Licencias Activas',
          icon: UserSquare2,
          roles: ['ADMIN', 'DUENO', 'SUPERVISOR', 'OPERADOR', 'PILOTO'],
        },
      ],
    },
    {
      title: 'GOBIERNO Y CONTROL',
      items: [
        {
          id: 'reportes',
          label: 'Centro de Reportes',
          sublabel: 'Descarga Excel Maestro y PDF',
          icon: FileBarChart,
          roles: ['ADMIN', 'DUENO', 'SUPERVISOR'],
        },
        {
          id: 'seguridad',
          label: 'Seguridad y Usuarios',
          sublabel: 'Control de Acceso y Bitácora',
          icon: ShieldCheck,
          roles: ['ADMIN', 'DUENO', 'SUPERVISOR'],
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-30 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 flex flex-col transition-transform duration-200 ease-in-out ${
          theme === 'light'
            ? 'bg-white text-slate-700 border-r border-slate-200 shadow-sm'
            : 'bg-[#0B0F17] text-slate-300 border-r border-[#1E293B] shadow-[0_4px_24px_rgba(0,0,0,0.6)]'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Terminal metadata card */}
        <div
          className={`p-3.5 border-b ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200'
              : 'border-[#1E293B] bg-gradient-to-b from-[#131B26] to-[#0B0F17]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Terminal Operativa
            </span>
            <span className="text-[#10B981] font-bold bg-[#10B981]/15 px-1.5 py-0.2 rounded border border-[#10B981]/30">
              En Línea
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className={`font-bold truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {currentUser.cargo}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#1A2433] text-[#FFC82C] border border-[#F4BA36]/30 font-semibold">
              {currentUser.rol === 'DUENO' ? 'ADMIN' : currentUser.rol}
            </span>
          </div>
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {sec.title}
              </div>

              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const hasAccess = item.roles.includes(currentUser.rol);
                  const isSelected = currentTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      disabled={!hasAccess}
                      onClick={() => {
                        if (hasAccess) {
                          onSelectTab(item.id);
                          onClose();
                        }
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all duration-150 group ${
                        isSelected
                          ? 'bg-[#F4BA36] text-slate-950 font-bold shadow-[0_0_20px_rgba(244,186,54,0.35)]'
                          : hasAccess
                          ? theme === 'light'
                            ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-950 cursor-pointer'
                            : 'hover:bg-[#131B26] text-slate-300 hover:text-white cursor-pointer'
                          : 'opacity-40 cursor-not-allowed text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-slate-950/20 text-slate-950'
                              : hasAccess
                              ? theme === 'light'
                                ? 'bg-slate-100 border border-slate-200 text-slate-600 group-hover:text-amber-600'
                                : 'bg-[#131B26] border border-[#1E293B] text-slate-400 group-hover:text-[#FFC82C] group-hover:border-[#F4BA36]/30'
                              : 'bg-slate-800/40 text-slate-500 border border-transparent'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <div className="truncate">
                          <div
                            className={`text-xs font-semibold leading-tight ${
                              isSelected
                                ? 'text-slate-950'
                                : theme === 'light'
                                ? 'text-slate-800 group-hover:text-slate-950'
                                : 'text-slate-100 group-hover:text-white'
                            }`}
                          >
                            {item.label}
                          </div>
                          <div
                            className={`text-[10px] truncate ${
                              isSelected
                                ? 'text-slate-800 font-medium'
                                : theme === 'light'
                                ? 'text-slate-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {item.sublabel}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        {!hasAccess && <Lock className="w-3 h-3 text-slate-400" />}
                        {item.badge && hasAccess && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full text-white shadow-xs ${
                              isSelected ? 'bg-slate-950 text-white' : item.badgeColor || 'bg-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Corporate 3 Brothers Accounts Summary Card */}
        <div
          className={`p-3.5 m-3 rounded-2xl border text-xs space-y-2.5 transition-colors ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
              : 'bg-gradient-to-b from-slate-900/90 to-slate-950 border-slate-800/80 text-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between font-bold text-[10px] text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-500" />
              Cuentas 3 Hermanos Dannas
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div
              className={`flex items-center justify-between p-1 rounded-lg border ${
                theme === 'light'
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-950/60 border-slate-800/50'
              }`}
            >
              <span className={`font-medium pl-1 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                Jairo Dannas
              </span>
              <span className="text-emerald-500 font-mono text-[10px] bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                Banrural
              </span>
            </div>
            <div
              className={`flex items-center justify-between p-1 rounded-lg border ${
                theme === 'light'
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-950/60 border-slate-800/50'
              }`}
            >
              <span className={`font-medium pl-1 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                Carlos Dannas
              </span>
              <span className="text-blue-500 font-mono text-[10px] bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                Banco Ind.
              </span>
            </div>
            <div
              className={`flex items-center justify-between p-1 rounded-lg border ${
                theme === 'light'
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-950/60 border-slate-800/50'
              }`}
            >
              <span className={`font-medium pl-1 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                Edwin Dannas
              </span>
              <span className="text-amber-500 font-mono text-[10px] bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                G&T Cont.
              </span>
            </div>
          </div>

          <div
            className={`pt-1.5 border-t text-[9px] leading-tight ${
              theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-500'
            }`}
          >
            Distribución automática según número de placa asignada a cada hermano.
          </div>
        </div>
      </aside>
    </>
  );
};
