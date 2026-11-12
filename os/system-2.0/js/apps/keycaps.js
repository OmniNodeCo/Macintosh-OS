/* Key Caps — shows the keyboard and echoes whatever you type. */

import { el } from '../core/ui.js';
import { keyClick } from '../core/sound.js';

const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
  ['Space', 'Return', 'Delete', 'Shift', 'Tab'],
];

export default {
  id: 'keycaps',
  name: 'Key Caps',
  icon: 'keycaps',
  kind: 'Desk Accessory',
  w: 436,
  h: 186,
  single: true,
  resizable: false,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [{ label: 'Close', key: 'W', action: () => appCtx.win.close() }],
    }, {
      title: 'Edit',
      items: [{ label: 'Clear', action: () => appCtx.api.clear() }],
    }];
  },

  open(appCtx) {
    const { win } = appCtx;
    const wrap = el('div', { class: 'keycaps' });
    const field = el('div', { class: 'kc-field', text: '' });
    const kb = el('div', { class: 'kb' });
    const hint = el('div', { class: 'kc-hint', text: 'Type on your keyboard — or click a key.' });
    wrap.append(field, kb, hint);
    win.body.append(wrap);

    const keyEls = new Map();

    function addRow(labels, cls = '') {
      const row = el('div', { class: 'kc-row ' + cls });
      for (const label of labels) {
        const k = el('div', {
          class: 'kc-key' + (label === 'Space' ? ' space' : ['Return', 'Delete', 'Shift', 'Tab'].includes(label) ? ' wide' : ''),
          'data-key': label.toUpperCase(),
          text: label === 'Space' ? '' : label,
        });
        k.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          flash(k);
          type(label === 'Space' ? ' ' : label === 'Return' ? '\n' : '');
        });
        keyEls.set(label.toUpperCase(), k);
        row.append(k);
      }
      kb.append(row);
    }

    ROWS.forEach((r) => addRow(r));

    let buffer = '';
    const paint = () => {
      field.textContent = buffer.replace(/\n/g, ' ⏎ ');
      field.scrollLeft = field.scrollWidth;
    };

    function type(ch) {
      if (!ch) return;
      if (ch === '\n') buffer += '\n';
      else buffer += ch;
      if (buffer.length > 60) buffer = buffer.slice(-60);
      paint();
    }

    function flash(node) {
      node.classList.add('down');
      setTimeout(() => node.classList.remove('down'), 90);
    }

    const onKey = (e) => {
      if (!win.el.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key === ' ' ? 'SPACE' : e.key.toUpperCase();
      const node = keyEls.get(key) || keyEls.get(e.key === ' ' ? 'SPACE' : '');
      if (node) flash(node);
      if (e.key.length === 1) { e.preventDefault(); keyClick(); type(e.key); }
      else if (e.key === 'Enter') { e.preventDefault(); type('\n'); }
      else if (e.key === 'Backspace') {
        e.preventDefault();
        buffer = buffer.slice(0, -1);
        paint();
      }
    };
    window.addEventListener('keydown', onKey);

    const api = { clear() { buffer = ''; paint(); } };
    appCtx.api = api;

    win.el.tabIndex = 0;
    setTimeout(() => win.el.focus(), 40);
    win.onDestroy = () => window.removeEventListener('keydown', onKey);
    paint();
    win.refreshMenus();
  },
};
