import { Router } from 'express';
import { LearningController } from '../controllers/learning.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware); // Protect all learning progress routes

router.get('/progress', LearningController.getProgress);
router.post('/lesson', LearningController.completeLesson);
router.post('/quiz', LearningController.saveQuizResult);
router.post('/final-assessment', LearningController.passFinalAssessment);

export default router;
