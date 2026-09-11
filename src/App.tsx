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

  const { currentUser, isAuthenticated } = useApp();

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
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Corporate Top Navbar */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onOpenPilotoModal={() => setShowPilotoModal(true)}
      />

      {/* Corporate Institutional Sub-bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="font-bold text-slate-700 tracking-tight">SIGETRAD</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">{currentMeta.section}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200/60 shadow-2xs">
            {currentMeta.title}
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 text-[11px]">
          <div className="hidden md:flex items-center gap-1.5 font-mono bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60">
            <DollarSign className="w-3 h-3 text-emerald-600" />
            <span>USD/GTQ: <strong className="text-slate-800">Q 7.78</strong> (Banguat)</span>
          </div>
          <span className="hidden md:inline text-slate-300">•</span>
          <div className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60">
            <FileCheck2 className="w-3 h-3 text-blue-600" />
            <span className="font-medium text-slate-700">Régimen General SAT • Carga Pesada</span>
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F4F6F9]">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Contextual Notice for Operator / Pilot role */}
            {currentUser.rol === 'PILOTO' && (
              <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold text-sm block">Terminal Operador / Piloto Activa</span>
                    <span className="text-xs text-amber-100">
                      Dispone de acceso móvil optimizado para registrar básculas en muelle de sus viajes asignados.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowPilotoModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs whitespace-nowrap cursor-pointer"
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
