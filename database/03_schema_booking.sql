-- =============================================================
-- Lab Resource Utilization Platform
-- 03. BOOKING & SCHEDULING TABLES
-- Matches EER Diagram Section 3 + JPA entities
-- =============================================================

-- ---------------------------------------------------------
-- BOOKING
-- status: PENDING | APPROVED | REJECTED | COMPLETED
-- (future statuses per spec: CONFIRMED, IN_USE, CANCELLED, NO_SHOW)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking (
    booking_id       BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES app_user (user_id),
    equipment_id     BIGINT NOT NULL REFERENCES equipment (equipment_id),
    booking_date     DATE NOT NULL,
    start_time       TIME NOT NULL,
    end_time         TIME NOT NULL,
    status           VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP
);
