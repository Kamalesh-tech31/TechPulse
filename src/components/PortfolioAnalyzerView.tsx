import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { PortfolioAnalysis } from '../types';
import { 
  Sparkles, 
  Cpu, 
  ShieldAlert, 
  CheckCircle, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Lightbulb,
  BookOpen
} from 'lucide-react';

export const PortfolioAnalyzerView: React.FC = () => {
  const { holdings, user } = useApp();
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const runAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
    setLoadingStep(0);

    const steps = [
      'Scanning portfolio assets...',
      'Auditing sector distributions...',
      'Evaluating aggregate risk factors...',
      'Running Gemini intelligence diagnostics...'
    ];

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 600);

    try {
      const response = await fetch('/api/portfolio-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdings,
          walletBalance: user?.walletBalance || 0
        })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Portfolio Analyzer error:', error);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto text-gray-200">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">AI Insights</h1>
        <p className="text-gray-400 text-sm mt-1">Audit your active positions to run risk diagnostics, evaluate diversification, and receive custom CFA recommendations.</p>
      </div>

      {/* Analyzer Desk Trigger */}
      {!analysis && !loading && (
        <div className="glassmorphism rounded-2xl p-8 border-white/[0.04] text-center max-w-2xl mx-auto py-16 space-y-6 relative overflow-hidden">
          <div className="absolute right-[-30px] top-[-30px] w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ background: 'rgba(59,130,246,0.05)' }}></div>
          
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(59,130,246,0.15)] animate-pulse" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--color-trado-accent)' }}>
            <Cpu className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-white">
              Scan Your Financial Footprint
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
              Our AI engine audits asset concentration, evaluates Nifty 50 volatility levels, and scores your diversification in real-time.
            </p>
          </div>

          {holdings.length === 0 ? (
            <div className="p-4 bg-rose-950/20 border border-trado-danger/20 rounded-xl text-rose-300 text-xs font-mono max-w-md mx-auto flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>You currently have 0 active positions. Purchase shares in the simulator first to unlock diagnostics.</span>
            </div>
          ) : (
            <button
              onClick={runAnalysis}
              className="text-white font-semibold py-3.5 px-8 rounded-xl transition duration-200 flex items-center gap-2 mx-auto text-sm cursor-pointer shadow-[0_0_25px_rgba(59,130,246,0.3)]"
              style={{ background: 'var(--color-trado-accent)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-trado-accent-dark)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-trado-accent)'; }}
            >
              <Sparkles className="h-4.5 w-4.5 fill-white" />
              Analyze Portfolio
            </button>
          )}
        </div>
      )}

      {/* Loading Scanning Screen */}
      {loading && (
        <div className="glassmorphism rounded-2xl p-8 border-white/[0.04] text-center max-w-md mx-auto py-20 space-y-6">
          <div className="relative h-16 w-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-trado-accent/10 border-t-trado-accent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border border-white/5 border-b-trado-accent animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <Cpu className="absolute inset-0 m-auto h-6 w-6 text-trado-accent animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-white font-semibold text-base">Synthesizing Metrics</h3>
            <p className="text-trado-accent font-mono text-xs animate-pulse">
              {[
                'Scanning portfolio assets...',
                'Auditing sector distributions...',
                'Evaluating aggregate risk factors...',
                'Running Gemini intelligence diagnostics...'
              ][loadingStep]}
            </p>
          </div>
        </div>
      )}

      {/* Complete Report */}
      {analysis && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-mono">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-gray-400">REPORT COMPILED SUCCESSFULLY VIA GEMINI 3.5</span>
            </div>
            <button
              onClick={runAnalysis}
              className="text-xs font-mono hover:text-blue-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.05] bg-white/[0.005] hover:bg-white/[0.02]"
              style={{ color: 'var(--color-trado-accent)' }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Re-run analysis
            </button>
          </div>

          {/* Primary Top Grid: Risk & Diversification */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Box 1: Risk score */}
            <div className="glassmorphism p-6 rounded-2xl border-white/[0.04] flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-base text-gray-400 flex items-center gap-2 uppercase tracking-wider text-xs font-mono">
                  <ShieldAlert className="h-4.5 w-4.5 text-trado-danger" />
                  Risk Index Rating
                </h3>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-5xl font-mono font-bold text-white">{analysis.riskScore}</span>
                  <span className="text-gray-500 font-mono text-sm">/ 100</span>
                  <span className={`ml-3 inline-flex items-center text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                    analysis.riskCategory === 'Low' 
                      ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/10'
                      : analysis.riskCategory === 'Medium'
                      ? 'bg-amber-950/20 text-amber-400 border border-amber-500/10'
                      : 'bg-rose-950/20 text-rose-400 border border-trado-danger/10'
                  }`}>
                    {analysis.riskCategory} Risk
                  </span>
                </div>
              </div>
              <div className="w-full bg-white/[0.05] h-2 rounded-full mt-6 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    analysis.riskScore < 35 ? 'bg-emerald-400' : analysis.riskScore < 70 ? 'bg-amber-400' : 'bg-trado-danger'
                  }`}
                  style={{ width: `${analysis.riskScore}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-gray-500 mt-2 font-mono block">
                Determined based on asset concentration, volatility offsets, and sector exposure.
              </span>
            </div>

            {/* Box 2: Diversification rating */}
            <div className="glassmorphism p-6 rounded-2xl border-white/[0.04] flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-base text-gray-400 flex items-center gap-2 uppercase tracking-wider text-xs font-mono">
                  <PieChart className="h-4.5 w-4.5 text-emerald-400" />
                  Diversification Score
                </h3>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-5xl font-mono font-bold text-white">{analysis.diversificationScore}</span>
                  <span className="text-gray-500 font-mono text-sm">/ 100</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mt-3">
                  {analysis.diversificationAnalysis}
                </p>
              </div>
            </div>

          </div>

          {/* Sector Allocation visual chart */}
          {analysis.sectorAllocation && analysis.sectorAllocation.length > 0 && (
            <div className="glassmorphism p-6 rounded-2xl border-white/[0.04]">
              <h3 className="font-display font-semibold text-sm text-gray-400 flex items-center gap-2 uppercase tracking-wider font-mono mb-6">
                <PieChart className="h-4.5 w-4.5" style={{ color: 'var(--color-trado-accent)' }} />
                Sector Allocation Breakdown
              </h3>
              <div className="space-y-4">
                {analysis.sectorAllocation.map((sec, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white font-semibold">{sec.sector}</span>
                      <span className="text-gray-400">{sec.percentage}% (₹{sec.value.toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>
                    </div>
                    <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${sec.percentage}%`, opacity: 1 - idx * 0.15, background: 'var(--color-trado-accent)' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Winners vs Watchlist */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Winners */}
            <div className="glassmorphism p-6 rounded-2xl border-white/[0.04]">
              <h3 className="font-display font-semibold text-xs text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
                <TrendingUp className="h-4.5 w-4.5" />
                Portfolio Strongpoints (Top Gainers)
              </h3>
              {analysis.topPerforming && analysis.topPerforming.length > 0 ? (
                <div className="space-y-3">
                  {analysis.topPerforming.map((item, idx) => (
                    <div key={idx} className="p-3 bg-emerald-950/10 border border-emerald-500/10 rounded-xl flex items-center justify-between font-mono">
                      <span className="text-white font-bold">{item.symbol}</span>
                      <span className="text-emerald-400 font-semibold text-sm flex items-center gap-0.5">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        +{item.gain}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-500 font-mono block">No positive performers recorded yet.</span>
              )}
            </div>

            {/* Watchlist / Underperforming */}
            <div className="glassmorphism p-6 rounded-2xl border-white/[0.04]">
              <h3 className="font-display font-semibold text-xs text-rose-400 uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
                <TrendingDown className="h-4.5 w-4.5" />
                Asset Watchlist (Lagging Allocations)
              </h3>
              {analysis.worstPerforming && analysis.worstPerforming.length > 0 ? (
                <div className="space-y-3">
                  {analysis.worstPerforming.map((item, idx) => (
                    <div key={idx} className="p-3 bg-rose-950/10 border border-trado-danger/10 rounded-xl flex items-center justify-between font-mono">
                      <span className="text-white font-bold">{item.symbol}</span>
                      <span className="text-rose-400 font-semibold text-sm flex items-center gap-0.5">
                        <ArrowDownRight className="h-3.5 w-3.5" />
                        {item.loss}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-500 font-mono block">No underperforming holdings recorded.</span>
              )}
            </div>

          </div>

          {/* Actionable Recommendations */}
          <div className="glassmorphism p-6 rounded-2xl border-white/[0.04]" style={{ background: 'rgba(59, 130, 246, 0.005)' }}>
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2 mb-4">
              <Lightbulb className="h-4.5 w-4.5" style={{ color: 'var(--color-trado-accent)' }} />
              Strategic CFA Portfolio Recommendations
            </h3>
            <ul className="space-y-3">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-gray-400 leading-relaxed">
                  <span className="h-5 w-5 rounded-md font-mono text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--color-trado-accent)' }}>
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Narrative Overview */}
          <div className="glassmorphism p-6 rounded-2xl border-white/[0.04]">
            <h3 className="font-display font-semibold text-sm text-gray-400 flex items-center gap-2 uppercase tracking-wider font-mono mb-4">
              <BookOpen className="h-4.5 w-4.5" style={{ color: 'var(--color-trado-accent)' }} />
              CFA Academic Assessment Summary
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
              {analysis.explanation}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
