-- =============================================================
-- Lab Resource Utilization Platform
-- 04. REFERENCE DATA
--
-- Roles only. These are reference data, not sample content: RBAC
-- cannot resolve authorities without them, and registration would
-- otherwise invent role rows ad hoc on first use.
--
-- No institutions, departments, labs, equipment or bookings are
-- seeded here. All operational data is entered through the
-- application so every row is traceable to whoever created it.
--
-- The bootstrap institution / department / admin are created by
-- DatabaseInitializer.java on first start (the admin password has to
-- be BCrypt-hashed, which plain SQL cannot do). Name them with the
-- app.bootstrap.* properties before the first run.
-- =============================================================

INSERT INTO role (role_name, description, is_system_role, created_at, updated_at) VALUES
    ('SYSTEM_ADMIN',      'System Administrator',      TRUE,  NOW(), NOW()),
    ('INSTITUTION_ADMIN', 'Institution Administrator', TRUE,  NOW(), NOW()),
    ('DEPARTMENT_HEAD',   'Department Head',           FALSE, NOW(), NOW()),
    ('LAB_MANAGER',       'Lab Manager',               FALSE, NOW(), NOW()),
    ('LAB_TECHNICIAN',    'Lab Technician',            FALSE, NOW(), NOW()),
    ('RESEARCHER',        'Researcher',                FALSE, NOW(), NOW()),
    ('STUDENT',           'Student Role',              FALSE, NOW(), NOW())
ON CONFLICT (role_name) DO NOTHING;
