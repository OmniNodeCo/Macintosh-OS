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

const OSNAME = 'macOS Monterey';
const OSVER = '12.0.1';
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

/* ============================================================ window mgr */
function makeWindow({ title, app, width, height, x, y, body, leftTitle, titleLeft, titleRight, hideTitle }) {
  const win = el('div', { class: 'win' },
    el('div', { class: 'title' },
      el('div', { class: 'traffic' },
        el('div', { class: 'light close', onpointerdown: (e) => { e.stopPropagation(); closeWindow(w); } }),
        el('div', { class: 'light min', onpointerdown: (e) => { e.stopPropagation(); closeWindow(w); } }),
        el('div', { class: 'light zoom', onpointerdown: (e) => { e.stopPropagation(); w.el.style.width = '1472px'; w.el.style.height = '880px'; w.el.style.left = '20px'; w.el.style.top = '36px'; } }),
      ),
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
  win.style.left = `${x ?? 130 + (state.windows.length % 7) * 28}px`;
  win.style.top = `${y ?? 76 + (state.windows.length % 7) * 26}px`;
  win.addEventListener('pointerdown', () => { state.z += 1; win.style.zIndex = state.z; });
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
    el('span', { text: 'Mon Nov 15  9:41 AM', onpointerdown: (e) => { e.stopPropagation(); toggleNC(); } }),
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
      el('div', { class: 'date', text: '15 November' }),
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
  ['shortcuts', 'Shortcuts', 'shortcuts'], ['notes', 'Notes', 'notes'], ['calendar', 'Calendar', 'calendar'],
  ['sysprefs', 'System Preferences', 'sysprefs'], ['terminal', 'Terminal', 'terminal'],
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
  'radial-gradient(1100px 620px at 18% 96%, rgba(120,220,232,.8), transparent 62%), radial-gradient(1000px 700px at 84% 6%, rgba(120,110,235,.85), transparent 60%), radial-gradient(900px 560px at 60% 74%, rgba(255,150,190,.55), transparent 58%), linear-gradient(160deg, #58c8e8 0%, #7aa8f0 30%, #b48cf0 62%, #f2a8d8 100%)',
  'radial-gradient(1000px 640px at 20% 90%, rgba(255,200,120,.8), transparent 62%), radial-gradient(900px 620px at 80% 12%, rgba(240,110,140,.8), transparent 60%), linear-gradient(155deg, #ffb36b 0%, #f2785c 45%, #b04a86 100%)',
  'radial-gradient(1100px 640px at 24% 92%, rgba(90,220,170,.8), transparent 60%), radial-gradient(900px 600px at 82% 10%, rgba(40,110,190,.85), transparent 62%), linear-gradient(160deg, #57d8a8 0%, #2f8fd0 55%, #234f8c 100%)',
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
      ['Hello Monterey.rtf', 'doc'], ['Focus schedule', 'notes'], ['M1 Pro notes.txt', 'doc'], ['Shortcuts.app', 'shortcuts'],
    ] },
    documents: { title: 'Documents', items: [['Museum', 'folder'], ['Hello Monterey.rtf', 'doc'], ['Read Me.txt', 'doc']] },
    downloads: { title: 'Downloads', items: [['Xcode_13.xip', 'app'], ['Monterey Notes.pdf', 'doc']] },
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
    ['Apple', 'apple.com', 'Apple \u2014 macOS Monterey. Focus, Shortcuts, Universal Control, SharePlay, Live Text, AirPlay to Mac.'],
    ['MacRumors', 'macrumors.com', 'macOS 12 review: the update that ties the Mac, iPad and iPhone closer together.'],
    ['Museum Wall', 'localhost', 'Welcome back to the Macintosh-OS museum. Ten systems boot today.'],
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

/* ============================================================ apps */
function aboutBody() {
  return el('div', { class: 'win-body' },
    el('div', { class: 'about11' },
      iconEl('laptop', 190),
      el('h1', { text: 'MacBook Pro' }),
      el('div', { class: 'sub', text: '14-inch, M1 Pro, 2021' }),
      el('div', { class: 'rows' },
        el('div', {}, el('span', { text: 'Chip' }), el('b', { text: 'Apple M1 Pro' })),
        el('div', {}, el('span', { text: 'Memory' }), el('b', { text: '16 GB' })),
        el('div', {}, el('span', { text: 'Startup disk' }), el('b', { text: 'Macintosh HD' })),
        el('div', {}, el('span', { text: 'Serial number' }), el('b', { text: 'C02XL1JQ6L4' })),
      ),
      el('div', { class: 'os' }, el('b', { text: 'macOS Monterey' }),
        el('small', { text: 'Version 12.0.1' })),
      el('div', { class: 'btns' },
        el('button', { class: 'btn', text: 'Software Update…', onclick: () => dialog({ title: 'Software Update', message: 'Your Mac is up to date — with itself.' }) }),
        el('button', { class: 'btn', text: 'System Report…', onclick: () => dialog({ title: 'System Information', message: 'MacBook Pro (14-inch, M1 Pro, 2021) · Apple M1 Pro (8-core CPU, 14-core GPU) · 16 GB · 512 GB SSD · Liquid Retina XDR display.' }) }),
        el('button', { class: 'btn default', text: 'More Info…', onclick: () => dialog({ title: 'What’s New in Monterey', message: 'Focus modes, Shortcuts, Safari tab groups, Universal Control, SharePlay, Live Text, AirPlay to Mac — and the new 14- and 16-inch MacBook Pro. Released 25 October 2021.' }) }),
      ),
    ),
  );
}

const PREF_BANDS = [
    [null, [['user', 'Apple ID']]],
    ['Personal', [
      ['sysprefs', 'General'], ['user', 'Accessibility'], ['displays', 'Control Center'],
      ['sbDesktop', 'Desktop & Screen Saver'], ['displays', 'Displays'], ['finder', 'Dock & Menu Bar'],
      ['focus', 'Focus'], ['appstore', 'Extensions'], ['maps', 'Language & Region'],
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
  print('Last login: Mon Nov 15 09:31:42 on ttys000');
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
          case 'uname': print('Darwin MacBook-Pro.local 21.1.0 Darwin Kernel Version 21.1.0: root:xnu-8019.41.5~1/RELEASE_ARM64_T6000 arm64'); break;
          case 'whoami': print('steve'); break;
          case 'sw_vers': print('ProductName:\tmacOS\nProductVersion:\t12.0.1\nBuildVersion:\t21A551'); break;
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
<p class="fine">macOS Monterey 12 — web clone. A homage to the 25 October 2021
release on a MacBook Pro (14-inch, M1 Pro): Focus modes, Shortcuts and
Safari tab groups, at 1512 × 982.</p>
<h2>Icon credits</h2>
<ul>
<li><b>All application and system icons are the official Big Sur /
Monterey-era icon artwork</b> (Monterey kept Big Sur's design), extracted
from macOS system software (.icns containers, PNG representations) via
<b>github.com/KevinGutowski/Big-Sur-Icons</b> — the same set used by the
Big Sur exhibit (assets/icons/macos-11).</li>
<li><b>Museum drawings:</b> the Shortcuts icon, the Focus and
Keyboard/Mouse/Trackpad pane icons, the Apple logo (on the startup
screen and in the menu bar), the menu-bar glyphs and the wallpaper
gradients. Apple's icon artwork is the
property of Apple Inc., used for study and nostalgia.</li>
<li>The type is the platform UI stack (Helvetica/Arial fallbacks); SF Pro
is Apple's and is not included. No Apple fonts, sounds or firmware.</li>
</ul>
<h2>The system</h2>
<p><b>macOS Monterey 12</b> (25 October 2021) focused on the seams
between Apple's machines: <b>Universal Control</b> (one keyboard and
trackpad across Mac and iPad), <b>SharePlay</b>, <b>Focus</b> modes,
<b>Shortcuts</b> for Mac, Safari <b>tab groups</b>, <b>Live Text</b>,
<b>AirPlay to Mac</b> — alongside the new 14- and 16-inch MacBook Pro on
the M1 Pro and M1 Max. Sources: Apple, Wikipedia.</p>
<h2>What is honestly not here</h2>
<ul>
<li><b>Focus toggles and shortcuts run theatre</b> — the panels move, the
notifications pretend, and no iPad shares anything with this browser.</li>
<li>The wallpaper gradients are the museum's own, not Apple's Monterey
desktop pictures.</li>
</ul>
<h2>Clone-only conveniences</h2>
<ul>
<li>Windows do not persist; the console API <code>window.mac</code> is
museum furniture.</li>
<li>The launcher wall links back to the whole museum.</li>
</ul>
<p class="fine">Part of the Macintosh-OS museum. Mac, Macintosh, macOS,
Monterey, Shortcuts, Safari and the Apple logo are trademarks of Apple
Inc. This is an homage for study and nostalgia, not an Apple product.</p>` }),
  );
}

const APPS = {
  finder: { make(opts) { return finderMake(opts?.at); } },
  about: { make() { return makeWindow({ title: '', app: 'about', width: 420, height: 520, body: aboutBody() }); } },
  sysprefs: { make() { return prefsMake(); } },
  terminal: { make() { return makeWindow({ title: 'steve — -zsh — 80×24', app: 'terminal', width: 620, height: 360, body: terminalBody() }); } },
  credits: { make() { return makeWindow({ title: 'Credits', app: 'credits', width: 620, height: 520, body: creditsBody() }); } },
  safari: { make() { return safariMake(); } },
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
  setTimeout(() => launch('safari'), 420);
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
