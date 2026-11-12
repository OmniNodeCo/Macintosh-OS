/* The Apple menu is shared by every window: desk accessories + system items. */

export function appleMenu(ctx) {
  return {
    apple: true,
    items: [
      { label: 'About This Macintosh…', action: () => ctx.launch('about') },
      { sep: true },
      { label: 'Launcher', action: () => ctx.launch('launcher') },
      { label: 'Calculator', action: () => ctx.launch('calculator') },
      { label: 'Alarm Clock', action: () => ctx.launch('clock') },
      { label: 'Control Panel', action: () => ctx.launch('controlpanel') },
      { label: 'Key Caps', action: () => ctx.launch('keycaps') },
      { label: 'Note Pad', action: () => ctx.launch('notepad') },
      { label: 'Puzzle', action: () => ctx.launch('puzzle') },
      { label: 'Scrapbook', action: () => ctx.launch('scrapbook') },
      { label: 'Credits', action: () => ctx.launch('credits') },
      { sep: true },
      { label: 'Restart…', action: () => ctx.restart() },
      { label: 'Shut Down…', action: () => ctx.shutdown() },
    ],
  };
}

/** Simple Apple menu for utility windows (Get Info, About, Credits…). */
export function utilityMenus(ctx, win) {
  return [appleMenu(ctx), {
    title: 'File',
    items: [
      { label: 'Close', key: 'W', action: () => win.close() },
      { sep: true },
      { label: 'Restart…', action: () => ctx.restart() },
      { label: 'Shut Down…', action: () => ctx.shutdown() },
    ],
  }];
}
