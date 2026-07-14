import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Stock } from '../types';
import { 
  Search, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Database,
  Coins,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const StockAnalysisView: React.FC = () => {
  const { 
    user, 
    stocks, 
    buyStock, 
    sellStock, 
    activeView, 
    setActiveView,
    selectedStockId,
    setSelectedStockId
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  
  // Trade state
  const [tradeQty, setTradeQty] = useState<number>(10);
  const [tradeMessage, setTradeMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const selectedStock = stocks.find((s) => s.id === selectedStockId);

  // Get unique sectors
  const sectors = ['All', ...Array.from(new Set(stocks.map((s) => s.sector)))];

  // Filter stocks
  const filteredStocks = stocks.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === 'All' || s.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const handleBuy = (stockId: string) => {
    setTradeMessage(null);
    if (tradeQty <= 0) {
      setTradeMessage({ type: 'error', text: 'Please specify a quantity greater than zero.' });
      return;
    }
    const res = buyStock(stockId, tradeQty);
    if (res.success) {
      setTradeMessage({ type: 'success', text: res.message });
    } else {
      setTradeMessage({ type: 'error', text: res.message });
    }
  };

  const handleSell = (stockId: string) => {
    setTradeMessage(null);
    if (tradeQty <= 0) {
      setTradeMessage({ type: 'error', text: 'Please specify a quantity greater than zero.' });
      return;
    }
    const res = sellStock(stockId, tradeQty);
    if (res.success) {
      setTradeMessage({ type: 'success', text: res.message });
    } else {
      setTradeMessage({ type: 'error', text: res.message });
    }
  };

  // Render miniature line chart for list view
  const renderSparkline = (history: number[] = [], change: number) => {
    if (!history || history.length === 0) {
      return null;
    }
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const width = 100;
    const height = 35;
    const points = history
      .map((val, idx) => {
        const x = (idx / (history.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(" ");

    const strokeColor = change >= 0 ? "#34d399" : "#f87171"; // emerald-400 or red-400

    return (
      <svg className="w-[100px] h-[35px]" viewBox="0 0 100 35">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          points={points}
        />
      </svg>
    );
  };

  // Render larger interactive chart for detail view
  const renderDetailChart = (stock: Stock) => {
    const min = Math.min(...stock.history);
    const max = Math.max(...stock.history);
    const range = max - min || 1;
    const width = 500;
    const height = 180;
    
    const points = stock.history.map((val, idx) => {
      const x = (idx / (stock.history.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 24) - 12;
      return `${x},${y}`;
    }).join(' ');

    const isProfit = stock.change >= 0;
    const strokeColor = isProfit ? '#10b981' : 'var(--color-trado-danger)'; // emerald-500 or trado-danger

    return (
      <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">7-Day Technical Trend</span>
          <span className="text-xs font-mono font-medium text-gray-400">Past performance • Simulated ticks</span>
        </div>
        <div className="h-[180px] w-full relative">
          <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.15"/>
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path
              d={`M 0,180 L ${points} L 500,180 Z`}
              fill={`url(#gradient-${stock.symbol})`}
            />
            <polyline
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              points={points}
            />
            {stock.history.map((val, idx) => {
              const x = (idx / (stock.history.length - 1)) * width;
              const y = height - ((val - min) / range) * (height - 24) - 12;
              return (
                <g key={idx} className="group/dot">
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill={strokeColor}
                    className="cursor-pointer hover:r-6 transition-all"
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="9"
                    fontFamily="monospace"
                    className="opacity-0 group-hover/dot:opacity-100 transition duration-200"
                  >
                    ₹{val.toFixed(0)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-2 border-t border-white/[0.03] pt-2">
          <span>7 Sessions Ago</span>
          <span>Active Feed</span>
        </div>
      </div>
    );
  };

  // 1. DETAIL STOCK PAGE VIEW
  if (selectedStock) {
    const isProfit = selectedStock.change >= 0;
    const totalCost = Math.round(selectedStock.price * tradeQty * 100) / 100;
    
    // Check if user already holds this stock to show quick holdings summary
    const ownedQty = user?.onboardingCompleted
      ? (user as any).onboardingCompleted // We can check useApp positions
      : 0; 
    // We can pull holdings directly
    const currentHolding = user ? (user as any) : null;

    return (
      <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto text-gray-200">
        {/* Detail Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedStockId(null);
              setTradeMessage(null);
              setTradeQty(10);
              if (activeView === 'stock-detail') {
                setActiveView('virtual-trading');
              }
            }}
            className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-gray-400 hover:text-white transition duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">{selectedStock.sector}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-0.5">
              {selectedStock.name}
            </h1>
          </div>
        </div>

        {/* Detailed Metrics Layout split */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left / Middle: Chart and Description (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Price block */}
            <div className="glassmorphism p-6 rounded-2xl border-white/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Symbol: {selectedStock.symbol}</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-mono font-bold text-white">
                    ₹{selectedStock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`text-sm font-mono font-semibold flex items-center ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfit ? '+' : ''}{selectedStock.change.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Day extremes indicators */}
              <div className="flex gap-6 text-xs font-mono bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl">
                <div>
                  <span className="text-gray-500 uppercase text-[10px] block">TODAY'S HIGH</span>
                  <span className="text-emerald-400 font-bold mt-1 block">₹{selectedStock.high.toFixed(2)}</span>
                </div>
                <div className="border-r border-white/[0.05]"></div>
                <div>
                  <span className="text-gray-500 uppercase text-[10px] block">TODAY'S LOW</span>
                  <span className="text-rose-400 font-bold mt-1 block">₹{selectedStock.low.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Price chart */}
            {renderDetailChart(selectedStock)}

            {/* Description */}
            <div className="glassmorphism p-6 rounded-2xl border-white/[0.04]">
              <h3 className="font-display font-bold text-lg text-white mb-3">Company Overview</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{selectedStock.description}</p>
            </div>

          </div>

          {/* Right side: Key statistics and trading form (1/3 width) */}
          <div className="space-y-6">
            
            {/* Key stats panel */}
            <div className="glassmorphism p-6 rounded-2xl border-white/[0.04]">
              <h3 className="font-display font-bold text-lg text-white mb-4">Market Stats</h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-white/[0.03]">
                  <span className="text-gray-500">MARKET CAP</span>
                  <span className="text-white font-semibold">{selectedStock.marketCap}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.03]">
                  <span className="text-gray-500">P/E RATIO</span>
                  <span className="text-white font-semibold">{selectedStock.peRatio}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.03]">
                  <span className="text-gray-500">52-WEEK HIGH</span>
                  <span className="text-emerald-400 font-semibold">₹{selectedStock.high52.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.03]">
                  <span className="text-gray-500">52-WEEK LOW</span>
                  <span className="text-rose-400 font-semibold">₹{selectedStock.low52.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">VOLUME</span>
                  <span className="text-white font-semibold">{selectedStock.volume}</span>
                </div>
              </div>
            </div>

            {/* Order execution form */}
            <div className="glassmorphism p-6 rounded-2xl border-white/[0.04]" style={{ background: 'rgba(18, 41, 74, 0.4)' }}>
              <h3 className="font-display font-bold text-lg text-white mb-3">Simulation Order Desk</h3>
              
              {user && (
                <div className="mb-4 flex justify-between text-[11px] font-mono text-gray-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
                  <span>Cash balance:</span>
                  <span className="text-emerald-400 font-bold">₹{user.walletBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              )}

              {tradeMessage && (
                <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-xs font-mono leading-relaxed ${
                  tradeMessage.type === 'success' 
                    ? 'bg-emerald-950/30 border border-emerald-500/20 text-emerald-300' 
                    : 'bg-rose-950/30 border border-trado-danger/20 text-rose-300'
                }`}>
                  {tradeMessage.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                  <span>{tradeMessage.text}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1.5">
                    Order Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="10"
                    value={tradeQty}
                    onChange={(e) => setTradeQty(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#070707] border border-white/[0.06] focus:border-trado-accent/60 focus:outline-none rounded-lg py-2.5 px-3.5 text-sm font-mono text-white transition focus:ring-1 focus:ring-trado-accent/10"
                  />
                </div>

                <div className="space-y-1.5 font-mono text-xs text-gray-400 border-t border-white/[0.03] pt-3">
                  <div className="flex justify-between">
                    <span>PRICE PER SHARE:</span>
                    <span className="text-white">₹{selectedStock.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-white pt-1">
                    <span>EST. VALUE:</span>
                    <span style={{ color: 'var(--color-trado-accent)' }}>₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleBuy(selectedStock.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.2)] text-sm flex items-center justify-center gap-1"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Buy shares
                  </button>
                  <button
                    onClick={() => handleSell(selectedStock.id)}
                    className="bg-trado-danger hover:bg-red-600 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition shadow-[0_0_15px_rgba(239,68,68,0.2)] text-sm flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowDownRight className="h-4 w-4" />
                    Sell shares
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // 2. STOCKS DIRECTORY LIST VIEW
  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto text-gray-200">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Stock Analysis</h1>
        <p className="text-gray-400 text-sm mt-1">Study financial performance, daily volatility, and mini trends of premium Nifty 50 shares.</p>
      </div>

      {/* Directory Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search company or ticker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/[0.06] focus:border-trado-accent/60 focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-gray-300 transition focus:ring-1 focus:ring-trado-accent/10"
          />
        </div>

        {/* Sector Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition duration-150 shrink-0 border ${
                selectedSector === sec
                  ? 'bg-trado-accent border-trado-accent text-white font-semibold shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                  : 'bg-white/[0.01] border-white/[0.05] text-gray-400 hover:text-white hover:border-white/[0.1]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

      </div>

      {/* Corporate List Grid */}
      <div className="glassmorphism rounded-2xl border-white/[0.04] overflow-hidden">
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.01] text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-5">Company Ticker</th>
                    <th className="py-4 px-5 text-right">LTP (INR)</th>
                    <th className="py-4 px-5 text-right">Day Chg</th>
                    <th className="py-4 px-5 text-center">Trend Chart</th>
                    <th className="py-4 px-5 text-right">Daily High</th>
                    <th className="py-4 px-5 text-right">Daily Low</th>
                    <th className="py-4 px-5 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03] text-sm">
                  {filteredStocks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500 font-mono">
                        No stocks matching search query.
                      </td>
                    </tr>
                  ) : (
                    filteredStocks.map((stock) => {
                      const isProfit = stock.change >= 0;
                      return (
                        <tr
                          key={stock.id}
                          onClick={() => {
                            setSelectedStockId(stock.id);
                            setTradeMessage(null);
                            setTradeQty(10);
                          }}
                          className="hover:bg-white/[0.02] cursor-pointer transition duration-150"
                        >
                          <td className="py-4 px-5">
                            <div className="flex flex-col">
                              <span className="font-mono font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
                                {stock.symbol}
                                <span className="text-[9px] font-mono font-normal text-gray-500 bg-white/[0.02] border border-white/[0.04] px-1 rounded">
                                  {stock.sector
                                    ? stock.sector.split(" ")[0]
                                    : "NSE"}
                                </span>
                              </span>
                              <span className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5">
                                {stock.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right font-mono font-semibold text-white">
                            ₹{stock.price.toFixed(2)}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <span
                              className={`inline-flex items-center gap-0.5 text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                                isProfit
                                  ? "text-emerald-400 bg-emerald-950/20 border border-emerald-500/10"
                                  : "text-rose-400 bg-rose-950/20 border border-trado-danger/10"
                              }`}
                            >
                              {isProfit ? "+" : ""}
                              {stock.change.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-4 px-5 flex justify-center items-center h-full">
                            <div className="py-1">
                              {renderSparkline(
                                stock.history ?? [],
                                stock.change,
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right font-mono text-xs text-emerald-400">
                            ₹{stock.high.toFixed(1)}
                          </td>
                          <td className="py-4 px-5 text-right font-mono text-xs text-rose-400">
                            ₹{stock.low.toFixed(1)}
                          </td>
                          <td className="py-4 px-5 text-right font-mono text-xs text-gray-400">
                            {stock.volume}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="block md:hidden divide-y divide-white/[0.03]">
              {filteredStocks.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-mono text-xs">
                  No stocks matching search query.
                </div>
              ) : (
                filteredStocks.map((stock) => {
                  const isProfit = stock.change >= 0;
                  return (
                    <div
                      key={stock.id}
                      onClick={() => {
                        setSelectedStockId(stock.id);
                        setTradeMessage(null);
                        setTradeQty(10);
                      }}
                      className="p-4 space-y-3 hover:bg-white/[0.01] cursor-pointer active:bg-white/[0.02] transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                            {stock.symbol}
                            <span>{stock.sector || "NSE"}</span>
                          </span>
                          <span className="text-xs text-gray-400 block mt-0.5">
                            {stock.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-white text-base block">
                            ₹{stock.price.toFixed(2)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded mt-1.5 ${
                              isProfit
                                ? "text-emerald-400 bg-emerald-950/20 border border-emerald-500/10"
                                : "text-rose-400 bg-rose-950/20 border border-trado-danger/10"
                            }`}
                          >
                            {isProfit ? "+" : ""}
                            {stock.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs font-mono pt-2 border-t border-white/[0.02] text-gray-500">
                        <div>
                          <span>High: </span>
                          <span className="text-emerald-400">
                            ₹{stock.high.toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span>Low: </span>
                          <span className="text-rose-400">
                            ₹{stock.low.toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span>Vol: </span>
                          <span className="text-gray-300">{stock.volume}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
      </div>

    </div>
  );
};
