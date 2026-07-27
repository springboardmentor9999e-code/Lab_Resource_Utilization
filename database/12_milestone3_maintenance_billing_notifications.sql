-- ============================================================
-- Migration 12: Milestone 3
--   (1) Notification & alert system      (notification)
--   (2) Maintenance & calibration        (maintenance_request, maintenance_schedule, equipment_calibration)
--   (3) Cost tracking & billing          (invoice)
-- Idempotent: safe to run multiple times.
-- ============================================================

-- ---------- (1) Notifications ----------
CREATE TABLE IF NOT EXISTS notification (
    notification_id  BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    type             VARCHAR(40) NOT NULL,   -- BOOKING | WAITLIST | SHARING | MAINTENANCE | CALIBRATION | BILLING | SYSTEM
    title            VARCHAR(150) NOT NULL,
    message          VARCHAR(500) NOT NULL,
    link             VARCHAR(150),
    is_read          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notification_user      ON notification(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_user_read ON notification(user_id, is_read);

-- ---------- (2) Maintenance & Calibration ----------
CREATE TABLE IF NOT EXISTS maintenance_request (
    request_id        BIGSERIAL PRIMARY KEY,
    equipment_id      BIGINT NOT NULL REFERENCES equipment(equipment_id),
    requested_by      BIGINT NOT NULL REFERENCES app_user(user_id),
    assigned_to       BIGINT REFERENCES app_user(user_id),
    type              VARCHAR(20) NOT NULL,  -- PREVENTIVE | CORRECTIVE | CALIBRATION | INSPECTION
    priority          VARCHAR(10) NOT NULL DEFAULT 'MEDIUM', -- LOW | MEDIUM | HIGH | CRITICAL
    title             VARCHAR(150) NOT NULL,
    description       VARCHAR(1000),
    status            VARCHAR(20) NOT NULL DEFAULT 'OPEN',   -- OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED
    scheduled_date    DATE,
    started_at        TIMESTAMP,
    completed_at      TIMESTAMP,
    downtime_minutes  BIGINT,
    resolution_notes  VARCHAR(1000),
    cost              DECIMAL(12,2),
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_maintenance_request_equipment ON maintenance_request(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_request_status    ON maintenance_request(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_request_assigned  ON maintenance_request(assigned_to);

CREATE TABLE IF NOT EXISTS maintenance_schedule (
    schedule_id          BIGSERIAL PRIMARY KEY,
    equipment_id         BIGINT NOT NULL REFERENCES equipment(equipment_id),
    created_by           BIGINT NOT NULL REFERENCES app_user(user_id),
    maintenance_type     VARCHAR(20) NOT NULL,  -- PREVENTIVE | CALIBRATION | INSPECTION
    interval_days        INT NOT NULL,
    next_due_date        DATE NOT NULL,
    last_generated_date  DATE,
    notes                VARCHAR(500),
    active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_equipment ON maintenance_schedule(equipment_id);

CREATE TABLE IF NOT EXISTS equipment_calibration (
    calibration_id      BIGSERIAL PRIMARY KEY,
    equipment_id        BIGINT NOT NULL REFERENCES equipment(equipment_id),
    calibration_date    DATE NOT NULL,
    next_due_date       DATE NOT NULL,
    certificate_number  VARCHAR(100),
    calibrated_by       VARCHAR(150),
    remarks             VARCHAR(500),
    created_by          BIGINT NOT NULL REFERENCES app_user(user_id),
    reminder_sent       BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_equipment_calibration_equipment ON equipment_calibration(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_calibration_due       ON equipment_calibration(next_due_date);

-- ---------- (3) Inter-institution billing ----------
CREATE TABLE IF NOT EXISTS invoice (
    invoice_id          BIGSERIAL PRIMARY KEY,
    invoice_number      VARCHAR(30) UNIQUE,
    sharing_request_id  BIGINT UNIQUE REFERENCES sharing_request(sharing_request_id),
    from_institution_id BIGINT NOT NULL REFERENCES institution(institution_id),  -- issuer (owner, receives payment)
    to_institution_id   BIGINT NOT NULL REFERENCES institution(institution_id),  -- billed (requester, pays)
    amount              DECIMAL(12,2) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING | PAID | CANCELLED
    issued_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date            DATE NOT NULL,
    paid_date           DATE,
    description         VARCHAR(500),
    created_by          BIGINT NOT NULL REFERENCES app_user(user_id),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_invoice_from_institution ON invoice(from_institution_id);
CREATE INDEX IF NOT EXISTS idx_invoice_to_institution   ON invoice(to_institution_id);
