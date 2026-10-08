/* Motion enhances visible content. Navigation and contact links work without it. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.getElementById('motionToggle');
  if (motionButton) {
    motionButton.hidden = motion.matches;
    motionButton.addEventListener('click', () => {
      const paused = document.body.classList.toggle('motion-paused');
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.textContent = paused ? 'Resume motion' : 'Pause motion';
    });
    motion.addEventListener('change', () => { motionButton.hidden = motion.matches; });
  }
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navLinks');
  const closeMenu = () => { menu?.classList.remove('open'); toggle?.setAttribute('aria-expanded', 'false'); };
  toggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu?.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && menu?.classList.contains('open')) { closeMenu(); toggle.focus(); } });
  document.addEventListener('click', e => { if (!e.target.closest('.navbar')) closeMenu(); });
  matchMedia('(max-width: 720px)').addEventListener('change', closeMenu);
  const visibility = () => document.body.classList.toggle('page-hidden', document.hidden);
  document.addEventListener('visibilitychange', visibility); visibility();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting) { if(!motion.matches) entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold: .08});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  const progress = document.getElementById('scrollProgress');
  const top = document.getElementById('backToTop');
  const links = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('header[id], section[id]')];
  let pending = false;
  function update() {
    pending = false;
    const range = document.documentElement.scrollHeight - innerHeight;
    if(progress) progress.style.width = `${range > 0 ? scrollY / range * 100 : 0}%`;
    top?.classList.toggle('show', scrollY > 650);
    let current = '';
    sections.forEach(el => { if(el.getBoundingClientRect().top <= 150) current = el.id; });
    links.forEach(link => {
      const active = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active',active);
      if(active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', () => { if(!pending) { pending=true; requestAnimationFrame(update); } }, {passive:true});
  addEventListener('resize', update); update();
  top?.addEventListener('click', () => {
    window.scrollTo({top:0, behavior:motion.matches ? 'instant' : 'smooth'});
    document.querySelector('.nav-logo')?.focus({preventScroll:true});
  });
})();
