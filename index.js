document.addEventListener('DOMContentLoaded', function () {
    const menuBtn = document.querySelector('.menu-btn');
    const nav = document.querySelector('nav');

    // Toggle mobile menu
    menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        nav.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
            nav.classList.remove('active');
        }
    });

    // ---------------------------
    // ✅ Language Switch (EN/DE/AR)
    // ---------------------------
    const langButtons = document.querySelectorAll('.lang-btn');

    const translations = {
        en: {
            logoText: "Majd",
            navHome: "Home",
            navProjects: "Projects",
            navContact: "Contact",
            heroTitle: "Hi, It's <span>Majd</span>",
            heroSubtitlePrefix: "I'm a",
            heroJob: "Web Developer",
            introText: `
                I'm a Programmer with knowledge of HTML, CSS and JS.
                I build dynamic web applications and share my projects on YouTube,
                TikTok, and Instagram.
                <br><br>
                Check my <a href="projects.html">Projects</a> page or my
                <a href="https://github.com/Majd1024/Projects">GitHub</a>.
                <br><br>
                If you want to hire me, please <a href="contact.html">Contact me</a>.
            `,
            hireBtn: "Hire me"
        },
        de: {
            logoText: "Majd",
            navHome: "Start",
            navProjects: "Projekte",
            navContact: "Kontakt",
            heroTitle: "Hi, ich bin <span>Majd</span>",
            heroSubtitlePrefix: "Ich bin",
            heroJob: "Webentwickler",
            introText: `
                Ich bin Programmierer und kenne mich mit HTML, CSS und JS aus.
                Ich baue dynamische Web-Anwendungen und teile meine Projekte auf YouTube,
                TikTok und Instagram.
                <br><br>
                Schau dir meine <a href="projects.html">Projekte</a> an oder mein
                <a href="https://github.com/Majd1024/Projects">GitHub</a>.
                <br><br>
                Wenn du mich einstellen möchtest, bitte <a href="contact.html">kontaktiere mich</a>.
            `,
            hireBtn: "Stell mich ein"
        },
        ar: {
            logoText: "Majd",
            navHome: "الرئيسية",
            navProjects: "المشاريع",
            navContact: "تواصل",
            heroTitle: "مرحباً، أنا <span>Majd</span>",
            heroSubtitlePrefix: "أنا",
            heroJob: "مطوّر ويب",
            introText: `
                أنا مبرمج ولدي معرفة بـ HTML و CSS و JS.
                أبني تطبيقات ويب ديناميكية وأشارك مشاريعي على يوتيوب وتيك توك وإنستغرام.
                <br><br>
                تفضل بزيارة صفحة <a href="projects.html">المشاريع</a> أو حسابي على
                <a href="https://github.com/Majd1024/Projects">GitHub</a>.
                <br><br>
                إذا كنت تريد توظيفي، الرجاء <a href="contact.html">التواصل معي</a>.
            `,
            hireBtn: "وظّفني"
        }
    };

    function setActiveLangButton(lang) {
        langButtons.forEach(btn => {
            const isActive = btn.dataset.lang === lang;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    function setDirection(lang) {
        const isArabic = lang === "ar";
        document.documentElement.lang = lang;
        document.documentElement.dir = isArabic ? "rtl" : "ltr";
        document.body.classList.toggle("rtl", isArabic);
    }

    function applyTranslations(lang) {
        const dict = translations[lang] || translations.en;

        // textContent translations
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key] != null) el.textContent = dict[key];
        });

        // innerHTML translations (links/spans)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (dict[key] != null) el.innerHTML = dict[key];
        });

        setDirection(lang);
        setActiveLangButton(lang);
        localStorage.setItem('siteLang', lang);
    }

    // Button click
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            applyTranslations(btn.dataset.lang);
        });
    });

    // Load saved language (default EN)
    const saved = localStorage.getItem('siteLang') || 'en';
    applyTranslations(saved);
});
