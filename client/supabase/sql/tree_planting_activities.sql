create table public.tree_planting_activities (
  id uuid not null default gen_random_uuid (),
  planting_date date not null,
  establishment_name text not null,
  planted_by text not null,
  tree_name text not null,
  tree_type public.tree_type not null,
  quantity integer not null,
  status public.planting_status not null default 'pending'::planting_status,
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint tree_planting_activities_pkey primary key (id),
  constraint tree_planting_activities_quantity_check check ((quantity > 0))
) TABLESPACE pg_default;

create trigger update_tree_planting_activities_updated_at BEFORE
update on tree_planting_activities for EACH row
execute FUNCTION update_modified_column ();