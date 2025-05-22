-- Emission schema tables and related objects
--
-- PostgreSQL database dump partial - Emission Schema
--

--
-- Table: vehicles
--
CREATE TABLE emission.vehicles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    driver_name character varying(255) NOT NULL,
    contact_number character varying(50),
    engine_type character varying(100) NOT NULL,
    office_name character varying(255) NOT NULL,
    plate_number character varying(50) NOT NULL,
    vehicle_type character varying(100) NOT NULL,
    wheels integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE emission.vehicles OWNER TO postgres;

--
-- Table: vehicle_driver_history
--
CREATE TABLE emission.vehicle_driver_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    vehicle_id uuid NOT NULL,
    driver_name character varying(255) NOT NULL,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    changed_by uuid
);

ALTER TABLE emission.vehicle_driver_history OWNER TO postgres;

--
-- Table: test_schedules
--
CREATE TABLE emission.test_schedules (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    assigned_personnel character varying(255) NOT NULL,
    conducted_on timestamp with time zone NOT NULL,
    location character varying(255) NOT NULL,
    quarter integer NOT NULL,
    year integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE emission.test_schedules OWNER TO postgres;

--
-- Table: tests
--
CREATE TABLE emission.tests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    vehicle_id uuid NOT NULL,
    test_date timestamp with time zone NOT NULL,
    quarter integer NOT NULL,
    year integer NOT NULL,
    result boolean NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE emission.tests OWNER TO postgres;

--
-- Constraints for emission schema tables
--
ALTER TABLE ONLY emission.test_schedules
    ADD CONSTRAINT test_schedules_pkey PRIMARY KEY (id);

ALTER TABLE ONLY emission.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);

ALTER TABLE ONLY emission.vehicle_driver_history
    ADD CONSTRAINT vehicle_driver_history_pkey PRIMARY KEY (id);

ALTER TABLE ONLY emission.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY emission.vehicles
    ADD CONSTRAINT vehicles_plate_number_key UNIQUE (plate_number);

--
-- Indexes for emission schema tables
--
CREATE INDEX idx_test_schedule_year_quarter ON emission.test_schedules USING btree (year, quarter);
CREATE INDEX idx_test_vehicle_id ON emission.tests USING btree (vehicle_id);
CREATE INDEX idx_test_year_quarter ON emission.tests USING btree (year, quarter);
CREATE INDEX idx_vehicle_driver_history_vehicle_id ON emission.vehicle_driver_history USING btree (vehicle_id);

--
-- Foreign key constraints for emission schema tables
--
ALTER TABLE ONLY emission.tests
    ADD CONSTRAINT tests_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE ONLY emission.tests
    ADD CONSTRAINT tests_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES emission.vehicles(id) ON DELETE CASCADE;

ALTER TABLE ONLY emission.vehicle_driver_history
    ADD CONSTRAINT vehicle_driver_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id);

ALTER TABLE ONLY emission.vehicle_driver_history
    ADD CONSTRAINT vehicle_driver_history_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES emission.vehicles(id) ON DELETE CASCADE;
