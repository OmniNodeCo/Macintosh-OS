/* About the Finder — new in System 3.0.

   In 2.0 the Apple menu's first item opened a picture of a mountain. From 3.0
   it opened a memory meter: total memory, how much the System and the Finder
   were holding, and the largest block still free. This is that window. */

import { el } from '../core/ui.js';
import { drawHappyMac } from '../core/icons.js';

const TOTAL_K = 1024;      // Macintosh Plus: 1 MB
const SYSTEM_K = 196;      // System file resident
const FINDER_K = 52;       // Finder 5.1 resident

export default {
  id: 'about',
  name: 'About the Finder',
  icon: 'floppy',
  kind: 'Application',
  w: 356,
  h: 258,
  single: true,
  resizable: false,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [{ label: 'Close', key: 'W', action: () => appCtx.win.close() }],
    }];
  },

  open(appCtx) {
    const { win, prefs } = appCtx;
    const wrap = el('div', { class: 'about' });

    const face = el('canvas', { width: 64, height: 64, class: 'face' });
    drawHappyMac(face, 1);

    const cacheK = prefs.cacheOn === false ? 0 : (prefs.cache || 0);
    const largest = TOTAL_K - SYSTEM_K - FINDER_K - cacheK;

    const pct = (k) => `${(k / TOTAL_K) * 100}%`;
    const bar = el('div', { class: 'membar' },
      el('div', { class: 'fill', style: { width: pct(SYSTEM_K) } }),
      el('div', { class: 'fill', style: { width: pct(FINDER_K), borderLeft: '1px solid #000' } }),
      el('div', { class: 'fill dither', style: { width: pct(cacheK), borderLeft: '1px solid #000' } }),
    );

    const info = el('div', { class: 'grow' });
    info.append(
      el('div', { style: { fontSize: '12px' }, text: 'Macintosh Plus' }),
      el('div', { style: { opacity: '.75' }, text: 'System Software 3.0' }),
      el('div', { style: { opacity: '.75' }, text: 'Finder 5.1 (web clone)' }),
      el('div', { class: 'mem' },
        el('div', { text: `Total memory: ${TOTAL_K}K` }),
        bar,
        el('div', { class: 'memlist' },
          el('div', { text: `System ${SYSTEM_K}K` }),
          el('div', { text: `Finder ${FINDER_K}K` }),
          el('div', { text: cacheK ? `Disk cache ${cacheK}K` : 'Disk cache off' }),
        ),
        el('div', { style: { opacity: '.7', fontSize: '12px' },
          text: `Largest unused block: ${largest}K` }),
      ),
      el('div', { style: { marginTop: '8px' } },
        el('button', {
          class: 'btn',
          text: 'Credits',
          onpointerdown: (e) => { e.preventDefault(); appCtx.launch('credits'); },
        }),
      ),
      el('div', { style: { marginTop: '10px', opacity: '.65', fontSize: '12px', lineHeight: '12px' },
        text: 'A browser tribute. Not an Apple product.' }),
    );

    wrap.append(face, info);
    win.body.append(wrap);
    win.refreshMenus();
  },
};
