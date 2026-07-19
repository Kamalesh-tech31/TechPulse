import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const sendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  purpose: z.enum(['signup', 'forgot_password', 'email_change'])
});

export const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'Verification code must be 6 digits'),
  purpose: z.enum(['signup', 'forgot_password', 'email_change'])
});

export const googleAuthSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  picture: z.string().url().optional().or(z.string().length(0))
});

export const onboardingSchema = z.object({
  occupation: z.enum(['Student', 'Professional']),
  experience: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  primaryGoal: z.enum(['Learning', 'Stock Analysis', 'Virtual Trading', 'Portfolio Improvement'])
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  username: z.string().min(3).optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  annualIncome: z.string().optional(),
  riskTolerance: z.string().optional(),
  preferredMarkets: z.array(z.string()).optional(),
  investmentHorizon: z.string().optional(),
  // New editable profile fields
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  investmentGoal: z.enum(['Learning', 'Stock Analysis', 'Virtual Trading', 'Portfolio Improvement']).optional(),
  preferredSectors: z.array(z.string()).optional(),
});
