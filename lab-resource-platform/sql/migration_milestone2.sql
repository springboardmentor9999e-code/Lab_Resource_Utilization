-- Migration for Milestone 2: Waitlist Management
-- Run this against your existing Postgres database (lab_Resource_Utilization_Platform)
-- BEFORE starting the backend, since Hibernate's ddl-auto=update will add the new
-- created_at column automatically, but will NOT touch existing CHECK constraints.

-- 1. Allow 'Waitlisted' as a valid booking status.
--    First find your existing constraint name if this fails (it may not be called
--    "bookings_status_check" depending on how it was originally created):
--    SELECT conname FROM pg_constraint WHERE conrelid = 'bookings'::regclass;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
    CHECK (status IN ('Pending Approval', 'Confirmed', 'In Use', 'Completed', 'Cancelled', 'No Show', 'Waitlisted'));

-- 2. Backfill created_at for any existing rows (new rows get it automatically via @PrePersist).
--    If the column doesn't exist yet, let Hibernate create it on next app startup, then run:
-- UPDATE bookings SET created_at = booking_date::timestamp WHERE created_at IS NULL;

-- 3. utilization_logs gains a new NOT NULL recorded_at column (item #4 of the fixes
--    spec: heatmap/idle queries now filter on when a log was recorded, not the
--    scheduled usage_start/usage_end). Hibernate's ddl-auto=update will add the
--    column, but ADD COLUMN ... NOT NULL fails on a table that already has rows
--    unless a default is provided first. If you have existing utilization_logs
--    rows, run this BEFORE starting the app on this version:
--
-- ALTER TABLE utilization_logs ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMP;
-- UPDATE utilization_logs SET recorded_at = usage_end WHERE recorded_at IS NULL;
-- ALTER TABLE utilization_logs ALTER COLUMN recorded_at SET NOT NULL;
--
-- (On a fresh database with no existing utilization_logs rows, Hibernate can
-- create the column and constraint together with no manual step needed.)
