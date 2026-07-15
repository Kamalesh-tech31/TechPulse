import { supabase } from '../config/supabase';
import { getOrCreateWallet } from './portfolio.service';
 
export interface GoogleSyncResult {
  success: boolean;
  redirectTo: '/onboarding' | '/dashboard';
  user: {
    id: string;
    name: string;
    email: string;
    googlePicture: string;
    onboardingCompleted: boolean;
    walletBalance: number;
    initialBalance: number;
  };
}
 
export class GoogleAuthService {
  /**
   * Verifies a Supabase access_token, syncs the user to our
   * users + user_profiles tables, and returns the redirect path.
   * Merges providers if the email already exists in our database.
   */
  static async syncAndGetRedirect(accessToken: string): Promise<GoogleSyncResult> {
    // 1. Verify the token with Supabase Auth — get the authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(accessToken);
 
    if (authError || !authUser) {
      throw new Error('Invalid or expired Supabase session token.');
    }
 
    const email = (authUser.email || '').toLowerCase().trim();
    const fullName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      email.split('@')[0];
    const avatarUrl =
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=4f6bff&color=fff`;
 
    // 2. Perform dual lookup (by email and by Supabase Auth UID) to ensure we find existing accounts
    const { data: userByEmail, error: emailFetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
 
    if (emailFetchError) {
      throw new Error('Database lookup by email failed: ' + emailFetchError.message);
    }
 
    const { data: userById, error: idFetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
 
    if (idFetchError) {
      throw new Error('Database lookup by ID failed: ' + idFetchError.message);
    }
 
    const existingUser = userByEmail || userById;
    let finalUserId: string;
    let profileCompleted = false;
 
    if (existingUser) {
      finalUserId = existingUser.id;
      let updatedProvider = existingUser.auth_provider;
      const providers = existingUser.auth_provider.split(',').map((p: string) => p.trim());
      if (!providers.includes('google')) {
        providers.push('google');
      }
      updatedProvider = providers.join(',');
 
      const needsUpdate =
        existingUser.email.toLowerCase().trim() !== email ||
        existingUser.auth_provider !== updatedProvider;
 
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            email: email,
            auth_provider: updatedProvider,
            updated_at: new Date().toISOString()
          })
          .eq('id', finalUserId);
 
        if (updateError) {
          throw new Error('Failed to update existing user record: ' + updateError.message);
        }
      }
    } else {
      // If user does not exist by email or ID, create them with Supabase Auth UID as primary key
      const userData = {
        id: authUser.id,
        email: email,
        auth_provider: 'google',
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
 
      const { data: newDbUser, error: insertUserError } = await supabase
        .from('users')
        .insert(userData)
        .select('*')
        .single();
 
      if (insertUserError) {
        // If it violates unique constraint, it means the user was concurrently created
        if (
          insertUserError.code === '23505' ||
          insertUserError.message.includes('unique constraint') ||
          insertUserError.message.includes('duplicate key')
        ) {
          const { data: retryUser, error: retryError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();
 
          if (retryError || !retryUser) {
            throw new Error('Failed to create user record: ' + insertUserError.message);
          }
          finalUserId = retryUser.id;
        } else {
          throw new Error('Failed to create user record: ' + insertUserError.message);
        }
      } else if (!newDbUser) {
        throw new Error('Failed to create user record: Unknown error');
      } else {
        finalUserId = newDbUser.id;
      }
    }
 
    // Handle user profile
    const { data: profileRow, error: profileFetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', finalUserId)
      .maybeSingle();
 
    if (profileFetchError) {
      throw new Error('Failed to fetch user profile: ' + profileFetchError.message);
    }
 
    if (profileRow) {
      profileCompleted = profileRow.profile_completed;
 
      // Update full_name & avatar_url if they are different or missing
      const nameChanged = fullName && profileRow.full_name !== fullName;
      const avatarChanged = avatarUrl && profileRow.avatar_url !== avatarUrl;
 
      if (nameChanged || avatarChanged) {
        await supabase
          .from('user_profiles')
          .update({
            ...(nameChanged ? { full_name: fullName } : {}),
            ...(avatarChanged ? { avatar_url: avatarUrl } : {}),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', finalUserId);
      }
    } else {
      // If profile is missing, try to create it
      const { data: insertedProfile, error: insertProfileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: finalUserId,
          full_name: fullName,
          avatar_url: avatarUrl,
          profile_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .maybeSingle();
 
      if (insertProfileError) {
        // If it violates unique constraint, it means the profile exists (created by a trigger or race condition)
        if (
          insertProfileError.code === '23505' ||
          insertProfileError.message.includes('unique constraint') ||
          insertProfileError.message.includes('duplicate key')
        ) {
          // Gracefully fetch the existing profile
          const { data: retryProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', finalUserId)
            .maybeSingle();
          profileCompleted = retryProfile ? retryProfile.profile_completed : false;
        } else {
          throw new Error('Failed to create user profile: ' + insertProfileError.message);
        }
      } else {
        profileCompleted = insertedProfile ? insertedProfile.profile_completed : false;
      }
    }
 
    // Ensure wallet exists for this user (idempotent — creates ₹10L on first Google login)
    const wallet = await getOrCreateWallet(finalUserId);

    return {
      success: true,
      redirectTo: profileCompleted ? '/dashboard' : '/onboarding',
      user: {
        id: finalUserId,
        name: fullName,
        email,
        googlePicture: avatarUrl,
        onboardingCompleted: profileCompleted,
        walletBalance: wallet.available_cash,
        initialBalance: 1000000
      }
    };
  }
}
