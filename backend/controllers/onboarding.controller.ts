import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { onboardingSchema } from '../validators/auth.validation';

export class OnboardingController {
  static async completeOnboarding(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Session unauthenticated.' });
      }

      const val = onboardingSchema.safeParse(req.body);
      if (!val.success) {
        return res.status(400).json({ success: false, message: val.error.issues[0].message });
      }

      const { occupation, experience, primaryGoal } = val.data;

      // Update user profile in PostgreSQL
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          occupation,
          experience_level: experience,
          investment_goal: primaryGoal,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', req.user.userId)
        .select('*')
        .single();

      if (error || !data) {
        console.error('[Onboarding Error]:', error);
        return res.status(500).json({ success: false, message: 'Failed to update onboarding profile.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Onboarding preferences saved successfully.',
        data: {
          name: data.full_name,
          email: req.user.email,
          walletBalance: 1000000,
          initialBalance: 1000000,
          onboardingCompleted: true
        }
      });
    } catch (error: any) {
      console.error('[Onboarding Exception]:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Session unauthenticated.' });
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('profile_completed')
        .eq('user_id', req.user.userId)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'Profile not found.' });
      }

      return res.status(200).json({
        success: true,
        data: { completed: data.profile_completed }
      });
    } catch (error: any) {
      console.error('[Onboarding Status Error]:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

