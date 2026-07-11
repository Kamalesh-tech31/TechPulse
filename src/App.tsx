import React from 'react';
import { useApp, AppProvider } from './AppContext';
import { LandingPage } from './components/LandingPage';
import { AuthPages } from './components/AuthPages';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Sidebar } from './components/Sidebar';
import { RouteProgressBar } from './components/RouteProgressBar';
import { DashboardView } from './components/DashboardView';
import { StockAnalysisView } from './components/StockAnalysisView';
import { TradingSimulatorView } from './components/TradingSimulatorView';
import { PortfolioAnalyzerView } from './components/PortfolioAnalyzerView';
import { LearningCenterView } from './components/LearningCenterView';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { ProfileView } from './components/ProfileView';
import { AmbientBackground } from './components/AmbientBackground';

const AppContent: React.FC = () => {
  const { user, activeView } = useApp();

  // 1. Unauthenticated — show landing or auth pages (no sidebar)
  if (!user) {
    if (activeView === 'signin')   return <AuthPages type="signin" />;
    if (activeView === 'register') return <AuthPages type="register" />;
    return <LandingPage />;
  }

  // 2. Onboarding — full-screen, no sidebar
  if (!user.onboardingCompleted || activeView === 'onboarding') {
    return <OnboardingFlow />;
  }

  // 3. Authenticated layout
  const renderMainView = () => {
    switch (activeView) {
      case 'dashboard':          return <DashboardView />;
      case 'stock-analysis':
      case 'stock-detail':       return <StockAnalysisView />;
      case 'virtual-trading':    return <TradingSimulatorView />;
      case 'portfolio-analyzer': return <PortfolioAnalyzerView />;
      case 'transaction-history':return <TransactionHistoryView />;
      case 'learning-center':    return <LearningCenterView />;
      case 'profile':            return <ProfileView />;
      default:                   return <DashboardView />;
    }
  };

  return (
    <div
      id="trado-app"
      style={{
        display:         'flex',
        flexDirection:   'row',
        width:           '100%',
        height:          '100vh',
        overflow:        'hidden',
        backgroundColor: 'var(--color-trado-bg)',
        color:           'var(--color-trado-text)',
        position:        'relative',
      }}
    >
      {/* ── Shared ambient background — position:fixed so it persists across routes ── */}
      <AmbientBackground />

      {/* Sidebar — handles its own mobile/desktop rendering internally */}
      <Sidebar />

      {/* Main content area — fills all space left of sidebar */}
      <main
        id="trado-main"
        style={{
          flex:      1,
          minWidth:  0,       /* critical: prevents flex overflow on narrow screens */
          height:    '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          position:  'relative',
          zIndex:    10,
          display:   'flex',
          flexDirection: 'column',
        }}
      >
        {/* Route-change progress sliver */}
        <RouteProgressBar />

        {/*
          Mobile top spacer — compensates for the fixed MobileBar (56px).
          Hidden on md+ where the sidebar is a flex column (no fixed bar).
        */}
        <div className="md:hidden" style={{ height: 56, flexShrink: 0 }} />

        {/* Page content */}
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          {renderMainView()}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
