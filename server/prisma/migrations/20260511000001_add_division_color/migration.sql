-- Add division color column
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS color TEXT;
