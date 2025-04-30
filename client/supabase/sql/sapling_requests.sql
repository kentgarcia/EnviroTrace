create table public.sapling_requests (
  id uuid not null default gen_random_uuid (),
  request_date date not null,
  requester_name text not null,
  requester_address text not null,
  sapling_name text not null,
  quantity integer not null,
  status public.planting_status not null default 'pending'::planting_status,
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint sapling_requests_pkey primary key (id),
  constraint sapling_requests_quantity_check check ((quantity > 0))
) TABLESPACE pg_default;

create trigger update_sapling_requests_updated_at BEFORE
update on sapling_requests for EACH row
execute FUNCTION update_modified_column ();