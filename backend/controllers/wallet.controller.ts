import { Request, Response } from 'express';
import {
  getOrCreateWallet,
  updateWalletFull,
  insertTransaction,
} from '../services/portfolio.service';

const WEEKLY_CREDIT_LIMIT = 100000;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export class WalletController {
  /**
   * GET /portfolio/wallet
   * Returns full wallet details including weekly credit fields.
   */
  static async getWalletDetails(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const wallet = await getOrCreateWallet(userId);

      // Check if weekly reset is due (auto-reset the remaining quota if a week has passed)
      const lastReset = new Date(wallet.last_weekly_reset || 0).getTime();
      const now = Date.now();
      let weeklyCreditRemaining = wallet.weekly_credit_remaining ?? WEEKLY_CREDIT_LIMIT;
      let lastWeeklyReset = wallet.last_weekly_reset;

      if (now - lastReset >= ONE_WEEK_MS) {
        weeklyCreditRemaining = WEEKLY_CREDIT_LIMIT;
        lastWeeklyReset = new Date().toISOString();
        await updateWalletFull(userId, {
          weekly_credit_remaining: WEEKLY_CREDIT_LIMIT,
          last_weekly_reset: lastWeeklyReset,
        });
      }

      return res.json({
        success: true,
        data: {
          initialCapital: wallet.initial_capital ?? 1000000,
          currentWallet: wallet.available_cash,
          weeklyCreditLimit: wallet.weekly_credit_limit ?? WEEKLY_CREDIT_LIMIT,
          weeklyCreditRemaining,
          lastWeeklyReset,
        },
      });
    } catch (err: any) {
      console.error('[Wallet Details Error]:', err);
      return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
  }

  /**
   * POST /portfolio/claim-credit
   * Body: { amount: number }
   *
   * Rules:
   * - amount must be positive integer
   * - amount cannot exceed weeklyCreditRemaining
   * - wallet available_cash must be below ₹100,000 to claim
   * - If 7 days have passed since last_weekly_reset, auto-reset quota first
   */
  static async claimWeeklyCredit(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { amount } = req.body;

      // Validate amount
      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ success: false, message: 'Amount must be a number.' });
      }
      if (amount <= 0 || !Number.isInteger(amount)) {
        return res.status(400).json({ success: false, message: 'Amount must be a positive whole number.' });
      }

      const wallet = await getOrCreateWallet(userId);

      // Check wallet balance threshold
      if (wallet.available_cash >= 100000) {
        return res.status(400).json({
          success: false,
          message: 'You can only claim weekly credit when your wallet balance is below ₹1,00,000.',
        });
      }

      // Check if a week has passed since last reset — auto-reset if so
      const lastReset = new Date(wallet.last_weekly_reset || 0).getTime();
      const now = Date.now();
      let weeklyCreditRemaining = wallet.weekly_credit_remaining ?? WEEKLY_CREDIT_LIMIT;
      let lastWeeklyReset = wallet.last_weekly_reset;

      if (now - lastReset >= ONE_WEEK_MS) {
        weeklyCreditRemaining = WEEKLY_CREDIT_LIMIT;
        lastWeeklyReset = new Date().toISOString();
      }

      // Validate claim amount against remaining quota
      if (amount > weeklyCreditRemaining) {
        return res.status(400).json({
          success: false,
          message: `Amount exceeds weekly credit remaining. Max claimable: ₹${weeklyCreditRemaining.toLocaleString()}.`,
        });
      }

      // Apply the credit
      const newCash = Math.round((wallet.available_cash + amount) * 100) / 100;
      const newRemaining = Math.round((weeklyCreditRemaining - amount) * 100) / 100;

      // Persist wallet update
      const updatedWallet = await updateWalletFull(userId, {
        available_cash: newCash,
        weekly_credit_remaining: newRemaining,
        last_weekly_reset: lastWeeklyReset,
      });

      // Insert a CREDIT transaction record for the ledger
      await insertTransaction({
        userId,
        symbol: 'CREDIT',
        companyName: 'Weekly Simulator Credit',
        exchange: 'TRADO',
        type: 'CREDIT',
        quantity: 1,
        price: amount,
        totalAmount: amount,
        remainingBalance: newCash,
      });

      return res.json({
        success: true,
        message: `Successfully claimed ₹${amount.toLocaleString()} weekly credit.`,
        data: {
          initialCapital: updatedWallet.initial_capital ?? 1000000,
          currentWallet: newCash,
          weeklyCreditLimit: updatedWallet.weekly_credit_limit ?? WEEKLY_CREDIT_LIMIT,
          weeklyCreditRemaining: newRemaining,
          lastWeeklyReset,
        },
      });
    } catch (err: any) {
      console.error('[Claim Credit Error]:', err);
      return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
  }
}
