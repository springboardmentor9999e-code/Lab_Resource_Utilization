-- ============================================================
-- Migration 11: Milestone 2 completion
--   (1) Booking audit trail  (booking_history)
--   (2) Recurring bookings   (recurring_booking + booking.recurring_id)
--   (3) Usage fee / cost-sharing (equipment.hourly_rate, sharing_request fee columns)
-- Idempotent: safe to run multiple times.
-- ============================================================

-- ---------- (1) Booking audit trail ----------
CREATE TABLE IF NOT EXISTS booking_history (
    history_id   BIGSERIAL PRIMARY KEY,
    booking_id   BIGINT NOT NULL REFERENCES booking(booking_id) ON DELETE CASCADE,
    old_status   VARCHAR(30),           -- NULL for the creation entry
    new_status   VARCHAR(30) NOT NULL,
    changed_by   VARCHAR(100),          -- username of the actor
    remarks      VARCHAR(255),
    changed_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_history_booking ON booking_history(booking_id);

-- ---------- (2) Recurring bookings ----------
CREATE TABLE IF NOT EXISTS recurring_booking (
    recurring_id         BIGSERIAL PRIMARY KEY,
    user_id              BIGINT NOT NULL REFERENCES app_user(user_id),
    equipment_id         BIGINT NOT NULL REFERENCES equipment(equipment_id),
    frequency            VARCHAR(20) NOT NULL,   -- DAILY | WEEKLY
    start_date           DATE NOT NULL,
    end_date             DATE NOT NULL,
    start_time           TIME NOT NULL,
    end_time             TIME NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | CANCELLED
    occurrences_created  INT,
    occurrences_skipped  INT,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recurring_booking_user      ON recurring_booking(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_booking_equipment ON recurring_booking(equipment_id);

-- Link each occurrence back to its series
ALTER TABLE booking ADD COLUMN IF NOT EXISTS recurring_id BIGINT REFERENCES recurring_booking(recurring_id);
CREATE INDEX IF NOT EXISTS idx_booking_recurring ON booking(recurring_id);

-- ---------- (3) Usage fee / cost-sharing ----------
-- Hourly usage fee for shared access (NULL or 0 = free)
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);

-- Fee snapshot on each sharing request (rate can change later without
-- altering already-created requests)
ALTER TABLE sharing_request ADD COLUMN IF NOT EXISTS hourly_rate   DECIMAL(10,2);
ALTER TABLE sharing_request ADD COLUMN IF NOT EXISTS estimated_fee DECIMAL(12,2);
