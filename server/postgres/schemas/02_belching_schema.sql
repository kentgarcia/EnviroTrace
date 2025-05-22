-- Belching schema tables and related objects
--
-- PostgreSQL database dump partial - Belching Schema
--

--
-- Table: fees
--
CREATE SEQUENCE belching.fees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    
ALTER SEQUENCE belching.fees_id_seq OWNER TO postgres;

CREATE TABLE belching.fees (
    id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    category character varying(100) NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    effective_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE belching.fees OWNER TO postgres;

ALTER TABLE ONLY belching.fees ALTER COLUMN id SET DEFAULT nextval('belching.fees_id_seq'::regclass);
ALTER SEQUENCE belching.fees_id_seq OWNED BY belching.fees.id;

--
-- Table: drivers
--
CREATE TABLE belching.drivers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    first_name character varying(100) NOT NULL,
    middle_name character varying(100),
    last_name character varying(100) NOT NULL,
    address text NOT NULL,
    license_number character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE belching.drivers OWNER TO postgres;

--
-- Table: records
--
CREATE SEQUENCE belching.records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    
ALTER SEQUENCE belching.records_id_seq OWNER TO postgres;

CREATE TABLE belching.records (
    id integer NOT NULL,
    plate_number character varying(32) NOT NULL,
    vehicle_type character varying(64) NOT NULL,
    transport_group character varying(100),
    operator_company_name character varying(200) NOT NULL,
    operator_address text,
    owner_first_name character varying(100),
    owner_middle_name character varying(100),
    owner_last_name character varying(100),
    motor_no character varying(100),
    motor_vehicle_name character varying(200),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE belching.records OWNER TO postgres;

ALTER TABLE ONLY belching.records ALTER COLUMN id SET DEFAULT nextval('belching.records_id_seq'::regclass);
ALTER SEQUENCE belching.records_id_seq OWNED BY belching.records.id;

--
-- Table: violations
--
CREATE SEQUENCE belching.violations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    
ALTER SEQUENCE belching.violations_id_seq OWNER TO postgres;

CREATE TABLE belching.violations (
    id integer NOT NULL,
    record_id integer NOT NULL,
    ordinance_infraction_report_no character varying(100),
    smoke_density_test_result_no character varying(100),
    place_of_apprehension character varying(200) NOT NULL,
    date_of_apprehension date NOT NULL,
    paid_driver boolean DEFAULT false,
    paid_operator boolean DEFAULT false,
    driver_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE belching.violations OWNER TO postgres;

ALTER TABLE ONLY belching.violations ALTER COLUMN id SET DEFAULT nextval('belching.violations_id_seq'::regclass);
ALTER SEQUENCE belching.violations_id_seq OWNED BY belching.violations.id;

--
-- Table: record_history
--
CREATE SEQUENCE belching.record_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    
ALTER SEQUENCE belching.record_history_id_seq OWNER TO postgres;

CREATE TABLE belching.record_history (
    id integer NOT NULL,
    record_id integer NOT NULL,
    type character varying(64) NOT NULL,
    date date NOT NULL,
    details text,
    or_number character varying(64),
    status character varying(32) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE belching.record_history OWNER TO postgres;

ALTER TABLE ONLY belching.record_history ALTER COLUMN id SET DEFAULT nextval('belching.record_history_id_seq'::regclass);
ALTER SEQUENCE belching.record_history_id_seq OWNED BY belching.record_history.id;

--
-- Constraints for belching schema tables
--
ALTER TABLE ONLY belching.drivers
    ADD CONSTRAINT drivers_license_number_key UNIQUE (license_number);

ALTER TABLE ONLY belching.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);

ALTER TABLE ONLY belching.fees
    ADD CONSTRAINT fees_pkey PRIMARY KEY (id);

ALTER TABLE ONLY belching.record_history
    ADD CONSTRAINT record_history_pkey PRIMARY KEY (id);

ALTER TABLE ONLY belching.records
    ADD CONSTRAINT records_pkey PRIMARY KEY (id);

ALTER TABLE ONLY belching.violations
    ADD CONSTRAINT violations_pkey PRIMARY KEY (id);

--
-- Indexes for belching schema tables
--
CREATE INDEX idx_belching_drivers_license ON belching.drivers USING btree (license_number);
CREATE INDEX idx_belching_drivers_name ON belching.drivers USING btree (last_name, first_name);
CREATE INDEX idx_belching_record_history_date ON belching.record_history USING btree (date);
CREATE INDEX idx_belching_record_history_record ON belching.record_history USING btree (record_id);
CREATE INDEX idx_belching_records_operator ON belching.records USING btree (operator_company_name);
CREATE INDEX idx_belching_records_plate ON belching.records USING btree (plate_number);
CREATE INDEX idx_belching_violations_date ON belching.violations USING btree (date_of_apprehension);
CREATE INDEX idx_belching_violations_record ON belching.violations USING btree (record_id);

--
-- Foreign key constraints for belching schema tables
--
ALTER TABLE ONLY belching.record_history
    ADD CONSTRAINT fk_belching_record_history_record FOREIGN KEY (record_id) REFERENCES belching.records(id) ON DELETE CASCADE;

ALTER TABLE ONLY belching.violations
    ADD CONSTRAINT fk_belching_violations_driver FOREIGN KEY (driver_id) REFERENCES belching.drivers(id) ON DELETE SET NULL;

ALTER TABLE ONLY belching.violations
    ADD CONSTRAINT fk_belching_violations_record FOREIGN KEY (record_id) REFERENCES belching.records(id) ON DELETE CASCADE;
