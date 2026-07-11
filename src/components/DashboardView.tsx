import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  BookOpen, 
  Award, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { AnimatedCard } from './AnimatedCard';
import { useCountUp } from '../hooks/useCountUp';

/* CSS token shortcuts */
const accent    = 'var(--color-trado-accent)';    // primary — CTA + active nav only
const secondary = 'var(--color-trado-secondary)'; // feature icons, decorative elements
const success   = 'var(--color-trado-success)';
const danger    = 'var(--color-trado-danger)';

export const DashboardView: React.FC = () => {
  const { user, holdings, transactions, stocks, setActiveView, setSelectedStockId } = useApp();
  
  // Nifty 50 simulated index tracking
  const [niftyIndex, setNiftyIndex] = useState(22340.50);
  const [niftyHistory, setNiftyHistory] = useState<number[]>([
    22210, 22250, 22230, 22290, 22310, 22280, 22340.50
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNiftyIndex((prev) => {
        const pct = (Math.random() * 0.16 - 0.08) / 100;
        const diff = prev * pct;
        const next = Math.round((prev + diff) * 100) / 100;

        setNiftyHistory((hist) => {
          const nextHist = [...hist];
          nextHist.shift();
          nextHist.push(next);
          return nextHist;
        });

        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  // Calculate portfolio metrics
  const portfolioValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const netProfitLoss = portfolioValue - totalCost;
  const netProfitLossPct = totalCost > 0 ? (netProfitLoss / totalCost) * 100 : 0;
  
  const isProfit = netProfitLoss >= 0;

  // Calculate learning metrics
  const lessonsCompleted = user.onboarding?.experience === 'Beginner' ? 1 : 2;
  const quizzesTaken = transactions.length > 0 ? 1 : 0;
  const learningProgress = Math.min(100, Math.round(((lessonsCompleted + quizzesTaken) / 6) * 100));

  // Count-up targets
  const animWallet    = useCountUp(user.walletBalance,   600);
  const animPortfolio = useCountUp(portfolioValue,       600);
  const animPL        = useCountUp(Math.abs(netProfitLoss), 600);
  const animProgress  = useCountUp(learningProgress,     600);

  // Render index sparkline
  const renderNiftyChart = () => {
    const min = Math.min(...niftyHistory);
    const max = Math.max(...niftyHistory);
    const range = max - min || 1;
    const width = 300;
    const height = 80;
    const points = niftyHistory.map((val, idx) => {
      const x = (idx / (niftyHistory.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 12) - 6;
      return `${x},${y}`;
    }).join(' ');

    const lastClose = niftyHistory[0];
    const indexChange = niftyIndex - lastClose;
    const indexChangePct = (indexChange / lastClose) * 100;

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
        <div>
          <span className="text-xs font-mono text-gray-500 uppercase tracking-wider block">Market Indicator</span>
          <h4 className="font-display font-semibold text-lg text-white mt-1">NIFTY 50 Index</h4>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-mono font-bold text-white">
              {niftyIndex.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-mono font-semibold flex items-center ${indexChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {indexChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {indexChange >= 0 ? '+' : ''}{indexChange.toFixed(2)} ({indexChangePct.toFixed(2)}%)
            </span>
          </div>
          <span className="text-[10px] text-gray-600 font-mono block mt-1">Live updates • Simulated feed</span>
        </div>
        <div className="w-full sm:w-auto h-20 flex items-center">
          <svg className="w-full sm:w-[300px] h-20" viewBox="0 0 300 80">
            <defs>
              {/* Chart uses accent — it's the key data highlight, one of 2-3 allowed per screen */}
              <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#4F6BFF" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#4F6BFF" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path
              d={`M 0,80 L ${points} L 300,80 Z`}
              fill="url(#chartGlow)"
            />
            <polyline
              fill="none"
              stroke="#4F6BFF"
              strokeWidth="2.5"
              points={points}
              style={{ filter: 'drop-shadow(0 0 6px rgba(79,107,255,0.5))' }}
            />
            {/* Live dot — static with glow, no pulse */}
            <circle
              cx={width}
              cy={height - ((niftyIndex - min) / range) * (height - 12) - 6}
              r="3.5"
              fill="#4F6BFF"
              style={{ filter: 'drop-shadow(0 0 5px rgba(79,107,255,0.8))' }}
            />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto text-gray-200">
      
      {/* Welcome Block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            Welcome back, {user.name}!{' '}
            {/* Sparkles: decorative — use secondary color, no pulse */}
            <Sparkles className="h-5 w-5" style={{ color: secondary, opacity: 0.7 }} />
          </h1>
          <p className="text-gray-400 text-sm mt-1.5">
            Personalized dashboard for a{' '}
            {/* Inline emphasis — secondary/muted, not primary accent */}
            <span className="font-medium" style={{ color: secondary }}>
              {user.onboarding?.experience || 'Beginner'}
            </span>{' '}
            interested in{' '}
            <span className="font-medium" style={{ color: secondary }}>
              {user.onboarding?.primaryGoal || 'Virtual Trading'}
            </span>.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] px-4 py-2.5 rounded-xl text-xs font-mono">
          <span
            className="animate-status-pulse"
            style={{
              display:     'inline-block',
              height:      8,
              width:       8,
              borderRadius: '50%',
              background:  'var(--color-trado-success)',
              flexShrink:  0,
              boxShadow:   '0 0 8px rgba(62,207,142,0.5)',
            }}
          />
          <span className="text-gray-400">Trading Simulator: ACTIVE</span>
        </div>
      </div>

      {/* Main Asset Cards Grid — 4-col desktop, 2-col tablet, 1-col mobile */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Virtual Cash */}
        <AnimatedCard delay={0} className="glassmorphism p-5 rounded-2xl relative overflow-hidden border-trado-border">
          <div className="absolute right-[-15px] top-[-15px] w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ background: 'rgba(79,107,255,0.04)' }}></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Virtual Balance</span>
            {/* Coin icon — secondary (decorative metric card icon) */}
            <Coins className="h-4.5 w-4.5" style={{ color: secondary }} />
          </div>
          <h3 className="text-2xl font-mono font-bold text-white mt-4">
            ₹{animWallet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            Risk-free virtual assets
          </p>
        </AnimatedCard>

        {/* Card 2: Portfolio Value */}
        <AnimatedCard delay={80} className="glassmorphism p-5 rounded-2xl relative overflow-hidden border-trado-border">
          <div className="absolute right-[-15px] top-[-15px] w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ background: 'rgba(79,107,255,0.03)' }}></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Portfolio Positions</span>
            {/* PieChart icon — secondary */}
            <PieChart className="h-4.5 w-4.5" style={{ color: secondary }} />
          </div>
          <h3 className="text-2xl font-mono font-bold text-white mt-4">
            ₹{animPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-gray-500 text-xs mt-2">
            Spread across <span className="text-white font-medium">{holdings.length}</span> positions
          </p>
        </AnimatedCard>

        {/* Card 3: Today's Profit & Loss */}
        <AnimatedCard delay={160} className="glassmorphism p-5 rounded-2xl relative overflow-hidden border-trado-border">
          <div className="absolute right-[-15px] top-[-15px] w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ background: isProfit ? 'rgba(62,207,142,0.05)' : 'rgba(240,87,107,0.05)' }}></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Aggregate P&L</span>
            {/* P&L icon uses semantic success/danger colors — correct */}
            {isProfit ? <TrendingUp className="h-4.5 w-4.5" style={{ color: success }} /> : <TrendingDown className="h-4.5 w-4.5" style={{ color: danger }} />}
          </div>
          <h3 className={`text-2xl font-mono font-bold mt-4`} style={{ color: isProfit ? 'var(--color-trado-success)' : 'var(--color-trado-danger)' }}>
            {isProfit ? '+' : '-'}₹{animPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className={`text-xs mt-2 font-semibold flex items-center gap-0.5`} style={{ color: isProfit ? 'var(--color-trado-success)' : 'var(--color-trado-danger)' }}>
            {isProfit ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {isProfit ? '+' : ''}{netProfitLossPct.toFixed(2)}% ROI
          </p>
        </AnimatedCard>

        {/* Card 4: Learning Progress */}
        <AnimatedCard delay={240} className="glassmorphism p-5 rounded-2xl relative overflow-hidden border-trado-border">
          <div className="absolute right-[-15px] top-[-15px] w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ background: 'rgba(62,207,142,0.04)' }}></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Academic Progress</span>
            {/* BookOpen: success color since it's measuring positive progress */}
            <BookOpen className="h-4.5 w-4.5" style={{ color: success }} />
          </div>
          <h3 className="text-2xl font-mono font-bold text-white mt-4">
            {Math.round(animProgress)}%
          </h3>
          {/* Progress bar — accent fill: it's a key data highlight (one of allowed accent uses) */}
          <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${animProgress}%`, background: accent }}></div>
          </div>
        </AnimatedCard>
      </div>

      {/* Market Overview Sparkline Row */}
      {renderNiftyChart()}

      {/* Quick Nav Modules Grid — 3-col desktop, 1-col mobile */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Module Card 1 — Stock Analysis */}
        <AnimatedCard delay={80}
          onClick={() => setActiveView('stock-analysis')}
          className="glassmorphism p-6 rounded-2xl border-white/[0.04] cursor-pointer transition group flex flex-col justify-between glow-border hover:glow-border-hover"
        >
          <div>
            {/* Feature icon — secondary color, NOT accent. Prevents flat blue-everywhere look. */}
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition" style={{ background: 'rgba(139,147,167,0.08)', border: '1px solid rgba(139,147,167,0.18)', color: secondary }}>
              <Activity className="h-5 w-5" />
            </div>
            <h4 className="font-display font-semibold text-lg text-white mb-1">Stock Analysis</h4>
            <p className="text-gray-400 text-sm">Analyze price charts, volumes, metrics and 52-week indicators for Nifty 50 shares.</p>
          </div>
          {/* Link arrow — secondary color. Reserve accent for the actual nav/CTA. */}
          <div className="mt-6 flex items-center gap-1.5 text-xs font-mono group-hover:translate-x-1 transition duration-200" style={{ color: secondary }}>
            <span>Explore Nifty Companies</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </AnimatedCard>

        {/* Module Card 2 — Holdings */}
        <AnimatedCard delay={160}
          onClick={() => setActiveView('virtual-trading')}
          className="glassmorphism p-6 rounded-2xl border-white/[0.04] cursor-pointer transition group flex flex-col justify-between glow-border hover:glow-border-hover"
        >
          <div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition" style={{ background: 'rgba(139,147,167,0.08)', border: '1px solid rgba(139,147,167,0.18)', color: secondary }}>
              <Coins className="h-5 w-5" />
            </div>
            <h4 className="font-display font-semibold text-lg text-white mb-1">Holdings</h4>
            <p className="text-gray-400 text-sm">Execute simulated Buy &amp; Sell stock market orders using your risk-free 10 Lakh INR budget.</p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-mono group-hover:translate-x-1 transition duration-200" style={{ color: secondary }}>
            <span>Open Simulation Desk</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </AnimatedCard>

        {/* Module Card 3 — AI Insights */}
        <AnimatedCard delay={240}
          onClick={() => setActiveView('portfolio-analyzer')}
          className="glassmorphism p-6 rounded-2xl border-white/[0.04] cursor-pointer transition group flex flex-col justify-between glow-border hover:glow-border-hover"
        >
          <div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition" style={{ background: 'rgba(139,147,167,0.08)', border: '1px solid rgba(139,147,167,0.18)', color: secondary }}>
              <PieChart className="h-5 w-5" />
            </div>
            <h4 className="font-display font-semibold text-lg text-white mb-1">AI Insights</h4>
            <p className="text-gray-400 text-sm">Audit holding concentrations, sectors, and run smart AI reviews for recommendations.</p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-mono group-hover:translate-x-1 transition duration-200" style={{ color: secondary }}>
            <span>Run AI Audit</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </AnimatedCard>

      </div>

      {/* Two-Column split details */}
      <div className="grid lg:grid-cols-5 gap-6">
        
        {/* Left Column: Recent Transactions (3/5 width) */}
        <div className="glassmorphism rounded-2xl p-6 border-white/[0.04] lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-white">Recent Trade Receipts</h3>
            <button 
              onClick={() => setActiveView('transaction-history')}
              className="text-xs font-mono transition"
              style={{ color: 'var(--color-trado-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-trado-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-trado-muted)')}
            >
              See Full History
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm border border-dashed border-white/[0.05] rounded-xl bg-white/[0.005]">
              No transactions executed yet. Acquire your first holdings in the Virtual Trading simulator.
            </div>
          ) : (
            <div className="space-y-3.5">
              {transactions.slice(0, 4).map((t) => {
                const isBuy = t.type === 'BUY';
                return (
                  <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isBuy ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20' : 'bg-rose-950/30 text-rose-400 border border-rose-500/20'
                      }`}>
                        {isBuy ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-white font-semibold font-mono text-sm">{t.symbol}</span>
                          <span className="text-[10px] text-gray-500 truncate max-w-[120px] hidden sm:inline">{t.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Quantity: {t.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-white">
                        ₹{t.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                      <span className={`block text-[10px] font-mono mt-0.5 ${isBuy ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isBuy ? 'BOUGHT' : 'SOLD'} @ ₹{t.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: AI Tutor Brief (2/5 width) */}
        <div className="glassmorphism rounded-2xl p-6 border-white/[0.04] lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ background: 'rgba(79,107,255,0.04)' }}></div>
          <div>
            {/* AI label — secondary color */}
            <div className="flex items-center gap-2 font-mono text-xs uppercase mb-3 tracking-wider" style={{ color: secondary }}>
              <Zap className="h-3.5 w-3.5" style={{ fill: secondary }} />
              <span>AI Study Recommendation</span>
            </div>
            
            <h3 className="font-display font-bold text-xl text-white mb-2 leading-tight">
              {user.onboarding?.experience === 'Beginner' 
                ? 'Ready to learn Stock Valuation?' 
                : 'Master technical trend triggers'}
            </h3>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {user.onboarding?.experience === 'Beginner'
                ? 'We recommend opening the Learning Center to generate AI Learning Notes on the fundamentals of P/E ratios and candle configurations.'
                : 'As an advanced practitioner, challenge your market theories with our custom AI Quiz. Generate 3 professional multiple-choice questions right now.'}
            </p>
          </div>

          {/* Primary CTA — accent fill. This is the primary action on this card. */}
          <button
            onClick={() => setActiveView('learning-center')}
            style={{
              width:        '100%',
              background:   accent,
              border:       'none',
              color:        '#fff',
              fontWeight:   600,
              padding:      '12px 0',
              borderRadius: 12,
              cursor:       'pointer',
              transition:   'opacity 200ms ease, transform 150ms ease',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              gap:          8,
              fontSize:     14,
              boxShadow:    '0 0 20px rgba(79,107,255,0.2)',
              minHeight:    44,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.01)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            Open Learning Desk
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
