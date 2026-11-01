-- The installation prices in the admin (מחירים): `price` of the installation add-on is a door on both
-- sides, these columns are the other two kinds. The owner may write the add-ons, the site keeps reading them.
-- Run once in Supabase (Lovable Cloud), after schema.sql and admin.sql.

alter table addons
  add column if not exists price_one_side numeric(10,2),
  add column if not exists price_designed_double numeric(10,2);

update addons set price_one_side = 440, price_designed_double = 590 where slug = 'installation';

create policy "owner write" on addons for all to authenticated
  using ((auth.jwt() ->> 'email') = 'barido101@gmail.com') with check ((auth.jwt() ->> 'email') = 'barido101@gmail.com');
