/* Launcher — the big icon grid for starting applications.
   (Finder 1.0 had no launcher, and the Finder itself did not get one until
   System 7. This full-screen launcher is the clone's, drawn in the same 1-bit
   Finder style; System 2.0's own launcher is MiniFinder.) */

import { el, clamp } from '../core/ui.js';
import { iconImg } from '../core/icons.js';
import { scroller } from '../core/wm.js';
import { click } from '../core/sound.js';

export default {
  id: 'launcher',
  name: 'Launcher',
  icon: 'launcher',
  kind: 'Application',
  w: 392,
  h: 248,
  single: true,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [
        { label: 'Open', key: 'O', action: () => openSelected(appCtx) },
        { sep: true },
        { label: 'Close', key: 'W', action: () => appCtx.win.close() },
      ],
    }];
  },

  open(appCtx) {
    const { win, launch, apps } = appCtx;

    const head = el('div', { class: 'launcher-head' },
      el('span', { text: 'Applications' }),
      el('span', { text: `${apps.length} items` }),
    );

    const sc = scroller(win, { v: true, h: false, top: 17 });
    win.body.append(head);

    const grid = el('div', { class: 'launcher-grid' });
    sc.view.append(grid);

    let selected = null;
    const items = [];

    for (const app of apps) {
      const item = el('div', { class: 'lapp' },
        el('div', { class: 'plate' }, iconImg(app.icon || 'app')),
        el('span', { class: 'lbl', text: app.name }),
      );
      item.addEventListener('pointerdown', () => {
        selected = app;
        items.forEach((i) => i.classList.toggle('sel', i === item));
        win.refreshMenus();
      });
      item.addEventListener('dblclick', () => { appCtx.launch(app.id); });
      grid.append(item);
      items.push(item);
    }

    function openSelected(ctx) {
      const chosen = selected || apps[0];
      if (chosen) ctx.launch(chosen.id);
    }

    // keyboard: arrows move the selection, Return opens
    function onKey(e) {
      if (e.key === 'Enter' && selected) {
        e.preventDefault();
        appCtx.launch(selected.id);
      }
    }
    win.el.addEventListener('keydown', onKey);
    win.onDestroy = () => win.el.removeEventListener('keydown', onKey);

    setTimeout(() => { sc.update(); }, 30);
  },
};
