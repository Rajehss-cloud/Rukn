# Rukn — Al-Mahkama Study Corner

A bilingual Arabic/English static frontend connected to Supabase for authentication, profiles, enrollment, materials, announcements, social links, and profile images.

## Setup
1. Create a Supabase project.
2. In **Project Settings → API**, copy the Project URL and the public `anon`/publishable key.
3. Put those two public values in `js/supabase-config.js`. Never put a `service_role` key in frontend code.
4. Open Supabase **SQL Editor**, paste and run `supabase-schema.sql`.
5. In **Authentication → URL Configuration**, set the deployed site URL and allowed redirect URLs. Enable email/password sign-in and configure SMTP for production.
6. Host this folder on HTTPS (GitHub Pages, Netlify, etc.) or run `python -m http.server 8000` and open the local address.
7. Place the logo at `assets/logo.png`.

## Super Admin bootstrap
1. Register on the site using `sherifeltahawy86@gmail.com` and the name `Abo Rajeh`.
2. Confirm the email from Supabase.
3. Run this SQL as the project owner in Supabase SQL Editor:

```sql
update public.profiles
set full_name = 'Abo Rajeh', role = 'super_admin', enrollment_status = 'approved', access_code = 'RUKN-ROOT'
where lower(gmail) = lower('sherifeltahawy86@gmail.com');
```

No password is hardcoded or stored in the repository. Set/change your password through Supabase Auth.

## Pages
- `index.html`: home, published announcement toast/chime, editable site copy and social links.
- `login.html`: email/password sign-up, login, and password recovery email.
- `dashboard.html`: enrollment request, approval status, access code, and subscriptions.
- `profile.html`: cloud-saved name, profile photo/banner, and **My Subscriptions / اشتراكاتي**.
- `summaries.html` and `exams.html`: approved-student-only PDF links and timed MCQ sample.
- `admin.html`: enrollment approvals, role management, ban/delete, materials, announcement, social and homepage settings.
- `supabase-schema.sql`: database tables, policies, RPCs, Storage, Realtime publication.

## Security and known constraints
- RLS controls access server-side. The browser only uses the Supabase anon/publishable key; never expose `service_role`.
- Supabase Auth manages passwords; no administrator password is in source files.
- Files are linked by URL; profile images are uploaded to the `profile-media` Storage bucket. Google Drive may block downloads/embedding; use an accessible PDF URL or Drive `/preview` URL.
- Browsers may require a user gesture before playing audio. Realtime sound is best effort.
- Client-side quizzes are sample frontend questions; no quiz results are persisted.
- This frontend should be tested in a Supabase project before production. Configure email, URL allowlists, backups, and access policies for your deployment.
