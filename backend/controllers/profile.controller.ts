import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { profileUpdateSchema } from '../validators/auth.validation';

export class ProfileController {
  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Session unauthenticated.' });
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', req.user.userId)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'User profile not found.' });
      }

      return res.status(200).json({
        success: true,
        data: {
          fullName: data.full_name,
          username: data.username,
          phone: data.phone,
          country: data.country,
          state: data.state,
          city: data.city,
          dateOfBirth: data.date_of_birth,
          gender: data.gender,
          occupation: data.occupation,
          experienceLevel: data.experience_level,
          annualIncome: data.annual_income,
          investmentGoal: data.investment_goal,
          riskTolerance: data.risk_tolerance,
          preferredMarkets: data.preferred_markets || [],
          investmentHorizon: data.investment_horizon,
          avatarUrl: data.avatar_url,
          // Alias preferred_markets as preferredSectors for the profile UI
          preferredSectors: data.preferred_markets || [],
        }
      });
    } catch (error: any) {
      console.error('[Get Profile Error]:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Session unauthenticated.' });
      }

      const val = profileUpdateSchema.safeParse(req.body);
      if (!val.success) {
        return res.status(400).json({ success: false, message: val.error.issues[0].message });
      }

      const updates: any = {};
      const fields = val.data;

      if (fields.fullName !== undefined) updates.full_name = fields.fullName;
      if (fields.username !== undefined) updates.username = fields.username;
      if (fields.phone !== undefined) updates.phone = fields.phone;
      if (fields.country !== undefined) updates.country = fields.country;
      if (fields.state !== undefined) updates.state = fields.state;
      if (fields.city !== undefined) updates.city = fields.city;
      if (fields.dateOfBirth !== undefined) updates.date_of_birth = fields.dateOfBirth;
      if (fields.gender !== undefined) updates.gender = fields.gender;
      if (fields.annualIncome !== undefined) updates.annual_income = fields.annualIncome;
      if (fields.riskTolerance !== undefined) updates.risk_tolerance = fields.riskTolerance;
      if (fields.preferredMarkets !== undefined) updates.preferred_markets = fields.preferredMarkets;
      if (fields.investmentHorizon !== undefined) updates.investment_horizon = fields.investmentHorizon;
      // New profile fields
      if (fields.experienceLevel !== undefined) updates.experience_level = fields.experienceLevel;
      if (fields.investmentGoal !== undefined) updates.investment_goal = fields.investmentGoal;
      if (fields.preferredSectors !== undefined) updates.preferred_markets = fields.preferredSectors;
      
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', req.user.userId)
        .select('*')
        .single();

      if (error || !data) {
        console.error('[Update Profile Error]:', error);
        return res.status(500).json({ success: false, message: 'Failed to update profile.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: {
          fullName: data.full_name,
          username: data.username,
          phone: data.phone,
          country: data.country,
          state: data.state,
          city: data.city,
          dateOfBirth: data.date_of_birth,
          gender: data.gender,
          occupation: data.occupation,
          experienceLevel: data.experience_level,
          annualIncome: data.annual_income,
          investmentGoal: data.investment_goal,
          riskTolerance: data.risk_tolerance,
          preferredMarkets: data.preferred_markets || [],
          investmentHorizon: data.investment_horizon,
          avatarUrl: data.avatar_url,
          preferredSectors: data.preferred_markets || [],
        }
      });
    } catch (error: any) {
      console.error('[Update Profile Exception]:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
