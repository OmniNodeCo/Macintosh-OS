/* About This Macintosh — System 7's replacement for About the Finder.

   Every running application gets a row with its memory bar; the largest unused
   block sits at the bottom. System 7 kept an easter egg here: the secret about
   box credited the team, who called themselves the Blue Meanies. Option-click
   the little Macintosh here for a small bow in their direction. */

import { el } from '../core/ui.js';
import { drawHappyMac } from '../core/icons.js';
import { allWindows } from '../core/wm.js';
import { getApp } from './index.js';

const TOTAL_K = 4096;      // Macintosh SE, memory maxed: 4 MB
const SYSTEM_K = 752;      // System Software resident

// plausible partition sizes, in K
const APP_K = {
  finder: 512, macwrite: 384, macpaint: 512, launcher: 128, calculator: 96,
  clock: 64, controlpanel: 128, keycaps: 48, notepad: 64, puzzle: 96,
  scrapbook: 96, credits: 96, about: 96, chooser: 128, printertest: 64,
};

export default {
  id: 'about',
  name: 'About This Macintosh',
  icon: 'floppy',
  kind: 'Application',
  w: 380,
  h: 280,
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
    const wrap = el('div', { class: 'about about7' });

    const face = el('canvas', { width: 64, height: 64, class: 'face' });
    drawHappyMac(face, 1);
    // the secret about box
    face.addEventListener('pointerdown', (e) => {
      if (!e.altKey) return;
      import('../core/wm.js').then(({ alert }) => alert({
        title: 'The Blue Meanies',
        icon: 'appleLarge',
        message: 'System 7 was built by a team that called itself\\nthe Blue Meanies, after the film Yellow Submarine.\\n\\nThis clone salutes them, and everyone who kept\\nthe Macintosh strange and wonderful.',
        buttons: ['OK'],
      }));
    });

    const cacheK = prefs.cacheOn === false ? 0 : (prefs.cache || 0);
    const rows = [];
    rows.push({ name: 'Finder', k: APP_K.finder });
    const seen = new Set();
    for (const w of allWindows()) {
      if (!w.app || w.app === 'finder' || w.app === 'about') continue;
      if (seen.has(w.app)) continue;
      seen.add(w.app);
      const app = getApp(w.app);
      rows.push({ name: app ? app.name : w.app, k: APP_K[w.app] || 128 });
    }
    const used = SYSTEM_K + rows.reduce((a, r) => a + r.k, 0) + cacheK;
    const largest = Math.max(0, TOTAL_K - used);

    const pct = (k) => `${Math.min(100, (k / TOTAL_K) * 100)}%`;
    const list = el('div', { class: 'appbars' });
    for (const r of rows) {
      list.append(el('div', { class: 'approw' },
        el('div', { class: 'appname', text: r.name }),
        el('div', { class: 'membar thin' }, el('div', { class: 'fill', style: { width: pct(r.k) } })),
        el('div', { class: 'appsize', text: `${r.k}K` }),
      ));
    }

    const info = el('div', { class: 'grow' });
    info.append(
      el('div', { style: { fontSize: '12px' }, text: 'Macintosh SE' }),
      el('div', { style: { opacity: '.75' }, text: 'System Software 7.0' }),
      el('div', { class: 'mem' },
        list,
        el('div', { class: 'memlist' },
          el('div', { text: `System ${SYSTEM_K}K` }),
          el('div', { text: cacheK ? `Disk cache ${cacheK}K` : 'Disk cache off' }),
          el('div', { text: `Total memory: ${TOTAL_K}K` }),
        ),
        el('div', { style: { opacity: '.7', fontSize: '12px' }, text: `Largest Unused Block: ${largest}K` }),
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
