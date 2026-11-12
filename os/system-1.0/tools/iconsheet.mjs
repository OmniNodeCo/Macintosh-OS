// Dev tool: render every icon to a PNG contact sheet for eyeballing. (node, no deps)
import { ICON_FACTORIES, TOOL_FACTORIES } from '../js/core/icons.js';
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const names = Object.keys(ICON_FACTORIES);
const tnames = Object.keys(TOOL_FACTORIES);
const CELL = 100, PAD = 8;
const cols = 6;
const rows = Math.ceil((names.length + tnames.length) / cols);
const W = cols * CELL, H = rows * CELL;

const img = Buffer.alloc(W * H * 3, 0xe8);
function put(x, y, v) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const o = (y * W + x) * 3;
  img[o] = img[o + 1] = img[o + 2] = v;
}
names.concat(tnames).forEach((name, i) => {
  const f = ICON_FACTORIES[name] || TOOL_FACTORIES[name];
  const bmp = f();
  const n = bmp.n, s = Math.max(1, Math.floor((CELL - 24) / n));
  const ox = (i % cols) * CELL + Math.floor((CELL - n * s) / 2);
  const oy = Math.floor(i / cols) * CELL + Math.floor((CELL - n * s) / 2);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const v = bmp.px[y * n + x];
    if (!v) continue;
    for (let sy = 0; sy < s; sy++) for (let sx = 0; sx < s; sx++)
      put(ox + x * s + sx, oy + y * s + sy, v === 1 ? 0 : 0xff);
  }
});

function png(w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crcT = Buffer.alloc(4); crcT.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crcT]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}
let table;
function crc32(buf) {
  if (!table) {
    table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let c = -1;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}
writeFileSync('/tmp/iconsheet.png', png(W, H, img));
console.log('icons:', names.join(', '));
console.log('tools:', tnames.join(', '));
