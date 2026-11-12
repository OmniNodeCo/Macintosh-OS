/* ============================================================================
   Macintosh System 2.0 — web clone
   Boot, screen scaling, preferences, the launcher and the shutdown screen.
   ========================================================================== */

import { initWM, createWindow, focusWindow, allWindows, installKeyboard, setDefaultMenusProvider, closeAll, alert, confirm, DESK_H, SCREEN_W } from './core/wm.js';
import { initMenu, setMenus, setDefaultMenus } from './core/menu.js';
import * as FS from './core/fs.js';
import { applyPattern } from './core/patterns.js';
import { audio, chime, unlockAudio, beep, diskInsert, shutdownSound } from './core/sound.js';
import { drawHappyMac, iconURL, pointerCursorURL } from './core/icons.js';
import { el } from './core/ui.js';
import { initFinder, finder, menusFor, refreshAll } from './apps/finder.js';
import { appleMenu } from './apps/apple-menu.js';
import { getApp, LAUNCHABLE, APPS } from './apps/index.js';

const PREFS_KEY = 'macintosh-os.2.0.prefs.v1';
const screen = document.getElementById('screen');
const desk = document.getElementById('desktop');
const boot = document.getElementById('boot');
const bootMsg = document.getElementById('boot-msg');

/* ------------------------------------------------------------------ prefs -- */

const prefs = {
  desktopPattern: 'gray25',
  printer: 'imagewriter',
  printerPort: 'Printer',
  sound: true,
  bellVolume: 0.7,
  alarmVolume: 0.7,
  repeat: 0.6,
  notepad: ['', '', '', ''],
  alarmOn: false,
  alarmTime: '07:30',
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) Object.assign(prefs, JSON.parse(raw));
  } catch (err) { /* ignore */ }
  audio.enabled = prefs.sound;
  audio.bellVolume = prefs.bellVolume;
  audio.alarmVolume = prefs.alarmVolume;
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
  // System 2.0's headline improvement was a start-up about 20% quicker
  setTimeout(() => {
    boot.classList.add('gone');
    setTimeout(() => boot.remove(), 220);
  }, 680);
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

/* ------------------------------------------------------------------ launch -- */

/* MiniFinder stands in for the Finder: the desktop is covered by a full screen
   launcher and the Finder's windows step aside until you come back. */
let miniActive = false;
let stashedWindows = [];

function enterMini() {
  if (miniActive) return;
  miniActive = true;
  document.body.classList.add('mini-mode');
  // step the Finder's own windows out of the way; desk accessories stay
  stashedWindows = allWindows().filter((w) => !w.isMini && w.app !== 'minifinder');
  stashedWindows.forEach((w) => { w.el.style.display = 'none'; });
  focusWindow(null);
  setMenus([appleMenu(baseCtx), {
    title: 'File',
    items: [{ label: 'Use Finder', key: 'W', action: () => leaveMini() }],
  }]);
  launch('minifinder');
}

function leaveMini() {
  if (!miniActive) return;
  miniActive = false;
  document.body.classList.remove('mini-mode');
  stashedWindows.forEach((w) => { w.el.style.display = ''; });
  stashedWindows = [];
  const mini = allWindows().find((w) => w.app === 'minifinder');
  if (mini) mini.close();
  setMenus(menusFor(baseCtx));
  refreshAll();
}

const baseCtx = {
  launch: (id, opts) => launch(id, opts),
  restart: () => restart(),
  shutdown: () => shutdown(),
  prefs,
  savePrefs,
  desktop: desk,
  finder,
  enterMini,
  leaveMini,
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
    onUseFinder: () => leaveMini(),
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
    enterMini, leaveMini, miniState: () => miniActive,
  };
}

init();
