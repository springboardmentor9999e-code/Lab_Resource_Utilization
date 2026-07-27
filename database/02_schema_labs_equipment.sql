-- =============================================================
-- Lab Resource Utilization Platform
-- 02. LAB & EQUIPMENT MANAGEMENT TABLES
-- Matches EER Diagram Section 2 + JPA entities
-- =============================================================

-- ---------------------------------------------------------
-- LAB
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS lab (
    lab_id           BIGSERIAL PRIMARY KEY,
    name             VARCHAR(150) NOT NULL,
    code             VARCHAR(50)  NOT NULL UNIQUE,
    capacity         INT NOT NULL,
    location         VARCHAR(200),
    department_id    BIGINT NOT NULL REFERENCES department (department_id),
    institution_id   BIGINT NOT NULL REFERENCES institution (institution_id),
    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP
);

-- ---------------------------------------------------------
-- EQUIPMENT
-- status: AVAILABLE | BOOKED | UNDER_MAINTENANCE | OUT_OF_SERVICE | RETIRED
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment (
    equipment_id     BIGSERIAL PRIMARY KEY,
    equipment_name   VARCHAR(150) NOT NULL,
    equipment_code   VARCHAR(50)  NOT NULL UNIQUE,
    category         VARCHAR(100) NOT NULL,
    manufacturer     VARCHAR(100),
    model            VARCHAR(100),
    serial_number    VARCHAR(100),
    purchase_date    DATE,
    status           VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    lab_id           BIGINT REFERENCES lab (lab_id),
    department_id    BIGINT REFERENCES department (department_id),
    institution_id   BIGINT REFERENCES institution (institution_id),
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP
);
