/* Note Pad — four pages of quick notes, saved with the preferences.
   Click the folded corners to turn pages, exactly like the desk accessory. */

import { el } from '../core/ui.js';
import { keyClick } from '../core/sound.js';

export default {
  id: 'notepad',
  name: 'Note Pad',
  icon: 'notepad',
  kind: 'Desk Accessory',
  w: 258,
  h: 202,
  single: true,
  resizable: false,

  menus(appCtx) {
    return [
      {
        title: 'File',
        items: [
          { label: 'Previous Page', action: () => appCtx.api.flip(-1) },
          { label: 'Next Page', action: () => appCtx.api.flip(1) },
          { sep: true },
          { label: 'Close', key: 'W', action: () => appCtx.win.close() },
        ],
      },
      {
        title: 'Edit',
        items: [
          { label: 'Select All', key: 'A', action: () => appCtx.api.selectAll() },
          { label: 'Clear Page', action: () => appCtx.api.clearPage() },
        ],
      },
    ];
  },

  open(appCtx) {
    const { win, prefs, savePrefs } = appCtx;
    if (!Array.isArray(prefs.notepad) || prefs.notepad.length !== 4) prefs.notepad = ['', '', '', ''];

    let pageNo = 0;
    const wrap = el('div', { class: 'notepad' });
    const page = el('div', { class: 'np-page', contenteditable: 'true', spellcheck: 'false' });
    const foot = el('div', { class: 'np-foot' });
    const label = el('span', {});
    const hint = el('span', { style: { opacity: '.6' }, text: 'corners turn pages' });
    foot.append(label, hint);
    wrap.append(page, foot);

    const prev = el('div', { class: 'corner prev', title: 'Previous page' });
    const next = el('div', { class: 'corner next', title: 'Next page' });
    wrap.append(prev, next);
    win.body.append(wrap);

    const paint = () => {
      page.textContent = prefs.notepad[pageNo] || '';
      label.textContent = `Page ${pageNo + 1} of 4`;
    };

    const flip = (dir) => {
      prefs.notepad[pageNo] = page.textContent;
      savePrefs();
      pageNo = (pageNo + dir + 4) % 4;
      paint();
      keyClick();
    };

    page.addEventListener('input', () => {
      prefs.notepad[pageNo] = page.textContent;
      if (page.textContent.length % 8 === 0) savePrefs();
    });
    page.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey) return;
      if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace') keyClick();
    });
    page.addEventListener('blur', () => { prefs.notepad[pageNo] = page.textContent; savePrefs(); });

    prev.addEventListener('pointerdown', (e) => { e.preventDefault(); flip(-1); });
    next.addEventListener('pointerdown', (e) => { e.preventDefault(); flip(1); });

    const api = {
      flip,
      selectAll() {
        const range = document.createRange();
        range.selectNodeContents(page);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        page.focus();
      },
      clearPage() {
        page.textContent = '';
        prefs.notepad[pageNo] = '';
        savePrefs();
      },
    };
    appCtx.api = api;

    paint();
    win.refreshMenus();
  },
};
