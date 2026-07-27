-- =============================================================
-- Lab Resource Utilization Platform
-- 05. MIGRATION — OTP password reset + OAuth2 support
-- Run this on an EXISTING database created before this feature.
-- (Fresh databases get these columns from Hibernate ddl-auto or 01_*.sql)
-- =============================================================

-- OTP-based password reset columns
ALTER TABLE password_reset_token ADD COLUMN IF NOT EXISTS otp          VARCHAR(6);
ALTER TABLE password_reset_token ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE password_reset_token ADD COLUMN IF NOT EXISTS attempts     INT DEFAULT 0;

-- OAuth2 provider tracking on users
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'LOCAL';
