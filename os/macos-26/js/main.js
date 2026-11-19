/* macOS Monterey 12 (2021) — a browser recreation on a MacBook Pro
   (14-inch, M1 Pro, 2021). Focus modes, Shortcuts, Safari tab groups.
   Official icon art per CREDITS.md. */

import { iconEl } from './icons.js';

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const k of kids) k && n.append(k);
  return n;
};

const MACHINE = 'MacBook Pro (14-inch, M4 Pro, 2024)';
const CHIP = 'Apple M4 Pro';
const OSNAME = 'macOS Tahoe';
const OSVER = '26.0';
const OSBUILD = '25A354';
const SCREEN_W = 1512;
const SCREEN_H = 982;
const state = {
  windows: [], z: 100, menuOpen: -1, ccOpen: false, ncOpen: false,
  focus: null, // 'Do Not Disturb' | 'Work' | 'Personal' | 'Sleep' | null
  wallpaper: 0,
};

const SVG = {
  apple: '<svg width="14" height="16" viewBox="0 0 14 16" aria-label="Apple"><path fill="#111" d="M9.6 2.1c.5-.6.8-1.4.7-2.1-.7 0-1.5.4-2 .9-.4.5-.8 1.3-.7 2 .8.1 1.5-.3 2-.8z"/><path fill="#111" d="M11.8 8.5c0-1.9 1.5-2.8 1.6-2.8-.9-1.3-2.2-1.4-2.7-1.5-1.1-.1-2.2.7-2.8.7-.6 0-1.5-.7-2.4-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.1-.3 5.3.9 7 .6.9 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6 1.1 0 1.4.6 2.3.6.9 0 1.5-.9 2.1-1.7.7-1 .9-1.9.9-2-.1 0-1.5-.6-1.5-2.7z"/></svg>',
  wifi: '<svg width="16" height="14" viewBox="0 0 16 14"><g fill="none" stroke="#111" stroke-width="1.4" stroke-linecap="round"><path d="M2 5.2a9 9 0 0 1 12 0"/><path d="M4.2 7.9a5.8 5.8 0 0 1 7.6 0"/></g><circle cx="8" cy="11" r="1.4" fill="#111"/></svg>',
  search: '<svg width="15" height="15" viewBox="0 0 15 15"><circle cx="6.2" cy="6.2" r="4.3" fill="none" stroke="#111" stroke-width="1.5"/><path d="M9.6 9.6 13.4 13.4" stroke="#111" stroke-width="1.7" stroke-linecap="round"/></svg>',
  cc: '<svg width="17" height="13" viewBox="0 0 17 13"><rect x="1" y="1.5" width="15" height="4.2" rx="2.1" fill="none" stroke="#111" stroke-width="1.3"/><circle cx="4.2" cy="3.6" r="1.3" fill="#111"/><rect x="1" y="7.4" width="15" height="4.2" rx="2.1" fill="none" stroke="#111" stroke-width="1.3"/><circle cx="12.8" cy="9.5" r="1.3" fill="#111"/></svg>',
  bt: '<svg width="11" height="14" viewBox="0 0 11 14"><path fill="none" stroke="#111" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" d="M3 3.4 8.2 9.8 5.5 12.4V1.6L8.2 4.2 3 10.6"/></svg>',
  airdrop: '<svg width="15" height="15" viewBox="0 0 15 15"><g fill="none" stroke="#111" stroke-width="1.3" stroke-linecap="round"><path d="M4.4 9.4a4.6 4.6 0 0 1 6.2 0"/><path d="M6.2 11.3a2 2 0 0 1 2.6 0"/></g><path fill="#111" d="M7.5 3.2 10 7.6H5z"/></svg>',
  sun: '<svg width="15" height="15" viewBox="0 0 15 15"><circle cx="7.5" cy="7.5" r="2.8" fill="#111"/><g stroke="#111" stroke-width="1.3" stroke-linecap="round"><path d="M7.5 1v1.8M7.5 12.2V14M1 7.5h1.8M12.2 7.5H14M2.9 2.9l1.3 1.3M10.8 10.8l1.3 1.3M12.1 2.9l-1.3 1.3M4.2 10.8l-1.3 1.3"/></g></svg>',
  lock: '<svg width="11" height="13" viewBox="0 0 11 13"><rect x="1" y="5.5" width="9" height="6.5" rx="1.6" fill="#111"/><path fill="none" stroke="#111" stroke-width="1.3" d="M3.2 5.5V4a2.3 2.3 0 0 1 4.6 0v1.5"/></svg>',
  moon: '<svg width="12" height="12" viewBox="0 0 12 12"><path fill="#111" d="M10.2 7.6A4.8 4.8 0 0 1 4.4 1.8a4.8 4.8 0 1 0 5.8 5.8z"/></svg>',
};

/* ============================================================ window tiling (Sequoia) */
const TILE_RECTS = {
  left: () => [0, 24, SCREEN_W / 2, SCREEN_H - 24],
  right: () => [SCREEN_W / 2, 24, SCREEN_W / 2, SCREEN_H - 24],
  top: () => [0, 24, SCREEN_W, SCREEN_H - 24],
  tl: () => [0, 24, SCREEN_W / 2, (SCREEN_H - 24) / 2],
  tr: () => [SCREEN_W / 2, 24, SCREEN_W / 2, (SCREEN_H - 24) / 2],
  bl: () => [0, 24 + (SCREEN_H - 24) / 2, SCREEN_W / 2, (SCREEN_H - 24) / 2],
  br: () => [SCREEN_W / 2, 24 + (SCREEN_H - 24) / 2, SCREEN_W / 2, (SCREEN_H - 24) / 2],
};
function tileWindow(w, zone) {
  const r = TILE_RECTS[zone]();
  Object.assign(w.el.style, { left: `${r[0]}px`, top: `${r[1]}px`, width: `${r[2]}px`, height: `${r[3]}px` });
}
function snapZone(ev) {
  const scr = $('#screen').getBoundingClientRect();
  const x = ev.clientX, y = ev.clientY;
  if (x < scr.left || x > scr.right || y < scr.top || y > scr.bottom) return null;
  const E = 26, C = 96;
  const dxl = x - scr.left, dxr = scr.right - x, dyt = y - scr.top, dyb = scr.bottom - y;
  if (dyt < C && dxl < C) return 'tl';
  if (dyt < C && dxr < C) return 'tr';
  if (dyb < C && dxl < C) return 'bl';
  if (dyb < C && dxr < C) return 'br';
  if (dxl < E) return 'left';
  if (dxr < E) return 'right';
  if (dyt < E) return 'top';
  return null;
}
function showTilePreview(zone) {
  let pv = $('#tilepv');
  if (!pv) {
    pv = el('div', { id: 'tilepv', class: 'tile-preview' });
    $('#screen').append(pv);
  }
  if (!zone) { pv.style.display = 'none'; return; }
  const r = TILE_RECTS[zone]();
  Object.assign(pv.style, { display: 'block', left: `${r[0] + 8}px`, top: `${r[1] + 8}px`, width: `${r[2] - 16}px`, height: `${r[3] - 16}px` });
}

function animWindow(w, styles, done) {
  const win = w.el;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Object.assign(win.style, styles); done && done(); return;
  }
  win.classList.add('anim');
  void win.offsetWidth;
  Object.assign(win.style, styles);
  setTimeout(() => { win.classList.remove('anim'); done && done(); }, 360);
}
function zoomWindow(w) {
  const win = w.el;
  if (win.dataset.zoomed) {
    const p = JSON.parse(win.dataset.zoomed);
    delete win.dataset.zoomed;
    animWindow(w, { left: p.left + 'px', top: p.top + 'px', width: p.width + 'px', height: p.height + 'px' });
  } else {
    win.dataset.zoomed = JSON.stringify({ left: win.offsetLeft, top: win.offsetTop, width: win.offsetWidth, height: win.offsetHeight });
    animWindow(w, { left: '0px', top: '24px', width: SCREEN_W + 'px', height: (SCREEN_H - 24) + 'px' });
  }
}
function minimizeWindow(w) {
  const win = w.el;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { closeWindow(w); return; }
  const dock = document.querySelector('#dock');
  const dr = dock ? dock.getBoundingClientRect() : null;
  const wr = win.getBoundingClientRect();
  const scr = document.querySelector('#screen').getBoundingClientRect();
  const scale = scr.width / SCREEN_W || 1;
  const tx = dr ? (dr.left + dr.width / 2 - (wr.left + wr.width / 2)) / scale : 0;
  const ty = dr ? (dr.top + dr.height / 2 - (wr.top + wr.height / 2)) / scale : 300;
  win.classList.add('minimizing');
  win.style.transform = `translate(${Math.round(tx)}px, ${Math.round(ty)}px) scale(.06)`;
  win.style.opacity = '0';
  setTimeout(() => closeWindow(w), 320);
}

/* ============================================================ window mgr */
function makeWindow({ title, app, width, height, x, y, body, leftTitle, titleLeft, titleRight, hideTitle }) {
  const win = el('div', { class: 'win' },
    el('div', { class: 'title' },
      el('div', { class: 'traffic' },
        el('div', { class: 'light close', onpointerdown: (e) => { e.stopPropagation(); closeWindow(w); } }),
        el('div', { class: 'light min', onpointerdown: (e) => { e.stopPropagation(); minimizeWindow(w); } }),
        el('div', { class: 'light zoom', onpointerdown: (e) => { e.stopPropagation(); zoomWindow(w); } }),
      ),
      titleLeft || null,
      el('div', { class: 'wt' + (hideTitle ? ' hide' : ''), text: title }),
      titleRight || null,
    ),
    body,
  );
  if (leftTitle) win.classList.add('left-title');
  win.setAttribute('data-app', app || '');
  const w = {
    el: win, app, title, body,
    setTitle(t) { w.title = t; const wt = win.querySelector('.title .wt'); if (wt) wt.textContent = t; },
  };
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
  win.style.left = `${x ?? 130 + (state.windows.length % 7) * 28}px`;
  win.style.top = `${y ?? 76 + (state.windows.length % 7) * 26}px`;
  win.addEventListener('pointerdown', () => { state.z += 1; win.style.zIndex = state.z; });
  win.querySelector('.title').addEventListener('pointerdown', (e) => {
    if (e.target.closest('.traffic')) return;
    const sx = e.clientX, sy = e.clientY;
    const ox = win.offsetLeft, oy = win.offsetTop;
    let zone = null;
    const move = (ev) => {
      win.style.left = `${Math.max(0, ox + ev.clientX - sx)}px`;
      win.style.top = `${Math.max(25, oy + ev.clientY - sy)}px`;
      zone = snapZone(ev);
      showTilePreview(zone);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      showTilePreview(null);
      if (zone) tileWindow(w, zone);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    e.preventDefault();
  });
  $('#windows').append(win);
  state.windows.push(w);
  state.z += 1;
  win.style.zIndex = state.z;
  updateDockDots();
  return w;
}
function closeWindow(w) {
  if (!w || !w.el) return;
  w.el.classList.add('closing');
  setTimeout(() => w.el.remove(), 150);
  state.windows = state.windows.filter((x) => x !== w);
  updateDockDots();
}
function dialog({ title, message, buttons = ['OK'] }) {
  return new Promise((resolve) => {
    const shield = el('div', { class: 'modal-shield' });
    const dlg = el('div', { class: 'dialog' },
      el('div', { class: 'dlg-title', text: title }),
      el('div', { class: 'dlg-body', text: message }),
      el('div', { class: 'btns' },
        ...buttons.map((b, i) => el('button', {
          class: 'btn' + (i === 0 ? ' default' : ''), text: b,
          onclick: () => { shield.remove(); dlg.remove(); resolve(i); },
        })),
      ),
    );
    $('#dialogs').append(shield, dlg);
  });
}

/* ============================================================ Focus */
const FOCUS_MODES = [
  ['Do Not Disturb', 'Silence everything but the important.'],
  ['Work', 'Let work people and apps through.'],
  ['Personal', 'Friends and family only.'],
  ['Sleep', 'The Mac rests, and so should you.'],
];

function setFocus(mode) {
  state.focus = mode;
  renderMenubar();
  renderControlCenter();
  if (mode) {
    const nc = $('#notifcenter');
    const note = el('div', { class: 'nc-notif' },
      el('b', { text: 'FOCUS' }),
      el('div', { text: `${mode} is on. Notifications will wait politely.` }));
    nc.prepend(note);
  }
}

/* ============================================================ menu bar */
function menus() {
  return [
    { apple: true, items: [
      { label: 'About This Mac', action: () => launch('about') },
      { sep: true },
      { label: 'System Settings…', action: () => launch('sysprefs') },
      { label: 'App Store…', action: () => dialog({ title: 'App Store', message: 'The museum ships no apps from the store.' }) },
      { sep: true },
      { label: 'Sleep', action: () => dialog({ title: 'Sleep', message: 'Good night.' }) },
      { label: 'Restart…', action: () => restart() },
      { label: 'Shut Down…', action: () => dialog({ title: 'Shut Down', message: 'It is now safe to close the tab.' }) },
      { sep: true },
      { label: 'Lock Screen', key: '⌃⌘Q', action: () => dialog({ title: 'Lock Screen', message: 'Touch ID was not available at press time.' }) },
    ] },
    { title: 'Finder', bold: true, items: [
      { label: 'About Finder', action: () => launch('about') },
      { sep: true },
      { label: 'Settings…', key: '⌘,', action: () => launch('sysprefs') },
      { sep: true },
      { label: 'Empty Trash…', key: '⇧⌘⌫', action: () => dialog({ title: 'Empty Trash', message: 'The Trash is empty.' }) },
    ] },
    { title: 'File', items: [
      { label: 'New Finder Window', key: '⌘N', action: () => launch('finder') },
      { label: 'New Quick Note', key: '⌘⌥N', action: () => launch('notes') },
      { sep: true },
      { label: 'Close Window', key: '⌘W', action: () => state.windows.length && closeWindow(state.windows[state.windows.length - 1]) },
    ] },
    { title: 'Edit', items: [
      { label: 'Undo', key: '⌘Z', dis: true },
      { label: 'Copy', key: '⌘C', dis: true },
      { label: 'Paste', key: '⌘V', dis: true },
    ] },
    { title: 'View', items: [
      { label: 'as Icons', key: '⌘1', action: () => {} },
      { label: 'as List', key: '⌘2', action: () => {} },
    ] },
    { title: 'Go', items: [
      { label: 'Recents', key: '⇧⌘F', action: () => launch('finder', { at: 'recents' }) },
      { label: 'Documents', key: '⇧⌘O', action: () => launch('finder', { at: 'documents' }) },
      { label: 'Downloads', key: '⌥⌘L', action: () => launch('finder', { at: 'downloads' }) },
      { label: 'Applications', key: '⇧⌘A', action: () => launch('finder', { at: 'applications' }) },
      { label: 'Shortcuts', action: () => launch('shortcuts') },
    ] },
    { title: 'Window', items: [
      { label: 'Fill', action: () => state.windows.length && tileWindow(state.windows[state.windows.length - 1], 'top') },
      { label: 'Left', action: () => state.windows.length && tileWindow(state.windows[state.windows.length - 1], 'left') },
      { label: 'Right', action: () => state.windows.length && tileWindow(state.windows[state.windows.length - 1], 'right') },
      { label: 'Top Left', action: () => state.windows.length && tileWindow(state.windows[state.windows.length - 1], 'tl') },
      { label: 'Top Right', action: () => state.windows.length && tileWindow(state.windows[state.windows.length - 1], 'tr') },
      { sep: true },
      { label: 'Minimize', key: '⌘M', action: () => state.windows.length && closeWindow(state.windows[state.windows.length - 1]) },
    ] },
    { title: 'Help', items: [
      { label: 'macOS Help', action: () => launch('credits') },
    ] },
  ];
}

function renderMenubar() {
  const bar = $('#menubar');
  bar.innerHTML = '';
  const defs = menus();
  defs.forEach((def, i) => {
    const item = el('div', {
      class: 'mb-item' + (def.apple ? ' apple' : '') + (def.bold ? ' bold' : '') + (state.menuOpen === i ? ' open' : ''),
      onpointerdown: (e) => {
        e.preventDefault(); e.stopPropagation();
        if (state.menuOpen === i) closeMenu();
        else openMenu(i);
      },
    });
    if (def.apple) item.append(el('span', { html: SVG.apple }));
    else item.append(document.createTextNode(def.title));
    bar.append(item);
  });
  bar.append(el('div', { class: 'mb-right' },
    el('div', {
      class: 'focus-pill' + (state.focus ? ' on' : ''),
      onpointerdown: (e) => { e.stopPropagation(); toggleCC(true); },
    }, el('span', { html: SVG.moon }), el('span', { text: state.focus || '' })),
    el('div', { class: 'battery', title: 'Battery' }, el('i')),
    el('span', { class: 'glyph', title: 'Wi-Fi', html: SVG.wifi }),
    el('span', { class: 'glyph', title: 'Spotlight', html: SVG.search, onpointerdown: () => launch('finder') }),
    el('span', { class: 'glyph', title: 'Control Center', html: SVG.cc, onpointerdown: (e) => { e.stopPropagation(); toggleCC(); } }),
    el('span', { text: 'Mon Sep 15  9:41 AM', onpointerdown: (e) => { e.stopPropagation(); toggleNC(); } }),
  ));
}

let menuLayer = null;
function openMenu(i) {
  closeMenu();
  state.menuOpen = i;
  renderMenubar();
  const btnNow = $('#menubar').querySelectorAll('.mb-item')[i];
  const r = btnNow.getBoundingClientRect();
  const scr = $('#screen').getBoundingClientRect();
  const scale = scr.width / SCREEN_W || 1;
  menuLayer = el('div', { class: 'menu' });
  menuLayer.style.left = `${(r.left - scr.left) / scale}px`;
  menuLayer.style.top = `${(r.bottom - scr.top) / scale}px`;
  for (const it of menus()[i].items) {
    if (it.sep) { menuLayer.append(el('div', { class: 'sep' })); continue; }
    menuLayer.append(el('div', {
      class: 'mi' + (it.dis ? ' dis' : ''),
      onpointerup: () => { if (!it.dis) { closeMenu(); it.action && it.action(); } },
    }, document.createTextNode(it.label), it.key ? el('span', { class: 'key', text: it.key }) : null));
  }
  $('#screen').append(menuLayer);
}
function closeMenu() {
  menuLayer?.remove();
  menuLayer = null;
  state.menuOpen = -1;
  renderMenubar();
}
window.addEventListener('pointerdown', (e) => {
  const t = e.target && e.target.closest ? e.target : null;
  const inEl = (sel) => !!(t && t.closest(sel));
  if (state.menuOpen >= 0 && !(inEl('.menu') || inEl('.mb-item'))) closeMenu();
  if (state.ccOpen && !(inEl('#controlcenter') || inEl('.mb-right'))) toggleCC(false);
  if (state.ncOpen && !(inEl('#notifcenter') || inEl('.mb-right'))) toggleNC(false);
});

/* ============================================================ CC + NC */
function renderControlCenter() {
  const cc = $('#controlcenter');
  cc.innerHTML = '';
  const wht = (h) => h.replace(/#111/g, '#fff');
  const icon = (html, cls) => el('div', { class: 'cc-ic' + (cls ? ' ' + cls : ''), html });
  const row = (icEl, nm, sb, on, sel) => el('div', {
    class: 'cc-row' + (sel ? ' sel' : ''),
    onpointerdown: (e) => { e.stopPropagation(); if (on) on(e); },
  }, icEl, el('div', {}, el('div', { class: 'nm', text: nm }), el('div', { class: 'sb', text: sb })));
  const menu = el('div', { class: 'focus-menu', style: 'display:none' },
    ...FOCUS_MODES.map(([m, d]) => el('div', {
      class: 'fmode' + (state.focus === m ? ' sel' : ''),
      onpointerdown: (e) => { e.stopPropagation(); setFocus(state.focus === m ? null : m); },
    }, el('b', { text: m }), el('span', { class: 'grow', style: 'opacity:.75;font-size:11px', text: d }))));
  cc.append(
    el('div', { class: 'cc-tiles' },
      el('div', { class: 'cc-tile' },
        row(icon(wht(SVG.wifi)), 'Wi-Fi', 'Museum-5G'),
        row(icon(wht(SVG.bt), 'gray'), 'Bluetooth', 'On'),
        row(icon(wht(SVG.airdrop), 'gray'), 'AirDrop', 'Contacts Only'),
      ),
      el('div', { class: 'cc-tile' },
        row(icon(wht(SVG.moon)), 'Focus', state.focus ? `${state.focus} \u2014 on` : 'Off',
          () => { menu.style.display = menu.style.display === 'none' ? '' : 'none'; }, !!state.focus),
        row(icon('\u25a3', 'gray'), 'Screen Mirroring', 'Off'),
        row(icon('\u29c9', 'gray'), 'Stage Manager', state.stage ? 'On' : 'Off', () => { state.stage = !state.stage; renderControlCenter(); }, !!state.stage),
        row(icon('\u260e', 'gray'), 'iPhone Mirroring', 'Not connected', () => dialog({ title: 'iPhone Mirroring', message: 'Your iPhone is in another museum. Continuity Camera is also unavailable at press time.' })),
        menu,
      ),
    ),
    el('div', { class: 'cc-tile cc-full', style: 'margin-top:10px' },
      el('div', { class: 'big' }, icon(wht(SVG.sun)), el('span', { text: 'Display' })),
      el('div', { class: 'cc-slider' }, el('i', { style: 'right:32%' }))),
    el('div', { class: 'cc-tile cc-full', style: 'margin-top:10px' },
      el('div', { class: 'big' }, icon('\u266a'), el('span', { text: 'Sound' })),
      el('div', { class: 'cc-slider' }, el('i', { style: 'right:52%' }))),
    el('div', { class: 'cc-label', text: 'Now Playing' }),
    el('div', { class: 'cc-tile cc-full' },
      el('div', { class: 'big' }, icon('\u266a', 'gray'), el('span', { text: 'Not Playing' })),
      el('div', { class: 'sub', text: 'SharePlay is standing by.' })),
  );
}
function toggleCC(force) {
  state.ccOpen = force ?? !state.ccOpen;
  $('#controlcenter').style.display = state.ccOpen ? 'block' : 'none';
  if (state.ccOpen) { toggleNC(false); renderControlCenter(); }
}
function renderNotifCenter() {
  const nc = $('#notifcenter');
  nc.innerHTML = '';
  nc.append(
    el('div', { class: 'nc-widget nc-cal' },
      el('h3', { text: 'Calendar' }),
      el('div', { class: 'day', text: 'Monday' }),
      el('div', { class: 'date', text: '15 September' }),
      el('div', { style: 'margin-top:6px;opacity:.75', text: 'No events today' })),
    el('div', { class: 'nc-widget' },
      el('h3', { text: 'Weather' }),
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
        el('div', {}, el('div', { style: 'font-size:19px;font-weight:300', text: '58°' }), el('div', { style: 'opacity:.7', text: 'Cupertino' })),
        el('div', { text: '☀', style: 'font-size:26px' }))),
    el('div', { class: 'nc-notif' }, el('b', { text: 'SHORTCUTS' }), el('div', { text: 'Your "Shuffle Wallpaper" automation ran. The desktop is wearing a new gradient.' })),
    el('div', { class: 'nc-notif' }, el('b', { text: 'REMINDERS' }), el('div', { text: 'Try Universal Control between the iMac and the MacBook (in the museum)' })),
  );
}
function toggleNC(force) {
  state.ncOpen = force ?? !state.ncOpen;
  $('#notifcenter').style.display = state.ncOpen ? 'block' : 'none';
  if (state.ncOpen) { toggleCC(false); renderNotifCenter(); }
}

/* ============================================================ Dock */
const DOCK = [
  ['finder', 'Finder', 'finder'], ['safari', 'Safari', 'safari'], ['mail', 'Mail', 'mail'],
  ['messages', 'Messages', 'messages'], ['music', 'Music', 'music'], ['photos', 'Photos', 'photos'],
  ['passwords', 'Passwords', 'passwords'], ['calculator', 'Calculator', 'calculator'], ['phone', 'Phone', 'phone'], ['games', 'Games', 'games'], ['notes', 'Notes', 'notes'],
  ['calendar', 'Calendar', 'calendar'], ['syssettings', 'System Settings', 'sysprefs'],
  ['terminal', 'Terminal', 'terminal'],
  { sep: true },
  ['trash', 'Trash', 'trash'],
];

function renderDock() {
  const dock = $('#dock');
  dock.innerHTML = '';
  for (const it of DOCK) {
    if (it.sep) { dock.append(el('div', { class: 'sep' })); continue; }
    const [name, label, app] = it;
    dock.append(el('div', {
      class: 'tile', 'data-app': app, title: label,
      onpointerdown: () => launch(app),
    }, iconEl(name, 58), el('div', { class: 'dot' })));
  }
}
function updateDockDots() {
  const running = new Set(state.windows.map((w) => w.app));
  for (const tile of $('#dock').querySelectorAll('.tile')) {
    tile.classList.toggle('running', running.has(tile.dataset.app));
  }
}

/* ============================================================ desktop */
const WALLPAPERS = [
  'radial-gradient(1150px 700px at 24% 92%, rgba(120, 190, 255, .75), transparent 62%), radial-gradient(1000px 660px at 80% 8%, rgba(200, 222, 255, .9), transparent 60%), radial-gradient(820px 520px at 55% 70%, rgba(255, 255, 255, .55), transparent 58%), linear-gradient(160deg, #dcecff 0%, #9cc0f2 40%, #5b86d8 72%, #2f5cb8 100%)',
  'radial-gradient(1150px 680px at 24% 92%, rgba(140, 200, 255, .8), transparent 60%), radial-gradient(960px 640px at 80% 12%, rgba(235, 180, 120, .7), transparent 62%), linear-gradient(160deg, #cfe6ff 0%, #a8c4ee 48%, #6f7fd0 100%)',
  'radial-gradient(1100px 660px at 26% 92%, rgba(180, 220, 255, .85), transparent 60%), radial-gradient(940px 620px at 82% 10%, rgba(120, 160, 240, .85), transparent 62%), linear-gradient(160deg, #e8f2ff 0%, #9dbdf0 55%, #4f73c8 100%)',
];
function renderDesktop() {
  const desk = $('#desktop');
  desk.innerHTML = '';
  const hd = el('div', { class: 'dicon', style: 'right: 22px; top: 16px;' },
    iconEl('harddisk', 76),
    el('div', { class: 'lbl', text: 'Macintosh HD' }));
  hd.addEventListener('dblclick', () => launch('finder', { at: 'hd' }));
  desk.append(hd);
}
function shuffleWallpaper() {
  state.wallpaper = (state.wallpaper + 1) % WALLPAPERS.length;
  $('#screen').style.background = WALLPAPERS[state.wallpaper];
}

/* ============================================================ Finder */
function finderMake(at = 'recents') {
  const locations = {
    recents: { title: 'Recents', items: [
      ['Hello Tahoe.rtf', 'doc'], ['Focus schedule', 'notes'], ['Apple M4 Pro notes.txt', 'doc'], ['Shortcuts.app', 'shortcuts'],
    ] },
    documents: { title: 'Documents', items: [['Museum', 'folder'], ['Hello Tahoe.rtf', 'doc'], ['Read Me.txt', 'doc']] },
    downloads: { title: 'Downloads', items: [['Xcode_13.xip', 'app'], ['Tahoe Notes.pdf', 'doc']] },
    applications: { title: 'Applications', items: [
      ['Safari', 'safari'], ['Mail', 'mail'], ['Messages', 'messages'], ['Music', 'music'], ['Photos', 'photos'],
      ['Shortcuts', 'shortcuts'], ['Notes', 'notes'], ['Calendar', 'calendar'], ['System Preferences', 'sysprefs'],
      ['Terminal', 'terminal'], ['App Store', 'appstore'], ['Calculator', 'calculator'], ['TextEdit', 'textedit'],
    ] },
    hd: { title: 'Macintosh HD', items: [['Applications', 'appsFolder'], ['Library', 'folder'], ['System', 'systemFolder'], ['Users', 'home']] },
  };
  const grid = el('div', { class: 'fgrid' });
  const status = el('div', { class: 'fstatus' });
  const side = el('div', { class: 'finder-side' },
    el('h4', { text: 'Favorites' }),
    ...[['airdrop', 'AirDrop', 'recents'], ['sbRecents', 'Recents', 'recents'], ['appsFolder', 'Applications', 'applications'],
        ['sbDesktop', 'Desktop', 'recents'], ['docsFolder', 'Documents', 'documents'], ['downloads', 'Downloads', 'downloads']]
      .map(([ic, lb, key]) => el('div', {
        class: 'row' + (key === at ? ' sel' : ''), 'data-key': key,
        onpointerdown: () => render(key),
      }, iconEl(ic, 18), el('span', { text: lb }))),
    el('h4', { text: 'iCloud' }),
    el('div', { class: 'row' }, iconEl('sbCloud', 18), el('span', { text: 'iCloud Drive' })),
    el('h4', { text: 'Locations' }),
    el('div', { class: 'row', 'data-key': 'hd', onpointerdown: () => render('hd') }, iconEl('harddisk', 18), el('span', { text: 'Macintosh HD' })),
    el('div', { class: 'row' }, iconEl('network', 18), el('span', { text: 'Network' })),
  );
  const body = el('div', { class: 'win-body' },
    el('div', { class: 'finder-layout' }, side,
      el('div', { class: 'finder-main' }, grid, status),
    ),
  );
  const titleLeft = el('div', { class: 'tl-extra' },
    el('span', { class: 'nav', text: '\u2039' }), el('span', { class: 'nav', text: '\u203a' }),
  );
  const titleRight = el('div', { class: 'tr-extra' },
    el('div', { class: 'grow' }),
    el('span', { class: 'seg', text: '\u229e \u229f \u22a4' }),
    el('span', { class: 'seg', text: '\u22ef' }),
    el('span', { class: 'srch' }, el('span', { html: SVG.search }), el('span', { style: 'margin-left:5px', text: 'Search' })),
  );
  const w = makeWindow({
    title: (locations[at] || locations.recents).title,
    leftTitle: true, titleLeft, titleRight,
    app: 'finder', width: 900, height: 560, body,
  });
  function render(key) {
    const loc = locations[key] || locations.recents;
    grid.innerHTML = '';
    for (const [name, icon] of loc.items) {
      const item = el('div', { class: 'fitem' }, iconEl(icon, 56), el('span', { class: 'lbl', text: name }));
      item.addEventListener('click', () => {
        grid.querySelectorAll('.fitem').forEach((f) => f.classList.remove('sel'));
        item.classList.add('sel');
      });
      item.addEventListener('dblclick', () => {
        const app = name.toLowerCase().replace(/\.app/, '').split(' ')[0];
        launch(app) || launch('textedit', { doc: 'A museum document.' });
      });
      grid.append(item);
    }
    status.textContent = `${loc.items.length} items, 512 GB SSD, 342.18 GB available`;
    w.setTitle(loc.title);
    side.querySelectorAll('.row[data-key]').forEach((r) => r.classList.toggle('sel', r.dataset.key === key));
  }
  render(at);
  return w;
}

/* ============================================================ Safari (tab groups) */
function safariMake() {
  const tabs = [
    ['Apple', 'apple.com', 'Apple \u2014 macOS Tahoe 26. Liquid Glass, the Phone app, the Games app and Live Activities.'],
    ['MacRumors', 'macrumors.com', 'macOS 26 review: the museum keeps booting \u2014 glass everywhere, and not a crack in sight.'],
    ['Museum Wall', 'localhost', 'Welcome back to the Macintosh-OS museum. Fourteen systems boot today.'],
  ];
  const content = el('div', { style: 'padding:20px 26px;font-size:13px;line-height:1.55' });
  const bar = el('div', { class: 'safari-tabs' });
  const urlText = el('span', { text: tabs[0][1] });
  const setTab = (i) => {
    for (const n of bar.children) n.classList.remove('sel');
    bar.children[i].classList.add('sel');
    urlText.textContent = tabs[i][1];
    content.innerHTML = '';
    content.append(
      el('div', { style: 'font-size:16px;font-weight:600;margin-bottom:8px', text: tabs[i][0] }),
      el('div', { text: tabs[i][2] }),
    );
  };
  tabs.forEach(([name], i) => {
    const tab = el('div', { class: 'tab' }, document.createTextNode(name), el('span', { class: 'x', text: '\u00d7' }));
    tab.addEventListener('pointerdown', () => setTab(i));
    bar.append(tab);
  });
  const body = el('div', { class: 'win-body' },
    el('div', { class: 'safari-tb' },
      el('span', { class: 'nav', text: '\u2039' }), el('span', { class: 'nav', text: '\u203a' }),
      el('div', { class: 'url' }, el('span', { html: SVG.lock || '' }), urlText),
      el('span', { class: 'nav', text: '\u2191' }),
    ),
    content,
  );
  const w = makeWindow({
    title: 'Safari', hideTitle: true,
    titleLeft: el('div', { class: 'tl-extra' }, el('span', { class: 'nav', text: '\u25a5' })),
    titleRight: bar,
    app: 'safari', width: 820, height: 520, body,
  });
  setTab(0);
  return w;
}

/* ============================================================ Shortcuts */
function shortcutsBody() {
  return el('div', { class: 'win-body' },
    el('div', { class: 'shortcuts-grid' },
      el('div', {
        class: 'sc',
        onpointerdown: () => { shuffleWallpaper(); dialog({ title: 'Shortcuts', message: 'Wallpaper shuffled. The desktop is wearing a new gradient.' }); },
      },
        el('div', { class: 'top', style: 'background:linear-gradient(135deg,#58c8e8,#b48cf0)', text: '🎨' }),
        el('div', { class: 'btm' }, el('b', { text: 'Shuffle Wallpaper' }), el('div', { style: 'opacity:.7', text: 'Sets a new desktop gradient.' }))),
      el('div', {
        class: 'sc',
        onpointerdown: () => setFocus(state.focus === 'Do Not Disturb' ? null : 'Do Not Disturb'),
      },
        el('div', { class: 'top', style: 'background:linear-gradient(135deg,#5a67d8,#2c3a8c)', text: '☾' }),
        el('div', { class: 'btm' }, el('b', { text: 'Evening Focus' }), el('div', { style: 'opacity:.7', text: 'Toggles Do Not Disturb.' }))),
      el('div', {
        class: 'sc',
        onpointerdown: () => launch('credits'),
      },
        el('div', { class: 'top', style: 'background:linear-gradient(135deg,#f2785c,#b04a86)', text: '🏛' }),
        el('div', { class: 'btm' }, el('b', { text: 'Museum Tour' }), el('div', { style: 'opacity:.7', text: 'Opens the Credits.' }))),
    ),
  );
}

/* ============================================================ Passwords + Calculator */
function passwordsMake() {
  const items = [
    ['apple.com', 'steve', 'Saved in iCloud Keychain'],
    ['museum.local', 'curator', 'Passkey'],
    ['developer.apple.com', 'steve', 'Saved in iCloud Keychain'],
    ['apple.com', 'macintosh1984', 'Saved in iCloud Keychain'],
    ['icloud.com', 'steve', 'Saved in iCloud Keychain'],
  ];
  const main = el('div', { class: 'pw-main' });
  const showList = (title) => {
    main.innerHTML = '';
    main.append(el('h3', { text: title }));
    for (const [site, user, kind] of items.slice(0, title === 'All Items' ? 5 : 2)) {
      main.append(el('div', { class: 'pw-item' },
        iconEl('keychain', 26),
        el('div', {}, el('b', { text: site }), el('div', { style: 'opacity:.65;font-size:11px', text: user + ' \u00b7 ' + kind })),
        el('span', { style: 'opacity:.4;margin-left:auto', text: '\u203a' })));
    }
    main.append(el('div', { style: 'opacity:.55;font-size:10px;margin-top:14px', text: 'The vault is theatre \u2014 no real passwords live here.' }));
  };
  const side = el('div', { class: 'pw-side' },
    ...['All Items', 'Passkeys', 'Wi-Fi', 'Security', 'Deleted'].map((t) => el('div', {
      class: 'pw-row', onpointerdown: () => showList(t),
    }, iconEl(t === 'Deleted' ? 'trash' : t === 'Wi-Fi' ? 'network' : t === 'Passkeys' ? 'locked' : 'keychain', 18), el('span', { text: t }))),
  );
  showList('All Items');
  return makeWindow({
    title: 'Passwords', app: 'passwords', width: 660, height: 430,
    body: el('div', { class: 'win-body pw-win' }, side, main),
  });
}

function calcMake() {
  let cur = '0', acc = null, op = null, fresh = true;
  const disp = el('div', { class: 'calc-disp', text: '0' });
  const set = () => { disp.textContent = cur.length > 12 ? String(Number(cur).toPrecision(9)) : cur; };
  const digit = (d) => {
    if (fresh) { cur = d === '.' ? '0.' : d; fresh = false; }
    else if (!(d === '.' && cur.includes('.')) && cur.length < 12) cur += d;
    set();
  };
  const apply = () => {
    if (acc !== null && op) {
      const a = parseFloat(acc), b = parseFloat(cur);
      cur = String(op === '+' ? a + b : op === '\u2212' ? a - b : op === '\u00d7' ? a * b : (b === 0 ? 'Error' : a / b));
      if (cur.length > 12) cur = String(Number(cur).toPrecision(9));
      acc = null; op = null; set();
    }
  };
  const doOp = (o) => { apply(); acc = cur; op = o; fresh = true; };
  const btn = (t, cls, fn) => el('div', { class: 'calc-btn ' + (cls || ''), onpointerdown: fn }, t);
  const grid = el('div', { class: 'calc-grid' },
    btn('AC', 'fn', () => { cur = '0'; acc = null; op = null; fresh = true; set(); }),
    btn('\u00b1', 'fn', () => { cur = String(-parseFloat(cur)); set(); }),
    btn('%', 'fn', () => { cur = String(parseFloat(cur) / 100); set(); }),
    btn('\u00f7', 'op', () => doOp('\u00f7')),
    btn('7', '', () => digit('7')), btn('8', '', () => digit('8')), btn('9', '', () => digit('9')),
    btn('\u00d7', 'op', () => doOp('\u00d7')),
    btn('4', '', () => digit('4')), btn('5', '', () => digit('5')), btn('6', '', () => digit('6')),
    btn('\u2212', 'op', () => doOp('\u2212')),
    btn('1', '', () => digit('1')), btn('2', '', () => digit('2')), btn('3', '', () => digit('3')),
    btn('+', 'op', () => doOp('+')),
    btn('0', 'wide', () => digit('0')), btn('.', '', () => digit('.')),
    btn('=', 'op', () => { apply(); }),
  );
  return makeWindow({
    title: 'Calculator', app: 'calculator', width: 300, height: 440,
    body: el('div', { class: 'win-body calcwin' },
      el('div', { class: 'calc-modes' }, ...['Basic', 'Scientific', 'Convert', 'Programmer'].map((m, i) => el('span', { class: i === 0 ? 'sel' : '', text: m }))),
      disp, grid,
      el('div', { style: 'opacity:.55;font-size:10px;text-align:center;padding:8px', text: 'Math Notes: type an equation in Notes and it solves itself \u2014 not here.' })),
  });
}

/* ============================================================ apps */
function aboutBody() {
  return el('div', { class: 'win-body' },
    el('div', { class: 'about11' },
      iconEl('laptop', 190),
      el('h1', { text: 'MacBook Pro' }),
      el('div', { class: 'sub', text: '14-inch, M4 Pro, 2024' }),
      el('div', { class: 'rows' },
        el('div', {}, el('span', { text: 'Chip' }), el('b', { text: 'Apple M4 Pro' })),
        el('div', {}, el('span', { text: 'Memory' }), el('b', { text: '24 GB' })),
        el('div', {}, el('span', { text: 'Startup disk' }), el('b', { text: 'Macintosh HD' })),
        el('div', {}, el('span', { text: 'Serial number' }), el('b', { text: 'C02ZW1JQ6L4' })),
      ),
      el('div', { class: 'os' }, el('b', { text: 'macOS Tahoe 26' }),
        el('small', { text: 'Version 26.0' })),
      el('div', { class: 'btns' },
        el('button', { class: 'btn', text: 'Software Update…', onclick: () => dialog({ title: 'Software Update', message: 'Your Mac is up to date — with itself.' }) }),
        el('button', { class: 'btn', text: 'System Report…', onclick: () => dialog({ title: 'System Information', message: 'MacBook Pro (14-inch, M4 Pro, 2024) · Apple M4 Pro (12-core CPU, 16-core GPU) · 24 GB · 512 GB SSD · Liquid Retina XDR display.' }) }),
        el('button', { class: 'btn default', text: 'More Info…', onclick: () => dialog({ title: 'What’s New in Tahoe', message: 'Liquid Glass — the first big redesign since Big Sur — plus the Phone app, the Games app, Live Activities and a translucent Dock. Released 15 September 2025.' }) }),
      ),
    ),
  );
}

function settingsMake() {
  const GROUPS = [
    [['network', 'Wi-Fi'], ['airdrop', 'Bluetooth'], ['network', 'Network'], ['notifications', 'Notifications'],
     ['music', 'Sound'], ['focus', 'Focus'], ['calendar', 'Screen Time']],
    [['syssettings', 'General'], ['sbDesktop', 'Appearance'], ['user', 'Accessibility'], ['displays', 'Control Center'],
     ['siri', 'Siri & Spotlight'], ['locked', 'Privacy & Security']],
    [['finder', 'Desktop & Dock'], ['displays', 'Displays'], ['photos', 'Wallpaper'], ['preview', 'Screen Saver'],
     ['laptop', 'Battery'], ['keychain', 'Lock Screen'], ['home', 'Users & Groups']],
    [['mail', 'Internet Accounts'], ['chess', 'Game Center'], ['keychain', 'Wallet & Apple Pay'],
     ['keyboard', 'Keyboard'], ['trackpad', 'Trackpad'], ['mouse', 'Mouse'], ['server', 'Printers & Scanners'],
     ['quicktime', 'Date & Time'], ['extdisk', 'Time Machine'], ['cautionBadge', 'Transfer or Reset'],
     ['softwareupdate', 'Software Update']],
  ];
  const SPECIAL = {
    'General': [['About', MACHINE + ' \u00b7 ' + CHIP], ['Software Update', OSNAME + ' ' + OSVER + ' \u2014 your Mac is up to date.'], ['Storage', 'Macintosh HD \u00b7 256 GB SSD'], ['AirDrop & Handoff', 'Contacts Only \u00b7 Handoff on'], ['Login Items & Extensions', '3 items open at login'], ['Language & Region', 'English (US) \u00b7 United States'], ['Sharing', 'Computer name: ' + MACHINE.split(' (')[0]]],
    'Wi-Fi': [['Wi-Fi', 'On'], ['Museum-5G', '\u2713 Connected \u00b7 3 bars'], ['Other Networks\u2026', 'Museum-Guest']],
    'Software Update': [['Automatic Updates', 'On'], [OSNAME + ' ' + OSVER, 'Build ' + OSBUILD + ' \u2014 this museum is already pretending to be it.']],
    'Focus': [['Focus', 'Modes live in the Control Center \u2014 try the moon in the menu bar.']],
    'Displays': [['Brightness', '\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u258c\u258c 82%'], ['Resolution', 'Default for display \u00b7 ' + SCREEN_W + ' \u00d7 ' + SCREEN_H], ['Night Shift', 'Off until sunrise'], ['True Tone', 'On']],
    'Wallpaper': [['Desktop picture', 'Museum gradient (not Apple\u2019s)'], ['Shuffle', 'On \u2014 every 30 minutes'], ['Show on all Spaces', 'On']],
    'Sound': [['Alert sound', 'Boop'], ['Output volume', '\u2588\u2588\u2588\u2588\u2588\u2588\u258c\u258c\u258c\u258c 60%'], ['Show Sound in menu bar', 'On']],
    'Battery': [['Battery health', 'Normal \u00b7 100% capacity'], ['Show battery percentage', 'On'], ['Turn display off on battery', '2 minutes']],
    'Desktop & Dock': [['Size', '\u2588\u2588\u2588\u2588\u2588\u258c\u258c\u258c\u258c 60%'], ['Magnification', 'Off'], ['Position on screen', 'Bottom'], ['Minimize windows using', 'Genie effect'], ['Stage Manager', 'Off']],
    'Siri & Spotlight': [['Siri', 'Off'], ['Spotlight', 'Search this Mac'], ['Ask Siri', 'Press \u2318 Space']],
    'Privacy & Security': [['Location Services', 'Off'], ['Full Disk Access', 'Terminal'], ['FileVault', 'On']],
    'Touch ID & Password': [['Touch ID', 'Finger 1 \u00b7 Unlocking the Mac'], ['Add fingerprint\u2026', ''], ['Password', 'Last changed 24 October 2022']],
    'Users & Groups': [['Steve Jobs', 'Admin'], ['Guest User', 'Off'], ['Add User\u2026', '']],
    'Keyboard': [['Key repeat rate', '\u2588\u2588\u2588\u2588\u2588\u2588\u258c\u258c\u258c 60%'], ['Adjust keyboard brightness in low light', 'On'], ['Dictation', 'Off']],
  };
  const pane = el('div', { class: 'set-pane' });
  const side = el('div', { class: 'set-side' },
    el('div', { class: 'set-search', text: 'Search' }),
  );
  const showPane = (name, icon) => {
    side.querySelectorAll('.set-row').forEach((r) => r.classList.toggle('sel', r.dataset.name === name));
    pane.innerHTML = '';
    pane.append(el('h2', {}, iconEl(icon, 30), el('span', { style: 'margin-left:10px', text: name })));
    const rows = SPECIAL[name] || [['', 'This pane would open here. This museum ships the sidebar, not every switch.']];
    for (const [label, value] of rows) {
      pane.append(el('div', { class: 'set-item' },
        el('div', {}, label ? el('b', { text: label }) : null, el('div', { style: 'opacity:.65;margin-top:2px', text: value })),
        (name === 'Wi-Fi' || name === 'Wallpaper')
          ? el('div', { class: 'toggle' + (value === 'On' || value.includes('Connected') || value.includes('Shuffle') ? '' : ' off'), onclick: () => {} }, el('i'))
          : el('span', { style: 'opacity:.4', text: '\u203a' })));
    }
  };
  GROUPS.forEach((group, gi) => {
    if (gi) side.append(el('div', { class: 'set-sep' }));
    for (const [icon, name] of group) {
      side.append(el('div', {
        class: 'set-row', 'data-name': name,
        onpointerdown: () => showPane(name, icon),
      }, iconEl(icon, 20), el('span', { text: name })));
    }
  });
  const w = makeWindow({
    title: 'System Settings', app: 'sysprefs', width: 760, height: 580,
    body: el('div', { class: 'win-body set-win' }, side, pane),
  });
  showPane('General', 'syssettings');
  return w;
}


const TERM_HELP = `Available commands:
  help      this list
  ls        list directory
  date      today's date
  uname     system name
  whoami    current user
  sw_vers   macOS version
  echo      print text
  clear     clear the screen
  exit      close the window`;

function terminalBody() {
  const out = el('div', { class: 'term' });
  const print = (s) => { out.append(document.createTextNode(s + '\n')); out.scrollTop = out.scrollHeight; };
  print('Last login: Mon Sep 15 09:31:42 on ttys000');
  print("Type 'help' for the museum's small shell.\n");
  const line = el('div', {});
  const prompt = () => {
    line.innerHTML = '';
    const input = el('input', {
      style: 'background:transparent;border:0;outline:0;color:#e9e9ea;font:inherit;width:75%',
      onkeydown: (e) => {
        if (e.key !== 'Enter') return;
        const cmd = input.value;
        print('steve@MacBook-Pro ~ % ' + cmd);
        const [c, ...rest] = cmd.trim().split(/\s+/);
        switch (c) {
          case '': break;
          case 'help': print(TERM_HELP); break;
          case 'ls': print('Applications   Desktop   Documents   Downloads   Library   Movies   Music   Pictures   Public'); break;
          case 'date': print(new Date().toString()); break;
          case 'uname': print('Darwin MacBook-Pro.local 25.0.0 Darwin Kernel Version 25.0.0: root:xnu-11407.0.41.502.4~1/RELEASE_ARM64_T6040 arm64'); break;
          case 'whoami': print('steve'); break;
          case 'sw_vers': print('ProductName:\tmacOS\nProductVersion:\t26.0\nBuildVersion:\t25A354'); break;
          case 'echo': print(rest.join(' ')); break;
          case 'clear': out.innerHTML = ''; break;
          case 'exit': closeWindow(state.windows.find((w) => w.el.contains(out))); return;
          default: print(`zsh: command not found: ${c} (this is a museum, not a terminal)`);
        }
        prompt();
      },
    });
    line.append(el('span', { class: 'prompt', text: 'steve@MacBook-Pro ~ % ' }), input);
    out.append(line);
    input.focus();
  };
  out.addEventListener('pointerup', () => line.querySelector('input')?.focus());
  prompt();
  return el('div', { class: 'win-body' }, out);
}

function creditsBody() {
  return el('div', { class: 'win-body' },
    el('div', { class: 'credits11', html: `
<h1>Credits &amp; sources</h1>
<p class="fine">macOS Tahoe \u2014 web clone. A homage to the 15 September 2025 release on a MacBook Pro (14-inch, M4 Pro, 2024).</p>
<h2>Icon credits</h2>
<ul>
<li><b>All application and system icons are the official Big Sur-family
icon artwork</b> (Sequoia kept Big Sur\u2019s design), extracted from macOS
system software (.icns containers, PNG representations) via
<b>github.com/KevinGutowski/Big-Sur-Icons</b>.</li>
<li><b>Museum drawings:</b> the drawn pane and utility icons (Passwords and System Settings),
the Shortcuts icon, the Focus and Keyboard/Mouse/Trackpad pane icons,
the Apple logo (startup screen and menu bar), the menu-bar glyphs and
the wallpaper gradients. Apple\u2019s icon artwork is the property of
Apple Inc., used for study and nostalgia.</li>
<li>The type is the platform UI stack (Helvetica/Arial fallbacks); SF Pro
is Apple\u2019s and is not included. No Apple fonts, sounds or firmware.</li>
</ul>
<h2>The system</h2>
<p><b>macOS Tahoe</b> (15 September 2025) \u2014 Liquid Glass, the Phone and Games apps, Live Activities, and window tiling that still snaps. Sources: Apple, Wikipedia.</p>
<h2>What is honestly not here</h2>
<ul>
<li><b>iPhone Mirroring shows no iPhone; the Passwords vault is theatre.</b></li>
<li>The wallpaper gradients are the museum\u2019s own, not Apple\u2019s
desktop pictures.</li>
</ul>
<h2>Clone-only conveniences</h2>
<ul>
<li>Windows do not persist; the console API <code>window.mac</code> is
museum furniture.</li>
<li>The launcher wall links back to the whole museum.</li>
</ul>
<p class="fine">Part of the Macintosh-OS museum. Mac, Macintosh, macOS,
Sequoia and the Apple logo are trademarks of Apple Inc. This is an
homage for study and nostalgia, not an Apple product.</p>` }),
  );
}


const APPS = {
  finder: { make(opts) { return finderMake(opts?.at); } },
  about: { make() { return makeWindow({ title: '', app: 'about', width: 420, height: 520, body: aboutBody() }); } },
  sysprefs: { make() { return settingsMake(); } },
  terminal: { make() { return makeWindow({ title: 'steve — -zsh — 80×24', app: 'terminal', width: 620, height: 360, body: terminalBody() }); } },
  credits: { make() { return makeWindow({ title: 'Credits', app: 'credits', width: 620, height: 520, body: creditsBody() }); } },
  safari: { make() { return safariMake(); } },
  passwords: { make() { return passwordsMake(); } },
  phone: {
    make() {
      return makeWindow({
        title: 'Phone', app: 'phone', width: 420, height: 340,
        body: el('div', { class: 'win-body' }, el('div', { style: 'padding:28px;text-align:center' },
          el('div', { style: 'font-size:14px;font-weight:600', text: 'Phone' }),
          el('div', { style: 'margin-top:10px;font-size:12px;opacity:.72', text: 'Your iPhone is in another museum. Calls are unavailable at press time.' }))),
      });
    },
  },
  games: {
    make() {
      return makeWindow({
        title: 'Games', app: 'games', width: 520, height: 380,
        body: el('div', { class: 'win-body' }, el('div', { style: 'padding:28px;text-align:center' },
          el('div', { style: 'font-size:14px;font-weight:600', text: 'Games' }),
          el('div', { style: 'margin-top:10px;font-size:12px;opacity:.72', text: 'Game Mode is ready. The games are not \u2014 this museum collects desktops.' }))),
      });
    },
  },
  calculator: { make() { return calcMake(); } },
  shortcuts: { make() { return makeWindow({ title: 'Shortcuts', app: 'shortcuts', width: 560, height: 380, body: shortcutsBody() }); } },
  trash: {
    make() {
      return makeWindow({
        title: 'Trash', app: 'trash', width: 360, height: 240,
        body: el('div', { class: 'win-body' }, el('div', { style: 'padding:22px;font-size:12px;opacity:.7', text: 'Trash Empty — 0 items' })),
      });
    },
  },
};
for (const app of ['mail', 'messages', 'music', 'photos', 'notes', 'calendar']) {
  APPS[app] = {
    make() {
      return makeWindow({
        title: app[0].toUpperCase() + app.slice(1), app, width: 520, height: 360,
        body: el('div', { class: 'win-body' },
          el('div', { style: 'padding:28px;text-align:center' },
            el('div', { style: 'font-size:14px;font-weight:600', text: app[0].toUpperCase() + app.slice(1) }),
            el('div', { style: 'margin-top:10px;font-size:12px;opacity:.72', text: 'This app is represented by its official icon in the Dock. The museum collects desktops, not apps.' }))),
      });
    },
  };
}

function launch(app, opts) {
  const a = APPS[app];
  if (!a) return null;
  const tile = document.querySelector(`#dock .tile[data-app="${app}"]`);
  if (tile) {
    tile.classList.remove('bounce');
    void tile.offsetWidth;
    tile.classList.add('bounce');
    setTimeout(() => tile.classList.remove('bounce'), 700);
  }
  return a.make(opts);
}
function restart() {
  for (const w of [...state.windows]) closeWindow(w);
  started = false;
  const bar = document.querySelector('.boot-bar i');
  if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
  $('#boot').style.display = '';
}

/* ============================================================ boot */
function fitScreen() {
  const scr = $('#screen');
  const stage = $('#stage');
  const availW = Math.max(320, window.innerWidth - 28);
  const availH = Math.max(240, window.innerHeight - 96);
  const scale = Math.min(1, availW / SCREEN_W, availH / SCREEN_H);
  window.__macScale = scale;
  scr.style.transform = `scale(${scale})`;
  if (stage) stage.style.height = `${SCREEN_H * scale + 2}px`;
}

let started = false;
function startDesktop() {
  if (started) return;
  started = true;
  $('#boot').style.display = 'none';
  const bar = document.querySelector('.boot-bar i');
  if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
  launch('finder', { at: 'recents' });
  setTimeout(() => launch('about'), 200);
  setTimeout(() => launch('passwords'), 420);
}

function boot() {
  fitScreen();
  window.addEventListener('resize', fitScreen);
  renderMenubar();
  renderDock();
  renderDesktop();
  renderControlCenter();
  renderNotifCenter();
  $('#boot').addEventListener('pointerdown', startDesktop);
  window.mac = {
    launch, dialog, restart,
    windows: () => state.windows.map((w) => w.title),
    toggleCC, toggleNC, setFocus, shuffleWallpaper,
    focus: () => state.focus,
  };
}
boot();
