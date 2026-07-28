-- V12: Equipment Specs, Tags, Recurring Bookings, Report History, Notification Retry

-- 1. Equipment Specifications (JSONB)
ALTER TABLE equipment ADD COLUMN specifications jsonb;

-- 2. Equipment Tags (many-to-many)
CREATE TABLE equipment_tags (
    id BIGSERIAL PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment_tag_mappings (
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES equipment_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (equipment_id, tag_id)
);

-- Seed sample tags
INSERT INTO equipment_tags (tag_name) VALUES
    ('CNC'), ('5-Axis'), ('Precision'), ('High-Power'), ('Digital'),
    ('Analog'), ('Portable'), ('Desktop'), ('Industrial'), ('Research-Grade'),
    ('Automated'), ('Manual'), ('IoT-Enabled'), ('Networked'), ('Standalone');

-- 3. Recurring Bookings
ALTER TABLE bookings ADD COLUMN recurrence_pattern VARCHAR(20);
ALTER TABLE bookings ADD COLUMN recurrence_end_date DATE;
ALTER TABLE bookings ADD COLUMN recurrence_parent_id BIGINT REFERENCES bookings(id);

-- 4. Report History (persistent)
CREATE TABLE report_history (
    id BIGSERIAL PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    format VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generated_by BIGINT REFERENCES users(id),
    generated_by_name VARCHAR(200)
);

-- 5. Notification Retry Queue
CREATE TABLE notification_retry_queue (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT REFERENCES notifications(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    next_retry_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',
    last_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_retry_queue_pending ON notification_retry_queue(status, next_retry_at) WHERE status = 'PENDING';
CREATE INDEX idx_report_history_user ON report_history(generated_by);
