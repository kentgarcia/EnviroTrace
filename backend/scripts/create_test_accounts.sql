BEGIN;

-- Create user: admin@envirotrace.com
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if user exists
    SELECT id INTO v_user_id FROM app_auth.users WHERE email = 'admin@envirotrace.com';
    
    IF v_user_id IS NULL THEN
        -- Create user
        INSERT INTO app_auth.users (id, email, encrypted_password, is_super_admin, created_at, updated_at)
        VALUES (gen_random_uuid(), 'admin@envirotrace.com', '$2b$12$7rw5BK0ovQ1hzLzUqezIO.hjdGx5hst5ODAz5tu1q6VWw5haIMEZe', true, now(), now())
        RETURNING id INTO v_user_id;
        
        -- Create profile
        INSERT INTO app_auth.profiles (id, user_id, first_name, last_name, job_title, department, created_at, updated_at)
        VALUES (gen_random_uuid(), v_user_id, 'Admin', 'User', 'System Administrator', 'IT', now(), now());
        
        -- Add role: admin
        INSERT INTO app_auth.user_roles (id, user_id, role, created_at)
        VALUES (gen_random_uuid(), v_user_id, 'admin', now());
        
        RAISE NOTICE 'Created user: admin@envirotrace.com';
    ELSE
        RAISE NOTICE 'User already exists: admin@envirotrace.com';
    END IF;
END $$;

-- Create user: airquality@envirotrace.com
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if user exists
    SELECT id INTO v_user_id FROM app_auth.users WHERE email = 'airquality@envirotrace.com';
    
    IF v_user_id IS NULL THEN
        -- Create user
        INSERT INTO app_auth.users (id, email, encrypted_password, is_super_admin, created_at, updated_at)
        VALUES (gen_random_uuid(), 'airquality@envirotrace.com', '$2b$12$7rw5BK0ovQ1hzLzUqezIO.hjdGx5hst5ODAz5tu1q6VWw5haIMEZe', false, now(), now())
        RETURNING id INTO v_user_id;
        
        -- Create profile
        INSERT INTO app_auth.profiles (id, user_id, first_name, last_name, job_title, department, created_at, updated_at)
        VALUES (gen_random_uuid(), v_user_id, 'Air Quality', 'Officer', 'Air Quality Specialist', 'Environmental Management', now(), now());
        
        -- Add role: air_quality
        INSERT INTO app_auth.user_roles (id, user_id, role, created_at)
        VALUES (gen_random_uuid(), v_user_id, 'air_quality', now());
        
        RAISE NOTICE 'Created user: airquality@envirotrace.com';
    ELSE
        RAISE NOTICE 'User already exists: airquality@envirotrace.com';
    END IF;
END $$;

-- Create user: treemanagement@envirotrace.com
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if user exists
    SELECT id INTO v_user_id FROM app_auth.users WHERE email = 'treemanagement@envirotrace.com';
    
    IF v_user_id IS NULL THEN
        -- Create user
        INSERT INTO app_auth.users (id, email, encrypted_password, is_super_admin, created_at, updated_at)
        VALUES (gen_random_uuid(), 'treemanagement@envirotrace.com', '$2b$12$7rw5BK0ovQ1hzLzUqezIO.hjdGx5hst5ODAz5tu1q6VWw5haIMEZe', false, now(), now())
        RETURNING id INTO v_user_id;
        
        -- Create profile
        INSERT INTO app_auth.profiles (id, user_id, first_name, last_name, job_title, department, created_at, updated_at)
        VALUES (gen_random_uuid(), v_user_id, 'Tree Management', 'Officer', 'Urban Greening Coordinator', 'Parks and Recreation', now(), now());
        
        -- Add role: tree_management
        INSERT INTO app_auth.user_roles (id, user_id, role, created_at)
        VALUES (gen_random_uuid(), v_user_id, 'tree_management', now());
        
        RAISE NOTICE 'Created user: treemanagement@envirotrace.com';
    ELSE
        RAISE NOTICE 'User already exists: treemanagement@envirotrace.com';
    END IF;
END $$;

-- Create user: emission@envirotrace.com
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if user exists
    SELECT id INTO v_user_id FROM app_auth.users WHERE email = 'emission@envirotrace.com';
    
    IF v_user_id IS NULL THEN
        -- Create user
        INSERT INTO app_auth.users (id, email, encrypted_password, is_super_admin, created_at, updated_at)
        VALUES (gen_random_uuid(), 'emission@envirotrace.com', '$2b$12$7rw5BK0ovQ1hzLzUqezIO.hjdGx5hst5ODAz5tu1q6VWw5haIMEZe', false, now(), now())
        RETURNING id INTO v_user_id;
        
        -- Create profile
        INSERT INTO app_auth.profiles (id, user_id, first_name, last_name, job_title, department, created_at, updated_at)
        VALUES (gen_random_uuid(), v_user_id, 'Emission', 'Inspector', 'Emission Testing Officer', 'Vehicle Compliance', now(), now());
        
        -- Add role: government_emission
        INSERT INTO app_auth.user_roles (id, user_id, role, created_at)
        VALUES (gen_random_uuid(), v_user_id, 'government_emission', now());
        
        RAISE NOTICE 'Created user: emission@envirotrace.com';
    ELSE
        RAISE NOTICE 'User already exists: emission@envirotrace.com';
    END IF;
END $$;

-- Create user: multirole@envirotrace.com
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if user exists
    SELECT id INTO v_user_id FROM app_auth.users WHERE email = 'multirole@envirotrace.com';
    
    IF v_user_id IS NULL THEN
        -- Create user
        INSERT INTO app_auth.users (id, email, encrypted_password, is_super_admin, created_at, updated_at)
        VALUES (gen_random_uuid(), 'multirole@envirotrace.com', '$2b$12$7rw5BK0ovQ1hzLzUqezIO.hjdGx5hst5ODAz5tu1q6VWw5haIMEZe', false, now(), now())
        RETURNING id INTO v_user_id;
        
        -- Create profile
        INSERT INTO app_auth.profiles (id, user_id, first_name, last_name, job_title, department, created_at, updated_at)
        VALUES (gen_random_uuid(), v_user_id, 'Multi', 'Role', 'Environmental Officer', 'Environmental Services', now(), now());
        
        -- Add role: air_quality
        INSERT INTO app_auth.user_roles (id, user_id, role, created_at)
        VALUES (gen_random_uuid(), v_user_id, 'air_quality', now());
        
        -- Add role: tree_management
        INSERT INTO app_auth.user_roles (id, user_id, role, created_at)
        VALUES (gen_random_uuid(), v_user_id, 'tree_management', now());
        
        RAISE NOTICE 'Created user: multirole@envirotrace.com';
    ELSE
        RAISE NOTICE 'User already exists: multirole@envirotrace.com';
    END IF;
END $$;

COMMIT;

-- Verify created accounts
SELECT 
    u.email,
    u.is_super_admin,
    p.first_name || ' ' || p.last_name as full_name,
    p.job_title,
    array_agg(ur.role) as roles
FROM app_auth.users u
LEFT JOIN app_auth.profiles p ON u.id = p.user_id
LEFT JOIN app_auth.user_roles ur ON u.id = ur.user_id
WHERE u.email LIKE '%@envirotrace.com'
GROUP BY u.email, u.is_super_admin, p.first_name, p.last_name, p.job_title
ORDER BY u.email;