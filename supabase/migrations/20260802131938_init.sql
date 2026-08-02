-- Omni Odyssey — initial schema: profiles, reading_orders, reading_order_entries.
-- See docs/architecture.md for the repository/RLS design this implements.

-- ============================================================================
-- profiles (1:1 with auth.users)
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null,
  bio text not null default '',
  avatar_url text not null default '',
  location text,
  favorite_publishers text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.profiles
  add constraint username_format check (username ~ '^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$');

alter table public.profiles enable row level security;

create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid () = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid () = id)
  with check (auth.uid () = id);

-- No delete policy: default-deny. Account deletion is out of scope this phase.

-- ============================================================================
-- reading_orders
-- ============================================================================

create table public.reading_orders (
  id uuid primary key default gen_random_uuid (),
  slug text not null unique,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  summary text not null,
  description text not null default '',
  cover_image_url text not null default '',
  publishers text[] not null default '{}',
  categories text[] not null default '{}',
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  save_count integer not null default 0,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reading_orders_creator_id_idx on public.reading_orders (creator_id);

create index reading_orders_visibility_idx on public.reading_orders (visibility);

create function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reading_orders_set_updated_at
  before update on public.reading_orders
  for each row
  execute function public.set_updated_at ();

alter table public.reading_orders enable row level security;

create policy "reading_orders_select_visible"
  on public.reading_orders for select
  using (
    visibility = 'public'
    or creator_id = auth.uid ()
  );

create policy "reading_orders_insert_own"
  on public.reading_orders for insert
  with check (creator_id = auth.uid ());

create policy "reading_orders_update_own"
  on public.reading_orders for update
  using (creator_id = auth.uid ())
  with check (creator_id = auth.uid ());

create policy "reading_orders_delete_own"
  on public.reading_orders for delete
  using (creator_id = auth.uid ());

-- ============================================================================
-- reading_order_entries
-- Ownership is via the parent reading_orders.creator_id — entries have no
-- owner column of their own.
-- ============================================================================

create table public.reading_order_entries (
  id uuid primary key default gen_random_uuid (),
  reading_order_id uuid not null references public.reading_orders (id) on delete cascade,
  "position" integer not null,
  entry_type text not null check (
    entry_type in (
      'collected-edition',
      'individual-issue',
      'story-arc',
      'reading-note',
      'optional-material'
    )
  ),
  title text not null,
  subtitle text,
  issue_range text,
  cover_image_url text,
  notes text,
  is_optional boolean not null default false
);

create index reading_order_entries_reading_order_id_idx on public.reading_order_entries (reading_order_id);

alter table public.reading_order_entries enable row level security;

-- SELECT mirrors the parent's public-or-owner visibility.
create policy "entries_select_visible"
  on public.reading_order_entries for select
  using (
    exists (
      select 1
      from public.reading_orders ro
      where
        ro.id = reading_order_entries.reading_order_id
        and (
          ro.visibility = 'public'
          or ro.creator_id = auth.uid ()
        )
    )
  );

-- INSERT/UPDATE/DELETE are OWNERSHIP-ONLY. Do NOT reuse the select expression
-- above here — doing so would let ANY authenticated user edit or delete
-- entries on someone else's PUBLIC reading order. This is the single
-- highest-risk part of this migration; keep this distinction explicit.
create policy "entries_insert_own"
  on public.reading_order_entries for insert
  with check (
    exists (
      select 1
      from public.reading_orders ro
      where
        ro.id = reading_order_entries.reading_order_id
        and ro.creator_id = auth.uid ()
    )
  );

create policy "entries_update_own"
  on public.reading_order_entries for update
  using (
    exists (
      select 1
      from public.reading_orders ro
      where
        ro.id = reading_order_entries.reading_order_id
        and ro.creator_id = auth.uid ()
    )
  )
  with check (
    exists (
      select 1
      from public.reading_orders ro
      where
        ro.id = reading_order_entries.reading_order_id
        and ro.creator_id = auth.uid ()
    )
  );

create policy "entries_delete_own"
  on public.reading_order_entries for delete
  using (
    exists (
      select 1
      from public.reading_orders ro
      where
        ro.id = reading_order_entries.reading_order_id
        and ro.creator_id = auth.uid ()
    )
  );
