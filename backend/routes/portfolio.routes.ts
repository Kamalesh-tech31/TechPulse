import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolio.controller';
import { WalletController } from '../controllers/wallet.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All portfolio routes require authentication
router.use(authMiddleware);

router.get('/dashboard',      PortfolioController.getDashboard);
router.get('/holdings',       PortfolioController.getHoldings);
router.get('/transactions',   PortfolioController.getTransactions);
router.post('/buy',           PortfolioController.buyStock);
router.post('/sell',          PortfolioController.sellStock);

// Wallet endpoints
router.get('/wallet',         WalletController.getWalletDetails);
router.post('/claim-credit',  WalletController.claimWeeklyCredit);

export default router;
