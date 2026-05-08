// Announcement banner — scroll-away + dismiss
(function () {
    const banner  = document.getElementById('announcement-banner');
    const closeBtn = document.getElementById('announcement-close');
    const nav     = document.querySelector('.nav');

    if (!banner || !nav) return;

    function updateNavTop() {
        const bannerH   = banner.offsetHeight;
        const scrolled  = window.scrollY;
        const offset    = Math.max(0, bannerH - scrolled);
        nav.style.top   = offset + 'px';
    }

    // Set on load and every scroll tick
    updateNavTop();
    window.addEventListener('scroll', updateNavTop, { passive: true });
    window.addEventListener('resize', updateNavTop, { passive: true });

    function dismissBanner() {
        banner.classList.add('is-hidden');
        nav.style.top = '0';
        window.removeEventListener('scroll', updateNavTop);
    }

    if (closeBtn) closeBtn.addEventListener('click', dismissBanner);
}());

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// NOTE: Scroll-reveal animations are handled by GSAP ScrollTrigger in animations.js
// The IntersectionObserver approach has been replaced for smoother, staggered reveals.

// Active navigation state on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// NOTE: Parallax for hero orbs is handled by animations.js (smooth organic float + scroll depth).

// Mobile hamburger menu
(function () {
    const hamburger = document.getElementById('nav-hamburger');
    const drawer    = document.getElementById('nav-drawer');
    const backdrop  = document.getElementById('nav-drawer-backdrop');

    if (!hamburger || !drawer || !backdrop) return;

    function openDrawer() {
        hamburger.classList.add('is-open');
        drawer.classList.add('is-open');
        backdrop.classList.add('is-open');
        hamburger.setAttribute('aria-expanded', 'true');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        hamburger.classList.remove('is-open');
        drawer.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
        if (drawer.classList.contains('is-open')) {
            closeDrawer();
        } else {
            openDrawer();
        }
    });

    backdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
            closeDrawer();
        }
    });

    // Close drawer when a link inside is clicked
    drawer.querySelectorAll('.nav-drawer-link').forEach(function (link) {
        link.addEventListener('click', closeDrawer);
    });
}());
