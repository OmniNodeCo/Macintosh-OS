/* =============================================================================
   Macintosh OS — the web museum
   Builds the startup-disk grid from systems.js and drives the boot chooser.
   Written as a plain script (no modules) so the page also works when opened
   straight from disk, not just from a web server.
   ========================================================================== */

(function () {
  'use strict';

  var systems = (window.SYSTEMS || []).slice().sort(function (a, b) { return a.year - b.year; });
  var ready = systems.filter(function (s) { return s.status === 'ready' && s.href; });

  var grid = document.getElementById('grid');
  var tpl = document.getElementById('disk-template');
  var chooser = document.getElementById('chooser');
  var chooserList = document.getElementById('chooser-list');
  var page = document.getElementById('page');

  /* ------------------------------------------------------------- helpers -- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* A floppy-disk plate drawn entirely with borders + a few children, so the
     page keeps its promise of no image files. `badge` is the system number. */
  function floppy(badge, size) {
    var disk = el('span', 'floppy' + (size ? ' ' + size : ''));
    var shutter = el('span', 'floppy-shutter');
    var label = el('span', 'floppy-label', badge);
    disk.appendChild(shutter);
    disk.appendChild(label);
    return disk;
  }

  /* ---------------------------------------------------------------- grid -- */

  function renderGrid() {
    grid.innerHTML = '';
    systems.forEach(function (sys, i) {
      var li = tpl.content.firstElementChild.cloneNode(true);
      var link = li.querySelector('.disk-link');
      var isReady = sys.status === 'ready' && !!sys.href;

      li.dataset.id = sys.id;
      li.style.setProperty('--i', String(i));
      li.classList.add(isReady ? 'is-ready' : 'is-planned');

      link.href = isReady ? sys.href : '#' + sys.id;
      link.setAttribute('aria-label',
        sys.name + ' (' + sys.year + ')' + (isReady ? ' — boot now' : ' — in the workshop'));

      var plate = li.querySelector('.disk-plate');
      plate.appendChild(floppy(sys.short, 'floppy-lg'));

      li.querySelector('.disk-name').textContent = sys.name;
      li.querySelector('.disk-year').textContent = String(sys.year);
      li.querySelector('.disk-meta').textContent = sys.model + ' · ' + sys.finder;
      li.querySelector('.disk-blurb').textContent = sys.blurb;

      var tags = li.querySelector('.disk-tags');
      (sys.highlights || []).slice(0, 4).forEach(function (t) {
        tags.appendChild(el('span', 'tag', t));
      });

      var status = li.querySelector('.disk-status');
      status.textContent = isReady ? 'Boot' : 'Soon';

      if (!isReady) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          openChooser(sys.id);
        });
      }
      grid.appendChild(li);
    });
  }

  /* ------------------------------------------------------------- chooser -- */

  var focusIndex = 0;

  function renderChooser(selectedId) {
    chooserList.innerHTML = '';
    systems.forEach(function (sys, i) {
      var isReady = sys.status === 'ready' && !!sys.href;
      var li = el('li', 'chooser-item' + (isReady ? ' is-ready' : ' is-planned'));
      var btn = el('button', 'chooser-btn');
      btn.type = 'button';
      btn.dataset.index = String(i);
      btn.appendChild(floppy(sys.short, 'floppy-sm'));
      var copy = el('span', 'chooser-copy');
      copy.appendChild(el('span', 'chooser-name', sys.name));
      copy.appendChild(el('span', 'chooser-meta', sys.year + ' · ' + sys.model));
      btn.appendChild(copy);
      btn.appendChild(el('span', 'chooser-state', isReady ? 'Boot' : 'Soon'));
      if (!isReady) btn.setAttribute('aria-disabled', 'true');
      btn.addEventListener('click', function () { choose(i); });
      li.appendChild(btn);
      chooserList.appendChild(li);
      if (sys.id === selectedId) focusIndex = i;
    });
    syncChooserFocus();
  }

  function syncChooserFocus() {
    var buttons = chooserList.querySelectorAll('.chooser-btn');
    for (var i = 0; i < buttons.length; i++) {
      var on = i === focusIndex;
      buttons[i].classList.toggle('is-focus', on);
      if (on) {
        buttons[i].setAttribute('aria-current', 'true');
        if (document.activeElement && chooser.contains(document.activeElement)) buttons[i].focus();
      } else {
        buttons[i].removeAttribute('aria-current');
      }
    }
  }

  function choose(i) {
    var sys = systems[i];
    if (!sys) return;
    if (sys.status === 'ready' && sys.href) {
      window.location.href = sys.href;
      return;
    }
    beep();
    var item = chooserList.children[i] && chooserList.children[i].querySelector('.chooser-btn');
    if (item) {
      item.classList.remove('shake');
      void item.offsetWidth;
      item.classList.add('shake');
      var state = item.querySelector('.chooser-state');
      if (state) state.textContent = 'Soon';
    }
  }

  function openChooser(selectedId) {
    renderChooser(selectedId);
    chooser.hidden = false;
    document.body.classList.add('chooser-open');
    var first = chooserList.querySelector('.chooser-item.is-ready .chooser-btn') ||
      chooserList.querySelector('.chooser-btn');
    if (first) first.focus();
    drawChooserFace();
  }

  function closeChooser() {
    chooser.hidden = true;
    document.body.classList.remove('chooser-open');
    revealPage();
  }

  /* ---------------------------------------------------------------- face -- */

  /* The happy Mac, drawn at 1-bit precision on a 128 × 128 canvas: a case
     outline, a screen, two square eyes and the famous smile. */
  function drawChooserFace() {
    var canvas = document.getElementById('chooser-face');
    if (!canvas || canvas.dataset.drawn) return;
    var ctx = canvas.getContext('2d');
    var S = 128, u = S / 32;                 // 32 logical cells
    var rect = function (x, y, w, h, fill) {
      ctx.fillStyle = fill || '#000';
      ctx.fillRect(Math.round(x * u), Math.round(y * u), Math.round(w * u), Math.round(h * u));
    };

    rect(0, 0, 32, 32, '#fff');

    // outer case: 2-cell border, rounded by clipping the corners
    rect(2, 2, 28, 28);
    ctx.fillStyle = '#fff';
    ctx.fillRect(3 * u, 3 * u, 26 * u, 26 * u);
    [[2, 2], [29, 2], [2, 29], [29, 29]].forEach(function (c) { rect(c[0], c[1], 1, 1, '#fff'); });

    // screen: a recessed 1-cell frame inside the case
    rect(5, 5, 22, 19);
    ctx.fillStyle = '#fff';
    ctx.fillRect(6 * u, 6 * u, 20 * u, 17 * u);

    // eyes
    rect(9, 9, 4, 4);
    rect(19, 9, 4, 4);
    // cheeks / smile: a wide block with the corners lifted
    rect(9, 16, 14, 2);
    rect(9, 18, 2, 1);
    rect(21, 18, 2, 1);
    rect(11, 19, 10, 1);

    // floppy slot + badge below the screen
    rect(6, 25, 20, 3, '#000');
    ctx.fillStyle = '#fff';
    ctx.fillRect(11 * u, 26 * u, 10 * u, 1 * u);

    canvas.dataset.drawn = '1';
  }

  /* -------------------------------------------------------------- effects -- */

  var AC = null;
  function beep() {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
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

  function revealPage() {
    if (page.classList.contains('is-in')) return;
    page.hidden = false;
    page.classList.add('is-in');
  }

  /* --------------------------------------------------------------- wiring -- */

  document.addEventListener('keydown', function (e) {
    if (chooser.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeChooser(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      var n = systems.length;
      focusIndex = (focusIndex + (e.key === 'ArrowDown' ? 1 : n - 1)) % n;
      syncChooserFocus();
      return;
    }
    if (e.key === 'Return' || e.key === 'Enter') {
      e.preventDefault();
      choose(focusIndex);
    }
  });

  var closeBtn = document.querySelector('.chooser-hint');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () { closeChooser(); });
    closeBtn.style.cursor = 'pointer';
    closeBtn.title = 'Close and browse all systems';
  }

  var menuBtn = document.getElementById('bootmenu-btn');
  if (menuBtn) menuBtn.addEventListener('click', function () { openChooser(); });

  var bootAny = document.querySelector('.boot-btn');
  if (bootAny && ready.length) {
    // the big button always points at the newest ready system, not a hard-coded path
    bootAny.href = ready[ready.length - 1].href;
  }

  renderGrid();
  renderChooser();
  drawChooserFace();

  // first visit shows the boot chooser; later visits go straight to the disks,
  // so bookmarking the museum does not put a panel in the way every time.
  var seenKey = 'macintosh-os.museum.seen.v1';
  var seen = false;
  try { seen = localStorage.getItem(seenKey) === '1'; } catch (err) { seen = false; }
  if (!seen && ready.length) openChooser('system-1.0');
  if (seen) closeChooser();
  try { localStorage.setItem(seenKey, '1'); } catch (err) { /* ignore */ }

  // expose for the console / tests
  window.macMuseum = { systems: systems, openChooser: openChooser, closeChooser: closeChooser };
})();
