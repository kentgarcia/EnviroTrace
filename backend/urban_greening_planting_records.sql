-- Urban Greening Planting Records and Sapling Collection Tables
-- This script creates the tables and sample data for the planting management system

-- Create urban_greening_plantings table
CREATE TABLE IF NOT EXISTS urban_greening.urban_greening_plantings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_number VARCHAR(50) UNIQUE NOT NULL,
    planting_type VARCHAR(50) NOT NULL, -- ornamental_plants, trees, seeds, seeds_private
    species_name VARCHAR(255) NOT NULL,
    quantity_planted INTEGER NOT NULL,
    planting_date DATE NOT NULL,
    location VARCHAR(500) NOT NULL,
    barangay VARCHAR(100),
    coordinates VARCHAR(100), -- GPS coordinates
    planting_method VARCHAR(100), -- direct_seeding, transplanting, etc.
    status VARCHAR(50) NOT NULL DEFAULT 'planted', -- planted, growing, mature, died, removed
    survival_rate FLOAT, -- percentage
    responsible_person VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50),
    organization VARCHAR(255),
    project_name VARCHAR(255),
    funding_source VARCHAR(255), -- government, private, donation
    maintenance_schedule TEXT,
    notes TEXT,
    photos TEXT, -- JSON array of photo paths
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sapling_collections table
CREATE TABLE IF NOT EXISTS urban_greening.sapling_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_number VARCHAR(50) UNIQUE NOT NULL,
    species_name VARCHAR(255) NOT NULL,
    quantity_collected INTEGER NOT NULL,
    collection_date DATE NOT NULL,
    collection_location VARCHAR(500) NOT NULL,
    collector_name VARCHAR(255) NOT NULL,
    collector_contact VARCHAR(50),
    purpose VARCHAR(100) NOT NULL, -- replacement, reforestation, distribution, nursery
    target_planting_date DATE,
    target_location VARCHAR(500),
    nursery_location VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'collected', -- collected, nursery, ready_for_planting, planted, distributed
    health_condition VARCHAR(50), -- excellent, good, fair, poor
    size_category VARCHAR(50), -- seedling, sapling, juvenile, mature
    survival_rate FLOAT, -- percentage in nursery
    distribution_date DATE,
    recipient_name VARCHAR(255),
    recipient_contact VARCHAR(50),
    recipient_address VARCHAR(500),
    care_instructions TEXT,
    notes TEXT,
    photos TEXT, -- JSON array of photo paths
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for urban_greening_plantings
CREATE INDEX IF NOT EXISTS idx_urban_greening_planting_type ON urban_greening.urban_greening_plantings(planting_type);
CREATE INDEX IF NOT EXISTS idx_urban_greening_planting_status ON urban_greening.urban_greening_plantings(status);
CREATE INDEX IF NOT EXISTS idx_urban_greening_planting_date ON urban_greening.urban_greening_plantings(planting_date);
CREATE INDEX IF NOT EXISTS idx_urban_greening_planting_location ON urban_greening.urban_greening_plantings(location);

-- Create indexes for sapling_collections
CREATE INDEX IF NOT EXISTS idx_urban_greening_sapling_species ON urban_greening.sapling_collections(species_name);
CREATE INDEX IF NOT EXISTS idx_urban_greening_sapling_status ON urban_greening.sapling_collections(status);
CREATE INDEX IF NOT EXISTS idx_urban_greening_sapling_collection_date ON urban_greening.sapling_collections(collection_date);
CREATE INDEX IF NOT EXISTS idx_urban_greening_sapling_purpose ON urban_greening.sapling_collections(purpose);

-- Insert sample data for urban_greening_plantings (matching Overview.tsx data)
INSERT INTO urban_greening.urban_greening_plantings (
    record_number, planting_type, species_name, quantity_planted, planting_date, location, 
    barangay, planting_method, status, survival_rate, responsible_person, contact_number,
    organization, project_name, funding_source, notes
) VALUES 
-- Ornamental Plants (120 total)
('UG-20250101-1001', 'ornamental_plants', 'Bougainvillea', 30, '2025-01-15', 'Plaza Central', 'Poblacion', 'transplanting', 'growing', 95.0, 'Maria Santos', '0917-123-4567', 'City Parks Department', 'Plaza Beautification', 'government', 'Planted along walkways'),
('UG-20250102-1002', 'ornamental_plants', 'Marigold', 25, '2025-01-20', 'Barangay Hall', 'San Jose', 'direct_seeding', 'growing', 88.0, 'Juan Dela Cruz', '0918-234-5678', 'Barangay Council', 'Community Garden', 'government', 'Flower beds around building'),
('UG-20250103-1003', 'ornamental_plants', 'Rose', 20, '2025-02-05', 'School Garden', 'Santa Maria', 'transplanting', 'mature', 92.0, 'Ana Reyes', '0919-345-6789', 'Elementary School', 'School Greening', 'government', 'Rose garden for students'),
('UG-20250104-1004', 'ornamental_plants', 'Hibiscus', 25, '2025-02-10', 'Health Center', 'San Antonio', 'transplanting', 'growing', 90.0, 'Pedro Garcia', '0920-456-7890', 'DOH', 'Health Center Landscaping', 'government', 'Colorful entrance garden'),
('UG-20250105-1005', 'ornamental_plants', 'Santan', 20, '2025-02-20', 'Public Market', 'Centro', 'transplanting', 'growing', 85.0, 'Carmen Lopez', '0921-567-8901', 'Market Vendors Association', 'Market Beautification', 'private', 'Planters around market area'),

-- Trees (85 total)
('UG-20250106-1006', 'trees', 'Narra', 15, '2025-01-25', 'City Park', 'Poblacion', 'transplanting', 'growing', 93.0, 'Roberto Miguel', '0922-678-9012', 'DENR', 'Urban Forest Project', 'government', 'Native tree species for park'),
('UG-20250107-1007', 'trees', 'Mahogany', 20, '2025-02-01', 'School Grounds', 'San Pedro', 'transplanting', 'growing', 90.0, 'Linda Castro', '0923-789-0123', 'DepEd', 'School Tree Planting', 'government', 'Shade trees for playground'),
('UG-20250108-1008', 'trees', 'Acacia', 18, '2025-02-15', 'Highway Strip', 'San Luis', 'transplanting', 'growing', 88.0, 'Carlos Mendoza', '0924-890-1234', 'DPWH', 'Highway Greening', 'government', 'Roadside tree planting'),
('UG-20250109-1009', 'trees', 'Mango', 12, '2025-03-01', 'Community Center', 'Santa Cruz', 'transplanting', 'growing', 91.7, 'Elena Fernandez', '0925-901-2345', 'Barangay LGU', 'Community Greening', 'government', 'Fruit trees for community'),
('UG-20250110-1010', 'trees', 'Fire Tree', 20, '2025-03-10', 'Industrial Area', 'San Miguel', 'transplanting', 'planted', 95.0, 'Antonio Ramos', '0926-012-3456', 'Environmental NGO', 'Industrial Greening', 'donation', 'Air purification trees'),

-- Seeds (60 total)
('UG-20250111-1011', 'seeds', 'Sunflower', 30, '2025-01-30', 'Open Field', 'San Juan', 'direct_seeding', 'growing', 80.0, 'Rosario Aquino', '0927-123-4567', 'Farmers Association', 'Flower Field Project', 'private', 'Educational sunflower field'),
('UG-20250112-1012', 'seeds', 'Cosmos', 30, '2025-02-25', 'Vacant Lot', 'San Rafael', 'direct_seeding', 'growing', 75.0, 'Manuel Torres', '0928-234-5678', 'Youth Organization', 'Youth Greening Initiative', 'donation', 'Colorful flower field'),

-- Seeds Private (25 total)
('UG-20250113-1013', 'seeds_private', 'Gumamela', 15, '2025-03-05', 'Private Subdivision', 'Village Hills', 'direct_seeding', 'growing', 90.0, 'Patricia Valdez', '0929-345-6789', 'Homeowners Association', 'Subdivision Beautification', 'private', 'Private community project'),
('UG-20250114-1014', 'seeds_private', 'Sampaguita', 10, '2025-03-15', 'Corporate Office', 'Business District', 'direct_seeding', 'growing', 85.0, 'Michelle Santos', '0930-456-7890', 'Corporate CSR', 'Office Landscaping', 'private', 'Company environmental initiative');

-- Insert sample data for sapling_collections (matching Overview.tsx replacement data)
INSERT INTO urban_greening.sapling_collections (
    collection_number, species_name, quantity_collected, collection_date, collection_location,
    collector_name, collector_contact, purpose, target_planting_date, nursery_location,
    status, health_condition, size_category, survival_rate, notes
) VALUES 
-- Narra (30 saplings)
('SC-20250101-2001', 'Narra', 15, '2025-01-10', 'DENR Nursery', 'Jose Martinez', '0931-567-8901', 'replacement', '2025-04-01', 'City Nursery', 'nursery', 'excellent', 'sapling', 96.0, 'High-quality native tree saplings'),
('SC-20250102-2002', 'Narra', 15, '2025-01-25', 'Forest Reserve', 'Maria Gonzales', '0932-678-9012', 'reforestation', '2025-05-15', 'City Nursery', 'ready_for_planting', 'good', 'sapling', 93.0, 'Ready for mountain reforestation'),

-- Acacia (22 saplings)
('SC-20250103-2003', 'Acacia', 12, '2025-01-20', 'Roadside Collection', 'Carlos Rivera', '0933-789-0123', 'replacement', '2025-03-20', 'Highway Depot', 'nursery', 'good', 'juvenile', 90.0, 'Fast-growing roadside trees'),
('SC-20250104-2004', 'Acacia', 10, '2025-02-05', 'Private Property', 'Ana Morales', '0934-890-1234', 'distribution', '2025-04-10', 'Barangay Nursery', 'collected', 'fair', 'sapling', 85.0, 'Collected from private land clearing'),

-- Mahogany (15 saplings)
('SC-20250105-2005', 'Mahogany', 8, '2025-02-01', 'School Campus', 'Pedro Villanueva', '0935-901-2345', 'replacement', '2025-05-01', 'School Nursery', 'nursery', 'excellent', 'sapling', 95.0, 'School tree replacement program'),
('SC-20250106-2006', 'Mahogany', 7, '2025-02-15', 'Park Area', 'Carmen Bautista', '0936-012-3456', 'distribution', '2025-06-01', 'City Nursery', 'ready_for_planting', 'good', 'juvenile', 91.0, 'Park maintenance collection'),

-- Mango (10 saplings)
('SC-20250107-2007', 'Mango', 6, '2025-02-20', 'Orchard', 'Roberto Cruz', '0937-123-4567', 'distribution', '2025-04-15', 'Community Nursery', 'nursery', 'excellent', 'sapling', 100.0, 'Fruit tree distribution program'),
('SC-20250108-2008', 'Mango', 4, '2025-03-01', 'Backyard Garden', 'Elena Pascual', '0938-234-5678', 'replacement', '2025-05-20', 'Barangay Nursery', 'distributed', 'good', 'sapling', 88.0, 'Community fruit tree initiative'),

-- Others (8 saplings)
('SC-20250109-2009', 'Ipil-Ipil', 5, '2025-03-05', 'Coastal Area', 'Manuel Aguilar', '0939-345-6789', 'reforestation', '2025-06-10', 'Coastal Nursery', 'nursery', 'good', 'seedling', 92.0, 'Coastal protection trees'),
('SC-20250110-2010', 'Fire Tree', 3, '2025-03-10', 'Industrial Zone', 'Patricia Lim', '0940-456-7890', 'replacement', '2025-04-25', 'City Nursery', 'ready_for_planting', 'fair', 'sapling', 85.0, 'Air quality improvement trees');

-- Update sequences if needed
SELECT setval(pg_get_serial_sequence('urban_greening.urban_greening_plantings', 'id'), (SELECT MAX(id) FROM urban_greening.urban_greening_plantings));
SELECT setval(pg_get_serial_sequence('urban_greening.sapling_collections', 'id'), (SELECT MAX(id) FROM urban_greening.sapling_collections));

COMMIT;
