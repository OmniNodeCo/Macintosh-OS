/* ============================================================================
   Original 1-bit icon artwork for the Macintosh-OS web clone.

   Everything here is drawn from scratch with a tiny pixel-grid DSL: no Apple
   icon bitmaps, ROM resources or third-party art are copied.  The visual
   language (32x32 black & white icons with dither shading) is inspired by the
   work of Susan Kare for the original Macintosh — see CREDITS.md.
   ========================================================================== */

const T = 0;  // transparent
const K = 1;  // black ink
const W = 2;  // white paper

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

ICONS.floppy = () => {
  const b = new Bitmap(32);
  b.rect(3, 2, 26, 27, W);
  b.roundBox(3, 2, 26, 27, K);
  // metal shutter
  b.rect(17, 2, 10, 11, K);
  b.rect(18, 3, 8, 9, W);
  b.rect(23, 4, 2, 7, K);
  // write-protect notch
  b.rect(4, 4, 3, 3, K);
  // label
  b.rect(6, 16, 20, 10, W);
  b.box(6, 16, 20, 10, K);
  b.hline(8, 19, 16, K);
  b.hline(8, 21, 16, K);
  b.hline(8, 23, 11, K);
  return b;
};

ICONS.disk = ICONS.floppy;

ICONS.trash = () => {
  const b = new Bitmap(32);
  // lid + handle
  b.rect(7, 8, 18, 4, W); b.box(7, 8, 18, 4, K);
  b.rect(13, 4, 6, 4, W); b.box(13, 4, 6, 4, K);
  // body (trapezoid, wire basket)
  for (let y = 13; y <= 28; y++) {
    const t = (y - 13) / 15;
    const x0 = Math.round(9 - 3 * t), x1 = Math.round(22 + 3 * t);
    b.hline(x0, y, x1 - x0 + 1, W);
  }
  b.line(9, 13, 6, 28, K);
  b.line(22, 13, 25, 28, K);
  b.hline(6, 28, 20, K);
  b.hline(9, 13, 14, K);
  for (let x = 12; x <= 21; x += 3) b.line(x, 14, x - 2, 27, K);
  b.hline(7, 27, 18, K);
  return b;
};

ICONS.trashFull = () => {
  const b = ICONS.trash();
  b.art([
    '.####.',
    '######',
    '##.###',
    '.####.',
  ], 13, 2);
  return b;
};

ICONS.folder = () => {
  const b = new Bitmap(32);
  b.rect(3, 9, 26, 19, W);
  b.box(3, 9, 26, 19, K);
  b.rect(3, 5, 12, 5, W);
  b.box(3, 5, 12, 5, K);
  b.hline(4, 9, 11, W);
  b.dither(5, 11, 22, 1, K, 1);
  return b;
};

ICONS.folderOpen = () => {
  const b = ICONS.folder();
  b.rect(6, 13, 20, 12, W);
  b.box(6, 13, 20, 12, K);
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

ICONS.doc = () => pageIcon(4);
ICONS.docText = () => pageIcon(5);
ICONS.docPaint = () => pageIcon(2, (b) => {
  b.box(10, 17, 12, 8, K);
  b.dither(11, 18, 10, 6, K, 0);
});

ICONS.macwrite = () => pageIcon(3, (b) => {
  // a pen across the page
  b.line(23, 14, 14, 25, K);
  b.line(24, 14, 15, 25, K);
  b.set(14, 25, K); b.set(13, 26, K);
  b.rect(24, 12, 3, 3, K);
});

ICONS.macpaint = () => pageIcon(2, (b) => {
  b.box(10, 16, 12, 9, K);
  b.dither(11, 17, 10, 7, K, 0);
});

ICONS.calculator = () => {
  const b = new Bitmap(32);
  b.rect(5, 3, 22, 26, W);
  b.roundBox(5, 3, 22, 26, K);
  b.rect(8, 6, 16, 6, W); b.box(8, 6, 16, 6, K);
  b.rect(10, 8, 6, 2, K);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const x = 8 + c * 6, y = 15 + r * 4;
    b.rect(x, y, 4, 3, W); b.box(x, y, 4, 3, K);
  }
  return b;
};

ICONS.clock = () => {
  const b = new Bitmap(32);
  b.disc(16, 17, 13, W);
  b.circle(16, 17, 13, K);
  b.circle(16, 17, 12, K);
  for (const [x, y] of [[16, 5], [28, 17], [16, 29], [4, 17]]) b.rect(x - 1, y - (y === 17 ? 1 : 0) + (y === 17 ? 0 : 0), 2, 2, K);
  b.line(16, 17, 16, 9, K);
  b.line(16, 17, 22, 20, K);
  b.set(15, 16, K); b.set(17, 16, K);
  return b;
};

ICONS.controlpanel = () => {
  const b = new Bitmap(32);
  b.rect(3, 9, 26, 16, W);
  b.box(3, 9, 26, 16, K);
  b.vline(16, 10, 14, K);
  for (const cx of [9, 23]) {
    b.disc(cx, 17, 4, W);
    b.circle(cx, 17, 4, K);
    b.line(cx, 17, cx + 2, 14, K);
  }
  b.hline(5, 12, 5, K);
  b.hline(19, 12, 5, K);
  return b;
};

ICONS.keycaps = () => {
  const b = new Bitmap(32);
  b.rect(2, 9, 28, 15, W);
  b.box(2, 9, 28, 15, K);
  for (let c = 0; c < 6; c++) { b.rect(4 + c * 4, 11, 3, 3, W); b.box(4 + c * 4, 11, 3, 3, K); }
  for (let c = 0; c < 5; c++) { b.rect(5 + c * 4, 16, 3, 3, W); b.box(5 + c * 4, 16, 3, 3, K); }
  b.hline(4, 21, 24, K);
  b.rect(12, 19, 8, 3, W); b.box(12, 19, 8, 3, K);
  return b;
};

ICONS.puzzle = () => {
  const b = new Bitmap(32);
  b.rect(4, 5, 24, 24, W);
  b.box(4, 5, 24, 24, K);
  for (let i = 1; i < 4; i++) { b.vline(4 + i * 6, 5, 24, K); b.hline(4, 5 + i * 6, 24, K); }
  b.dither(5, 6, 5, 5, K, 1);
  b.dither(17, 18, 5, 5, K, 0);
  b.rect(23, 6, 5, 5, W);
  b.dither(11, 24, 5, 5, K, 0);
  return b;
};

ICONS.notepad = () => {
  const b = new Bitmap(32);
  b.rect(8, 3, 18, 26, W);
  b.box(8, 3, 18, 26, K);
  for (let y = 7; y <= 25; y += 4) {
    b.disc(5, y, 2, W);
    b.circle(5, y, 2, K);
    b.hline(7, y, 3, K);
  }
  for (let y = 7; y <= 26; y += 3) b.hline(11, y, 12, K);
  return b;
};

ICONS.scrapbook = () => {
  const b = new Bitmap(32);
  b.rect(3, 9, 12, 17, W); b.box(3, 9, 12, 17, K);
  b.rect(16, 9, 13, 17, W); b.box(16, 9, 13, 17, K);
  b.vline(15, 10, 16, K);
  b.hline(17, 12, 11, K);
  b.box(18, 14, 9, 8, K);
  b.dither(19, 15, 7, 6, K, 1);
  b.hline(5, 12, 8, K);
  b.hline(5, 14, 6, K);
  return b;
};

ICONS.launcher = () => {
  const b = new Bitmap(32);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
    const x = 2 + c * 15, y = 2 + r * 15;
    b.rect(x, y, 13, 13, W);
    b.box(x, y, 13, 13, K);
    if ((r + c) % 2 === 0) b.dither(x + 1, y + 1, 11, 11, K, r);
  }
  return b;
};

ICONS.credits = () => pageIcon(3, (b) => {
  b.disc(20, 22, 4, W);
  b.circle(20, 22, 4, K);
  b.rect(19, 18, 3, 3, K);
});

ICONS.systemfolder = () => {
  const b = ICONS.folder();
  b.rect(10, 14, 12, 10, W);
  b.box(10, 14, 12, 10, K);
  b.set(13, 17, K); b.set(18, 17, K);
  b.hline(13, 21, 6, K);
  b.set(12, 21, K); b.set(19, 21, K);
  return b;
};

ICONS.app = () => pageIcon(2, (b) => {
  b.box(11, 17, 10, 8, K);
  b.line(11, 24, 20, 17, K);
});

ICONS.locked = () => {
  const b = new Bitmap(32);
  // shackle
  b.vline(11, 9, 6, K);
  b.vline(20, 9, 6, K);
  b.hline(12, 8, 8, K);
  b.set(11, 9, K); b.set(20, 9, K);
  // body
  b.rect(8, 14, 16, 13, W);
  b.box(8, 14, 16, 13, K);
  b.rect(15, 18, 2, 5, K);
  b.set(14, 23, K); b.set(17, 23, K);
  return b;
};

ICONS.trashEmpty = () => ICONS.trash();

/* --- small 16x16 system glyphs ------------------------------------------- */

ICONS.apple = () => {
  const b = new Bitmap(16);
  // leaf and stem
  b.art([
    '..##..',
    '.####.',
    '..##..',
  ], 5, 1);
  b.vline(7, 4, 2, K);
  // body: a slightly heart-shaped blob
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const ex = (x - 7.4) / 5.9, ey = (y - 10.1) / 5.2;
      if (ex * ex + ey * ey <= 1) b.set(x, y, K);
    }
  }
  b.set(3, 12, K); b.set(11, 12, K);
  // the dimple between the two lobes
  b.erase(6, 5, 3, 2);
  // the bite
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const ex = (x - 13.9) / 3.5, ey = (y - 9.6) / 3.0;
      if (ex * ex + ey * ey <= 1) b.set(x, y, T);
    }
  }
  return b;
};

ICONS.caution = () => {
  const b = new Bitmap(32);
  // triangle outline
  b.line(16, 4, 30, 29, K);
  b.line(16, 4, 2, 29, K);
  b.hline(2, 29, 29, K);
  // exclamation mark
  b.rect(15, 12, 2, 9, K);
  b.rect(15, 23, 2, 2, K);
  return b;
};

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
      const r = v === K ? 0 : 255, g = r, bl = r;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const o = (((y * scale + sy) * n * scale) + (x * scale + sx)) * 4;
          img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = bl; img.data[o + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

/* Official Apple icon artwork of this system's era — see CREDITS.md.
   Any name listed here is served from the museum's icon archive; anything
   else falls back to the museum's own drawn icons below. */
const OFFICIAL = {
  "floppy": "../../assets/icons/system-1.0/floppy.png",
  "disk": "../../assets/icons/system-1.0/floppy.png",
  "floppy400": "../../assets/icons/system-1.0/floppy.png",
  "harddisk": "../../assets/icons/system-1.0/harddisk.png",
  "cd": "../../assets/icons/system-1.0/cd.png",
  "trash": "../../assets/icons/system-1.0/trash.png",
  "trashFull": "../../assets/icons/system-1.0/trashFull.png",
  "trashEmpty": "../../assets/icons/system-1.0/trash.png",
  "folder": "../../assets/icons/system-1.0/folder.png",
  "folderOpen": "../../assets/icons/system-1.0/folderOpen.png",
  "systemfolder": "../../assets/icons/system-1.0/systemfolder.png",
  "doc": "../../assets/icons/system-1.0/doc.png",
  "docText": "../../assets/icons/system-1.0/docText.png",
  "docPaint": "../../assets/icons/system-1.0/docPaint.png",
  "draw": "../../assets/icons/system-1.0/docPaint.png",
  "app": "../../assets/icons/system-1.0/app.png",
  "extension": "../../assets/icons/system-1.0/extension.png",
  "locked": "../../assets/icons/system-1.0/extension.png",
  "macwrite": "../../assets/icons/system-1.0/macwrite.png",
  "macpaint": "../../assets/icons/system-1.0/macpaint.png",
  "clock": "../../assets/icons/system-1.0/clock.png",
  "keycaps": "../../assets/icons/system-1.0/keycaps.png",
  "notepad": "../../assets/icons/system-1.0/notepad.png",
  "note": "../../assets/icons/system-1.0/notepad.png",
  "scrapbook": "../../assets/icons/system-1.0/scrapbook.png",
  "controlpanel": "../../assets/icons/system-1.0/controlpanel.png",
  "printer": "../../assets/icons/system-1.0/printer.png",
  "caution": "../../assets/icons/system-1.0/caution.png",
  "cdevMemory": "../../assets/icons/system-1.0/cdevMemory.png",
  "cdevKeyboard": "../../assets/icons/system-1.0/cdevKeyboard.png",
  "cdevSound": "../../assets/icons/system-1.0/cdevSound.png",
  "happyMac": "../../assets/icons/system-1.0/happyMac.png",
};

const cache = new Map();
export function iconURL(name) {
  if (OFFICIAL[name]) return OFFICIAL[name];
  if (cache.has(name)) return cache.get(name);
  const factory = ICONS[name] || ICONS.doc;
  const url = renderBitmap(factory(), 1).toDataURL('image/png');
  cache.set(name, url);
  return url;
}

export function iconImg(name, cls = '') {
  const img = document.createElement('img');
  img.src = iconURL(name);
  img.alt = '';
  img.draggable = false;
  if (cls) img.className = cls;
  return img;
}

/** big canvas for the start-up screen (happy Mac) */
export function drawHappyMac(canvas, scale = 1) {
  if (OFFICIAL.happyMac) {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const s2 = Math.max(1, Math.floor(Math.min(canvas.width, canvas.height) / 32));
      const w = 32 * s2, h = 32 * s2;
      ctx.drawImage(img, Math.round((canvas.width - w) / 2), Math.round((canvas.height - h) / 2), w, h);
    };
    img.src = OFFICIAL.happyMac;
    return;
  }
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
