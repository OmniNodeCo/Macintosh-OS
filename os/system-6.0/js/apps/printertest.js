/* Printer test page — what the Chooser's Print Test Page command produces.
   A 1-bit "page" carrying the printer's name, its driver version and the date,
   which is exactly what you looked at in 1986 when the cable was suspect.
   The command itself is the clone's; the Chooser only chose things. */

import { el, fmtDate } from '../core/ui.js';

const ART = [
  '################################',
  '#..............................#',
  '#..######..#####..#...#..######.#',
  '#..#...#..#....#..#..#...#....#.#',
  '#..#...#..#....#..##.#...#....#.#',
  '#..######..#####..#.#.#..#....#.#',
  '#..#.......#..#...#..#...#....#.#',
  '#..#.......#...#..#...#..#....#.#',
  '#..#.......#..#...#....#.######.#',
  '#..............................#',
  '#..............................#',
  '################################',
];

export default {
  id: 'printertest',
  name: 'Test Page',
  icon: 'printer',
  kind: 'Document',
  w: 300,
  h: 200,
  single: true,
  resizable: false,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [
        { label: 'Print Again', action: () => appCtx.launch('printertest', { detail: appCtx.fromNode?.detail }) },
        { sep: true },
        { label: 'Close', key: 'W', action: () => appCtx.win.close() },
      ],
    }];
  },

  open(appCtx) {
    const { win, prefs } = appCtx;
    const laser = prefs.printer === 'laserwriter';
    const device = laser ? (prefs.chooserDevice || 'LaserWriter') : 'ImageWriter';
    const driver = laser ? 'LaserWriter 1.0' : 'ImageWriter 1.0';

    const page = el('div', { class: 'testpage' });
    page.append(el('pre', { class: 'testpage-art', text: ART.join('\n') }));
    const lines = [
      ['Printer:', device],
      ['Driver:', driver],
      ['Connected via:', laser ? `AppleTalk · zone "${prefs.chooserZone}"` : `${prefs.printerPort} port`],
      ['Date:', fmtDate(Date.now())],
      ['Resolution:', laser ? '300 dpi, PostScript' : '72 dpi, dot matrix'],
    ];
    const table = el('div', { class: 'testpage-table' });
    for (const [k, v] of lines) {
      table.append(el('div', { class: 'testpage-k', text: k }), el('div', { class: 'testpage-v', text: v }));
    }
    page.append(table);
    page.append(el('p', { class: 'testpage-foot', text: 'If this page is legible, the printer and its cable are working.' }));
    win.body.append(page);
    win.setTitle(`Test Page — ${device}`);
    win.refreshMenus();
  },
};
