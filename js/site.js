/* ============================================================
   PAGE INIT
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  initYear();
  initCustomCursor();
  initTopbarScroll();
  initWordRotation();
  initScrollReveal();
  initStatCountUp();
  initMobileNav();
  initLazyImages();
  initActiveNav();
  initBackToTop();
});

/* ============================================================
   FOOTER YEAR
   ============================================================ */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCustomCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    return;
  }

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  function moveCursor() {
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';

    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    requestAnimationFrame(moveCursor);
  }
  moveCursor();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ============================================================
   TOPBAR: shadow on scroll
   ============================================================ */
function initTopbarScroll() {
  const bar = document.querySelector('.topbar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    bar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ============================================================
   HERO WORD ROTATION
   ============================================================ */
function initWordRotation() {
  const el = document.getElementById('heroRotate');
  if (!el) return;

  const words = ['Mobile UX', 'agentic UX', 'design systems', 'enterprise UX', 'AI-native UX', 'design tokens'];
  let idx = 0;

  function next() {
    el.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-60%)';

    setTimeout(() => {
      idx = (idx + 1) % words.length;
      el.textContent = words[idx];
      el.style.transition = 'none';
      el.style.transform = 'translateY(60%)';
      el.style.opacity = '0';
      void el.offsetHeight;
      el.style.transition = 'opacity 0.32s ease, transform 0.32s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 300);
  }

  setInterval(next, 2800);
}



const avatar = document.getElementById("heroAvatar");

if (avatar) {

    window.addEventListener("mousemove", (e) => {

        const x = (e.clientX / window.innerWidth - 0.5) * 12;
        const y = (e.clientY / window.innerHeight - 0.5) * 10;

        avatar.style.transform = `
            perspective(1200px)
            rotateY(${x}deg)
            rotateX(${-y}deg)
            translate(${x * 0.8}px, ${y * 0.8}px)
        `;

    });

    window.addEventListener("mouseleave", () => {

        avatar.style.transform = `
            perspective(1200px)
            rotateX(0deg)
            rotateY(0deg)
            translate(0,0)
        `;

    });

}
/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   ============================================================ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(el => obs.observe(el));
}

/* ============================================================
   STAT COUNT-UP
   ============================================================ */
function initStatCountUp() {
  const nums = document.querySelectorAll('.stat-num[data-count]');
  if (!nums.length) return;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1200;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  nums.forEach(el => obs.observe(el));
}

/* ============================================================
   LAZY IMAGES
   ============================================================ */
function initLazyImages() {
  document.querySelectorAll('img').forEach(img => {
    const inHero = img.closest('.hero') || img.closest('.cs-img-hero');
    if (!inHero && !img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
}

/* ============================================================
   ACTIVE NAV — highlight section in topnav
   ============================================================ */
function initActiveNav() {
  const navLinks = document.querySelectorAll('.topnav a[data-section]');
  if (!navLinks.length) return;

  const sections = Array.from(navLinks).map(a => {
    const id = a.getAttribute('data-section');
    return { el: document.getElementById(id), link: a };
  }).filter(s => s.el);

  function setActive() {
    const scrollY = window.scrollY + 100;
    let active = null;
    for (const s of sections) {
      if (s.el.offsetTop <= scrollY) active = s;
    }
    navLinks.forEach(a => a.classList.remove('active'));
    if (active) active.link.classList.add('active');
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
}

/* ============================================================
   BACK TO TOP
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   MOBILE NAV TOGGLE
   ============================================================ */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav    = document.querySelector('.topnav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}
