/* ============================================================
   animations.js — Alora Labs Interactive Enhancements
   Enhancements: Lenis smooth scroll, custom cursor, GSAP hero
   reveal, magnetic buttons, parallax, tilt, grain, transitions
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────
const isMobile = () => window.innerWidth <= 768;

// Register GSAP plugins if available
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────
// 1. LENIS SMOOTH SCROLL
// ─────────────────────────────────────────────
let lenis = null;

function initLenis() {
  if (isMobile() || typeof Lenis === 'undefined') return;

  // Override native smooth scroll — Lenis takes over
  document.documentElement.style.scrollBehavior = 'auto';

  lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  // Sync with GSAP ticker for perfect ScrollTrigger integration
  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }
  } else {
    // Standalone RAF loop fallback
    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(performance.now());
  }

  // Re-enable anchor link smooth scroll through Lenis
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      }
    });
  });
}

// ─────────────────────────────────────────────
// 2. CUSTOM ANIMATED CURSOR
// ─────────────────────────────────────────────
function initCursor() {
  if (isMobile()) return;

  const ring  = document.querySelector('.cursor-ring');
  const dot   = document.querySelector('.cursor-dot');
  if (!ring || !dot) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX  = mouseX;
  let ringY  = mouseY;
  let isVisible = false;

  // Dark sections where the cursor should switch to cream
  const DARK_SELECTORS = '.svc-hero, .cta-section';

  // ── Dot: snaps instantly to mouse ──────────
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';

    if (!isVisible) {
      isVisible = true;
      ring.style.opacity = '1';
      dot.style.opacity  = '1';
    }

    // Switch to cream on dark backgrounds
    const overDark = !!(e.target && e.target.closest(DARK_SELECTORS));
    ring.classList.toggle('cursor--light', overDark);
    dot.classList.toggle('cursor--light',  overDark);
  });

  // ── Ring: follows with ease (trailing lag) ─
  function animateRing() {
    const ease = 0.1;
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // ── Hide/show on leave/enter ───────────────
  document.addEventListener('mouseleave', () => {
    ring.style.opacity = '0';
    dot.style.opacity  = '0';
    isVisible = false;
  });
  document.addEventListener('mouseenter', () => {
    ring.style.opacity = '1';
    dot.style.opacity  = '1';
  });

  // ── Hover: links & buttons → lavender expand
  const linkEls = document.querySelectorAll(
    'a, button, .btn, .nav-link, .text-link, .footer-link, .contact-info-link, select'
  );
  linkEls.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('cursor-ring--hover');
      dot.classList.add('cursor-dot--hover');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('cursor-ring--hover');
      dot.classList.remove('cursor-dot--hover');
    });
  });

  // ── Hover: images → large "View" ring ─────
  const imageEls = document.querySelectorAll(
    '.work-item, .work-image, .portfolio-project, ' +
    '.philosophy-image, .image-placeholder, .service-detail-visual'
  );
  imageEls.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('cursor-ring--view');
      dot.classList.add('cursor-dot--hidden');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('cursor-ring--view');
      dot.classList.remove('cursor-dot--hidden');
    });
  });
}

// ─────────────────────────────────────────────
// 3. HERO REVEAL — World-Class Sequential Animation
// Inspired by: Active Theory, Resn, Fantasy, Aristide Benoist
// ─────────────────────────────────────────────
function initHeroReveal() {
  if (typeof gsap === 'undefined') return;

  const heroLeft = document.querySelector('.hero-left-content');
  const heroRight = document.querySelector('.hero-right');
  if (!heroLeft) return;

  // ────────────────────────────────────────────
  // TIMELINE — Master sequence for all elements
  // ────────────────────────────────────────────
  const tl = gsap.timeline({ 
    defaults: { ease: 'power3.out' },
    delay: 0.2 
  });

  // ── 1. Logo Badge — Scale + Fade (0s - 0.8s) ──
  const logoBadge = document.querySelector('.hero-logo-badge');
  if (logoBadge) {
    gsap.set(logoBadge, { opacity: 0, scale: 0.85, y: -20 });
    tl.to(logoBadge, { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      duration: 1.0,
      ease: 'power4.out'
    }, 0);
  }

  // ── 2. Tagline — Word-by-word reveal (0.3s - 1.8s) ──
  const tagline = document.querySelector('.hero-tagline');
  if (tagline) {
    tagline.style.animation = 'none';
    tagline.style.opacity = '1';
    
    // Split into words with overflow masks
    const words = tagline.textContent.trim().split(/\s+/);
    tagline.innerHTML = words
      .map((w) => `<span class="word-wrapper"><span class="word-inner">${w}</span></span>`)
      .join(' ');
    
    const wordInners = tagline.querySelectorAll('.word-inner');
    gsap.set(wordInners, { yPercent: 120, opacity: 0 });
    tl.to(wordInners, {
      yPercent: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out'
    }, 0.3);
  }

  // ── 3. Small Editorial Image — Slide up + clip reveal (0.8s - 2.0s) ──
  const smallImage = document.querySelector('.hero-small-image');
  if (smallImage) {
    gsap.set(smallImage, { opacity: 0, y: 60, clipPath: 'inset(100% 0% 0% 0%)' });
    tl.to(smallImage, {
      opacity: 1,
      y: 0,
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.2,
      ease: 'power4.out'
    }, 0.8);
  }

  // ── 4. Subtitle — Line-by-line fade + slide (1.2s - 2.4s) ──
  const subtitle = document.querySelector('.hero-subtitle');
  if (subtitle) {
    subtitle.style.animation = 'none';
    subtitle.style.opacity = '1';
    
    // Split into lines for staggered reveal
    const text = subtitle.textContent;
    const lines = text.split('. ').map(line => line + (line.endsWith('.') ? '' : '.'));
    subtitle.innerHTML = lines
      .map(line => `<span class="subtitle-line">${line}</span>`)
      .join(' ');
    
    const subtitleLines = subtitle.querySelectorAll('.subtitle-line');
    gsap.set(subtitleLines, { opacity: 0, y: 30, rotateX: -15 });
    tl.to(subtitleLines, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power3.out'
    }, 1.2);
  }

  // ── 5. CTA Buttons — Scale bounce in (1.8s - 2.6s) ──
  const cta = document.querySelector('.hero-cta');
  if (cta) {
    cta.style.animation = 'none';
    cta.style.opacity = '1';
    const buttons = cta.querySelectorAll('.btn');
    gsap.set(buttons, { opacity: 0, scale: 0.88, y: 20 });
    tl.to(buttons, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'back.out(1.4)'  // Elastic bounce
    }, 1.8);
  }

  // ── 6. Right Panel Image — Slow reveal with scale (0.5s - 2.5s) ──
  if (heroRight) {
    const rightImg = heroRight.querySelector('.hero-right-img');
    const rightOverlay = heroRight.querySelector('.hero-right-overlay');
    
    if (rightImg) {
      gsap.set(rightImg, { 
        scale: 1.15, 
        opacity: 0,
        clipPath: 'inset(0% 0% 100% 0%)'  // Reveal from top to bottom
      });
      tl.to(rightImg, {
        scale: 1,
        opacity: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 2.0,
        ease: 'power4.out'
      }, 0.5);
    }
    
    if (rightOverlay) {
      gsap.set(rightOverlay, { opacity: 0, y: 40 });
      tl.to(rightOverlay, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power3.out'
      }, 1.8);
    }
  }

  // ── 7. Scroll Indicator — Final fade in (2.4s - 3.2s) ──
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.style.animation = 'none';
    gsap.set(scrollIndicator, { opacity: 0, y: -15 });
    tl.to(scrollIndicator, { 
      opacity: 1, 
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, 2.4);
  }

  // ────────────────────────────────────────────
  // Add subtle breathing animation to logo after reveal
  // ────────────────────────────────────────────
  if (logoBadge) {
    tl.to(logoBadge, {
      y: -8,
      duration: 2.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    }, 3);
  }
}

// ─────────────────────────────────────────────
// 4. MAGNETIC BUTTON HOVER
// ─────────────────────────────────────────────
function initMagneticButtons() {
  if (isMobile()) return;

  const buttons = document.querySelectorAll('.btn');

  buttons.forEach((btn) => {
    let currentX = 0;
    let currentY = 0;
    let targetX  = 0;
    let targetY  = 0;
    let raf      = null;

    const strength = 0.38; // Magnetic pull strength

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
      currentX = lerp(currentX, targetX, 0.18);
      currentY = lerp(currentY, targetY, 0.18);

      btn.style.transform = `translate(${currentX}px, ${currentY}px)`;

      if (Math.abs(currentX - targetX) > 0.05 || Math.abs(currentY - targetY) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        btn.style.transform = `translate(${targetX}px, ${targetY}px)`;
        cancelAnimationFrame(raf);
        raf = null;
      }
    }

    btn.addEventListener('mousemove', (e) => {
      const rect    = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetX = (e.clientX - centerX) * strength;
      targetY = (e.clientY - centerY) * strength;
      if (!raf) raf = requestAnimationFrame(tick);
    });

    btn.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  });
}

// ─────────────────────────────────────────────
// 5. PARALLAX — Orbs + Philosophy image
// ─────────────────────────────────────────────
function initParallax() {
  const orbEls         = document.querySelectorAll('.gradient-orb');
  const philosophyVis  = document.querySelector('.philosophy-visual');

  if (!orbEls.length) return;

  // Mark orbs so CSS float animation is suppressed
  orbEls.forEach((orb) => orb.classList.add('js-parallax'));

  // Orb float parameters
  const floatParams = [
    { ampX: 22, ampY: 18, freqX: 0.28, freqY: 0.22, phaseX: 0,    phaseY: 0    },
    { ampX: 18, ampY: 24, freqX: 0.22, freqY: 0.18, phaseX: 2.1,  phaseY: 1.4  },
    { ampX: 14, ampY: 16, freqX: 0.18, freqY: 0.26, phaseX: 4.2,  phaseY: 3.0  },
  ];

  // Parallax scroll speeds (fraction of scroll distance)
  const scrollSpeeds = [0.07, -0.04, 0.10];

  let startTime = null;

  function updateOrbs(ts) {
    if (!startTime) startTime = ts;
    const t = (ts - startTime) / 1000;
    const scrolled = lenis ? lenis.animatedScroll : window.scrollY;

    orbEls.forEach((orb, i) => {
      const fp     = floatParams[i]  || floatParams[0];
      const speed  = scrollSpeeds[i] || 0.05;

      const fx = Math.sin(t * fp.freqX + fp.phaseX) * fp.ampX;
      const fy = Math.cos(t * fp.freqY + fp.phaseY) * fp.ampY;
      const py = scrolled * speed;

      if (i === 2) {
        // orb-3 has a base translateX(-50%) in CSS — preserve it
        orb.style.transform = `translateX(calc(-50% + ${fx}px)) translateY(${fy + py}px)`;
      } else {
        orb.style.transform = `translate(${fx}px, ${fy + py}px)`;
      }
    });

    requestAnimationFrame(updateOrbs);
  }

  requestAnimationFrame(updateOrbs);

  // Philosophy image — slower scroll than its section text
  if (philosophyVis && !isMobile()) {
    const handlePhilosophyParallax = () => {
      const rect       = philosophyVis.getBoundingClientRect();
      const viewH      = window.innerHeight;
      if (rect.top < viewH && rect.bottom > 0) {
        const progress = (viewH - rect.top) / (viewH + rect.height);
        const offset   = (progress - 0.5) * -55;
        philosophyVis.style.transform = `translateY(${offset}px)`;
      }
    };

    if (lenis) {
      lenis.on('scroll', handlePhilosophyParallax);
    } else {
      window.addEventListener('scroll', handlePhilosophyParallax, { passive: true });
    }
  }
}

// ─────────────────────────────────────────────
// 6. 3D TILT ON CARDS & WORK ITEMS
// ─────────────────────────────────────────────
function initTiltEffects() {
  if (isMobile()) return;

  // Service cards — gentle tilt
  initTiltGroup('.service-card', { maxRot: 5, scale: 1.02, translateZ: 8 });

  // Work items — slightly more expressive
  initTiltGroup('.work-item', { maxRot: 6, scale: 1.02, translateZ: 10 });

  // Portfolio projects
  initTiltGroup('.portfolio-project', { maxRot: 4, scale: 1.01, translateZ: 6 });

  // Value & FAQ cards
  initTiltGroup('.value-card, .faq-item', { maxRot: 4, scale: 1.01, translateZ: 5 });
}

function initTiltGroup(selector, { maxRot = 5, scale = 1.02, translateZ = 8 } = {}) {
  document.querySelectorAll(selector).forEach((card) => {
    let currentRX = 0, currentRY = 0;
    let targetRX  = 0, targetRY  = 0;
    let raf = null;
    let isHovered = false;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
      currentRX = lerp(currentRX, targetRX, 0.12);
      currentRY = lerp(currentRY, targetRY, 0.12);

      card.style.transform =
        `perspective(900px) rotateX(${currentRX}deg) rotateY(${currentRY}deg) ` +
        `translateZ(${isHovered ? translateZ : 0}px) scale(${isHovered ? scale : 1})`;

      const moving =
        Math.abs(currentRX - targetRX) > 0.02 ||
        Math.abs(currentRY - targetRY) > 0.02;

      if (moving || isHovered) {
        raf = requestAnimationFrame(tick);
      } else {
        card.style.transform = '';
        cancelAnimationFrame(raf);
        raf = null;
      }
    }

    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const relX   = (e.clientX - rect.left) / rect.width  - 0.5;  // −0.5 → +0.5
      const relY   = (e.clientY - rect.top)  / rect.height - 0.5;
      targetRX = -relY * maxRot * 2;
      targetRY =  relX * maxRot * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    });

    card.addEventListener('mouseenter', () => {
      isHovered = true;
      card.style.transition = 'box-shadow 0.3s ease';
      if (!raf) raf = requestAnimationFrame(tick);
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      targetRX  = 0;
      targetRY  = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  });
}

// ─────────────────────────────────────────────
// 7. ENHANCED GRADIENT ANIMATION
// Orb color-shift on scroll (handled in updateOrbs via CSS filter hue-rotate)
// ─────────────────────────────────────────────
function initGradientEnhancement() {
  const orbEls = document.querySelectorAll('.gradient-orb');
  if (!orbEls.length) return;

  const handleScroll = () => {
    const scrolled  = lenis ? lenis.animatedScroll : window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress  = Math.min(scrolled / (maxScroll || 1), 1);
    const hue       = progress * 30; // Subtle hue shift: 0→30deg as you scroll

    orbEls.forEach((orb, i) => {
      const offset = i * 5;
      orb.style.filter = `blur(80px) hue-rotate(${hue + offset}deg)`;
    });
  };

  if (lenis) {
    lenis.on('scroll', handleScroll);
  } else {
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
}

// ─────────────────────────────────────────────
// 8. FILM GRAIN TEXTURE OVERLAY (canvas)
// ─────────────────────────────────────────────
function initGrain() {
  return; // grain removed

  resize();
  window.addEventListener('resize', resize, { passive: true });
  drawGrain();
}

// ─────────────────────────────────────────────
// 9. PAGE TRANSITION — Split curtain
// Pure CSS transition + class toggle — no GSAP dependency.
// ENTER: add .curtain-open → top flies UP, bottom flies DOWN.
// EXIT : remove .curtain-open (panels close) → navigate.
// Inspired by Mersi Architecture
// ─────────────────────────────────────────────
function initPageTransitions() {
  const html  = document.documentElement;
  const OPEN_MS  = 880;
  const CLOSE_MS = 580;

  // Reset scroll to top
  window.scrollTo(0, 0);

  // ── ENTER: trigger curtain open on next frame so CSS transition fires ──
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      html.classList.add('curtain-open');
    });
  });

  // ── EXIT: remove open class → panels slide back to cover → navigate ──
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') || href === '/') return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const dest = href;

      html.classList.add('curtain-closing');
      html.classList.remove('curtain-open');

      setTimeout(() => {
        window.location.href = dest;
      }, CLOSE_MS + 40);
    });
  });
}

// ─────────────────────────────────────────────
// 10. GSAP SCROLL REVEAL — World-Class Sequential Reveals
// Enhanced with staggered service item animations
// Inspired by: Resn, Active Theory, Fantasy
// ─────────────────────────────────────────────
function initScrollReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (isMobile()) return; // Skip on mobile for performance

  // ────────────────────────────────────────────
  // Services Section — Sequential Item Reveals
  // ────────────────────────────────────────────
  const servicesSection = document.querySelector('.services-preview');
  if (servicesSection) {
    
    // ── Section Header — Slide from left ──
    const sectionHeader = servicesSection.querySelector('.section-header');
    if (sectionHeader) {
      const label = sectionHeader.querySelector('.section-label');
      const title = sectionHeader.querySelector('.section-title');
      
      if (label) {
        gsap.set(label, { opacity: 0, x: -40 });
        ScrollTrigger.create({
          trigger: label,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(label, {
              opacity: 1,
              x: 0,
              duration: 0.9,
              ease: 'power3.out'
            });
          }
        });
      }
      
      if (title) {
        // Split title into words for stagger
        const titleText = title.textContent;
        const words = titleText.split(' ');
        title.innerHTML = words.map(word => 
          `<span class="title-word" style="display:inline-block;margin-right:0.3em;">${word}</span>`
        ).join('');
        
        const titleWords = title.querySelectorAll('.title-word');
        gsap.set(titleWords, { opacity: 0, y: 40, rotateX: -20 });
        
        ScrollTrigger.create({
          trigger: title,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(titleWords, {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: 'power3.out',
              delay: 0.2
            });
          }
        });
      }
    }
    
    // ── Service List Items — Staggered slide-up reveals ──
    const serviceItems = servicesSection.querySelectorAll('.sl-item');
    serviceItems.forEach((item, index) => {
      const itemInner = item.querySelector('.sl-item-inner');
      const num = item.querySelector('.sl-num');
      const title = item.querySelector('.sl-title');
      
      // Initial state
      gsap.set(item, { 
        opacity: 0, 
        y: 80,
        clipPath: 'inset(0% 0% 100% 0%)'  // Hidden from bottom
      });
      
      if (num) gsap.set(num, { opacity: 0, x: -20 });
      if (title) gsap.set(title, { opacity: 0, x: 30 });
      
      // Reveal on scroll
      ScrollTrigger.create({
        trigger: item,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          
          // Container reveal
          tl.to(item, {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.0,
            ease: 'power4.out'
          });
          
          // Number slide in
          if (num) {
            tl.to(num, {
              opacity: 1,
              x: 0,
              duration: 0.8,
              ease: 'power3.out'
            }, '-=0.7');
          }
          
          // Title slide in from right
          if (title) {
            tl.to(title, {
              opacity: 1,
              x: 0,
              duration: 0.9,
              ease: 'power3.out'
            }, '-=0.6');
          }
        }
      });
    });
    
    // ── CTA Button — Final reveal ──
    const slCta = servicesSection.querySelector('.sl-cta');
    if (slCta) {
      gsap.set(slCta, { opacity: 0, y: 40, scale: 0.92 });
      ScrollTrigger.create({
        trigger: slCta,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(slCta, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            ease: 'back.out(1.3)',
            delay: 0.3
          });
        }
      });
    }
  }

  // ────────────────────────────────────────────
  // Staggered grid reveals (other pages)
  // ────────────────────────────────────────────
  const staggerGroups = [
    { parent: '.services-grid',   children: '.service-card'   },
    { parent: '.values-grid',     children: '.value-card'     },
    { parent: '.approach-grid',   children: '.approach-step'  },
    { parent: '.process-grid',    children: '.process-step'   },
    { parent: '.work-grid',       children: '.work-item'      },
    { parent: '.faq-grid',        children: '.faq-item'       },
    { parent: '.capabilities-grid', children: '.capability-item' },
  ];

  staggerGroups.forEach(({ parent, children }) => {
    const parentEl = document.querySelector(parent);
    if (!parentEl) return;
    const childEls = parentEl.querySelectorAll(children);
    if (!childEls.length) return;

    gsap.fromTo(
      childEls,
      { opacity: 0, y: 35 },
      {
        opacity: 1, y: 0,
        duration: 0.75,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: parentEl,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // Individual section headers
  document.querySelectorAll('.section-header, .page-hero .page-title, .page-hero .page-subtitle').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 25 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // ────────────────────────────────────────────
  // Philosophy Section
  // ────────────────────────────────────────────
  const philosophy = document.querySelector('.philosophy');
  if (philosophy) {
    const philosophyText = philosophy.querySelector('.philosophy-text');
    const philosophyVisual = philosophy.querySelector('.philosophy-visual');
    
    if (philosophyText) {
      const label = philosophyText.querySelector('.section-label');
      const title = philosophyText.querySelector('.philosophy-title');
      const description = philosophyText.querySelector('.philosophy-description');
      const link = philosophyText.querySelector('.text-link');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: philosophyText,
          start: 'top 80%',
          once: true
        }
      });
      
      if (label) {
        gsap.set(label, { opacity: 0, y: 20 });
        tl.to(label, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0);
      }
      
      if (title) {
        gsap.set(title, { opacity: 0, y: 40 });
        tl.to(title, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 0.2);
      }
      
      if (description) {
        gsap.set(description, { opacity: 0, y: 30 });
        tl.to(description, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 0.5);
      }
      
      if (link) {
        gsap.set(link, { opacity: 0, x: -20 });
        tl.to(link, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }, 0.8);
      }
    }
    
    if (philosophyVisual) {
      gsap.set(philosophyVisual, { opacity: 0, scale: 0.9, y: 60 });
      gsap.to(philosophyVisual, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: philosophyVisual,
          start: 'top 80%',
          once: true
        }
      });
    }
  }

  // Portfolio project items (alternate from left/right)
  document.querySelectorAll('.portfolio-project').forEach((project, i) => {
    const isReverse = project.classList.contains('reverse');
    gsap.fromTo(
      project,
      { opacity: 0, x: isReverse ? 40 : -40 },
      {
        opacity: 1, x: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: project,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // ────────────────────────────────────────────
  // CTA Section
  // ────────────────────────────────────────────
  const ctaSection = document.querySelector('.cta-section');
  if (ctaSection) {
    const ctaContent = ctaSection.querySelector('.cta-content');
    if (ctaContent) {
      const title = ctaContent.querySelector('.cta-title');
      const description = ctaContent.querySelector('.cta-description');
      const button = ctaContent.querySelector('.btn');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ctaContent,
          start: 'top 85%',
          once: true
        }
      });
      
      if (title) {
        gsap.set(title, { opacity: 0, y: 40 });
        tl.to(title, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0);
      }
      
      if (description) {
        gsap.set(description, { opacity: 0, y: 30 });
        tl.to(description, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.3);
      }
      
      if (button) {
        gsap.set(button, { opacity: 0, scale: 0.9 });
        tl.to(button, { 
          opacity: 1, 
          scale: 1, 
          duration: 0.7, 
          ease: 'back.out(1.5)' 
        }, 0.6);
      }
    }
  }

  // Story / expertise sections
  document.querySelectorAll('.story-grid, .expertise-content').forEach((el) => {
    const cols = el.children;
    if (cols.length >= 2) {
      gsap.fromTo(cols[0], { opacity: 0, x: -25 }, {
        opacity: 1, x: 0, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' },
      });
      gsap.fromTo(cols[1], { opacity: 0, x: 25 }, {
        opacity: 1, x: 0, duration: 0.9, ease: 'power2.out', delay: 0.15,
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' },
      });
    }
  });
}

// ─────────────────────────────────────────────
// 11. SERVICE HOVER LIST
// mason-wong.com style — hover a service row,
// its image appears right, others dim out
// ─────────────────────────────────────────────
function initServiceHover() {
  const section  = document.querySelector('.services-list');
  if (!section || typeof gsap === 'undefined') return;
  if (isMobile()) return;

  const list     = section.querySelector('.sl-list');
  const items    = gsap.utils.toArray('.sl-item', section);
  const floatImg = section.querySelector('.sl-float-img');
  const panels   = floatImg ? gsap.utils.toArray('.sl-float-inner', floatImg) : [];
  const N        = items.length;
  if (!N || !list) return;

  // ── Initial state ─────────────────────────
  gsap.set(panels,   { opacity: 0 });
  if (floatImg) {
    floatImg.style.opacity = '0';
    floatImg.style.left    = '-9999px'; // off-screen until first hover
    floatImg.style.top     = '-9999px';
  }

  // ── Cursor tracking + lerp loop ───────────
  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  let curX   = mouseX;
  let curY   = mouseY;
  const EASE = 0.095;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  let rafId    = null;
  let isActive = false;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    curX = lerp(curX, mouseX, EASE);
    curY = lerp(curY, mouseY, EASE);
    if (floatImg) {
      floatImg.style.left = curX + 'px';
      floatImg.style.top  = curY + 'px';
    }
    if (isActive) rafId = requestAnimationFrame(tick);
  }

  function startTracking() {
    if (isActive) return;
    isActive = true;
    // Snap immediately on first enter so image doesn't fly in from corner
    curX = mouseX;
    curY = mouseY;
    if (floatImg) {
      floatImg.style.left = curX + 'px';
      floatImg.style.top  = curY + 'px';
    }
    rafId = requestAnimationFrame(tick);
  }

  function stopTracking() {
    isActive = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  // ── Float image visibility ────────────────
  function showFloat() {
    if (!floatImg) return;
    gsap.killTweensOf(floatImg);
    gsap.to(floatImg, { opacity: 1, duration: 0.4, ease: 'power2.out' });
  }

  function hideFloat() {
    if (!floatImg) return;
    gsap.killTweensOf(floatImg);
    gsap.to(floatImg, { opacity: 0, duration: 0.35, ease: 'power2.inOut' });
  }

  // ── Panel crossfade ───────────────────────
  let activeIdx = -1;

  function showPanel(idx) {
    if (idx === activeIdx) return;
    const prev = activeIdx >= 0 ? panels[activeIdx] : null;
    const next = panels[idx];
    if (!next) return;

    gsap.killTweensOf([prev, next].filter(Boolean));

    if (prev) {
      gsap.to(prev, { opacity: 0, duration: 0.35, ease: 'power2.inOut' });
    }
    gsap.fromTo(next,
      { opacity: 0, scale: 1.06 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
    );

    activeIdx = idx;
  }

  function hidePanels() {
    gsap.killTweensOf(panels);
    gsap.to(panels, { opacity: 0, duration: 0.3, ease: 'power2.inOut' });
    activeIdx = -1;
  }

  // ── Dim / restore items ───────────────────
  function dimAll(except) {
    items.forEach((item, j) => {
      gsap.to(item, {
        opacity: j === except ? 1 : 0.18,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  }

  function restoreAll() {
    gsap.to(items, { opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.025 });
  }

  // ── Wire up items ─────────────────────────
  items.forEach((item, i) => {
    item.addEventListener('mouseenter', () => {
      item.classList.add('is-hovered');
      startTracking();
      showFloat();
      showPanel(i);
      dimAll(i);
    });

    item.addEventListener('mouseleave', () => {
      item.classList.remove('is-hovered');
    });
  });

  // ── List-level leave — full teardown ─────
  list.addEventListener('mouseleave', () => {
    stopTracking();
    hideFloat();
    hidePanels();
    restoreAll();
  });
}

// ─────────────────────────────────────────────
// 12. WORK SCROLL GALLERY
// aim.obys.agency-style pinned image sequence
// ─────────────────────────────────────────────
function initWorkGallery() {
  const section  = document.querySelector('.work-gallery');
  if (!section)  return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const pinWrap       = section.querySelector('.wg-pin-wrap');
  const slides        = gsap.utils.toArray('.wg-slide', section);
  const dots          = section.querySelectorAll('.wg-dot');
  const counterCur    = section.querySelector('.wg-counter-current');
  const progressBar   = section.querySelector('.wg-progress-bar');
  const ctaEl         = null; // CTA is now below the gallery, not overlaid
  const N             = slides.length;

  if (!N || !pinWrap) return;

  // ── Mobile: skip pinning, CSS handles layout ──
  if (isMobile()) return;

  // ── Total pinned scroll: N full viewports ────
  // (slide 0 visible on enter, then N-1 transitions each ~1vh deep)
  const scrollDist = () => window.innerHeight * N;

  // ── Initial GSAP states — all slides hidden until pin fires ──
  slides.forEach((slide, i) => {
    const imgInner = slide.querySelector('.wg-slide-img-inner');
    const info     = slide.querySelector('.wg-slide-info');

    // Slide 0 gets zIndex priority but starts invisible — revealed in onEnter
    gsap.set(slide,    { opacity: 0, zIndex: i === 0 ? 2 : 1 });
    gsap.set(imgInner, { scale: i === 0 ? 1 : 1.06 });
    gsap.set(info,     { opacity: 0, y: 18 });
  });

  let activeIndex = 0;

  // ── Counter flip animation ────────────────────
  function flipCounter(nextNum) {
    if (!counterCur) return;
    const label = String(nextNum).padStart(2, '0');
    if (counterCur.textContent === label) return;

    gsap.to(counterCur, {
      opacity: 0, y: -10, duration: 0.18, ease: 'power2.in',
      onComplete() {
        counterCur.textContent = label;
        gsap.fromTo(counterCur,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
        );
      },
    });
  }

  // ── Dot update ────────────────────────────────
  function updateDots(index) {
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  // ── Core transition between slides ───────────
  function transitionTo(nextIndex) {
    if (nextIndex === activeIndex) return;

    const prev      = slides[activeIndex];
    const next      = slides[nextIndex];
    const forward   = nextIndex > activeIndex;
    const prevImg   = prev.querySelector('.wg-slide-img-inner');
    const nextImg   = next.querySelector('.wg-slide-img-inner');
    const prevInfo  = prev.querySelector('.wg-slide-info');
    const nextInfo  = next.querySelector('.wg-slide-info');

    // Kill any in-flight tweens so they don't fight each other
    gsap.killTweensOf([prev, next, prevImg, nextImg, prevInfo, nextInfo].filter(Boolean));

    // Layer order: incoming on top
    gsap.set(next, { zIndex: 3 });
    gsap.set(prev, { zIndex: 2 });

    // ── EXIT: outgoing slide ──────────────────
    gsap.to(prev, {
      opacity: 0,
      duration: 0.65,
      ease: 'power2.inOut',
    });
    if (prevImg) {
      gsap.to(prevImg, {
        scale: forward ? 0.91 : 1.08,
        duration: 0.75,
        ease: 'power2.inOut',
      });
    }
    if (prevInfo) {
      gsap.to(prevInfo, {
        opacity: 0,
        y: forward ? -14 : 14,
        duration: 0.28,
        ease: 'power2.in',
      });
    }

    // ── ENTER: incoming slide ─────────────────
    // Snap the start state before animating in
    if (nextImg) gsap.set(nextImg, { scale: forward ? 1.08 : 0.91 });
    if (nextInfo) gsap.set(nextInfo, { opacity: 0, y: forward ? 24 : -24 });

    gsap.to(next, {
      opacity: 1,
      duration: 0.7,
      ease: 'power2.out',
    });
    if (nextImg) {
      gsap.to(nextImg, {
        scale: 1,
        duration: 1.1,
        ease: 'power2.out',
      });
    }
    if (nextInfo) {
      gsap.to(nextInfo, {
        opacity: 1, y: 0,
        duration: 0.55,
        delay: 0.22,
        ease: 'power2.out',
      });
    }

    // Reset prev zIndex after animation completes
    gsap.set(prev, { zIndex: 1, delay: 0.9 });

    // ── Update chrome ─────────────────────────
    flipCounter(nextIndex + 1);
    updateDots(nextIndex);

    // ── CTA: show only on last slide ──────────
    if (ctaEl) {
      ctaEl.classList.toggle('is-visible', nextIndex === N - 1);
    }

    activeIndex = nextIndex;
  }

  // ── ScrollTrigger — pin + drive transitions ──
  ScrollTrigger.create({
    trigger: pinWrap,
    start: 'top top',
    end:   () => `+=${scrollDist()}`,
    pin:   true,
    pinSpacing: true,
    anticipatePin: 1,

    onUpdate(self) {
      const p = self.progress;

      // Progress bar (direct style for perf — no tween needed)
      if (progressBar) {
        progressBar.style.transform = `scaleX(${p})`;
      }

      // Which slide index are we at?
      // Progress 0→1 maps linearly to slides 0→N-1
      const rawFloat  = p * N;
      const target    = Math.min(Math.floor(rawFloat), N - 1);

      if (target !== activeIndex) {
        transitionTo(target);
      }
    },

    onEnter() {
      // Reveal first slide + its info when gallery pins
      const firstSlide = slides[0];
      const firstInfo  = firstSlide && firstSlide.querySelector('.wg-slide-info');

      if (firstSlide) {
        gsap.to(firstSlide, { opacity: 1, duration: 0.7, ease: 'power2.out' });
      }
      if (firstInfo) {
        gsap.fromTo(firstInfo,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', delay: 0.25 }
        );
      }
    },

    onLeave() {
      // Gallery fully consumed — ensure CTA visible
      if (ctaEl) ctaEl.classList.add('is-visible');
    },

    onEnterBack() {
      // Scrolling back up into gallery — hide CTA unless on last slide
      if (ctaEl && activeIndex < N - 1) {
        ctaEl.classList.remove('is-visible');
      }
    },
  });

  // ── Refresh on resize so pin distance recalculates ──
  window.addEventListener('resize', () => {
    if (!isMobile()) ScrollTrigger.refresh();
  }, { passive: true });
}

// ─────────────────────────────────────────────
// 13. GLITCH BACKGROUND  (index.html hero only)
// mason-wong.com style: dark field + vertical
// light columns + RGB-split glitch slices +
// scan lines + animated film grain
// ─────────────────────────────────────────────
function initGlitchBackground() {
  const canvas = document.getElementById('glitch-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero');
  if (!hero) return;

  // Half-res for performance — still looks great
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  let W, H;

  function resize() {
    W = hero.offsetWidth;
    H = hero.offsetHeight;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(DPR, DPR);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // ── Vertical luminance columns (mason-wong vertical streak look) ──
  const COL_COUNT = 16;
  const cols = Array.from({ length: COL_COUNT }, () => ({
    x:      Math.random(),
    w:      0.03 + Math.random() * 0.08,
    phase:  Math.random() * Math.PI * 2,
    speed:  0.12 + Math.random() * 0.18,  // cycles/second — slow breathing
    peak:   0.1 + Math.random() * 0.18,   // boosted brightness
    // subtle warm-tinted or cool columns, like mason-wong's dark teal tones
    rgb:    Math.random() > 0.5
              ? [80, 110, 78]   // warm green
              : [65, 88, 90],   // cool teal
  }));

  // ── Film grain — pre-rendered on a small off-screen canvas ──
  const GRAIN_SIZE = 256;
  const grainOffscreen = document.createElement('canvas');
  grainOffscreen.width  = GRAIN_SIZE;
  grainOffscreen.height = GRAIN_SIZE;
  const gCtx = grainOffscreen.getContext('2d');

  function refreshGrain() {
    const id = gCtx.createImageData(GRAIN_SIZE, GRAIN_SIZE);
    const d  = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 200) | 0;   // bright range — not just dark speckles
      d[i]     = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = (30 + Math.random() * 140) | 0;  // high alpha = clearly visible
    }
    gCtx.putImageData(id, 0, 0);
  }
  refreshGrain();

  // ── Glitch slice state ──
  let glitchCooldown = 2 + Math.random() * 3;
  const glitches = [];

  function spawnGlitch() {
    const n = 1 + (Math.random() * 4 | 0);
    for (let i = 0; i < n; i++) {
      glitches.push({
        y:    Math.random() * H,
        h:    1 + Math.random() * 16,
        dx:   (Math.random() - 0.5) * 28,
        rgbR: (Math.random() - 0.5) * 7,
        rgbB: (Math.random() - 0.5) * 7,
        life: 0.055 + Math.random() * 0.11,
        age:  0,
      });
    }
  }

  let lastTs = 0;
  let frameN = 0;
  let grainTick = 0;

  function draw(ts) {
    requestAnimationFrame(draw);

    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;
    frameN++;
    const t = ts * 0.001;

    // ── 1. Dark base ──────────────────────────
    ctx.fillStyle = '#0d0f0d';
    ctx.fillRect(0, 0, W, H);

    // ── 2. Vertical soft-light columns ───────
    for (const col of cols) {
      const cx = col.x * W;
      const hw = (col.w  * W) * 0.5;
      // Breathing pulse: amplitude ~0.45-1
      const pulse = 0.45 + 0.55 * Math.sin(t * col.speed * Math.PI * 2 + col.phase);
      const a     = col.peak * pulse;

      const [r, g, b] = col.rgb;
      const grad = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
      grad.addColorStop(0,    `rgba(${r},${g},${b},0)`);
      grad.addColorStop(0.25, `rgba(${r},${g},${b},${(a * 0.5).toFixed(3)})`);
      grad.addColorStop(0.5,  `rgba(${r+18},${g+18},${b+12},${a.toFixed(3)})`);
      grad.addColorStop(0.75, `rgba(${r},${g},${b},${(a * 0.5).toFixed(3)})`);
      grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);

      ctx.fillStyle = grad;
      ctx.fillRect(cx - hw, 0, hw * 2, H);
    }

    // ── 3. Horizontal scan lines ──────────────
    // Only every other frame — imperceptible skip, big perf gain
    if (frameN % 2 === 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.09)';
      for (let y = 0; y < H; y += 3) {
        ctx.fillRect(0, y, W, 1);
      }
    }

    // ── 4. Glitch slices ──────────────────────
    glitchCooldown -= dt;
    if (glitchCooldown <= 0) {
      spawnGlitch();
      glitchCooldown = 2.2 + Math.random() * 4.8;
    }

    for (let i = glitches.length - 1; i >= 0; i--) {
      const g = glitches[i];
      g.age += dt;
      if (g.age >= g.life) { glitches.splice(i, 1); continue; }

      const progress = g.age / g.life;
      // Quick flash in, slow fade out
      const alpha = progress < 0.25
        ? progress / 0.25
        : 1 - (progress - 0.25) / 0.75;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, g.y, W, g.h);
      ctx.clip();

      // RGB channel split
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = alpha * 0.45;
      ctx.fillStyle   = 'rgba(255,30,30,0.18)';
      ctx.fillRect(g.rgbR, g.y, W, g.h);
      ctx.fillStyle   = 'rgba(30,30,255,0.18)';
      ctx.fillRect(g.rgbB, g.y, W, g.h);

      // Horizontal pixel shift
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle   = 'rgba(210,210,210,0.12)';
      ctx.fillRect(g.dx, g.y, W, g.h);

      ctx.restore();
    }


    // ── 6. Radial vignette ────────────────────
    const vig = ctx.createRadialGradient(
      W * 0.5, H * 0.5, H * 0.22,
      W * 0.5, H * 0.5, H * 0.9
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  requestAnimationFrame(draw);
}

// ─────────────────────────────────────────────
// 13. SERVICES PAGE — Mersi-style hero + panels
//
// On load  : "Services" reveals letter-by-letter
//            at bottom of the contained frame
// On scroll: frame scales 0.78 → 1.0, filling the
//            viewport from its dark stage background.
//            Title fades out as image fills screen.
// After    : stacked service panels slide up in turn
// ─────────────────────────────────────────────
function initServicesPage() {
  const hero = document.querySelector('.svc-hero');
  if (!hero) return;
  if (typeof gsap === 'undefined') return;

  const frame     = hero.querySelector('.svc-hero-frame');
  const label     = hero.querySelector('.svc-hero-label');
  const titleEl   = hero.querySelector('.svc-hero-title');
  const scrollCue = label ? label.querySelector('.svc-scroll-cue') : null;

  // ── 1. Build mask-reveal structure ──────────────────────
  // Each letter gets an overflow:hidden wrapper so it slides
  // up through the clip — no opacity change, purely positional.
  // This is the same technique used on Mersi Architecture.
  if (titleEl) {
    const raw = titleEl.textContent.trim();
    titleEl.innerHTML = raw.split('').map(ch =>
      ch === ' '
        ? '<span class="svc-letter-space">&nbsp;</span>'
        : `<span class="svc-letter-wrap"><span class="svc-letter">${ch}</span></span>`
    ).join('');
    gsap.set(titleEl, { opacity: 1 }); // container visible; letters hidden below clip
  }

  const letters = hero.querySelectorAll('.svc-letter');

  // Push every letter below its clip mask — GSAP owns this state
  if (letters.length) {
    gsap.set(letters, { yPercent: 105 });
  }

  // ── 2. Mask-reveal on load — letters emerge from below ──
  // Pure translateY through overflow:hidden — no opacity fade.
  // power4.out: fast lift, elegant slow settle (editorial feel).
  const loadTl = gsap.timeline({ delay: 0.5 });

  if (letters.length) {
    loadTl.to(letters, {
      yPercent: 0,
      duration: 1.05,
      ease: 'power4.out',
      stagger: 0.07,
    }, 0);
  }

  // Scroll cue appears just after the last letter settles
  if (scrollCue) {
    const cueStart = letters.length * 0.07 + 0.25;
    loadTl.to(scrollCue, {
      opacity: 1,
      duration: 0.7,
      ease: 'power2.out',
    }, cueStart);
  }

  // ── 3. Scroll-driven frame expansion (desktop only) ──
  if (isMobile() || typeof ScrollTrigger === 'undefined') return;
  if (!frame) return;

  // Pin the hero for one full viewport of scroll.
  // The timeline scrubs the frame from scale(0.78) → scale(1).
  // In the final third of the expansion, the title fades out
  // so the image arrives full-screen clean.
  const expandTl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '+=100%',       // one viewport of scroll space
      scrub: 1.2,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // Frame expands across the full scroll range
  expandTl.to(frame, {
    scale: 1,
    ease: 'none',
    duration: 1,
  }, 0);

  // Title + scroll cue fade out in the last ~30% of expansion
  if (label) {
    expandTl.to(label, {
      opacity: 0,
      ease: 'power1.in',
      duration: 0.3,
    }, 0.65);
  }
  if (scrollCue) {
    expandTl.to(scrollCue, {
      opacity: 0,
      ease: 'power1.in',
      duration: 0.2,
    }, 0);
  }

  // ── 4. Stacked service panels slide up in sequence ──
  const panelsWrap = document.querySelector('.svc-panels');
  const panels     = gsap.utils.toArray('.svc-panel');
  if (!panelsWrap || panels.length < 2) return;

  // Later panels sit on top (higher z-index)
  panels.forEach((panel, i) => {
    panel.style.zIndex = i + 1;
  });

  // All panels after the first start below the viewport
  gsap.set(panels.slice(1), { yPercent: 100 });

  // Each panel gets exactly one viewport of scroll space to slide in
  const slideTl = gsap.timeline({
    scrollTrigger: {
      trigger: panelsWrap,
      start: 'top top',
      end: () => `+=${(panels.length - 1) * window.innerHeight}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  panels.forEach((panel, i) => {
    if (i === 0) return;
    slideTl.to(panel, { yPercent: 0, ease: 'none' });
  });
}

// ─────────────────────────────────────────────
// INIT — wire everything up on DOM ready
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ① Lenis must boot first (scroll basis for everything else)
  initLenis();

  // ② Visual layer
  initGlitchBackground(); // Hero glitch canvas (index.html only)
  initGrain();
  initPageTransitions();

  // ③ Cursor (desktop only)
  initCursor();

  // ④ Hero reveal (index.html only — gracefully skips elsewhere)
  initHeroReveal();

  // ⑤ Interactivity
  initMagneticButtons();
  initTiltEffects();

  // ⑥ Parallax & gradient (after Lenis is ready)
  setTimeout(() => {
    initParallax();
    initGradientEnhancement();
  }, 50);

  // ⑦ Scroll-triggered reveals (GSAP)
  initScrollReveal();

  // ⑧ Service hover list (index.html only)
  initServiceHover();

  // ⑨ Work scroll gallery (index.html only)
  initWorkGallery();

  // ⑩ Services page immersive panels
  initServicesPage();

  // Recalculate all ScrollTrigger positions after fonts + layout settle
  // (DOMContentLoaded fires before webfonts render, causing wrong measurements)
  if (typeof ScrollTrigger !== 'undefined') {
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
    // Second pass for late-loading webfonts (e.g. Google Fonts)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }

  // Disable Lenis on resize to mobile, re-enable on desktop
  window.addEventListener('resize', () => {
    if (lenis && isMobile()) {
      lenis.destroy();
      lenis = null;
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }, { passive: true });

});
