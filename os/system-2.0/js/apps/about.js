/* About This Macintosh — the memory panel. */

import { el } from '../core/ui.js';
import { drawHappyMac } from '../core/icons.js';

export default {
  id: 'about',
  name: 'About This Macintosh',
  icon: 'floppy',
  kind: 'Application',
  w: 344,
  h: 244,
  single: true,
  resizable: false,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [{ label: 'Close', key: 'W', action: () => appCtx.win.close() }],
    }];
  },

  open(appCtx) {
    const { win } = appCtx;
    const wrap = el('div', { class: 'about' });

    const face = el('canvas', { width: 64, height: 64, class: 'face' });
    drawHappyMac(face, 1);

    const info = el('div', { class: 'grow' });
    info.append(
      el('div', { style: { fontSize: '12px' }, text: 'Macintosh 512K' }),
      el('div', { style: { opacity: '.75' }, text: 'System Software 2.0' }),
      el('div', { style: { opacity: '.75' }, text: 'Finder 4.1 (web clone)' }),
      el('div', { class: 'mem' },
        el('div', { text: 'Total memory: 512K' }),
        el('div', { class: 'membar' },
          el('div', { class: 'fill', style: { width: '38%' } }),
          el('div', { class: 'fill', style: { width: '14%', borderLeft: '1px solid #000' } }),
        ),
        el('div', { style: { opacity: '.7', fontSize: '12px' }, text: 'System 196K \u00b7 Largest unused 316K' }),
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
