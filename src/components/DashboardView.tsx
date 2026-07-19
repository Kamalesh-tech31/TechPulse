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
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { formatCurrency } from '../utils/formatCurrency';

/* CSS token shortcuts */
const accent    = 'var(--color-trado-accent)';    // primary — CTA + active nav only
const secondary = 'var(--color-trado-secondary)'; // feature icons, decorative elements
const success   = 'var(--color-trado-success)';
const danger    = 'var(--color-trado-danger)';

export const DashboardView: React.FC = () => {
  const { user, holdings, transactions, setActiveView, refreshPortfolio, portfolioLoading } = useApp();
  
  const [learningData, setLearningData] = useState<{ completedLessons: any[]; progressPercentage: number } | null>(null);
  const [learningLoading, setLearningLoading] = useState(true);

  // Sync portfolio on mount
  useEffect(() => {
    refreshPortfolio();
  }, [refreshPortfolio]);

  // Fetch learning progress on mount
  useEffect(() => {
    let active = true;
    const fetchLearning = async () => {
      try {
        const token = localStorage.getItem("trado_token");
        const res = await fetch("/learning/progress", {
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          }
        });
        if (res.ok) {
          const result = await res.json();
          if (active && result.success && result.data) {
            setLearningData({
              completedLessons: result.data.completedLessons || [],
              progressPercentage: result.data.progressPercentage || 0
            });
          }
        }
      } catch (err) {
        console.error("Error fetching learning progress:", err);
      } finally {
        if (active) {
          setLearningLoading(false);
        }
      }
    };
    fetchLearning();
    return () => {
      active = false;
    };
  }, []);

  if (!user) return null;

  // Calculate portfolio metrics
  const portfolioValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const netProfitLoss = portfolioValue - totalCost;
  const netProfitLossPct = totalCost > 0 ? (netProfitLoss / totalCost) * 100 : 0;
  const isProfit = netProfitLoss >= 0;

  // Best Performer: holding with highest profitLossPercentage
  const bestPerformerHolding = holdings.length > 0 
    ? holdings.reduce((best, current) => current.profitLossPercentage > best.profitLossPercentage ? current : best, holdings[0])
    : null;

  // Largest Holding: holding with highest currentValue
  const largestHolding = holdings.length > 0
    ? holdings.reduce((largest, current) => current.currentValue > largest.currentValue ? current : largest, holdings[0])
    : null;

  // Company Allocation
  const companyAllocation = holdings.map((h) => ({
    name: h.symbol,
    value: h.totalCost, // amount invested
  }));

  const ALLOCATION_COLORS = [
    "#4F6BFF",
    "#6B82FF",
    "#8B9BFF",
    "#8B93A7",
    "#64708D",
    "#46506A",
  ];

  // Count-up targets
  const animPortfolio = useCountUp(portfolioValue, 600);
  const animHoldingsCount = useCountUp(holdings.length, 600);
  const animPL = useCountUp(Math.abs(netProfitLoss), 600);
  const animProgress = useCountUp(learningData?.progressPercentage || 0, 600);

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto text-gray-200">
      
      {/* Welcome Block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            Welcome back, {user.name}!{' '}
            <Sparkles className="h-5 w-5" style={{ color: secondary, opacity: 0.7 }} />
          </h1>
          <p className="text-gray-400 text-sm mt-1.5">
            Personalized dashboard for a{' '}
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
        {/* Card 1: Portfolio Value */}
        <AnimatedCard delay={0} className="glassmorphism p-5 rounded-2xl relative overflow-hidden border-trado-border">
          <div className="absolute right-[-15px] top-[-15px] w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ background: 'rgba(79,107,255,0.04)' }}></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Portfolio Value</span>
            <Coins className="h-4.5 w-4.5" style={{ color: secondary }} />
          </div>
          {portfolioLoading && holdings.length === 0 ? (
            <div className="animate-pulse bg-white/[0.08] h-8 w-32 rounded mt-4" />
          ) : (
            <h3 className="text-2xl font-mono font-bold text-white mt-4">
              {formatCurrency(animPortfolio)}
            </h3>
          )}
          <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            Live backend valuation
          </p>
        </AnimatedCard>

        {/* Card 2: Total Holdings */}
        <AnimatedCard delay={80} className="glassmorphism p-5 rounded-2xl relative overflow-hidden border-trado-border">
          <div className="absolute right-[-15px] top-[-15px] w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ background: 'rgba(79,107,255,0.03)' }}></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Total Holdings</span>
            <PieChart className="h-4.5 w-4.5" style={{ color: secondary }} />
          </div>
          {portfolioLoading && holdings.length === 0 ? (
            <div className="animate-pulse bg-white/[0.08] h-8 w-20 rounded mt-4" />
          ) : (
            <h3 className="text-2xl font-mono font-bold text-white mt-4">
              {Math.round(animHoldingsCount)}
            </h3>
          )}
          <p className="text-gray-500 text-xs mt-2">
            Unique assets currently owned
          </p>
        </AnimatedCard>

        {/* Card 3: Overall Profit & ROI */}
        <AnimatedCard delay={160} className="glassmorphism p-5 rounded-2xl relative overflow-hidden border-trado-border">
          <div className="absolute right-[-15px] top-[-15px] w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ background: isProfit ? 'rgba(62,207,142,0.05)' : 'rgba(240,87,107,0.05)' }}></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Overall Profit &amp; ROI</span>
            {isProfit ? <TrendingUp className="h-4.5 w-4.5" style={{ color: success }} /> : <TrendingDown className="h-4.5 w-4.5" style={{ color: danger }} />}
          </div>
          {portfolioLoading && holdings.length === 0 ? (
            <div className="animate-pulse bg-white/[0.08] h-8 w-28 rounded mt-4" />
          ) : (
            <h3 className={`text-2xl font-mono font-bold mt-4`} style={{ color: isProfit ? 'var(--color-trado-success)' : 'var(--color-trado-danger)' }}>
              {isProfit ? '+' : '-'}{formatCurrency(animPL)}
            </h3>
          )}
          {portfolioLoading && holdings.length === 0 ? (
            <div className="animate-pulse bg-white/[0.08] h-4 w-20 rounded mt-2" />
          ) : (
            <p className={`text-xs mt-2 font-semibold flex items-center gap-0.5`} style={{ color: isProfit ? 'var(--color-trado-success)' : 'var(--color-trado-danger)' }}>
              {isProfit ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {isProfit ? '+' : ''}{netProfitLossPct.toFixed(2)}% Overall ROI
            </p>
          )}
        </AnimatedCard>

        {/* Card 4: Learning Progress */}
        <AnimatedCard delay={240} className="glassmorphism p-5 rounded-2xl relative overflow-hidden border-trado-border">
          <div className="absolute right-[-15px] top-[-15px] w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ background: 'rgba(62,207,142,0.04)' }}></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Learning Progress</span>
            <BookOpen className="h-4.5 w-4.5" style={{ color: success }} />
          </div>
          {learningLoading ? (
            <div className="animate-pulse bg-white/[0.08] h-8 w-20 rounded mt-4" />
          ) : (
            <h3 className="text-2xl font-mono font-bold text-white mt-4">
              {Math.round(animProgress)}%
            </h3>
          )}
          {learningLoading ? (
            <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-3 animate-pulse" />
          ) : (
            <>
              <p className="text-gray-500 text-xs mt-2">
                Completed <span className="text-white font-medium">{learningData?.completedLessons?.length || 0}</span> / 35 lessons
              </p>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${animProgress}%`, background: accent }}></div>
              </div>
            </>
          )}
        </AnimatedCard>
      </div>

      {/* Portfolio Snapshot & Company Allocation Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Card: Portfolio Snapshot */}
        <AnimatedCard delay={0} className="glassmorphism p-6 rounded-2xl border-white/[0.04] flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-white mb-6">
              Portfolio Snapshot
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.03] pb-3">
                <span className="text-sm text-gray-400">Portfolio Value</span>
                <span className="text-sm font-mono font-bold text-white">
                  {formatCurrency(portfolioValue)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.03] pb-3">
                <span className="text-sm text-gray-400">Best Performer</span>
                {bestPerformerHolding ? (
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {bestPerformerHolding.symbol} ({bestPerformerHolding.profitLossPercentage >= 0 ? '+' : ''}{bestPerformerHolding.profitLossPercentage.toFixed(2)}%)
                  </span>
                ) : (
                  <span className="text-sm font-mono text-gray-500">N/A</span>
                )}
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.03] pb-3">
                <span className="text-sm text-gray-400">Largest Holding</span>
                {largestHolding ? (
                  <span className="text-sm font-mono font-bold text-white">
                    {largestHolding.symbol} ({formatCurrency(largestHolding.currentValue)})
                  </span>
                ) : (
                  <span className="text-sm font-mono text-gray-500">N/A</span>
                )}
              </div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-sm text-gray-400">Available Cash</span>
                <span className="text-sm font-mono font-bold text-white">
                  {formatCurrency(user.walletBalance)}
                </span>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Right Card: Company Allocation */}
        <AnimatedCard delay={80} className="glassmorphism p-6 rounded-2xl border-white/[0.04] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display font-bold text-base text-white">
              Company Allocation
            </h3>
            <span className="text-[10px] font-mono text-gray-500 uppercase">
              Investment %
            </span>
          </div>

          {holdings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-gray-500 font-mono text-xs">
              <span>No assets allocated yet.</span>
            </div>
          ) : (
            <>
              <div className="h-[210px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={companyAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {companyAllocation.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0a0a0a",
                        borderColor: "rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        fontFamily: "monospace",
                        fontSize: "11px",
                      }}
                      formatter={(value: any) =>
                        formatCurrency(Number(value))
                      }
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                {/* Total Holdings Value inside Doughnut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-5px]">
                  <span className="text-[8px] font-mono text-gray-500 uppercase">
                    Invested
                  </span>
                  <span className="text-sm font-mono font-bold text-white mt-0.5">
                    ₹{(portfolioValue / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              {/* Sector Custom Legend */}
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                {companyAllocation.map((company, i) => {
                  const totalInvestment = companyAllocation.reduce(
                    (sum, c) => sum + c.value,
                    0,
                  );

                  const percent = (
                    (company.value / totalInvestment) *
                    100
                  ).toFixed(1);
                  return (
                    <div
                      key={company.name}
                      className="flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }}
                        />
                        <span className="text-gray-400 truncate max-w-[110px]">
                          {company.name}
                        </span>
                      </div>
                      <span className="text-white font-semibold">
                        {percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </AnimatedCard>
      </div>

      {/* Quick Nav Modules Grid — 4-col desktop, 2-col tablet, 1-col mobile */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Module Card 1 — Stock Analysis */}
        <AnimatedCard delay={80}
          onClick={() => setActiveView('stock-analysis')}
          className="glassmorphism p-6 rounded-2xl border-white/[0.04] cursor-pointer transition group flex flex-col justify-between glow-border hover:glow-border-hover"
        >
          <div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition" style={{ background: 'rgba(139,147,167,0.08)', border: '1px solid rgba(139,147,167,0.18)', color: secondary }}>
              <Activity className="h-5 w-5" />
            </div>
            <h4 className="font-display font-semibold text-lg text-white mb-1">Stock Analysis</h4>
            <p className="text-gray-400 text-sm">Analyze price charts, volumes, metrics and 52-week indicators for Nifty 50 shares.</p>
          </div>
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

        {/* Module Card 4 — Learning Center */}
        <AnimatedCard delay={320}
          onClick={() => setActiveView('learning-center')}
          className="glassmorphism p-6 rounded-2xl border-white/[0.04] cursor-pointer transition group flex flex-col justify-between glow-border hover:glow-border-hover"
        >
          <div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition" style={{ background: 'rgba(139,147,167,0.08)', border: '1px solid rgba(139,147,167,0.18)', color: secondary }}>
              <BookOpen className="h-5 w-5" />
            </div>
            <h4 className="font-display font-semibold text-lg text-white mb-1">Learning Center</h4>
            <p className="text-gray-400 text-sm">Access structured lessons, interactive quizzes, and track your progress in real-time.</p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-mono group-hover:translate-x-1 transition duration-200" style={{ color: secondary }}>
            <span>Open Learning Center</span>
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
              View Full History
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm border border-dashed border-white/[0.05] rounded-xl bg-white/[0.005]">
              No transactions executed yet. Acquire your first holdings in the Virtual Trading simulator.
            </div>
          ) : (
            <div className="space-y-3.5">
              {transactions.slice(0, 2).map((t) => {
                const isBuy = t.type === 'BUY';
                const formattedTime = new Date(t.timestamp).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return (
                  <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isBuy ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20' : 'bg-rose-950/30 text-rose-400 border border-rose-500/20'
                      }`}>
                        {isBuy ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-white font-semibold font-mono text-sm">{t.symbol}</span>
                          <span className="text-[10px] text-gray-400 truncate max-w-[160px]">{t.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          {formattedTime} • Quantity: {t.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-white">
                        {formatCurrency(t.totalAmount)}
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
