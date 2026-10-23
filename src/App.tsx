import React, { Component, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ModuleTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ClientesModule } from './components/ClientesModule';
import { PilotosModule } from './components/PilotosModule';
import { GondolasModule } from './components/GondolasModule';
import { ViajesModule } from './components/ViajesModule';
import { FacturacionModule } from './components/FacturacionModule';
import { PagosModule } from './components/PagosModule';
import { ReportesModule } from './components/ReportesModule';
import { SeguridadModule } from './components/SeguridadModule';
import { PilotoPortalModal } from './components/PilotoPortalModal';
import { LoginScreen } from './components/LoginScreen';
import {
  Smartphone,
  ChevronRight,
  Calendar,
  Building2,
  FileCheck2,
  DollarSign,
} from 'lucide-react';

const TAB_TITLES: Record<ModuleTab, { title: string; section: string }> = {
  dashboard: { title: 'Tablero Ejecutivo', section: 'Consola General' },
  clientes: { title: 'Cartera de Clientes', section: 'Gestión Comercial' },
  pilotos: { title: 'Gestión de Pilotos', section: 'Recursos Humanos' },
  gondolas: { title: 'Flota de Góndolas', section: 'Flota y Activos' },
  viajes: { title: 'Operaciones y Básculas', section: 'Operaciones Portuarias' },
  facturacion: { title: 'Centro de Facturación', section: 'Administración Financiera' },
  pagos: { title: 'Conciliación y Tesorería', section: 'Tesorería y Bancos' },
  reportes: { title: 'Centro de Reportes', section: 'Analítica y Reportes' },
  seguridad: { title: 'Seguridad y Usuarios', section: 'Gobierno Corporativo' },
};

const ROLE_PERMITTED_TABS: Record<string, ModuleTab[]> = {
  ADMIN: ['dashboard', 'clientes', 'pilotos', 'gondolas', 'viajes', 'facturacion', 'pagos', 'reportes', 'seguridad'],
  DUENO: ['dashboard', 'clientes', 'pilotos', 'gondolas', 'viajes', 'facturacion', 'pagos', 'reportes', 'seguridad'],
  SUPERVISOR: ['dashboard', 'clientes', 'pilotos', 'gondolas', 'viajes', 'reportes'],
  OPERADOR: ['dashboard', 'viajes', 'pilotos'],
  PILOTO: ['dashboard', 'viajes', 'pilotos'],
};

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ModuleTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPilotoModal, setShowPilotoModal] = useState(false);

  const { currentUser, isAuthenticated, logout, theme } = useApp();

  // If user is not authenticated, show Login Screen immediately
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const allowedTabs = ROLE_PERMITTED_TABS[currentUser.rol] || ['dashboard', 'viajes'];
  const hasAccess = allowedTabs.includes(currentTab);

  const renderModule = () => {
    if (!hasAccess) {
      return (
        <div className="min-h-[380px] flex items-center justify-center p-6">
          <div className={`max-w-md w-full rounded-3xl p-8 border text-center shadow-xl space-y-4 ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#131B26] border-[#1E293B] text-white'
          }`}>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <div>
              <h2 className="text-base font-bold">Módulo Restringido por Rol</h2>
              <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold ${
                theme === 'light' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                Rama Activa: {currentUser.rol === 'OPERADOR' || currentUser.rol === 'PILOTO' ? 'Operador / Conductor de Góndola' : currentUser.rol}
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Este módulo contiene información financiera o administrativa reservada. Su cuenta tiene acceso a su terminal de viajes, pesaje en básculas y asignaciones.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setCurrentTab('viajes')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Ir a Operaciones y Básculas
              </button>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`w-full py-2 px-4 rounded-xl text-xs font-semibold cursor-pointer border ${
                  theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Volver a Panel Principal
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'clientes':
        return <ClientesModule />;
      case 'pilotos':
        return <PilotosModule />;
      case 'gondolas':
        return <GondolasModule />;
      case 'viajes':
        return <ViajesModule />;
      case 'facturacion':
        return <FacturacionModule />;
      case 'pagos':
        return <PagosModule />;
      case 'reportes':
        return <ReportesModule />;
      case 'seguridad':
        return <SeguridadModule />;
      default:
        return <Dashboard onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  const currentMeta = TAB_TITLES[currentTab] || { title: 'Módulo', section: 'Sistema' };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased selection:bg-[#2563EB] selection:text-white transition-colors duration-200 ${
        theme === 'light' ? 'theme-light bg-slate-100 text-slate-900' : 'theme-dark dark bg-[#0B0F17] text-[#E2E8F0]'
      }`}
    >
      {/* Corporate Top Navbar */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onOpenPilotoModal={() => setShowPilotoModal(true)}
      />

      {/* Corporate Institutional Sub-bar */}
      <div
        className={`${
          theme === 'light'
            ? 'bg-white border-b border-slate-200 text-slate-700 shadow-xs'
            : 'bg-[#0D131C]/90 backdrop-blur-md border-b border-[#1E293B] shadow-[0_1px_8px_rgba(0,0,0,0.4)] text-slate-400'
        } px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs transition-colors`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold tracking-tight uppercase font-mono ${
                theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'
              }`}
            >
              SIGETRAD
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shadow-[0_0_8px_rgba(37,99,235,0.8)]"></div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className={theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium'}>
            {currentMeta.section}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span
            className={`px-2.5 py-0.5 rounded-md font-bold shadow-xs ${
              theme === 'light'
                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                : 'bg-[#1A2433] text-[#38BDF8] border border-blue-500/40'
            }`}
          >
            {currentMeta.title}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div
            className={`hidden md:flex items-center gap-1.5 font-mono px-2.5 py-1 rounded-md border ${
              theme === 'light'
                ? 'bg-slate-50 text-slate-700 border-slate-200'
                : 'bg-[#131B26] text-slate-400 border-[#1E293B]'
            }`}
          >
            <DollarSign className="w-3 h-3 text-[#10B981]" />
            <span>
              USD/GTQ: <strong className={theme === 'light' ? 'text-slate-900' : 'text-slate-200'}>Q 7.78</strong> (Banguat)
            </span>
          </div>
          <span className="hidden md:inline text-slate-400">•</span>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
              theme === 'light'
                ? 'bg-slate-50 text-slate-700 border-slate-200'
                : 'bg-[#131B26] text-slate-300 border-[#1E293B]'
            }`}
          >
            <FileCheck2 className="w-3 h-3 text-[#F4BA36]" />
            <span className="font-medium">Régimen General SAT • Carga Pesada</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-colors duration-200 ${
            theme === 'light' ? 'bg-slate-100/90 text-slate-900' : 'bg-[#0B0F17] text-slate-100'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Contextual Notice for Operator / Pilot role */}
            {currentUser.rol === 'PILOTO' && (
              <div className={`p-4 rounded-2xl border shadow-lg flex items-center justify-between gap-3 ${
                theme === 'light'
                  ? 'bg-blue-50/80 border-blue-200 text-slate-800'
                  : 'bg-gradient-to-r from-[#1A2433] to-[#131B26] border-blue-500/40 text-white'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    theme === 'light' ? 'bg-blue-100 text-[#2563EB]' : 'bg-[#2563EB]/20 text-[#38BDF8]'
                  }`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`font-bold text-sm block ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Terminal Operador / Piloto Activa</span>
                    <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      Dispone de acceso móvil optimizado para registrar básculas en muelle de sus viajes asignados.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowPilotoModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-blue-600/30 whitespace-nowrap cursor-pointer transition-all"
                >
                  Abrir Portal Móvil
                </button>
              </div>
            )}

            {/* Render Selected View */}
            {renderModule()}
          </div>
        </main>
      </div>

      {/* Floating quick toggle to preview Login Screen */}
      <button
        onClick={logout}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-[#2563EB] text-slate-100 hover:text-white border border-blue-500/40 shadow-2xl text-xs font-bold transition-all cursor-pointer backdrop-blur-md group"
        title="Probar y previsualizar la nueva pantalla de Login"
      >
        <span className="w-2 h-2 rounded-full bg-[#10B981] group-hover:bg-white animate-pulse"></span>
        <span>Ver Pantalla de Login</span>
      </button>

      {/* Mobile Pilot Portal Modal */}
      {showPilotoModal && (
        <PilotoPortalModal onClose={() => setShowPilotoModal(false)} />
      )}
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    (this as any).state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error no controlado en la aplicación SIGETRAD:', error, errorInfo);
  }

  public handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <h1 className="text-xl font-bold text-white">SIGETRAD - Recuperación del Sistema</h1>
            <p className="text-xs text-slate-300">
              Ocurrió una inconsistencia en los datos temporales guardados en este navegador.
            </p>
            <div className="p-3 rounded-xl bg-slate-950 text-left text-[11px] font-mono text-rose-300 overflow-x-auto max-h-32">
              {(this as any).state.error?.message || 'Error desconocido'}
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-600/30"
              >
                Limpiar Datos Locales y Entrar
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}