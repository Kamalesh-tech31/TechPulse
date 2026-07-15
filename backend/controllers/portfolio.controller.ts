import { Request, Response } from 'express';
import {
  getOrCreateWallet,
  getWallet,
  updateWallet,
  insertHolding,
  getHoldingsByUser,
  reduceHolding,
  insertTransaction,
  getTransactionsByUser,
  HoldingRow,
} from '../services/portfolio.service';

// ─────────────────────────────────────────────────────────────
//  Helper: group raw holdings rows by symbol for the frontend
// ─────────────────────────────────────────────────────────────

interface GroupedHolding {
  symbol: string;
  name: string;
  exchange: string;
  totalQuantity: number;
  totalCost: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  sector: string;
  purchases: {
    id: string;
    quantity: number;
    buyPrice: number;
    buyTime: string;
    investment: number;
    currentValue: number;
    profitLoss: number;
  }[];
}

function groupHoldings(rows: HoldingRow[], livePrices: Record<string, number>): GroupedHolding[] {
  const map = new Map<string, HoldingRow[]>();
  for (const row of rows) {
    const sym = row.company_symbol;
    if (!map.has(sym)) map.set(sym, []);
    map.get(sym)!.push(row);
  }

  const result: GroupedHolding[] = [];
  for (const [symbol, purchases] of map) {
    const currentPrice = livePrices[symbol] ?? (purchases[0].current_price ?? 0);
    const totalQuantity = purchases.reduce((s, p) => s + p.quantity, 0);
    const totalCost = purchases.reduce((s, p) => s + p.quantity * p.buy_price, 0);
    const avgBuyPrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
    const currentValue = totalQuantity * currentPrice;
    const profitLoss = currentValue - totalCost;
    const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

    result.push({
      symbol,
      name: purchases[0].company_name,
      exchange: purchases[0].exchange,
      sector: 'NSE',
      totalQuantity,
      totalCost: Math.round(totalCost * 100) / 100,
      avgBuyPrice: Math.round(avgBuyPrice * 100) / 100,
      currentPrice,
      currentValue: Math.round(currentValue * 100) / 100,
      profitLoss: Math.round(profitLoss * 100) / 100,
      profitLossPercentage: Math.round(profitLossPercentage * 100) / 100,
      purchases: purchases.map(p => ({
        id: p.id,
        quantity: p.quantity,
        buyPrice: p.buy_price,
        buyTime: p.buy_time,
        investment: Math.round(p.quantity * p.buy_price * 100) / 100,
        currentValue: Math.round(p.quantity * currentPrice * 100) / 100,
        profitLoss: Math.round(p.quantity * (currentPrice - p.buy_price) * 100) / 100,
      })),
    });
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
//  Controllers
// ─────────────────────────────────────────────────────────────

export class PortfolioController {
  /**
   * GET /api/dashboard
   * Returns wallet + grouped holdings + recent transactions
   */
  static async getDashboard(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const livePricesRaw = req.query.prices as string | undefined;
      let livePrices: Record<string, number> = {};
      if (livePricesRaw) {
        try { livePrices = JSON.parse(livePricesRaw); } catch {}
      }

      const [wallet, holdingRows, txRows] = await Promise.all([
        getOrCreateWallet(userId),
        getHoldingsByUser(userId),
        getTransactionsByUser(userId),
      ]);

      const grouped = groupHoldings(holdingRows, livePrices);

      // Recompute portfolio totals from grouped data
      const portfolioValue = grouped.reduce((s, g) => s + g.currentValue, 0);
      const totalCost = grouped.reduce((s, g) => s + g.totalCost, 0);
      const profitLoss = portfolioValue - totalCost;

      return res.json({
        success: true,
        data: {
          wallet: {
            available_cash: wallet.available_cash,
            portfolio_value: Math.round(portfolioValue * 100) / 100,
            profit_loss: Math.round(profitLoss * 100) / 100,
          },
          holdings: grouped,
          transactions: txRows.slice(0, 50), // latest 50
        },
      });
    } catch (err: any) {
      console.error('[Dashboard Error]:', err);
      return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/holdings
   * Returns grouped holdings with live prices injected
   */
  static async getHoldings(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const livePricesRaw = req.query.prices as string | undefined;
      let livePrices: Record<string, number> = {};
      if (livePricesRaw) {
        try { livePrices = JSON.parse(livePricesRaw); } catch {}
      }

      const holdingRows = await getHoldingsByUser(userId);
      const grouped = groupHoldings(holdingRows, livePrices);

      return res.json({ success: true, data: grouped });
    } catch (err: any) {
      console.error('[Holdings Error]:', err);
      return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/transactions
   */
  static async getTransactions(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const txRows = await getTransactionsByUser(userId);
      return res.json({ success: true, data: txRows });
    } catch (err: any) {
      console.error('[Transactions Error]:', err);
      return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
  }

  /**
   * POST /api/buy
   * Body: { symbol, companyName, exchange, quantity, livePrice }
   */
  static async buyStock(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { symbol, companyName, exchange, quantity, livePrice } = req.body;

      // Validate inputs
      if (!symbol || !companyName || !quantity || !livePrice) {
        return res.status(400).json({ success: false, message: 'Missing required fields: symbol, companyName, quantity, livePrice' });
      }
      if (quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be greater than zero.' });
      }
      if (livePrice <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid live price.' });
      }

      const totalCost = Math.round(quantity * livePrice * 100) / 100;

      // 1. Verify wallet balance
      const wallet = await getOrCreateWallet(userId);
      if (wallet.available_cash < totalCost) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance. Required: ₹${totalCost.toLocaleString()}, Available: ₹${wallet.available_cash.toLocaleString()}`,
        });
      }

      // 2. Insert ONE holding row (buy_price never changes)
      await insertHolding({
        userId,
        symbol,
        companyName,
        exchange: exchange || 'NSE',
        quantity,
        buyPrice: livePrice,
      });

      // 3. Insert BUY transaction
      await insertTransaction({
        userId,
        symbol,
        companyName,
        exchange: exchange || 'NSE',
        type: 'BUY',
        quantity,
        price: livePrice,
        totalAmount: totalCost,
      });

      // 4. Update wallet
      const newCash = Math.round((wallet.available_cash - totalCost) * 100) / 100;
      await updateWallet(userId, newCash, 0, 0); // portfolio_value recalculated on fetch

      return res.json({
        success: true,
        message: `Successfully bought ${quantity} shares of ${symbol} @ ₹${livePrice}`,
        data: {
          available_cash: newCash,
          symbol,
          quantity,
          buyPrice: livePrice,
          totalCost,
        },
      });
    } catch (err: any) {
      console.error('[Buy Error]:', err);
      return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
  }

  /**
   * POST /api/sell
   * Body: { symbol, quantity, livePrice }
   * Uses FIFO — reduces oldest purchases first
   */
  static async sellStock(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { symbol, quantity, livePrice } = req.body;

      if (!symbol || !quantity || !livePrice) {
        return res.status(400).json({ success: false, message: 'Missing required fields: symbol, quantity, livePrice' });
      }
      if (quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be greater than zero.' });
      }

      // 1. Get all active holdings for this symbol (FIFO — ordered by buy_time asc)
      const allHoldings = await getHoldingsByUser(userId);
      const symbolHoldings = allHoldings.filter(h => h.company_symbol === symbol.toUpperCase());

      const totalAvailable = symbolHoldings.reduce((s, h) => s + h.quantity, 0);
      if (totalAvailable < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient shares. Available: ${totalAvailable}, Requested to sell: ${quantity}`,
        });
      }

      // 2. FIFO reduction
      let remaining = quantity;
      const companyName = symbolHoldings[0].company_name;
      const exchange = symbolHoldings[0].exchange;

      for (const holding of symbolHoldings) {
        if (remaining <= 0) break;
        if (holding.quantity <= remaining) {
          // Consume entire holding row
          remaining -= holding.quantity;
          await reduceHolding(holding.id, 0);
        } else {
          // Partial reduction
          await reduceHolding(holding.id, holding.quantity - remaining);
          remaining = 0;
        }
      }

      // 3. Insert SELL transaction
      const revenue = Math.round(quantity * livePrice * 100) / 100;
      await insertTransaction({
        userId,
        symbol,
        companyName,
        exchange,
        type: 'SELL',
        quantity,
        price: livePrice,
        totalAmount: revenue,
      });

      // 4. Update wallet
      const wallet = await getOrCreateWallet(userId);
      const newCash = Math.round((wallet.available_cash + revenue) * 100) / 100;
      await updateWallet(userId, newCash, 0, 0);

      return res.json({
        success: true,
        message: `Successfully sold ${quantity} shares of ${symbol} @ ₹${livePrice}`,
        data: {
          available_cash: newCash,
          symbol,
          quantity,
          sellPrice: livePrice,
          revenue,
        },
      });
    } catch (err: any) {
      console.error('[Sell Error]:', err);
      return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
  }
}
