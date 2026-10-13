-- The product admin (/admin/products): the owner may read and write every catalogue row, hidden ones
-- included, and upload photos to the "catalog" bucket. The site keeps its read-only policies.
-- Run once in Supabase (Lovable Cloud), after schema.sql.

create table if not exists shopify_sync (
  handle     text primary key references products(handle) on delete cascade,
  synced_at  timestamptz not null default now(),
  ok         boolean not null default true,
  message    text
);
alter table shopify_sync enable row level security;
create policy "owner read" on shopify_sync for select to authenticated using ((auth.jwt() ->> 'email') = 'barido101@gmail.com');

create policy "owner write" on products for all to authenticated
  using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
create policy "owner write" on product_applications for all to authenticated
  using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
create policy "owner write" on product_images for all to authenticated
  using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
create policy "owner write" on product_variants for all to authenticated
  using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
create policy "owner write" on rug_sizes for all to authenticated
  using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
create policy "owner write" on applications for all to authenticated
  using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');

insert into storage.buckets (id, name, public) values ('catalog', 'catalog', true) on conflict (id) do nothing;
create policy "catalog public read" on storage.objects for select to public using (bucket_id = 'catalog');
create policy "catalog owner write" on storage.objects for insert to authenticated
  with check (bucket_id = 'catalog' and (auth.jwt() ->> 'email') = 'barido101@gmail.com');
create policy "catalog owner update" on storage.objects for update to authenticated
  using (bucket_id = 'catalog' and (auth.jwt() ->> 'email') = 'barido101@gmail.com');
create policy "catalog owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'catalog' and (auth.jwt() ->> 'email') = 'barido101@gmail.com');
