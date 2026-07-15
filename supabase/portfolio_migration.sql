-- ============================================================
-- TechPulse / Trado — Portfolio Schema Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. wallet table — one row per user, tracks virtual cash balance
CREATE TABLE IF NOT EXISTS wallet (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  available_cash  NUMERIC(15, 2) NOT NULL DEFAULT 1000000.00,
  portfolio_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  profit_loss     NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT now()
);

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

-- 3. transactions table — immutable ledger of all BUY/SELL events
CREATE TABLE IF NOT EXISTS transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol           VARCHAR(50) NOT NULL,
  company_name     TEXT        NOT NULL,
  exchange         VARCHAR(20) NOT NULL DEFAULT 'NSE',
  type             VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  quantity         INTEGER     NOT NULL,
  price            NUMERIC(12, 2) NOT NULL,
  total_amount     NUMERIC(15, 2) NOT NULL,
  transaction_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_time    ON transactions(transaction_time DESC);

-- ============================================================
-- NOTE: Run this AFTER the tables are created to backfill
-- wallets for any existing users who don't have one yet.
-- ============================================================
-- INSERT INTO wallet (user_id, available_cash, portfolio_value, profit_loss)
-- SELECT id, 1000000.00, 0.00, 0.00 FROM users
-- WHERE id NOT IN (SELECT user_id FROM wallet);
