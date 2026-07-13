import { supabase } from '../config/supabase';

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

    // 2. Check if a user with the same email exists in our `users` table
    const { data: existingUser, error: fetchUserError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (fetchUserError) {
      throw new Error('Database lookup failed: ' + fetchUserError.message);
    }

    let finalUserId: string;
    let profileCompleted = false;

    if (!existingUser) {
      // 3a. New User: Create record in `users` table using the Supabase Auth UID
      const supabaseUserId = authUser.id;
      const { data: newUser, error: insertUserError } = await supabase
        .from('users')
        .insert({
          id: supabaseUserId, // use Supabase Auth UID
          email,
          auth_provider: 'google',
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (insertUserError || !newUser) {
        throw new Error('Failed to create user record: ' + (insertUserError?.message || 'Unknown error'));
      }

      finalUserId = newUser.id;

      // 3b. Create user profile in `user_profiles`
      const { error: insertProfileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: finalUserId,
          full_name: fullName,
          avatar_url: avatarUrl,
          profile_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertProfileError) {
        // Rollback
        await supabase.from('users').delete().eq('id', finalUserId);
        throw new Error('Failed to create user profile: ' + insertProfileError.message);
      }

      profileCompleted = false;
    } else {
      // 3c. Existing User: Check if auth_provider needs to be updated to support Google
      finalUserId = existingUser.id;
      
      let updatedProvider = existingUser.auth_provider;
      if (!existingUser.auth_provider.includes('google')) {
        // Merge auth providers
        const providers = existingUser.auth_provider.split(',').map((p: string) => p.trim());
        if (!providers.includes('google')) {
          providers.push('google');
        }
        updatedProvider = providers.join(',');
      }

      // Update auth_provider, email_verified, and updated_at
      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          auth_provider: updatedProvider,
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', finalUserId);

      if (updateUserError) {
        throw new Error('Failed to update user auth provider: ' + updateUserError.message);
      }

      // Sync user profile name and avatar if they changed
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
        // If profile is missing for some reason, create it
        const { error: insertProfileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: finalUserId,
            full_name: fullName,
            avatar_url: avatarUrl,
            profile_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertProfileError) {
          throw new Error('Failed to recreate missing user profile: ' + insertProfileError.message);
        }
        profileCompleted = false;
      }
    }

    return {
      success: true,
      redirectTo: profileCompleted ? '/dashboard' : '/onboarding',
      user: {
        id: finalUserId,
        name: fullName,
        email,
        googlePicture: avatarUrl,
        onboardingCompleted: profileCompleted,
        walletBalance: 1000000,
        initialBalance: 1000000
      }
    };
  }
}
