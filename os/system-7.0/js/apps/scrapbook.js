/* Scrapbook — a little gallery of 1-bit clippings. */

import { el } from '../core/ui.js';
import { iconURL } from '../core/icons.js';
import { patternStyle } from '../core/patterns.js';

const CLIPPINGS = [
  { name: 'Apple', icon: 'appleLarge', note: 'The classic six-colour apple, reduced to\none bit per pixel for the menu bar.' },
  { name: 'System Disk', icon: 'floppy', note: 'A 1.4 MB SuperDrive disk: 1.4 million bytes,\nwhich System 7.0 was the first to use.' },
  { name: 'Hard Disk', icon: 'harddisk', note: 'SCSI, 80 megabytes. HFS was written for\ndisks like this one.' },
  { name: 'Folder', icon: 'folder', note: 'Susan Kare’s folder: a tab, a body and\na dithered shadow.' },
  { name: 'Trash', icon: 'trash', note: 'A wire basket. Drag icons here to throw\nthem away.' },
  { name: 'MacWrite', icon: 'macwrite', note: 'Word processing with a ruler, tabs and\npinstripes.' },
  { name: 'MacPaint', icon: 'macpaint', note: 'One-bit painting with eight patterns.' },
  { name: 'Alarm Clock', icon: 'clock', note: 'A desk accessory that floats above\nyour documents.' },
  { name: 'Puzzle', icon: 'puzzle', note: 'Fifteen tiles, one blank space, and\nendless lunch breaks.' },
  { name: 'Happy Mac', icon: 'systemfolder', note: 'The start-up face: a Macintosh that is\nglad to see you.' },
];

export default {
  id: 'scrapbook',
  name: 'Scrapbook',
  icon: 'scrapbook',
  kind: 'Desk Accessory',
  w: 316,
  h: 224,
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
    const wrap = el('div', { class: 'scrapbook' });
    const list = el('div', { class: 'sb-list' });
    const view = el('div', { class: 'sb-view' });
    wrap.append(list, view);
    win.body.append(wrap);

    let current = 0;

    const show = (i) => {
      current = i;
      const clip = CLIPPINGS[i];
      list.querySelectorAll('.sb-item').forEach((n, idx) => n.classList.toggle('sel', idx === i));
      view.innerHTML = '';
      const img = el('img', { src: iconURL(clip.icon), class: 'big', alt: '' });
      img.style.width = '64px';
      img.style.height = '64px';
      view.append(
        el('div', {},
          img,
          el('div', { text: clip.name }),
          el('div', { style: { marginTop: '6px', opacity: '.8', whiteSpace: 'pre-line' }, text: clip.note }),
        ),
      );
    };

    CLIPPINGS.forEach((clip, i) => {
      const row = el('div', { class: 'sb-item' + (i === 0 ? ' sel' : '') },
        el('img', { src: iconURL(clip.icon), alt: '' }),
        el('span', { text: clip.name }),
      );
      row.addEventListener('pointerdown', () => show(i));
      list.append(row);
    });

    // one extra clipping: the desktop patterns themselves
    const patRow = el('div', { class: 'sb-item' }, el('span', { text: 'Patterns' }));
    patRow.addEventListener('pointerdown', () => {
      current = -1;
      list.querySelectorAll('.sb-item').forEach((n) => n.classList.toggle('sel', n === patRow));
      view.innerHTML = '';
      const grid = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 48px)', gap: '6px' } });
      for (const id of ['white', 'gray25', 'gray50', 'gray75', 'linesH', 'linesV', 'diagL', 'bricks']) {
        const sw = el('div', { style: { width: '48px', height: '32px', border: '1px solid #000' } });
        Object.assign(sw.style, patternStyle(id));
        grid.append(sw);
      }
      view.append(grid, el('div', { style: { marginTop: '8px' }, text: 'Eight desktop patterns.' }));
    });
    list.append(patRow);

    show(0);
    win.refreshMenus();
  },
};
