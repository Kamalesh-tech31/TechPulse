-- Drop existing tables if they exist to avoid collision errors
DROP TABLE IF EXISTS otp_verifications CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create central credentials table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- Nullable to support Google OAuth
  auth_provider VARCHAR(50) DEFAULT 'email' NOT NULL, -- 'email' or 'google'
  email_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create user profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  username VARCHAR(100) UNIQUE,
  phone VARCHAR(50),
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(50),
  occupation VARCHAR(100),
  experience_level VARCHAR(100),
  annual_income VARCHAR(100),
  investment_goal VARCHAR(255),
  risk_tolerance VARCHAR(100),
  preferred_markets TEXT[],
  investment_horizon VARCHAR(100),
  profile_completed BOOLEAN DEFAULT FALSE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create OTP verifications table
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  purpose VARCHAR(50) NOT NULL, -- 'signup', 'forgot_password', 'email_change'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index on otp_verifications email & otp for rapid queries
CREATE INDEX idx_otp_verifications_lookup ON otp_verifications (email, otp);
