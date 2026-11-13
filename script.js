(() => {
  const header = document.querySelector('.site-header');
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.getElementById('nav');
  const hero = document.querySelector('.hero');
  const heroMedia = document.querySelector('.hero-media');
  const heroContent = document.querySelector('.hero-content');
  const mobileBar = document.querySelector('.mobile-bar');
  const shots = [...document.querySelectorAll('[data-reveal]')];
  const navLinks = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile menu
  const setMenu = open => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    const label = open ? 'Close menu' : 'Open menu';
    menuBtn.setAttribute('aria-label', window.jctT ? window.jctT(label) : label);
    document.body.classList.toggle('menu-open', open);
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Scroll-linked effects. Everything is computed from scroll position, so it plays backward on scroll up.
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const heroH = hero.offsetHeight;

    header.classList.toggle('scrolled', y > 40);
    if (mobileBar) {
      const show = y > heroH * 0.7;
      mobileBar.classList.toggle('show', show);
      mobileBar.setAttribute('aria-hidden', String(!show));
      mobileBar.querySelectorAll('a').forEach(a => a.tabIndex = show ? 0 : -1);
    }

    // Active nav link
    let current = null;
    sections.forEach(s => { if (s.getBoundingClientRect().top < vh * 0.4) current = s.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));

    if (reduce.matches) return;

    // Hero: photo drifts slower than the page and eases in, content lifts and fades
    if (y < heroH * 1.2) {
      const p = clamp(y / heroH);
      heroMedia.style.setProperty('--hero-y', (p * heroH * 0.35).toFixed(1) + 'px');
      heroMedia.style.setProperty('--hero-s', (1 + p * 0.08).toFixed(4));
      heroContent.style.setProperty('--hero-cy', (p * -60).toFixed(1) + 'px');
      heroContent.style.setProperty('--hero-o', (1 - p * 1.4).toFixed(3));
    }

    // Gallery: each photo opens from a cropped, zoomed frame as it travels up the screen
    shots.forEach(el => {
      const r = el.getBoundingClientRect();
      // 0 when the top of the figure hits the bottom of the viewport, 1 when it reaches 45% height
      const p = clamp((vh - r.top) / (vh * 0.55));
      const eased = 1 - Math.pow(1 - p, 3);
      el.style.setProperty('--r', (1 - eased).toFixed(4));
    });
  };

  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  reduce.addEventListener?.('change', update);
  update();
})();
