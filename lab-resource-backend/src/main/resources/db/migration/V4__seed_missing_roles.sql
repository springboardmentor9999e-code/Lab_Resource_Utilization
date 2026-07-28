-- V4__seed_missing_roles.sql
-- Add DEPARTMENT_HEAD and INSTITUTION_ADMIN seed users (password: Password@123)

INSERT INTO users (first_name, last_name, email, phone, password, institution_id, department_id, role, status) VALUES
('Meena', 'Iyer', 'meena@demouniversity.edu', '+91-9876543214', '$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK', 1, 1, 'DEPARTMENT_HEAD', true),
('Suresh', 'Nair', 'suresh@demouniversity.edu', '+91-9876543215', '$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK', 1, NULL, 'INSTITUTION_ADMIN', true)
ON CONFLICT (email) DO NOTHING;
