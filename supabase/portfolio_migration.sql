-- ============================================================
-- Trado — Portfolio Schema Migration
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- Safe to run multiple times (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- ============================================================

-- 1. wallet table — one row per user, tracks virtual cash balance
CREATE TABLE IF NOT EXISTS wallet (
  user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  available_cash          NUMERIC(15, 2) NOT NULL DEFAULT 1000000.00,
  portfolio_value         NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  profit_loss             NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  initial_capital         NUMERIC(15, 2) NOT NULL DEFAULT 1000000.00,
  weekly_credit_limit     NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  weekly_credit_remaining NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  last_weekly_reset       TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- Migrate existing wallet rows to add new weekly-credit columns
ALTER TABLE wallet ADD COLUMN IF NOT EXISTS initial_capital         NUMERIC(15, 2) NOT NULL DEFAULT 1000000.00;
ALTER TABLE wallet ADD COLUMN IF NOT EXISTS weekly_credit_limit     NUMERIC(15, 2) NOT NULL DEFAULT 100000.00;
ALTER TABLE wallet ADD COLUMN IF NOT EXISTS weekly_credit_remaining NUMERIC(15, 2) NOT NULL DEFAULT 100000.00;
ALTER TABLE wallet ADD COLUMN IF NOT EXISTS last_weekly_reset       TIMESTAMPTZ    NOT NULL DEFAULT now();


-- 2. holdings table — one row PER BUY TRANSACTION (never merged)
--    buy_price is immutable after insert
CREATE TABLE IF NOT EXISTS holdings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_symbol  VARCHAR(50)  NOT NULL,
  company_name    TEXT         NOT NULL,
  exchange        VARCHAR(20)  NOT NULL DEFAULT 'NSE',
  quantity        INTEGER      NOT NULL CHECK (quantity > 0),
  buy_price       NUMERIC(12, 2) NOT NULL,   -- NEVER updated after insert
  buy_time        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  current_price   NUMERIC(12, 2),            -- optional cached live price
  status          VARCHAR(20)  NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_symbol  ON holdings(company_symbol);


-- 3. transactions table — immutable ledger of all BUY / SELL / CREDIT events
CREATE TABLE IF NOT EXISTS transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol            VARCHAR(50) NOT NULL,
  company_name      TEXT        NOT NULL,
  exchange          VARCHAR(20) NOT NULL DEFAULT 'NSE',
  type              VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL', 'CREDIT')),
  quantity          INTEGER     NOT NULL,
  price             NUMERIC(12, 2) NOT NULL,
  total_amount      NUMERIC(15, 2) NOT NULL,
  remaining_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  transaction_time  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migrate existing transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS remaining_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00;

-- Allow CREDIT type in existing check constraint
-- (If the constraint already exists and blocks CREDIT, drop and recreate it)
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check CHECK (type IN ('BUY', 'SELL', 'CREDIT'));

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_time    ON transactions(transaction_time DESC);


-- ============================================================
-- Also add new profile fields to user_profiles if not present
-- ============================================================
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS experience_level  VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS investment_goal   VARCHAR(100);

-- ============================================================
-- Backfill wallets for any existing users who don't have one
-- ============================================================
INSERT INTO wallet (user_id, available_cash, portfolio_value, profit_loss)
SELECT id, 1000000.00, 0.00, 0.00 FROM users
WHERE id NOT IN (SELECT user_id FROM wallet)
ON CONFLICT DO NOTHING;
