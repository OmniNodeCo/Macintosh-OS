/* MacPaint — a 1-bit paint program with a tool palette, paint patterns and
   flood fill. Drawings are saved as PNG data URLs in the virtual file system. */

import { el, clamp } from '../core/ui.js';
import * as FS from '../core/fs.js';
import { prompt, dialog } from '../core/wm.js';
import { toolURL, iconImg } from '../core/icons.js';
import { PAINT_PATTERNS, patternMask, patternStyle } from '../core/patterns.js';
import { keyClick, beep } from '../core/sound.js';

const TOOLS = [
  { id: 'pencil', name: 'Pencil' },
  { id: 'eraser', name: 'Eraser' },
  { id: 'line', name: 'Line' },
  { id: 'rect', name: 'Rectangle' },
  { id: 'oval', name: 'Oval' },
  { id: 'bucket', name: 'Fill' },
  { id: 'spray', name: 'Spray' },
  { id: 'text', name: 'Text' },
];

const CW = 320;
const CH = 200;

export default {
  id: 'macpaint',
  name: 'MacPaint',
  icon: 'macpaint',
  kind: 'Application',
  w: 360,
  h: 292,
  single: false,

  menus(appCtx) {
    return [
      {
        title: 'File',
        items: [
          { label: 'New', key: 'N', action: () => appCtx.api.newDoc() },
          { label: 'Save', key: 'S', action: () => appCtx.api.save() },
          { label: 'Save As…', action: () => appCtx.api.saveAs() },
          { sep: true },
          { label: 'Close', key: 'W', action: () => appCtx.win.close() },
        ],
      },
      {
        title: 'Edit',
        items: [
          { label: 'Undo', key: 'Z', action: () => appCtx.api.undo() },
          { sep: true },
          { label: 'Clear Page', action: () => appCtx.api.clear() },
        ],
      },
      {
        title: 'Goodies',
        items: [
          { label: 'Fill with 50% Gray', action: () => appCtx.api.undoableFill('gray50') },
          { label: 'Fill with Black', action: () => appCtx.api.undoableFill('black') },
          { label: 'White Page', action: () => appCtx.api.undoableFill('white') },
        ],
      },
    ];
  },

  open(appCtx) {
    const { win, file, finder } = appCtx;
    let doc = file || null;
    let dirty = false;
    let forceClose = false;
    let tool = 'pencil';
    let pattern = 'gray50';
    let lineWidth = 1;

    const wrap = el('div', { class: 'mpaint' });
    const palette = el('div', { class: 'palette' });
    const toolsBox = el('div', { class: 'tools' });
    const patternsBox = el('div', { class: 'patterns' });
    const widthsBox = el('div', { class: 'widths' });
    const row1 = el('div', { class: 'pal-row' }, toolsBox);
    const row2 = el('div', { class: 'pal-row' },
      patternsBox,
      el('span', { class: 'pal-sep' }),
      el('span', { class: 'side-label', text: 'Line' }), widthsBox,
    );
    palette.append(row1, row2);

    const canvasWrap = el('div', { class: 'canvas-wrap' });
    const canvas = el('canvas', { width: CW, height: CH });
    canvas.style.width = `${CW}px`;
    canvas.style.height = `${CH}px`;
    canvasWrap.append(canvas);
    wrap.append(palette, canvasWrap);
    win.body.append(wrap);

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const reset = () => {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, CW, CH);
    };
    reset();

    const mask = () => patternMask(pattern);
    const inMask = (m, x, y) => m[((y % 8) + 8) % 8][((x % 8) + 8) % 8];

    const setBlack = (x, y, on) => {
      ctx.fillStyle = on ? '#000' : '#fff';
      ctx.fillRect(x, y, lineWidth, lineWidth);
    };

    const plotPattern = (x, y) => {
      const m = mask();
      for (let j = 0; j < lineWidth; j++) {
        for (let i = 0; i < lineWidth; i++) {
          if (inMask(m, x + i, y + j)) setBlack(x + i, y + j, true);
        }
      }
    };

    const plotSolid = (x, y, on = true) => {
      for (let j = 0; j < lineWidth; j++) for (let i = 0; i < lineWidth; i++) setBlack(x + i, y + j, on);
    };

    /* --- tool buttons --- */
    const toolEls = [];
    for (const t of TOOLS) {
      const b = el('div', { class: 'tool' + (t.id === tool ? ' on' : ''), title: t.name },
        el('img', { src: toolURL(t.id), alt: t.name }));
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        tool = t.id;
        toolEls.forEach((x) => x.classList.toggle('on', x === b));
        keyClick();
      });
      toolEls.push(b);
      toolsBox.append(b);
    }

    const patEls = [];
    for (const p of PAINT_PATTERNS) {
      const sw = el('div', { class: 'swatch' + (p.id === pattern ? ' on' : ''), title: p.name });
      Object.assign(sw.style, patternStyle(p.id));
      sw.addEventListener('pointerdown', () => {
        pattern = p.id;
        patEls.forEach((x) => x.classList.toggle('on', x === sw));
        keyClick();
      });
      patEls.push(sw);
      patternsBox.append(sw);
    }

    for (let w = 1; w <= 4; w++) {
      const b = el('div', { class: 'w' + (w === lineWidth ? ' on' : '') },
        el('i', { style: { width: `${w * 2 + 2}px`, height: `${w}px` } }));
      b.addEventListener('pointerdown', () => {
        lineWidth = w;
        widthsBox.querySelectorAll('.w').forEach((n) => n.classList.toggle('on', n === b));
      });
      widthsBox.append(b);
    }

    /* --- undo --- */
    const undoStack = [];
    const snapshot = () => {
      try { undoStack.push(ctx.getImageData(0, 0, CW, CH)); } catch (e) { /* ignore */ }
      if (undoStack.length > 8) undoStack.shift();
    };
    const undo = () => {
      const img = undoStack.pop();
      if (img) ctx.putImageData(img, 0, 0);
      else beep(0.1);
    };

    /* --- drawing --- */
    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      const sx = CW / r.width, sy = CH / r.height;
      return { x: Math.floor((e.clientX - r.left) * sx), y: Math.floor((e.clientY - r.top) * sy) };
    };

    let drawing = false, start = null, before = null, last = null;

    /* A fast drag is delivered as one pointermove plus a batch of coalesced
       events. Painting only the last position leaves gaps, so every coalesced
       sample is painted and the samples are joined into a continuous stroke. */
    const strokePoints = (e) => {
      let list = [];
      try {
        if (typeof e.getCoalescedEvents === 'function') list = e.getCoalescedEvents() || [];
      } catch (err) { list = []; }
      if (!list.length) list = [e];
      return list.map(point);
    };

    const lineBetween = (a, b, plot) => {
      let x0 = a.x, y0 = a.y;
      const dx = Math.abs(b.x - x0), dy = Math.abs(b.y - y0);
      const sx = x0 < b.x ? 1 : -1, sy = y0 < b.y ? 1 : -1;
      let err = dx - dy;
      for (;;) {
        plot(x0, y0);
        if (x0 === b.x && y0 === b.y) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
      }
    };

    function drawText(x, y) {
      prompt({
        title: 'MacPaint',
        message: 'Text to draw:',
        value: 'Hello',
        icon: null,
      }).then((text) => {
        if (!text) return;
        snapshot();
        ctx.fillStyle = '#000';
        ctx.font = '12px "MacPixel Chicago", monospace';
        ctx.textBaseline = 'top';
        ctx.fillText(text, x, y);
        dirty = true;
        win.refreshMenus();
      });
    }

    function shapeTo(x, y) {
      if (!before) return;
      ctx.putImageData(before, 0, 0);
      const m = mask();
      const plot = (px, py) => plotPattern(px, py);
      if (tool === 'line') {
        let x0 = start.x, y0 = start.y;
        const dx = Math.abs(x - x0), dy = Math.abs(y - y0);
        const sx = x0 < x ? 1 : -1, sy = y0 < y ? 1 : -1;
        let err = dx - dy;
        for (;;) {
          plotPattern(x0, y0);
          if (x0 === x && y0 === y) break;
          const e2 = 2 * err;
          if (e2 > -dy) { err -= dy; x0 += sx; }
          if (e2 < dx) { err += dx; y0 += sy; }
        }
      } else if (tool === 'rect') {
        const x0 = Math.min(start.x, x), y0 = Math.min(start.y, y);
        const w = Math.abs(x - start.x), h = Math.abs(y - start.y);
        for (let i = 0; i <= w; i++) { plot(x0 + i, y0); plot(x0 + i, y0 + h); }
        for (let j = 0; j <= h; j++) { plot(x0, y0 + j); plot(x0 + w, y0 + j); }
        for (let j = 1; j < h; j++) for (let i = 1; i < w; i++) {
          if (inMask(m, x0 + i, y0 + j)) setBlack(x0 + i, y0 + j, false);
        }
      } else if (tool === 'oval') {
        const cx = (start.x + x) / 2, cy = (start.y + y) / 2;
        const rx = Math.abs(x - start.x) / 2, ry = Math.abs(y - start.y) / 2;
        for (let a = 0; a < 360; a += 1.2) {
          const r = (a * Math.PI) / 180;
          plot(Math.round(cx + rx * Math.cos(r)), Math.round(cy + ry * Math.sin(r)));
        }
      }
    }

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      const p = point(e);
      drawing = true;
      start = p;
      last = p;
      snapshot();
      before = ctx.getImageData(0, 0, CW, CH);
      if (tool === 'pencil') { setBlack(p.x, p.y, true); }
      else if (tool === 'eraser') { plotSolid(p.x, p.y, false); }
      else if (tool === 'spray') { sprayAt(p.x, p.y); }
      else if (tool === 'bucket') { bucketFill(p.x, p.y); }
      else if (tool === 'text') { drawing = false; drawText(p.x, p.y); }
    });

    function sprayAt(x, y) {
      for (let i = 0; i < 22; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 6;
        setBlack(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), true);
      }
      dirty = true;
    }

    function bucketFill(x, y) {
      const img = ctx.getImageData(0, 0, CW, CH);
      const data = img.data;
      const idx = (px, py) => (py * CW + px) * 4;
      if (x < 0 || y < 0 || x >= CW || y >= CH) return;
      const t = idx(x, y);
      const target = data[t] < 128;
      const m = mask();
      const stack = [[x, y]];
      const seen = new Uint8Array(CW * CH);
      while (stack.length) {
        const [cx, cy] = stack.pop();
        if (cx < 0 || cy < 0 || cx >= CW || cy >= CH) continue;
        const k = cy * CW + cx;
        if (seen[k]) continue;
        seen[k] = 1;
        const o = k * 4;
        const isBlack = data[o] < 128;
        if (isBlack !== target) continue;
        const fillBlack = inMask(m, cx, cy);
        data[o] = data[o + 1] = data[o + 2] = fillBlack ? 0 : 255;
        data[o + 3] = 255;
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }
      ctx.putImageData(img, 0, 0);
      dirty = true;
    }

    canvas.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const pts = strokePoints(e);
      const p = pts[pts.length - 1];

      if (tool === 'pencil' || tool === 'eraser') {
        const plot = tool === 'pencil'
          ? (x, y) => setBlack(x, y, true)
          : (x, y) => plotSolid(x, y, false);
        let from = last;
        for (const q of pts) {
          lineBetween(from, q, plot);
          from = q;
        }
        dirty = true;
      } else if (tool === 'spray') {
        for (const q of pts) sprayAt(q.x, q.y);
      } else {
        shapeTo(p.x, p.y);
        dirty = true;
      }
      last = p;
    });

    const endStroke = () => {
      drawing = false;
      before = null;
      if (dirty) win.setTitle(titleFor());
    };
    canvas.addEventListener('pointerup', endStroke);
    canvas.addEventListener('pointercancel', endStroke);

    /* --- documents --- */
    const titleFor = () => `${doc ? doc.name : 'untitled'}${dirty ? ' *' : ''}`;

    const api = {
      newDoc() {
        snapshot();
        reset();
        doc = null;
        dirty = false;
        win.setTitle(titleFor());
      },
      undo,
      clear() {
        snapshot();
        reset();
        dirty = true;
        win.setTitle(titleFor());
      },
      undoableFill(id) {
        snapshot();
        pattern = id;
        const m = patternMask(id);
        for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
          if (inMask(m, x, y)) setBlack(x, y, true);
        }
        dirty = true;
      },
      async saveAs() {
        const name = await prompt({
          title: 'Save As',
          message: 'Save this painting as:',
          value: doc ? `${doc.name} copy` : 'untitled painting',
          ok: 'Save',
          icon: null,
        });
        if (name === null) return false;
        const target = FS.documentsFolder();
        const node = FS.addNode(target, {
          name: name.trim() || 'untitled painting',
          kind: 'doc',
          icon: 'docPaint',
          app: 'macpaint',
          kindLabel: 'MacPaint document',
          data: canvas.toDataURL('image/png'),
        });
        doc = node;
        dirty = false;
        win.setTitle(titleFor());
        finder.refreshAll();
        return true;
      },
      async save() {
        if (!doc) return api.saveAs();
        doc.data = canvas.toDataURL('image/png');
        doc.modified = Date.now();
        FS.changed();
        dirty = false;
        win.setTitle(titleFor());
        finder.refreshAll();
        return true;
      },
    };
    appCtx.api = api;

    if (doc && doc.data && /^data:image/.test(doc.data)) {
      const img = new Image();
      img.onload = () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, CW, CH); ctx.drawImage(img, 0, 0); };
      img.src = doc.data;
    }

    win.setTitle(titleFor());
    win.refreshMenus();

    win.onClose = () => {
      if (!dirty || forceClose) return true;
      dialog({
        title: 'MacPaint',
        message: 'Save this painting before closing?',
        buttons: ['Save', 'Cancel', "Don't Save"],
        cancelButton: 1,
        defaultButton: 0,
        icon: 'note',
      }).then((r) => {
        if (r.index === 0) api.save().then((ok) => { if (ok) { forceClose = true; win.close(); } });
        else if (r.index === 2) { forceClose = true; win.close(); }
      });
      return false;
    };
  },
};
