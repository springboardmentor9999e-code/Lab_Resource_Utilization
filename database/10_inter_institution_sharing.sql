-- =============================================================
-- Lab Resource Utilization Platform
-- 10. MIGRATION — Inter-Institution Resource Sharing
-- Run this on an EXISTING database. Fresh databases get all of this
-- from Hibernate ddl-auto=update automatically.
-- =============================================================

-- ---------------------------------------------------------
-- 1. Equipment: shareable flag (also created by Hibernate)
-- ---------------------------------------------------------
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS is_shareable BOOLEAN DEFAULT FALSE;

UPDATE equipment SET is_shareable = FALSE WHERE is_shareable IS NULL;

-- ---------------------------------------------------------
-- 2. SHARING_REQUEST (EER Diagram: sharing_request)
-- status: PENDING | APPROVED | REJECTED | CANCELLED | COMPLETED
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS sharing_request (
    sharing_request_id  BIGSERIAL PRIMARY KEY,
    equipment_id        BIGINT NOT NULL REFERENCES equipment (equipment_id),
    from_institution_id BIGINT NOT NULL REFERENCES institution (institution_id),
    to_institution_id   BIGINT NOT NULL REFERENCES institution (institution_id),
    requested_by        BIGINT NOT NULL REFERENCES app_user (user_id),
    approved_by         BIGINT REFERENCES app_user (user_id),
    purpose             VARCHAR(500) NOT NULL,
    requested_date      DATE NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    remarks             VARCHAR(255),
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sharing_request_equipment        ON sharing_request (equipment_id);
CREATE INDEX IF NOT EXISTS idx_sharing_request_from_institution ON sharing_request (from_institution_id);
CREATE INDEX IF NOT EXISTS idx_sharing_request_to_institution   ON sharing_request (to_institution_id);
