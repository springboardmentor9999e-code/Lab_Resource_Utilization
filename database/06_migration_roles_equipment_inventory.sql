-- =============================================================
-- Lab Resource Utilization Platform
-- 06. MIGRATION — 7-role RBAC model + Equipment Inventory expansion
-- Run this on an EXISTING database. Fresh databases get all of this
-- from Hibernate ddl-auto=update + DatabaseInitializer automatically.
-- =============================================================

-- ---------------------------------------------------------
-- 1. Role migration: legacy 4-role -> 7-role model
-- ---------------------------------------------------------
UPDATE role SET role_name = 'SYSTEM_ADMIN',   description = 'System Administrator' WHERE role_name = 'ADMIN';
UPDATE role SET role_name = 'DEPARTMENT_HEAD', description = 'Department Head'      WHERE role_name = 'HOD';
UPDATE role SET role_name = 'LAB_TECHNICIAN',  description = 'Lab Technician'       WHERE role_name = 'TECHNICIAN';

INSERT INTO role (role_name, description, is_system_role, created_at, updated_at) VALUES
    ('SYSTEM_ADMIN',      'System Administrator',      TRUE,  NOW(), NOW()),
    ('INSTITUTION_ADMIN', 'Institution Administrator', TRUE,  NOW(), NOW()),
    ('DEPARTMENT_HEAD',   'Department Head',           FALSE, NOW(), NOW()),
    ('LAB_MANAGER',       'Lab Manager',               FALSE, NOW(), NOW()),
    ('LAB_TECHNICIAN',    'Lab Technician',            FALSE, NOW(), NOW()),
    ('RESEARCHER',        'Researcher',                FALSE, NOW(), NOW()),
    ('STUDENT',           'Student Role',              FALSE, NOW(), NOW())
ON CONFLICT (role_name) DO NOTHING;

-- ---------------------------------------------------------
-- 2. Equipment table: new inventory columns
-- Status values: AVAILABLE | IN_USE | RESERVED | UNDER_MAINTENANCE | OUT_OF_SERVICE | LOST
-- ---------------------------------------------------------
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS warranty_expiry  DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS vendor           VARCHAR(150);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS cost             NUMERIC(12,2);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS current_location VARCHAR(200);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS description      TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS specifications   TEXT;         -- JSON key/value pairs
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS qr_code          VARCHAR(255); -- QR payload (LRP-EQ:<code>)
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS rfid_tag         VARCHAR(100);

-- Migrate legacy RESERVED-only statuses if needed (no-op if already fine)
UPDATE equipment SET qr_code = 'LRP-EQ:' || equipment_code WHERE qr_code IS NULL;

-- ---------------------------------------------------------
-- 3. EQUIPMENT_IMAGE (EER Diagram: equipment_image)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment_image (
    image_id      BIGSERIAL PRIMARY KEY,
    equipment_id  BIGINT NOT NULL REFERENCES equipment (equipment_id) ON DELETE CASCADE,
    image_url     VARCHAR(500) NOT NULL,
    file_name     VARCHAR(255),
    is_primary    BOOLEAN DEFAULT FALSE,
    uploaded_by   VARCHAR(100),
    uploaded_at   TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipment_image_equipment ON equipment_image (equipment_id);

-- ---------------------------------------------------------
-- 4. EQUIPMENT_DOCUMENT (EER Diagram: equipment_document)
-- document_type: MANUAL | WARRANTY | SPECIFICATION | CALIBRATION | OTHER
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment_document (
    document_id   BIGSERIAL PRIMARY KEY,
    equipment_id  BIGINT NOT NULL REFERENCES equipment (equipment_id) ON DELETE CASCADE,
    document_type VARCHAR(50) DEFAULT 'OTHER',
    title         VARCHAR(150),
    file_url      VARCHAR(500) NOT NULL,
    file_name     VARCHAR(255),
    file_size     BIGINT,
    uploaded_by   VARCHAR(100),
    uploaded_at   TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipment_document_equipment ON equipment_document (equipment_id);
