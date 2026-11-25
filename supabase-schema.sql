-- Rukn / Supabase schema
-- Run once in Supabase SQL Editor as the project owner.
-- Never expose the service_role key in browser code.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  gmail text not null,
  role text not null default 'student'
    check (role in ('super_admin', 'admin', 'student')),
  enrollment_status text not null default 'none'
    check (enrollment_status in ('none', 'pending', 'approved')),
  access_code text unique,
  avatar_url text,
  banner_url text,
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists profiles_gmail_lower_unique
  on public.profiles (lower(gmail));

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  type text not null check (type in ('summary', 'exam')),
  pdf_url text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value) values
  ('social', '{"tiktok":"","instagram":"","facebook":"","whatsapp":""}'::jsonb),
  ('site', '{"hero_title":"Understand the law, build your future.","hero_text":"A focused learning space for first-year law students.","footer":"© Study Corner. Independent educational platform."}'::jsonb)
on conflict (key) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as p
    where p.id = (select auth.uid())
      and p.role in ('super_admin', 'admin')
      and not p.is_banned
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, gmail)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    lower(coalesce(new.email, ''))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_rukn on auth.users;
create trigger on_auth_user_created_rukn
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch_updated_at on public.site_settings;
create trigger settings_touch_updated_at
before update on public.site_settings
for each row execute function public.touch_updated_at();

create or replace function public.request_enrollment()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  update public.profiles
  set enrollment_status = 'pending'
  where id = current_user_id
    and not is_banned
    and enrollment_status <> 'approved';
  if not found then
    raise exception 'Enrollment request unavailable';
  end if;
end;
$$;

create or replace function public.admin_manage_profile(
  target_user_id uuid,
  action text,
  action_value text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role text;
begin
  select p.role into actor_role
  from public.profiles as p
  where p.id = auth.uid() and not p.is_banned;

  if actor_role is null or actor_role not in ('super_admin', 'admin') then
    raise exception 'Administrator permission required';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'Cannot manage your own account';
  end if;

  if action = 'approve' then
    update public.profiles
    set enrollment_status = 'approved',
        access_code = coalesce(access_code, 'RUKN-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 8)))
    where id = target_user_id and not is_banned;
  elsif action = 'role' then
    if actor_role <> 'super_admin' then
      raise exception 'Only super admin can change roles';
    end if;
    if action_value not in ('admin', 'student') then
      raise exception 'Invalid role';
    end if;
    update public.profiles set role = action_value
    where id = target_user_id and role <> 'super_admin';
  elsif action = 'ban' then
    update public.profiles set is_banned = (action_value = 'true')
    where id = target_user_id and role <> 'super_admin';
  elsif action = 'delete' then
    if actor_role <> 'super_admin' then
      raise exception 'Only super admin can delete accounts';
    end if;
    delete from auth.users
    where id = target_user_id
      and exists (select 1 from public.profiles where id = target_user_id and role <> 'super_admin');
  else
    raise exception 'Invalid action';
  end if;
end;
$$;

alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.announcements enable row level security;
alter table public.site_settings enable row level security;

-- Profiles: users can read their own profile; admins can read all. Sensitive columns
-- (role, enrollment_status, access_code, is_banned) cannot be edited from the client.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, avatar_url, banner_url) on public.profiles to authenticated;
drop policy if exists "profile self or admin read" on public.profiles;
create policy "profile self or admin read"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "profile self editable fields" on public.profiles;
create policy "profile self editable fields"
on public.profiles for update to authenticated
using (id = (select auth.uid()) and not is_banned)
with check (id = (select auth.uid()) and not is_banned);

-- Materials are only readable to approved students, admins, and super admins.
revoke all on public.materials from anon, authenticated;
grant select, insert, delete on public.materials to authenticated;
drop policy if exists "approved students and admins read materials" on public.materials;
create policy "approved students and admins read materials"
on public.materials for select to authenticated
using (
  (select public.is_admin())
  or exists (
    select 1 from public.profiles as p
    where p.id = (select auth.uid())
      and p.enrollment_status = 'approved'
      and not p.is_banned
  )
);
drop policy if exists "admins add materials" on public.materials;
create policy "admins add materials"
on public.materials for insert to authenticated
with check ((select public.is_admin()) and (created_by is null or created_by = (select auth.uid())));
drop policy if exists "admins delete materials" on public.materials;
create policy "admins delete materials"
on public.materials for delete to authenticated
using ((select public.is_admin()));

-- Visitors can read announcements; only admins can publish them.
revoke all on public.announcements from anon, authenticated;
grant select on public.announcements to anon, authenticated;
grant insert on public.announcements to authenticated;
drop policy if exists "public read announcements" on public.announcements;
create policy "public read announcements"
on public.announcements for select to anon, authenticated using (true);
drop policy if exists "admins publish announcements" on public.announcements;
create policy "admins publish announcements"
on public.announcements for insert to authenticated
with check ((select public.is_admin()) and (created_by is null or created_by = (select auth.uid())));

-- Public can read site settings; authenticated admins can change them.
revoke all on public.site_settings from anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
drop policy if exists "anyone read settings" on public.site_settings;
create policy "anyone read settings"
on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "admins insert settings" on public.site_settings;
create policy "admins insert settings"
on public.site_settings for insert to authenticated
with check ((select public.is_admin()) and (updated_by is null or updated_by = (select auth.uid())));
drop policy if exists "admins update settings" on public.site_settings;
create policy "admins update settings"
on public.site_settings for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()) and (updated_by is null or updated_by = (select auth.uid())));

grant execute on function public.request_enrollment() to authenticated;
grant execute on function public.admin_manage_profile(uuid, text, text) to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Realtime publications (safe to re-run).
do $$
begin
  alter publication supabase_realtime add table public.announcements;
exception when duplicate_object then null;
when others then
  if sqlstate <> '42710' then raise; end if;
end;
$$;
do $$
begin
  alter publication supabase_realtime add table public.site_settings;
exception when duplicate_object then null;
when others then
  if sqlstate <> '42710' then raise; end if;
end;
$$;
do $$
begin
  alter publication supabase_realtime add table public.materials;
exception when duplicate_object then null;
when others then
  if sqlstate <> '42710' then raise; end if;
end;
$$;

-- Public-read profile images; each signed-in user may write only into their own UID folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-media', 'profile-media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];
drop policy if exists "profile images public read" on storage.objects;
create policy "profile images public read"
on storage.objects for select to anon, authenticated using (bucket_id = 'profile-media');
drop policy if exists "users upload own profile images" on storage.objects;
create policy "users upload own profile images"
on storage.objects for insert to authenticated
with check (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "users update own profile images" on storage.objects;
create policy "users update own profile images"
on storage.objects for update to authenticated
using (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "users delete own profile images" on storage.objects;
create policy "users delete own profile images"
on storage.objects for delete to authenticated
using (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Bootstrap the first Super Admin after registering the account and confirming email:
-- update public.profiles
-- set full_name = 'Abo Rajeh', role = 'super_admin', enrollment_status = 'approved',
--     access_code = 'RUKN-ROOT'
-- where lower(gmail) = lower('sherifeltahawy86@gmail.com');
