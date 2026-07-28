DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'hourly_rate') THEN
        ALTER TABLE equipment ADD COLUMN hourly_rate NUMERIC(10,2);
    END IF;
END $$;

UPDATE equipment SET hourly_rate = 500.00   WHERE equipment_code = 'CNC-001' AND hourly_rate IS NULL;
UPDATE equipment SET hourly_rate = 350.00   WHERE equipment_code = 'CNC-002' AND hourly_rate IS NULL;
UPDATE equipment SET hourly_rate = 150.00   WHERE equipment_code = 'OSC-001' AND hourly_rate IS NULL;
UPDATE equipment SET hourly_rate = 2000.00  WHERE equipment_code = 'GPU-001' AND hourly_rate IS NULL;
UPDATE equipment SET hourly_rate = 250.00   WHERE equipment_code = '3DP-001' AND hourly_rate IS NULL;
UPDATE equipment SET hourly_rate = 1500.00  WHERE equipment_code = 'MIC-001' AND hourly_rate IS NULL;
