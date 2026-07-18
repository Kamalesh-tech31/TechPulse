import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { getAIClient } from '../config/openai';
import { analyzePortfolio } from '../../ai/portfolioEngine';
import { calculateRiskProfile } from '../../ai/riskEngine';
import { generateRecommendations } from '../../ai/recommendationEngine';
import { generateLLMReport } from '../../ai/reportGenerator';
import { processChat, getOrCreateSession } from '../../ai/chatbot';

export class AIController {
  static async getSessions(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    try {
      const sessions = await AIService.getSessions(userId);
      return res.json({ success: true, data: sessions });
    } catch (error: any) {
      console.error('[AI getSessions] Error:', error.message);
      return res.status(500).json({ success: false, error: 'Failed to retrieve sessions' });
    }
  }

  static async deleteSession(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const { sessionId } = req.params;
    try {
      await AIService.deleteSession(userId, sessionId);
      return res.json({ success: true, message: 'Session deleted' });
    } catch (error: any) {
      console.error('[AI deleteSession] Error:', error.message);
      return res.status(500).json({ success: false, error: 'Failed to delete session' });
    }
  }

  static async getLatestReport(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    try {
      const report = await AIService.getLatestReport(userId);
      return res.json({ success: true, data: report });
    } catch (error: any) {
      console.error('[AI getLatestReport] Error:', error.message);
      return res.status(500).json({ success: false, error: 'Failed to retrieve latest report' });
    }
  }

  static async generateReport(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const { holdings, walletBalance } = req.body;
    const ai = getAIClient();

    if (!Array.isArray(holdings)) {
      return res.status(400).json({ error: 'holdings must be an array' });
    }

    try {
      const analysis = analyzePortfolio(holdings, walletBalance || 0);
      const riskProfile = calculateRiskProfile(analysis);
      analysis.riskScore = riskProfile.score;
      analysis.riskLabel = riskProfile.label;

      const recommendations = generateRecommendations(analysis, riskProfile);
      const report = await generateLLMReport(analysis, riskProfile, recommendations, ai);

      const reportData = {
        report,
        analysis,
        riskProfile,
        recommendations
      };

      // Save report in database
      await AIService.saveLatestReport(userId, reportData);

      // Return payload on root level to match Tharun's API format
      return res.json(reportData);
    } catch (error: any) {
      console.error('[AI generateReport] Error:', error.message);
      return res.status(500).json({ error: 'Report generation failed' });
    }
  }

  static async chat(req: Request, res: Response) {
    console.log('Request received');
    const userId = (req as any).user?.userId;
    if (userId) {
      console.log('User authenticated');
    }

    const { message, sessionId, userEmail, holdings = [], walletBalance = 0, latestReport, mode = 'general' } = req.body;
    const ai = getAIClient();

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'message and sessionId are required' });
    }

    const sanitizedMessage = String(message)
      .slice(0, 1000)
      .replace(/[<>]/g, '')
      .trim();

    try {
      // 1. Fetch chat sessions to populate in-memory messages for chatbot's context & pronoun resolution
      const sessionsList = await AIService.getSessions(userId);
      const existingSession = sessionsList.find(s => s.id === sessionId);

      const sessionObj = getOrCreateSession(sessionId, userEmail || 'anonymous');
      if (existingSession) {
        sessionObj.messages = existingSession.messages;
      } else {
        sessionObj.messages = [];
      }

      // 2. Call chat processor (will log Prompt built, Groq request starting, Groq response received)
      const response = await processChat({
        message: sanitizedMessage,
        sessionId,
        userEmail: userEmail || 'anonymous',
        holdings,
        walletBalance,
        latestReport,
        mode
      }, ai);

      console.log('Conversation saving');

      // 3. Save new messages to Supabase (Non-blocking database save)
      const lastUserMsg = sanitizedMessage;
      const lastBotReply = response.reply;
      const metadata = { sources: response.sources || [] };
      const referencedStocks: string[] = [];
      
      const stockRegex = /[A-Z0-9-]+\.(?:NS|BSE)/g;
      const matched = (sanitizedMessage + ' ' + response.reply).match(stockRegex);
      if (matched) {
        referencedStocks.push(...Array.from(new Set(matched)));
      }

      try {
        await AIService.saveRecord(
          userId,
          sessionId,
          lastUserMsg,
          lastBotReply,
          metadata,
          referencedStocks,
          { holdings, walletBalance }
        );
      } catch (dbError: any) {
        console.error('DATABASE SAVE ERROR (Non-blocking):', dbError.message || dbError);
      }

      console.log('Response returned');
      // Return payload on root level to match Tharun's API format
      return res.json(response);
    } catch (error: any) {
      console.error("AI CHAT ERROR");
      console.error(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      });
    }
  }
}
