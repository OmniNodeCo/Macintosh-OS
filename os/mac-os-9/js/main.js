/* ============================================================================
   Mac OS 8.0 — web clone
   Boot, screen scaling, preferences, the Application menu, Force Quit and the
   shutdown screen. A Power Macintosh 8600: PowerPC 604e at 200 MHz,
   32 MB of memory, a 2 GB hard disk, a 12x CD-ROM and a 1.4 MB SuperDrive.
   800 × 600 in colour. Mac OS 9.0, October 1999.
   ========================================================================== */

import { initWM, createWindow, focusWindow, allWindows, installKeyboard, setDefaultMenusProvider, closeAll, alert, confirm, DESK_H, SCREEN_W } from './core/wm.js';
import { initMenu, setMenus, setDefaultMenus, setAppMenuBuilder } from './core/menu.js';
import * as FS from './core/fs.js';
import { applyPattern } from './core/patterns.js';
import { audio, chime, unlockAudio, beep, diskInsert, shutdownSound } from './core/sound.js';
import { drawHappyMac, iconURL, pointerCursorURL } from './core/icons.js';
import { el } from './core/ui.js';
import { initFinder, finder, menusFor, refreshAll } from './apps/finder.js';
import { appleMenu } from './apps/apple-menu.js';
import { getApp, LAUNCHABLE, APPS } from './apps/index.js';

const PREFS_KEY = 'macintosh-os.9.0.prefs.v1';
const screen = document.getElementById('screen');
const desk = document.getElementById('desktop');
const boot = document.getElementById('boot');
const bootMsg = document.getElementById('boot-msg');

/* ------------------------------------------------------------------ prefs -- */

const prefs = {
  desktopPattern: 'gray50',   // System 7 ships grey linen
  printer: 'imagewriter',
  printerPort: 'Printer',
  appleTalk: true,
  chooserZone: '*',
  chooserDevice: 'LaserWriter II',
  cache: 128,            // RAM cache, in K
  cacheOn: true,
  mouseTracking: 'Mouse',
  trackSpeed: 0.6,
  dblSpeed: 0.6,
  balloons: false,       // Help ▸ Show Balloons
  startupDisk: 'systemdisk',
  addr32: false,
  warnOnShut: true,
  menuBlink: 0.5,
  sound: true,
  bellVolume: 0.7,
  alarmVolume: 0.7,
  repeat: 0.6,
  notepad: ['', '', '', ''],
  alarmOn: false,
  alarmTime: '07:30',
  hl: 'blue',          // Appearance ▸ highlight colour
  springload: true,    // spring-loaded folders
};

/* Mac OS 8's Appearance Manager lets the highlight colour be chosen; these
   seven swatches are our approximation of the classic list. */
const HL = {
  blue:   { bg: '#7a6fc4', text: '#ffffff', sel: '#c3c3dd' },
  violet: { bg: '#8a5fc4', text: '#ffffff', sel: '#d0c3dd' },
  red:    { bg: '#b23a3a', text: '#ffffff', sel: '#ddb8b8' },
  orange: { bg: '#c4772a', text: '#ffffff', sel: '#ddc9b0' },
  yellow: { bg: '#b8a12a', text: '#ffffff', sel: '#ddd6b0' },
  green:  { bg: '#3f8f4f', text: '#ffffff', sel: '#b6d6bc' },
  gray:   { bg: '#7a7a7a', text: '#ffffff', sel: '#cfcfcf' },
};

function applyHighlight() {
  const hl = HL[prefs.hl] || HL.blue;
  document.documentElement.style.setProperty('--hl', hl.bg);
  document.documentElement.style.setProperty('--hltext', hl.text);
  document.documentElement.style.setProperty('--hlsel', hl.sel);
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) Object.assign(prefs, JSON.parse(raw));
  } catch (err) { /* ignore */ }
  audio.enabled = prefs.sound;
  audio.bellVolume = prefs.bellVolume;
  audio.alarmVolume = prefs.alarmVolume;
  applyHighlight();
}

function savePrefs() {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (err) { /* ignore */ }
}

/* --------------------------------------------------------------- scaling -- */

function fit() {
  const outside = document.getElementById('outside');
  const stage = document.getElementById('stage');
  const reserve = outside && getComputedStyle(outside).display !== 'none'
    ? outside.offsetHeight + 46 : 24;
  // try the largest zoom step whose *case* still fits the viewport
  const steps = [3, 2.5, 2, 1.75, 1.5, 1.25, 1, 0.85, 0.75, 0.6, 0.5, 0.4];
  let chosen = 0.4;
  for (const s of steps) {
    screen.style.zoom = String(s);
    if (stage.offsetWidth <= window.innerWidth - 24 &&
        stage.offsetHeight + reserve <= window.innerHeight - 12) { chosen = s; break; }
  }
  screen.style.zoom = String(chosen);
  window.__macScale = chosen;
}

/* ------------------------------------------------------------------ boot -- */

let booted = false;

function startUp(withSound = true) {
  if (booted) return;
  booted = true;
  unlockAudio();
  if (withSound) chime();
  if (bootMsg) bootMsg.textContent = 'Welcome to Macintosh';
  // System 7 shows the icons of every extension it loads along the bottom of
  // the Welcome box. They pop in one after another.
  const exts = document.getElementById('boot-exts');
  if (exts) {
    const names = ['AppleTalk', 'LaserWriter', 'ImageWriter', 'DA Handler', 'TrueType'];
    names.forEach((n, i) => {
      setTimeout(() => {
        const img = document.createElement('img');
        img.src = iconURL(i === 4 ? 'extension' : i === 3 ? 'cdevSound' : i === 2 ? 'printer' : i === 1 ? 'printer' : 'extension');
        img.alt = n;
        img.title = n;
        exts.append(img);
      }, 120 + i * 110);
    });
  }
  setTimeout(() => {
    boot.classList.add('gone');
    setTimeout(() => boot.remove(), 200);
  }, 900);
}

function bootSequence() {
  const face = document.getElementById('boot-face');
  if (face) drawHappyMac(face, 2);
  boot.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    startUp(true);
  });
  // if nobody clicks, start quietly after a while
  setTimeout(() => startUp(false), 7000);
}

/* --------------------------------------------------------------- restart -- */

async function restart(force = false) {
  if (!force) {
    const ok = await confirm({
      title: 'Restart',
      message: 'Are you sure you want to restart the Macintosh?\nUnsaved changes will be lost.',
      icon: 'caution',
      ok: 'Restart',
    });
    if (!ok) return;
  }
  savePrefs();
  FS.saveRaw();
  location.reload();
}

async function shutdown(force = false) {
  if (!force) {
    const ok = await confirm({
      title: 'Shut Down',
      message: 'Are you sure you want to shut down the Macintosh?\nUnsaved changes will be lost.',
      icon: 'caution',
      ok: 'Shut Down',
    });
    if (!ok) return;
  }
  savePrefs();
  FS.saveRaw();
  shutdownSound();
  closeAll();
  const off = el('div', {
    id: 'offscreen',
    style: {
      position: 'absolute', inset: '0', background: '#000', color: '#fff',
      zIndex: '9000', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '3px',
      fontFamily: '"MacPixel Chicago", monospace', fontSize: '12px',
      textAlign: 'center', cursor: 'pointer', padding: '0 40px',
    },
  },
    el('div', { text: 'It is now safe to turn off' }),
    el('div', { text: 'your Macintosh.' }),
    el('div', { style: { opacity: '.45', marginTop: '26px' }, text: 'Click to start up again.' }),
  );
  off.addEventListener('pointerdown', () => restart(true));
  screen.append(off);
}

/* ------------------------------------------------------- force quit (7.0) -- */

async function forceQuit() {
  const wins = allWindows();
  const front = wins.length ? wins[wins.length - 1] : null;
  const name = front ? (getApp(front.app)?.name || 'Finder') : 'Finder';
  const ok = await confirm({
    title: 'Force Quit',
    message: `Force the application “${name}” to quit?\nYou will lose any unsaved changes.`,
    icon: 'caution',
    ok: 'Force Quit',
    cancel: 'Cancel',
  });
  if (ok && front) front.close();
}

/* -------------------------------------------- application menu (7.0) ------ */

function buildAppMenu() {
  const wrap = el('div', { class: 'mb-appmenu', title: 'Application' });
  wrap.append(
    el('img', { src: iconURL('launcher'), alt: '' }),
    el('span', { class: 'caret', text: '\u25be' }),
  );
  wrap.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const layer = document.getElementById('menus');
    const old = layer.querySelector('.appmenu-dd');
    if (old) { old.remove(); return; }
    const dd = el('div', { class: 'menu appmenu-dd' });
    const rows = [['Finder', () => focusWindow(null)]];
    const seen = new Set();
    for (const w of allWindows()) {
      const app = getApp(w.app);
      if (!app) continue;
      if (seen.has(w.app)) continue;
      seen.add(w.app);
      rows.push([app.name, () => focusWindow(w)]);
    }
    rows.forEach(([label, fn], i) => {
      const row = el('div', { class: 'mi' + (i === rows.length - 1 && seen.size ? '' : '') },
        el('span', { class: 'mi-check', text: i === 0 && !seen.size ? '\u2713' : '' }),
        el('span', { text: label }));
      row.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        dd.remove();
        fn();
      });
      dd.append(row);
    });
    dd.style.right = '2px';
    dd.style.top = '20px';
    layer.append(dd);
    const away = (ev) => {
      if (!dd.contains(ev.target) && !wrap.contains(ev.target)) {
        dd.remove();
        window.removeEventListener('pointerdown', away, true);
      }
    };
    window.addEventListener('pointerdown', away, true);
  });
  return wrap;
}

/* ------------------------------------------------------------------ launch -- */

/* System 3.0 retired MiniFinder: the Plus has the memory to keep the whole
   Finder loaded, so there is nothing to swap out. The hooks stay so that any
   code written against 2.0's API still runs — they just do nothing. */
const noMini = () => false;

const baseCtx = {
  launch: (id, opts) => launch(id, opts),
  restart: () => restart(),
  shutdown: () => shutdown(),
  prefs,
  savePrefs,
  desktop: desk,
  finder,
  enterMini: noMini,
  leaveMini: noMini,
  mountDiskFile: () => finder.mountDiskFile && finder.mountDiskFile(),
};

function menusForWindow(win) {
  const appCtx = win.appCtx;
  const app = getApp(win.app);
  const closeItem = { label: 'Close', key: 'W', action: () => win.close() };
  const own = appCtx && app && app.menus ? app.menus(appCtx) : [];
  if (!own.length) {
    return [appleMenu(baseCtx), { title: 'File', items: [closeItem] }];
  }
  return [appleMenu(baseCtx), ...own];
}

function launch(id, opts = {}) {
  const app = getApp(id);
  if (!app) {
    alert({ title: 'Finder', message: `Cannot open “${id}”.\nThe application could not be found.`, icon: 'caution' });
    return null;
  }
  if (app.single) {
    const existing = allWindows().find((w) => w.app === id);
    if (existing) {
      focusWindow(existing);
      return existing;
    }
  }

  const win = createWindow({
    title: app.name,
    w: app.w || 340,
    h: app.h || 220,
    app: id,
    resizable: opts.resizable !== false && app.resizable !== false,
  });
  win.menus = () => menusForWindow(win);

  const appCtx = {
    win, app, api: null,
    launch, prefs, savePrefs,
    desktop: desk,
    finder,
    apps: LAUNCHABLE,
    file: opts.file || null,
    fromNode: opts.fromNode || null,
    restart: baseCtx.restart,
    shutdown: baseCtx.shutdown,
    onUseFinder: () => {},
  };
  win.appCtx = appCtx;

  try {
    app.open(appCtx);
  } catch (err) {
    console.error(err);
    alert({ title: app.name, message: 'Sorry, a system error occurred while opening this application.', icon: 'caution' });
  }
  win.refreshMenus();
  // apps may have made their window focusable while opening: re-apply focus so
  // that keystrokes reach the new window straight away
  focusWindow(win);
  return win;
}

/* --------------------------------------------------------------- desktop -- */

function wire() {
  // menu bar is rebuilt by the window manager whenever focus changes
  setDefaultMenusProvider(() => menusFor(baseCtx));

  document.addEventListener('keydown', (e) => {
    // System 7: ⌘/Ctrl + Option + Escape is Force Quit
    if (e.key === 'Escape' && (e.metaKey || e.ctrlKey) && e.altKey) {
      e.preventDefault();
      forceQuit();
      return;
    }
    // ⌘/Ctrl shortcuts are handled by menu.js; this is the global escape hatch
    if (e.key === 'Escape' && !document.querySelector('.menu')) {
      focusWindow(null);
    }
  });

  // a single click on the desktop takes focus away from windows
  desk.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.win') || e.target.closest('.menu') || e.target.closest('.dialog')) return;
    if (e.target.closest('.dicon')) return;
    focusWindow(null);
  });

  // save the system when the tab goes away
  window.addEventListener('beforeunload', () => {
    savePrefs();
    FS.saveRaw();
  });
}

/* ------------------------------------------------------------------- init -- */

function init() {
  fit();
  window.addEventListener('resize', fit);

  initWM({
    layer: document.getElementById('windows'),
    dialogs: document.getElementById('dialogs'),
  });
  initMenu({
    bar: document.getElementById('menubar'),
    layer: document.getElementById('menus'),
    defaults: [],
  });
  installKeyboard();
  setAppMenuBuilder(buildAppMenu);

  loadPrefs();
  FS.initFS();
  applyPattern(desk, prefs.desktopPattern);
  try {
    screen.style.setProperty('--cursor', `url(${pointerCursorURL()}) 0 0, default`);
  } catch (err) { /* cursor images are optional */ }
  initFinder(baseCtx);
  setDefaultMenus(() => menusFor(baseCtx));

  bootSequence();
  wire();

  // the very first launch opens the System Disk, like a fresh Finder
  setTimeout(() => {
    if (booted) return;
    // wait for the click; nothing else to do
  }, 100);

  // expose a tiny API for debugging in the console
  window.mac = {
    launch, finder, fs: FS, prefs, savePrefs, restart, shutdown, setMenus, appleMenu,
    enterMini: noMini, leaveMini: noMini, miniState: () => false,
    mountDiskFile: () => finder.mountDiskFile && finder.mountDiskFile(),
    setHighlight(id) { if (HL[id]) { prefs.hl = id; applyHighlight(); savePrefs(); } },
    highlightIds: Object.keys(HL),
  };
}

init();
