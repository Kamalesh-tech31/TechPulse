import { supabase } from '../config/supabase';
import { generateOTP } from '../utils/generateOTP';

export class OTPService {
  static async createOTP(email: string, purpose: 'signup' | 'forgot_password' | 'email_change'): Promise<string> {
    const formattedEmail = email.toLowerCase().trim();

    // 1. Check if there was an OTP sent within the last 60 seconds (Resend Cooldown check)
    const { data: existing } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', formattedEmail)
      .eq('purpose', purpose)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
      const elapsed = Date.now() - new Date(existing[0].created_at).getTime();
      if (elapsed < 60000) {
        throw new Error('Please wait 60 seconds before requesting another code.');
      }

      // Check maximum resend attempts in last 1 hour (limit to 5)
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const { count } = await supabase
        .from('otp_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('email', formattedEmail)
        .eq('purpose', purpose)
        .gte('created_at', oneHourAgo);

      if (count && count >= 5) {
        throw new Error('Maximum resend attempts reached. Please try again later.');
      }
    }

    // 2. Invalidate any existing OTPs for the same email & purpose
    await supabase
      .from('otp_verifications')
      .delete()
      .eq('email', formattedEmail)
      .eq('purpose', purpose);

    // 3. Generate and store new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes validity

    const { error } = await supabase
      .from('otp_verifications')
      .insert({
        email: formattedEmail,
        otp,
        purpose,
        expires_at: expiresAt,
        attempts: 0
      });

    if (error) {
      console.error('[OTP Service Error] Insert error:', error);
      throw new Error('Failed to generate verification code.');
    }

    return otp;
  }

  static async verifyOTP(email: string, otp: string, purpose: 'signup' | 'forgot_password' | 'email_change'): Promise<boolean> {
    const formattedEmail = email.toLowerCase().trim();

    // 1. Retrieve the latest active OTP record
    const { data: record, error } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', formattedEmail)
      .eq('purpose', purpose)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !record || record.length === 0) {
      throw new Error('No active verification request found.');
    }

    const verification = record[0];

    // 2. Check Expiry
    if (new Date(verification.expires_at).getTime() < Date.now()) {
      await supabase.from('otp_verifications').delete().eq('id', verification.id);
      throw new Error('Verification code has expired. Please request a new one.');
    }

    // 3. Check Attempts limit (max 5 verification attempts)
    if (verification.attempts >= 5) {
      await supabase.from('otp_verifications').delete().eq('id', verification.id);
      throw new Error('Maximum verification attempts exceeded. Please request a new code.');
    }

    // 4. Verify OTP
    if (verification.otp !== otp) {
      // Increment attempt counter
      await supabase
        .from('otp_verifications')
        .update({ attempts: verification.attempts + 1 })
        .eq('id', verification.id);

      throw new Error('Invalid verification code.');
    }

    // 5. Successful Verification: Delete the OTP record to prevent reuse
    await supabase.from('otp_verifications').delete().eq('id', verification.id);
    return true;
  }
}
