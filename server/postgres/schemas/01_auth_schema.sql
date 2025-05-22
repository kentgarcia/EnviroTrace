-- Auth schema tables and related objects
--
-- PostgreSQL database dump partial - Auth Schema
--

-- Create the auth.user_role enum type
CREATE TYPE auth.user_role AS ENUM (
    'admin',
    'air_quality',
    'tree_management',
    'government_emission'
);

ALTER TYPE auth.user_role OWNER TO postgres;

--
-- Table: users
--
CREATE TABLE auth.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    encrypted_password character varying(255) NOT NULL,
    is_super_admin boolean DEFAULT false,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);

ALTER TABLE auth.users OWNER TO postgres;

--
-- Table: user_roles
--
CREATE TABLE auth.user_roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    role auth.user_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE auth.user_roles OWNER TO postgres;

--
-- Table: profiles
--
CREATE TABLE auth.profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    bio text,
    job_title character varying(200),
    department character varying(200),
    phone_number character varying(50),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE auth.profiles OWNER TO postgres;

--
-- Constraints for auth schema tables
--
ALTER TABLE ONLY auth.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY auth.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

ALTER TABLE ONLY auth.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY auth.user_roles
    ADD CONSTRAINT user_roles_user_id_role_unique UNIQUE (user_id, role);

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

--
-- Indexes for auth schema tables
--
CREATE INDEX idx_auth_profiles_user_id ON auth.profiles USING btree (user_id);
CREATE INDEX idx_auth_user_roles_user_id ON auth.user_roles USING btree (user_id);
CREATE INDEX idx_auth_users_email ON auth.users USING btree (email) WHERE (deleted_at IS NULL);

--
-- Foreign key constraints for auth schema tables
--
ALTER TABLE ONLY auth.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY auth.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
