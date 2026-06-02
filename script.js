/* ============================================================
   צוף · השער THE GATE — interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Header on scroll + progress ---------- */
  var header = document.getElementById('siteHeader');
  var progress = document.getElementById('scrollProgress');
  function onScroll() {
    var sc = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', sc > 40);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (sc / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.acc-head').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc-item');
      var body = item.querySelector('.acc-body');
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
    });
  });

  /* ---------- Smooth anchor offset for fixed header ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---------- Contact form (Formspree + mailto fallback) ---------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  var FALLBACK_EMAIL = 'tzofiya1327@gmail.com';

  if (form) {
    form.addEventListener('submit', function (e) {
      var action = form.getAttribute('action') || '';
      var configured = action.indexOf('REPLACE_WITH_FORM_ID') === -1 && action.indexOf('formspree.io') !== -1;

      var name = (form.name && form.name.value || '').trim();
      var phone = (form.phone && form.phone.value || '').trim();
      var msg = (form.message && form.message.value || '').trim();

      if (!configured) {
        /* Fallback: open prefilled email so the form "works" before Formspree is set up */
        e.preventDefault();
        var subject = encodeURIComponent('פנייה חדשה מאתר השער · THE GATE');
        var bodyTxt = encodeURIComponent('שם: ' + name + '\nטלפון: ' + phone + '\n\nהודעה:\n' + msg);
        window.location.href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + subject + '&body=' + bodyTxt;
        if (status) { status.textContent = 'נפתח חלון מייל לשליחה — או דברי איתי בוואטסאפ.'; status.className = 'form-status ok'; }
        return;
      }

      /* Formspree AJAX submit */
      e.preventDefault();
      if (status) { status.textContent = 'שולח…'; status.className = 'form-status'; }
      fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          if (status) { status.textContent = 'תודה! קיבלתי את הפרטים ואחזור אלייך בהקדם 🪷'; status.className = 'form-status ok'; }
        } else {
          throw new Error('bad response');
        }
      }).catch(function () {
        if (status) { status.textContent = 'משהו השתבש. אפשר לדבר איתי ישירות בוואטסאפ.'; status.className = 'form-status err'; }
      });
    });
  }

  /* ============================================================
     Accessibility widget
     ============================================================ */
  var a11yToggle = document.getElementById('a11yToggle');
  var a11yPanel = document.getElementById('a11yPanel');
  var FONT_STEP = 0.1, FONT_MIN = 0.8, FONT_MAX = 1.6;
  var state = loadA11y();

  function loadA11y() {
    try { return JSON.parse(localStorage.getItem('a11y') || '{}'); }
    catch (e) { return {}; }
  }
  function saveA11y() {
    try { localStorage.setItem('a11y', JSON.stringify(state)); } catch (e) {}
  }
  function applyA11y() {
    var scale = state.fontScale || 1;
    document.documentElement.style.setProperty('--fs-scale', scale);
    document.body.classList.toggle('a11y-contrast', !!state.contrast);
    document.body.classList.toggle('a11y-links', !!state.links);
    document.body.classList.toggle('a11y-readable', !!state.readable);
    document.body.classList.toggle('a11y-stop-motion', !!state.stopMotion);
  }
  applyA11y();

  if (a11yToggle && a11yPanel) {
    a11yToggle.addEventListener('click', function () {
      var open = a11yPanel.hidden;
      a11yPanel.hidden = !open;
      a11yToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!a11yPanel.hidden && !a11yPanel.contains(e.target) && e.target !== a11yToggle) {
        a11yPanel.hidden = true;
        a11yToggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !a11yPanel.hidden) { a11yPanel.hidden = true; a11yToggle.setAttribute('aria-expanded', 'false'); a11yToggle.focus(); }
    });
    a11yPanel.querySelectorAll('[data-a11y]').forEach(function (b) {
      b.addEventListener('click', function () {
        var act = b.getAttribute('data-a11y');
        switch (act) {
          case 'font-up': state.fontScale = Math.min(FONT_MAX, (state.fontScale || 1) + FONT_STEP); break;
          case 'font-down': state.fontScale = Math.max(FONT_MIN, (state.fontScale || 1) - FONT_STEP); break;
          case 'contrast': state.contrast = !state.contrast; break;
          case 'links': state.links = !state.links; break;
          case 'readable': state.readable = !state.readable; break;
          case 'stop-motion': state.stopMotion = !state.stopMotion; break;
          case 'reset': state = {}; break;
        }
        applyA11y(); saveA11y();
      });
    });
  }
})();
