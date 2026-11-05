-- Site content edited in the admin ("תוכן האתר"): published values, drafts and publish history.
-- Additive only: three new tables and four functions; nothing existing is changed.
-- Rollback: drop function public.publish_site_content(text, integer); drop function public.save_site_content_draft(text, jsonb, integer);
--           drop function public.reset_site_content(text); drop function public.restore_site_content(bigint);
--           drop table public.site_content_history; drop table public.site_content_drafts; drop table public.site_content;

-- What visitors see: one row per key (e.g. 'business', 'seo:/ציפוי-דלתות', 'settings'). Public read.
create table if not exists public.site_content (
  key text primary key check (char_length(key) between 1 and 200),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);
alter table public.site_content enable row level security;
drop policy if exists "public read" on public.site_content;
create policy "public read" on public.site_content for select using (true);

-- Unpublished edits, one per key. Admins only.
create table if not exists public.site_content_drafts (
  key text primary key check (char_length(key) between 1 and 200),
  data jsonb not null,
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by text
);
alter table public.site_content_drafts enable row level security;
drop policy if exists "admins read drafts" on public.site_content_drafts;
create policy "admins read drafts" on public.site_content_drafts for select to authenticated using (public.admin_role() is not null);
drop policy if exists "admins delete drafts" on public.site_content_drafts;
create policy "admins delete drafts" on public.site_content_drafts for delete to authenticated using (public.admin_role() is not null);

-- Every publish (data null = reset to the code default). Admins read only.
create table if not exists public.site_content_history (
  id bigint generated always as identity primary key,
  key text not null,
  data jsonb,
  published_at timestamptz not null default now(),
  published_by text
);
create index if not exists site_content_history_key_idx on public.site_content_history (key, published_at desc);
alter table public.site_content_history enable row level security;
drop policy if exists "admins read history" on public.site_content_history;
create policy "admins read history" on public.site_content_history for select to authenticated using (public.admin_role() is not null);

-- Saves a draft. p_revision is the revision the editor loaded (0 when there was no draft);
-- a different current revision means someone saved in another window.
create or replace function public.save_site_content_draft(p_key text, p_data jsonb, p_revision integer)
  returns integer language plpgsql security definer set search_path = public
as $$
declare
  cur integer;
  who text := lower(auth.jwt() ->> 'email');
begin
  if public.admin_role() is null then raise exception 'אין הרשאה לשמור.'; end if;
  if char_length(p_key) not between 1 and 200 then raise exception 'מפתח לא תקין.'; end if;
  if octet_length(p_data::text) > 500000 then raise exception 'התוכן גדול מדי.'; end if;
  select revision into cur from public.site_content_drafts where key = p_key for update;
  if not found then
    insert into public.site_content_drafts (key, data, revision, updated_by) values (p_key, p_data, 1, who);
    return 1;
  end if;
  if cur <> p_revision then raise exception 'התוכן השתנה בחלון אחר. רעננו את הדף כדי לראות את הגרסה העדכנית.'; end if;
  update public.site_content_drafts set data = p_data, revision = cur + 1, updated_at = now(), updated_by = who where key = p_key;
  return cur + 1;
end $$;

-- Publishes the draft of a key: it becomes what visitors see, is kept in the history, and the draft is cleared.
create or replace function public.publish_site_content(p_key text, p_revision integer)
  returns void language plpgsql security definer set search_path = public
as $$
declare
  d public.site_content_drafts%rowtype;
  who text := lower(auth.jwt() ->> 'email');
begin
  if public.admin_role() is null then raise exception 'אין הרשאה לפרסם.'; end if;
  select * into d from public.site_content_drafts where key = p_key for update;
  if not found then raise exception 'אין טיוטה לפרסום.'; end if;
  if d.revision <> p_revision then raise exception 'התוכן השתנה בחלון אחר. רעננו את הדף כדי לראות את הגרסה העדכנית.'; end if;
  insert into public.site_content (key, data, updated_at, updated_by) values (p_key, d.data, now(), who)
    on conflict (key) do update set data = excluded.data, updated_at = now(), updated_by = who;
  insert into public.site_content_history (key, data, published_by) values (p_key, d.data, who);
  delete from public.site_content_drafts where key = p_key;
end $$;

-- Back to the code default for a key: removes the published value and any draft; recorded in the history.
create or replace function public.reset_site_content(p_key text)
  returns void language plpgsql security definer set search_path = public
as $$
declare who text := lower(auth.jwt() ->> 'email');
begin
  if public.admin_role() is null then raise exception 'אין הרשאה.'; end if;
  delete from public.site_content where key = p_key;
  delete from public.site_content_drafts where key = p_key;
  insert into public.site_content_history (key, data, published_by) values (p_key, null, who);
end $$;

-- Puts an old published version back as the draft (to be checked and published again).
create or replace function public.restore_site_content(p_history_id bigint)
  returns void language plpgsql security definer set search_path = public
as $$
declare
  h public.site_content_history%rowtype;
  who text := lower(auth.jwt() ->> 'email');
begin
  if public.admin_role() is null then raise exception 'אין הרשאה.'; end if;
  select * into h from public.site_content_history where id = p_history_id;
  if not found then raise exception 'הגרסה לא נמצאה.'; end if;
  if h.data is null then raise exception 'זו גרסת ברירת המחדל; השתמשו ב"איפוס לברירת מחדל".'; end if;
  insert into public.site_content_drafts (key, data, revision, updated_by) values (h.key, h.data, 1, who)
    on conflict (key) do update set data = excluded.data, revision = public.site_content_drafts.revision + 1, updated_at = now(), updated_by = who;
end $$;

revoke all on function public.save_site_content_draft(text, jsonb, integer) from public;
revoke all on function public.publish_site_content(text, integer) from public;
revoke all on function public.reset_site_content(text) from public;
revoke all on function public.restore_site_content(bigint) from public;
grant execute on function public.save_site_content_draft(text, jsonb, integer) to authenticated;
grant execute on function public.publish_site_content(text, integer) to authenticated;
grant execute on function public.reset_site_content(text) to authenticated;
grant execute on function public.restore_site_content(bigint) to authenticated;
