-- Reviews — real persistence for collected-edition reviews, previously
-- fully mock-data-backed. See docs/architecture.md for the design this
-- implements.

create table public.reviews (
  id uuid primary key default gen_random_uuid (),
  author_id uuid not null references public.profiles (id) on delete cascade,
  edition_title text not null,
  publisher text not null default '',
  cover_image_url text not null default '',
  overall_rating integer not null check (overall_rating between 1 and 5),
  review_text text not null,
  binding_rating integer check (binding_rating between 1 and 5),
  paper_quality_rating integer check (paper_quality_rating between 1 and 5),
  mapping_rating integer check (mapping_rating between 1 and 5),
  extras_rating integer check (extras_rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reviews_author_id_idx on public.reviews (author_id);

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row
  execute function public.set_updated_at ();

alter table public.reviews enable row level security;

create policy "reviews_select_all"
  on public.reviews for select
  using (true);

create policy "reviews_insert_own"
  on public.reviews for insert
  with check (author_id = auth.uid ());

create policy "reviews_update_own"
  on public.reviews for update
  using (author_id = auth.uid ())
  with check (author_id = auth.uid ());

create policy "reviews_delete_own"
  on public.reviews for delete
  using (author_id = auth.uid ());
