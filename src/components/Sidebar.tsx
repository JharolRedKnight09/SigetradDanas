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
  const { currentUser, viajes, facturas, instruccionesCobro, propietarios } = useApp();

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
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-950 text-slate-300 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Terminal metadata card */}
        <div className="p-3.5 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/80 to-slate-950/60">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Terminal Operativa
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/50">
              En Línea
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-200 font-bold truncate">{currentUser.cargo}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/60 font-semibold">
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
                          ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-600/25'
                          : hasAccess
                          ? 'hover:bg-slate-900/90 text-slate-300 hover:text-white cursor-pointer'
                          : 'opacity-40 cursor-not-allowed text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-white/20 text-white shadow-xs'
                              : hasAccess
                              ? 'bg-slate-900 border border-slate-800/80 text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-800 group-hover:border-slate-700'
                              : 'bg-slate-900/50 text-slate-600 border border-transparent'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-semibold leading-tight">{item.label}</div>
                          <div
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-blue-100 font-medium' : 'text-slate-400'
                            }`}
                          >
                            {item.sublabel}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        {!hasAccess && <Lock className="w-3 h-3 text-slate-600" />}
                        {item.badge && hasAccess && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full text-white shadow-xs ${
                              isSelected ? 'bg-blue-900/90 border border-blue-400/30' : item.badgeColor || 'bg-slate-700'
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
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between font-bold text-[10px] text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              Cuentas 3 Hermanos Dannas
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between p-1 rounded-lg bg-slate-950/60 border border-slate-800/50">
              <span className="text-slate-200 font-medium pl-1">Jairo Dannas</span>
              <span className="text-emerald-400 font-mono text-[10px] bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">Banrural</span>
            </div>
            <div className="flex items-center justify-between p-1 rounded-lg bg-slate-950/60 border border-slate-800/50">
              <span className="text-slate-200 font-medium pl-1">Carlos Dannas</span>
              <span className="text-blue-400 font-mono text-[10px] bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">Banco Ind.</span>
            </div>
            <div className="flex items-center justify-between p-1 rounded-lg bg-slate-950/60 border border-slate-800/50">
              <span className="text-slate-200 font-medium pl-1">Edwin Dannas</span>
              <span className="text-amber-400 font-mono text-[10px] bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">G&T Cont.</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800 text-[9px] text-slate-500 leading-tight">
            Distribución automática según número de placa asignada a cada hermano.
          </div>
        </div>
      </aside>
    </>
  );
};
