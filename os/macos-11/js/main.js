/* macOS Big Sur 11 (2020) — a browser recreation of the rounded redesign
   on a MacBook Pro (13-inch, M1, 2020). Official icon art per CREDITS.md. */

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

const OSNAME = 'macOS Big Sur';
const OSVER = '11.2.3';
const SCREEN_W = 1440;
const SCREEN_H = 900;
const state = { windows: [], z: 100, menuOpen: -1, ccOpen: false, ncOpen: false };

const SVG = {
  wifi: '<svg width="16" height="14" viewBox="0 0 16 14"><g fill="none" stroke="#111" stroke-width="1.4" stroke-linecap="round"><path d="M2 5.2a9 9 0 0 1 12 0"/><path d="M4.2 7.9a5.8 5.8 0 0 1 7.6 0"/></g><circle cx="8" cy="11" r="1.4" fill="#111"/></svg>',
  search: '<svg width="15" height="15" viewBox="0 0 15 15"><circle cx="6.2" cy="6.2" r="4.3" fill="none" stroke="#111" stroke-width="1.5"/><path d="M9.6 9.6 13.4 13.4" stroke="#111" stroke-width="1.7" stroke-linecap="round"/></svg>',
  apple: '<svg width="14" height="16" viewBox="0 0 14 16" aria-label="Apple"><path fill="#111" d="M9.6 2.1c.5-.6.8-1.4.7-2.1-.7 0-1.5.4-2 .9-.4.5-.8 1.3-.7 2 .8.1 1.5-.3 2-.8z"/><path fill="#111" d="M11.8 8.5c0-1.9 1.5-2.8 1.6-2.8-.9-1.3-2.2-1.4-2.7-1.5-1.1-.1-2.2.7-2.8.7-.6 0-1.5-.7-2.4-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.1-.3 5.3.9 7 .6.9 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6 1.1 0 1.4.6 2.3.6.9 0 1.5-.9 2.1-1.7.7-1 .9-1.9.9-2-.1 0-1.5-.6-1.5-2.7z"/></svg>',
  cc: '<svg width="17" height="13" viewBox="0 0 17 13"><rect x="1" y="1.5" width="15" height="4.2" rx="2.1" fill="none" stroke="#111" stroke-width="1.3"/><circle cx="4.2" cy="3.6" r="1.3" fill="#111"/><rect x="1" y="7.4" width="15" height="4.2" rx="2.1" fill="none" stroke="#111" stroke-width="1.3"/><circle cx="12.8" cy="9.5" r="1.3" fill="#111"/></svg>',
  moon: '<svg width="12" height="12" viewBox="0 0 12 12"><path fill="#111" d="M10.2 7.6A4.8 4.8 0 0 1 4.4 1.8a4.8 4.8 0 1 0 5.8 5.8z"/></svg>',
  bt: '<svg width="11" height="14" viewBox="0 0 11 14"><path fill="none" stroke="#111" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" d="M3 3.4 8.2 9.8 5.5 12.4V1.6L8.2 4.2 3 10.6"/></svg>',
  airdrop: '<svg width="15" height="15" viewBox="0 0 15 15"><g fill="none" stroke="#111" stroke-width="1.3" stroke-linecap="round"><path d="M4.4 9.4a4.6 4.6 0 0 1 6.2 0"/><path d="M6.2 11.3a2 2 0 0 1 2.6 0"/></g><path fill="#111" d="M7.5 3.2 10 7.6H5z"/></svg>',
  sun: '<svg width="15" height="15" viewBox="0 0 15 15"><circle cx="7.5" cy="7.5" r="2.8" fill="#111"/><g stroke="#111" stroke-width="1.3" stroke-linecap="round"><path d="M7.5 1v1.8M7.5 12.2V14M1 7.5h1.8M12.2 7.5H14M2.9 2.9l1.3 1.3M10.8 10.8l1.3 1.3M12.1 2.9l-1.3 1.3M4.2 10.8l-1.3 1.3"/></g></svg>',
  lock: '<svg width="11" height="13" viewBox="0 0 11 13"><rect x="1" y="5.5" width="9" height="6.5" rx="1.6" fill="#111"/><path fill="none" stroke="#111" stroke-width="1.3" d="M3.2 5.5V4a2.3 2.3 0 0 1 4.6 0v1.5"/></svg>',
};

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
function makeWindow({ title, glyph, app, width, height, x, y, body, leftTitle, titleLeft, titleRight, hideTitle }) {
  const win = el('div', { class: 'win' },
    el('div', { class: 'title' },
      el('div', { class: 'traffic' },
        el('div', { class: 'light close', onpointerdown: (e) => { e.stopPropagation(); closeWindow(w); } }),
        el('div', { class: 'light min', onpointerdown: (e) => { e.stopPropagation(); minimizeWindow(w); } }),
        el('div', { class: 'light zoom', onpointerdown: (e) => { e.stopPropagation(); zoomWindow(w); } }),
      ),
      glyph ? el('span', { class: 'glyph' }) : null,
      titleLeft || null,
      el('div', { class: 'wt' + (hideTitle ? ' hide' : ''), text: title }),
      titleRight || null,
    ),
    body,
  );
  if (leftTitle) win.classList.add('left-title');
  const w = {
    el: win, app, title, body,
    setTitle(t) { w.title = t; const wt = win.querySelector('.title .wt'); if (wt) wt.textContent = t; },
  };
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
  win.style.left = `${x ?? 120 + (state.windows.length % 7) * 28}px`;
  win.style.top = `${y ?? 70 + (state.windows.length % 7) * 26}px`;
  win.addEventListener('pointerdown', () => {
    state.z += 1;
    win.style.zIndex = state.z;
  });
  win.querySelector('.title').addEventListener('pointerdown', (e) => {
    if (e.target.closest('.traffic')) return;
    const sx = e.clientX, sy = e.clientY;
    const ox = win.offsetLeft, oy = win.offsetTop;
    const move = (ev) => {
      win.style.left = `${Math.max(0, ox + ev.clientX - sx)}px`;
      win.style.top = `${Math.max(25, oy + ev.clientY - sy)}px`;
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
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

/* ============================================================ menu bar */
function menus() {
  return [
    { apple: true, items: [
      { label: 'About This Mac', action: () => launch('about') },
      { sep: true },
      { label: 'System Preferences…', action: () => launch('sysprefs') },
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
      { label: 'New Folder', key: '⇧⌘N', dis: true },
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
      { label: 'as Columns', key: '⌘3', action: () => {} },
    ] },
    { title: 'Go', items: [
      { label: 'Recents', key: '⇧⌘F', action: () => launch('finder', { at: 'recents' }) },
      { label: 'Documents', key: '⇧⌘O', action: () => launch('finder', { at: 'documents' }) },
      { label: 'Downloads', key: '⌥⌘L', action: () => launch('finder', { at: 'downloads' }) },
      { label: 'Applications', key: '⇧⌘A', action: () => launch('finder', { at: 'applications' }) },
    ] },
    { title: 'Window', items: [
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
        else openMenu(i, e.currentTarget);
      },
    });
    if (def.apple) item.append(el('span', { html: SVG.apple }));
    else item.append(document.createTextNode(def.title));
    bar.append(item);
  });
  bar.append(el('div', { class: 'mb-right' },
    state.dnd ? el('span', { class: 'glyph', title: 'Do Not Disturb', html: SVG.moon, onpointerdown: (e) => { e.stopPropagation(); toggleCC(); } }) : null,
    el('div', { class: 'battery', title: 'Battery' }, el('i')),
    el('span', { class: 'glyph', title: 'Wi-Fi', html: SVG.wifi }),
    el('span', { class: 'glyph', title: 'Spotlight', html: SVG.search, onpointerdown: () => launch('finder') }),
    el('span', { class: 'glyph', title: 'Control Center', html: SVG.cc, onpointerdown: (e) => { e.stopPropagation(); toggleCC(); } }),
    el('span', { text: 'Mon Nov 16  2:14 PM', onpointerdown: (e) => { e.stopPropagation(); toggleNC(); } }),
  ));
}

let menuLayer = null;
function openMenu(i, btn) {
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
  cc.append(
    el('div', { class: 'cc-tiles' },
      el('div', { class: 'cc-tile' },
        row(icon(wht(SVG.wifi)), 'Wi-Fi', 'Museum-5G'),
        row(icon(wht(SVG.bt), 'gray'), 'Bluetooth', 'On'),
        row(icon(wht(SVG.airdrop), 'gray'), 'AirDrop', 'Contacts Only'),
      ),
      el('div', { class: 'cc-tile' },
        row(icon(wht(SVG.moon)), 'Do Not Disturb', state.dnd ? 'On' : 'Off',
          () => { state.dnd = !state.dnd; renderControlCenter(); renderMenubar(); }, !!state.dnd),
        row(icon('\u25a3', 'gray'), 'Screen Mirroring', 'Off'),
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
      el('div', { class: 'sub', text: 'The museum has no Music subscription.' })),
  );
}
function toggleCC(force) {
  state.ccOpen = force ?? !state.ccOpen;
  $('#controlcenter').style.display = state.ccOpen ? 'block' : 'none';
  if (state.ccOpen) toggleNC(false);
}
function renderNotifCenter() {
  const nc = $('#notifcenter');
  nc.innerHTML = '';
  nc.append(
    el('div', { class: 'nc-widget nc-cal' },
      el('h3', { text: 'Calendar' }),
      el('div', { class: 'day', text: 'Monday' }),
      el('div', { class: 'date', text: '16 November' }),
      el('div', { style: 'margin-top:6px;opacity:.75', text: 'No events today' })),
    el('div', { class: 'nc-widget' },
      el('h3', { text: 'Weather' }),
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
        el('div', {}, el('div', { style: 'font-size:19px;font-weight:300', text: '72°' }), el('div', { style: 'opacity:.7', text: 'Cupertino' })),
        el('div', { text: '☀', style: 'font-size:26px' }))),
    el('div', { class: 'nc-notif' }, el('b', { text: 'SOFTWARE UPDATE' }), el('div', { text: 'macOS Big Sur 11.2.3 is available. This museum is already pretending to be it.' })),
    el('div', { class: 'nc-notif' }, el('b', { text: 'REMINDERS' }), el('div', { text: 'Boot the G4 Cube (in the museum)' })),
  );
}
function toggleNC(force) {
  state.ncOpen = force ?? !state.ncOpen;
  $('#notifcenter').style.display = state.ncOpen ? 'block' : 'none';
  if (state.ncOpen) toggleCC(false);
}

/* ============================================================ Dock */
const DOCK = [
  ['finder', 'Finder', 'finder'], ['safari', 'Safari', 'safari'], ['mail', 'Mail', 'mail'],
  ['messages', 'Messages', 'messages'], ['music', 'Music', 'music'], ['photos', 'Photos', 'photos'],
  ['notes', 'Notes', 'notes'], ['calendar', 'Calendar', 'calendar'], ['sysprefs', 'System Preferences', 'sysprefs'],
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
function renderDesktop() {
  const desk = $('#desktop');
  desk.innerHTML = '';
  const hd = el('div', { class: 'dicon', style: 'right: 22px; top: 16px;' },
    iconEl('harddisk', 76),
    el('div', { class: 'lbl', text: 'Macintosh HD' }));
  hd.addEventListener('dblclick', () => launch('finder', { at: 'hd' }));
  desk.append(hd);
}

/* ============================================================ Finder */
function finderMake(at = 'recents') {
  const locations = {
    recents: { title: 'Recents', items: [
      ['Hello Big Sur.rtf', 'doc'], ['Screenshot 2020-11-16.png', 'photos'], ['M1 notes.txt', 'doc'], ['Keychain Export', 'keychain'],
    ] },
    documents: { title: 'Documents', items: [
      ['Museum', 'folder'], ['Hello Big Sur.rtf', 'doc'], ['Read Me.txt', 'doc'],
    ] },
    downloads: { title: 'Downloads', items: [
      ['Xcode_12.4.xip', 'app'], ['Big Sur Wallpaper Notes.pdf', 'doc'],
    ] },
    applications: { title: 'Applications', items: [
      ['Safari', 'safari'], ['Mail', 'mail'], ['Messages', 'messages'], ['Music', 'music'], ['Photos', 'photos'],
      ['Notes', 'notes'], ['Calendar', 'calendar'], ['System Preferences', 'sysprefs'], ['Terminal', 'terminal'],
      ['App Store', 'appstore'], ['Calculator', 'calculator'], ['TextEdit', 'textedit'], ['Disk Utility', 'diskutil'],
    ] },
    hd: { title: 'Macintosh HD', items: [
      ['Applications', 'appsFolder'], ['Library', 'folder'], ['System', 'systemFolder'], ['Users', 'home'],
    ] },
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
    app: 'finder', width: 860, height: 540, body,
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
      grid.append(item);
    }
    status.textContent = `${loc.items.length} items, 256 GB APFS, 245.62 GB available`;
    w.setTitle(loc.title);
    side.querySelectorAll('.row[data-key]').forEach((r) => r.classList.toggle('sel', r.dataset.key === key));
  }
  render(at);
  return w;
}

/* ============================================================ apps */
function aboutBody() {
  return el('div', { class: 'win-body' },
    el('div', { class: 'about11' },
      iconEl('laptop', 190),
      el('h1', { text: 'MacBook Pro' }),
      el('div', { class: 'sub', text: '13-inch, M1, 2020' }),
      el('div', { class: 'rows' },
        el('div', {}, el('span', { text: 'Chip' }), el('b', { text: 'Apple M1' })),
        el('div', {}, el('span', { text: 'Memory' }), el('b', { text: '8 GB' })),
        el('div', {}, el('span', { text: 'Startup disk' }), el('b', { text: 'Macintosh HD' })),
        el('div', {}, el('span', { text: 'Storage' }), el('b', { text: '256 GB APFS' })),
        el('div', {}, el('span', { text: 'Serial number' }), el('b', { text: 'C02GHL1JQ6L4' })),
      ),
      el('div', { class: 'os' }, el('b', { text: 'macOS Big Sur' }),
        el('small', { text: 'Version 11.2.3' })),
      el('div', { class: 'btns' },
        el('button', { class: 'btn', text: 'Software Update…', onclick: () => dialog({ title: 'Software Update', message: 'Your Mac is up to date — with itself. See the Notification Center for the theatre.' }) }),
        el('button', { class: 'btn', text: 'System Report…', onclick: () => dialog({ title: 'System Information', message: 'MacBook Pro (13-inch, M1, 2020) · Apple M1 · 8 GB · 256 GB SSD. Graphics: Apple M1 8-core. Display: 13.3-inch Retina.' }) }),
        el('button', { class: 'btn default', text: 'More Info…', onclick: () => dialog({ title: 'More Info', message: 'Big Sur arrived 12 November 2020 with rounded icons, Control Center and Apple silicon. Sources: Apple, Wikipedia.' }) }),
      ),
    ),
  );
}

const PREF_BANDS = [
    [null, [['user', 'Apple ID']]],
    ['Personal', [
      ['sysprefs', 'General'], ['user', 'Accessibility'], ['displays', 'Control Center'],
      ['sbDesktop', 'Desktop & Screen Saver'], ['displays', 'Displays'], ['finder', 'Dock & Menu Bar'],
      ['appstore', 'Extensions'], ['maps', 'Language & Region'],
      ['sbRecents', 'Mission Control'], ['notifications', 'Notifications'], ['calendar', 'Screen Time'],
      ['siri', 'Siri'], ['spotlight', 'Spotlight'],
    ]],
    ['Hardware', [
      ['laptop', 'Battery'], ['keyboard', 'Keyboard'], ['mouse', 'Mouse'],
      ['server', 'Printers & Scanners'], ['music', 'Sound'], ['trackpad', 'Trackpad'],
    ]],
    ['Internet & System', [
      ['network', 'Network'], ['mail', 'Internet Accounts'], ['keychain', 'Wallet & Apple Pay'],
      ['server', 'Sharing'], ['chess', 'Game Center'],
    ]],
    ['System', [
      ['quicktime', 'Date & Time'], ['locked', 'Profiles'], ['softwareupdate', 'Software Update'],
      ['diskutil', 'Startup Disk'], ['extdisk', 'Time Machine'], ['home', 'Users & Groups'],
    ]],
  ];

function prefsMake() {
  const BANDS = PREF_BANDS;
  const PANES = {
    'General': [['Appearance', 'Light'], ['Close windows when quitting an app', 'toggle off'], ['Allow Handoff between Mac and iCloud devices', 'toggle on']],
    'Desktop & Screen Saver': [['Desktop picture', 'Museum gradient (not Apple\u2019s)'], ['Shuffle every 30 minutes', 'toggle off'], ['Start screen saver after', 'Never']],
    'Dock & Menu Bar': [['Size', 'slider'], ['Magnification', 'toggle off'], ['Position on screen', 'Bottom'], ['Minimize windows using', 'Genie effect']],
    'Displays': [['Built-in Retina Display', '1512 \u00d7 982'], ['Brightness', 'slider'], ['Night Shift', 'Off until sunrise']],
    'Sound': [['Alert sound', 'Boop'], ['Output volume', 'slider'], ['Show Sound in menu bar', 'toggle on']],
    'Battery': [['Battery health', 'Normal'], ['Show battery percentage', 'toggle on'], ['Turn display off on battery', '2 minutes']],
    'Software Update': [['Automatic updates', 'toggle on'], ['', OSNAME + ' ' + OSVER + ' \u2014 your Mac is up to date.']],
    'Focus': [['Focus', 'Modes live in Control Center \u2014 try the moon in the menu bar.']],
  };
  const win = makeWindow({
    title: 'System Preferences', app: 'sysprefs', width: 700, height: 540,
    body: el('div', { class: 'win-body prefs-win' }),
  });
  const body = win.body;
  const rowEl = (label, value) => {
    let right;
    if (value.startsWith('toggle')) {
      right = el('div', { class: 'toggle' + (value.endsWith('off') ? ' off' : ''), onclick: (e) => { e.currentTarget.classList.toggle('off'); } }, el('i'));
    } else if (value === 'slider') {
      right = el('div', { class: 'prefs-slider' }, el('i'));
    } else {
      right = el('span', { style: 'opacity:.55', text: value + '  \u203a' });
    }
    return el('div', { class: 'prefs-row' }, el('span', { text: label }), right);
  };
  const showPane = (icon, name) => {
    body.innerHTML = '';
    body.append(el('div', { class: 'prefs-toolbar' },
      el('div', { class: 'prefs-back', onpointerdown: showGrid }, '\u2039'),
      iconEl(icon, 22),
      el('b', { text: name })));
    const rows = PANES[name] || [['', 'This pane would open here. The museum ships the grid, not every switch.']];
    const pane = el('div', { class: 'prefs-pane' });
    for (const [label, value] of rows) pane.append(rowEl(label || name, value));
    body.append(pane, el('div', { class: 'fine prefs-fine', text: 'Settings here are museum props \u2014 they remember nothing between visits.' }));
  };
  function showGrid() {
    body.innerHTML = '';
    body.append(el('div', { class: 'prefs-top' },
      el('div', { class: 'prefs-appleid', onpointerdown: () => showPane('user', 'Apple ID') },
        el('div', { class: 'prefs-avatar' }, iconEl('user', 30)),
        el('div', {}, el('b', { text: 'Apple ID' }), el('div', { class: 'fine', text: 'Steve Jobs, iCloud, Media & Purchases' }))),
      el('div', { class: 'prefs-search', text: 'Search' })));
    for (let bi = 1; bi < BANDS.length; bi++) {
      body.append(el('div', { class: 'prefs-sep' }));
      const grid = el('div', { class: 'prefs-grid' });
      for (const [icon, name] of BANDS[bi][1]) {
        grid.append(el('div', {
          class: 'prefs-item', 'data-name': name,
          onpointerdown: () => showPane(icon, name),
        }, iconEl(icon, 40), el('div', { class: 'prefs-label', text: name })));
      }
      body.append(grid);
    }
  }
  showGrid();
  return win;
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
  print('Last login: Mon Nov 16 14:02:11 on ttys000');
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
          case 'uname': print('Darwin MacBook-Pro.local 20.3.0 Darwin Kernel Version 20.3.0: root:xnu-7195.81.3~1/RELEASE_ARM64_T8101 arm64'); break;
          case 'whoami': print('steve'); break;
          case 'sw_vers': print('ProductName:\tmacOS\nProductVersion:\t11.2.3\nBuildVersion:\t20D91'); break;
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
<p class="fine">macOS Big Sur 11 — web clone. A homage to the 12 November 2020
release on a MacBook Pro (13-inch, M1, 2020): the rounded redesign,
the translucent menu bar, Control Center and the squircle Dock, at
1440 × 900.</p>
<h2>Icon credits</h2>
<ul>
<li><b>All application and system icons are the official Big Sur icon
artwork</b>, extracted from macOS system software (.icns containers,
PNG representations) via <b>github.com/KevinGutowski/Big-Sur-Icons</b>
(a repository of the default OS icons from the Big Sur betas). Apple's
icon artwork is the property of Apple Inc., used here for study and
nostalgia.</li>
<li><b>Museum drawings:</b> the Apple logo (on the startup screen and in
the menu bar), the tiny menu-bar glyphs, and the Keyboard, Mouse and
Trackpad preference-pane icons
(Wi-Fi, battery, Spotlight, Control Center) and the wallpaper — the
wallpaper is the museum's own gradient homage, not Apple's Big Sur
desktop pictures.</li>
<li>The type is the platform UI stack (with Helvetica/Arial fallbacks) —
SF Pro is Apple's and is not included. No Apple fonts, sounds or
firmware anywhere.</li>
</ul>
<h2>The system</h2>
<p><b>macOS Big Sur 11</b> (12 November 2020) was the biggest visual
redesign since Mac OS X: rounded icons, a translucent menu bar, Control
Center, Notification Center with widgets, and the return of the Mac
startup chime — and the first macOS to run on Apple silicon (the M1
MacBook Pro, MacBook Air and Mac mini). Version numbering leapt from
10.x to 11. Sources: Apple, Wikipedia, EveryMac.</p>
<h2>What is honestly not here</h2>
<ul>
<li><b>Widgets and Control Center toggles are theatre</b> — the panel
slides, the toggles do not toggle much. This is a museum, not a kernel.</li>
<li><b>Preemptive multitasking and protected memory</b> are real on a
real Mac; here everything is one web page pretending very hard.</li>
</ul>
<h2>Clone-only conveniences</h2>
<ul>
<li>Windows do not persist; the console API <code>window.mac</code> is
museum furniture.</li>
<li>The launcher wall links back to the whole museum.</li>
</ul>
<p class="fine">Part of the Macintosh-OS museum. Mac, Macintosh, macOS,
Big Sur, Finder, Safari and the Apple logo are trademarks of Apple Inc.
This is an homage for study and nostalgia, not an Apple product.</p>` }),
  );
}

const APPS = {
  finder: { make(opts) { return finderMake(opts?.at); } },
  about: {
    make() { return makeWindow({ title: '', app: 'about', width: 420, height: 520, body: aboutBody() }); },
  },
  sysprefs: { make() { return prefsMake(); } },
  terminal: {
    make() { return makeWindow({ title: 'steve — -zsh — 80×24', app: 'terminal', width: 620, height: 360, body: terminalBody() }); },
  },
  credits: {
    make() { return makeWindow({ title: 'Credits', app: 'credits', width: 620, height: 520, body: creditsBody() }); },
  },
  trash: {
    make() {
      return makeWindow({
        title: 'Trash', app: 'trash', width: 360, height: 240,
        body: el('div', { class: 'win-body' }, el('div', { style: 'padding:22px;font-size:12px;opacity:.7', text: 'Trash Empty — 0 items' })),
      });
    },
  },
  safari: {
    make() {
      return makeWindow({
        title: 'Safari', app: 'safari', width: 720, height: 460,
        body: el('div', { class: 'win-body' },
          el('div', { style: 'padding:28px;text-align:center' },
            el('div', { style: 'font-size:15px;font-weight:600', text: 'Safari' }),
            el('div', { style: 'margin-top:10px;font-size:12px;opacity:.72', text: 'The museum has no network. Apple.com in 2020 is beyond these walls.' }))),
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
    toggleCC, toggleNC,
  };
}
boot();
