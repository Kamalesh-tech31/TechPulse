import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class DeleteAccountController {
  /**
   * DELETE /auth/account
   * Deletes the authenticated user's account.
   * All child table rows are removed via ON DELETE CASCADE in PostgreSQL.
   */
  static async deleteAccount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Session unauthenticated.' });
      }

      const userId = req.user.userId;

      // Delete the user row — all related rows cascade automatically:
      // wallet, holdings, transactions, user_profiles, lesson_completion,
      // quiz_results, user_learning_progress, ai_assistant_records
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('[Delete Account Error]:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete account.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Account permanently deleted.',
      });
    } catch (err: any) {
      console.error('[Delete Account Exception]:', err);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }
}
