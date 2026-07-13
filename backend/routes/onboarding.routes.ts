import { Router } from 'express';
import { OnboardingController } from '../controllers/onboarding.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, OnboardingController.completeOnboarding);
router.get('/status', authMiddleware, OnboardingController.getStatus);

export default router;
