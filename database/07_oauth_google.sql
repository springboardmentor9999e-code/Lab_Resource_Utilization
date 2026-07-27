-- =============================================================
-- Lab Resource Utilization Platform
-- 07. MIGRATION — Google OAuth2 (ID-token flow)
-- Run this on an EXISTING database.
-- Note: app_user.auth_provider was already added in 05_migration_otp_oauth.sql;
-- the statement below is repeated here for idempotent safety on databases
-- that skipped migration 05.
-- =============================================================

-- Tracks how the account was created / authenticates: LOCAL | GOOGLE
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'LOCAL';

-- Backfill any NULLs so provider checks are reliable
UPDATE app_user SET auth_provider = 'LOCAL' WHERE auth_provider IS NULL;

-- Google login looks users up by email on every sign-in
CREATE INDEX IF NOT EXISTS idx_app_user_email ON app_user (email);

-- Useful for filtering / reporting on OAuth accounts
CREATE INDEX IF NOT EXISTS idx_app_user_auth_provider ON app_user (auth_provider);
