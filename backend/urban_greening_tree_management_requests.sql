-- Create tree_management_requests table in urban_greening schema
-- This script should be run manually in the database

-- Ensure the urban_greening schema exists
CREATE SCHEMA IF NOT EXISTS urban_greening;

-- Create the tree_management_requests table
CREATE TABLE IF NOT EXISTS urban_greening.tree_management_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('pruning', 'cutting', 'violation_complaint')),
    requester_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50),
    email VARCHAR(255),
    property_address TEXT NOT NULL,
    tree_species VARCHAR(100) NOT NULL,
    tree_count INTEGER NOT NULL DEFAULT 1,
    tree_location TEXT NOT NULL,
    reason_for_request TEXT NOT NULL,
    urgency_level VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'emergency')),
    status VARCHAR(50) NOT NULL DEFAULT 'filed' CHECK (status IN ('filed', 'under_review', 'approved', 'rejected', 'in_progress', 'completed', 'payment_pending', 'for_signature', 'on_hold')),
    request_date DATE NOT NULL,
    scheduled_date DATE,
    completion_date DATE,
    assigned_inspector VARCHAR(255),
    inspection_notes TEXT,
    fee_amount NUMERIC(10, 2),
    fee_status VARCHAR(50) CHECK (fee_status IN ('pending', 'paid', 'waived')),
    permit_number VARCHAR(50),
    attachment_files TEXT, -- JSON array of file paths
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_urban_greening_tree_request_number ON urban_greening.tree_management_requests(request_number);
CREATE INDEX IF NOT EXISTS idx_urban_greening_tree_request_type ON urban_greening.tree_management_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_urban_greening_tree_request_status ON urban_greening.tree_management_requests(status);
CREATE INDEX IF NOT EXISTS idx_urban_greening_tree_request_date ON urban_greening.tree_management_requests(request_date);

-- Insert sample data based on Overview.tsx mock data
INSERT INTO urban_greening.tree_management_requests (
    request_number, request_type, requester_name, contact_number, email,
    property_address, tree_species, tree_count, tree_location, reason_for_request,
    urgency_level, status, request_date, scheduled_date, assigned_inspector,
    fee_amount, fee_status
) VALUES 
-- Pruning requests (45 from overview data)
('TM-PR-2025-001', 'pruning', 'Maria Santos', '09171234567', 'maria.santos@email.com', 
 '123 Rizal St., Quezon City', 'Narra', 2, 'Front yard', 'Overgrown branches affecting power lines', 
 'high', 'filed', '2025-01-15', NULL, NULL, 2500.00, 'pending'),

('TM-PR-2025-002', 'pruning', 'Juan Cruz', '09181234567', 'juan.cruz@email.com', 
 '456 Mabini Ave., Manila', 'Acacia', 1, 'Backyard', 'Tree blocking sunlight to neighboring property', 
 'normal', 'under_review', '2025-01-20', '2025-02-05', 'Inspector Rodriguez', 1800.00, 'pending'),

('TM-PR-2025-003', 'pruning', 'Lisa Garcia', '09191234567', NULL, 
 '789 Del Pilar St., Makati', 'Mahogany', 3, 'Side garden', 'Dead branches pose safety risk', 
 'high', 'approved', '2025-01-25', '2025-02-10', 'Inspector Santos', 4200.00, 'paid'),

('TM-PR-2025-004', 'pruning', 'Robert Tan', '09201234567', 'rtan@email.com', 
 '321 Bonifacio Ave., Pasig', 'Mango', 1, 'Frontyard', 'Regular maintenance pruning', 
 'low', 'in_progress', '2025-02-01', '2025-02-15', 'Inspector Villanueva', 1500.00, 'paid'),

('TM-PR-2025-005', 'pruning', 'Ana Reyes', '09211234567', 'ana.reyes@gmail.com', 
 '654 Katipunan Ave., Quezon City', 'Others', 2, 'Garden area', 'Maintaining tree health and shape', 
 'normal', 'completed', '2025-02-05', '2025-02-20', 'Inspector Cruz', 3000.00, 'paid'),

-- Tree cutting requests (30 from overview data)
('TM-CT-2025-001', 'cutting', 'Carlos Mendoza', '09221234567', 'cmendoza@email.com', 
 '987 Taft Ave., Manila', 'Narra', 1, 'Backyard', 'Tree causing foundation damage', 
 'emergency', 'approved', '2025-01-10', '2025-01-25', 'Inspector Lopez', 8500.00, 'paid'),

('TM-CT-2025-002', 'cutting', 'Patricia Wong', '09231234567', NULL, 
 '147 Ortigas Ave., Pasig', 'Acacia', 2, 'Front garden', 'Trees blocking driveway access', 
 'high', 'payment_pending', '2025-01-18', '2025-02-08', 'Inspector Fernandez', 12000.00, 'pending'),

('TM-CT-2025-003', 'cutting', 'Miguel Rodriguez', '09241234567', 'miguel.r@email.com', 
 '258 Shaw Blvd., Mandaluyong', 'Mahogany', 1, 'Side yard', 'Diseased tree needs removal', 
 'high', 'for_signature', '2025-01-22', '2025-02-12', 'Inspector Aquino', 6500.00, 'paid'),

('TM-CT-2025-004', 'cutting', 'Grace Lim', '09251234567', 'grace.lim@yahoo.com', 
 '369 EDSA, Quezon City', 'Mango', 3, 'Property perimeter', 'Development project clearance', 
 'normal', 'on_hold', '2025-01-28', NULL, NULL, 15000.00, 'pending'),

-- Violation/Complaint requests (12 from overview data)
('TM-VC-2025-001', 'violation_complaint', 'Department of Environment', '09261234567', 'denr@gov.ph', 
 '741 Commonwealth Ave., Quezon City', 'Narra', 5, 'Commercial lot', 'Illegal tree cutting reported', 
 'emergency', 'under_review', '2025-01-12', NULL, 'Inspector Garcia', 25000.00, 'pending'),

('TM-VC-2025-002', 'violation_complaint', 'Neighborhood Association', '09271234567', 'community@email.com', 
 '852 Magsaysay Ave., Manila', 'Acacia', 2, 'Roadside', 'Unauthorized tree removal', 
 'high', 'filed', '2025-01-30', NULL, NULL, 18000.00, 'pending'),

('TM-VC-2025-003', 'violation_complaint', 'City Planning Office', '09281234567', 'planning@city.gov', 
 '963 Roxas Blvd., Manila', 'Others', 1, 'Public space', 'Tree cutting without permit', 
 'high', 'approved', '2025-02-03', '2025-02-18', 'Inspector Morales', 12000.00, 'waived');

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tree_management_requests_updated_at 
    BEFORE UPDATE ON urban_greening.tree_management_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
