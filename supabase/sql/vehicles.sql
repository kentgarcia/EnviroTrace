create table public.vehicles (
  id uuid not null default gen_random_uuid (),
  plate_number text not null,
  office_name text not null,
  wheels integer not null,
  engine_type text not null,
  driver_name text not null,
  vehicle_type text not null,
  contact_number text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint vehicles_pkey primary key (id),
  constraint vehicles_plate_number_key unique (plate_number),
  constraint vehicles_engine_type_check check (
    (
      engine_type = any (array['Gas'::text, 'Diesel'::text])
    )
  ),
  constraint vehicles_wheels_check check ((wheels = any (array[2, 4])))
) TABLESPACE pg_default;