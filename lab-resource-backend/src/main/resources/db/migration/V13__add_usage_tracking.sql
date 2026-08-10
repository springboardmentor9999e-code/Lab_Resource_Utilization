-- V13: Invoice line items, actual usage timestamps, usage logs

-- 1. Invoice line items (snapshot at generation time)
ALTER TABLE invoices ADD COLUMN hours_billed NUMERIC(10, 2);
ALTER TABLE invoices ADD COLUMN hourly_rate NUMERIC(12, 2);

-- 2. Booking actual usage timestamps (check-in / check-out)
ALTER TABLE bookings ADD COLUMN actual_start_time TIMESTAMP;
ALTER TABLE bookings ADD COLUMN actual_end_time TIMESTAMP;

-- 3. Usage logs (persisted hours per completed booking)
CREATE TABLE usage_logs (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    institution_id BIGINT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    minutes INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_logs_equipment ON usage_logs(equipment_id);
CREATE INDEX idx_usage_logs_institution ON usage_logs(institution_id);
CREATE INDEX idx_usage_logs_booking ON usage_logs(booking_id);
