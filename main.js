// ===== Pivot Plumbing — shared site scripts =====

// scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// mobile nav open/close
(function () {
  const toggle = document.getElementById('menuToggle');
  const panel = document.getElementById('mobileNav');
  if (!toggle || !panel) return;
  const close = document.getElementById('mnClose');
  function open() { panel.classList.add('open'); document.body.classList.add('nav-open'); }
  function shut() { panel.classList.remove('open'); document.body.classList.remove('nav-open'); }
  toggle.addEventListener('click', open);
  if (close) close.addEventListener('click', shut);
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
})();

// request form — submits to Netlify Forms via AJAX (keeps the inline "thanks" UX)
function pivotPostForm(form) {
  const btn = form.querySelector('button[type=submit]');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Sending…';
  const body = new URLSearchParams(new FormData(form)).toString();
  const done = () => {
    btn.textContent = 'Thanks — we\'ll be in touch!';
    btn.style.background = '#1c222c';
    form.reset();
    setTimeout(() => {
      if (document.body.contains(btn)) { btn.textContent = original; btn.disabled = false; btn.style.background = ''; }
    }, 3200);
  };
  // Netlify intercepts POSTs that carry a matching form-name. On non-Netlify hosts the
  // request fails harmlessly and we still confirm to the user.
  fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
    .then(done).catch(done);
}
function submitForm(e) {
  e.preventDefault();
  pivotPostForm(e.target);
  return false;
}

// cinematic hero — subtle scroll parallax (composes with the CSS Ken Burns zoom)
(function () {
  const bg = document.getElementById('cheroBg');
  if (!bg) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < 1100) bg.style.transform = 'translateY(' + (y * 0.18) + 'px)';
      ticking = false;
    });
  }, { passive: true });
})();

// gallery filter (gallery page)
(function () {
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;
  const shots = [...document.querySelectorAll('.shot')];
  bar.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    bar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    shots.forEach(s => s.classList.toggle('hide', f !== 'all' && s.dataset.cat !== f));
  });
})();

// lead-capture popup — exit-intent (desktop) / timed (mobile), once per 7 days, skips Contact
(function () {
  if (document.body.dataset.page === 'contact') return;      // don't nag where they're already converting
  var KEY = 'pp_popup_v1';
  try {
    var last = localStorage.getItem(KEY);
    if (last && Date.now() - parseInt(last, 10) < 7 * 24 * 3600 * 1000) return;
  } catch (e) {}
  if (sessionStorage.getItem('pp_popup_seen')) return;

  var ov = document.createElement('div');
  ov.className = 'pop-ov';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.setAttribute('aria-label', 'Get a free quote from Pivot Plumbing');
  ov.innerHTML =
    '<div class="pop">' +
      '<button class="pop-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      '<div class="pop-head">' +
        '<img class="wrench-deco" src="brand-wrench-white.png" alt="" aria-hidden="true">' +
        '<span class="eyebrow">Before you go</span>' +
        '<h3>Get a free quote from a master plumber.</h3>' +
        '<p>Tell Chad what’s going on — a licensed master plumber gets right back to you. Not a call center. No obligation.</p>' +
      '</div>' +
      '<div class="pop-body">' +
        '<a class="pop-call" href="tel:+13614602929"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Call (361) 460-2929</a>' +
        '<div class="pop-or">or request a callback</div>' +
        '<form name="popup-quote" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" novalidate>' +
          '<input type="hidden" name="form-name" value="popup-quote">' +
          '<p hidden aria-hidden="true" style="display:none"><label>Don\'t fill this out: <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>' +
          '<div class="row2">' +
            '<div class="field"><input type="text" name="name" required autocomplete="name" aria-label="Your name" placeholder="Your name"></div>' +
            '<div class="field"><input type="tel" name="phone" required autocomplete="tel" aria-label="Phone number" placeholder="Phone number"></div>' +
          '</div>' +
          '<div class="field"><input type="text" name="issue" aria-label="What do you need?" placeholder="What do you need? (optional)"></div>' +
          '<button type="submit" class="btn btn-primary">Request my free quote</button>' +
          '<p class="pop-note">We’ll call you back fast. No spam, ever.</p>' +
        '</form>' +
        '<button class="pop-decline" type="button">No thanks, maybe later</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(ov);

  var shown = false;
  function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} sessionStorage.setItem('pp_popup_seen', '1'); }
  function show() {
    if (shown) return; shown = true;
    ov.classList.add('open'); document.body.style.overflow = 'hidden';
    sessionStorage.setItem('pp_popup_seen', '1');
    document.removeEventListener('mouseout', onExit);
    setTimeout(function () { var i = ov.querySelector('input'); if (i) i.focus(); }, 300);
  }
  function hide() { ov.classList.remove('open'); document.body.style.overflow = ''; remember(); }
  function onExit(e) { if (e.clientY <= 0 && !e.relatedTarget) show(); }

  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) {
    document.addEventListener('mouseout', onExit);
  }
  setTimeout(show, 35000);   // engaged-time fallback (covers touch devices with no exit intent)

  ov.querySelector('.pop-close').addEventListener('click', hide);
  ov.querySelector('.pop-decline').addEventListener('click', hide);
  ov.addEventListener('click', function (e) { if (e.target === ov) hide(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('open')) hide(); });
  ov.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    pivotPostForm(e.target);   // POST to Netlify + inline "thanks"
    remember();
    setTimeout(hide, 2400);
  });
})();

// back-to-top button (mobile) — appears after scrolling, smooth-scrolls to top
(function () {
  var btn = document.createElement('button');
  btn.className = 'to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(btn);
  btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  var toggle = function () { btn.classList.toggle('show', window.scrollY > 640); };
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
})();

// gallery lightbox (home + gallery pages)
(function () {
  const shots = [...document.querySelectorAll('.shot')];
  const lb = document.getElementById('lightbox');
  if (!shots.length || !lb) return;
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  let idx = 0;
  function visibleShots() { return shots.filter(s => !s.classList.contains('hide')); }
  function show(i) {
    const list = visibleShots();
    idx = (i + list.length) % list.length;
    const s = list[idx];
    lbImg.src = s.dataset.full;
    lbImg.alt = s.dataset.cap || '';
    lbCap.innerHTML = '<span class="lb-cat">' + (s.dataset.cat || '') + '</span><b>' + (s.dataset.cap || '') + '</b>';
  }
  function open(shot) { show(visibleShots().indexOf(shot)); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  shots.forEach(s => s.addEventListener('click', () => open(s)));
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
  document.getElementById('lbNext').addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });
})();
