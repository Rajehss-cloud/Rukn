/*
 * Rukn — Al-Mahkama Study Corner
 * Vanilla JavaScript + Supabase JS v2.
 * Cloud data is authoritative; localStorage is used only for language preference.
 */
(() => {
  'use strict';

  const SUPABASE = window.supabase;
  const PROJECT_URL = window.RUKN_SUPABASE_URL;
  const ANON_KEY = window.RUKN_SUPABASE_ANON_KEY;
  const isConfigured = Boolean(
    SUPABASE &&
    PROJECT_URL &&
    ANON_KEY &&
    !PROJECT_URL.includes('YOUR_') &&
    !ANON_KEY.includes('YOUR_')
  );
  const db = isConfigured
    ? SUPABASE.createClient(PROJECT_URL, ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);

  const translations = {
    ar: {
      home: 'الرئيسية', courses: 'المواد', summaries: 'الملخصات',
      exams: 'الأسئلة والامتحانات', dashboard: 'لوحة الطالب', profile: 'حسابي',
      admin: 'الإدارة', login: 'دخول', logout: 'تسجيل الخروج',
      brand: 'المحكمة — ركن المذاكرة', tagline: 'فرقة أولى حقوق · جامعة الزقازيق',
      heroEyebrow: 'مستقبلك القانوني يبدأ هنا',
      heroTitle: 'افهم القانون،<br><span class="gold">وابنِ مستقبلك.</span>',
      heroText: 'مساحتك التعليمية المنظمة لطلبة الفرقة الأولى حقوق. ملخصات، تدريب، ومتابعة دراسية في مكان واحد.',
      explore: 'استكشف المنصة', getStarted: 'ابدأ الآن', featured: 'مواد الفرقة الأولى',
      featuredDesc: 'ابدأ رحلتك الدراسية بأساس قانوني متين.', announcement: 'إعلان المنصة',
      about: 'ركن مذاكرتك القانوني', aboutText: 'منصة تعليمية لمساندة طلاب الفرقة الأولى بكلية الحقوق — جامعة الزقازيق.',
      social: 'تابعنا', footer: '© ركن المذاكرة. منصة تعليمية مستقلة.', welcome: 'أهلًا',
      access: 'كود الدخول', request: 'طلب الاشتراك في المواد', pending: 'طلبك قيد مراجعة الإدارة',
      approved: 'تم تفعيل اشتراكك', noAccess: 'محتوى الطلاب يظهر بعد موافقة الإدارة.',
      openSummaries: 'افتح الملخصات', openExams: 'ابدأ التدريب', mySubscriptions: 'اشتراكاتي',
      name: 'الاسم الكامل', email: 'البريد الإلكتروني', phone: 'رقم الهاتف', password: 'كلمة المرور',
      register: 'إنشاء حساب', loginTitle: 'مرحبًا بعودتك', registerTitle: 'إنشاء حساب طالب',
      loginAction: 'تسجيل الدخول', registerAction: 'إنشاء الحساب', forgot: 'نسيت كلمة المرور؟',
      resetSent: 'إذا كان البريد مسجلًا، ستصلك رسالة استعادة من Supabase.',
      setupNeeded: 'أكمل إعداد Supabase: ضع رابط المشروع ومفتاح anon في js/supabase-config.js ثم نفّذ supabase-schema.sql.',
      profileTitle: 'ملفي الشخصي', banner: 'صورة البنر', avatar: 'الصورة الشخصية',
      save: 'حفظ التغييرات', quiz: 'اختبار سريع', startQuiz: 'ابدأ الاختبار', next: 'السؤال التالي',
      timer: 'الوقت المتبقي', score: 'نتيجتك', search: 'ابحث عن ملف...', all: 'الكل',
      viewPdf: 'عرض الملف', download: 'فتح / تحميل PDF', noPdf: 'لا توجد ملفات مضافة لهذه المادة بعد.',
      requestSent: 'تم إرسال طلب الاشتراك للإدارة.', adminTitle: 'لوحة الإدارة',
      adminOnly: 'هذه الصفحة للمسؤولين فقط.', users: 'إدارة المستخدمين', content: 'المواد والمحتوى',
      broadcast: 'إعلان عام', socialManager: 'روابط التواصل', status: 'الحالة', role: 'الصلاحية',
      actions: 'إجراءات', approve: 'موافقة', makeAdmin: 'ترقية لمسؤول', makeStudent: 'إرجاع لطالب',
      ban: 'حظر / إلغاء الحظر', delete: 'حذف الحساب', addMaterial: 'إضافة ملف تعليمي',
      title: 'عنوان الملف', subject: 'المادة', type: 'النوع', pdfUrl: 'رابط PDF أو معاينة Google Drive',
      publish: 'نشر الإعلان', announcementText: 'نص الإعلان', tiktok: 'رابط TikTok',
      instagram: 'رابط Instagram', facebook: 'رابط Facebook', whatsapp: 'رابط WhatsApp',
      saveLinks: 'حفظ الروابط', student: 'طالب', adminRole: 'مسؤول', superAdmin: 'مسؤول رئيسي',
      active: 'نشط', banned: 'محظور', notEnrolled: 'غير مشترك', waiting: 'قيد المراجعة',
      yourSubjects: 'المواد المتاحة لاشتراكك', accessGranted: 'اشتراك مفعل', timeUp: 'انتهى الوقت',
      correct: 'إجابة صحيحة', wrong: 'إجابة غير صحيحة', subscriptionNote: 'تظهر الملفات التي أتاحتها الإدارة هنا.',
      notFound: 'لا توجد ملفات مطابقة.', secured: 'هذه صفحة محمية. سجّل الدخول أولًا.',
      emailConfirm: 'تحقق من بريدك لتأكيد الحساب قبل تسجيل الدخول.',
      signedUp: 'تم إنشاء الحساب. أكّد بريدك الإلكتروني ثم سجّل الدخول.',
      error: 'حدث خطأ. تحقق من الإعدادات والصلاحيات.', saved: 'تم الحفظ بنجاح.',
      loading: 'جار التحميل…', homeSettings: 'نصوص الصفحة الرئيسية', heroTitleLabel: 'عنوان الصفحة (إنجليزي)',
      heroTextLabel: 'وصف الصفحة (إنجليزي)', footerLabel: 'نص التذييل', noUsers: 'لا يوجد مستخدمون.',
      quizIntro: 'اختبار تجريبي قصير، مدته 60 ثانية.',
    },
    en: {
      home: 'Home', courses: 'Subjects', summaries: 'Summaries', exams: 'Questions & Exams',
      dashboard: 'Student portal', profile: 'My profile', admin: 'Admin', login: 'Sign in',
      logout: 'Sign out', brand: 'Al-Mahkama — Study Corner', tagline: 'First Year Law · Zagazig University',
      heroEyebrow: 'Your legal future starts here',
      heroTitle: 'Understand the law,<br><span class="gold">build your future.</span>',
      heroText: 'A focused learning space for first-year law students. Study notes, practice, and progress in one place.',
      explore: 'Explore platform', getStarted: 'Get started', featured: 'First-year subjects',
      featuredDesc: 'Build a strong foundation for your law studies.', announcement: 'Platform announcement',
      about: 'Your legal study corner', aboutText: 'An independent learning platform supporting first-year Faculty of Law students at Zagazig University.',
      social: 'Follow us', footer: '© Study Corner. Independent educational platform.', welcome: 'Welcome',
      access: 'Access code', request: 'Request course access', pending: 'Your request is pending admin approval',
      approved: 'Your enrollment is active', noAccess: 'Student content is available after admin approval.',
      openSummaries: 'Browse summaries', openExams: 'Practice questions', mySubscriptions: 'My Subscriptions',
      name: 'Full name', email: 'Email address', phone: 'Phone number', password: 'Password',
      register: 'Create account', loginTitle: 'Welcome back', registerTitle: 'Create a student account',
      loginAction: 'Sign in', registerAction: 'Create account', forgot: 'Forgot password?',
      resetSent: 'If registered, Supabase will send a recovery email.',
      setupNeeded: 'Configure Supabase: set the project URL and anon key in js/supabase-config.js, then run supabase-schema.sql.',
      profileTitle: 'My profile', banner: 'Profile banner', avatar: 'Profile photo', save: 'Save changes',
      quiz: 'Quick quiz', startQuiz: 'Start quiz', next: 'Next question', timer: 'Time left', score: 'Your score',
      search: 'Search materials...', all: 'All', viewPdf: 'View file', download: 'Open / download PDF',
      noPdf: 'No files have been added for this subject yet.', requestSent: 'Enrollment request sent.',
      adminTitle: 'Admin panel', adminOnly: 'Administrators only.', users: 'User management',
      content: 'Materials', broadcast: 'Public announcement', socialManager: 'Social links', status: 'Status',
      role: 'Role', actions: 'Actions', approve: 'Approve', makeAdmin: 'Promote to admin',
      makeStudent: 'Set as student', ban: 'Ban / unban', delete: 'Delete account', addMaterial: 'Add material',
      title: 'Title', subject: 'Subject', type: 'Type', pdfUrl: 'PDF URL or Google Drive preview',
      publish: 'Publish announcement', announcementText: 'Announcement text', tiktok: 'TikTok URL',
      instagram: 'Instagram URL', facebook: 'Facebook URL', whatsapp: 'WhatsApp URL', saveLinks: 'Save links',
      student: 'Student', adminRole: 'Admin', superAdmin: 'Super Admin', active: 'Active', banned: 'Banned',
      notEnrolled: 'Not enrolled', waiting: 'Pending', yourSubjects: 'Available materials',
      accessGranted: 'Enrollment active', timeUp: 'Time is up', correct: 'Correct', wrong: 'Incorrect',
      subscriptionNote: 'Admin-approved materials appear here.', notFound: 'No matching materials.',
      secured: 'Protected page. Please sign in first.', emailConfirm: 'Check your email to confirm your account.',
      signedUp: 'Account created. Confirm your email, then sign in.', error: 'Something went wrong. Check configuration and permissions.',
      saved: 'Saved successfully.', loading: 'Loading…', homeSettings: 'Homepage copy',
      heroTitleLabel: 'Homepage title (English)', heroTextLabel: 'Homepage description (English)',
      footerLabel: 'Footer text', noUsers: 'No users yet.', quizIntro: 'A short demo quiz, timed for 60 seconds.',
    },
  };

  let language = localStorage.getItem('rukn_lang_v1') || 'ar';
  let profile = null;
  let materials = [];
  let settings = { social: {}, site: {} };
  let latestAnnouncement = null;
  let realtimeChannel = null;

  const t = (key) => translations[language]?.[key] || translations.ar[key] || key;
  const isAdmin = () => profile && ['admin', 'super_admin'].includes(profile.role) && !profile.is_banned;
  const isApproved = () => profile?.enrollment_status === 'approved' && !profile.is_banned;
  const notify = (message) => {
    const root = $('#toast-root');
    if (!root) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    root.append(toast);
    window.setTimeout(() => toast.remove(), 4500);
  };
  const reportError = (error) => {
    console.error('[Rukn]', error);
    notify(error?.message || t('error'));
  };

  async function getProfile() {
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError) throw authError;
    if (!user) {
      profile = null;
      return;
    }
    const { data, error } = await db.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error) throw error;
    profile = data;
  }

  async function loadSettingsAndAnnouncement() {
    const [{ data: settingsRows, error: settingsError }, { data: announcements, error: announcementError }] = await Promise.all([
      db.from('site_settings').select('key,value'),
      db.from('announcements').select('id,body,created_at').order('created_at', { ascending: false }).limit(1),
    ]);
    if (settingsError) throw settingsError;
    if (announcementError) throw announcementError;
    const values = Object.fromEntries((settingsRows || []).map((row) => [row.key, row.value]));
    settings = { social: values.social || {}, site: values.site || {} };
    latestAnnouncement = announcements?.[0] || null;
  }

  async function loadMaterials() {
    if (!profile || (!isApproved() && !isAdmin())) {
      materials = [];
      return;
    }
    const { data, error } = await db.from('materials').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    materials = data || [];
  }

  async function refresh(repaint = true) {
    if (!db) return;
    await getProfile();
    await loadSettingsAndAnnouncement();
    await loadMaterials();
    if (repaint) render();
  }

  function renderHeader() {
    const links = [
      ['home', 'index.html'], ['summaries', 'summaries.html'], ['exams', 'exams.html'],
      ['dashboard', 'dashboard.html'], ['profile', 'profile.html'],
    ];
    if (isAdmin()) links.push(['admin', 'admin.html']);
    $('#site-header').innerHTML = `
      <header class="site-header">
        <div class="nav-wrap">
          <a class="brand" href="index.html">
            <img src="assets/logo.png" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
            <span class="brand-mark" style="display:none">⚖</span>
            <span class="brand-name">${t('brand')}</span>
          </a>
          <button class="menu-toggle" data-menu aria-label="Menu">☰</button>
          <nav class="nav-links">${links.map(([key, url]) => `<a href="${url}">${t(key)}</a>`).join('')}</nav>
          <div class="nav-tools">
            <button class="lang-toggle" data-lang>${language === 'ar' ? 'EN' : 'عربي'}</button>
            ${profile
              ? `<button class="secondary" data-logout>${t('logout')}</button>`
              : `<a class="button secondary" href="login.html">${t('login')}</a>`}
          </div>
        </div>
      </header>`;
  }

  function renderFooter() {
    const social = settings.social || {};
    const links = [['tiktok', 'TikTok'], ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['whatsapp', 'WhatsApp']]
      .filter(([key]) => social[key])
      .map(([key, label]) => `<a href="${escapeHtml(social[key])}" target="_blank" rel="noopener noreferrer">${label}</a>`)
      .join('');
    $('#site-footer').innerHTML = `
      <footer class="site-footer">
        <div class="footer-inner">
          <div><strong>${escapeHtml(settings.site?.brand || t('brand'))}</strong><p>${escapeHtml(settings.site?.footer || t('footer'))}</p></div>
          <div><p>${t('social')}</p><div class="socials">${links}</div></div>
        </div>
      </footer>`;
  }

  function defaultSubjects() {
    return language === 'ar'
      ? ['القانون الدستوري', 'القانون المدني', 'الشريعة الإسلامية', 'تاريخ القانون']
      : ['Constitutional Law', 'Civil Law', 'Islamic Law', 'Legal History'];
  }

  function materialCard(material) {
    return `
      <article class="card tilt subject-item" data-name="${escapeHtml(`${material.title} ${material.subject}`.toLowerCase())}">
        <div class="card-icon">${material.type === 'exam' ? '✍' : '§'}</div>
        <h3>${escapeHtml(material.title)}</h3>
        <p>${escapeHtml(material.subject)} · ${material.type === 'exam' ? t('exams') : t('summaries')}</p>
        <div class="actions">
          <a class="button" href="${escapeHtml(material.pdf_url)}" target="_blank" rel="noopener noreferrer">${t('viewPdf')}</a>
          <a class="button secondary" href="${escapeHtml(material.pdf_url)}" target="_blank" rel="noopener noreferrer">${t('download')}</a>
        </div>
      </article>`;
  }

  function homePage() {
    const site = settings.site || {};
    const subjects = [...new Set(materials.map((item) => item.subject))];
    const subjectCards = (subjects.length ? subjects : defaultSubjects()).slice(0, 6)
      .map((subject) => `<article class="card tilt reveal"><div class="card-icon">§</div><h3>${escapeHtml(subject)}</h3><p>${t('subscriptionNote')}</p><a class="button secondary" href="summaries.html">${t('summaries')} ←</a></article>`)
      .join('');
    return `
      <section class="hero">
        <canvas id="gold-dust"></canvas>
        <div class="hero-copy">
          <span class="eyebrow">${t('heroEyebrow')}</span>
          <h1>${site.hero_title || t('heroTitle')}</h1>
          <p class="lead">${escapeHtml(site.hero_text || t('heroText'))}</p>
          <div class="actions"><a class="button" href="login.html">${t('getStarted')}</a><a class="button secondary" href="#subjects">${t('explore')}</a></div>
        </div>
        <div class="hero-art"><div class="hero-orb"><img src="assets/logo.png" alt="Al-Mahkama logo" onerror="this.outerHTML='<span class=\'scales\'>⚖</span>'"></div></div>
      </section>
      ${latestAnnouncement ? `<div class="announcement reveal"><span>✦</span><strong>${t('announcement')}:</strong><span>${escapeHtml(latestAnnouncement.body)}</span></div>` : ''}
      <section class="section" id="subjects">
        <div class="section-head"><div><span class="eyebrow">${t('courses')}</span><h2>${escapeHtml(site.featured_title || t('featured'))}</h2><p>${t('featuredDesc')}</p></div></div>
        <div class="grid">${subjectCards}</div>
      </section>
      <section class="section grid">
        <article class="card reveal"><span class="card-icon">📚</span><h3>${t('summaries')}</h3></article>
        <article class="card reveal"><span class="card-icon">✍️</span><h3>${t('exams')}</h3></article>
        <article class="card reveal"><span class="card-icon">🛡</span><h3>${t('about')}</h3><p>${t('aboutText')}</p></article>
      </section>`;
  }

  function loginPage() {
    return `<section class="panel form-card"><div class="tabs"><button data-auth-mode="login">${t('login')}</button><button class="secondary" data-auth-mode="register">${t('register')}</button></div><div id="auth-view"></div></section>`;
  }

  function renderAuth(mode = 'login') {
    const host = $('#auth-view');
    if (!host) return;
    if (mode === 'register') {
      host.innerHTML = `
        <h1>${t('registerTitle')}</h1>
        <form class="form-grid" data-form="register">
          <label class="field">${t('name')}<input name="full_name" required minlength="2"></label>
          <label class="field">${t('phone')}<input name="phone" type="tel" required></label>
          <label class="field">${t('email')}<input name="email" type="email" required autocomplete="email"></label>
          <label class="field">${t('password')}<input name="password" type="password" minlength="8" required autocomplete="new-password"></label>
          <button>${t('registerAction')}</button>
        </form>`;
    } else {
      host.innerHTML = `
        <h1>${t('loginTitle')}</h1>
        <form class="form-grid" data-form="login">
          <label class="field">${t('email')}<input name="email" type="email" required autocomplete="email"></label>
          <label class="field">${t('password')}<input name="password" type="password" required autocomplete="current-password"></label>
          <button>${t('loginAction')}</button>
          <button type="button" class="secondary" data-reset>${t('forgot')}</button>
        </form>`;
      $('[data-reset]', host)?.addEventListener('click', async () => {
        const email = $('[name="email"]', host)?.value.trim();
        if (!email) return notify(t('email'));
        const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}${location.pathname}` });
        if (error) reportError(error); else notify(t('resetSent'));
      });
    }
  }

  function protectedMessage() {
    if (!profile) return `<section class="panel form-card"><h1>${t('secured')}</h1><a class="button" href="login.html">${t('login')}</a></section>`;
    if (profile.is_banned) return `<section class="panel"><h1>${t('banned')}</h1></section>`;
    if (!isApproved() && !isAdmin()) {
      const pending = profile.enrollment_status === 'pending';
      return `<section class="panel"><h1>${t('welcome')}, ${escapeHtml(profile.full_name)}</h1><p class="notice">${pending ? t('pending') : t('noAccess')}</p>${pending ? '' : `<button data-request>${t('request')}</button>`}</section>`;
    }
    return null;
  }

  function dashboardPage() {
    const message = protectedMessage();
    if (message) return message;
    return `
      <section class="panel"><span class="eyebrow">${t('dashboard')}</span><h1>${t('welcome')}, <span class="gold">${escapeHtml(profile.full_name)}</span></h1>
        <p class="lead">${t('access')}: <span class="access-code">${escapeHtml(profile.access_code || '—')}</span></p>
        <div class="notice">${t('approved')}</div><div class="actions">
          <a class="button" href="summaries.html">${t('openSummaries')}</a><a class="button secondary" href="exams.html">${t('openExams')}</a><a class="button secondary" href="profile.html">${t('mySubscriptions')}</a>
        </div>
      </section><section class="section"><h2>${t('mySubscriptions')}</h2><p class="muted">${t('subscriptionNote')}</p><div class="grid">${materials.map(materialCard).join('') || `<p class="empty">${t('notFound')}</p>`}</div></section>`;
  }

  function materialsPage(type) {
    const message = protectedMessage();
    if (message) return message;
    const list = materials.filter((item) => item.type === type);
    const subjects = [...new Set(list.map((item) => item.subject))];
    return `
      <div class="page-heading"><span class="eyebrow">${t('dashboard')}</span><h1>${type === 'summary' ? t('summaries') : t('exams')}</h1><p class="muted">${t('subscriptionNote')}</p></div>
      <div class="subject-tools"><input class="search-input" data-search placeholder="${t('search')}"><select data-filter class="search-input"><option value="">${t('all')}</option>${subjects.map((subject) => `<option>${escapeHtml(subject)}</option>`).join('')}</select></div>
      <div class="grid">${list.map(materialCard).join('') || `<p class="empty">${t('notFound')}</p>`}</div>`;
  }

  function profilePage() {
    if (!profile) return protectedMessage();
    return `
      <div class="page-heading"><h1>${t('profileTitle')}</h1></div>
      <section class="panel" style="padding:0;overflow:hidden">
        <div class="profile-banner" style="background-image:linear-gradient(130deg,#d4af3744,#101f36)${profile.banner_url ? `,url('${escapeHtml(profile.banner_url)}')` : ''}"></div>
        <div class="profile-row"><img class="avatar" src="${escapeHtml(profile.avatar_url || 'assets/logo.png')}" alt="${t('avatar')}"><div><h2>${escapeHtml(profile.full_name)}</h2><span class="badge">${isApproved() ? t('accessGranted') : profile.enrollment_status === 'pending' ? t('waiting') : t('notEnrolled')}</span></div></div>
        <div class="panel" style="border:0;box-shadow:none"><form class="form-grid" data-form="profile">
          <label class="field">${t('name')}<input name="full_name" value="${escapeHtml(profile.full_name)}" required></label>
          <label class="field">${t('avatar')}<input name="avatar" type="file" accept="image/png,image/jpeg,image/webp"></label>
          <label class="field">${t('banner')}<input name="banner" type="file" accept="image/png,image/jpeg,image/webp"></label>
          <button>${t('save')}</button>
        </form></div>
      </section>
      <section class="section"><h2>${t('mySubscriptions')}</h2><p class="muted">${t('subscriptionNote')}</p>${isApproved() ? `<div class="grid">${materials.map(materialCard).join('')}</div>` : `<a class="button" href="dashboard.html">${t('request')}</a>`}</section>`;
  }

  function adminPage() {
    if (!isAdmin()) return `<section class="panel form-card"><h1>${t('adminTitle')}</h1><p>${t('adminOnly')}</p><a class="button" href="login.html">${t('login')}</a></section>`;
    const social = settings.social || {};
    const site = settings.site || {};
    return `
      <div class="page-heading"><h1>${t('adminTitle')}</h1></div>
      <div class="admin-sections">
        <section class="panel"><h2>${t('users')}</h2><div id="admin-users">${t('loading')}</div></section>
        <section class="panel"><h2>${t('content')}</h2><form class="form-grid split" data-form="material">
          <label class="field">${t('title')}<input name="title" required></label><label class="field">${t('subject')}<input name="subject" required></label>
          <label class="field">${t('type')}<select name="type"><option value="summary">${t('summaries')}</option><option value="exam">${t('exams')}</option></select></label>
          <label class="field">${t('pdfUrl')}<input name="pdf_url" type="url" required></label><button>${t('addMaterial')}</button>
        </form><div class="grid" style="margin-top:1rem">${materials.map((item) => `<article class="card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.subject)} · ${escapeHtml(item.type)}</p><button class="danger" data-delete-material="${escapeHtml(item.id)}">${t('delete')}</button></article>`).join('')}</div></section>
        <section class="split">
          <div class="panel"><h2>${t('broadcast')}</h2><form class="form-grid" data-form="announcement"><label class="field">${t('announcementText')}<textarea name="body" required></textarea></label><button>${t('publish')}</button></form></div>
          <div class="panel"><h2>${t('socialManager')}</h2><form class="form-grid" data-form="settings">
            ${[['tiktok','TikTok'],['instagram','Instagram'],['facebook','Facebook'],['whatsapp','WhatsApp']].map(([key,label]) => `<label class="field">${label}<input name="${key}" type="url" value="${escapeHtml(social[key] || '')}"></label>`).join('')}
            <h3>${t('homeSettings')}</h3><label class="field">${t('heroTitleLabel')}<input name="hero_title" value="${escapeHtml(site.hero_title || '')}"></label>
            <label class="field">${t('heroTextLabel')}<textarea name="hero_text">${escapeHtml(site.hero_text || '')}</textarea></label>
            <label class="field">${t('footerLabel')}<input name="footer" value="${escapeHtml(site.footer || '')}"></label><button>${t('saveLinks')}</button>
          </form></div>
        </section>
      </div>`;
  }

  function render() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    renderHeader();
    renderFooter();
    const page = document.body.dataset.page;
    const views = {
      home: homePage,
      login: loginPage,
      dashboard: dashboardPage,
      profile: profilePage,
      summaries: () => materialsPage('summary'),
      exams: () => {
        const message = protectedMessage();
        return message || `<div class="page-heading"><h1>${t('exams')}</h1><p class="muted">${t('quizIntro')}</p></div><section class="panel" id="quiz-panel"><h2>${t('quiz')}</h2><button data-quiz-start>${t('startQuiz')}</button><div id="quiz-body"></div></section><section class="section"><h2>${t('yourSubjects')}</h2><div class="grid">${materials.filter((item) => item.type === 'exam').map(materialCard).join('') || `<p class="empty">${t('notFound')}</p>`}</div></section>`;
      },
      admin: adminPage,
    };
    $('#app').innerHTML = (views[page] || homePage)();
    if (page === 'login') renderAuth();
    bindPage();
    if (page === 'admin' && isAdmin()) loadAdminUsers().catch(reportError);
    if (page === 'home' && window.RuknDust) window.RuknDust.start($('#gold-dust'));
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }), { threshold: 0.1 });
      $$('.reveal').forEach((element) => observer.observe(element));
    }
  }

  async function loadAdminUsers() {
    const { data, error } = await db.from('profiles')
      .select('id,full_name,gmail,phone,role,enrollment_status,access_code,is_banned')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const target = $('#admin-users');
    if (!target) return;
    target.innerHTML = data?.length ? `
      <div class="table-wrap"><table class="data-table"><thead><tr><th>${t('name')}</th><th>${t('email')}</th><th>${t('phone')}</th><th>${t('role')}</th><th>${t('status')}</th><th>${t('actions')}</th></tr></thead><tbody>
      ${data.map((user) => `<tr><td>${escapeHtml(user.full_name)}</td><td>${escapeHtml(user.gmail)}</td><td>${escapeHtml(user.phone)}</td><td>${escapeHtml(user.role)}</td><td>${user.is_banned ? t('banned') : escapeHtml(user.enrollment_status)}${user.access_code ? `<br><small class="access-code">${escapeHtml(user.access_code)}</small>` : ''}</td><td class="inline">
        ${user.enrollment_status !== 'approved' ? `<button data-user-action="approve" data-id="${escapeHtml(user.id)}">${t('approve')}</button>` : ''}
        ${profile.role === 'super_admin' && user.role !== 'super_admin' ? `<button class="secondary" data-user-action="role" data-role="${user.role === 'admin' ? 'student' : 'admin'}" data-id="${escapeHtml(user.id)}">${user.role === 'admin' ? t('makeStudent') : t('makeAdmin')}</button>` : ''}
        ${user.role !== 'super_admin' ? `<button class="danger" data-user-action="ban" data-banned="${!user.is_banned}" data-id="${escapeHtml(user.id)}">${t('ban')}</button>` : ''}
        ${profile.role === 'super_admin' && user.role !== 'super_admin' ? `<button class="danger" data-user-action="delete" data-id="${escapeHtml(user.id)}">${t('delete')}</button>` : ''}
      </td></tr>`).join('')}</tbody></table></div>` : `<p class="empty">${t('noUsers')}</p>`;
  }

  async function uploadProfileImage(file, kind) {
    if (!file || !file.size) return null;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Use JPG, PNG, or WebP images.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Image size must be 5 MB or less.');
    const extension = file.name.split('.').pop().replace(/[^a-z0-9]/gi, '') || 'jpg';
    const path = `${profile.id}/${kind}-${Date.now()}.${extension}`;
    const { error } = await db.storage.from('profile-media').upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    return db.storage.from('profile-media').getPublicUrl(path).data.publicUrl;
  }

  async function handleClick(event) {
    try {
      if (event.target.closest('[data-lang]')) {
        language = language === 'ar' ? 'en' : 'ar';
        localStorage.setItem('rukn_lang_v1', language);
        render();
        return;
      }
      if (event.target.closest('[data-menu]')) {
        $('.nav-links')?.classList.toggle('open');
        return;
      }
      if (event.target.closest('[data-logout]')) {
        const { error } = await db.auth.signOut();
        if (error) throw error;
        location.href = 'index.html';
        return;
      }
      if (event.target.closest('[data-request]')) {
        const { error } = await db.rpc('request_enrollment');
        if (error) throw error;
        await refresh();
        notify(t('requestSent'));
        return;
      }
      const authTab = event.target.closest('[data-auth-mode]');
      if (authTab) {
        renderAuth(authTab.dataset.authMode);
        return;
      }
      const action = event.target.closest('[data-user-action]');
      if (action) {
        const value = action.dataset.userAction === 'role'
          ? action.dataset.role
          : action.dataset.userAction === 'ban' ? action.dataset.banned : null;
        const { error } = await db.rpc('admin_manage_profile', {
          target_user_id: action.dataset.id,
          action: action.dataset.userAction,
          action_value: value,
        });
        if (error) throw error;
        await refresh();
        return;
      }
      const removeMaterial = event.target.closest('[data-delete-material]');
      if (removeMaterial) {
        const { error } = await db.from('materials').delete().eq('id', removeMaterial.dataset.deleteMaterial);
        if (error) throw error;
        await refresh();
        return;
      }
      if (event.target.closest('[data-quiz-start]')) startQuiz();
      const option = event.target.closest('[data-option]');
      if (option) chooseAnswer(Number(option.dataset.option));
      if (event.target.closest('[data-next]')) nextQuestion();
    } catch (error) {
      reportError(error);
    }
  }

  async function handleSubmit(event) {
    const form = event.target.closest('[data-form]');
    if (!form) return;
    event.preventDefault();
    const values = new FormData(form);
    try {
      if (form.dataset.form === 'login') {
        const { error } = await db.auth.signInWithPassword({ email: values.get('email'), password: values.get('password') });
        if (error) throw error;
        await refresh(false);
        location.href = 'dashboard.html';
      } else if (form.dataset.form === 'register') {
        const email = String(values.get('email')).trim().toLowerCase();
        const { data, error } = await db.auth.signUp({
          email,
          password: values.get('password'),
          options: {
            data: { full_name: values.get('full_name'), phone: values.get('phone') },
            emailRedirectTo: `${location.origin}${location.pathname.replace(/[^/]*$/, 'index.html')}`,
          },
        });
        if (error) throw error;
        if (data.session) await refresh(false);
        notify(data.session ? t('signedUp') : t('emailConfirm'));
        renderAuth('login');
      } else if (form.dataset.form === 'profile') {
        const avatar = await uploadProfileImage(values.get('avatar'), 'avatar');
        const banner = await uploadProfileImage(values.get('banner'), 'banner');
        const updates = { full_name: values.get('full_name').trim() };
        if (avatar) updates.avatar_url = avatar;
        if (banner) updates.banner_url = banner;
        const { error } = await db.from('profiles').update(updates).eq('id', profile.id);
        if (error) throw error;
        await refresh();
        notify(t('saved'));
      } else if (form.dataset.form === 'material') {
        const { error } = await db.from('materials').insert({
          title: values.get('title').trim(),
          subject: values.get('subject').trim(),
          type: values.get('type'),
          pdf_url: values.get('pdf_url').trim(),
          created_by: profile.id,
        });
        if (error) throw error;
        await refresh();
      } else if (form.dataset.form === 'announcement') {
        const { error } = await db.from('announcements').insert({ body: values.get('body').trim(), created_by: profile.id });
        if (error) throw error;
        form.reset();
        notify(t('saved'));
      } else if (form.dataset.form === 'settings') {
        const social = Object.fromEntries(['tiktok', 'instagram', 'facebook', 'whatsapp'].map((key) => [key, values.get(key) || '']));
        const site = {
          ...settings.site,
          hero_title: values.get('hero_title') || '',
          hero_text: values.get('hero_text') || '',
          footer: values.get('footer') || '',
        };
        for (const [key, value] of Object.entries({ social, site })) {
          const { error } = await db.from('site_settings').upsert({ key, value, updated_by: profile.id }, { onConflict: 'key' });
          if (error) throw error;
        }
        await refresh();
        notify(t('saved'));
      }
    } catch (error) {
      reportError(error);
    }
  }

  function bindPage() {
    document.addEventListener('click', handleClick, { once: true });
    document.addEventListener('submit', handleSubmit, { once: true });
    document.addEventListener('input', (event) => {
      if (event.target.matches('[data-search], [data-filter]')) filterMaterials();
    }, { once: true });
    $$('.tilt').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        element.style.transform = `perspective(700px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-2px)`;
      });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });
  }

  function filterMaterials() {
    const query = ($('[data-search]')?.value || '').toLowerCase();
    const subject = $('[data-filter]')?.value || '';
    $$('.subject-item').forEach((element) => {
      element.classList.toggle('hidden', !element.dataset.name.includes(query) || (subject && !element.textContent.includes(subject)));
    });
  }

  const questions = [
    { q: { ar: 'ما القاعدة القانونية؟', en: 'What is a legal rule?' }, options: { ar: ['قاعدة عامة ومجردة تنظم السلوك', 'رأي شخصي', 'عادة فردية'], en: ['A general, abstract rule regulating conduct', 'A personal opinion', 'An individual habit'] }, answer: 0 },
    { q: { ar: 'أي مما يلي من فروع القانون العام؟', en: 'Which is a branch of public law?' }, options: { ar: ['القانون الدستوري', 'القانون المدني', 'قانون الأسرة'], en: ['Constitutional law', 'Civil law', 'Family law'] }, answer: 0 },
    { q: { ar: 'ما المقصود بمبدأ سيادة القانون؟', en: 'What does the rule of law mean?' }, options: { ar: ['خضوع الجميع للقانون', 'إعفاء بعض الأشخاص من القانون', 'عدم وجود قواعد'], en: ['Everyone is subject to the law', 'Some people are exempt', 'No rules exist'] }, answer: 0 },
  ];
  let questionIndex = 0;
  let quizScore = 0;
  let secondsLeft = 60;
  let quizTimer = null;

  function startQuiz() {
    questionIndex = 0;
    quizScore = 0;
    secondsLeft = 60;
    window.clearInterval(quizTimer);
    renderQuestion();
    quizTimer = window.setInterval(() => {
      secondsLeft -= 1;
      if ($('[data-time]')) $('[data-time]').textContent = secondsLeft;
      if (secondsLeft <= 0) finishQuiz(true);
    }, 1000);
  }

  function renderQuestion() {
    const question = questions[questionIndex];
    const container = $('#quiz-body');
    if (!container || !question) return;
    container.innerHTML = `
      <div class="quiz-progress"><span style="width:${(questionIndex / questions.length) * 100}%"></span></div>
      <p>${t('timer')}: <strong data-time>${secondsLeft}</strong>s</p>
      <h3>${questionIndex + 1}/${questions.length} — ${question.q[language]}</h3>
      ${question.options[language].map((option, index) => `<button class="quiz-option" data-option="${index}">${option}</button>`).join('')}
      <p id="quiz-feedback"></p><button class="hidden" data-next>${t('next')}</button>`;
  }

  function chooseAnswer(index) {
    const feedback = $('#quiz-feedback');
    if (!feedback || feedback.dataset.done) return;
    feedback.dataset.done = 'true';
    if (index === questions[questionIndex].answer) {
      quizScore += 1;
      feedback.textContent = t('correct');
    } else {
      feedback.textContent = t('wrong');
    }
    $$('[data-option]').forEach((button) => { button.disabled = true; });
    $('[data-next]')?.classList.remove('hidden');
  }

  function nextQuestion() {
    questionIndex += 1;
    if (questionIndex >= questions.length) return finishQuiz(false);
    renderQuestion();
  }

  function finishQuiz(timeExpired) {
    window.clearInterval(quizTimer);
    const container = $('#quiz-body');
    if (container) container.innerHTML = `<div class="notice"><strong>${t('score')}: ${quizScore}/${questions.length}</strong>${timeExpired ? ` · ${t('timeUp')}` : ''}</div><button data-quiz-start>${t('startQuiz')}</button>`;
  }

  function playChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      oscillator.connect(gain);
      gain.connect(context.destination);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.07, context.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.36);
      oscillator.onended = () => context.close();
    } catch (error) {
      console.warn('[Rukn] Audio notification unavailable.', error);
    }
  }

  async function startRealtime() {
    realtimeChannel = db.channel('rukn-live-data')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, ({ new: row }) => {
        latestAnnouncement = row;
        notify(`${t('announcement')}: ${row.body}`);
        playChime();
        if (document.body.dataset.page === 'home') render();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => refresh().catch(reportError))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, () => refresh().catch(reportError))
      .subscribe();
  }

  async function initialize() {
    if (!isConfigured) {
      renderHeader();
      renderFooter();
      $('#app').innerHTML = `<section class="panel form-card"><h1>${t('brand')}</h1><p class="notice">${t('setupNeeded')}</p></section>`;
      return;
    }
    try {
      await refresh(false);
      render();
      await startRealtime();
      db.auth.onAuthStateChange(() => {
        window.setTimeout(() => refresh().catch(reportError), 0);
      });
    } catch (error) {
      reportError(error);
      render();
    }
  }

  document.addEventListener('DOMContentLoaded', initialize);
})();
