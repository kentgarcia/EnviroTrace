-- Migration: Create vehicle_driver_history table
CREATE TABLE IF NOT EXISTS vehicle_driver_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_name VARCHAR(255) NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changed_by UUID REFERENCES users(id)
);
-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_vehicle_driver_history_vehicle_id ON vehicle_driver_history(vehicle_id);