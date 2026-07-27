-- ============================================================
-- Migration 15: Budget tracking & Department Chargeback
--   (1) Add annual_budget to department table
--   (2) Create the department_charge chargeback ledger
-- ============================================================

-- No DEFAULT and no seeded amounts: NULL means "no budget set", which reporting
-- must show as "not tracked" rather than as a budget of zero or an invented figure.
-- Set each department's real budget from the Billing screen.
ALTER TABLE department
    ADD COLUMN IF NOT EXISTS annual_budget DECIMAL(14,2);

CREATE TABLE IF NOT EXISTS department_charge (
    charge_id              BIGSERIAL PRIMARY KEY,
    department_id          BIGINT NOT NULL REFERENCES department(department_id) ON DELETE CASCADE,
    equipment_id           BIGINT REFERENCES equipment(equipment_id) ON DELETE SET NULL,
    user_id                BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
    booking_id             BIGINT UNIQUE REFERENCES booking(booking_id) ON DELETE SET NULL,
    maintenance_request_id BIGINT UNIQUE REFERENCES maintenance_request(request_id) ON DELETE SET NULL,
    charge_type            VARCHAR(20) NOT NULL, -- USAGE | MAINTENANCE
    amount                 DECIMAL(12,2) NOT NULL,
    hours                  DOUBLE PRECISION,
    charge_date            DATE NOT NULL DEFAULT CURRENT_DATE,
    description            VARCHAR(500),
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_department_charge_dept ON department_charge(department_id);
CREATE INDEX IF NOT EXISTS idx_department_charge_date ON department_charge(charge_date);
