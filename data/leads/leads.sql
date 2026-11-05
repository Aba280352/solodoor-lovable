-- Leads (the site's contact forms) and the people allowed into the admin.
-- Additive only: two new tables and one function; nothing existing is changed.
-- Rollback: drop table public.leads; drop function public.admin_role(); drop table public.admin_users;

-- Who may use the admin, and in which role. "owner" sees everything; "editor" (the client) sees the leads.
create table if not exists public.admin_users (
  email text primary key check (email = lower(email)),
  role text not null check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
drop policy if exists "admins read own row" on public.admin_users;
create policy "admins read own row" on public.admin_users
  for select to authenticated using (email = lower(auth.jwt() ->> 'email'));

insert into public.admin_users (email, role) values
  ('barido101@gmail.com', 'owner'),
  ('soloodoor@gmail.com', 'editor')
on conflict (email) do nothing;

-- The signed-in user's admin role, or null for anyone else.
create or replace function public.admin_role() returns text
  language sql stable security definer set search_path = public
as $$
  select role from public.admin_users where email = lower(auth.jwt() ->> 'email')
$$;
revoke all on function public.admin_role() from public;
grant execute on function public.admin_role() to authenticated;

-- One row per form sent from the site. Written only by the edge function submit-lead (service role):
-- there is no insert policy, so the public cannot write here directly.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null check (source in ('door_quote', 'quiz', 'article', 'footer')),
  name text,
  phone text,
  email text,
  city text,
  message text,
  details jsonb not null default '{}'::jsonb,
  page_url text,
  ip_hash text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'done', 'trash')),
  notes text,
  email_sent boolean not null default false,
  updated_at timestamptz not null default now()
);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_ip_hash_idx on public.leads (ip_hash, created_at desc);
alter table public.leads enable row level security;

drop policy if exists "admins read leads" on public.leads;
create policy "admins read leads" on public.leads
  for select to authenticated using (public.admin_role() is not null);

drop policy if exists "admins update leads" on public.leads;
create policy "admins update leads" on public.leads
  for update to authenticated
  using (public.admin_role() is not null)
  with check (public.admin_role() is not null);
