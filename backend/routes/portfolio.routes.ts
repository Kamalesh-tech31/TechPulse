import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolio.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All portfolio routes require authentication
router.use(authMiddleware);

router.get('/dashboard',     PortfolioController.getDashboard);
router.get('/holdings',      PortfolioController.getHoldings);
router.get('/transactions',  PortfolioController.getTransactions);
router.post('/buy',          PortfolioController.buyStock);
router.post('/sell',         PortfolioController.sellStock);

export default router;
