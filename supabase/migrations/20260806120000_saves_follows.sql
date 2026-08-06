-- Saves and follows — real persistence for the SaveButton/FollowButton
-- interactions that were previously client-local useState toggles.
-- See docs/architecture.md for the repository/RLS design this implements.

-- ============================================================================
-- saved_reading_orders
-- ============================================================================

create table public.saved_reading_orders (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  reading_order_id uuid not null references public.reading_orders (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, reading_order_id)
);

create index saved_reading_orders_user_id_idx on public.saved_reading_orders (user_id);

create index saved_reading_orders_reading_order_id_idx on public.saved_reading_orders (reading_order_id);

alter table public.saved_reading_orders enable row level security;

create policy "saved_reading_orders_select_all"
  on public.saved_reading_orders for select
  using (true);

create policy "saved_reading_orders_insert_own"
  on public.saved_reading_orders for insert
  with check (user_id = auth.uid ());

create policy "saved_reading_orders_delete_own"
  on public.saved_reading_orders for delete
  using (user_id = auth.uid ());

-- reading_orders.save_count is a stored counter (not computed at read time,
-- unlike estimated_book_count) because it's already read directly by every
-- listing query. A user saving someone else's reading order has no UPDATE
-- grant on that row via reading_orders_update_own (creator-only), so this
-- trigger runs as security definer specifically to perform that one
-- increment/decrement — nothing else is exempted from RLS.
create function public.adjust_reading_order_save_count ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.reading_orders set save_count = save_count + 1 where id = new.reading_order_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.reading_orders set save_count = greatest(save_count - 1, 0) where id = old.reading_order_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger saved_reading_orders_adjust_count
  after insert or delete on public.saved_reading_orders
  for each row
  execute function public.adjust_reading_order_save_count ();

-- ============================================================================
-- follows
-- ============================================================================

create table public.follows (
  id uuid primary key default gen_random_uuid (),
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create index follows_follower_id_idx on public.follows (follower_id);

create index follows_following_id_idx on public.follows (following_id);

alter table public.follows enable row level security;

create policy "follows_select_all"
  on public.follows for select
  using (true);

create policy "follows_insert_own"
  on public.follows for insert
  with check (follower_id = auth.uid ());

create policy "follows_delete_own"
  on public.follows for delete
  using (follower_id = auth.uid ());
