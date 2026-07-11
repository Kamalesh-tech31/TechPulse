import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search,
  ArrowRight,
  Database
} from 'lucide-react';

export const TransactionHistoryView: React.FC = () => {
  const { transactions } = useApp();
  const [search, setSearch] = useState('');

  const filteredTransactions = transactions.filter((t) => {
    return t.symbol.toLowerCase().includes(search.toLowerCase()) || 
           t.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto text-gray-200">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Transaction History</h1>
        <p className="text-gray-400 text-sm mt-1">Review complete historical ledger statements of all executed simulated trades.</p>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Filter by stock ticker..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-white/[0.06] focus:border-trado-accent/60 focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-gray-300 transition focus:ring-1 focus:ring-trado-accent/10"
        />
      </div>

      {/* Ledger Grid */}
      <div className="glassmorphism rounded-2xl border-white/[0.04] overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm border border-dashed border-white/[0.03] rounded-2xl bg-white/[0.002] m-6">
            No transaction records matched the filters. Run virtual trades first.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.01] text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-5">Receipt ID</th>
                    <th className="py-4 px-5">Stock Ticker</th>
                    <th className="py-4 px-5">Order Type</th>
                    <th className="py-4 px-5 text-right">Qty (shares)</th>
                    <th className="py-4 px-5 text-right">Execution Price</th>
                    <th className="py-4 px-5 text-right">Net Value</th>
                    <th className="py-4 px-5 text-right">Remaining Wallet</th>
                    <th className="py-4 px-5 text-center">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03] text-xs font-mono">
                  {filteredTransactions.map((t) => {
                    const isBuy = t.type === 'BUY';
                    return (
                      <tr key={t.id} className="hover:bg-white/[0.01] transition">
                        <td className="py-4 px-5 text-gray-600">
                          #{t.id}
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-sans font-bold text-white text-sm block">{t.symbol}</span>
                          <span className="text-[10px] text-gray-500 font-sans truncate max-w-[150px] block mt-0.5">{t.name}</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isBuy ? 'text-emerald-400 bg-emerald-950/25 border border-emerald-500/10' : 'text-rose-400 bg-rose-950/25 border border-trado-danger/10'
                          }`}>
                            {isBuy ? 'BUY' : 'SELL'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right text-white font-bold text-sm">
                          {t.quantity}
                        </td>
                        <td className="py-4 px-5 text-right text-gray-300">
                          ₹{t.price.toFixed(2)}
                        </td>
                        <td className={`py-4 px-5 text-right font-bold text-sm ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ₹{t.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </td>
                        <td className="py-4 px-5 text-right text-gray-400">
                          ₹{t.remainingBalance.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </td>
                        <td className="py-4 px-5 text-center text-gray-500">
                          {new Date(t.timestamp).toLocaleDateString()} • {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="block md:hidden divide-y divide-white/[0.03] text-xs font-mono">
              {filteredTransactions.map((t) => {
                const isBuy = t.type === 'BUY';
                return (
                  <div key={t.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-mono">Receipt ID: #{t.id}</span>
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isBuy ? 'text-emerald-400 bg-emerald-950/25 border border-emerald-500/10' : 'text-rose-400 bg-rose-950/25 border border-trado-danger/10'
                      }`}>
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                    </div>
                    <div className="flex justify-between items-start pt-1">
                      <div>
                        <span className="font-sans font-bold text-white text-base block">{t.symbol}</span>
                        <span className="text-[11px] text-gray-500 font-sans block mt-0.5">{t.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white block">Qty: {t.quantity}</span>
                        <span className="text-[11px] text-gray-500 block mt-0.5">Price: ₹{t.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/[0.02]">
                      <span className="text-gray-500">Net Value:</span>
                      <span className={`font-bold text-sm ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ₹{t.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Wallet Balance:</span>
                      <span className="text-gray-300">
                        ₹{t.remainingBalance.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 text-right mt-2 pt-1 border-t border-white/[0.01]">
                      {new Date(t.timestamp).toLocaleDateString()} • {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

    </div>
  );
};
