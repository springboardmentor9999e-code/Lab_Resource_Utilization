-- ============================================================================
-- RESET OPERATIONAL DATA  ***DESTRUCTIVE — RUN DELIBERATELY***
--
-- Deliberately kept in database/tools/ rather than database/. Docker Compose
-- mounts database/ as docker-entrypoint-initdb.d and runs every .sql in it
-- automatically on first container start; initdb does not recurse into
-- subdirectories, so this script can never fire by accident.
--
-- Wipes every row of application data so you can build the system up with your
-- own institution, departments, labs, equipment and bookings.
--
-- What survives:
--   role  — reference data. RBAC cannot resolve authorities without it.
--
-- What is deleted: everything else, including all user accounts (the bootstrap
-- admin included) and the demo labs and equipment that older versions of
-- DatabaseInitializer used to seed.
--
-- After running this, restart the backend. DatabaseInitializer recreates exactly
-- three rows — one institution, one department, one admin — because
-- app_user.institution_id and department_id are NOT NULL and only an existing
-- admin can grant roles. Name them first via the app.bootstrap.* properties in
-- application.properties, then log in as that admin and enter your own data.
--
-- Usage:
--   psql -U postgres -d lab_resource_db -f database/tools/reset_operational_data.sql
--
-- This is a development-reset tool. It is NOT part of the migration sequence and
-- must never be run against a database whose contents you intend to keep.
-- ============================================================================

BEGIN;

DO $$
DECLARE
    -- Child-to-parent order is not needed because TRUNCATE ... CASCADE resolves
    -- foreign keys itself; the list is grouped by module purely for readability.
    target_tables TEXT[] := ARRAY[
        -- Auth & organisation
        'user_role', 'refresh_token', 'password_reset_token', 'app_user',
        'department', 'institution',
        -- Inventory
        'equipment_image', 'equipment_document', 'equipment_calibration',
        'equipment_usage', 'equipment', 'lab',
        -- Booking
        'booking_history', 'waitlist', 'recurring_booking', 'booking',
        -- Maintenance
        'maintenance_request', 'maintenance_schedule',
        -- Sharing & billing
        'invoice', 'sharing_request', 'sharing_agreement', 'department_charge',
        -- Notifications
        'notification', 'user_device_token'
    ];
    existing_tables TEXT[] := ARRAY[]::TEXT[];
    t TEXT;
BEGIN
    -- Skip tables that were never created. sharing_agreement, for instance, has no
    -- CREATE TABLE in this directory and exists only where Hibernate's ddl-auto
    -- made it, so a blind TRUNCATE would abort the whole reset.
    FOREACH t IN ARRAY target_tables LOOP
        IF to_regclass(t) IS NOT NULL THEN
            existing_tables := existing_tables || quote_ident(t);
        ELSE
            RAISE NOTICE 'Skipping % — table does not exist', t;
        END IF;
    END LOOP;

    IF array_length(existing_tables, 1) IS NULL THEN
        RAISE NOTICE 'Nothing to reset.';
        RETURN;
    END IF;

    -- RESTART IDENTITY so your first equipment is id 1, which makes the data far
    -- easier to follow while you are learning the schema.
    EXECUTE 'TRUNCATE TABLE ' || array_to_string(existing_tables, ', ')
            || ' RESTART IDENTITY CASCADE';

    RAISE NOTICE 'Reset % tables. Roles preserved. Restart the backend to recreate the bootstrap admin.',
        array_length(existing_tables, 1);
END $$;

COMMIT;
