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
