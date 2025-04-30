-- Create enum for tree types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tree_type') THEN
        CREATE TYPE tree_type AS ENUM ('tree', 'ornamental', 'fruit', 'shade', 'decorative', 'other');
    END IF;
END $$;

-- Create enum for activity status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_status') THEN
        CREATE TYPE activity_status AS ENUM ('pending', 'approved', 'in_progress', 'planted', 'rejected');
    END IF;
END $$;

-- Tree Planting Activities
CREATE TABLE IF NOT EXISTS tree_planting_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planting_date DATE NOT NULL,
    establishment_name VARCHAR(255) NOT NULL,
    planted_by VARCHAR(255),
    tree_name VARCHAR(255) NOT NULL,
    tree_type tree_type NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    location VARCHAR(255),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    status activity_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Sapling Requests
CREATE TABLE IF NOT EXISTS sapling_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_date DATE NOT NULL,
    requester_name VARCHAR(255) NOT NULL,
    requester_address TEXT NOT NULL,
    sapling_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    status activity_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Tree Cutting/Pruning Requests
CREATE TABLE IF NOT EXISTS tree_cutting_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_no VARCHAR(20) NOT NULL UNIQUE,
    request_date DATE NOT NULL,
    requester_name VARCHAR(255) NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    inspector VARCHAR(255),
    inspection_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    fees DECIMAL(10, 2),
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tree_planting_activities_date ON tree_planting_activities(planting_date);
CREATE INDEX IF NOT EXISTS idx_tree_planting_coords ON tree_planting_activities(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sapling_requests_date ON sapling_requests(request_date);
CREATE INDEX IF NOT EXISTS idx_tree_cutting_requests_no ON tree_cutting_requests(request_no) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tree_cutting_requests_date ON tree_cutting_requests(request_date);