import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  User, 
  Coins, 
  Award, 
  Trash2, 
  LogOut, 
  ShieldCheck, 
  AlertCircle,
  PlusCircle,
  RotateCcw,
  Wallet,
  CheckCircle2
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { 
    user, 
    holdings, 
    transactions, 
    resetAllData, 
    logout, 
    addMoney, 
    resetMoney 
  } = useApp();

  const [customAmount, setCustomAmount] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!user) return null;

  // Calculate statistics
  const portfolioValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalSimulatedWealth = portfolioValue + user.walletBalance;
  const netGains = totalSimulatedWealth - user.initialBalance;
  const isNetProfit = netGains >= 0;
  const growthPercentage = (netGains / user.initialBalance) * 100;

  // Trading sizing
  const totalVolume = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const avgTradeSize = transactions.length > 0 ? totalVolume / transactions.length : 0;

  // Achievements calculation
  const achievements = [
    { id: '1', title: 'Nifty Apprentice', desc: 'Registered a simulated wallet on Trado', unlocked: true },
    { id: '2', title: 'Equity Backer', desc: 'Acquired your first blue-chip share holding', unlocked: holdings.length > 0 },
    { id: '3', title: 'Indicator Specialist', desc: 'Completed at least 5 simulated trade transactions', unlocked: transactions.length >= 5 },
    { id: '4', title: 'Portfolio Commander', desc: 'Held a balanced portfolio exceeding ₹1,100,000', unlocked: totalSimulatedWealth > 1100000 },
    { id: '5', title: 'Academic Scholar', desc: 'Registered with an active educational profile', unlocked: true },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const handleQuickAdd = (amount: number) => {
    addMoney(amount);
    triggerNotification(`Successfully injected ₹${amount.toLocaleString()} into your virtual wallet!`);
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) return;
    addMoney(amount);
    setCustomAmount('');
    triggerNotification(`Successfully injected ₹${amount.toLocaleString()} into your virtual wallet!`);
  };

  const handleResetMoney = () => {
    if (window.confirm('Reset wallet cash back to the default ₹1,000,000 starting budget? (This does not affect active holdings)')) {
      resetMoney();
      triggerNotification('Virtual wallet balance reset to default starting balance of ₹1,000,000!');
    }
  };

  const triggerNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto text-gray-200">
      
      {/* Title */}
      <div className="border-b border-white/[0.04] pb-5">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Profile Manager</h1>
        <p className="text-gray-400 text-sm mt-1">Manage user account credentials, inject or reset simulation wallet cash, and review learning achievements.</p>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-sm font-mono flex items-center gap-2.5 animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left column: User Info & Achievements (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* User Profile Card */}
          <div className="glassmorphism p-6 rounded-2xl border-white/[0.04] flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
            <div className="absolute right-[-40px] top-[-40px] w-32 h-32 rounded-full blur-xl pointer-events-none" style={{ background: 'rgba(59,130,246,0.05)' }}></div>
            {user.googlePicture ? (
              <img 
                src={user.googlePicture} 
                alt={user.name} 
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-2xl object-cover shrink-0"
                style={{ border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 15px rgba(59,130,246,0.2)' }}
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center font-display font-bold text-2xl text-white uppercase shrink-0" style={{ background: 'var(--color-trado-accent)', boxShadow: '0 0 20px rgba(59,130,246,0.25)' }}>
                {user.name.slice(0, 2)}
              </div>
            )}
            <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
              <h2 className="text-2xl font-display font-bold text-white truncate">{user.name}</h2>
              <p className="text-gray-400 text-sm truncate">{user.email}</p>
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1.5">
                <span className="px-2.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.05] text-[10px] font-mono text-gray-400 uppercase">
                  {user.onboarding?.occupation || 'Student'}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--color-trado-accent)' }}>
                  {user.onboarding?.experience || 'Beginner'} level
                </span>
                <span className="px-2.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.05] text-[10px] font-mono text-gray-400 uppercase">
                  Goal: {user.onboarding?.primaryGoal || 'Virtual Trading'}
                </span>
              </div>
            </div>
          </div>

          {/* Gamified Achievements */}
          <div className="glassmorphism p-6 rounded-2xl border-white/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Award className="h-5 w-5" style={{ color: 'var(--color-trado-accent)' }} />
                Learning Accomplishments
              </h3>
              <span className="text-xs font-mono text-gray-500">
                {unlockedCount} / {achievements.length} UNLOCKED
              </span>
            </div>

            <div className="space-y-3.5">
              {achievements.map((a) => (
                <div 
                  key={a.id} 
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    a.unlocked 
                      ? 'bg-white/[0.01] border-white/[0.04]' 
                      : 'bg-[#030303]/40 border-white/[0.02] opacity-40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5" style={a.unlocked ? { background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.25)', color: 'var(--color-trado-accent)' } : { background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.05)', color: '#4B5563' }}>
                      <Award className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-white text-sm leading-tight">{a.title}</h4>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{a.desc}</p>
                    </div>
                  </div>
                  {a.unlocked ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0" style={{ color: 'var(--color-trado-accent)', background: 'rgba(59,130,246,0.08)' }}>
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-gray-600 uppercase shrink-0">
                      LOCKED
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Simulate Money panel, stats, danger settings (1/3 width) */}
        <div className="space-y-6">
          
          {/* Simulate Money Panel */}
          <div className="glassmorphism p-6 rounded-2xl border-white/[0.04] space-y-5">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-400" />
              Simulate Wallet Money
            </h3>

            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Active Wallet Balance</span>
              <div className="text-3xl font-mono font-bold text-emerald-400 mt-1">
                ₹{user.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Quick Add Options */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Quick Cash Injections</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickAdd(50000)}
                  className="py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.1] text-xs font-mono font-bold text-white transition active:scale-95 cursor-pointer"
                >
                  +₹50k
                </button>
                <button
                  onClick={() => handleQuickAdd(100000)}
                  className="py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.1] text-xs font-mono font-bold text-white transition active:scale-95 cursor-pointer"
                >
                  +₹100k
                </button>
                <button
                  onClick={() => handleQuickAdd(500000)}
                  className="py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.1] text-xs font-mono font-bold text-white transition active:scale-95 cursor-pointer"
                >
                  +₹500k
                </button>
              </div>
            </div>

            {/* Custom Cash Form */}
            <form onSubmit={handleCustomAdd} className="space-y-2.5">
              <label className="block text-[10px] font-mono text-gray-500 uppercase">Inject Custom Amount</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="e.g. 250000"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1 bg-[#0a0a0a] border border-white/[0.06] focus:border-emerald-500/60 focus:outline-none rounded-xl py-2 px-3 text-sm text-gray-300 font-mono transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition text-xs font-bold text-white rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add
                </button>
              </div>
            </form>

            <button
              onClick={handleResetMoney}
              className="w-full flex items-center justify-center gap-2 py-3 border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.02] transition rounded-xl text-xs font-semibold text-gray-300 font-sans cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-emerald-400" />
              Reset Wallet Balance
            </button>
          </div>

          {/* Wealth Stats Card */}
          <div className="glassmorphism p-6 rounded-2xl border-white/[0.04] space-y-4">
            <h3 className="font-display font-bold text-lg text-white">Trading Statistics</h3>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-white/[0.03]">
                <span className="text-gray-500">LIQUID CASH</span>
                <span className="text-white font-semibold">₹{user.walletBalance.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.03]">
                <span className="text-gray-500">HOLDINGS VALUE</span>
                <span className="text-white font-semibold">₹{portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.03]">
                <span className="text-gray-500">CUMULATIVE POSITIONS</span>
                <span className="text-white font-semibold">{holdings.length} active</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.03]">
                <span className="text-gray-500">EXECUTED TRANSACTIONS</span>
                <span className="text-white font-semibold">{transactions.length} records</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.03]">
                <span className="text-gray-500">AVG ORDER SIZING</span>
                <span className="text-white font-semibold">₹{avgTradeSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between py-2 pt-3">
                <span className="text-gray-400 font-bold">SIMULATOR NET P&L</span>
                <span className={`font-bold ${isNetProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isNetProfit ? '+' : ''}₹{netGains.toLocaleString(undefined, { maximumFractionDigits: 1 })} ({isNetProfit ? '+' : ''}{growthPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Danger settings & Logout */}
          <div className="glassmorphism p-6 rounded-2xl border-white/[0.04] space-y-4" style={{ background: 'rgba(239, 68, 68, 0.005)' }}>
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-1.5">
              <AlertCircle className="h-5 w-5 text-trado-danger" />
              Danger Settings
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Resetting will clear your virtual holdings, wipe out your entire transaction history, and restore your initial 10 Lakh budget.
            </p>

            <button
              onClick={() => {
                if (window.confirm('Are you absolutely sure you want to reset your portfolio and transaction ledger back to default ₹1,000,000? This cannot be undone.')) {
                  resetAllData();
                  triggerNotification('Account ledger and simulator assets successfully reset to default ₹1,000,000 starting budget!');
                }
              }}
              className="w-full bg-trado-danger/10 border border-trado-danger/30 hover:bg-trado-danger hover:text-white text-trado-danger font-semibold py-3 rounded-xl transition duration-150 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Reset Trading Simulator
            </button>
            
            <button
              onClick={logout}
              className="w-full bg-white/[0.02] hover:bg-rose-500/10 hover:border-rose-500/20 text-gray-400 hover:text-rose-400 font-semibold py-3 rounded-xl transition duration-150 border border-white/[0.04] text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Logout Account
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
