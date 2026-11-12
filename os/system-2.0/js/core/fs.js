/* ============================================================================
   A tiny in-memory file system for the System 2.0 clone.  It models MFS-ish
   nodes (System 2.0 predates HFS by a year):
   disks, folders, applications, documents.  Everything the user creates is
   persisted to localStorage so documents survive a reload.
   ========================================================================== */

import { uid, fmtDate } from './ui.js';

const KEY = 'macintosh-os.2.0.fs.v1';

/* System 2.0 shipped on a 400K single-sided 3.5-inch floppy. The 512K was RAM,
   not disk: every Macintosh of 1984-85 booted from the same 400K media.
   400 x 1024 = 409,600 bytes, the formatted capacity of the disk. */
export const VOLUME_BYTES = 400 * 1024;
export const VOLUME_LABEL = '400K';

const now = () => Date.now();

export const fs = {
  roots: [],
  trash: null,
};

/* ------------------------------------------------------------- utilities -- */

export function find(node, id) {
  if (!node) return null;
  if (node.id === id) return node;
  for (const kid of node.children || []) {
    const hit = find(kid, id);
    if (hit) return hit;
  }
  return null;
}

export function findById(id) {
  for (const root of fs.roots) {
    const hit = find(root, id);
    if (hit) return hit;
  }
  return fs.trash && find(fs.trash, id);
}

export function parentOf(child, node = null) {
  const start = node || { children: fs.roots.concat(fs.trash ? [fs.trash] : []) };
  for (const kid of start.children || []) {
    if (kid === child) return start;
    const hit = parentOf(child, kid);
    if (hit) return hit;
  }
  return null;
}

export function pathOf(node) {
  const parts = [];
  let n = node;
  while (n) {
    parts.unshift(n.name);
    n = parentOf(n);
  }
  return parts.join(':');
}

export function uniqueName(parent, base) {
  const names = new Set((parent.children || []).map((c) => c.name.toLowerCase()));
  if (!names.has(base.toLowerCase())) return base;
  const m = base.match(/^(.*?)(\s+\d+)?$/);
  const stem = m[1];
  let i = 2;
  while (names.has(`${stem} ${i}`.toLowerCase())) i++;
  return `${stem} ${i}`;
}

export function addNode(parent, props) {
  const node = {
    id: uid('f'),
    name: 'untitled',
    kind: 'doc',
    icon: 'doc',
    app: null,
    data: '',
    children: null,
    created: now(),
    modified: now(),
    ...props,
  };
  node.name = uniqueName(parent, node.name);
  node.children = props.children || (['folder', 'disk', 'trash'].includes(node.kind) ? [] : null);
  parent.children.push(node);
  changed();
  return node;
}

export function removeNode(node) {
  const p = parentOf(node);
  if (!p) return false;
  const i = p.children.indexOf(node);
  if (i >= 0) p.children.splice(i, 1);
  changed();
  return true;
}

export function moveNode(node, target, atStart = false) {
  const from = parentOf(node);
  if (!from || from === target) return false;
  // never move a folder into itself
  if (target.id === node.id) return false;
  const inner = find(target, node.id);
  if (inner) return false;
  const i = from.children.indexOf(node);
  if (i >= 0) from.children.splice(i, 1);
  if (!target.children) target.children = [];
  if (atStart) target.children.unshift(node); else target.children.push(node);
  changed();
  return true;
}

export function duplicate(node) {
  const parent = parentOf(node);
  if (!parent) return null;
  const copy = JSON.parse(JSON.stringify(node));
  const reid = (n) => {
    n.id = uid('f');
    n.created = now();
    n.modified = now();
    (n.children || []).forEach(reid);
  };
  reid(copy);
  copy.name = uniqueName(parent, /copy/.test(node.name) ? node.name : `${node.name} copy`);
  parent.children.push(copy);
  changed();
  return copy;
}

/* how much of the volume is in use, and how much is left */
export function usedBytes(node = systemDisk()) {
  let total = 0;
  const walk = (n) => {
    if (!n) return;
    if (n.children) {
      total += 4096;                       // directory blocks
      n.children.forEach(walk);
    } else {
      total += sizeOf(n);
    }
  };
  walk(node);
  return total;
}

/* each volume reports its own free space; the System Disk is the budget */
export function volumeBytes(node = systemDisk()) {
  if (node && node.bytes) return node.bytes;
  return VOLUME_BYTES;
}

export function freeBytes(node = systemDisk()) {
  return Math.max(0, volumeBytes(node) - usedBytes(node));
}

export function sizeOf(node) {
  if (node.children) {
    const n = node.children.length;
    return n * 1024 + 512;
  }
  if (node.data && /^data:image/.test(node.data)) return Math.round(node.data.length * 0.75);
  return Math.max(512, (node.data || '').length);
}

export function kindLabel(node) {
  if (node.kind === 'disk') return 'Disk';
  if (node.kind === 'trash') return 'Trash';
  if (node.kind === 'folder') return 'Folder';
  if (node.kind === 'app') return 'Application';
  return node.kindLabel || 'Document';
}

/* ---------------------------------------------------------------- sorting -- */

export const SORTS = [
  { id: 'icon', name: 'by Icon' },
  { id: 'name', name: 'by Name' },
  { id: 'size', name: 'by Size' },
  { id: 'date', name: 'by Date' },
  { id: 'kind', name: 'by Kind' },
];

export function sortItems(items, mode) {
  const list = items.slice();
  if (mode === 'name') list.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  else if (mode === 'size') list.sort((a, b) => sizeOf(b) - sizeOf(a));
  else if (mode === 'date') list.sort((a, b) => (b.modified || 0) - (a.modified || 0));
  else if (mode === 'kind') list.sort((a, b) => kindLabel(a).localeCompare(kindLabel(b)) || a.name.localeCompare(b.name));
  return list;
}

/* ------------------------------------------------------------ persistence -- */

let saveTimer = null;
export function changed() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveRaw, 250);
}

export function serialize() {
  const strip = (n) => ({
    id: n.id, name: n.name, kind: n.kind, icon: n.icon, app: n.app,
    data: n.data, created: n.created, modified: n.modified,
    kindLabel: n.kindLabel, locked: n.locked,
    children: n.children ? n.children.map(strip) : null,
  });
  return { v: 1, roots: fs.roots.map(strip), trash: fs.trash ? strip(fs.trash) : null };
}

export function saveRaw() {
  try {
    localStorage.setItem(KEY, JSON.stringify(serialize()));
  } catch (err) { /* storage may be full or blocked — not fatal */ }
}

export function loadSaved() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || data.v !== 1 || !Array.isArray(data.roots) || !data.roots.length) return false;
    fs.roots = data.roots;
    fs.trash = data.trash || makeTrashNode();
    return true;
  } catch (err) {
    return false;
  }
}

function makeTrashNode() {
  return {
    id: 'trash', name: 'Trash', kind: 'trash', icon: 'trash', app: null,
    data: '', children: [], created: now(), modified: now(),
  };
}

/* ------------------------------------------------------------- defaults -- */

function doc(name, icon, text, extra = {}) {
  return {
    id: uid('f'), name, kind: 'doc', icon, app: 'macwrite', data: text,
    children: null, created: now(), modified: now(), ...extra,
  };
}

function appFile(name, icon, appId) {
  return {
    id: uid('f'), name, kind: 'app', icon, app: appId, data: '',
    children: null, created: now(), modified: now(),
  };
}

function folder(name, icon, children = []) {
  return {
    id: uid('f'), name, kind: 'folder', icon, app: null, data: '',
    children, created: now(), modified: now(),
  };
}

const README = `Welcome to Macintosh.

This is a browser recreation of Macintosh System 2.0 and Finder 4.1,
released in April 1985 with the 512K Macintosh.

Everything you see is drawn with one bit per pixel: black or white,
no grey, no colour. The desktop patterns, window pin-stripes, icons
and the typeface are all rebuilt from scratch for the web.

What is new since System 1.0:
  * New Folder replaces Empty Folder, and finally ends the era of
    the empty folder that could not be deleted.
  * Shut Down, in the Special menu, parks the read/write head.
  * Use MiniFinder puts a small launcher window in place of the
    Finder, for machines short of memory.
  * Choose Printer, the forerunner of the Chooser, picks between
    the ImageWriter and the LaserWriter.
  * Print Catalog prints a listing of a disk or folder.
  * Drag a disk to the Trash to eject it.
  * List views show a small icon beside every name.

Try this:
  * Double-click System Disk to see what is installed.
  * Choose Special -> Use MiniFinder.
  * Throw a document away and watch the Trash fill up.

Open "Credits" for full credits, sources and licence notes.
`;

const WELCOME = `Welcome to MacWrite.

Click in this page and type. The File menu can save your
work to the System Disk, and documents you save show up
in the Finder as soon as you close this window.

System 2.0 still shipped with MacWrite and MacPaint, the two
programs that convinced people a computer could be
friendly. Have fun.
`;

const CREDITS_TEXT = `Credits

This project is an homage to the original Macintosh. It contains
no Apple software, ROMs, fonts or artwork: every pixel was drawn
for this clone. Open the Credits application for the full list.
`;

export function reloadDefaults() {
  const applications = folder('Applications', 'folder', [
    appFile('Launcher', 'launcher', 'launcher'),
    appFile('MacWrite', 'macwrite', 'macwrite'),
    appFile('MacPaint', 'macpaint', 'macpaint'),
    appFile('Calculator', 'calculator', 'calculator'),
    appFile('Alarm Clock', 'clock', 'clock'),
    appFile('Control Panel', 'controlpanel', 'controlpanel'),
    appFile('Key Caps', 'keycaps', 'keycaps'),
    appFile('Note Pad', 'notepad', 'notepad'),
    appFile('Puzzle', 'puzzle', 'puzzle'),
    appFile('Scrapbook', 'scrapbook', 'scrapbook'),
    appFile('Credits', 'credits', 'credits'),
    appFile('About This Macintosh', 'floppy', 'about'),
    appFile('Choose Printer', 'printer', 'chooseprinter'),
  ]);

  const documents = folder('Documents', 'folder', [
    doc('Welcome', 'docText', WELCOME),
    doc('Read Me', 'docText', README),
    doc('Credits Notes', 'docText', CREDITS_TEXT),
  ]);

  const systemFolder = folder('System Folder', 'systemfolder', [
    doc('System', 'app', 'System 2.0 — boot disk image placeholder.'),
    doc('Finder', 'app', 'Finder 4.1 — the desktop you are looking at.'),
    doc('ImageWriter', 'app', 'Printer driver for the ImageWriter.'),
    doc('LaserWriter', 'app', 'LaserWriter driver. New in System 2.0: it shares the printer over AppleTalk.'),
    doc('MiniFinder', 'app', 'MiniFinder 1.0 — the small launcher that stands in for the Finder.'),
    doc('Scrapbook File', 'scrapbook', ''),
    folder('Preferences', 'folder', []),
  ]);

  const systemDisk = {
    id: 'systemdisk',
    name: 'System Disk',
    kind: 'disk',
    icon: 'floppy',
    app: null,
    data: '',
    created: now(),
    modified: now(),
    children: [systemFolder, applications, documents],
  };

  const macPaintDisk = {
    id: 'macpaintdisk',
    name: 'MacPaint Disk',
    kind: 'disk',
    icon: 'floppy',
    app: null,
    data: '',
    created: now(),
    modified: now(),
    children: [
      appFile('MacPaint', 'macpaint', 'macpaint'),
      doc('Doodle', 'docPaint', ''),
      doc('MacPaint Read Me', 'docText', 'MacPaint 1.5\n\nPaint with the pencil, the brush, the spray can\nor the paint bucket. Hold the mouse still to spray.\n\nDrawings save to this disk as pictures.'),
    ],
  };

  fs.roots = [systemDisk, macPaintDisk];
  fs.trash = makeTrashNode();

  // a couple of sample documents on the desktop? no — keep the classic look
  saveRaw();
}

export function initFS() {
  if (!loadSaved()) reloadDefaults();
}

/* -------- helpers used by the apps ------------------------------------- */

export function createDocument(parent, { name = 'untitled', icon = 'docText', app = 'macwrite', data = '' } = {}) {
  return addNode(parent, { name, kind: 'doc', icon, app, data });
}

export function createFolder(parent, name = 'untitled folder') {
  return addNode(parent, { name, kind: 'folder', icon: 'folder' });
}

export function trashNode(node) {
  if (!fs.trash) return false;
  if (node.kind === 'disk') return false;
  return moveNode(node, fs.trash, true);
}

export function emptyTrash() {
  if (!fs.trash) return;
  fs.trash.children = [];
  changed();
}

export function isInTrash(node) {
  let p = parentOf(node);
  while (p) {
    if (p === fs.trash) return true;
    p = parentOf(p);
  }
  return node === fs.trash;
}

export function systemDisk() {
  return fs.roots[0];
}

export function applicationsFolder() {
  return systemDisk()?.children.find((c) => c.name === 'Applications') || systemDisk();
}

export function documentsFolder() {
  return systemDisk()?.children.find((c) => c.name === 'Documents') || systemDisk();
}

export { fmtDate };
