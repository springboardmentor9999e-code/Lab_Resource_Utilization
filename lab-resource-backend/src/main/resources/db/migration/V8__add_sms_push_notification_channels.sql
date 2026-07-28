-- Add sms_enabled and push_enabled columns to notification_preferences
ALTER TABLE notification_preferences ADD COLUMN sms_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE notification_preferences ADD COLUMN push_enabled BOOLEAN NOT NULL DEFAULT TRUE;
