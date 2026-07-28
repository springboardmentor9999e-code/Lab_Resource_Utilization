ALTER TABLE maintenance_work_orders ADD COLUMN IF NOT EXISTS labor_hours NUMERIC(8,2);
ALTER TABLE maintenance_work_orders ADD COLUMN IF NOT EXISTS parts_used TEXT;
