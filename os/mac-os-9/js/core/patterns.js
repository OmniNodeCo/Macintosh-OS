/* 1-bit tile patterns ("desktop patterns" in System 1.0, paint patterns in
   MacPaint). Rendered as tiny tiled SVGs so they stay perfectly crisp at any
   integer zoom level. */

export const PATTERNS = [
  { id: 'white', name: 'White', art: ['...'] },
  { id: 'gray25', name: 'Light gray', art: ['#...', '....', '....', '....'] },
  { id: 'gray50', name: '50% gray', art: ['#.', '.#'] },
  { id: 'gray75', name: 'Dark gray', art: ['#.', '##'] },
  { id: 'linesH', name: 'Horizontal', art: ['#', '.'] },
  { id: 'linesV', name: 'Vertical', art: ['#.', '..'] },
  { id: 'diagL', name: 'Diagonal', art: ['#.......', '.#......', '..#.....', '...#....', '....#...', '.....#..', '......#.', '.......#'] },
  { id: 'bricks', name: 'Bricks', art: ['########', '........', '...##...', '........', '########', '........', '.##.....', '........'] },
  { id: 'waves', name: 'Waves', art: ['##..##..', '..##..##', '##..##..', '..##..##', '........', '........', '........', '........'] },
  { id: 'black', name: 'Black', art: ['#'] },
];

const byId = new Map(PATTERNS.map((p) => [p.id, p]));

function tileSVG(p) {
  if (p.id === 'white') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" shape-rendering="crispEdges"><rect width="1" height="1" fill="#fff"/></svg>`;
  }
  if (p.id === 'black') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" shape-rendering="crispEdges"><rect width="1" height="1" fill="#000"/></svg>`;
  }
  const h = p.art.length;
  const w = Math.max(...p.art.map((r) => r.length));
  let rects = '';
  p.art.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] === '#') {
        const start = x;
        while (x < row.length && row[x] === '#') x++;
        rects += `<rect x="${start}" y="${y}" width="${x - start}" height="1"/>`;
      } else x++;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" shape-rendering="crispEdges">` +
    `<rect width="${w}" height="${h}" fill="#fff"/><g fill="#000">${rects}</g></svg>`;
}

const urlCache = new Map();
export function patternURL(id) {
  const p = byId.get(id) || PATTERNS[1];
  if (!urlCache.has(p.id)) {
    urlCache.set(p.id, `url("data:image/svg+xml,${encodeURIComponent(tileSVG(p))}")`);
  }
  return urlCache.get(p.id);
}

export function patternSize(id) {
  const p = byId.get(id) || PATTERNS[1];
  if (p.id === 'white' || p.id === 'black') return '1px 1px';
  const w = Math.max(...p.art.map((r) => r.length));
  return `${w}px ${p.art.length}px`;
}

export function patternStyle(id) {
  return { backgroundImage: patternURL(id), backgroundSize: patternSize(id) };
}

export function applyPattern(node, id) {
  const s = patternStyle(id);
  node.style.backgroundImage = s.backgroundImage;
  node.style.backgroundSize = s.backgroundSize;
}

export function patternName(id) {
  return (byId.get(id) || PATTERNS[1]).name;
}

/** Paint a pattern into a small canvas (used by MacPaint's palette preview). */
export function patternCanvas(id) {
  const p = byId.get(id) || PATTERNS[1];
  const cv = document.createElement('canvas');
  cv.width = 8; cv.height = 8;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const img = ctx.createImageData(8, 8);
  const h = p.art.length, w = p.art[0].length;
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const ch = p.art[y % h][x % w];
    const black = p.id === 'black' || ch === '#';
    const o = (y * 8 + x) * 4;
    const v = black ? 0 : 255;
    img.data[o] = img.data[o + 1] = img.data[o + 2] = v;
    img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

/** 8x8 boolean mask for a pattern, handy for MacPaint fills. */
export function patternMask(id) {
  const p = byId.get(id) || PATTERNS[1];
  const m = [];
  const h = p.art.length, w = p.art[0].length;
  for (let y = 0; y < 8; y++) {
    const row = [];
    for (let x = 0; x < 8; x++) row.push(p.id === 'black' || p.art[y % h][x % w] === '#');
    m.push(row);
  }
  return m;
}

export const DESKTOP_PATTERNS = ['white', 'gray25', 'gray50', 'gray75', 'linesH', 'linesV', 'diagL', 'bricks'];
export const PAINT_PATTERNS = ['white', 'gray25', 'gray50', 'gray75', 'linesH', 'linesV', 'diagL', 'bricks'];
