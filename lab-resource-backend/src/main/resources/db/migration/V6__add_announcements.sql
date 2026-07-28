-- V6__add_announcements.sql
-- Add announcements table

CREATE TABLE announcements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    announcement_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    target_audience VARCHAR(50) NOT NULL DEFAULT 'ALL',
    institution_id BIGINT REFERENCES institutions(id),
    department_id BIGINT REFERENCES departments(id),
    created_by BIGINT NOT NULL REFERENCES users(id),
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_type ON announcements(announcement_type);
CREATE INDEX idx_announcements_priority ON announcements(priority);
CREATE INDEX idx_announcements_published ON announcements(published);
CREATE INDEX idx_announcements_created_by ON announcements(created_by);
