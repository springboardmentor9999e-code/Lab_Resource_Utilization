-- V3__add_maintenance_work_order.sql
-- Add a maintenance work order for the 3D Printer that has UNDER_MAINTENANCE status

INSERT INTO maintenance_work_orders (equipment_id, maintenance_type, priority, assigned_to, created_by, status, description, scheduled_date)
VALUES (5, 'CORRECTIVE', 'HIGH', 3, 2, 'IN_PROGRESS', '3D Printer nozzle replacement and calibration', CURRENT_DATE);
