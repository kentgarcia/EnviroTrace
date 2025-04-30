create table public.user_roles (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  role public.user_role not null,
  created_at timestamp with time zone not null default now(),
  constraint user_roles_pkey primary key (id),
  constraint user_roles_user_id_role_key unique (user_id, role),
  constraint user_roles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;