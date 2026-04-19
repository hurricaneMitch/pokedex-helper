-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Collection table: one row per user per pokemon
create table public.user_collection (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  pokemon_id  integer not null check (pokemon_id > 0),
  has_regular boolean not null default false,
  has_shiny   boolean not null default false,
  has_xxl     boolean not null default false,
  has_xxl_shiny boolean not null default false,
  updated_at  timestamptz not null default now(),
  unique(user_id, pokemon_id)
);

-- Only the owning user can read/write their rows
alter table public.user_collection enable row level security;

create policy "Users can view own collection"
  on public.user_collection for select
  using (auth.uid() = user_id);

create policy "Users can insert own collection"
  on public.user_collection for insert
  with check (auth.uid() = user_id);

create policy "Users can update own collection"
  on public.user_collection for update
  using (auth.uid() = user_id);

create policy "Users can delete own collection"
  on public.user_collection for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_collection_updated_at
  before update on public.user_collection
  for each row execute procedure public.set_updated_at();
