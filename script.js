/**
 * La Rosa Blu — Digital Atelier Script
 * Lenis smooth scroll  ×  GSAP animations  ×  Navbar intelligence
 */

/* ── 1. Add js-ready class (enables CSS reveal states) ──── */
document.documentElement.classList.add('js-ready');

/* ── 2. Lenis — Smooth scroll ───────────────────────────── */
let lenis;

if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
        duration: 1.3,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smoothTouch: false,
    });

    // Feed Lenis into GSAP ticker
    if (typeof gsap !== 'undefined') {
        gsap.ticker.add(time => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }
}

/* ── Helper: smooth scroll to anchor ───────────────────── */
function scrollToTarget(id) {
    const el = document.querySelector(id);
    if (!el) return;
    if (lenis) {
        lenis.scrollTo(el, { offset: -72, duration: 1.5 });
    } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

    // Scrolled state (dark glass)
    if (current > 80) {
        nav.classList.add('nav--scrolled');
    } else {
        nav.classList.remove('nav--scrolled');
        nav.classList.remove('nav--hidden');
    }

    // Direction detection — only hide after first 300px
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
    if (lenis) lenis.stop();
}

function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
}

hamburger?.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
});

drawerClose?.addEventListener('click', closeDrawer);

// Close on Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
});

/* ── 6. GSAP Animations ─────────────────────────────────── */
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // --- 6a. Hero headline mask-reveal (stagger) ----------- //
    const maskInners = document.querySelectorAll('.reveal-mask-inner');
    if (maskInners.length) {
        gsap.fromTo(maskInners,
            { yPercent: 105 },
            {
                yPercent: 0,
                duration: 1.1,
                ease: 'power4.out',
                stagger: .12,
                delay: .25,
            }
        );
    }

    // --- 6b. Hero kicker + body + CTA ---------------------- //
    const heroReveal = document.querySelectorAll('#hero .reveal');
    if (heroReveal.length) {
        gsap.fromTo(heroReveal,
            { opacity: 0, y: 24 },
            {
                opacity: 1, y: 0,
                duration: .9,
                ease: 'power3.out',
                stagger: .15,
                delay: .7,
            }
        );
    }

    // --- 6c. Hero parallax on image ------------------------ //
    const heroImg = document.getElementById('heroImg');
    if (heroImg) {
        gsap.to(heroImg, {
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.2,
            }
        });
    }

    // --- 6d. Generic .reveal elements on scroll ----------- //
    function makeReveal(selector, from) {
        document.querySelectorAll(selector).forEach(el => {
            // Skip elements already visible (hero)
            if (el.closest('#hero')) return;
            gsap.fromTo(el,
                { opacity: 0, ...from },
                {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    duration: .85,
                    ease: 'power3.out',
                    stagger: .12,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        toggleActions: 'play none none none',
                    }
                }
            );
        });
    }

    makeReveal('.reveal', { y: 30 });
    makeReveal('.reveal-left', { x: -40 });
    makeReveal('.reveal-right', { x: 40 });
    makeReveal('.reveal-scale', { scale: .94, y: 20 });

    // --- 6e. Service panels stagger ----------------------- //
    const panels = document.querySelectorAll('.service-panel');
    if (panels.length) {
        gsap.fromTo(panels,
            { opacity: 0, y: 40, scale: .96 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: .9,
                ease: 'power3.out',
                stagger: .15,
                scrollTrigger: {
                    trigger: '.services__grid',
                    start: 'top 82%',
                }
            }
        );
    }

    // --- 6f. Testimonials stagger ------------------------- //
    const testiCards = document.querySelectorAll('.testi-card');
    if (testiCards.length) {
        gsap.fromTo(testiCards,
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0,
                duration: .8,
                ease: 'power3.out',
                stagger: .14,
                scrollTrigger: {
                    trigger: '#testimonials .testimonials__grid',
                    start: 'top 85%',
                }
            }
        );
    }

} // end GSAP block

/* ── 7. SVG stroke animation on service panels ─────────── */
const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in-view');
    });
}, { threshold: .3 });

document.querySelectorAll('.service-panel').forEach(p => io.observe(p));

/* ── 8. Custom cursor ───────────────────────────────────── */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

if (dot && ring && window.matchMedia('(hover:hover)').matches) {
    let ringX = 0, ringY = 0;
    let curX = 0, curY = 0;

    document.addEventListener('mousemove', e => {
        curX = e.clientX;
        curY = e.clientY;
        dot.style.left = curX + 'px';
        dot.style.top = curY + 'px';
    });

    // Lag ring slightly for organic feel
    (function animateRing() {
        ringX += (curX - ringX) * .12;
        ringY += (curY - ringY) * .12;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    })();

    // Scale on hover over interactive elements
    const interactives = document.querySelectorAll('a, button, .service-panel');
    interactives.forEach(el => {
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

/* ── 9. Active tab-bar item on scroll ───────────────────── */
const sections = document.querySelectorAll('section, header, footer');
const tabItems = document.querySelectorAll('.tab-bar__item');
const tabTargetMap = {
    hero: 'tabHome',
    services: 'tabServizi',
    about: 'tabAbout',
    testimonials: null,
    contact: 'tabContact',
};

if (sections.length && tabItems.length) {
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.getAttribute('id');
                const tabId = tabTargetMap[id];
                tabItems.forEach(t => t.classList.remove('active'));
                if (tabId) {
                    const active = document.getElementById(tabId);
                    if (active) active.classList.add('active');
                }
            }
        });
    }, { threshold: .4 });

    sections.forEach(s => sectionObserver.observe(s));
}

/* ── 10. Console signature ──────────────────────────────── */
console.log('%c La Rosa Blu — Digital Atelier 🌹 ', 'background:#0A1128;color:#C9A89A;font-size:13px;padding:6px 12px;');
