create table public.emission_tests (
  id uuid not null default gen_random_uuid (),
  vehicle_id uuid not null,
  year integer not null,
  quarter integer not null,
  test_date date not null,
  result boolean not null,
  created_by uuid null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint emission_tests_pkey primary key (id),
  constraint emission_tests_vehicle_id_year_quarter_key unique (vehicle_id, year, quarter),
  constraint emission_tests_created_by_fkey foreign KEY (created_by) references auth.users (id),
  constraint emission_tests_vehicle_id_fkey foreign KEY (vehicle_id) references vehicles (id) on delete CASCADE,
  constraint emission_tests_quarter_check check (
    (
      (quarter >= 1)
      and (quarter <= 4)
    )
  )
) TABLESPACE pg_default;

create index IF not exists emission_tests_year_quarter_idx on public.emission_tests using btree (year, quarter) TABLESPACE pg_default;

create trigger set_emission_test_creator_trigger BEFORE INSERT on emission_tests for EACH row
execute FUNCTION set_emission_test_creator ();