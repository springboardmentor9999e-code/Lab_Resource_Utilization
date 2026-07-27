-- =============================================================
-- Lab Resource Utilization Platform
-- 09. UTILIZATION MONITORING
-- Usage tracking table for the Utilization Monitoring module
-- =============================================================

-- ---------------------------------------------------------
-- EQUIPMENT_USAGE
-- One row per usage session, opened when a booking moves to
-- IN_USE and closed (end_time + duration) on COMPLETED.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment_usage (
    usage_id            BIGSERIAL PRIMARY KEY,
    equipment_id        BIGINT NOT NULL REFERENCES equipment (equipment_id),
    booking_id          BIGINT REFERENCES booking (booking_id),
    user_id             BIGINT NOT NULL REFERENCES app_user (user_id),
    start_time          TIMESTAMP NOT NULL,
    end_time            TIMESTAMP,
    usage_duration_min  INTEGER,
    created_at          TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipment_usage_equipment ON equipment_usage (equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_usage_user ON equipment_usage (user_id);
