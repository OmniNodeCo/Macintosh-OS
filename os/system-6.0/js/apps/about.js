/* About the Finder — the System 3.0 memory meter, still going in 6.0.

   System 6's twist (documented in the System 6 manuals): the "Largest Unused
   Block" line only appears when MultiFinder is running — without MultiFinder
   the Finder gives the whole machine to each application, so the number meant
   nothing. This window obeys that rule. */

import { el } from '../core/ui.js';
import { drawHappyMac } from '../core/icons.js';

const TOTAL_K = 2048;      // Macintosh SE: 2 MB
const SYSTEM_K = 424;      // System file resident
const FINDER_K = 96;       // Finder 6.1 resident

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
    const multiFinder = !!prefs.multiFinder;

    const pct = (k) => `${(k / TOTAL_K) * 100}%`;
    const bar = el('div', { class: 'membar' },
      el('div', { class: 'fill', style: { width: pct(SYSTEM_K) } }),
      el('div', { class: 'fill', style: { width: pct(FINDER_K), borderLeft: '1px solid #000' } }),
      el('div', { class: 'fill dither', style: { width: pct(cacheK), borderLeft: '1px solid #000' } }),
    );

    const info = el('div', { class: 'grow' });
    info.append(
      el('div', { style: { fontSize: '12px' }, text: 'Macintosh SE' }),
      el('div', { style: { opacity: '.75' }, text: 'System Software 6.0' }),
      el('div', { style: { opacity: '.75' }, text: `Finder 6.1 (web clone) · MultiFinder ${multiFinder ? 'on' : 'off'}` }),
      el('div', { class: 'mem' },
        el('div', { text: `Total memory: ${TOTAL_K}K` }),
        bar,
        el('div', { class: 'memlist' },
          el('div', { text: `System ${SYSTEM_K}K` }),
          el('div', { text: `Finder ${FINDER_K}K` }),
          el('div', { text: cacheK ? `Disk cache ${cacheK}K` : 'Disk cache off' }),
        ),
        // System 6: only with MultiFinder running.
        multiFinder
          ? el('div', { style: { opacity: '.7', fontSize: '12px' },
            text: `Largest unused block: ${largest}K` })
          : el('div', { style: { opacity: '.5', fontSize: '12px' },
            text: 'Turn on MultiFinder to see the largest unused block.' }),
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
