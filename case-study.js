/* ============================================================
   ALORA LABS — Case Study shared JS
   Parallax hero + scroll-driven section animations.
   ============================================================ */

(function () {
  function initCaseStudy() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      requestAnimationFrame(initCaseStudy);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* ── 1. Hero parallax ── */
    var heroImg = document.querySelector('.cs-hero-img');
    if (heroImg) {
      gsap.fromTo(
        heroImg,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: '.cs-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    }

    /* ── 2. Hero content entrance (service label + client name) ── */
    var heroService = document.querySelector('.cs-hero-service');
    var heroClient  = document.querySelector('.cs-hero-client');
    var heroYear    = document.querySelector('.cs-hero-year');

    if (heroService && heroClient) {
      var heroTl = gsap.timeline({ delay: 0.15 });
      heroTl
        .fromTo(heroService,
          { opacity: 0, y: 14, letterSpacing: '0.35em' },
          { opacity: 1, y: 0, letterSpacing: '0.22em', duration: 0.9, ease: 'power2.out' }
        )
        .fromTo(heroClient,
          { opacity: 0, y: 28, filter: 'blur(4px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out' },
          '-=0.5'
        );
      if (heroYear) {
        heroTl.fromTo(heroYear,
          { opacity: 0 },
          { opacity: 1, duration: 0.7, ease: 'power2.out' },
          '-=0.6'
        );
      }
    }

    /* ── 3. Breadcrumb ── */
    var breadcrumb = document.querySelector('.cs-breadcrumb-inner');
    if (breadcrumb) {
      gsap.fromTo(breadcrumb,
        { opacity: 0, x: -16 },
        {
          opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: breadcrumb, start: 'top 92%', once: true },
        }
      );
    }

    /* ── 4. Overview section ── */
    var overviewLabel    = document.querySelector('.cs-overview-label');
    var overviewHeadline = document.querySelector('.cs-overview-headline');
    var overviewBody     = document.querySelector('.cs-overview-body');
    var metaRows         = document.querySelectorAll('.cs-meta-row');

    if (overviewLabel) {
      gsap.fromTo(overviewLabel,
        { opacity: 0, x: -20 },
        {
          opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: overviewLabel, start: 'top 88%', once: true },
        }
      );
    }
    if (overviewHeadline) {
      gsap.fromTo(overviewHeadline,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: overviewHeadline, start: 'top 90%', once: true },
        }
      );
    }
    if (overviewBody) {
      gsap.fromTo(overviewBody,
        { opacity: 0, y: 16 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: overviewBody, start: 'top 90%', once: true },
        }
      );
    }
    if (metaRows.length) {
      gsap.fromTo(metaRows,
        { opacity: 0, x: 18 },
        {
          opacity: 1, x: 0, duration: 0.55, stagger: 0.09, ease: 'power2.out',
          scrollTrigger: { trigger: metaRows[0], start: 'top 88%', once: true },
        }
      );
    }

    /* ── 5. Work section headers ── */
    var workHeaders = document.querySelectorAll('.cs-work-header');
    workHeaders.forEach(function (header) {
      var label = header.querySelector('.cs-work-label');
      var count = header.querySelector('.cs-work-count');
      if (label) {
        gsap.fromTo(label,
          { opacity: 0, x: -16 },
          {
            opacity: 1, x: 0, duration: 0.65, ease: 'power2.out',
            scrollTrigger: { trigger: header, start: 'top 90%', once: true },
          }
        );
      }
      if (count) {
        gsap.fromTo(count,
          { opacity: 0 },
          {
            opacity: 1, duration: 0.5, ease: 'power2.out',
            scrollTrigger: { trigger: header, start: 'top 90%', once: true },
          }
        );
      }
    });

    /* ── 6. Masonry images — photo developing effect ── */
    var masonryItems = document.querySelectorAll('.cs-masonry-item');
    if (masonryItems.length) {
      ScrollTrigger.batch(masonryItems, {
        onEnter: function (batch) {
          gsap.fromTo(batch,
            {
              opacity: 0,
              scale: 0.96,
              filter: 'brightness(1.5) saturate(0)',
            },
            {
              opacity: 1,
              scale: 1,
              filter: 'brightness(1) saturate(1)',
              duration: 0.85,
              stagger: 0.07,
              ease: 'power2.out',
            }
          );
        },
        once: true,
        start: 'top 93%',
      });
    }

    /* ── 7. Pair items (2-col grids) ── */
    var pairItems = document.querySelectorAll('.cs-work-pair-item');
    if (pairItems.length) {
      ScrollTrigger.batch(pairItems, {
        onEnter: function (batch) {
          gsap.fromTo(batch,
            {
              opacity: 0,
              y: 32,
              filter: 'brightness(1.4) saturate(0)',
            },
            {
              opacity: 1,
              y: 0,
              filter: 'brightness(1) saturate(1)',
              duration: 0.9,
              stagger: 0.12,
              ease: 'power3.out',
            }
          );
        },
        once: true,
        start: 'top 90%',
      });
    }

    /* ── 8. Single work image ── */
    var singleImgs = document.querySelectorAll('.cs-work-single');
    singleImgs.forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 28, filter: 'brightness(1.4) saturate(0)' },
        {
          opacity: 1, y: 0, filter: 'brightness(1) saturate(1)',
          duration: 1.0, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    });

    /* ── 9. Full-bleed feature image subtle parallax ── */
    var featureImg = document.querySelector('.cs-feature-img img');
    if (featureImg) {
      gsap.fromTo(featureImg,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: {
            trigger: '.cs-feature-img',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        }
      );
    }

    /* ── 10. Next project reveal ── */
    var csNext = document.querySelector('.cs-next');
    if (csNext) {
      var nextText = csNext.querySelector('.cs-next-text');
      var nextImg  = csNext.querySelector('.cs-next-img');
      if (nextText) {
        gsap.fromTo(nextText,
          { opacity: 0, x: -24 },
          {
            opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: csNext, start: 'top 85%', once: true },
          }
        );
      }
      if (nextImg) {
        gsap.fromTo(nextImg,
          { opacity: 0, scale: 1.04, filter: 'brightness(1.3) saturate(0)' },
          {
            opacity: 1, scale: 1, filter: 'brightness(1) saturate(1)',
            duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: csNext, start: 'top 85%', once: true },
          }
        );
      }
    }

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCaseStudy);
  } else {
    initCaseStudy();
  }
})();
