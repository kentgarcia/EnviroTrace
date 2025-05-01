-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create emission_test_schedules table
CREATE TABLE IF NOT EXISTS emission_test_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assigned_personnel VARCHAR(255) NOT NULL,
  conducted_on TIMESTAMPTZ NOT NULL,
  location VARCHAR(255) NOT NULL,
  quarter INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create vehicles table (since emission_tests references vehicles)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_name VARCHAR(255) NOT NULL,
  contact_number VARCHAR(50),
  engine_type VARCHAR(100) NOT NULL,
  office_name VARCHAR(255) NOT NULL,
  plate_number VARCHAR(50) NOT NULL UNIQUE,
  vehicle_type VARCHAR(100) NOT NULL,
  wheels INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create emission_tests table
CREATE TABLE IF NOT EXISTS emission_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  test_date TIMESTAMPTZ NOT NULL,
  quarter INTEGER NOT NULL,
  year INTEGER NOT NULL,
  result BOOLEAN NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emission_test_vehicle_id ON emission_tests(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_emission_test_year_quarter ON emission_tests(year, quarter);
CREATE INDEX IF NOT EXISTS idx_emission_test_schedule_year_quarter ON emission_test_schedules(year, quarter);

-- Create a view to match the Supabase vehicle_summary_view
CREATE OR REPLACE VIEW vehicle_summary_view AS
SELECT 
  v.id,
  v.driver_name,
  v.contact_number,
  v.engine_type,
  v.office_name,
  v.plate_number,
  v.vehicle_type,
  v.wheels,
  latest_tests.test_date AS latest_test_date,
  latest_tests.quarter AS latest_test_quarter,
  latest_tests.year AS latest_test_year,
  latest_tests.result AS latest_test_result
FROM 
  vehicles v
LEFT JOIN LATERAL (
  SELECT 
    et.test_date,
    et.quarter,
    et.year,
    et.result
  FROM 
    emission_tests et
  WHERE 
    et.vehicle_id = v.id
  ORDER BY 
    et.year DESC, 
    et.quarter DESC,
    et.test_date DESC
  LIMIT 1
) latest_tests ON true;