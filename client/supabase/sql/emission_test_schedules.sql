create table public.emission_test_schedules (
  id uuid not null default gen_random_uuid (),
  year integer not null,
  quarter integer not null,
  assigned_personnel text not null,
  location text not null,
  conducted_on date not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint emission_test_schedules_pkey primary key (id),
  constraint emission_test_schedules_year_quarter_key unique (year, quarter),
  constraint emission_test_schedules_quarter_check check (
    (
      (quarter >= 1)
      and (quarter <= 4)
    )
  )
) TABLESPACE pg_default;

create index IF not exists emission_test_schedules_year_quarter_idx on public.emission_test_schedules using btree (year, quarter) TABLESPACE pg_default;