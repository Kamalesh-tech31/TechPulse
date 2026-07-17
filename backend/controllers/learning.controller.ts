import { Request, Response } from 'express';
import { LearningService } from '../services/learning.service';

export class LearningController {
  static async getProgress(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const progress = await LearningService.getProgress(userId);
      return res.status(200).json({ success: true, data: progress });
    } catch (error: any) {
      console.error('[Learning Progress Error]:', error);
      return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  static async completeLesson(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { lessonId } = req.body;
      if (!lessonId) {
        return res.status(400).json({ success: false, message: 'lessonId is required.' });
      }
      const data = await LearningService.completeLesson(userId, lessonId);
      return res.status(200).json({ success: true, message: 'Lesson completed successfully.', data });
    } catch (error: any) {
      console.error('[Complete Lesson Error]:', error);
      return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  static async saveQuizResult(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { moduleId, score, questionsCount } = req.body;
      if (moduleId === undefined || score === undefined || !questionsCount) {
        return res.status(400).json({ success: false, message: 'moduleId, score, and questionsCount are required.' });
      }
      const data = await LearningService.saveQuizResult(userId, moduleId, score, questionsCount);
      return res.status(200).json({ success: true, message: 'Quiz result saved successfully.', data });
    } catch (error: any) {
      console.error('[Save Quiz Result Error]:', error);
      return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  static async passFinalAssessment(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const data = await LearningService.passFinalAssessment(userId);
      return res.status(200).json({ success: true, message: 'Final assessment passed successfully.', data });
    } catch (error: any) {
      console.error('[Pass Final Assessment Error]:', error);
      return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }
}
