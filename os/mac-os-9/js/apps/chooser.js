/* Chooser — new in System 7.0, and the desk accessory that replaced 2.0's
   Choose Printer. It does the same job (pick the driver, pick the port) and
   adds the one thing System 7.0 brought with it: AppleTalk. Turn AppleTalk on
   and the LaserWriter list fills with the printers it can see on the network,
   picked out of an AppleTalk zone by name. */

import { el } from '../core/ui.js';
import { beep } from '../core/sound.js';

const PRINTERS = [
  {
    id: 'imagewriter', name: 'ImageWriter', icon: 'printer',
    kind: 'Dot matrix · serial',
    blurb: '72 dpi, 9-pin, connected to a serial port.',
  },
  {
    id: 'laserwriter', name: 'LaserWriter', icon: 'printer', laser: true,
    kind: 'PostScript · AppleTalk',
    blurb: '300 dpi, shared by everyone on the network.',
  },
];

/* what a LaserWriter on a real LocalTalk run answered to */
const ZONES = [
  { id: '*', name: '*', devices: ['LaserWriter 8500', 'LaserWriter NT'] },
  { id: 'Engineering', name: 'Engineering', devices: ['LaserWriter Plus'] },
];

const PORTS = ['Printer', 'Modem', 'AppleTalk'];

export default {
  id: 'chooser',
  name: 'Chooser',
  icon: 'printer',
  kind: 'Desk Accessory',
  w: 384,
  h: 300,
  single: true,
  resizable: false,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [
        { label: 'Print Test Page', action: () => testPage(appCtx) },
        { sep: true },
        { label: 'Close', key: 'W', action: () => appCtx.win.close() },
      ],
    }];
  },

  open(appCtx) {
    const { win, prefs, savePrefs } = appCtx;

    prefs.printer = prefs.printer || 'imagewriter';
    prefs.printerPort = prefs.printerPort || 'Printer';
    prefs.appleTalk = prefs.appleTalk !== false;
    prefs.chooserDevice = prefs.chooserDevice || 'LaserWriter 8500';
    prefs.chooserZone = prefs.chooserZone || '*';

    const wrap = el('div', { class: 'chooser' });

    /* ---------------------------------------------------- printer icons -- */
    wrap.append(el('p', { class: 'chooser-lede', text: 'Select a printer.' }));
    const iconRow = el('div', { class: 'chooser-icons' });
    const plates = [];
    for (const p of PRINTERS) {
      const plate = el('div', { class: 'chooser-icon', 'data-printer': p.id, tabindex: '0', role: 'radio' });
      plate.append(el('span', { class: 'chooser-printer' }), el('span', { class: 'chooser-icon-name', text: p.name }));
      const pick = () => {
        if (p.laser && !prefs.appleTalk) { beep(0.1); return; }
        prefs.printer = p.id;
        if (p.laser) prefs.printerPort = 'AppleTalk';
        savePrefs();
        paint();
        beep(0.05);
      };
      plate.addEventListener('pointerdown', (e) => { e.preventDefault(); pick(); });
      plate.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(); }
      });
      plates.push(plate);
      iconRow.append(plate);
    }
    wrap.append(iconRow);

    /* --------------------------------------------------------- AppleTalk -- */
    const atRow = el('div', { class: 'chooser-at' });
    atRow.append(el('span', { class: 'chooser-label', text: 'AppleTalk:' }));
    const atOn = el('button', { class: 'chooser-radio', 'data-state': 'on', text: 'Active' });
    const atOff = el('button', { class: 'chooser-radio', 'data-state': 'off', text: 'Inactive' });
    atRow.append(atOn, atOff);
    wrap.append(atRow);

    /* --------------------------------------------- zone + device pickers -- */
    const cols = el('div', { class: 'chooser-cols' });
    const zoneBox = el('div', { class: 'chooser-col' });
    zoneBox.append(el('span', { class: 'chooser-label', text: 'Zones' }));
    const zoneList = el('div', { class: 'chooser-listbox', role: 'listbox' });
    zoneBox.append(zoneList);

    const devBox = el('div', { class: 'chooser-col' });
    devBox.append(el('span', { class: 'chooser-label', text: 'Devices' }));
    const devList = el('div', { class: 'chooser-listbox', role: 'listbox' });
    devBox.append(devList);

    cols.append(zoneBox, devBox);
    wrap.append(cols);

    /* -------------------------------------------------------- connect via -- */
    const portRow = el('div', { class: 'chooser-at' });
    portRow.append(el('span', { class: 'chooser-label', text: 'Connect via:' }));
    const portBtns = [];
    for (const p of PORTS) {
      const b = el('button', { class: 'chooser-radio', 'data-port': p, text: p });
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        prefs.printerPort = p;
        savePrefs();
        beep(0.04);
        paint();
      });
      portBtns.push(b);
      portRow.append(b);
    }
    wrap.append(portRow);

    const status = el('p', { class: 'chooser-status' });
    wrap.append(status);

    /* ------------------------------------------------------------- paint -- */
    function paint() {
      const chosen = PRINTERS.find((p) => p.id === prefs.printer) || PRINTERS[0];
      for (const plate of plates) {
        const on = plate.dataset.printer === prefs.printer;
        const isLaser = PRINTERS.find((p) => p.id === plate.dataset.printer).laser;
        plate.classList.toggle('on', on);
        plate.classList.toggle('off', isLaser && !prefs.appleTalk);
        plate.setAttribute('aria-checked', on ? 'true' : 'false');
      }
      atOn.classList.toggle('on', prefs.appleTalk);
      atOff.classList.toggle('on', !prefs.appleTalk);
      atOn.setAttribute('aria-checked', prefs.appleTalk ? 'true' : 'false');
      atOff.setAttribute('aria-checked', prefs.appleTalk ? 'false' : 'true');

      zoneList.innerHTML = '';
      devList.innerHTML = '';
      if (!prefs.appleTalk) {
        zoneList.append(el('div', { class: 'chooser-empty', text: 'AppleTalk is off' }));
        devList.append(el('div', { class: 'chooser-empty', text: '—' }));
      } else {
        for (const z of ZONES) {
          const row = el('div', {
            class: 'chooser-row-s' + (prefs.chooserZone === z.id ? ' on' : ''),
            role: 'option', text: z.name,
          });
          row.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            prefs.chooserZone = z.id;
            const zone = ZONES.find((zz) => zz.id === z.id);
            prefs.chooserDevice = zone.devices[0];
            savePrefs();
            beep(0.04);
            paint();
          });
          zoneList.append(row);
        }
        const zone = ZONES.find((z) => z.id === prefs.chooserZone) || ZONES[0];
        for (const d of zone.devices) {
          const row = el('div', {
            class: 'chooser-row-s' + (prefs.chooserDevice === d ? ' on' : ''),
            role: 'option', text: d,
          });
          row.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            prefs.chooserDevice = d;
            savePrefs();
            beep(0.04);
            paint();
          });
          devList.append(row);
        }
      }

      for (const b of portBtns) b.classList.toggle('on', b.dataset.port === prefs.printerPort);

      // the port the printer actually talks over follows the printer type
      const via = chosen.laser ? 'AppleTalk' : prefs.printerPort;
      if (chosen.laser && prefs.appleTalk) {
        prefs.printerPort = 'AppleTalk';
        for (const b of portBtns) b.classList.toggle('on', b.dataset.port === 'AppleTalk');
      }

      status.textContent = chosen.laser
        ? (prefs.appleTalk
          ? `${prefs.chooserDevice} in zone “${prefs.chooserZone}”, via AppleTalk.`
          : 'Turn AppleTalk on to use the LaserWriter.')
        : `${chosen.name} on the ${via} port.`;

      win.setTitle(`Chooser — ${chosen.laser && prefs.appleTalk ? prefs.chooserDevice : chosen.name}`);
      win.refreshMenus();
    }

    atOn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      prefs.appleTalk = true;
      savePrefs();
      beep(0.05);
      paint();
    });
    atOff.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      prefs.appleTalk = false;
      if (prefs.printer === 'laserwriter') prefs.printer = 'imagewriter';
      savePrefs();
      beep(0.05);
      paint();
    });

    win.body.append(wrap);
    paint();
    appCtx.api = { paint, testPage: () => testPage(appCtx) };
  },
};

/* "(Test Page)" printed a page with the printer's name and driver version on
   it: the quickest way to find out whether the cabling was right. */
function testPage(appCtx) {
  const { prefs, launch } = appCtx;
  const name = prefs.printer === 'laserwriter'
    ? (prefs.chooserDevice || 'LaserWriter')
    : 'ImageWriter';
  const zone = prefs.printer === 'laserwriter' ? ` · zone “${prefs.chooserZone}”` : '';
  beep(0.06);
  launch('printertest', { detail: name, zone });
}
