-- Seeds the 6 fixed roles with their permission sets.
-- Runs on every startup (spring.sql.init.mode=always); ON CONFLICT keeps it idempotent.

INSERT INTO roles (role_id, role_name, description, permissions) VALUES
(1, 'Researcher / Student', 'Books and uses equipment for research/study',
    '["view_equipment","create_booking","view_own_bookings","join_waitlist"]'::jsonb),
(2, 'Lab Technician', 'Maintains equipment and handles work orders',
    '["view_equipment","update_equipment_status","manage_maintenance_requests","log_calibration"]'::jsonb),
(3, 'Lab Manager', 'Manages department equipment and approves bookings',
    '["approve_bookings","manage_equipment","view_department_utilization","manage_waitlist","manage_maintenance","view_equipment"]'::jsonb),
(4, 'Department Head', 'Oversees department resources and budget',
    '["approve_bookings","view_department_reports","manage_department_budget","approve_sharing_requests","approve_lab_manager","approve_lab_technician","manage_labs","view_equipment"]'::jsonb),
(5, 'Institution Administrator', 'Manages institution-wide users and sharing',
    '["manage_users","view_institution_reports","manage_sharing_agreements","manage_institution_equipment","manage_departments","approve_department_head","view_equipment"]'::jsonb),
(6, 'System Administrator', 'Full system access and configuration',
    '["manage_roles","manage_system_settings","view_audit_logs","manage_all_institutions","view_equipment"]'::jsonb)
ON CONFLICT (role_id) DO UPDATE SET role_name = EXCLUDED.role_name, description = EXCLUDED.description, permissions = EXCLUDED.permissions;

-- Update password_hash for existing test users to match 'SecurePass123'
UPDATE users SET password_hash = '$2a$10$W4WUKweqGbLPehe3AfecDe1iNRL4SZWvsN8WMT8eT5HALYHDBtmgq'
WHERE email IN ('aarav.sharma@iitbhu.ac.in', 'priya.verma@iitbhu.ac.in', 'rohan.gupta@bhu.ac.in', 'neha.singh@sgpgi.ac.in');

-- Promote Priya Verma to Lab Manager for Biotech Department (Dept 1)
UPDATE users SET role_id = 3 WHERE email = 'priya.verma@iitbhu.ac.in';

-- Migrate existing user roles to many-to-many user_roles table
INSERT INTO user_roles (user_id, role_id)
SELECT user_id, role_id FROM users
WHERE role_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Populate/seed equipment amount, imageUrl, and cost for existing equipment
UPDATE equipment SET amount = FLOOR(RANDOM() * 2 + 4)::integer WHERE amount IS NULL OR amount = 0;
UPDATE equipment SET cost = (1500.00 + FLOOR(RANDOM() * 3500))::numeric WHERE cost IS NULL;
UPDATE equipment SET image_url = 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=500' WHERE image_url IS NULL;
UPDATE equipment SET manual = 'https://www.manualslib.com/search.html?q=' || REPLACE(name, ' ', '+') WHERE manual IS NULL;

-- Seed existing equipment with lab_id from their department
UPDATE equipment SET lab_id = (
    SELECT lab_id FROM labs WHERE department_id = equipment.department_id LIMIT 1
) WHERE lab_id IS NULL;

-- Assign Lab Managers to specific labs for visibility filtering tests
UPDATE users SET lab_id = 1 WHERE email = 'priya.verma@iitbhu.ac.in';
UPDATE users SET lab_id = 3 WHERE email = 'rohan.gupta@bhu.ac.in';




