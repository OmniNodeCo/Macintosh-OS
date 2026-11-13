/* Icons for the Mac OS X 10.0 clone.
   Official icon art of the Aqua era is sliced from published Mac OS X 10.0
   screenshots (the exact pixels the real system drew) plus the wire-mesh
   Trash extracted from the system; see CREDITS.md. A handful of icons are
   drawn here in code (folder, document, generic application, Terminal,
   iTunes, the Apple logo) and are credited as museum drawings. */

const OFFICIAL = {
  finder: '../../assets/icons/mac-os-x/finder.png',
  mail: '../../assets/icons/mac-os-x/mail.png',
  sherlock: '../../assets/icons/mac-os-x/sherlock.png',
  quicktime: '../../assets/icons/mac-os-x/quicktime.png',
  textdoc: '../../assets/icons/mac-os-x/textdoc.png',
  textedit: '../../assets/icons/mac-os-x/textedit.png',
  harddisk: '../../assets/icons/mac-os-x/harddisk.png',
  extdisk: '../../assets/icons/mac-os-x/extdisk.png',
  network: '../../assets/icons/mac-os-x/network.png',
  photos: '../../assets/icons/mac-os-x/photos.png',
  airport: '../../assets/icons/mac-os-x/airport.png',
  trash: '../../assets/icons/mac-os-x/trash.png',
};

export function iconURL(name) {
  return OFFICIAL[name] || null;
}

/* ---- drawn icons (canvas) ---- */

function c2d(canvas) {
  const ctx = canvas.getContext('2d');
  const S = canvas.width;
  const u = S / 64; // draw in a 64-unit space
  return { ctx, S, u };
}

function gloss(ctx, x, y, w, h, r) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, 'rgba(255,255,255,.75)');
  g.addColorStop(0.5, 'rgba(255,255,255,.12)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h / 2, r);
  ctx.lineTo(x, y + h / 2);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const DRAWN = {
  folder(ctx, u) {
    // the 10.0 glossy blue folder
    ctx.fillStyle = '#8fbfe8';
    rr(ctx, 6 * u, 18 * u, 52 * u, 34 * u, 3 * u); ctx.fill();
    ctx.fillStyle = '#b7d9f4';
    rr(ctx, 6 * u, 14 * u, 22 * u, 10 * u, 2 * u); ctx.fill();
    const g = ctx.createLinearGradient(0, 18 * u, 0, 52 * u);
    g.addColorStop(0, '#c9e4f8'); g.addColorStop(0.35, '#7db4e6'); g.addColorStop(1, '#3d78bd');
    ctx.fillStyle = g;
    rr(ctx, 8 * u, 19 * u, 48 * u, 31 * u, 3 * u); ctx.fill();
    gloss(ctx, 8 * u, 19 * u, 48 * u, 31 * u, 3 * u);
    ctx.strokeStyle = 'rgba(30,70,130,.55)'; ctx.lineWidth = u;
    rr(ctx, 8 * u, 19 * u, 48 * u, 31 * u, 3 * u); ctx.stroke();
  },
  doc(ctx, u) {
    ctx.fillStyle = '#f5f7fa';
    rr(ctx, 15 * u, 8 * u, 34 * u, 48 * u, 2 * u); ctx.fill();
    ctx.fillStyle = '#c9d2de';
    ctx.beginPath();
    ctx.moveTo(38 * u, 8 * u); ctx.lineTo(49 * u, 19 * u); ctx.lineTo(38 * u, 19 * u);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8d99a8'; ctx.lineWidth = u;
    rr(ctx, 15 * u, 8 * u, 34 * u, 48 * u, 2 * u); ctx.stroke();
    ctx.strokeStyle = '#9fb0c2';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(20 * u, (26 + i * 5) * u); ctx.lineTo(44 * u, (26 + i * 5) * u); ctx.stroke();
    }
  },
  app(ctx, u) {
    const g = ctx.createLinearGradient(0, 10 * u, 0, 54 * u);
    g.addColorStop(0, '#f2f5f9'); g.addColorStop(1, '#b9c2cf');
    ctx.fillStyle = g;
    rr(ctx, 12 * u, 10 * u, 40 * u, 44 * u, 5 * u); ctx.fill();
    ctx.strokeStyle = '#7c8899'; ctx.lineWidth = u;
    rr(ctx, 12 * u, 10 * u, 40 * u, 44 * u, 5 * u); ctx.stroke();
    // the pencil-and-A mark
    ctx.fillStyle = '#5a6472';
    ctx.font = `bold ${20 * u}px Helvetica, Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('A', 32 * u, 33 * u);
    gloss(ctx, 12 * u, 10 * u, 40 * u, 44 * u, 5 * u);
  },
  terminal(ctx, u) {
    ctx.fillStyle = '#3b4148';
    rr(ctx, 8 * u, 12 * u, 48 * u, 40 * u, 5 * u); ctx.fill();
    ctx.fillStyle = '#0f1215';
    rr(ctx, 11 * u, 18 * u, 42 * u, 31 * u, 3 * u); ctx.fill();
    ctx.fillStyle = '#e8e8e8';
    ctx.font = `${13 * u}px Menlo, monospace`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('>_', 16 * u, 33 * u);
    gloss(ctx, 8 * u, 12 * u, 48 * u, 40 * u, 5 * u);
    ctx.strokeStyle = '#20242a'; ctx.lineWidth = u;
    rr(ctx, 8 * u, 12 * u, 48 * u, 40 * u, 5 * u); ctx.stroke();
  },
  itunes(ctx, u) {
    // iTunes 1: a CD with a blue note
    const g = ctx.createRadialGradient(26 * u, 26 * u, 4 * u, 32 * u, 32 * u, 26 * u);
    g.addColorStop(0, '#fdfdfe'); g.addColorStop(0.75, '#c7cfdb'); g.addColorStop(1, '#8b96a6');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(32 * u, 32 * u, 24 * u, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7d8899';
    ctx.beginPath(); ctx.arc(32 * u, 32 * u, 5 * u, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3c7fe8';
    ctx.font = `bold ${30 * u}px Georgia, serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('♪', 38 * u, 30 * u);
  },
  applelogo(ctx, u) {
    ctx.fillStyle = '#111';
    ctx.font = `${30 * u}px Helvetica, Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('\uF8FF', 32 * u, 33 * u);
  },
  trashfull(ctx, u) {
    DRAWN_FOLDERLESS(ctx, u);
    ctx.fillStyle = '#c8b98d';
    rr(ctx, 18 * u, 18 * u, 28 * u, 8 * u, 2 * u); ctx.fill();
    ctx.fillStyle = '#e8e0c2';
    rr(ctx, 16 * u, 14 * u, 12 * u, 8 * u, 2 * u); ctx.fill();
    rr(ctx, 32 * u, 12 * u, 14 * u, 10 * u, 2 * u); ctx.fill();
  },
};

function DRAWN_FOLDERLESS(ctx, u) {
  // wire-mesh-ish basket, museum-drawn (full trash has no official slice here)
  ctx.strokeStyle = '#5a6270'; ctx.lineWidth = 1.2 * u;
  rr(ctx, 18 * u, 20 * u, 28 * u, 32 * u, 3 * u); ctx.stroke();
  for (let i = 1; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo((18 + i * 5.6) * u, 20 * u); ctx.lineTo((18 + i * 5.6) * u, 52 * u); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(18 * u, (20 + i * 6.4) * u); ctx.lineTo(46 * u, (20 + i * 6.4) * u); ctx.stroke();
  }
  ctx.strokeStyle = '#8a929e'; ctx.lineWidth = 2 * u;
  rr(ctx, 16 * u, 17 * u, 32 * u, 5 * u, 2 * u); ctx.stroke();
}

export function drawIcon(canvas, name) {
  const fn = DRAWN[name];
  const { ctx, S, u } = c2d(canvas);
  ctx.clearRect(0, 0, S, S);
  if (fn) fn(ctx, u);
  return !!fn;
}

export function iconEl(name, size = 48) {
  const url = iconURL(name);
  if (url) {
    const img = new Image();
    img.src = url; img.alt = '';
    img.width = size; img.height = size;
    return img;
  }
  const cv = document.createElement('canvas');
  cv.width = 64; cv.height = 64;
  cv.style.width = `${size}px`; cv.style.height = `${size}px`;
  drawIcon(cv, name);
  return cv;
}
