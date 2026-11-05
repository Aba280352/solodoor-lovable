-- Every admin (anyone listed in public.admin_users) gets the same full admin panel.
-- Until now the write policies allowed only barido101@gmail.com; they now allow any admin_users row,
-- through public.admin_role(). Only the conditions change (ALTER POLICY): no policy is added or dropped.
-- Rollback: data/leads/admins-share-panel.rollback.sql

update public.admin_users set role = 'owner' where email = 'soloodoor@gmail.com';

alter policy "owner write" on public.addons using (public.admin_role() is not null) with check (public.admin_role() is not null);
alter policy "owner write" on public.applications using (public.admin_role() is not null) with check (public.admin_role() is not null);
alter policy "owner write" on public.benefits using (public.admin_role() is not null) with check (public.admin_role() is not null);
alter policy "owner write" on public.faq_items using (public.admin_role() is not null) with check (public.admin_role() is not null);
alter policy "owner write" on public.info_tabs using (public.admin_role() is not null) with check (public.admin_role() is not null);
alter policy "owner write" on public.product_applications using (public.admin_role() is not null) with check (public.admin_role() is not null);
alter policy "owner write" on public.product_images using (public.admin_role() is not null) with check (public.admin_role() is not null);
alter policy "owner write" on public.product_variants using (public.admin_role() is not null) with check (public.admin_role() is not null);
alter policy "owner write" on public.products using (public.admin_role() is not null) with check (public.admin_role() is not null);
alter policy "owner write" on public.rug_sizes using (public.admin_role() is not null) with check (public.admin_role() is not null);

alter policy "owner delete" on public.articles using (public.admin_role() is not null);
alter policy "owner insert" on public.articles with check (public.admin_role() is not null);
alter policy "owner read all" on public.articles using (public.admin_role() is not null);
alter policy "owner update" on public.articles using (public.admin_role() is not null) with check (public.admin_role() is not null);

alter policy "owner read" on public.shopify_sync using (public.admin_role() is not null);

alter policy "articles owner delete" on storage.objects using (bucket_id = 'articles' and public.admin_role() is not null);
alter policy "articles owner update" on storage.objects using (bucket_id = 'articles' and public.admin_role() is not null);
alter policy "articles owner write" on storage.objects with check (bucket_id = 'articles' and public.admin_role() is not null);
alter policy "catalog owner delete" on storage.objects using (bucket_id = 'catalog' and public.admin_role() is not null);
alter policy "catalog owner update" on storage.objects using (bucket_id = 'catalog' and public.admin_role() is not null);
alter policy "catalog owner write" on storage.objects with check (bucket_id = 'catalog' and public.admin_role() is not null);
