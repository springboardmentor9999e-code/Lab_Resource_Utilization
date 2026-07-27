-- ============================================================================
-- Milestone 3 — Notification channels: SMS (Twilio) and push (Firebase FCM)
--
-- Email and in-app alerts already existed; this adds the two remaining channels
-- from Module 7 (vii) and (viii).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Per-user channel opt-outs.
-- NULL means "never chosen" and is read as enabled, so existing users keep
-- receiving alerts rather than silently going dark after this migration.
-- ---------------------------------------------------------------------------
ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS sms_notifications_enabled  BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT TRUE;

-- ---------------------------------------------------------------------------
-- FCM registration tokens, one row per device.
-- Per device rather than per user: a researcher may be signed in on a laptop and
-- a phone simultaneously and both should be alerted.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_device_token (
    device_token_id BIGSERIAL PRIMARY KEY,
    user_id         BIGINT       NOT NULL REFERENCES app_user (user_id) ON DELETE CASCADE,
    token           VARCHAR(512) NOT NULL,
    platform        VARCHAR(20)  DEFAULT 'WEB',
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    last_seen_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    -- FCM issues one token per device install. Unique so re-registering refreshes
    -- the existing row instead of pushing the same alert to one device twice.
    CONSTRAINT uk_device_token UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS idx_device_token_user ON user_device_token (user_id);
