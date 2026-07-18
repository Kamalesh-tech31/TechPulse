import React from 'react';
import { useApp, AppProvider } from './AppContext';
import { LandingPage } from './components/LandingPage';
import { LoginPage }    from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Sidebar } from './components/Sidebar';
import { RouteProgressBar } from './components/RouteProgressBar';
import { DashboardView } from './components/DashboardView';
import { StockAnalysisView } from './components/StockAnalysisView';
import { TradingSimulatorView } from './components/TradingSimulatorView';
import { AIAssistantView } from './components/AIAssistantView';
import { LearningCenterView } from './components/LearningCenterView';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { ProfileView } from './components/ProfileView';
import { AmbientBackground } from './components/AmbientBackground';

import { Cpu } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, activeView, setActiveView, authLoading, isAuthInitialized } = useApp();

  // Mirror activeView → URL (one-way only, no feedback loop)
  React.useEffect(() => {
    if (user) return; // authenticated routes handled separately
    if (activeView === 'register' && window.location.pathname !== '/register') {
      window.history.pushState(null, '', '/register');
    } else if (activeView === 'signin' && window.location.pathname !== '/login') {
      window.history.pushState(null, '', '/login');
    } else if (activeView === 'landing' && window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  }, [activeView, user]);

  // Handle browser back/forward on unauthenticated routes
  React.useEffect(() => {
    const handlePop = () => {
      if (!user) {
        const path = window.location.pathname;
        if (path === '/register') setActiveView('register');
        else if (path === '/') setActiveView('landing');
        else setActiveView('signin');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [user, setActiveView]);

  // 0. Startup/Auth Loading State
  if (!isAuthInitialized) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D1117',
        color: '#fff',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            position: 'relative',
            width: '64px',
            height: '64px'
          }}>
            <div className="absolute inset-0 rounded-full border-2 border-trado-accent/10 border-t-trado-accent animate-spin" style={{ borderColor: 'rgba(59,130,246,0.1)', borderTopColor: '#3b82f6' }}></div>
            <div className="absolute inset-2 rounded-full border border-white/5 border-b-trado-accent animate-spin" style={{ animationDuration: '1.5s', borderColor: 'rgba(255,255,255,0.05)', borderBottomColor: '#3b82f6' }}></div>
            <Cpu className="absolute inset-0 m-auto h-6 w-6 text-trado-accent animate-pulse" style={{ color: '#3b82f6' }} />
          </div>
          <div style={{ color: '#9ca3af', fontSize: '14px', fontFamily: 'monospace' }}>Securing session...</div>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated — show landing, login or register based on activeView (source of truth)
  if (!user) {
    if (activeView === 'register') return <RegisterPage />;
    if (activeView === 'signin') return <LoginPage />;
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
      case 'portfolio-analyzer': return <AIAssistantView />;
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
