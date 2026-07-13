import { supabase } from '../config/supabase';

export interface UserCreateInput {
  email: string;
  passwordHash?: string;
  authProvider: 'email' | 'google';
  emailVerified: boolean;
  fullName?: string;
  avatarUrl?: string;
}

export class UserService {
  static async findUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0];
  }

  static async findUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0];
  }

  static async createUser(input: UserCreateInput) {
    const email = input.email.toLowerCase().trim();

    // 1. Create user central record
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: input.passwordHash || null,
        auth_provider: input.authProvider,
        email_verified: input.emailVerified
      })
      .select('*')
      .single();

    if (userError || !userRecord) {
      console.error('[User Service Error] Create user failed:', userError);
      throw new Error(userError?.message || 'Failed to create user account.');
    }

    // 2. Create user profile
    const { data: profileRecord, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userRecord.id,
        full_name: input.fullName || email.split('@')[0],
        avatar_url: input.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(input.fullName || email.split('@')[0])}&background=4f6bff&color=fff`,
        profile_completed: false
      })
      .select('*')
      .single();

    if (profileError) {
      console.error('[User Service Error] Create user profile failed:', profileError);
      // Clean up orphaned user record
      await supabase.from('users').delete().eq('id', userRecord.id);
      throw new Error('Failed to create user profile.');
    }

    return { user: userRecord, profile: profileRecord };
  }

  static async getProfileByUserId(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0];
  }

  static async updatePassword(userId: string, passwordHash: string) {
    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('[User Service Error] Update password failed:', error);
      throw new Error('Failed to update password.');
    }
    return true;
  }

  static async verifyEmail(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({ email_verified: true, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('[User Service Error] Verify email failed:', error);
      throw new Error('Failed to mark email as verified.');
    }
    return true;
  }
}
