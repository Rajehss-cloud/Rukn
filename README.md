# Rukn — Al-Mahkama Study Corner

Static bilingual (Arabic/English) educational-platform prototype for first-year law students at Zagazig University.

## Run locally
Open `index.html` in a browser, or serve this folder with a static server (recommended for browser APIs), e.g. `python -m http.server 8000`. Place the provided logo at `assets/logo.png`. Without the logo the interface falls back to a gold scales mark.

## Pages
- `index.html`: landing page and announcement
- `login.html`: demo account creation, sign-in, and recovery guidance
- `dashboard.html`: enrollment request and access status
- `profile.html`: profile name, avatar/banner uploads, and My Subscriptions / اشتراكاتي
- `summaries.html`: gated subjects, PDF iframe viewer and download links
- `exams.html`: gated timed sample MCQ quiz and exam PDF links
- `admin.html`: demo user/content/social/announcement management

## Demo admin login
Email: `admin@rukn.edu.eg`  
Password: `RuknAdmin2026!`

## Important limitations
This is a front-end-only demonstration. All accounts, passwords, approvals, content, and settings are stored in each visitor's own browser `localStorage`; they are not shared across visitors and are not secure authentication. The admin password is visible in the client-side JavaScript, and uploaded profile images stay local to the browser. Do not use real student data or treat the demo as a production service. A real shared platform needs a backend, secure password hashing/authentication, server-side authorization, storage, and email delivery. Announcements are local to the browser; `BroadcastChannel` only synchronizes open tabs on the same origin/device.

PDF links must point to files hosted with suitable CORS/embedding settings; some providers block iframe embedding. No actual PDFs are bundled.
