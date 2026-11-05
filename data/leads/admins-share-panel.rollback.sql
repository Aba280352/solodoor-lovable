-- Rollback of admins-share-panel.sql: back to owner-only writes (barido101@gmail.com), exactly as before.

update public.admin_users set role = 'editor' where email = 'soloodoor@gmail.com';

alter policy "owner write" on public.addons using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "owner write" on public.applications using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "owner write" on public.benefits using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "owner write" on public.faq_items using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "owner write" on public.info_tabs using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "owner write" on public.product_applications using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "owner write" on public.product_images using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "owner write" on public.product_variants using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "owner write" on public.products using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "owner write" on public.rug_sizes using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');

alter policy "owner delete" on public.articles using ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "owner insert" on public.articles with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "owner read all" on public.articles using ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "owner update" on public.articles using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');

alter policy "owner read" on public.shopify_sync using ((auth.jwt() ->> 'email') = 'barido101@gmail.com');

alter policy "articles owner delete" on storage.objects using (bucket_id = 'articles' and (auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "articles owner update" on storage.objects using (bucket_id = 'articles' and (auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "articles owner write" on storage.objects with check (bucket_id = 'articles' and (auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "catalog owner delete" on storage.objects using (bucket_id = 'catalog' and (auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "catalog owner update" on storage.objects using (bucket_id = 'catalog' and (auth.jwt() ->> 'email') = 'barido101@gmail.com');
alter policy "catalog owner write" on storage.objects with check (bucket_id = 'catalog' and (auth.jwt() ->> 'email') = 'barido101@gmail.com');
