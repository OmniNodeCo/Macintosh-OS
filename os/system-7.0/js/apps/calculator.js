/* Calculator — the classic four-function desk accessory. */

import { el } from '../core/ui.js';
import { keyClick, beep } from '../core/sound.js';

export default {
  id: 'calculator',
  name: 'Calculator',
  icon: 'calculator',
  kind: 'Desk Accessory',
  w: 152,
  h: 208,
  single: true,
  resizable: false,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [
        { label: 'Clear', key: 'C', action: () => appCtx.api.clear() },
        { sep: true },
        { label: 'Close', key: 'W', action: () => appCtx.win.close() },
      ],
    }];
  },

  open(appCtx) {
    const { win } = appCtx;
    const wrap = el('div', { class: 'calc' });
    const display = el('div', { class: 'display', text: '0' });
    const keys = el('div', { class: 'keys' });
    wrap.append(display, keys);
    win.body.append(wrap);

    let current = '0';
    let stored = null;
    let op = null;
    let fresh = true;

    const show = () => {
      const text = current.length > 12 ? Number(current).toExponential(6) : current;
      display.textContent = text;
    };

    const calc = (a, b, o) => {
      switch (o) {
        case '+': return a + b;
        case '−': return a - b;
        case '×': return a * b;
        case '÷': return b === 0 ? null : a / b;
        default: return b;
      }
    };

    const api = {
      clear() { current = '0'; stored = null; op = null; fresh = true; show(); },
    };
    appCtx.api = api;

    const press = (label) => {
      keyClick();
      if (/^[0-9]$/.test(label)) {
        if (fresh) { current = label; fresh = false; }
        else current = current === '0' ? label : current + label;
      } else if (label === '.') {
        if (fresh) { current = '0.'; fresh = false; }
        else if (!current.includes('.')) current += '.';
      } else if (label === 'C') {
        api.clear();
        return;
      } else if (label === '±') {
        current = String(-Number(current));
        fresh = false;
      } else if (label === '=') {
        if (op !== null) {
          const r = calc(Number(stored), Number(current), op);
          if (r === null) { beep(); current = '0'; } else current = String(Number(r.toPrecision(12)));
          stored = null; op = null; fresh = true;
        }
      } else {
        // + − × ÷
        if (op !== null && !fresh) {
          const r = calc(Number(stored), Number(current), op);
          if (r !== null) current = String(Number(r.toPrecision(12)));
        }
        stored = current;
        op = label;
        fresh = true;
      }
      show();
    };

    const layout = [
      ['C', '±', '÷', '×'],
      ['7', '8', '9', '−'],
      ['4', '5', '6', '+'],
      ['1', '2', '3', '='],
      ['0', '.', null, null],
    ];

    for (const row of layout) {
      for (const label of row) {
        if (label === null) continue;
        const key = el('button', {
          class: 'key' + (label === '=' ? ' tall' : '') + (label === '0' ? ' wide' : ''),
          text: label,
        });
        if (label === '0') key.style.gridColumn = 'span 2';
        if (label === '=') key.style.gridRow = 'span 2';
        key.addEventListener('pointerdown', (e) => { e.preventDefault(); press(label); });
        keys.append(key);
      }
    }

    const onKey = (e) => {
      if (e.target.closest('.win') !== win.el) return;
      const map = { '*': '×', '/': '÷', '-': '−', '+': '+', Enter: '=', '=': '=', Escape: 'C', c: 'C' };
      if (/^[0-9.]$/.test(e.key)) { e.preventDefault(); press(e.key); }
      else if (map[e.key]) { e.preventDefault(); press(map[e.key]); }
      else if (e.key === 'Backspace') {
        e.preventDefault();
        current = current.length > 1 ? current.slice(0, -1) : '0';
        show();
      }
    };
    win.el.tabIndex = 0;
    window.addEventListener('keydown', onKey);
    win.onDestroy = () => window.removeEventListener('keydown', onKey);

    show();
    win.refreshMenus();
  },
};
