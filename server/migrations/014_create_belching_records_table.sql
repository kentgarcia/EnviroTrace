CREATE TABLE IF NOT EXISTS belching_records (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(32) NOT NULL,
    vehicle_type VARCHAR(64) NOT NULL,
    operator VARCHAR(128) NOT NULL,
    operator_address VARCHAR(256),
    record_address VARCHAR(256),
    record_status VARCHAR(32) NOT NULL,
    license_valid_until DATE,
    offense_level INTEGER NOT NULL DEFAULT 1,
    last_date_apprehended DATE,
    order_of_payment VARCHAR(64),
    violation_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 