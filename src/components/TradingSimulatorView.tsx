import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Briefcase,
  TrendingUp,
  Percent,
  Wallet,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export const TradingSimulatorView: React.FC = () => {
  const { user, stocks, holdings, setActiveView, setSelectedStockId } =
    useApp();

  const [expandedCompanies, setExpandedCompanies] = useState<
    Record<string, boolean>
  >({});

  const toggleExpand = (symbol: string) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }));
  };

  if (!user) return null;

  // Calculations
  const totalCash = user.walletBalance;
  const totalHoldingsValue = holdings.reduce(
    (sum, h) => sum + h.currentValue,
    0,
  );
  const totalPortfolioValue = totalCash + totalHoldingsValue;

  // Profit Loss calculation relative to total portfolio cost plus cash
  const totalProfitLoss = holdings.reduce((sum, h) => sum + h.profitLoss, 0);
  const totalHoldingsCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalReturnPercentage =
    totalHoldingsCost > 0 ? (totalProfitLoss / totalHoldingsCost) * 100 : 0;

  const totalHoldingsCount = holdings.length;

  // Chart 1: Portfolio Growth History over past 7 sessions (Dynamic based on current holdings performance)
  // Base starting capital: 1,000,000
  const baseline = 1000000;
  const netGain = totalProfitLoss;
  const growthData = [
    { name: "Day 1", Value: baseline },
    { name: "Day 2", Value: baseline + Math.round(netGain * 0.15 - 500) },
    { name: "Day 3", Value: baseline + Math.round(netGain * 0.35 + 1200) },
    { name: "Day 4", Value: baseline + Math.round(netGain * 0.2 - 800) },
    { name: "Day 5", Value: baseline + Math.round(netGain * 0.55 + 2400) },
    { name: "Day 6", Value: baseline + Math.round(netGain * 0.8 - 1500) },
    { name: "Day 7", Value: Math.round(totalPortfolioValue) },
  ];

  // Chart 2: Sector Distribution
  // Company Allocation (based on money invested in each company)
  const companyAllocation = holdings.map((h) => ({
    name: h.symbol,
    value: h.totalCost, // amount invested
  }));

  // Slate & Signal colors for sector charts
  const COLORS = [
    "#4F6BFF",
    "#6B82FF",
    "#8B9BFF",
    "#8B93A7",
    "#64708D",
    "#46506A",
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto text-gray-200">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Holdings
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track asset performance, allocation weightings, and real-time equity
            growth indices.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedStockId(null);
            setActiveView("stock-analysis");
          }}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
          style={{
            background: "var(--color-trado-accent)",
            boxShadow: "0 0 15px rgba(79, 107, 255, 0.3)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--color-trado-accent-dark)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--color-trado-accent)";
          }}
        >
          <Activity className="h-4 w-4" />
          Browse Stock Market
        </button>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="glassmorphism p-5 rounded-2xl border-white/[0.04] relative overflow-hidden">
          <div className="absolute right-4 top-4 text-white/5">
            <Briefcase className="h-10 w-10" />
          </div>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
            Total Portfolio Value
          </span>
          <h2 className="text-2xl font-mono font-bold text-white mt-1.5">
            ₹
            {totalPortfolioValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h2>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span
              className={`font-mono font-medium flex items-center ${totalProfitLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {totalProfitLoss >= 0 ? "+" : ""}
              {totalReturnPercentage.toFixed(2)}% net returns
            </span>
          </div>
        </div>

        {/* Available Virtual Cash */}
        <div className="glassmorphism p-5 rounded-2xl border-white/[0.04] relative overflow-hidden">
          <div className="absolute right-4 top-4 text-white/5">
            <Wallet className="h-10 w-10" />
          </div>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
            Available Virtual Cash
          </span>
          <h2 className="text-2xl font-mono font-bold text-emerald-400 mt-1.5">
            ₹
            {totalCash.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h2>
          <span className="text-[10px] text-gray-500 font-mono mt-2 block uppercase">
            Liquid Capital Reserves
          </span>
        </div>

        {/* Total Profit/Loss */}
        <div className="glassmorphism p-5 rounded-2xl border-white/[0.04] relative overflow-hidden">
          <div className="absolute right-4 top-4 text-white/5">
            <Coins className="h-10 w-10" />
          </div>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
            Total Profit/Loss
          </span>
          <h2
            className={`text-2xl font-mono font-bold mt-1.5 ${totalProfitLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {totalProfitLoss >= 0 ? "+" : ""}₹
            {totalProfitLoss.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </h2>
          <div className="flex items-center gap-1 mt-2 text-xs font-mono">
            {totalProfitLoss >= 0 ? (
              <span className="text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" /> Profit
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-0.5">
                <ArrowDownRight className="h-3 w-3" /> Loss
              </span>
            )}
          </div>
        </div>

        {/* Total Holdings Count */}
        <div className="glassmorphism p-5 rounded-2xl border-white/[0.04] relative overflow-hidden">
          <div className="absolute right-4 top-4 text-white/5">
            <Percent className="h-10 w-10" />
          </div>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
            Total holdings
          </span>
          <h2 className="text-2xl font-mono font-bold text-white mt-1.5">
            {totalHoldingsCount}{" "}
            <span className="text-sm font-normal text-gray-500">Assets</span>
          </h2>
          <span className="text-[10px] text-gray-500 font-mono mt-2 block uppercase">
            Unique Equity Positions
          </span>
        </div>
      </div>

      {/* Main Holdings Table Section */}
      <div className="glassmorphism rounded-2xl p-6 border-white/[0.04]">
        <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
          <Briefcase
            className="h-5 w-5"
            style={{ color: "var(--color-trado-accent)" }}
          />
          Current Stock Holdings
        </h2>

        {holdings.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm border border-dashed border-white/[0.05] rounded-xl bg-white/[0.005]">
            You have no active holdings. Select "Browse Stock Market" to explore
            and acquire virtual shares of Nifty 50 companies.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-white/[0.04] text-[10px] font-mono text-gray-500 uppercase tracking-wider pb-2">
                    <th className="py-3.5">Company Symbol</th>
                    <th className="py-3.5 text-right">Total Shares</th>
                    <th className="py-3.5 text-right">Avg Cost (Weighted)</th>
                    <th className="py-3.5 text-right">Current Price</th>
                    <th className="py-3.5 text-right">Total Net Cost</th>
                    <th className="py-3.5 text-right">Current Market Value</th>
                    <th className="py-3.5 text-right">Total Profit/Loss</th>
                    <th className="py-3.5 text-right">Percentage ROI</th>
                    <th className="py-3.5 text-center">Trigger Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03] text-xs font-mono">
                  {holdings.map((h) => {
                    const isProfit = h.profitLoss >= 0;
                    const isExpanded = !!expandedCompanies[h.symbol];
                    const stock = stocks.find((s) => s.symbol === h.symbol);
                    const stockId = stock ? stock.id : h.symbol;

                    return (
                      <React.Fragment key={h.symbol}>
                        {/* Parent Group Row */}
                        <tr
                          className="hover:bg-white/[0.005] transition cursor-pointer"
                          onClick={() => toggleExpand(h.symbol)}
                        >
                          {/* Name & Symbol */}
                          <td className="py-3.5 flex items-center gap-3">
                            <div className="text-gray-400 shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                            <div className="h-7 w-7 rounded bg-white/[0.02] border border-white/[0.05] flex items-center justify-center font-sans font-bold text-white uppercase text-[10px]">
                              {h.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <span className="font-sans font-semibold text-white block">
                                {h.symbol}
                              </span>
                              <span className="text-[9px] text-gray-500 font-sans truncate max-w-[130px] block mt-0.5">
                                {h.name}
                              </span>
                            </div>
                          </td>

                          {/* Quantity */}
                          <td className="py-3.5 text-right text-white font-medium">
                            {h.totalQuantity}
                          </td>

                          {/* Average Buy Price */}
                          <td className="py-3.5 text-right text-gray-400">
                            ₹{h.avgBuyPrice.toFixed(2)}
                          </td>

                          {/* Live Market Price */}
                          <td className="py-3.5 text-right text-white">
                            ₹{h.currentPrice.toFixed(2)}
                          </td>

                          {/* Net cost */}
                          <td className="py-3.5 text-right text-gray-400">
                            ₹
                            {h.totalCost.toLocaleString(undefined, {
                              maximumFractionDigits: 1,
                            })}
                          </td>

                          {/* Current Value */}
                          <td className="py-3.5 text-right text-white font-bold">
                            ₹
                            {h.currentValue.toLocaleString(undefined, {
                              maximumFractionDigits: 1,
                            })}
                          </td>

                          {/* P&L */}
                          <td
                            className={`py-3.5 text-right font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}
                          >
                            {isProfit ? "+" : ""}₹
                            {h.profitLoss.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* Return Percentage */}
                          <td
                            className={`py-3.5 text-right font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}
                          >
                            <div className="flex items-center justify-end gap-0.5">
                              {isProfit ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3" />
                              )}
                              <span>
                                {isProfit ? "+" : ""}
                                {h.profitLossPercentage.toFixed(2)}%
                              </span>
                            </div>
                          </td>

                          {/* Sell Button */}
                          <td
                            className="py-3.5 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setSelectedStockId(stockId);
                                setActiveView("stock-detail");
                              }}
                              className="px-3.5 py-1.5 text-[11px] font-sans font-semibold text-white rounded-lg cursor-pointer transition hover:scale-[1.03] active:scale-[0.97]"
                              style={{
                                background: "var(--color-trado-accent)",
                                boxShadow: "0 0 10px rgba(79, 107, 255, 0.2)",
                              }}
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.background =
                                  "var(--color-trado-accent-dark)";
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.background =
                                  "var(--color-trado-accent)";
                              }}
                            >
                              Sell Stock
                            </button>
                          </td>
                        </tr>

                        {/* Child Expanded Rows */}
                        {isExpanded && (
                          <tr>
                            <td
                              colSpan={9}
                              className="bg-white/[0.01] px-6 py-4 border-l-2 border-trado-accent"
                            >
                              <div className="space-y-3">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                  Individual Purchases Breakdown
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {h.purchases.map((purchase, index) => {
                                    const pProfit = purchase.profitLoss >= 0;
                                    return (
                                      <div
                                        key={purchase.id}
                                        className="p-3 rounded-xl bg-[#09090b] border border-white/[0.04] text-xs space-y-2"
                                      >
                                        <div className="flex justify-between font-bold border-b border-white/[0.04] pb-1.5">
                                          <span className="text-gray-400">
                                            Purchase #{index + 1}
                                          </span>
                                          <span className="text-white">
                                            {purchase.quantity} Shares
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">
                                            Bought Price:
                                          </span>
                                          <span className="text-gray-300 font-bold">
                                            ₹{purchase.buyPrice.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">
                                            Bought On:
                                          </span>
                                          <span className="text-gray-300">
                                            {new Date(
                                              purchase.buyTime,
                                            ).toLocaleDateString(undefined, {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                            })}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">
                                            Investment:
                                          </span>
                                          <span className="text-gray-300">
                                            ₹
                                            {purchase.investment.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">
                                            Current Value:
                                          </span>
                                          <span className="text-white font-bold">
                                            ₹
                                            {purchase.currentValue.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex justify-between border-t border-white/[0.04] pt-1.5 font-bold">
                                          <span className="text-gray-400">
                                            Current Profit:
                                          </span>
                                          <span
                                            className={
                                              pProfit
                                                ? "text-emerald-400"
                                                : "text-rose-400"
                                            }
                                          >
                                            {pProfit ? "+" : ""}₹
                                            {purchase.profitLoss.toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="block md:hidden divide-y divide-white/[0.03]">
              {holdings.map((h) => {
                const isProfit = h.profitLoss >= 0;
                const isExpanded = !!expandedCompanies[h.symbol];
                const stock = stocks.find((s) => s.symbol === h.symbol);
                const stockId = stock ? stock.id : h.symbol;

                return (
                  <div
                    key={h.symbol}
                    className="py-4 space-y-3 cursor-pointer"
                    onClick={() => toggleExpand(h.symbol)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="text-gray-400">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                        <div className="h-7 w-7 rounded bg-white/[0.02] border border-white/[0.05] flex items-center justify-center font-sans font-bold text-white uppercase text-[10px]">
                          {h.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-sans font-semibold text-white text-base block">
                            {h.symbol}
                          </span>
                          <span className="text-[10px] text-gray-500 font-sans block mt-0.5">
                            {h.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">
                          Live Asset Value
                        </span>
                        <span className="text-sm font-bold text-white block">
                          ₹
                          {h.currentValue.toLocaleString(undefined, {
                            maximumFractionDigits: 1,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono pt-2 border-t border-white/[0.02]">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Shares:</span>
                        <span className="text-white font-medium">
                          {h.totalQuantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Avg Cost:</span>
                        <span className="text-gray-300">
                          ₹{h.avgBuyPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Live Price:</span>
                        <span className="text-white">
                          ₹{h.currentPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Net Cost:</span>
                        <span className="text-gray-300">
                          ₹
                          {h.totalCost.toLocaleString(undefined, {
                            maximumFractionDigits: 1,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/[0.02] text-xs font-mono">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase">
                          Total P&L
                        </span>
                        <span
                          className={`font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {isProfit ? "+" : ""}₹
                          {h.profitLoss.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-gray-500 uppercase">
                          Return (ROI)
                        </span>
                        <span
                          className={`font-bold flex items-center justify-end gap-0.5 ${isProfit ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {isProfit ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {isProfit ? "+" : ""}
                          {h.profitLossPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Child Expanded Rows for Mobile */}
                    {isExpanded && (
                      <div
                        className="pt-3 border-t border-white/[0.03] space-y-2.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                          Purchase Batches
                        </div>
                        {h.purchases.map((purchase, index) => {
                          const pProfit = purchase.profitLoss >= 0;
                          return (
                            <div
                              key={purchase.id}
                              className="p-3 rounded-xl bg-[#09090b] border border-white/[0.04] text-[11px] space-y-1.5"
                            >
                              <div className="flex justify-between font-bold border-b border-white/[0.04] pb-1">
                                <span className="text-gray-400">
                                  Batch #{index + 1}
                                </span>
                                <span className="text-white">
                                  {purchase.quantity} Shares
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Bought At:
                                </span>
                                <span className="text-gray-300">
                                  ₹{purchase.buyPrice.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Bought On:
                                </span>
                                <span className="text-gray-300">
                                  {new Date(
                                    purchase.buyTime,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Investment:
                                </span>
                                <span className="text-gray-300">
                                  ₹{purchase.investment.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between font-bold">
                                <span className="text-gray-400">
                                  Profit/Loss:
                                </span>
                                <span
                                  className={
                                    pProfit
                                      ? "text-emerald-400"
                                      : "text-rose-400"
                                  }
                                >
                                  {pProfit ? "+" : ""}₹
                                  {purchase.profitLoss.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedStockId(stockId);
                          setActiveView("stock-detail");
                        }}
                        className="w-full py-2.5 text-xs font-sans font-semibold text-white rounded-xl cursor-pointer transition active:scale-[0.98]"
                        style={{
                          background: "var(--color-trado-accent)",
                          boxShadow: "0 0 10px rgba(79, 107, 255, 0.2)",
                        }}
                      >
                        Sell Stock / View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Portfolio Performance Analytics Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Growth Line Chart (2/3 width) */}
        <div className="lg:col-span-2 glassmorphism rounded-2xl p-6 border-white/[0.04]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-base text-white">
              Portfolio Growth Index
            </h3>
            <span className="text-[10px] font-mono text-gray-500 uppercase">
              Simulated Daily Value • 7D
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={growthData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="growthGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4F6BFF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F6BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#4b5563"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#4b5563"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    fontFamily: "monospace",
                  }}
                  formatter={(value: any) => [
                    `₹${Number(value).toLocaleString()}`,
                    "Portfolio Value",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="Value"
                  stroke="#4F6BFF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#growthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Pie Chart (1/3 width) */}
        <div className="glassmorphism rounded-2xl p-6 border-white/[0.04] flex flex-col justify-between">
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
                  <PieChart>
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
                          fill={COLORS[index % COLORS.length]}
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
                        `₹${Number(value).toLocaleString()}`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Total Holdings Value inside Doughnut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-5px]">
                  <span className="text-[8px] font-mono text-gray-500 uppercase">
                    Invested
                  </span>
                  <span className="text-sm font-mono font-bold text-white mt-0.5">
                    ₹{(totalHoldingsValue / 1000).toFixed(0)}k
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
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
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
        </div>
      </div>
    </div>
  );
};;
