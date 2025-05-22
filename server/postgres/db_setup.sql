-- Main DB setup file
--
-- This is the main file that sources all the schema files
-- Execute this file to recreate the entire database structure
--

-- First, apply the basic setup (schemas and default settings)
\i 'schemas/00_setup.sql'

-- Then, create the tables for each schema in the correct order
-- Auth schema contains user tables needed by other schemas
\i 'schemas/01_auth_schema.sql'

-- Belching schema
\i 'schemas/02_belching_schema.sql'

-- Emission schema (depends on auth for some foreign keys)
\i 'schemas/03_emission_schema.sql'

-- Completed DB setup
SELECT 'Database setup completed successfully.' as status;
