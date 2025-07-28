-- Urban Greening Fee Records Table
-- This SQL creates the fee_records table in the urban_greening schema
-- Based on the FeeRecord model in urban_greening_models.py

-- Create the urban_greening schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS urban_greening;

-- Create the fee_records table
CREATE TABLE IF NOT EXISTS urban_greening.fee_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- cutting_permit, pruning_permit, violation_fine
    amount NUMERIC(10, 2) NOT NULL,
    payer_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- paid, pending, overdue, cancelled
    or_number VARCHAR(50),
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_urban_greening_fee_date ON urban_greening.fee_records(date);
CREATE INDEX IF NOT EXISTS idx_urban_greening_fee_status ON urban_greening.fee_records(status);
CREATE INDEX IF NOT EXISTS idx_urban_greening_fee_type ON urban_greening.fee_records(type);
CREATE INDEX IF NOT EXISTS idx_urban_greening_fee_reference_number ON urban_greening.fee_records(reference_number);
CREATE INDEX IF NOT EXISTS idx_urban_greening_fee_payer ON urban_greening.fee_records(payer_name);
CREATE INDEX IF NOT EXISTS idx_urban_greening_fee_due_date ON urban_greening.fee_records(due_date);

-- Add comments to the table and columns
COMMENT ON TABLE urban_greening.fee_records IS 'Fee records for urban greening activities including permits and violations';
COMMENT ON COLUMN urban_greening.fee_records.reference_number IS 'Unique reference number for the fee record';
COMMENT ON COLUMN urban_greening.fee_records.type IS 'Type of fee: cutting_permit, pruning_permit, violation_fine';
COMMENT ON COLUMN urban_greening.fee_records.amount IS 'Fee amount in currency units';
COMMENT ON COLUMN urban_greening.fee_records.payer_name IS 'Name of the person or entity paying the fee';
COMMENT ON COLUMN urban_greening.fee_records.date IS 'Date when the fee was issued';
COMMENT ON COLUMN urban_greening.fee_records.due_date IS 'Date when the fee payment is due';
COMMENT ON COLUMN urban_greening.fee_records.status IS 'Payment status: paid, pending, overdue, cancelled';
COMMENT ON COLUMN urban_greening.fee_records.or_number IS 'Official Receipt number (when paid)';
COMMENT ON COLUMN urban_greening.fee_records.payment_date IS 'Date when the fee was actually paid';

-- Create trigger for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fee_records_updated_at
    BEFORE UPDATE ON urban_greening.fee_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional - remove if not needed)
INSERT INTO urban_greening.fee_records (
    reference_number, type, amount, payer_name, date, due_date, status
) VALUES 
    ('UG-CP-2024-001', 'cutting_permit', 5000.00, 'John Doe Construction', '2024-07-01', '2024-07-31', 'paid'),
    ('UG-PP-2024-002', 'pruning_permit', 2500.00, 'City Gardens Inc.', '2024-07-15', '2024-08-15', 'pending'),
    ('UG-VF-2024-003', 'violation_fine', 10000.00, 'ABC Development Corp.', '2024-07-20', '2024-08-20', 'overdue'),
    ('UG-CP-2024-004', 'cutting_permit', 7500.00, 'Green Landscaping', '2024-07-25', '2024-08-25', 'pending')
ON CONFLICT (reference_number) DO NOTHING;
