import { Request, Response } from 'express';
import { hashPassword } from '../utils/hashPassword';
import { comparePassword } from '../utils/comparePassword';
import { UserService } from '../services/user.service';
import { OTPService } from '../services/otp.service';
import { EmailService } from '../services/email.service';
import { JWTService } from '../services/jwt.service';
import {
  registerSchema,
  loginSchema,
  sendOTPSchema,
  verifyOTPSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validators/auth.validation';

// Helper to keep track of unverified temporary signup passwords in memory
// Alternatively, we can verify email first and create the user later.
// To prevent password loss during the OTP step, we temporarily store the registration input.
const signupCache = new Map<string, { name: string; passwordHash: string; timestamp: number }>();

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const val = registerSchema.safeParse(req.body);
      if (!val.success) {
        return res.status(400).json({ success: false, message: val.error.issues[0].message });
      }

      const { email, password, name } = val.data;

      // Check if user already exists
      const existing = await UserService.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      // Hash password and store in temporary cache
      const pwHash = await hashPassword(password);
      signupCache.set(email.toLowerCase().trim(), {
        name,
        passwordHash: pwHash,
        timestamp: Date.now()
      });

      // Generate and send signup OTP
      const otp = await OTPService.createOTP(email, 'signup');
      await EmailService.sendVerificationOTP(name, email, otp);

      return res.status(200).json({
        success: true,
        message: 'Verification code sent to your email address.',
        data: { email }
      });
    } catch (error: any) {
      console.error('[Register Error]:', error);
      return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  static async sendOTP(req: Request, res: Response) {
    try {
      const val = sendOTPSchema.safeParse(req.body);
      if (!val.success) {
        return res.status(400).json({ success: false, message: val.error.issues[0].message });
      }

      const { email, purpose } = val.data;

      if (purpose === 'signup') {
        const cached = signupCache.get(email.toLowerCase().trim());
        if (!cached) {
          return res.status(400).json({ success: false, message: 'Please submit the registration form first.' });
        }
        const otp = await OTPService.createOTP(email, 'signup');
        await EmailService.sendVerificationOTP(cached.name, email, otp);
      } else if (purpose === 'forgot_password') {
        const existing = await UserService.findUserByEmail(email);
        if (!existing) {
          return res.status(400).json({ success: false, message: 'No account found with this email address.' });
        }
        const otp = await OTPService.createOTP(email, 'forgot_password');
        await EmailService.sendForgotPasswordOTP(email, otp);
      } else {
        const otp = await OTPService.createOTP(email, purpose);
        await EmailService.sendForgotPasswordOTP(email, otp);
      }

      return res.status(200).json({ success: true, message: 'Verification code resent successfully.' });
    } catch (error: any) {
      console.error('[Send OTP Error]:', error);
      return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    try {
      const val = verifyOTPSchema.safeParse(req.body);
      if (!val.success) {
        return res.status(400).json({ success: false, message: val.error.issues[0].message });
      }

      const { email, otp, purpose } = val.data;
      const formattedEmail = email.toLowerCase().trim();

      // Verify OTP matches
      await OTPService.verifyOTP(formattedEmail, otp, purpose);

      if (purpose === 'signup') {
        const cached = signupCache.get(formattedEmail);
        if (!cached) {
          return res.status(400).json({ success: false, message: 'Registration cache expired. Please sign up again.' });
        }

        // Create user in Database
        const { user, profile } = await UserService.createUser({
          email: formattedEmail,
          passwordHash: cached.passwordHash,
          authProvider: 'email',
          emailVerified: true,
          fullName: cached.name
        });

        // Invalidate cache
        signupCache.delete(formattedEmail);

        // Sign session token
        const token = JWTService.signToken({ userId: user.id, email: user.email });

        return res.status(200).json({
          success: true,
          message: 'Account verified successfully.',
          data: {
            token,
            user: {
              name: profile.full_name,
              email: user.email,
              walletBalance: 1000000,
              initialBalance: 1000000,
              onboardingCompleted: false
            }
          }
        });
      }

      // For reset password flow, return successful validation signal
      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully.',
        data: { email: formattedEmail }
      });
    } catch (error: any) {
      console.error('[Verify OTP Error]:', error);
      return res.status(400).json({ success: false, message: error.message || 'OTP verification failed' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const val = loginSchema.safeParse(req.body);
      if (!val.success) {
        return res.status(400).json({ success: false, message: val.error.issues[0].message });
      }

      const { email, password } = val.data;
      const user = await UserService.findUserByEmail(email);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (user.auth_provider === 'google') {
        return res.status(400).json({ success: false, message: 'This account is registered via Google Sign-In.' });
      }

      const isMatch = await comparePassword(password, user.password_hash || '');
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const profile = await UserService.getProfileByUserId(user.id);
      const token = JWTService.signToken({ userId: user.id, email: user.email });

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          user: {
            name: profile?.full_name || user.email.split('@')[0],
            email: user.email,
            walletBalance: 1000000,
            initialBalance: 1000000,
            onboardingCompleted: profile?.profile_completed || false,
            googlePicture: profile?.avatar_url || ''
          }
        }
      });
    } catch (error: any) {
      console.error('[Login Error]:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async google(req: Request, res: Response) {
    try {
      const val = googleAuthSchema.safeParse(req.body);
      if (!val.success) {
        return res.status(400).json({ success: false, message: val.error.issues[0].message });
      }

      const { email, name, picture } = val.data;
      const formattedEmail = email.toLowerCase().trim();

      let user = await UserService.findUserByEmail(formattedEmail);
      let profile;

      if (!user) {
        // Create new user via Google
        const created = await UserService.createUser({
          email: formattedEmail,
          authProvider: 'google',
          emailVerified: true,
          fullName: name,
          avatarUrl: picture || undefined
        });
        user = created.user;
        profile = created.profile;
      } else {
        profile = await UserService.getProfileByUserId(user.id);
      }

      const token = JWTService.signToken({ userId: user.id, email: user.email });

      return res.status(200).json({
        success: true,
        message: 'Google sign-in successful.',
        data: {
          token,
          user: {
            name: profile?.full_name || name,
            email: user.email,
            walletBalance: 1000000,
            initialBalance: 1000000,
            onboardingCompleted: profile?.profile_completed || false,
            googlePicture: profile?.avatar_url || picture || ''
          }
        }
      });
    } catch (error: any) {
      console.error('[Google OAuth API Error]:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const val = forgotPasswordSchema.safeParse(req.body);
      if (!val.success) {
        return res.status(400).json({ success: false, message: val.error.issues[0].message });
      }

      const { email } = val.data;
      const user = await UserService.findUserByEmail(email);

      if (!user) {
        return res.status(404).json({ success: false, message: 'No user account found with this email address.' });
      }

      if (user.auth_provider === 'google') {
        return res.status(400).json({ success: false, message: 'This email is linked to a Google Sign-In account.' });
      }

      // Generate and send password reset OTP
      const otp = await OTPService.createOTP(email, 'forgot_password');
      await EmailService.sendForgotPasswordOTP(email, otp);

      return res.status(200).json({
        success: true,
        message: 'Password reset code sent to your email address.'
      });
    } catch (error: any) {
      console.error('[Forgot Password Error]:', error);
      return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const val = resetPasswordSchema.safeParse(req.body);
      if (!val.success) {
        return res.status(400).json({ success: false, message: val.error.issues[0].message });
      }

      const { email, password } = val.data;
      const user = await UserService.findUserByEmail(email);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Update password hash in database
      const hash = await hashPassword(password);
      await UserService.updatePassword(user.id, hash);

      return res.status(200).json({
        success: true,
        message: 'Password has been reset successfully.'
      });
    } catch (error: any) {
      console.error('[Reset Password Error]:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async logout(req: Request, res: Response) {
    return res.status(200).json({ success: true, message: 'Session logged out successfully.' });
  }

  static async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Session unauthenticated.' });
      }

      const profile = await UserService.getProfileByUserId(req.user.userId);

      return res.status(200).json({
        success: true,
        data: {
          user: {
            name: profile?.full_name || req.user.email.split('@')[0],
            email: req.user.email,
            walletBalance: 1000000,
            initialBalance: 1000000,
            onboardingCompleted: profile?.profile_completed || false,
            googlePicture: profile?.avatar_url || ''
          }
        }
      });
    } catch (error: any) {
      console.error('[Get Session Profile Error]:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

