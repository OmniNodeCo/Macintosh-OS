/* The Apple menu is shared by every window: desk accessories + system items.
   In System 6 the first item reads "About the Finder…"; when MultiFinder is
   running the bottom of the Apple menu lists the running programs, so you can
   switch between them without leaving the Finder. */

import { allWindows, focusWindow } from '../core/wm.js';
import { getApp } from './index.js';

export function appleMenu(ctx) {
  const items = [
    { label: 'About the Finder…', action: () => ctx.launch('about') },
    { sep: true },
    { label: 'Calculator', action: () => ctx.launch('calculator') },
    { label: 'Alarm Clock', action: () => ctx.launch('clock') },
    { label: 'Control Panel', action: () => ctx.launch('controlpanel') },
    { label: 'Key Caps', action: () => ctx.launch('keycaps') },
    { label: 'MacroMaker', action: () => ctx.launch('macromaker') },
    { label: 'Note Pad', action: () => ctx.launch('notepad') },
    { label: 'Puzzle', action: () => ctx.launch('puzzle') },
    { label: 'Scrapbook', action: () => ctx.launch('scrapbook') },
    { label: 'Chooser', action: () => ctx.launch('chooser') },
  ];

  // MultiFinder: the Apple menu lists what is running, Finder included.
  if (ctx.prefs && ctx.prefs.multiFinder) {
    items.push({ sep: true });
    const seen = new Map();
    for (const win of allWindows()) {
      const app = getApp(win.app);
      if (!app) continue;            // Finder windows belong to the Finder itself
      if (!seen.has(app.name)) seen.set(app.name, win);
    }
    items.push({ label: 'Finder', checked: seen.size === 0, action: () => focusWindow(null) });
    for (const [name, win] of seen) {
      items.push({ label: name, action: () => focusWindow(win) });
    }
  }

  items.push({ sep: true });
  items.push({ label: 'Insert Disk File…', action: () => ctx.finder && ctx.finder.mountDiskFile && ctx.finder.mountDiskFile() });
  items.push({ label: 'Credits', action: () => ctx.launch('credits') });
  return { apple: true, items };
}

/** Simple Apple menu for utility windows (Get Info, About, Credits…).
    Restart and Shut Down live in the Special menu, as they did in Finder 6.1. */
export function utilityMenus(ctx, win) {
  return [appleMenu(ctx), {
    title: 'File',
    items: [{ label: 'Close', key: 'W', action: () => win.close() }],
  }, {
    title: 'Special',
    items: [
      { label: 'Set Startup…', action: () => ctx.setStartup && ctx.setStartup() },
      { sep: true },
      { label: 'Restart…', action: () => ctx.restart() },
      { label: 'Shut Down…', action: () => ctx.shutdown() },
    ],
  }];
}
