-- Rukn/Supabase schema. Paste into Supabase SQL Editor and run as project owner.
-- Authenticated users get student profiles via trigger. Promote the initial admin using the SQL below.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  gmail text not null,
  role text not null default 'student' check (role in ('super_admin','admin','student')),
  enrollment_status text not null default 'none' check (enrollment_status in ('none','pending','approved')),
  access_code text unique,
  avatar_url text,
  banner_url text,
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists profiles_gmail_lower_unique on public.profiles (lower(gmail));

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  type text not null check (type in ('summary','exam')),
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
insert into public.site_settings(key,value) values
 ('social','{"tiktok":"","instagram":"","facebook":"","whatsapp":""}'::jsonb),
 ('site','{"hero_title":"Understand the law, build your future.","hero_text":"A focused learning space for first-year law students.","footer":"© Study Corner. Independent educational platform."}'::jsonb)
on conflict(key) do nothing;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public,auth
as $$ select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('super_admin','admin') and not p.is_banned) $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public,auth
as $$
begin
 insert into public.profiles(id,full_name,phone,gmail)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.raw_user_meta_data->>'phone',''),lower(new.email))
 on conflict(id) do nothing;
 return new;
end $$;
drop trigger if exists on_auth_user_created_rukn on auth.users;
create trigger on_auth_user_created_rukn after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path=public
as $$ begin new.updated_at=now(); return new; end $$;
drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles for each row execute procedure public.touch_updated_at();
drop trigger if exists settings_touch_updated_at on public.site_settings;
create trigger settings_touch_updated_at before update on public.site_settings for each row execute procedure public.touch_updated_at();

create or replace function public.request_enrollment()
returns void language plpgsql security definer set search_path=public,auth
as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 update public.profiles set enrollment_status='pending' where id=auth.uid() and not is_banned and enrollment_status <> 'approved';
 if not found then raise exception 'Enrollment request unavailable'; end if;
end $$;

create or replace function public.admin_manage_profile(target_user_id uuid, action text, action_value text default null)
returns void language plpgsql security definer set search_path=public,auth
as $$
declare actor_role text;
begin
 select role into actor_role from public.profiles where id=auth.uid() and not is_banned;
 if actor_role not in ('super_admin','admin') then raise exception 'Administrator permission required'; end if;
 if target_user_id=auth.uid() then raise exception 'Cannot manage your own account'; end if;
 if action='approve' then
   update public.profiles set enrollment_status='approved',access_code=coalesce(access_code,'RUKN-'||upper(substr(encode(gen_random_bytes(5),'hex'),1,8))) where id=target_user_id;
 elsif action='role' then
   if actor_role<>'super_admin' then raise exception 'Only super admin can change roles'; end if;
   if action_value not in ('admin','student') then raise exception 'Invalid role'; end if;
   update public.profiles set role=action_value where id=target_user_id and role<>'super_admin';
 elsif action='ban' then
   update public.profiles set is_banned=(action_value='true') where id=target_user_id and role<>'super_admin';
 elsif action='delete' then
   if actor_role<>'super_admin' then raise exception 'Only super admin can delete accounts'; end if;
   delete from auth.users where id=target_user_id and id in (select id from public.profiles where role<>'super_admin');
 else raise exception 'Invalid action'; end if;
end $$;

alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.announcements enable row level security;
alter table public.site_settings enable row level security;

-- Do not allow client-side role/enrollment/access-code writes. Sensitive changes are RPC-only.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update(full_name,phone,avatar_url,banner_url) on public.profiles to authenticated;
create policy "profile self or admin read" on public.profiles for select to authenticated using (id=auth.uid() or public.is_admin());
create policy "profile self editable fields" on public.profiles for update to authenticated using (id=auth.uid() and not is_banned) with check (id=auth.uid() and not is_banned);

revoke all on public.materials from anon, authenticated;
grant select,insert,delete on public.materials to authenticated;
create policy "approved students and admins read materials" on public.materials for select to authenticated using (public.is_admin() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.enrollment_status='approved' and not p.is_banned));
create policy "admins add materials" on public.materials for insert to authenticated with check (public.is_admin() and (created_by is null or created_by=auth.uid()));
create policy "admins delete materials" on public.materials for delete to authenticated using (public.is_admin());

revoke all on public.announcements from anon, authenticated;
grant select,insert on public.announcements to authenticated;
create policy "signed in read announcements" on public.announcements for select to authenticated using (true);
create policy "admins publish announcements" on public.announcements for insert to authenticated with check (public.is_admin() and (created_by is null or created_by=auth.uid()));

revoke all on public.site_settings from anon, authenticated;
grant select,insert,update on public.site_settings to anon,authenticated;
create policy "anyone read settings" on public.site_settings for select to anon,authenticated using (true);
create policy "admins insert settings" on public.site_settings for insert to authenticated with check (public.is_admin() and (updated_by is null or updated_by=auth.uid()));
create policy "admins update settings" on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin() and (updated_by is null or updated_by=auth.uid()));

grant execute on function public.request_enrollment() to authenticated;
grant execute on function public.admin_manage_profile(uuid,text,text) to authenticated;
grant execute on function public.is_admin() to anon,authenticated;

-- Enable realtime for live announcement and settings/material changes.
do $$ begin
  alter publication supabase_realtime add table public.announcements;
exception when duplicate_object then null; when others then
  if sqlstate <> '42710' then raise; end if;
end $$;
do $$ begin alter publication supabase_realtime add table public.site_settings;
exception when duplicate_object then null; when others then if sqlstate <> '42710' then raise; end if; end $$;
do $$ begin alter publication supabase_realtime add table public.materials;
exception when duplicate_object then null; when others then if sqlstate <> '42710' then raise; end if; end $$;

-- Profile media bucket. Public read enables avatar/banner display; uploads are restricted to own UID folder.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('profile-media','profile-media',true,5242880,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];
create policy "profile images public read" on storage.objects for select to anon,authenticated using(bucket_id='profile-media');
create policy "users upload own profile images" on storage.objects for insert to authenticated with check(bucket_id='profile-media' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "users update own profile images" on storage.objects for update to authenticated using(bucket_id='profile-media' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='profile-media' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "users delete own profile images" on storage.objects for delete to authenticated using(bucket_id='profile-media' and (storage.foldername(name))[1]=auth.uid()::text);

-- Bootstrap initial super admin safely:
-- 1) Sign up through the website using the email you want to administer.
-- 2) Find the auth user UUID in Authentication > Users, then run this as project owner:
-- update public.profiles set role='super_admin', enrollment_status='approved', access_code='RUKN-ROOT' where id='PASTE-USER-UUID-HERE';
-- Never expose the Supabase service_role key in this static frontend.
