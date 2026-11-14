/* Mac OS X 10.0 "Cheetah" — a browser recreation of the March 2001 desktop.
   Aqua pinstripes, the glass Dock, jewel window controls. Original code;
   official-era icon art per CREDITS.md. */

import { iconEl, iconURL } from './icons.js';

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

const SCREEN_W = 1024;
const SCREEN_H = 768;
const P = 'macintosh-os.x.10.0';
const APPLE_SVG = `<svg width="14" height="16" viewBox="0 0 14 16" aria-label="Apple"><path fill="#111" d="M9.6 2.1c.5-.6.8-1.4.7-2.1-.7 0-1.5.4-2 .9-.4.5-.8 1.3-.7 2 .8.1 1.5-.3 2-.8z"/><path fill="#111" d="M11.8 8.5c0-1.9 1.5-2.8 1.6-2.8-.9-1.3-2.2-1.4-2.7-1.5-1.1-.1-2.2.7-2.8.7-.6 0-1.5-.7-2.4-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.1-.3 5.3.9 7 .6.9 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6 1.1 0 1.4.6 2.3.6.9 0 1.5-.9 2.1-1.7.7-1 .9-1.9.9-2-.1 0-1.5-.6-1.5-2.7z"/></svg>`;
const state = {
  windows: [],
  z: 100,
  active: null,
  fs: null,
  menuOpen: -1,
};

/* ============================================================ file system */
function makeFS() {
  const node = (name, kind, icon, children = [], extra = {}) =>
    ({ name, kind, icon, children, ...extra });
  return {
    computer: node('Computer', 'folder', 'network', [
      node('Macintosh HD', 'disk', 'harddisk', [
        node('Applications', 'folder', 'folder', [
          node('Mail', 'app', 'mail', [], { app: 'mail' }),
          node('Sherlock', 'app', 'sherlock', [], { app: 'sherlock' }),
          node('TextEdit', 'app', 'textedit', [], { app: 'textedit' }),
          node('Terminal', 'app', 'terminal', [], { app: 'terminal' }),
          node('iTunes', 'app', 'itunes', [], { app: 'itunes' }),
          node('QuickTime Player', 'app', 'quicktime', [], { app: null }),
          node('Utilities', 'folder', 'folder', [
            node('Terminal', 'app', 'terminal', [], { app: 'terminal' }),
            node('Console', 'app', 'app', [], { app: null }),
          ]),
        ]),
        node('Documents', 'folder', 'folder', [
          node('Hello from Cheetah.txt', 'doc', 'textdoc', [], { app: 'textedit', data: HELLO }),
          node('Read Me', 'doc', 'textdoc', [], { app: 'textedit', data: README }),
        ]),
        node('System', 'folder', 'folder', [
          node('Library', 'folder', 'folder', []),
          node('CoreServices', 'folder', 'folder', [
            node('Finder', 'app', 'finder', [], { app: 'finder' }),
          ]),
        ]),
        node('Users', 'folder', 'folder', [
          node('steve', 'folder', 'folder', [
            node('Documents', 'folder', 'folder', []),
            node('Public', 'folder', 'folder', []),
          ]),
        ]),
      ], { spec: '40 GB HFS+' }),
      node('Mac OS X Install CD', 'disk', 'extdisk', [
        node('Install Mac OS X', 'app', 'app', [], { app: null }),
        node('Read Me', 'doc', 'textdoc', [], { app: 'textedit', data: 'Mac OS X Install CD\n\n650 MB, HFS hybrid: a Mac OS 9 System Folder for\nClassic, and the Unix-era packages for the new world.\nBoot from this disk to install.\n' }),
        node('System', 'folder', 'folder', []),
      ], { spec: '650 MB' }),
      node('Network', 'folder', 'network', []),
    ]),
  };
}

const HELLO = `Hello from Mac OS X 10.0 Cheetah!

This is a browser recreation of the first shipping
Mac OS X: March 24, 2001. Aqua, the Dock, protected
memory and preemptive multitasking at last.

This window is really editable — try typing.`;

const README = `Welcome to Mac OS X.

This museum piece recreates the March 2001 "Cheetah"
desktop on a Power Macintosh G4 (500 MHz, 128 MB):
the Aqua interface, the glass Dock, pinstripes,
jelly-bean window controls and the Finder.

What is honestly different here:
  * The swirl wallpaper is the museum's own gradient,
    not Apple's Aqua Blue image.
  * Terminal runs a small simulated shell (try "help").
  * There is no Unix under this floor — the windows
    are drawn, the memories are real.

Open "About This Mac" in the Apple menu, and Credits
for the icon attributions.`;

/* ============================================================ window mgr */
function makeWindow({ title, app, width = 460, height = 320, x, y, finder = false, body }) {
  const dlgHost = $('#windows');
  const win = el('div', { class: 'win' + (finder ? ' finder' : '') },
    el('div', { class: 'title' },
      el('div', { class: 'traffic' },
        el('div', { class: 'light close', onpointerdown: (e) => { e.stopPropagation(); closeWindow(w); } }),
        el('div', { class: 'light min', onpointerdown: (e) => { e.stopPropagation(); closeWindow(w); } }),
        el('div', { class: 'light zoom', onpointerdown: (e) => { e.stopPropagation(); zoomWindow(w); } }),
      ),
      el('div', { text: title }),
    ),
    body,
  );
  const w = { el: win, title, app, body };
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
  win.style.left = `${x ?? 90 + (state.windows.length % 6) * 26}px`;
  win.style.top = `${y ?? 60 + (state.windows.length % 6) * 24}px`;
  win.addEventListener('pointerdown', () => focusWindow(w));

  // drag by title
  const bar = win.querySelector('.title');
  bar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.traffic')) return;
    const sx = e.clientX, sy = e.clientY;
    const ox = win.offsetLeft, oy = win.offsetTop;
    const move = (ev) => {
      win.style.left = `${Math.max(0, ox + ev.clientX - sx)}px`;
      win.style.top = `${Math.max(22, oy + ev.clientY - sy)}px`;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    e.preventDefault();
  });

  dlgHost.append(win);
  state.windows.push(w);
  focusWindow(w);
  updateDockDots();
  return w;
}

function closeWindow(w) {
  if (!w || !w.el) return;
  w.el.classList.add('closing');
  setTimeout(() => w.el.remove(), 140);
  state.windows = state.windows.filter((x) => x !== w);
  state.active = state.windows[state.windows.length - 1] || null;
  updateDockDots();
}
function zoomWindow(w) {
  w.el.style.left = '12px';
  w.el.style.top = '34px';
  w.el.style.width = '1000px';
  w.el.style.height = '640px';
}
function focusWindow(w) {
  state.active = w;
  for (const x of state.windows) x.el.style.zIndex = ++state.z > 900 ? (state.z = 100) : state.z;
  w.el.style.zIndex = ++state.z;
  renderMenubar();
}

function dialog({ title, message, buttons = ['OK'] }) {
  return new Promise((resolve) => {
    const shield = el('div', { class: 'modal-shield' });
    const dlg = el('div', { class: 'dialog' },
      el('div', { class: 'title' }, el('div', {}, el('b', { text: title }))),
      el('div', { class: 'dlg-body' }, el('div', { text: message })),
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
const MENUS = {
  finder: [
    {
      apple: true,
      items: [
        { label: 'About This Mac…', action: () => launch('about') },
        { sep: true },
        { label: 'Software Update…', action: () => dialog({ title: 'Software Update', message: 'Software Update would dial Apple at 56k. The museum keeps its modem in a drawer.' }) },
        { label: 'System Preferences…', key: ',', action: () => dialog({ title: 'System Preferences', message: 'System Preferences is not part of this exhibit — yet.' }) },
        { sep: true },
        { label: 'Sleep', action: () => dialog({ title: 'Sleep', message: 'Good night.' }) },
        { label: 'Restart…', action: () => restart() },
        { label: 'Shut Down…', action: () => dialog({ title: 'Shut Down', message: 'It is now safe to close the tab.' }) },
        { sep: true },
        { label: 'Force Quit…', key: '⌥⌘⎋', action: () => dialog({ title: 'Force Quit', message: 'Nothing is misbehaving. Preemptive multitasking is watching.' }) },
      ],
    },
    {
      title: 'Finder', bold: true,
      items: [
        { label: 'About Finder', action: () => launch('about') },
        { sep: true },
        { label: 'Preferences…', key: '⌘,', action: () => {} },
        { sep: true },
        { label: 'Empty Trash…', key: '⇧⌘⌫', action: () => dialog({ title: 'Empty Trash', message: 'The Trash is empty. The wire mesh is original.' }) },
        { label: 'Quit Finder', key: '⌘Q', dis: true },
      ],
    },
    {
      title: 'File',
      items: [
        { label: 'New Finder Window', key: '⌘N', action: () => launch('finder') },
        { label: 'Open', key: '⌘O', action: () => launch('finder') },
        { sep: true },
        { label: 'Close Window', key: '⌘W', action: () => state.active && closeWindow(state.active) },
      ],
    },
    {
      title: 'Edit',
      items: [
        { label: 'Undo', key: '⌘Z', dis: true },
        { label: 'Cut', key: '⌘X', dis: true },
        { label: 'Copy', key: '⌘C', dis: true },
        { label: 'Paste', key: '⌘V', dis: true },
        { label: 'Select All', key: '⌘A', dis: true },
      ],
    },
    {
      title: 'View',
      items: [
        { label: 'as Icons', key: '⌘1', action: () => {} },
        { label: 'as List', key: '⌘2', action: () => {} },
        { label: 'as Columns', key: '⌘3', action: () => {} },
      ],
    },
    {
      title: 'Go',
      items: [
        { label: 'Computer', key: '⇧⌘C', action: () => launch('finder', { at: 'computer' }) },
        { label: 'Home', key: '⇧⌘H', action: () => launch('finder', { at: 'home' }) },
        { label: 'Applications', key: '⇧⌘A', action: () => launch('finder', { at: 'applications' }) },
      ],
    },
    {
      title: 'Window',
      items: [
        { label: 'Minimize', key: '⌘M', action: () => state.active && closeWindow(state.active) },
        { label: 'Zoom', action: () => state.active && zoomWindow(state.active) },
      ],
    },
    {
      title: 'Help',
      items: [
        { label: 'Mac OS X Help', action: () => launch('textedit', { doc: README }) },
        { label: 'Credits', action: () => launch('credits') },
      ],
    },
  ],
};

function renderMenubar() {
  const bar = $('#menubar');
  bar.innerHTML = '';
  const defs = MENUS.finder;
  defs.forEach((def, i) => {
    const item = el('div', {
      class: 'mb-item' + (def.apple ? ' apple' : '') + (def.bold ? ' bold' : '') + (state.menuOpen === i ? ' open' : ''),
      onpointerdown: (e) => {
        e.preventDefault(); e.stopPropagation();
        if (state.menuOpen === i) closeMenu();
        else openMenu(i);
      },
    });
    if (def.apple) item.append(el('span', { html: APPLE_SVG }));
    else item.append(document.createTextNode(def.title));
    bar.append(item);
  });
  bar.append(el('div', { class: 'mb-right' },
    el('span', { text: 'Mon 4:38 PM' }),
  ));
}

let menuLayer = null;
function openMenu(i) {
  closeMenu();
  state.menuOpen = i;
  renderMenubar();
  const def = MENUS.finder[i];
  const bar = $('#menubar');
  const btn = bar.querySelectorAll('.mb-item')[i];
  const r = btn.getBoundingClientRect();
  const scr = $('#screen').getBoundingClientRect();
  const scale = scr.width / SCREEN_W || 1;
  menuLayer = el('div', { class: 'menu' });
  menuLayer.style.left = `${(r.left - scr.left) / scale}px`;
  menuLayer.style.top = `${(r.bottom - scr.top) / scale}px`;
  for (const it of def.items) {
    if (it.sep) { menuLayer.append(el('div', { class: 'sep' })); continue; }
    menuLayer.append(el('div', {
      class: 'mi' + (it.dis ? ' dis' : ''),
      onpointerup: () => { if (!it.dis) { closeMenu(); it.action && it.action(); } },
    }, document.createTextNode(it.label), it.key ? el('span', { class: 'key', text: it.key }) : null));
  }
  $('#screen').append(menuLayer);
}
function closeMenu() {
  if (menuLayer) menuLayer.remove();
  menuLayer = null;
  state.menuOpen = -1;
  renderMenubar();
}
window.addEventListener('pointerdown', (e) => {
  const t = e.target && e.target.closest ? e.target : null;
  if (state.menuOpen >= 0 && !(t && (t.closest('.menu') || t.closest('.mb-item')))) closeMenu();
});

/* ============================================================ the Dock */
const DOCK_ITEMS = [
  { name: 'finder', label: 'Finder', app: 'finder' },
  { name: 'mail', label: 'Mail', app: 'mail' },
  { name: 'sherlock', label: 'Sherlock', app: 'sherlock' },
  { name: 'textedit', label: 'TextEdit', app: 'textedit' },
  { name: 'terminal', label: 'Terminal', app: 'terminal' },
  { name: 'itunes', label: 'iTunes', app: 'itunes' },
  { sep: true },
  { name: 'trash', label: 'Trash', app: 'trash' },
];

function renderDock() {
  const dock = $('#dock');
  dock.innerHTML = '';
  for (const it of DOCK_ITEMS) {
    if (it.sep) { dock.append(el('div', { class: 'sep' })); continue; }
    const tile = el('div', {
      class: 'tile', 'data-app': it.app, title: it.label,
      onpointerdown: () => launch(it.app),
    }, iconEl(it.name, 56), el('div', { class: 'dot' }));
    dock.append(tile);
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
  const hd = el('div', { class: 'dicon', style: 'right: 18px; top: 12px;' },
    iconEl('harddisk', 64),
    el('div', { class: 'lbl', text: 'Macintosh HD' }),
  );
  hd.addEventListener('dblclick', () => launch('finder', { at: 'hd' }));
  desk.append(hd);
}

/* ============================================================ apps */
function finderBody() {
  const grid = el('div', { class: 'fgrid' });
  const status = el('div', { class: 'fstatus', text: '' });
  const titleEl = { current: 'Computer' };

  const locations = {
    computer: () => state.fs.computer,
    hd: () => state.fs.computer.children[0],
    applications: () => state.fs.computer.children[0].children[0],
    home: () => state.fs.computer.children[0].children[3].children[0],
  };

  const w = { render(at) {
    const node = (locations[at] || locations.computer)();
    titleEl.current = node.name;
    grid.innerHTML = '';
    for (const child of node.children) {
      const item = el('div', { class: 'fitem' }, iconEl(child.icon, 48),
        el('span', { class: 'lbl', text: child.spec ? `${child.name}\n${child.spec}` : child.name }));
      item.addEventListener('dblclick', () => {
        if (child.kind === 'folder' || child.kind === 'disk') {
          grid.innerHTML = '';
          const sub = { name: child.name, children: child.children, spec: child.spec };
          w.renderNode(sub);
        } else if (child.app) launch(child.app, { doc: child.data, docName: child.name });
      });
      grid.append(item);
    }
    status.textContent = node.spec
      ? `${node.children.length} items · ${node.spec} · 18.2 GB free`
      : `${node.children.length} items · 40 GB HFS+ · 650 MB CD`;
    const win = state.windows.find((x) => x.body === body);
    if (win) win.el.querySelector('.title > div:last-child').textContent = node.name;
  },
  renderNode(node) {
    grid.innerHTML = '';
    for (const child of node.children) {
      const item = el('div', { class: 'fitem' }, iconEl(child.icon, 48),
        el('span', { class: 'lbl', text: child.spec ? `${child.name}\n${child.spec}` : child.name }));
      item.addEventListener('dblclick', () => {
        if (child.kind === 'folder' || child.kind === 'disk') w.renderNode({ name: child.name, children: child.children, spec: child.spec });
        else if (child.app) launch(child.app, { doc: child.data, docName: child.name });
      });
      grid.append(item);
    }
    status.textContent = node.spec
      ? `${node.children.length} items · ${node.spec} · 18.2 GB free`
      : `${node.children.length} items`;
    const win = state.windows.find((x) => x.body === body);
    if (win) win.el.querySelector('.title > div:last-child').textContent = node.name;
  } };

  const tb = el('div', { class: 'ftoolbar' },
    el('div', { class: 'tb', onpointerdown: () => w.render('computer') }, el('div', { class: 'glyph', text: '▣' }), el('div', { text: 'Computer' })),
    el('div', { class: 'tb', onpointerdown: () => w.render('home') }, el('div', { class: 'glyph', text: '⌂' }), el('div', { text: 'Home' })),
    el('div', { class: 'tb', onpointerdown: () => w.render('applications') }, el('div', { class: 'glyph', text: '◉' }), el('div', { text: 'Applications' })),
    el('div', { class: 'tbspacer' }),
    el('div', { class: 'tb sel' }, el('div', { class: 'glyph', text: '⊞' }), el('div', { text: 'View' })),
  );
  const body = el('div', { class: 'win-body' }, tb, grid, status);
  w.body = body;
  return w;
}

function mailBody() {
  return el('div', { class: 'win-body' },
    el('div', { class: 'mailtb' },
      ...[['✉', 'Send'], ['♥', 'Favorites'], ['⊕', 'Attach'], ['@', 'Address'], ['A', 'Fonts'], ['◉', 'Colors'], ['▤', 'Save As Draft']]
        .map(([g, l]) => el('div', { class: 'tb' }, el('div', { class: 'glyph', text: g }), el('div', { text: l }))),
    ),
    el('div', { class: 'mailheaders' },
      el('div', { class: 'row' }, el('b', { text: 'To:' }), el('span', { text: 'steve@apple.com' })),
      el('div', { class: 'row' }, el('b', { text: 'Cc:' }), el('span', { text: '' })),
      el('div', { class: 'row' }, el('b', { text: 'Subject:' }), el('span', { text: 'Hello from Mac OS X 10.0 Cheetah!' })),
    ),
    el('div', { class: 'mailbody' },
      el('div', { text: 'Dear Macintosh team,' }),
      el('div', { style: 'height:8px' }),
      el('div', { text: 'It shipped. Twenty years of the Macintosh desktop, and the future named X. The Dock bounces, the buttons look like candy, and the Trash is woven wire again.' }),
      el('div', { style: 'height:8px' }),
      el('div', { text: 'Thank you for the last operating system that needed a manual.' }),
      el('div', { style: 'height:8px' }),
      el('div', { text: '— The Museum' }),
    ),
  );
}

function texteditBody(text, name) {
  return el('div', { class: 'win-body' },
    el('textarea', { class: 'textarea', text: text || '' }),
  );
}

const TERM_HELP = `Available commands:
  help      this list
  ls        list directory
  date      today's date
  uname     system name
  whoami    current user
  echo      print text
  clear     clear the screen
  exit      close the window`;

function terminalBody() {
  const out = el('div', { class: 'term' });
  const print = (s) => { out.append(document.createTextNode(s + '\n')); out.scrollTop = out.scrollHeight; };
  print('Last login: Mon Mar 26 09:14:22 on ttyp1');
  print('Welcome to Darwin!');
  print("Type 'help' for the museum's small shell.\n");
  const line = el('div', {});
  const prompt = () => {
    line.innerHTML = '';
    const p = el('span', { class: 'prompt', text: 'Mac:~ steve$ ' });
    const input = el('input', {
      style: 'background:transparent;border:0;outline:0;color:#e8e8e8;font:inherit;width:70%',
      onkeydown: (e) => {
        if (e.key !== 'Enter') return;
        const cmd = input.value;
        print('Mac:~ steve$ ' + cmd);
        const [c, ...rest] = cmd.trim().split(/\s+/);
        switch (c) {
          case '': break;
          case 'help': print(TERM_HELP); break;
          case 'ls': print('Applications   Documents   Library   System   Users'); break;
          case 'date': print(new Date().toString()); break;
          case 'uname': print('Darwin Mac.local 1.3.7 Darwin Kernel Version 1.3.7: root:xnu/xnu-169.obj~1/RELEASE_PPC Power Macintosh'); break;
          case 'whoami': print('steve'); break;
          case 'echo': print(rest.join(' ')); break;
          case 'clear': out.innerHTML = ''; break;
          case 'exit': closeWindow(state.windows.find((w) => w.body.contains(out))); return;
          default: print(`-bash: ${c}: command not found (this is a museum, not a Unix)`);
        }
        prompt();
      },
    });
    line.append(p, input);
    out.append(line);
    input.focus();
  };
  out.addEventListener('pointerup', () => line.querySelector('input')?.focus());
  prompt();
  return el('div', { class: 'win-body' }, out);
}

function aboutBody() {
  return el('div', { class: 'win-body' },
    el('div', { class: 'aboutx' },
      el('div', { class: 'logo', text: 'X' }),
      el('h1', { text: 'Mac OS X' }),
      el('div', { class: 'ver', text: 'Version 10.0.4' }),
      el('div', { class: 'rows' },
        el('div', {}, el('span', { text: 'Mac OS X' }), el('b', { text: '10.0.4 (Darwin 1.3.7)' })),
        el('div', {}, el('span', { text: 'Processor' }), el('b', { text: 'PowerPC G4 500 MHz' })),
        el('div', {}, el('span', { text: 'Memory' }), el('b', { text: '128 MB' })),
        el('div', {}, el('span', { text: 'Machine' }), el('b', { text: 'Power Macintosh G4 (PCI)' })),
        el('div', {}, el('span', { text: 'Startup disk' }), el('b', { text: 'Macintosh HD 40 GB HFS+' })),
      ),
      el('div', { class: 'btns' },
        el('button', { class: 'btn', text: 'Software Update…', onclick: () => dialog({ title: 'Software Update', message: 'The museum keeps its modem in a drawer. In March 2001 this button was magic.' }) }),
        el('button', { class: 'btn', text: 'Help', onclick: () => launch('textedit', { doc: README }) }),
        el('button', { class: 'btn default', text: 'Credits', onclick: () => launch('credits') }),
      ),
    ),
  );
}

const CREDITS = `<h1>Credits &amp; sources</h1>
<p class="fine">Mac OS X 10.0 — web clone. A homage to "Cheetah", 24 March 2001,
on a Power Macintosh G4: Aqua pinstripes, the glass Dock and the jewel
buttons, at 1024 × 768.</p>
<h2>Icon credits</h2>
<ul>
<li><b>Official Aqua-era icon art</b> (Finder, Mail, Sherlock, QuickTime,
TextEdit, document, Macintosh HD, FireWire disk, Network, Photos, AirPort)
is sliced from published Mac OS X 10.0 screenshots — the exact pixels the
real system drew (sources: 512pixels' Aqua Screenshot Library, storiesofapple,
letemsvetemapplem). The <b>Trash</b> is the wire-mesh icon extracted from
Mac OS X system software (512 px).</li>
<li><b>Museum drawings</b> (no clean official bitmap was obtainable here):
the blue folder, generic application, Terminal, iTunes' CD-and-note, the
Apple logo and the full Trash state.</li>
</ul>
<p class="fine">Apple's icon artwork is the property of Apple Inc., used for
study and nostalgia.</p>
<h2>What is honestly not here</h2>
<ul>
<li><b>The swirl wallpaper</b> is the museum's own gradient homage —
Apple's Aqua Blue image is not included.</li>
<li><b>Terminal</b> runs a small simulated shell (try "help"). There is no
Darwin under this floor.</li>
<li><b>Lucida Grande</b> is Apple's face; this clone sets its own Helvetica
stack. No Apple fonts, sounds or ROMs anywhere.</li>
</ul>
<h2>The system</h2>
<p>Mac OS X 10.0 "Cheetah" (24 March 2001, $129) was the first shipping
Mac OS X: Aqua, the Dock, preemptive multitasking and protected memory —
and slow, slow, slow on the machines of the day. It required 128 MB of RAM
and a PowerPC G3 or G4. Source: 512pixels, Wikipedia, Apple's 2001
materials.</p>
<h2>Clone-only conveniences</h2>
<ul>
<li>Windows remember nothing across reloads; the console API
<code>window.mac</code> is museum furniture.</li>
<li>Credits in the Help menu and the launcher wall link back to the museum.</li>
</ul>
<p class="fine">Part of the Macintosh-OS museum. Mac, Macintosh, Mac OS X,
Aqua and the Finder are trademarks of Apple Inc. This is an homage for
study and nostalgia, not an Apple product.</p>`;

function creditsBody() {
  return el('div', { class: 'win-body' },
    el('div', { class: 'creditsx', html: CREDITS }),
  );
}

const APPS = {
  finder: {
    title: 'Computer', width: 560, height: 400, finder: true,
    make(opts) {
      const f = finderBody();
      const w = makeWindow({ title: 'Computer', app: 'finder', width: 560, height: 400, finder: true, body: f.body });
      w.body = f.body;
      f.render(opts?.at || 'computer');
      return w;
    },
  },
  mail: {
    title: 'Mail', width: 520, height: 380,
    make() { return makeWindow({ title: 'Mail', app: 'mail', width: 520, height: 380, body: mailBody() }); },
  },
  textedit: {
    title: 'TextEdit', width: 420, height: 320,
    make(opts) {
      return makeWindow({
        title: opts?.docName || 'Read Me', app: 'textedit', width: 420, height: 320,
        body: texteditBody(opts?.doc ?? HELLO, opts?.docName),
      });
    },
  },
  terminal: {
    title: 'Terminal', width: 520, height: 320,
    make() { return makeWindow({ title: 'Terminal — bash — 80×24', app: 'terminal', width: 520, height: 320, body: terminalBody() }); },
  },
  itunes: {
    title: 'iTunes', width: 380, height: 260,
    make() {
      return makeWindow({
        title: 'iTunes', app: 'itunes', width: 380, height: 260,
        body: el('div', { class: 'win-body metal' },
          el('div', { style: 'padding:18px;text-align:center' },
            el('div', { style: 'font-size:13px;font-weight:bold', text: 'iTunes' }),
            el('div', { style: 'margin-top:8px;opacity:.75;font-size:11.5px', text: 'Rip. Mix. Burn.' }),
            el('div', { style: 'margin-top:10px;opacity:.65;font-size:11px', text: 'The library is empty — the museum has no CDs.' }),
          ),
        ),
      });
    },
  },
  sherlock: {
    title: 'Sherlock', width: 420, height: 300,
    make() {
      return makeWindow({
        title: 'Sherlock', app: 'sherlock', width: 420, height: 300,
        body: el('div', { class: 'win-body' },
          el('div', { style: 'padding:16px' },
            el('div', { style: 'font-size:13px;font-weight:bold', text: 'Sherlock 2' }),
            el('div', { style: 'margin-top:8px;font-size:11.5px;line-height:1.5', text: 'Search channels: Internet, People, Shopping, News, Apple. This museum has no network, so the channels are memory — see Mac OS 9 in this museum for the full Sherlock 2 exhibit.' }),
          ),
        ),
      });
    },
  },
  about: {
    title: 'About This Mac', width: 380, height: 320,
    make() { return makeWindow({ title: 'About This Mac', app: 'about', width: 380, height: 320, body: aboutBody() }); },
  },
  credits: {
    title: 'Credits', width: 520, height: 380,
    make() { return makeWindow({ title: 'Credits', app: 'credits', width: 520, height: 380, body: creditsBody() }); },
  },
  trash: {
    title: 'Trash', width: 320, height: 220,
    make() {
      return makeWindow({
        title: 'Trash', app: 'trash', width: 320, height: 220,
        body: el('div', { class: 'win-body' },
          el('div', { style: 'padding:18px;font-size:11.5px;opacity:.75', text: 'The Trash is empty. Drag here to throw things away — in your heart.' }),
        ),
      });
    },
  },
};

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
  const boot = $('#boot');
  boot.style.display = '';
  boot.querySelector('.boot-msg').textContent = 'Welcome to Macintosh. Click to start up.';
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

function boot() {
  fitScreen();
  window.addEventListener('resize', fitScreen);
  state.fs = makeFS();
  renderMenubar();
  renderDock();
  renderDesktop();
  $('#boot').addEventListener('pointerdown', () => {
    $('#boot').style.display = 'none';
    launch('finder', { at: 'computer' });
  });

  window.mac = {
    launch, dialog, restart,
    windows: () => state.windows.map((w) => w.title),
    fs: state.fs,
  };
}
boot();
