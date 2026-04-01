-- ============================================================
-- Migration: Add key_prefix column + indexes
-- Run this on your existing database to support the bug fixes
-- ============================================================

-- Add key_prefix column to api_keys table
-- (stores first 8 chars of raw key for fast lookup)
ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS key_prefix VARCHAR(8),
ADD COLUMN IF NOT EXISTS rate_limit INTEGER DEFAULT 100;

-- Add index on key_prefix for fast lookup in apikey.middleware.js
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix
  ON api_keys(key_prefix)
  WHERE is_active = TRUE;

-- Add index on usage_logs for fast rate limit counting
CREATE INDEX IF NOT EXISTS idx_usage_logs_key_time
  ON usage_logs(api_key_id, created_at DESC);

-- Add index on users email for fast login lookup
CREATE INDEX IF NOT EXISTS idx_users_email
  ON users(email);
