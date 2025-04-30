-- Create enum for vehicle status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_status') THEN
        CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'retired', 'sold');
    END IF;
END $$;

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(50) NOT NULL UNIQUE,
    driver_name VARCHAR(255),
    office_name VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL,
    engine_type VARCHAR(50) NOT NULL,
    wheels INTEGER NOT NULL,
    year_model INTEGER,
    contact_number VARCHAR(50),
    status vehicle_status DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Emission Test Records
CREATE TABLE IF NOT EXISTS emission_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    test_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    testing_center VARCHAR(255) NOT NULL,
    result VARCHAR(50) NOT NULL,
    hc_level DECIMAL(10, 2),
    co_level DECIMAL(10, 2),
    co2_level DECIMAL(10, 2),
    o2_level DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Office Compliance Records
CREATE TABLE IF NOT EXISTS office_compliance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    office_name VARCHAR(255) NOT NULL,
    quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    year INTEGER NOT NULL,
    total_vehicles INTEGER NOT NULL DEFAULT 0,
    compliant_vehicles INTEGER NOT NULL DEFAULT 0,
    compliance_rate DECIMAL(5, 2) GENERATED ALWAYS AS (CASE WHEN total_vehicles > 0 THEN (compliant_vehicles * 100.0 / total_vehicles) ELSE 0 END) STORED,
    report_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT office_quarter_year_unique UNIQUE (office_name, quarter, year)
);

-- Emission Test Schedule
CREATE TABLE IF NOT EXISTS emission_test_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    scheduled_date DATE NOT NULL,
    conducted_on DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    priority VARCHAR(50) DEFAULT 'normal',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_office ON vehicles(office_name);
CREATE INDEX IF NOT EXISTS idx_emission_tests_vehicle ON emission_tests(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_emission_tests_dates ON emission_tests(test_date, expiry_date);
CREATE INDEX IF NOT EXISTS idx_office_compliance_year_quarter ON office_compliance(year, quarter);
CREATE INDEX IF NOT EXISTS idx_emission_schedules_vehicle ON emission_test_schedules(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_emission_schedules_date ON emission_test_schedules(scheduled_date);