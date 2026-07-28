-- V5__add_role_config.sql
-- Add role_config table for role descriptions and status

CREATE TABLE role_config (
    id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default role configurations
INSERT INTO role_config (role_name, description, enabled) VALUES
('RESEARCHER', 'Can view and book equipment', true),
('STUDENT', 'Students with equipment access', true),
('LAB_TECHNICIAN', 'Technical staff for equipment maintenance', true),
('LAB_MANAGER', 'Manages laboratory operations', true),
('DEPARTMENT_HEAD', 'Head of department', true),
('INSTITUTION_ADMIN', 'Manages institution-level operations', true),
('SYSTEM_ADMIN', 'Full system access', true);
