/* MiniFinder — new in System 2.0. A small window that lists the applications
   you picked, so you can start one without loading the whole Finder into
   memory. Choosing Special ▸ Use MiniFinder swaps it in for the desktop. */

import { el } from '../core/ui.js';
import { iconImg } from '../core/icons.js';
import { keyClick } from '../core/sound.js';

export default {
  id: 'minifinder',
  name: 'MiniFinder',
  icon: 'minifinder',
  kind: 'Application',
  w: 312,
  h: 300,
  single: true,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [
        { label: 'Open', key: 'O', action: () => openSelected(appCtx) },
        { sep: true },
        { label: 'Use Finder', key: 'W', action: () => exitMini(appCtx) },
      ],
    }];
  },

  open(appCtx) {
    const { win, launch, apps, finder } = appCtx;

    // the Finder's desktop stays behind the small window; this is the modal shell
    const wrap = el('div', { class: 'mini' });
    wrap.append(el('p', { class: 'mini-lede', text: 'Choose an application.' }));

    const list = el('div', { class: 'mini-list', role: 'listbox', tabindex: '0' });
    const rows = [];
    let selected = 0;

    const visible = apps.filter((a) => a.id !== 'minifinder');

    visible.forEach((app, i) => {
      const row = el('div', { class: 'mini-row', role: 'option', 'data-app': app.id },
        el('span', { class: 'mini-plate' }, iconImg(app.icon || 'app')),
        el('span', { class: 'mini-name', text: app.name }),
      );
      row.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        select(i);
        keyClick();
      });
      row.addEventListener('dblclick', () => launch(app.id));
      rows.push(row);
      list.append(row);
    });

    function select(i) {
      selected = (i + rows.length) % rows.length;
      rows.forEach((r, k) => {
        r.classList.toggle('sel', k === selected);
        r.setAttribute('aria-selected', k === selected ? 'true' : 'false');
      });
      const row = rows[selected];
      if (row) row.scrollIntoView({ block: 'nearest' });
    }

    function openSelected() {
      const app = visible[selected];
      if (!app) return;
      if (app.id === 'finder') { exitMini(appCtx); return; }
      launch(app.id);
      keyClick();
    }

    list.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); select(selected + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); select(selected - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); openSelected(); }
      else if (e.key === 'Escape') { e.preventDefault(); exitMini(appCtx); }
    });

    const foot = el('div', { class: 'mini-foot' },
      el('span', { text: 'Double-click to open' }),
      el('button', {
        class: 'btn',
        text: 'Use Finder',
        onpointerdown: (e) => { e.preventDefault(); exitMini(appCtx); },
      }),
    );

    win.body.append(wrap, list, foot);
    select(0);
    setTimeout(() => { win.el.focus(); list.focus(); }, 30);
    void finder;
  },
};

/* Leave MiniFinder and put the Finder back in charge of the desktop. */
export function exitMini(appCtx) {
  const { win, onUseFinder } = appCtx;
  if (typeof onUseFinder === 'function') onUseFinder();
  win.close();
}
