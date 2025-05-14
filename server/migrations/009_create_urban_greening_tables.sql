-- Create seedling requests table
CREATE TABLE IF NOT EXISTS seedling_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_received DATE NOT NULL,
  requester_name TEXT NOT NULL,
  address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create urban greening table
CREATE TABLE IF NOT EXISTS urban_greening (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  establishment_name TEXT NOT NULL,
  planted_by TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total INTEGER NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add tree_management role to user_roles if not already existing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND 
     'tree_management' = ANY(enum_range(NULL::user_role)::text[])) THEN
    
    -- Add the new role to the enum
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tree_management';
    
  END IF;
END$$;