# Rukn — Al-Mahkama Study Corner

Arabic/English static frontend with a real Supabase cloud backend for authentication, student profiles, enrollment requests, materials/PDF links, announcements, settings, and profile images.

## 1) Create and configure Supabase
1. Create a Supabase project.
2. In **Project Settings → API**, copy the Project URL and the `anon` / publishable key.
3. Edit `js/supabase-config.js`, replacing `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY`.
4. Open **SQL Editor**, paste all of `supabase-schema.sql`, and run it.
5. Host this folder on HTTPS (Netlify, GitHub Pages, etc.) or run `python -m http.server 8000` locally.
6. In Supabase **Authentication → URL Configuration**, set the site URL and add your deployed URL to Redirect URLs. Enable email/password sign-in and configure SMTP for production email delivery.
7. Place your logo at `assets/logo.png`.

The browser uses the Supabase JS v2 CDN and project `anon` key. The anon key is designed for browser use only when RLS is correctly enabled. **Never place a service_role key in frontend files.**

## 2) Bootstrap the first Super Admin
- Register using the email that should own the site.
- In Supabase **Authentication → Users**, copy that account's UUID.
- In SQL Editor, run (replace the UUID):

```sql
update public.profiles
set role = 'super_admin', enrollment_status = 'approved', access_code = 'RUKN-ROOT'
where id = 'YOUR-AUTH-USER-UUID';
```

There is no hardcoded administrator email/password. Supabase Auth handles passwords and email confirmation. Promotion to/demotion from administrator and account deletion are available only to the initial Super Admin in the site interface; enrollment approval, banning, content management, announcements, and settings are managed through protected database policies/RPCs.

## 3) Features
- `index.html`: bilingual landing page, live announcement popup/chime, cloud homepage text/social links.
- `login.html`: Supabase email/password sign-up, login, and password recovery email.
- `dashboard.html`: enrollment request, approval status, generated access code, and approved materials.
- `profile.html`: cloud-saved name, avatar/banner uploads, and **My Subscriptions / اشتراكاتي**.
- `summaries.html`, `exams.html`: approved-student-only materials and PDF links.
- `admin.html`: user approvals/roles/ban/delete, PDF materials, announcement broadcaster, social links, editable English homepage copy.
- `supabase-schema.sql`: tables, signup trigger, RPCs, RLS, Realtime publication, and profile-media storage policies.

## Security and behavior notes
- The schema restricts profile role/enrollment/access-code changes to server-side admin RPC/bootstrap SQL; students can only edit their own name, phone, and image URLs.
- Materials are visible only to approved, non-banned students and administrators. Announcements/settings are public-readable; only admins can publish/edit.
- Profile image storage is public-read and owner-write (profile pictures are intended to be visible); max upload is 5 MB.
- Google Drive URLs may block embedding. Use a direct PDF URL or a Drive preview URL such as `https://drive.google.com/file/d/FILE_ID/preview`.
- Browser audio may require an earlier user gesture; live chime is best-effort. Supabase Realtime only works after enabling the publication in the SQL script and with network access.
- Access control is enforced by RLS, not merely by hiding UI. Keep database backups and configure email/SMTP and Auth rate limits before production.
