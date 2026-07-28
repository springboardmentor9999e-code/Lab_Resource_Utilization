-- V2__seed_data.sql
-- Seed data for Lab Resource Utilization Platform

-- =============================================
-- ROLES (handled by enum, but we seed categories)
-- =============================================

-- Equipment Categories
INSERT INTO equipment_categories (category_name, description) VALUES
('Mechanical', 'Mechanical engineering equipment including CNC machines, lathes, milling machines'),
('Electrical', 'Electrical engineering equipment including transformers, motors, generators'),
('Electronics', 'Electronics equipment including oscilloscopes, signal generators, multimeters'),
('Computer Science', 'Computing equipment including GPU servers, workstations, networking gear'),
('Biomedical', 'Biomedical engineering equipment including microscopes, centrifuges'),
('Civil Engineering', 'Civil engineering equipment including concrete testing, soil testing'),
('Chemical Engineering', 'Chemical engineering equipment including spectrometers, chromatographs'),
('Physics', 'Physics lab equipment including lasers, interferometers'),
('Chemistry', 'Chemistry lab equipment including analytical balances, fume hoods'),
('Biology', 'Biology lab equipment including PCR machines, incubators');

-- Demo Institution
INSERT INTO institutions (institution_code, institution_name, email, phone, website, city, state, country, status)
VALUES ('DEMO001', 'Demo University', 'admin@demouniversity.edu', '+91-1234567890', 'https://demouniversity.edu', 'Bangalore', 'Karnataka', 'India', true);

-- Demo Departments
INSERT INTO departments (institution_id, department_name, status) VALUES
(1, 'Mechanical Engineering', true),
(1, 'Computer Science', true),
(1, 'Electronics & Communication', true);

-- Demo Laboratories
INSERT INTO laboratories (department_id, laboratory_name, location, status) VALUES
(1, 'CNC Machining Lab', 'Block A, Room 101', true),
(1, 'Manufacturing Lab', 'Block A, Room 102', true),
(2, 'Programming Lab', 'Block B, Room 201', true),
(2, 'High Performance Computing Lab', 'Block B, Room 202', true),
(3, 'VLSI Design Lab', 'Block C, Room 301', true),
(3, 'Signal Processing Lab', 'Block C, Room 302', true);

-- Demo Users (passwords are BCrypt encoded for 'Password@123')
INSERT INTO users (first_name, last_name, email, phone, password, institution_id, department_id, role, status) VALUES
('Admin', 'System', 'admin@demouniversity.edu', '+91-9999999999', '$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK', 1, NULL, 'SYSTEM_ADMIN', true),
('Priya', 'Sharma', 'priya@demouniversity.edu', '+91-9876543210', '$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK', 1, 1, 'LAB_MANAGER', true),
('Rajesh', 'Kumar', 'rajesh@demouniversity.edu', '+91-9876543211', '$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK', 1, 1, 'LAB_TECHNICIAN', true),
('Arun', 'Kumar', 'arun@demouniversity.edu', '+91-9876543212', '$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK', 1, 1, 'RESEARCHER', true),
('Sneha', 'Patel', 'sneha@demouniversity.edu', '+91-9876543213', '$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK', 1, 2, 'RESEARCHER', true);

-- Update department HODs
UPDATE departments SET hod_user_id = 2 WHERE id = 1;
UPDATE departments SET hod_user_id = 2 WHERE id = 2;
UPDATE departments SET hod_user_id = 2 WHERE id = 3;

-- Demo Equipment
INSERT INTO equipment (equipment_code, equipment_name, category_id, laboratory_id, manufacturer, model_number, serial_number, purchase_date, purchase_cost, warranty_expiry, status, max_booking_hours, description) VALUES
('CNC-001', 'CNC Milling Machine', 1, 1, 'Haas Automation', 'VF-2', 'SN-2024-001', '2023-01-15', 5000000.00, '2026-01-15', 'AVAILABLE', 8, '3-axis CNC milling machine for precision machining'),
('CNC-002', 'CNC Lathe', 1, 1, 'DMG Mori', 'CLX 350', 'SN-2024-002', '2023-03-20', 3500000.00, '2026-03-20', 'AVAILABLE', 8, 'CNC lathe for turning operations'),
('OSC-001', 'Digital Oscilloscope', 3, 6, 'Tektronix', 'MDO3024', 'SN-2024-003', '2023-06-10', 250000.00, '2026-06-10', 'AVAILABLE', 6, '200MHz 4-channel digital oscilloscope'),
('GPU-001', 'GPU Server', 4, 4, 'NVIDIA', 'DGX A100', 'SN-2024-004', '2024-01-05', 15000000.00, '2027-01-05', 'AVAILABLE', 24, 'High-performance GPU server for AI/ML workloads'),
('3DP-001', '3D Printer', 1, 2, 'Stratasys', 'F123', 'SN-2024-005', '2023-09-01', 1200000.00, '2025-09-01', 'UNDER_MAINTENANCE', 8, 'Industrial grade 3D printer for rapid prototyping'),
('MIC-001', 'Electron Microscope', 5, 3, 'JEOL', 'JSM-7600F', 'SN-2024-006', '2022-06-15', 25000000.00, '2025-06-15', 'AVAILABLE', 4, 'Field emission scanning electron microscope');
