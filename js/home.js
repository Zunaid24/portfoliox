(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? Math.min(ms, 60) : ms));

  /* ---------- nav, progress, spotlight ---------- */
  const nav = $('#nav'), bar = $('#progress'), spot = $('#spotlight');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 8);
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    updateFlow();
  };
  addEventListener('scroll', onScroll, { passive: true });
  if (fine) addEventListener('pointermove', (e) => {
    spot.style.setProperty('--mx', e.clientX + 'px');
    spot.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });

  /* ---------- reveal ---------- */
  const items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add('in'));

  /* ---------- active nav link ---------- */
  const links = $$('.nav nav a');
  const secs = links.map((a) => $(a.getAttribute('href')));
  const so = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach((s) => s && so.observe(s));

  /* ---------- count up ---------- */
  const counters = $$('[data-count]');
  const co = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    co.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  counters.forEach((c) => co.observe(c));

  /* ---------- typed line ---------- */
  const phrases = [
    'agent.read_canvas() → 142 frames indexed',
    'audit.run(site) → 38 findings, ranked by severity',
    'design.write_native(frame) → auto-layout, tokens, real text',
    'qa.check() → contrast ✓ spacing ✓ content preserved ✓',
    'human.approve() → handoff ready',
  ];
  const typedEl = $('#typed');
  (async () => {
    if (reduce) { typedEl.textContent = phrases[0]; return; }
    let i = 0;
    await sleep(1300);
    for (;;) {
      const s = phrases[i++ % phrases.length];
      for (let c = 1; c <= s.length; c++) { typedEl.textContent = s.slice(0, c); await sleep(28); }
      await sleep(1700);
      for (let c = s.length; c >= 0; c--) { typedEl.textContent = s.slice(0, c); await sleep(12); }
      await sleep(250);
    }
  })();

  /* ---------- neural canvas ---------- */
  const cv = $('#neural');
  if (cv) {
    const ctx = cv.getContext('2d');
    let w, h, dpr, pts = [];
    const mouse = { x: -999, y: -999 };
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, (w * h) / 14000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28, r: Math.random() * 1.4 + 0.6,
      }));
    };
    size(); addEventListener('resize', size);
    cv.parentElement.addEventListener('pointermove', (e) => {
      const b = cv.getBoundingClientRect(); mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top;
    });
    cv.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    let vis = true;
    new IntersectionObserver((e) => { vis = e[0].isIntersecting; }).observe(cv);
    const draw = () => {
      if (vis) {
        ctx.clearRect(0, 0, w, h);
        for (const p of pts) {
          if (!reduce) { p.x += p.vx; p.y += p.vy; }
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (dm < 140 && !reduce) { p.x += (p.x - mouse.x) * 0.006; p.y += (p.y - mouse.y) * 0.006; }
        }
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          for (let j = i + 1; j < pts.length; j++) {
            const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 130) {
              ctx.strokeStyle = `rgba(124,108,255,${(1 - d / 130) * 0.28})`;
              ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
          const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (dm < 170) {
            ctx.strokeStyle = `rgba(34,211,238,${(1 - dm / 170) * 0.6})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
          ctx.fillStyle = dm < 170 ? '#22D3EE' : 'rgba(190,184,255,.75)';
          ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
        }
      }
      if (!reduce) requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.22}px,${(e.clientY - b.top - b.height / 2) * 0.3}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* ---------- tilt + glow ---------- */
  $$('.tilt, .card, .feature').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      el.style.setProperty('--px', x + 'px'); el.style.setProperty('--py', y + 'px');
      if (fine && !reduce) {
        const rx = ((y / b.height) - 0.5) * -5, ry = ((x / b.width) - 0.5) * 5;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      }
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* ---------- agent demo ---------- */
  const brief = $('#brief'), runBtn = $('#runAgent'), state = $('#runState');
  const steps = $$('#steps li'), log = $('#log'), frame = $('#frame');
  const els = $$('.f-el', frame), cur = $('#agentCursor'), canvas = $('#canvas');
  const score = $('#score'), ring = $('#ring'), num = $('#scoreNum'), checks = $$('#checks li');
  let running = false;

  const say = (cls, txt) => {
    const p = document.createElement('p');
    if (cls) p.className = cls;
    p.textContent = txt; log.appendChild(p);
    while (log.children.length > 6) log.removeChild(log.firstChild);
  };
  const moveTo = (el) => {
    const c = canvas.getBoundingClientRect(), b = el.getBoundingClientRect();
    cur.style.left = (b.left - c.left + b.width * 0.6) + 'px';
    cur.style.top = (b.top - c.top + b.height * 0.5) + 'px';
  };
  const setScore = (v) => {
    ring.style.strokeDashoffset = 119.4 * (1 - v / 100);
    ring.style.stroke = v < 80 ? 'var(--warn)' : 'var(--ok)';
    const from = +num.textContent || 0, t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 700);
      num.textContent = Math.round(from + (v - from) * p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const mark = (i, st) => { steps.forEach((s, k) => { s.classList.toggle('done', k < i || st === 'all'); s.classList.toggle('active', k === i && st !== 'all'); }); };
  const resetDemo = () => {
    els.forEach((e) => e.classList.remove('on')); frame.classList.remove('flaw', 'drawing');
    score.classList.remove('show'); checks.forEach((c) => c.className = ''); setScore(0); num.textContent = '0';
    steps.forEach((s) => s.classList.remove('active', 'done')); log.innerHTML = '';
    cur.classList.remove('show');
  };

  async function run() {
    if (running) return;
    running = true; runBtn.disabled = true; resetDemo();
    const text = (brief.value || 'Untitled brief').trim().slice(0, 70);
    state.textContent = 'running'; state.className = 'badge run';
    cur.classList.add('show');

    mark(0); say('t', `$ ux-direct run "${text}"`); await sleep(500);
    say('', 'planning: screens, states, content to preserve'); await sleep(800);

    mark(1); say('', 'reading canvas · styles · design-system rules'); moveTo(frame); await sleep(900);
    say('ok', '✓ found 14 colour tokens, 6 text styles, 8pt grid'); await sleep(700);

    mark(2); frame.classList.add('drawing'); say('t', 'writing native layers (auto-layout)');
    for (let i = 0; i < els.length; i++) {
      if (i === 4) frame.classList.add('flaw');
      if (i === 6) frame.classList.add('flaw');
      moveTo(els[i]); await sleep(260); els[i].classList.add('on'); await sleep(190);
    }
    say('ok', `✓ wrote ${els.length} layers · text content preserved`); await sleep(500);

    mark(3); score.classList.add('show'); say('', 'running quality checks…'); setScore(32); await sleep(700);
    const first = ['pass', 'fail', 'pass', 'pass'];
    for (let i = 0; i < 4; i++) { checks[i].classList.add(first[i]); await sleep(380); }
    setScore(71); say('w', '! contrast 3.1:1 on body text · spacing off-grid on CTA'); await sleep(1100);

    mark(4); say('t', 'iterating: fixing failed checks'); moveTo($('.f-cta', frame)); await sleep(700);
    frame.classList.remove('flaw'); await sleep(500);
    checks[1].classList.remove('fail'); checks[1].classList.add('pass');
    setScore(96); say('ok', '✓ all checks pass · score 96'); await sleep(700);
    frame.classList.remove('drawing'); cur.classList.remove('show');
    mark(5, 'all'); say('ok', '→ handed back for human review'); state.textContent = 'ready for review'; state.className = 'badge done';
    runBtn.disabled = false; runBtn.textContent = 'Run again ▸'; running = false;
  }
  runBtn.addEventListener('click', run);
  brief.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
  $$('#presets button').forEach((b) => b.addEventListener('click', () => { brief.value = b.dataset.brief; run(); }));
  let auto = false;
  new IntersectionObserver((es) => { if (es[0].isIntersecting && !auto) { auto = true; setTimeout(run, 700); } }, { threshold: 0.45 }).observe($('.agent'));

  /* ---------- intelligence tabs ---------- */
  const tabs = $$('.intel-nav button'), panes = $$('.intel-pane');
  const pick = (i) => {
    tabs.forEach((t, k) => { t.classList.toggle('on', k === i); t.setAttribute('aria-selected', k === i); });
    panes.forEach((p, k) => p.classList.toggle('on', k === i));
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => pick(i)));
  $('.intel-nav').addEventListener('keydown', (e) => {
    const cur = tabs.findIndex((t) => t.classList.contains('on'));
    if (e.key === 'ArrowRight') { pick((cur + 1) % tabs.length); tabs[(cur + 1) % tabs.length].focus(); }
    if (e.key === 'ArrowLeft') { pick((cur + tabs.length - 1) % tabs.length); tabs[(cur + tabs.length - 1) % tabs.length].focus(); }
  });

  /* ---------- workflow line scroll fill ---------- */
  const flow = $('#flow'), fill = $('#flowFill'), fsteps = $$('.flow-step');
  function updateFlow() {
    if (!flow) return;
    const b = flow.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (innerHeight * 0.75 - b.top) / (b.height + 40)));
    fill.style.width = (p * 100) + '%';
    fsteps.forEach((s, i) => s.classList.toggle('lit', p > (i + 0.2) / fsteps.length));
  }

  /* ---------- command palette ---------- */
  const pal = $('#palette'), inp = $('#paletteInput'), list = $('#paletteList');
  const cmds = [
    ['UX Direct agent', '#agent'], ['UX intelligence system', '#intelligence'], ['Automated workflow', '#workflow'],
    ['Selected work', '#work'], ['TrialIQ AI case study', 'trialiq-ai.html'], ['About', '#about'],
    ['Experience', '#experience'], ['Toolkit', '#stack'], ['Contact', '#contact'],
    ['Open résumé', 'assets/Zunaid_Ahmed_Resume.pdf'], ['Email me', 'mailto:xunayd786@gmail.com'],
  ];
  let sel = 0, shown = cmds;
  const render = () => {
    list.innerHTML = '';
    shown.forEach(([l, h], i) => {
      const li = document.createElement('li'); li.className = i === sel ? 'sel' : '';
      li.innerHTML = `<span></span><small></small>`;
      li.firstChild.textContent = l; li.lastChild.textContent = h.startsWith('#') ? 'section' : 'link';
      li.addEventListener('click', () => go(h)); list.appendChild(li);
    });
  };
  const open = () => { pal.hidden = false; inp.value = ''; shown = cmds; sel = 0; render(); inp.focus(); };
  const close = () => { pal.hidden = true; };
  const go = (h) => {
    close();
    if (h.startsWith('#')) $(h).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    else if (h.startsWith('mailto')) location.href = h;
    else window.open(h, h.endsWith('.pdf') ? '_blank' : '_self');
  };
  $('#openPalette').addEventListener('click', open);
  pal.addEventListener('click', (e) => { if (e.target === pal) close(); });
  inp.addEventListener('input', () => {
    const q = inp.value.toLowerCase(); shown = cmds.filter(([l]) => l.toLowerCase().includes(q)); sel = 0; render();
  });
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? open() : close(); return; }
    if (pal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % shown.length; render(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + shown.length - 1) % shown.length; render(); }
    if (e.key === 'Enter' && shown[sel]) go(shown[sel][1]);
  });

  onScroll();
})();
