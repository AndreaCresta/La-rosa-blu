/**
 * La Rosa Blu — Digital Atelier Script
 * GSAP scroll animations  ×  Navbar intelligence  ×  Native scroll
 */

/* ── 1. Add js-ready class ──────────────────────────────── */
document.documentElement.classList.add('js-ready');

/* ── 2. Native smooth scroll helper ────────────────────── */
function scrollToTarget(id) {
    const el = document.querySelector(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
}

/* ── 3. Anchor link interception ────────────────────────── */
document.querySelectorAll('.nav-anchor').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        e.preventDefault();
        closeDrawer();
        scrollToTarget(href);
    });
});

/* ── 4. Navbar — hide/show on scroll direction ──────────── */
const nav = document.getElementById('mainNav');
let lastScroll = 0;
let ticking = false;

function handleNavScroll() {
    const current = window.scrollY;

    if (current > 80) {
        nav.classList.add('nav--scrolled');
    } else {
        nav.classList.remove('nav--scrolled');
        nav.classList.remove('nav--hidden');
    }

    if (current > 300) {
        if (current > lastScroll + 4) {
            nav.classList.add('nav--hidden');
        } else if (current < lastScroll - 4) {
            nav.classList.remove('nav--hidden');
        }
    }

    lastScroll = current;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(handleNavScroll); ticking = true; }
}, { passive: true });

/* ── 5. Mobile drawer ───────────────────────────────────── */
const hamburger = document.getElementById('navHamburger');
const drawer = document.getElementById('navDrawer');
const drawerClose = document.getElementById('navDrawerClose');

function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
});

drawerClose?.addEventListener('click', closeDrawer);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
});

/* ── 6. GSAP Animations ─────────────────────────────────── */
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Set initial hidden states via JS (not CSS) so elements are
    // always visible if GSAP fails to load
    gsap.set('.reveal-mask-inner', { yPercent: 105 });
    gsap.set('.reveal:not(#hero .reveal)', { opacity: 0, y: 30 });
    gsap.set('.reveal-left', { opacity: 0, x: -40 });
    gsap.set('.reveal-right', { opacity: 0, x: 40 });
    gsap.set('.reveal-scale', { opacity: 0, y: 20, scale: .94 });

    const maskInners = document.querySelectorAll('.reveal-mask-inner');
    if (maskInners.length) {
        gsap.fromTo(maskInners,
            { yPercent: 105 },
            { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: .12, delay: .2 }
        );
    }

    // Hero kicker + body + CTA
    const heroReveal = document.querySelectorAll('#hero .reveal');
    if (heroReveal.length) {
        gsap.fromTo(heroReveal,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .15, delay: .65 }
        );
    }

    // Hero parallax on image (desktop only)
    const heroImg = document.getElementById('heroImg');
    if (heroImg && window.innerWidth > 991) {
        gsap.to(heroImg, {
            yPercent: 20, ease: 'none',
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
        });
    }

    // Generic reveal on scroll
    function makeReveal(selector, from) {
        document.querySelectorAll(selector).forEach(el => {
            if (el.closest('#hero')) return;
            gsap.fromTo(el,
                { opacity: 0, ...from },
                {
                    opacity: 1, x: 0, y: 0, scale: 1,
                    duration: .85, ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
                }
            );
        });
    }

    makeReveal('.reveal', { y: 30 });
    makeReveal('.reveal-left', { x: -40 });
    makeReveal('.reveal-right', { x: 40 });
    makeReveal('.reveal-scale', { scale: .94, y: 20 });

    // Service panels stagger
    const panels = document.querySelectorAll('.service-panel');
    if (panels.length) {
        gsap.fromTo(panels,
            { opacity: 0, y: 40, scale: .96 },
            {
                opacity: 1, y: 0, scale: 1, duration: .9, ease: 'power3.out', stagger: .15,
                scrollTrigger: { trigger: '.services__grid', start: 'top 82%' }
            }
        );
    }

    // Testimonials stagger
    const testiCards = document.querySelectorAll('.testi-card');
    if (testiCards.length) {
        gsap.fromTo(testiCards,
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .14,
                scrollTrigger: { trigger: '#testimonials .testimonials__grid', start: 'top 85%' }
            }
        );
    }
}

/* ── 7. SVG stroke animation ────────────────────────────── */
const svgIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
}, { threshold: .3 });

document.querySelectorAll('.service-panel').forEach(p => svgIO.observe(p));

/* ── 8. Custom cursor (desktop only) ────────────────────── */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

if (dot && ring && window.matchMedia('(hover:hover)').matches) {
    let ringX = 0, ringY = 0, curX = 0, curY = 0;

    document.addEventListener('mousemove', e => {
        curX = e.clientX; curY = e.clientY;
        dot.style.left = curX + 'px';
        dot.style.top = curY + 'px';
    });

    (function animateRing() {
        ringX += (curX - ringX) * .12;
        ringY += (curY - ringY) * .12;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    })();

    document.querySelectorAll('a, button, .service-panel').forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.style.transform = 'translate(-50%,-50%) scale(2.5)';
            dot.style.background = 'rgba(201,168,154,.6)';
            ring.style.transform = 'translate(-50%,-50%) scale(1.6)';
        });
        el.addEventListener('mouseleave', () => {
            dot.style.transform = '';
            dot.style.background = '';
            ring.style.transform = '';
        });
    });
}

console.log('%c La Rosa Blu — Digital Atelier 🌹 ', 'background:#0A1128;color:#C9A89A;font-size:13px;padding:6px 12px;');

/* ── 9. Massage Accordion + personalised WhatsApp links ───── */
(function initMassageAccordion() {
    const accordions = document.querySelectorAll('.massage-accordion');

    accordions.forEach(accordion => {
        const items = accordion.querySelectorAll('.mac-item');

        items.forEach(item => {
            const trigger = item.querySelector('.mac-trigger');
            const body    = item.querySelector('.mac-body');
            if (!trigger || !body) return;

            // Build personalised WhatsApp link for this massage
            const massageName = trigger.querySelector('.mac-name')?.textContent?.trim() || '';
            const bookBtn = body.querySelector('.mac-book');
            if (bookBtn && massageName) {
                const msg = encodeURIComponent(
                    `Ciao Alessia! Sono interessata a prenotare: ${massageName}. Quando sei disponibile?`
                );
                bookBtn.href = `https://wa.me/393472700503?text=${msg}`;
            }

            // Accordion toggle
            trigger.addEventListener('click', () => {
                const isOpen = item.classList.contains('is-open');

                // Close all siblings in this accordion group
                items.forEach(other => {
                    if (other === item) return;
                    other.classList.remove('is-open');
                    other.querySelector('.mac-trigger')?.setAttribute('aria-expanded', 'false');
                    other.querySelector('.mac-body')?.setAttribute('hidden', '');
                });

                if (isOpen) {
                    item.classList.remove('is-open');
                    trigger.setAttribute('aria-expanded', 'false');
                    body.setAttribute('hidden', '');
                } else {
                    item.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                    body.removeAttribute('hidden');
                }
            });
        });
    });
})();


/* ── 10. Testimonials — 3-card sliding carousel ─────────── */
(function initTestiCarousel() {
    const track   = document.getElementById('testiTrack');
    const dotsEl  = document.getElementById('testiDots');
    const btnPrev = document.getElementById('testiPrev');
    const btnNext = document.getElementById('testiNext');
    if (!track || !dotsEl) return;

    const cards = Array.from(track.querySelectorAll('.testi-card'));
    const total = cards.length;

    // How many cards visible depends on viewport
    function getVisible() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 992) return 2;
        return 3;
    }

    let current = 0;
    let autoTimer = null;

    // Build dots (one per card)
    cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'testi-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Recensione ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(dot);
    });

    const dots = Array.from(dotsEl.querySelectorAll('.testi-dot'));

    function cardWidth() {
        // single card width + gap in px
        const card = cards[0];
        if (!card) return 0;
        const style = getComputedStyle(track);
        const gap = parseFloat(style.gap) || 24;
        return card.getBoundingClientRect().width + gap;
    }

    function goTo(idx) {
        const vis = getVisible();
        const maxIdx = total - vis;
        // clamp
        current = Math.max(0, Math.min(idx, maxIdx));
        const offset = current * cardWidth();
        track.style.transform = `translateX(-${offset}px)`;

        dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    function next() { goTo(current + 1 >= total - getVisible() + 1 ? 0 : current + 1); }
    function prev() { goTo(current - 1 < 0 ? total - getVisible() : current - 1); }

    function startAuto() {
        stopAuto();
        autoTimer = setInterval(next, 4000);
    }
    function stopAuto() { clearInterval(autoTimer); }

    btnNext?.addEventListener('click', () => { next(); startAuto(); });
    btnPrev?.addEventListener('click', () => { prev(); startAuto(); });

    // Pause on hover/touch
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);
    track.addEventListener('touchstart', stopAuto, { passive: true });
    track.addEventListener('touchend', startAuto, { passive: true });

    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (dx < -40) next();
        else if (dx > 40) prev();
        startAuto();
    }, { passive: true });

    // Re-calculate on resize
    window.addEventListener('resize', () => goTo(current), { passive: true });

    // Init
    goTo(0);
    startAuto();
})();


/* ── 9. Massage Accordion ───────────────────────────────── */
(function initMassageAccordion() {
    // All accordion lists — each .massage-accordion is a group
    const accordions = document.querySelectorAll('.massage-accordion');

    accordions.forEach(accordion => {
        const items = accordion.querySelectorAll('.mac-item');

        items.forEach(item => {
            const trigger = item.querySelector('.mac-trigger');
            const body = item.querySelector('.mac-body');
            if (!trigger || !body) return;

            trigger.addEventListener('click', () => {
                const isOpen = item.classList.contains('is-open');

                // Close all items in THIS accordion group
                items.forEach(otherItem => {
                    if (otherItem === item) return;
                    otherItem.classList.remove('is-open');
                    const otherTrigger = otherItem.querySelector('.mac-trigger');
                    const otherBody = otherItem.querySelector('.mac-body');
                    if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
                    if (otherBody) otherBody.setAttribute('hidden', '');
                });

                // Toggle clicked item
                if (isOpen) {
                    item.classList.remove('is-open');
                    trigger.setAttribute('aria-expanded', 'false');
                    body.setAttribute('hidden', '');
                } else {
                    item.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                    body.removeAttribute('hidden');
                }
            });
        });
    });
})();

