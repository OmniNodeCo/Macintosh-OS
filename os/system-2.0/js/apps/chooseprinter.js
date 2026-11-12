/* Choose Printer — the System 2.0 desk accessory that grew up to be the
   Chooser. Pick the ImageWriter or the LaserWriter and the port it hangs off;
   the choice is remembered as prefs.printer and prefs.printerPort. */

import { el } from '../core/ui.js';
import { beep } from '../core/sound.js';

const PRINTERS = [
  {
    id: 'imagewriter',
    name: 'ImageWriter',
    kind: 'Dot matrix',
    blurb: 'The original 72 dpi dot-matrix printer. Prints draft and quality.',
  },
  {
    id: 'laserwriter',
    name: 'LaserWriter',
    kind: 'Laser · AppleTalk',
    blurb: '300 dpi PostScript laser printer, shared over the AppleTalk network.',
  },
];

const PORTS = ['Printer', 'Modem', 'AppleTalk'];

export default {
  id: 'chooseprinter',
  name: 'Choose Printer',
  icon: 'printer',
  kind: 'Desk Accessory',
  w: 344,
  h: 268,
  single: true,
  resizable: false,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [
        { label: 'Print Test Page', action: () => printTest(appCtx) },
        { sep: true },
        { label: 'Close', key: 'W', action: () => appCtx.win.close() },
      ],
    }];
  },

  open(appCtx) {
    const { win, prefs, savePrefs, launch } = appCtx;

    prefs.printer = prefs.printer || 'imagewriter';
    prefs.printerPort = prefs.printerPort || 'Printer';

    const wrap = el('div', { class: 'chooser' });
    wrap.append(el('p', { class: 'chooser-lede', text: 'Select a printer, then close this window.' }));

    const list = el('div', { class: 'chooser-list' });
    const rows = [];

    for (const p of PRINTERS) {
      const row = el('div', { class: 'chooser-row', role: 'radio', tabindex: '0', 'data-printer': p.id });
      const plate = el('div', { class: 'chooser-plate' }, el('span', { class: 'chooser-printer' }));
      const copy = el('div', { class: 'chooser-copy' });
      copy.append(
        el('div', { class: 'chooser-name', text: p.name }),
        el('div', { class: 'chooser-kind', text: p.kind }),
        el('div', { class: 'chooser-blurb', text: p.blurb }),
      );
      const check = el('div', { class: 'chooser-check' });
      row.append(plate, copy, check);

      const pick = () => {
        prefs.printer = p.id;
        savePrefs();
        paint();
        beep(0.06);
      };
      row.addEventListener('pointerdown', (e) => { e.preventDefault(); pick(); });
      row.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(); }
      });
      rows.push(row);
      list.append(row);
    }

    const foot = el('div', { class: 'chooser-foot' });
    const portLabel = el('span', { text: 'Port' });
    const portSel = el('select', { class: 'chooser-port' });
    for (const p of PORTS) portSel.append(el('option', { value: p, text: p }));
    portSel.addEventListener('change', () => {
      prefs.printerPort = portSel.value;
      savePrefs();
    });
    foot.append(portLabel, portSel);

    const status = el('p', { class: 'chooser-status' });
    wrap.append(list, foot, status);

    function paint() {
      for (const row of rows) {
        const on = row.dataset.printer === prefs.printer;
        row.classList.toggle('on', on);
        row.setAttribute('aria-checked', on ? 'true' : 'false');
        row.querySelector('.chooser-check').textContent = on ? '\u2713' : '';
      }
      portSel.value = prefs.printerPort;
      const chosen = PRINTERS.find((p) => p.id === prefs.printer) || PRINTERS[0];
      status.textContent = `${chosen.name} on the ${prefs.printerPort} port.`;
      win.setTitle(`Choose Printer — ${chosen.name}`);
      win.refreshMenus();
    }

    win.body.append(wrap);
    paint();

    // the Test Page command needs to see this closure
    win.chooserApi = { paint, printTest: () => printTest(appCtx) };
    appCtx.api = { printTest: () => printTest(appCtx), paint };
    void launch;
  },
};

/* A very small "page": a dialog that reports what the printer would print. */
function printTest(appCtx) {
  const { prefs, launch } = appCtx;
  const name = prefs.printer === 'laserwriter' ? 'LaserWriter' : 'ImageWriter';
  beep(0.05);
  launch('about');
  void name;
}
