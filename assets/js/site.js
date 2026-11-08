/* simonefrancomarketing.it — interazioni e motion (vanilla JS, nessuna libreria) */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── Nav: stato scrolled + menu mobile ── */
  var navWrap = $('.nav-wrap');
  var toggle = $('.nav-toggle');
  var menu = $('#navMenu');
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Apri menu'); }
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
    });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target)) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* ── Scroll: progress bar, nav, linea timeline ── */
  var bar = $('.progress');
  var tl = $('.timeline');
  var tlFill = tl ? $('.line-fill', tl) : null;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (navWrap) navWrap.classList.toggle('scrolled', y > 10);
    if (tlFill) {
      var r = tl.getBoundingClientRect();
      var p = (window.innerHeight * .6 - r.top) / r.height;
      tlFill.style.transform = 'scaleY(' + Math.max(0, Math.min(1, p)) + ')';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ── Reveal on scroll ── */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: .14, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal, .flow, .lang').forEach(function (el) { io.observe(el); });

    /* Contatori numerici */
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, end = parseFloat(el.getAttribute('data-count')), pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
        if (reduce) return;
        var t0 = null, dur = 1600;
        function fmt(n) { return pre + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + suf; }
        function step(t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 4);
          el.textContent = fmt(end * ease);
          if (k < 1) requestAnimationFrame(step); else el.textContent = fmt(end);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: .6 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });

    /* Esperienze: pallino attivo */
    var jio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('on', e.isIntersecting); });
    }, { rootMargin: '-35% 0px -45% 0px' });
    $$('.job, .step').forEach(function (el) { jio.observe(el); });

    /* Indice sezioni (rail + nav) */
    var links = $$('.rail a, .nav-links a[href^="#"]');
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = '#' + e.target.id;
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { sio.observe(s); });
  } else {
    $$('.reveal, .flow, .lang').forEach(function (el) { el.classList.add('in'); });
  }

  /* ── Citazione: parole che si accendono con lo scroll ── */
  $$('.quote[data-scrub]').forEach(function (q) {
    var words = q.textContent.trim().split(/\s+/);
    q.setAttribute('aria-label', q.textContent.trim());
    q.innerHTML = words.map(function (w) { return '<span class="qw" aria-hidden="true">' + w + '</span>'; }).join(' ');
    var spans = $$('.qw', q);
    function upd() {
      var r = q.getBoundingClientRect();
      var p = (window.innerHeight * .85 - r.top) / (window.innerHeight * .5);
      var n = Math.round(Math.max(0, Math.min(1, p)) * spans.length);
      spans.forEach(function (s, i) { s.classList.toggle('on', i < n); });
    }
    if (reduce) { spans.forEach(function (s) { s.classList.add('on'); }); return; }
    window.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true });
    upd();
  });

  /* ── Rotatore di parole (effetto macchina da scrivere) ── */
  var rot = $('.rotator .word');
  if (rot && !reduce) {
    var list = JSON.parse(rot.getAttribute('data-words'));
    var i = 0, ch = list[0].length, del = true;
    (function tick() {
      var w = list[i];
      if (del) { ch--; rot.textContent = w.slice(0, ch); if (ch === 0) { del = false; i = (i + 1) % list.length; } return setTimeout(tick, 38); }
      var nw = list[i]; ch++; rot.textContent = nw.slice(0, ch);
      if (ch === nw.length) { del = true; return setTimeout(tick, 2200); }
      setTimeout(tick, 70);
    })();
    setTimeout(function () {}, 0);
  }

  /* ── Parallasse foto hero + bottoni magnetici (solo mouse) ── */
  if (fine && !reduce) {
    var hv = $('.hero-visual'), photo = $('.hero-photo'), orbit = $('.orbit-wrap');
    if (hv && photo) {
      hv.addEventListener('mousemove', function (e) {
        var r = hv.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        photo.style.transform = 'translate(' + (x * 14) + 'px,' + (y * 10) + 'px)';
        if (orbit) orbit.style.transform = 'translate(calc(-50% + ' + (x * -18) + 'px), calc(-50% + ' + (y * -12) + 'px))';
      });
      hv.addEventListener('mouseleave', function () { photo.style.transform = ''; if (orbit) orbit.style.transform = ''; });
    }
    $$('.magnet').forEach(function (m) {
      m.addEventListener('mousemove', function (e) {
        var r = m.getBoundingClientRect();
        m.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .25) + 'px,' + ((e.clientY - r.top - r.height / 2) * .35) + 'px)';
      });
      m.addEventListener('mouseleave', function () { m.style.transform = ''; });
      m.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
    });
    $$('.pack').forEach(function (p) {
      p.addEventListener('mousemove', function (e) {
        var r = p.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        p.style.transform = 'translateY(-6px) perspective(900px) rotateX(' + (y * -5) + 'deg) rotateY(' + (x * 6) + 'deg)';
      });
      p.addEventListener('mouseleave', function () { p.style.transform = ''; });
    });
  }

  /* ── Form contatti: feedback senza cambiare il comportamento di Formspree ── */
  var form = $('#contactForm'), st = $('#status');
  if (form && st) form.addEventListener('submit', function () { st.textContent = 'Invio in corso…'; });

  /* ── Anno nel footer ── */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
