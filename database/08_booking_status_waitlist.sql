-- =============================================================
-- Lab Resource Utilization Platform
-- 08. BOOKING STATUS MODEL MIGRATION + WAITLIST TABLE
-- =============================================================

-- ---------------------------------------------------------
-- Booking status model per spec:
-- PENDING | CONFIRMED | IN_USE | COMPLETED | CANCELLED | NO_SHOW | REJECTED
-- Legacy value APPROVED is migrated to CONFIRMED.
-- ---------------------------------------------------------
UPDATE booking SET status = 'CONFIRMED' WHERE status = 'APPROVED';

-- ---------------------------------------------------------
-- WAITLIST
-- status: WAITING | NOTIFIED | CONVERTED | EXPIRED | CANCELLED
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS waitlist (
    waitlist_id      BIGSERIAL PRIMARY KEY,
    equipment_id     BIGINT NOT NULL REFERENCES equipment (equipment_id),
    user_id          BIGINT NOT NULL REFERENCES app_user (user_id),
    requested_date   DATE NOT NULL,
    start_time       TIME,
    end_time         TIME,
    priority         INTEGER DEFAULT 0,
    status           VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    requested_at     TIMESTAMP,
    notified_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_waitlist_equipment ON waitlist (equipment_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_user ON waitlist (user_id);
