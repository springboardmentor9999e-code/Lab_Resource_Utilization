-- V14: 6-month service cycle tracking + calibration certificate renewal

-- 1. Equipment service-cycle fields (interval configurable, default 6 months)
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS service_interval_months INT NOT NULL DEFAULT 6;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS last_service_date DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS next_service_due_date DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS service_reminder_sent_on DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS calibration_interval_months INT NOT NULL DEFAULT 12;

-- 2. Calibration certificate number (RC/insurance-style renewal identity)
ALTER TABLE calibration_records ADD COLUMN IF NOT EXISTS certificate_number VARCHAR(50);

-- 3. Backfill last service date from most recent COMPLETED work order
UPDATE equipment e
SET last_service_date = (
    SELECT MAX(w.completion_date)
    FROM maintenance_work_orders w
    WHERE w.equipment_id = e.id
      AND w.status = 'COMPLETED'
      AND w.completion_date IS NOT NULL
);

-- 4. Backfill next service due date from last service (or purchase date as baseline)
UPDATE equipment e
SET next_service_due_date = COALESCE(e.last_service_date, e.purchase_date, e.created_at::date)
                             + make_interval(months => e.service_interval_months)
WHERE e.next_service_due_date IS NULL
  AND (e.last_service_date IS NOT NULL OR e.purchase_date IS NOT NULL OR e.created_at IS NOT NULL);

-- 5. Indexes for due-date scans in reminder schedulers
CREATE INDEX IF NOT EXISTS idx_equipment_next_service_due ON equipment(next_service_due_date);
CREATE INDEX IF NOT EXISTS idx_equipment_calibration_due ON equipment(calibration_due_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_calibration_certificate_number ON calibration_records(certificate_number);
