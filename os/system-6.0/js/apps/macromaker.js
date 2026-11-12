/* MacroMaker — the new System 6.0 desk accessory.

   It records where you click and what you type, and plays it back — the UI is
   deliberately a tape recorder: two reels and three transport keys. The real
   thing recorded only click locations and mouse paths, and was famous for
   missing buttons that had moved. This clone plays the part but records
   nothing: every press of Play says so, honestly. */

import { el } from '../core/ui.js';
import { iconImg } from '../core/icons.js';
import { beep } from '../core/sound.js';

export default {
  id: 'macromaker',
  name: 'MacroMaker',
  icon: 'macromaker',
  kind: 'Desk Accessory',
  w: 320,
  h: 180,
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
    const wrap = el('div', { class: 'macromaker' });

    const deck = el('div', { class: 'mm-deck' },
      iconImg('macromaker'),
      el('div', { class: 'mm-label', text: 'MacroMaker' }),
      el('div', { class: 'mm-status', text: 'No macro is recorded.' }),
    );

    const keys = el('div', { class: 'mm-keys' });
    for (const label of ['Record', 'Play', 'Stop']) {
      const k = el('button', { class: 'btn mm-key', text: label });
      k.addEventListener('pointerdown', () => {
        beep(0.08);
        const status = deck.querySelector('.mm-status');
        if (label === 'Stop') {
          status.textContent = 'Stopped. Nothing to stop, really.';
        } else if (label === 'Record') {
          status.textContent = 'Recording… (the clone records nothing).';
          setTimeout(() => {
            status.textContent = 'No macro is recorded.';
          }, 1600);
        } else {
          status.textContent = 'No macro is recorded.';
        }
      });
      keys.append(k);
    }

    wrap.append(deck, keys,
      el('div', { class: 'mm-foot', text: 'The real MacroMaker taped your clicks in 1988. It did not survive System 7.' }));
    win.body.append(wrap);
    win.refreshMenus();
  },
};
