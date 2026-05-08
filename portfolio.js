/* ─── Portfolio: Tabs + Accordion + Lightbox ────────────── */
(function () {
    'use strict';

    /* ── Tabs ──────────────────────────────────────────────── */
    const tabs   = document.querySelectorAll('.pf-tab');
    const panels = document.querySelectorAll('.pf-panel');

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(function (t)   { t.classList.remove('pf-tab--active'); });
            panels.forEach(function (p) { p.classList.remove('pf-panel--active'); });
            tab.classList.add('pf-tab--active');
            const panel = document.getElementById('pf-panel-' + tab.dataset.tab);
            if (panel) panel.classList.add('pf-panel--active');
        });
    });

    /* ── Accordion ─────────────────────────────────────────── */
    document.querySelectorAll('.pf-acc-header').forEach(function (header) {
        header.addEventListener('click', function () {
            const item = header.closest('.pf-acc-item');
            const body = header.nextElementSibling;   // .pf-acc-body
            const inner = body.querySelector('.pf-acc-inner');
            const isOpen = item.classList.contains('is-open');

            if (isOpen) {
                // Collapse: fix height → 0
                body.style.height = body.scrollHeight + 'px';
                requestAnimationFrame(function () {
                    body.style.height = '0';
                });
                item.classList.remove('is-open');
                header.setAttribute('aria-expanded', 'false');
            } else {
                // Expand: 0 → scrollHeight → auto
                body.style.height = inner.scrollHeight + 'px';
                body.addEventListener('transitionend', function done() {
                    body.style.height = 'auto';
                    body.removeEventListener('transitionend', done);
                });
                item.classList.add('is-open');
                header.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ── Lightbox ──────────────────────────────────────────── */
    const lightbox   = document.getElementById('pf-lightbox');
    const lbImg      = document.getElementById('pf-lb-img');
    const lbTitle    = document.getElementById('pf-lb-title');
    const lbCategory = document.getElementById('pf-lb-category');
    const lbCounter  = document.getElementById('pf-lb-counter');
    const btnClose   = document.getElementById('pf-lb-close');
    const btnPrev    = document.getElementById('pf-lb-prev');
    const btnNext    = document.getElementById('pf-lb-next');

    let cards   = [];
    let current = 0;

    function openLightbox(clickedCard) {
        // Scope to the open accordion section (or design panel)
        const accItem = clickedCard.closest('.pf-acc-item');
        if (accItem) {
            cards = Array.from(accItem.querySelectorAll('.pf-card'));
        } else {
            const panel = document.querySelector('.pf-panel--active');
            cards = panel ? Array.from(panel.querySelectorAll('.pf-card')) : [];
        }
        current = cards.indexOf(clickedCard);
        if (current === -1) current = 0;
        renderLightbox();
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        btnClose.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    function renderLightbox() {
        const card = cards[current];
        if (!card) return;
        lbImg.style.opacity    = '0';
        lbImg.src              = card.dataset.src;
        lbImg.alt              = card.dataset.title;
        lbTitle.textContent    = card.dataset.title;
        lbCategory.textContent = card.dataset.category;
        lbCounter.textContent  = (current + 1) + ' / ' + cards.length;
        lbImg.onload = function () { lbImg.style.opacity = '1'; };
        if (lbImg.complete) lbImg.style.opacity = '1';
    }

    function prev() { current = (current - 1 + cards.length) % cards.length; renderLightbox(); }
    function next() { current = (current + 1) % cards.length; renderLightbox(); }

    // Event delegation for "View fullsize"
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.pf-card-view');
        if (!btn) return;
        e.stopPropagation();
        openLightbox(btn.closest('.pf-card'));
    });

    btnClose.addEventListener('click', closeLightbox);
    btnPrev.addEventListener('click', prev);
    btnNext.addEventListener('click', next);

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape')     closeLightbox();
        if (e.key === 'ArrowLeft')  prev();
        if (e.key === 'ArrowRight') next();
    });

    let touchStartX = 0;
    lightbox.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
    }, { passive: true });

}());
