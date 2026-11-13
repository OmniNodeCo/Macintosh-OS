/* ============================================================================
   Icon artwork for the Macintosh-OS web clone — Mac OS 8 colour edition.

   Everything here is drawn from scratch with a tiny pixel-grid DSL: no Apple
   icon bitmaps, ROM resources or third-party art are copied.  The visual
   language (32x32 black & white icons with dither shading) is inspired by the
   work of Susan Kare for the original Macintosh — see CREDITS.md.
   ========================================================================== */

const T = 0;  // transparent
const K = 1;  // black ink
const W = 2;  // white paper
/* Platinum palette (Mac OS 8 is colour: the icons echo the Platinum scheme —
   gold folders, steel disks, periwinkle highlights. Our own values.) */
const G = 3, g = 4, D = 5, Y = 6, Y2 = 7, B = 8, B2 = 9, R = 10, N = 11, V = 12, S = 13, s2 = 14;
const PLAT = ['transparent', '#262626', '#ffffff', '#d2d2d2', '#9a9a9a', '#5f5f5f',
  '#f2c14e', '#b98a24', '#6688bb', '#31456b', '#b23a3a', '#3f8f4f', '#7b6fc4', '#c7ccd4', '#8d99a8'];
const CM = {
  '.': 0, ' ': 0, 'T': 0, '#': 1, 'K': 1, 'o': 2, 'W': 2,
  'G': 3, 'g': 4, 'D': 5, 'Y': 6, 'y': 7, 'B': 8, 'b': 9, 'R': 10, 'N': 11, 'V': 12, 'S': 13, 's': 14,
};
function colorArt(rows) {
  const b = new Bitmap(32);
  b.art(rows, 0, 0, CM);
  b.palette = PLAT;
  return b;
}

export class Bitmap {
  constructor(n = 32) {
    this.n = n;
    this.px = new Uint8Array(n * n);
  }
  set(x, y, v = K) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.n || y >= this.n) return;
    this.px[y * this.n + x] = v;
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= this.n || y >= this.n) return 0;
    return this.px[y * this.n + x];
  }
  rect(x, y, w, h, v = K) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, v);
  }
  box(x, y, w, h, v = K) {
    for (let i = 0; i < w; i++) { this.set(x + i, y, v); this.set(x + i, y + h - 1, v); }
    for (let j = 0; j < h; j++) { this.set(x, y + j, v); this.set(x + w - 1, y + j, v); }
  }
  hline(x, y, w, v = K) { for (let i = 0; i < w; i++) this.set(x + i, y, v); }
  vline(x, y, h, v = K) { for (let j = 0; j < h; j++) this.set(x, y + j, v); }
  line(x0, y0, x1, y1, v = K) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    for (;;) {
      this.set(x0, y0, v);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }
  /** 50% checkerboard dither inside a rectangle */
  dither(x, y, w, h, v = K, phase = 0) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if ((x + i + y + j + phase) % 2 === 0) this.set(x + i, y + j, v);
    }
  }
  /** sparse dots (25% grey) */
  dots(x, y, w, h, v = K, step = 2) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if ((i % step === 0) && (j % step === 0)) this.set(x + i, y + j, v);
    }
  }
  circle(cx, cy, r, v = K) {
    let x = r, y = 0, err = 1 - r;
    while (x >= y) {
      for (const [a, b] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]) {
        this.set(cx + a, cy + b, v);
      }
      y++;
      if (err < 0) err += 2 * y + 1; else { x--; err += 2 * (y - x) + 1; }
    }
  }
  disc(cx, cy, r, v = K) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r + r * 0.4) this.set(cx + x, cy + y, v);
    }
  }
  roundBox(x, y, w, h, v = K) {
    this.box(x + 1, y, w - 2, h, v);
    this.box(x, y + 1, w, h - 2, v);
  }
  /** paint rows of ASCII art on top of the bitmap */
  art(rows, ox = 0, oy = 0, map = { '#': K, '.': T, ' ': T, 'o': W }) {
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch in map && map[ch] !== T) this.set(ox + i, oy + j, map[ch]);
      }
    });
  }
  erase(x, y, w, h) { this.rect(x, y, w, h, T); }
}

/* ------------------------------------------------------------------ icons -- */

const ICONS = {};

/* The disk icon as it stood in 1986: white face, outlined shutter, a label
   wide enough to read at 32 pixels.  System 3.0 mounts three kinds of volume,
   so the icon says which: a floppy, a 400K disk from an older machine, and a
   hard disk with its stack of platters. */
ICONS.floppy = () => colorArt([
  '................................',
  '................................',
  '......WWWWWWWWWWWWWWWWWWWW......',
  '......WsSSSSSSSSSSSSSSSSSW......',
  '......WsSSSSSSSSSSSSSSSSSW......',
  '......WsSSSSSSSSSSSSSSSSSW......',
  '......WsSSSSSSSSSSSSSSSSSW......',
  '......WsSSSSSSSSSSSSSSSSSW......',
  '......WsSSSSSSSSSSSSSSSSSW......',
  '......WsSSSSSSSSSSSSSSSSSW......',
  '......WsSSSSSSSSSSSSSSSSSW......',
  '......WSSSSSSSSSSSSSSSSSSW......',
  '......WWWWWWWWWWWWWWWWWWWW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WssssssssssssssssssW......',
  '......WWWWWWWWWWWWWWWWWWWW......',
  '................................',
]);

ICONS.disk = ICONS.floppy;
/* The Power Macintosh 8600's 12x CD-ROM. */
ICONS.cd = () => {
  const b = new Bitmap(32);
  b.disc(16, 16, 15, G);
  b.disc(16, 16, 13, s2);
  b.disc(16, 16, 11, G);
  b.disc(16, 16, 5, W);
  b.disc(16, 16, 3, K);
  b.disc(16, 16, 2, T);
  b.set(8, 8, W); b.set(9, 7, W); b.set(10, 6, W);
  b.palette = PLAT;
  return b;
};

/* a 400K single-sided disk from a 512K Macintosh: same face, one write-protect
   notch, and a corner cut so it reads differently from an 800K disk */
ICONS.floppy400 = () => {
  const b = ICONS.floppy();
  // a dithered band across the label says "older, smaller media"
  b.dither(7, 22, 18, 3, K, 1);
  return b;
};

/* a 20 MB hard disk: two platters in a case, with a SCSI connector */
ICONS.harddisk = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '.....KKKKKKKKKKKKKKKKKKKKKK.....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KGbbbbbbbbbbbbbbbbbGGGGK....',
  '....KGbbbbbbbbbbbbbbbbbGGGGK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KGggggggggggggggggggggGK....',
  '....KGgKgKgKgKgKgKgKgKgKggGK....',
  '....KGgKgKgKgKgKgKgKgKgKggGK....',
  '....KGggggggggggggggggggggGK....',
  '....KGggggggggggggggggggggGK....',
  '....KGgggggggNNgggggggggggGK....',
  '....KGggggggggggggggggggggGK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '.....KKKKKKKKKKKKKKKKKKKKKK.....',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

/* MacDraw — the structured drawing program that arrived with the Plus era.
   A page, a square and a circle: the three things you could drag around. */
ICONS.draw = () => pageIcon(3, (b) => {
  b.box(7, 11, 9, 9, K);
  b.circle(21, 15, 5, K);
  b.line(5, 25, 27, 25, K);
});

/* ImageWriter — the printer you chose in Choose Printer. */
ICONS.printer = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '..........KKKKKKKKKKKK..........',
  '..........KWWWWWWWWWWK..........',
  '..........KWggggggggWK..........',
  '..........KWggggggggWK..........',
  '..........KWWWWWWWWWWK..........',
  '..........KKKKKKKKKKKK..........',
  '...........KDDDDDDDDK...........',
  '.......KKKKKKKKKKKKKKKKKKK......',
  '......KGGGGGGGGGGGGGGGGGGGK.....',
  '......KGGGGGGGGGGGGGGGGGGGK.....',
  '......KGGGGGGGGGGGGGGGGGGGK.....',
  '......KGGGGGGGGGGGGGGGGGGGK.....',
  '......KKKKKKKKKKKKKKKKKKKKK.....',
  '......KGGGGGGGGGGGGGGGGGGGGK....',
  '......KGGGGNNNNNNNNNGGGGGGGK....',
  '......KGGGGGGGGGGGGGGGGGGGGK....',
  '......KKKKKKKKKKKKKKKKKKKKKK....',
  '..........KWWWWWWWWWWK..........',
  '..........KWggggggggWK..........',
  '..........KWggggggggWK..........',
  '..........KWggggggggWK..........',
  '..........KWWWWWWWWWWK..........',
  '..........KKKKKKKKKKKK..........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

ICONS.trash = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '..........KKKKKKKKKKKK..........',
  '..........KWWWWWWWWWWK..........',
  '........KKKKKKKKKKKKKKKK........',
  '.......KDDDDDDDDDDDDDDDDK.......',
  '.......KDDDDDDDDDDDDDDDDK.......',
  '........KDDDDDDDDDDDDDDK........',
  '........KDDDDDDDDDDDDDDK........',
  '........KDDDDDDDDDDDDDDK........',
  '........KDDDDDDDDDDDDDDK........',
  '........KDDDDDDDDDDDDDDK........',
  '........KDDDDDDDDDDDDDDK........',
  '........KDDDDDDDDDDDDDDK........',
  '........KDDDDDDDDDDDDDDK........',
  '........KDDDDDDDDDDDDDDK........',
  '........KDDDDDDDDDDDDDDK........',
  '........KDDDDDDDDDDDDDDK........',
  '........KDDDDDDDDDDDDDDK........',
  '........KDDDDDDDDDDDDDDK........',
  '........KDDDDDDDDDDDDDDK........',
  '.........KDDDDDDDDDDDDK.........',
  '.........KDDDDDDDDDDDDK.........',
  '.........KDDDDDDDDDDDDK.........',
  '.........KDDDDDDDDDDDDK.........',
  '..........KKKKKKKKKKKK..........',
  '................................',
  '................................',
]);

ICONS.trashFull = () => {
  const b = ICONS.trash();
  b.art([
    '....KKK....',
    '...KWWWK...',
    '...KWWWKK..',
    '...KKKKKKK.',
  ], 10, 3, CM);
  return b;
};

ICONS.folder = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '.....KKKKKKKKKKK...............',
  '.....KyyyyyyyyyKKKKKKKKKKK.....',
  '.....KYYYYYYYYYYYYYYYYYYYK.....',
  '.....KYYYYYYYYYYYYYYYYYYYK.....',
  '.....KKKKKKKKKKKKKKKKKKKKK.....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KYYYYYYYYYYYYYYYYYYYYK....',
  '.....KKKKKKKKKKKKKKKKKKKKKK....',
  '................................',
  '................................',
]);

ICONS.folderOpen = () => {
  const b = ICONS.folder();
  b.art([
    '.....................',
    '.....................',
    '.....................',
    '.....................',
    '.....................',
    '.....................',
    '.....KKKKKKKKKKKKK...',
    '.....KWWWWWWWWWWWWK..',
    '.....KWWWWWWWWWWWWWK.',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KWWWWWWWWWWWWWWK',
    '.....KKKKKKKKKKKKKKKK',
  ], 5, 1, CM);
  return b;
};

function pageIcon(lines = 4, extra = null) {
  const b = new Bitmap(32);
  b.rect(7, 3, 18, 26, W);
  b.hline(7, 3, 12, K);
  b.line(19, 3, 25, 9, K);
  b.line(19, 3, 19, 9, K);
  b.hline(19, 9, 7, K);
  b.vline(7, 3, 26, K);
  b.vline(25, 9, 20, K);
  b.hline(7, 28, 19, K);
  for (let i = 0; i < lines; i++) b.hline(10, 13 + i * 3, i === lines - 1 ? 8 : 12, K);
  if (extra) extra(b);
  return b;
}

ICONS.doc = () => colorArt([
  '................................',
  '................................',
  '........KKKKKKKKKKKKK...........',
  '........KWWWWWWWWWWWKK..........',
  '........KWWWWWWWWWWWWKK.........',
  '........KWWWWWWWWWWWWWKK........',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWggggggggggggggK.......',
  '........KWggggggggggggggK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWggggggggggggggK.......',
  '........KWggggggggggggggK.......',
  '........KWggggggggggggggK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWggggggggggggggK.......',
  '........KWggggggggggggggK.......',
  '........KWggggggggggggggK.......',
  '........KWggggggggggggggK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWggggggggggggggK.......',
  '........KWggggggggggggggK.......',
  '........KWggggggggggggggK.......',
  '........KWggggggggggggggK.......',
  '........KWggggggggggggggK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KKKKKKKKKKKKKKKKK.......',
  '................................',
  '................................',
]);
ICONS.docText = () => ICONS.doc();
ICONS.docPaint = () => {
  const b = ICONS.doc();
  b.art([
    '.BBBB.',
    '.BNNB.',
    '.BNVB.',
    '.BVBG.',
    '.BBGG.',
    '.GGGG.',
    '.GRRG.',
    '.RRGG.',
    '.GYYG.',
    '.YYGG.',
    '.GGGG.',
  ], 12, 11, CM);
  return b;
};

ICONS.macwrite = () => ICONS.docText();

ICONS.macpaint = () => ICONS.docPaint();

ICONS.calculator = () => colorArt([
  '................................',
  '................................',
  '..........KKKKKKKKKKKK..........',
  '..........KWWWWWWWWWWK..........',
  '..........KWBBBBBBBBWK..........',
  '..........KWBBBBBBBBWK..........',
  '..........KWWWWWWWWWWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWWWWWWWWWWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWWWWWWWWWWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWWWWWWWWWWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWWWWWWWWWWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KWKKKKKKKKWK..........',
  '..........KKKKKKKKKKKK..........',
  '................................',
  '................................',
]);

ICONS.clock = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '...........KKKKKKKKKK...........',
  '.........KKWWWWWWWWWWKK.........',
  '........KWWWWWWWWWWWWWWK........',
  '.......KWWWWWWWWWWWWWWWWK.......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '.....KWWWWWWWWWWWWWWWWWWWWK.....',
  '.....KWWWWWWWWWWWWWWWWWWWWK.....',
  '....KWWWWWWWWWWWWWWWWWWWWWWK....',
  '....KWWWWWWWWKKKKWWWWWWWWWWK....',
  '....KWWWWWWWWWKKWWWWWWWWWWWK....',
  '....KWWWWWWWWWKKWWWWWWWWWWWK....',
  '....KWWWWWWWWWKKWWWWWWWWWWWK....',
  '....KWWWWWWWWWKKKKKKWWWWWWWK....',
  '....KWWWWWWWWWWWWWWWWWWWWWWK....',
  '....KWWWWWWWWWWWWWWWWWWWWWWK....',
  '.....KWWWWWWWWWWWWWWWWWWWWK.....',
  '.....KWWWWWWWWWWWWWWWWWWWWK.....',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '.......KWWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWK........',
  '.........KKWWWWWWWWWWKK.........',
  '...........KKKKKKKKKK...........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

ICONS.controlpanel = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '...KKKWWWWWWWWWWWWWWWWWWWWKKK...',
  '..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..',
  '..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..',
  '..KWKWWWWWWWWWWWWWWWWWWWWWWKWK..',
  '..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..',
  '..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..',
  '..KWKWWWWWWWWWWWWWWWWWWWWWWKWK..',
  '..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..',
  '..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..',
  '..KWKWWWWWWWWWWWWWWWWWWWWWWKWK..',
  '..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..',
  '..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..',
  '..KKKKKKKKKKKKKKKKKKKKKKKKKKKK..',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

ICONS.keycaps = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWKWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '....KKWWWWWWWWWWWWWWWWWWWWKK....',
  '....KWWWWWWWWWWWWWWWWWWWWWWK....',
  '....KWWWWWWWWWWWWWWWWWWWWWWK....',
  '....KWWKKKKKKKKKKKKKKKKKWWWK....',
  '....KWWWWWWWWWWWWWWWWWWWWWWK....',
  '....KWWWWWWWWWWWWWWWWWWWWWWK....',
  '....KKKKKKKKKKKKKKKKKKKKKKKK....',
  '..KKWWWWWWWWWWWWWWWWWWWWWWWWKK..',
  '..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..',
  '..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..',
  '..KWWKKKKKKKKKKKKKKKKKKKKKWWWK..',
  '..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..',
  '..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..',
  '..KKKKKKKKKKKKKKKKKKKKKKKKKKKK..',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

ICONS.puzzle = () => colorArt([
  '................................',
  '................................',
  '................................',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGKKKKKGGGGGGGK......',
  '......KGGGGGGKGGGGGKGGGGGK......',
  '......KGGGGGGKGGGGGKGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KKKKKKGGGGGGGKKKKKKK......',
  '......KKKKKKGKKKKKGKKKKKKK......',
  '......KKKKKKGGGGGGGKKKKKKK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGGGGGGGGGGGGGK......',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '................................',
  '................................',
]);

ICONS.notepad = () => colorArt([
  '................................',
  '................................',
  '........KKKKKKKKKKKKKK..........',
  '........KWWWWWWWWWWWWKK.........',
  '........KWWWWWWWWWWWWWKK........',
  '........KWKKKKKKKKKKKKKK........',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KKKKKKKKKKKKKKKKK.......',
  '................................',
  '................................',
]);

ICONS.scrapbook = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '..........KKKKKKKKKKKK..........',
  '..........KWWWWWWWWWWK..........',
  '..........KWWWWWWWWWWK..........',
  '..........KWWWWWWWWWWK..........',
  '.......KKKKKKKKKKKKKKKKKK.......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWBBBBBBBBBBBBBBWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWBBBBBBBBBBBBBBWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWBBBBBBBBBBBBBBWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWBBBBBBBBBBBBBBWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWBBBBBBBBBBBBBBWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWBBBBBBBBBBBBBBWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

/* MiniFinder — System 2.0's memory-saver. Retired in 3.0, but the art stays
   so a 2.0 disk opened here still shows the right icon. */
ICONS.minifinder = () => ICONS.launcher();

ICONS.launcher = () => colorArt([
  '................................',
  '................................',
  '................................',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWYYWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWYYWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWYYWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWYYWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWYYWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWYYWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWYYWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWYYWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWYYWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWYYWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWYYWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '................................',
  '................................',
]);

ICONS.credits = () => colorArt([
  '................................',
  '................................',
  '........KKKKKKKKKKKKKK..........',
  '........KWWWWWWWWWWWWKK.........',
  '........KWWWWWWWWWWWWWKK........',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWKKKKKKKKKKKKKKK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KKKKKKKKKKKKKKKKK.......',
  '................................',
  '................................',
]);

ICONS.systemfolder = () => {
  const b = ICONS.folder();
  b.art([
    '...KKK..',
    '..KWWWK.',
    '..KWWWK.',
    '..KWKKK.',
    '..KWWWK.',
    '..KKKKK.',
  ], 11, 13, CM);
  return b;
};

ICONS.app = () => colorArt([
  '................................',
  '................................',
  '........KKKKKKKKKKKKKK..........',
  '........KWWWWWWWWWWWWKK.........',
  '........KWWWWWWWWWWWWWKK........',
  '........KWBBBBBBBBBBBBWK........',
  '........KWBBBBBBBBBBBBWK........',
  '........KWBBBBBBBBBBBBWK........',
  '........KWBBBBBBBBBBBBWK........',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWWK.......',
  '........KKKKKKKKKKKKKKKKK.......',
  '................................',
  '................................',
]);

ICONS.locked = () => {
  const b = ICONS.doc();
  b.art([
    '..KK..',
    '.K..K.',
    '.K..K.',
    'KKKKKK',
    'KDDDDK',
    'KDDDDK',
    'KKKKKK',
  ], 18, 20, CM);
  return b;
};

ICONS.trashEmpty = () => ICONS.trash();

/* --- small 16x16 system glyphs ------------------------------------------- */

ICONS.apple = () => colorArt([
  '................................',
  '................................',
  '................................',
  '.....BBB.......NNN..............',
  '....BBBBB.....NNNNN.............',
  '...BBBBBBB...NNNNNNN............',
  '...BBBBBBBB.NNNNNNNNN...........',
  '..BBBBBBBBBBBBBBBBBBB...........',
  '..BBBBBBBBBBBBBBBBBBBB..........',
  '..BBBBBBBBBBBBBBBBBBBB..........',
  '..BBBBBBBBBBBBBBBBBBBB..........',
  '..BBBBBBBBBBBBBBBBBBB...........',
  '..BBBBBBBBBBBBBBBBBB............',
  '..BBBBBBBBBBBBBBBBBB............',
  '...BBBBBBBBBBBBBBBB.............',
  '...BBBBBBBBBBBBBBB..............',
  '....BBBBBBBBBBBBB...............',
  '.....BBBBBBBBBB.................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

/* ------------------------------------------------- System 7.0 additions -- */

ICONS.multifinder = () => {
  const b = new Bitmap(32);
  // window behind
  b.box(2, 5, 18, 14);
  b.hline(3, 6, 16, K); b.hline(3, 7, 16, K);
  // window in front
  b.box(9, 12, 21, 15);
  b.rect(10, 13, 19, 2, K);
  b.hline(11, 16, 15, K); b.hline(11, 18, 15, K); b.hline(11, 20, 11, K);
  return b;
};

ICONS.macromaker = () => {
  const b = new Bitmap(32);
  // recorder body
  b.box(2, 11, 28, 16);
  // two reels
  b.circle(10, 16, 4);
  b.circle(22, 16, 4);
  b.set(10, 16); b.set(22, 16);
  b.dither(9, 15, 3, 3, K, 1);
  b.dither(21, 15, 3, 3, K, 1);
  // tape between the reels
  b.hline(14, 14, 4);
  b.hline(14, 18, 4);
  // transport buttons
  b.rect(6, 23, 3, 2, K);
  b.rect(11, 23, 3, 2, K);
  b.rect(16, 23, 3, 2, K);
  b.rect(21, 23, 3, 2, K);
  return b;
};

ICONS.cdevKeyboard = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '................................',
  '....KKKKKKKKKKKKKKKKKKKKKKKK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KGKKKKKKKKKKKKKKKKKKKGgK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KGKKKKKKKKKKKKKKKKKKKGgK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KGKKKKKKKKKKKKKKKKKKKGgK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KGKKKKKKKKKKKKKKKKKKKKgK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KKKKKKKKKKKKKKKKKKKKKKKK....',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

ICONS.cdevMouse = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '................................',
  '...........KKKKKKKKKK...........',
  '.........KKGGGGGGGGGGKK.........',
  '........KGGGGGGGGGGGGGGK........',
  '.......KGGGGGGGGGGGGGGGGGK......',
  '......KGGGGGGKKKKGGGGGGGGGK.....',
  '......KGGGGGGKGGKGGGGGGGGGK.....',
  '......KGGGGGGKGGKGGGGGGGGGK.....',
  '......KGGGGGGKGGKGGGGGGGGGK.....',
  '......KGGGGGGGGGGGGGGGGGGGGK....',
  '......KGGGGGGGGGGGGGGGGGGGGK....',
  '.......KGGGGGGGGGGGGGGGGGK......',
  '........KGGGGGGGGGGGGGGK........',
  '.........KKGGGGGGGGGGKK.........',
  '...........KKKKKKKKKK...........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

ICONS.cdevSound = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '................................',
  '..............KKKKK.............',
  '..............KGGGK.............',
  '...........KKKKGGGK.............',
  '...........KGGGGGGK.............',
  '...........KGGGGGGKKKKK.........',
  '...........KGGGGGGGGGGK.........',
  '...........KGGGGGGGGGGK.........',
  '...........KGGGGGGGGGGK.........',
  '...........KGGGGGGGGGGK.........',
  '...........KGGGGGGGGGGK.........',
  '...........KGGGGGGGGGGK.........',
  '...........KGGGGGGGGGGK.........',
  '...........KGGGGGGGGGGK.........',
  '...........KGGGGGGGGGGK.........',
  '............KKKKKKKKK...........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

ICONS.cdevMemory = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '................................',
  '....KKKKKKKKKKKKKKKKKKKKKKKK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KGKKKKKKKKKKKKKKKKKKKGgK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KGKKKKKKKKKKKKKKKKKKKGgK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KGKKKKKKKKKKKKKKKKKKKGgK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KGKKKKKKKKKKKKKKKKKKKGgK....',
  '....KGGGGGGGGGGGGGGGGGGGGGGK....',
  '....KKKKKKKKKKKKKKKKKKKKKKKK....',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

ICONS.cdevStartup = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KKKKKKKKKKKKKKKKKKKK......',
  '................................',
  '...........KKKKKKKKKK...........',
  '.........KKWWWWWWWWWWKK.........',
  '........KWWWWWWWWWWWWWWK........',
  '.......KWWWWWWWWWWWWWWWWK.......',
  '......KWWWWWWWWWWWWWWWWWWK......',
  '......KWWWWWWKKKKKKWWWWWWK......',
  '......KWWWWWWWKKKKWWWWWWWK......',
  '......KWWWWWWWKKWWWWWWWWWK......',
  '......KWWWWWWWKKKKKKWWWWWK......',
  '......KWWWWWWWWWWWWWWWWWWWK.....',
  '.......KWWWWWWWWWWWWWWWWK.......',
  '........KWWWWWWWWWWWWWWK........',
  '.........KKWWWWWWWWWWKK.........',
  '...........KKKKKKKKKK...........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

ICONS.aliasArrow = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '....................KKKKK.......',
  '....................KVVVK.......',
  '....................KVVVK.......',
  '.....KKKKKKKKKKKKKKKKVVVK.......',
  '.....KVVVVVVVVVVVVVVVVVVK.......',
  '.....KVVVVVVVVVVVVVVVVVVK.......',
  '.....KKKKKKKKKKKKKKKKVVVK.......',
  '....................KVVVK.......',
  '....................KVVVK.......',
  '....................KKKKK.......',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

ICONS.extension = () => {
  const b = ICONS.doc();
  b.art([
    '..NNN.',
    '.NNNNN',
    '.NNNNN',
    '..NNN.',
  ], 14, 22, CM);
  return b;
};

ICONS.caution = () => colorArt([
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................KK..............',
  '...............KKKK.............',
  '...............KKKK.............',
  '..............KKKKKK............',
  '..............KKKKKK............',
  '.............KKKRRKKK...........',
  '.............KKRRRRKK...........',
  '............KKKRRRRKKK..........',
  '............KKRRRRRRKK..........',
  '...........KKKRRRRRRKKK.........',
  '...........KKRRRRRRRRKK.........',
  '..........KKKKRRRRRRKKKK........',
  '..........KKRRRRRRRRRRKK........',
  '.........KKKKRRRRRRRRKKKK.......',
  '.........KKRRKKKKKKKKRRKK.......',
  '........KKKKKKKKKKKKKKKKKK......',
  '........KKRRRRRRRRRRRRRRKK......',
  '.......KKKRRRRRRRRRRRRRRKKK.....',
  '.......KKRRRRRRRRRRRRRRRRKK.....',
  '......KKKKKKKKKKKKKKKKKKKKKK....',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

ICONS.note = () => pageIcon(3);

ICONS.appleLarge = () => {
  const b = new Bitmap(32);
  // leaf
  b.art([
    '....###.',
    '...#####',
    '..######',
    '...#####',
    '....###.',
  ], 13, 2);
  b.line(15, 6, 13, 12, K);
  b.line(16, 6, 14, 12, K);
  // body
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const ex = (x - 14.6) / 11.4, ey = (y - 20.2) / 10.2;
      if (ex * ex + ey * ey <= 1) b.set(x, y, K);
    }
  }
  b.rect(6, 25, 20, 5, K);
  // dimple
  b.erase(12, 11, 5, 4);
  // bite
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const ex = (x - 27.2) / 6.6, ey = (y - 19.0) / 5.6;
      if (ex * ex + ey * ey <= 1) b.set(x, y, T);
    }
  }
  return b;
};

export function renderBitmap(bmp, scale = 1) {
  const n = bmp.n;
  const cv = document.createElement('canvas');
  cv.width = n * scale;
  cv.height = n * scale;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(n * scale, n * scale);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const v = bmp.px[y * n + x];
      if (!v) continue;
      let r = 0, gc = 0, bl = 0;
      if (bmp.palette) {
        const hex = bmp.palette[v] || '#000';
        if (hex === 'transparent') continue;
        r = parseInt(hex.slice(1, 3), 16); gc = parseInt(hex.slice(3, 5), 16); bl = parseInt(hex.slice(5, 7), 16);
      } else {
        r = v === K ? 0 : 255; gc = r; bl = r;
      }
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const o = (((y * scale + sy) * n * scale) + (x * scale + sx)) * 4;
          img.data[o] = r; img.data[o + 1] = gc; img.data[o + 2] = bl; img.data[o + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

const cache = new Map();
export function iconURL(name) {
  if (cache.has(name)) return cache.get(name);
  const factory = ICONS[name] || ICONS.doc;
  const url = renderBitmap(factory(), 1).toDataURL('image/png');
  cache.set(name, url);
  return url;
}

/* System 7 aliases: the icon of the original plus a small arrow badge. */
export function nodeIcon(node, cls = '') {
  if (node && node.kind === 'alias') {
    const wrap = document.createElement('span');
    wrap.className = 'iconwrap' + (cls ? ' ' + cls : '');
    wrap.append(iconImg(node.icon || 'doc', 'base'));
    wrap.append(iconImg('aliasArrow', 'badge'));
    return wrap;
  }
  return iconImg((node && node.icon) || 'doc', cls);
}

export function iconImg(name, cls = '') {
  const img = document.createElement('img');
  img.src = iconURL(name);
  img.alt = '';
  img.draggable = false;
  if (cls) img.className = cls;
  return img;
}

/** big canvas for the start-up screen (happy Mac) — kept monochrome like the ROM icon */
export function drawHappyMac(canvas, scale = 1) {
  const b = new Bitmap(64);
  // case
  b.rect(6, 2, 52, 52, W);
  b.roundBox(6, 2, 52, 54, K);
  b.roundBox(7, 3, 50, 52, K);
  // screen
  b.rect(12, 8, 40, 27, W);
  b.box(11, 7, 42, 29, K);
  b.dither(12, 8, 40, 27, 0, 0);
  b.rect(13, 9, 38, 25, W);
  // eyes
  b.rect(20, 15, 4, 7, K);
  b.rect(40, 15, 4, 7, K);
  // smile
  b.line(20, 26, 24, 30, K);
  b.line(24, 30, 39, 30, K);
  b.line(39, 30, 43, 26, K);
  b.hline(21, 27, 3, K);
  b.hline(40, 27, 3, K);
  // floppy slot + vent
  b.rect(13, 42, 22, 3, K);
  for (let x = 38; x <= 50; x += 3) b.vline(x, 42, 3, K);
  // base
  b.rect(2, 54, 60, 5, W);
  b.box(2, 54, 60, 5, K);
  b.hline(6, 56, 52, K);
  const img = renderBitmap(b, 1);
  canvas.width = 64 * scale; canvas.height = 64 * scale;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

/* ------------------------------------------------------- MacPaint tools -- */

const tools = {};

tools.pencil = () => {
  const b = new Bitmap(16);
  b.line(3, 12, 11, 4, K);
  b.line(4, 12, 12, 4, K);
  b.rect(2, 11, 3, 3, K);
  b.line(11, 3, 13, 2, K);
  b.line(12, 4, 13, 3, K);
  return b;
};

tools.eraser = () => {
  const b = new Bitmap(16);
  b.rect(4, 5, 8, 7, W);
  b.box(4, 5, 8, 7, K);
  b.line(4, 11, 11, 11, K);
  b.dither(5, 6, 6, 3, K, 0);
  return b;
};

tools.line = () => {
  const b = new Bitmap(16);
  b.line(3, 12, 12, 3, K);
  return b;
};

tools.rect = () => {
  const b = new Bitmap(16);
  b.box(3, 4, 10, 8, K);
  return b;
};

tools.oval = () => {
  const b = new Bitmap(16);
  const cx = 8, cy = 8, rx = 5, ry = 4;
  for (let a = 0; a < 360; a += 3) {
    const r = (a * Math.PI) / 180;
    b.set(cx + rx * Math.cos(r), cy + ry * Math.sin(r), K);
  }
  return b;
};

tools.bucket = () => {
  const b = new Bitmap(16);
  b.line(4, 6, 9, 2, K);
  b.line(4, 6, 11, 10, K);
  b.line(9, 2, 13, 6, K);
  b.line(13, 6, 6, 11, K);
  b.rect(12, 10, 3, 4, K);
  b.dither(6, 7, 4, 3, K, 0);
  return b;
};

tools.spray = () => {
  const b = new Bitmap(16);
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.random() * 5;
    b.set(8 + Math.cos(a) * r, 8 + Math.sin(a) * r, K);
  }
  b.rect(9, 12, 2, 3, K);
  return b;
};

tools.text = () => {
  const b = new Bitmap(16);
  b.hline(4, 4, 8, K);
  b.vline(8, 4, 9, K);
  b.hline(5, 12, 6, K);
  return b;
};

tools.spray = tools.spray;

export function toolURL(name) {
  const key = 'tool:' + name;
  if (cache.has(key)) return cache.get(key);
  const f = tools[name] || tools.pencil;
  const url = renderBitmap(f(), 1).toDataURL('image/png');
  cache.set(key, url);
  return url;
}

/** the classic 1-bit arrow pointer */
export function pointerArt() {
  return [
    'X...........',
    'XX..........',
    'X.X.........',
    'X..X........',
    'X...X.......',
    'X....X......',
    'X.....X.....',
    'X......X....',
    'X.......X...',
    'X....XXXX...',
    'X..X.X......',
    'X.X..X......',
    'XX...X......',
    'X.....X.....',
    '......X.....',
    '......X.....',
    '...........',
  ];
}

export { ICONS as ICON_FACTORIES, tools as TOOL_FACTORIES };

/** The classic Macintosh arrow pointer, as a CSS cursor image. */
export function pointerCursorURL() {
  const rows = pointerArt();
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const ink = (x, y) => y >= 0 && y < h && x >= 0 && x < (rows[y] || '').length && rows[y][x] === 'X';
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(w, h);
  const put = (x, y, r, g, b, a) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const o = (y * w + x) * 4;
    img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = a;
  };
  // white halo
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!ink(x, y)) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!ink(x + dx, y + dy)) put(x + dx, y + dy, 255, 255, 255, 255);
    }
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (ink(x, y)) put(x, y, 0, 0, 0, 255);
  }
  ctx.putImageData(img, 0, 0);
  return cv.toDataURL('image/png');
}
