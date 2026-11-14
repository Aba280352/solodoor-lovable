-- The SEO brief the client fills at a private link (/brief/<token>), saved by the server route /api/public/seo-brief.
-- Additive only: one new table. Rollback: drop table public.seo_briefs;
-- The token itself is never stored, only its SHA-256. Admins can read the brief; nobody can write it through the API
-- (no insert/update policies): the server route writes with the service role, and the owner edits it in the database.
create table if not exists public.seo_briefs (
  id text primary key,
  token_hash text not null,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.seo_briefs enable row level security;

drop policy if exists "admins read seo briefs" on public.seo_briefs;
create policy "admins read seo briefs" on public.seo_briefs
  for select to authenticated using (public.admin_role() is not null);

insert into public.seo_briefs (id, token_hash) values ('solodoor', '70fa4a66877a609b9973c99ea6b59364f0f8df3470c57d3c014cb270b52dee54')
on conflict (id) do nothing;
