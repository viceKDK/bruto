-- Migration 004: Coin Economy System (Story 11.1)
-- Adds coin transaction tracking and level 10 reward flag

-- Coin Transactions History
CREATE TABLE IF NOT EXISTS coin_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'LEVEL_10_REWARD', 'SLOT_PURCHASE', etc.
  bruto_id TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add level 10 coin reward tracking to brutos
-- This prevents farming by leveling same bruto multiple times
ALTER TABLE brutos ADD COLUMN level_10_coin_rewarded INTEGER DEFAULT 0;

-- Index for faster transaction queries
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coin_transactions(created_at);
