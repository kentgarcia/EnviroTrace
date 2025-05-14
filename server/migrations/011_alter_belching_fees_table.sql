-- Migration: Alter belching_fees table
ALTER TABLE belching_fees
  DROP COLUMN IF EXISTS description,
  ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS effective_date DATE NOT NULL DEFAULT CURRENT_DATE; 