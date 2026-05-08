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
