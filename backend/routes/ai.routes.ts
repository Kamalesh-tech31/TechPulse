import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all AI routes
router.use(authMiddleware);

router.get('/sessions', AIController.getSessions);
router.delete('/sessions/:sessionId', AIController.deleteSession);
router.get('/latest-report', AIController.getLatestReport);
router.post('/report', AIController.generateReport);
router.post('/chat', AIController.chat);

export default router;
