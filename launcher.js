/* =============================================================================
   Macintosh OS — the web museum
   One launcher: the startup-disk wall (the only list of systems), the release
   notes, the changelog, and a settings sheet that re-skins the lobby.
   ========================================================================== */

(function () {
  'use strict';

  var systems = (window.SYSTEMS || []).slice().sort(function (a, b) { return a.year - b.year; });
  var releases = (window.CHANGELOG || []).slice();
  var ready = systems.filter(function (s) { return s.status === 'ready' && s.href; });

  var grid = document.getElementById('grid');
  var tpl = document.getElementById('disk-template');
  var page = document.getElementById('page');
  var settings = document.getElementById('settings');
  var styleGrid = document.getElementById('style-grid');

  var STYLE_KEY = 'macintosh-os.museum.style.v1';
  var DEFAULT_STYLE = 'classic';
  var STYLES = [
    {
      id: 'classic',
      name: 'Classic',
      year: '1984',
      blurb: 'One bit, white paper, hard hairlines. The museum as it opened.'
    },
    {
      id: 'platinum',
      name: 'Platinum',
      year: '1997',
      blurb: 'System 7 and 8 grey: bevelled cards, striped headers, a blue accent.'
    },
    {
      id: 'aqua',
      name: 'Aqua',
      year: '2001',
      blurb: 'Mac OS X: glossy whites, round corners, a lickable blue button.'
    },
    {
      id: 'dark',
      name: 'Modern dark',
      year: 'today',
      blurb: 'A dark lobby for late-night browsing. The floppies stay one-bit.'
    }
  ];

  /* ------------------------------------------------------------- helpers -- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* A floppy-disk plate drawn with borders and a few children, so the page keeps
     its promise of no image files. `badge` is the system number. */
  function floppy(badge, size) {
    var disk = el('span', 'floppy' + (size ? ' ' + size : ''));
    disk.appendChild(el('span', 'floppy-shutter'));
    disk.appendChild(el('span', 'floppy-label', badge));
    return disk;
  }

  function beep() {
    try {
      var AC = new (window.AudioContext || window.webkitAudioContext)();
      var o = AC.createOscillator();
      var g = AC.createGain();
      o.type = 'square';
      o.frequency.value = 220;
      g.gain.value = 0.04;
      o.connect(g).connect(AC.destination);
      o.start();
      o.stop(AC.currentTime + 0.07);
    } catch (err) { /* audio is optional */ }
  }

  /* ------------------------------------------- the only list of systems -- */

  var focusIndex = -1;

  function renderGrid() {
    grid.innerHTML = '';
    systems.forEach(function (sys, i) {
      var li = tpl.content.firstElementChild.cloneNode(true);
      var link = li.querySelector('.disk-link');
      var isReady = sys.status === 'ready' && !!sys.href;

      li.dataset.id = sys.id;
      li.dataset.index = String(i);
      li.classList.add(isReady ? 'is-ready' : 'is-planned');

      link.href = isReady ? sys.href : '#' + sys.id;
      link.setAttribute('aria-label',
        sys.name + ' (' + sys.year + ')' + (isReady ? ' — boot now' : ' — in the workshop'));

      li.querySelector('.disk-plate').appendChild(floppy(sys.short, 'floppy-lg'));
      li.querySelector('.disk-name').textContent = sys.name;
      li.querySelector('.disk-year').textContent = String(sys.year);
      li.querySelector('.disk-meta').textContent = sys.model + ' · ' + sys.finder;
      li.querySelector('.disk-blurb').textContent = sys.blurb;

      var tags = li.querySelector('.disk-tags');
      (sys.highlights || []).slice(0, 4).forEach(function (t) {
        tags.appendChild(el('span', 'tag', t));
      });
      li.querySelector('.disk-status').textContent = isReady ? 'Boot' : 'Soon';

      if (!isReady) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          beep();
          li.classList.remove('shake');
          void li.offsetWidth;
          li.classList.add('shake');
        });
      }
      grid.appendChild(li);
    });
  }

  function setFocus(i) {
    var items = grid.children;
    if (!items.length) return;
    focusIndex = (i + items.length) % items.length;
    for (var k = 0; k < items.length; k++) {
      var on = k === focusIndex;
      items[k].classList.toggle('is-focus', on);
      if (on) items[k].querySelector('.disk-link').focus();
    }
  }

  document.addEventListener('keydown', function (e) {
    if (settings && settings.open) return;         // Esc / arrows belong to the sheet
    var items = grid.children;
    if (!items.length) return;
    var cols = window.matchMedia('(max-width: 860px)').matches ? 1 : 2;
    var next = null;
    if (e.key === 'ArrowDown') next = focusIndex < 0 ? 0 : focusIndex + cols;
    else if (e.key === 'ArrowUp') next = focusIndex < 0 ? 0 : focusIndex - cols;
    else if (e.key === 'ArrowRight') next = focusIndex < 0 ? 0 : focusIndex + 1;
    else if (e.key === 'ArrowLeft') next = focusIndex < 0 ? 0 : focusIndex - 1;
    else if ((e.key === 'Enter' || e.key === ' ') && focusIndex >= 0) {
      e.preventDefault();
      items[focusIndex].querySelector('.disk-link').click();
      return;
    }
    if (next !== null) {
      e.preventDefault();
      setFocus(next);
    }
  });

  /* ------------------------------------------------------ release notes -- */

  function renderWhatsNew() {
    var latest = releases[0];
    if (!latest) return;
    document.getElementById('whats-tag').textContent = "What's new · v" + latest.version;
    document.getElementById('whats-title').textContent = latest.title;
    document.getElementById('whats-summary').textContent = latest.summary;
    var list = document.getElementById('whats-list');
    list.innerHTML = '';
    latest.items.slice(0, 4).forEach(function (t) { list.appendChild(el('li', null, t)); });
  }

  function renderChangelog() {
    var ol = document.getElementById('changelog-list');
    ol.innerHTML = '';
    releases.forEach(function (rel) {
      var li = el('li', 'release');
      var head = el('div', 'release-head');
      head.appendChild(el('span', 'release-version', 'v' + rel.version));
      head.appendChild(el('span', 'release-date', rel.date));
      head.appendChild(el('span', 'release-title', rel.title));
      li.appendChild(head);
      li.appendChild(el('p', 'release-summary', rel.summary));
      var ul = el('ul', 'release-items');
      rel.items.forEach(function (t) { ul.appendChild(el('li', null, t)); });
      li.appendChild(ul);
      ol.appendChild(li);
    });
  }

  /* -------------------------------------------------------- the settings -- */

  function applyStyle(id, persist) {
    document.documentElement.setAttribute('data-style', id);
    if (persist) {
      try { localStorage.setItem(STYLE_KEY, id); } catch (err) { /* ignore */ }
    }
    var cards = document.querySelectorAll('.style-card');
    for (var i = 0; i < cards.length; i++) {
      var on = cards[i].dataset.styleId === id;
      cards[i].classList.toggle('is-on', on);
      cards[i].setAttribute('aria-checked', on ? 'true' : 'false');
    }
  }

  function renderStyles() {
    var saved = DEFAULT_STYLE;
    try { saved = localStorage.getItem(STYLE_KEY) || DEFAULT_STYLE; } catch (err) { /* ignore */ }
    if (!STYLES.some(function (s) { return s.id === saved; })) saved = DEFAULT_STYLE;

    styleGrid.innerHTML = '';
    STYLES.forEach(function (st) {
      var card = el('button', 'style-card');
      card.type = 'button';
      card.dataset.styleId = st.id;
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', 'false');

      var prev = el('span', 'style-preview');
      prev.setAttribute('data-preview', st.id);
      prev.setAttribute('aria-hidden', 'true');
      prev.appendChild(el('span', 'pv-bar'));
      prev.appendChild(el('span', 'pv-card'));
      prev.appendChild(el('span', 'pv-btn'));

      var copy = el('span', 'style-copy');
      copy.appendChild(el('span', 'style-name', st.name));
      copy.appendChild(el('span', 'style-year', st.year));
      copy.appendChild(el('span', 'style-blurb', st.blurb));

      card.appendChild(prev);
      card.appendChild(copy);
      card.addEventListener('click', function () { applyStyle(st.id, true); });
      styleGrid.appendChild(card);
    });
    applyStyle(saved, false);
  }

  var settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn && settings) {
    settingsBtn.addEventListener('click', function () {
      if (typeof settings.showModal === 'function') settings.showModal();
      else settings.setAttribute('open', '');
    });
    settings.addEventListener('click', function (e) {
      if (e.target === settings) settings.close();      // click the backdrop
    });
  }

  /* -------------------------------------------------------------- wiring -- */

  var bootAny = document.querySelector('.feature .boot-btn');
  if (bootAny && ready.length) bootAny.href = ready[ready.length - 1].href;

  renderGrid();
  renderWhatsNew();
  renderChangelog();
  renderStyles();
  page.classList.add('is-in');

  // expose for the console / tests
  window.macMuseum = {
    systems: systems,
    releases: releases,
    setStyle: function (id) { applyStyle(id, true); },
    openSettings: function () { if (settingsBtn) settingsBtn.click(); }
  };
})();
