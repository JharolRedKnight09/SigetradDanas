import React, { useState } from 'react';
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

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ModuleTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPilotoModal, setShowPilotoModal] = useState(false);

  const { currentUser, isAuthenticated, logout, theme } = useApp();

  // If user is not authenticated, show Login Screen immediately
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderModule = () => {
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
      className={`min-h-screen flex flex-col font-sans antialiased selection:bg-[#F4BA36] selection:text-[#0B0F17] transition-colors duration-200 ${
        theme === 'light' ? 'theme-light bg-slate-100 text-slate-900' : 'theme-dark bg-[#0B0F17] text-[#E2E8F0]'
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
            <div className="w-1.5 h-1.5 rounded-full bg-[#F4BA36] shadow-[0_0_8px_rgba(244,186,54,0.8)]"></div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className={theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium'}>
            {currentMeta.section}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span
            className={`px-2.5 py-0.5 rounded-md font-bold shadow-xs ${
              theme === 'light'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-[#1A2433] text-[#FFC82C] border border-[#F4BA36]/30'
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
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1A2433] to-[#131B26] border border-[#F4BA36]/40 text-white shadow-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F4BA36]/20 text-[#FFC82C] flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block text-white">Terminal Operador / Piloto Activa</span>
                    <span className="text-xs text-slate-400">
                      Dispone de acceso móvil optimizado para registrar básculas en muelle de sus viajes asignados.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowPilotoModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#F4BA36] hover:bg-[#FFC82C] text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(244,186,54,0.3)] whitespace-nowrap cursor-pointer transition-all"
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
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1A2433] hover:bg-[#F59E0B] text-[#FFC82C] hover:text-slate-950 border border-[#F4BA36]/50 shadow-2xl text-xs font-bold transition-all cursor-pointer backdrop-blur-md group"
        title="Probar y previsualizar la nueva pantalla de Login"
      >
        <span className="w-2 h-2 rounded-full bg-[#10B981] group-hover:bg-slate-900 animate-pulse"></span>
        <span>Ver Pantalla de Login</span>
      </button>

      {/* Mobile Pilot Portal Modal */}
      {showPilotoModal && (
        <PilotoPortalModal onClose={() => setShowPilotoModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
