-- Supabase Storage bucket for cover images and avatars, replacing the
-- plain pasted-URL fields. One shared public bucket, since the access
-- rules (public read, owner-folder-scoped write) are identical for both
-- use cases — objects are namespaced by uploader id via the folder path
-- (`{auth.uid()}/...`), enforced entirely by RLS on storage.objects.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "images_select_public"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "images_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and (storage.foldername (name)) [1] = auth.uid ()::text
  );

create policy "images_update_own"
  on storage.objects for update
  using (
    bucket_id = 'images'
    and (storage.foldername (name)) [1] = auth.uid ()::text
  );

create policy "images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'images'
    and (storage.foldername (name)) [1] = auth.uid ()::text
  );
