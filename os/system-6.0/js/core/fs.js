/* ============================================================================
   A tiny in-memory file system for the System 6.0 clone.

   Unlike 1.0 and 2.0 — where the Finder faked folders on top of a flat MFS
   disk — this is a real tree: HFS folders nest to any depth, the Finder walks
   them, and every volume has its own byte budget.  Per-volume free space,
   Trash "bulging" and 800K startup disks are all System 6.0 behaviour.
   Everything the user creates is persisted to localStorage.
   ========================================================================== */

import { uid, fmtDate } from './ui.js';

const KEY = 'macintosh-os.6.0.fs.v1';

/* System 6.0 is the release that made the 800K double-sided floppy normal:
   800 x 1024 = 819,200 bytes, the formatted capacity of the startup disk.
   System 2.0's 400K media still mount, which is why the filesystem carries
   the size of each volume instead of assuming one. */
export const VOLUME_BYTES = 800 * 1024;
export const VOLUME_LABEL = '800K';

export const FLOPPY_400K = 400 * 1024;
export const FLOPPY_800K = 800 * 1024;

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

/* how much of a volume is in use, and how much is left */
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

/* Each volume carries its own capacity: an 800K startup disk, a 400K disk
   from an older machine, or a very large hard disk. */
export function volumeBytes(node = systemDisk()) {
  return (node && node.bytes) || VOLUME_BYTES;
}

/* free space belongs to the volume that holds the node */
export function volumeOf(node) {
  let n = node;
  while (n) {
    if (n.kind === 'disk') return n;
    n = parentOf(n);
  }
  return systemDisk();
}

export function freeBytes(node = systemDisk()) {
  const vol = node && node.kind === 'disk' ? node : volumeOf(node);
  return Math.max(0, volumeBytes(vol) - usedBytes(vol));
}

export function isFull(node, need = 0) {
  return need > freeBytes(node);
}

/* A file's reported size.  Seeded files carry a period-plausible `size` (the
   System file really was about 41K on a System Tools disk); anything the user
   creates is measured from its data. */
export function sizeOf(node) {
  if (node.children) {
    // a folder occupies its directory blocks plus everything inside it
    let total = 512;
    for (const kid of node.children) total += sizeOf(kid);
    return total;
  }
  if (node.size) return node.size;
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
    kindLabel: n.kindLabel, locked: n.locked, size: n.size, bytes: n.bytes,
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
    children: null, created: now(), modified: now(), size: 1024, ...extra,
  };
}

function appFile(name, icon, appId, size = 24 * 1024) {
  return {
    id: uid('f'), name, kind: 'app', icon, app: appId, data: '',
    children: null, created: now(), modified: now(), size,
  };
}

function folder(name, icon, children = []) {
  return {
    id: uid('f'), name, kind: 'folder', icon, app: null, data: '',
    children, created: now(), modified: now(),
  };
}

/* a disk: capacity in bytes, so free space is per-volume */
function volume(name, icon, bytes, children, extra = {}) {
  return {
    id: uid('d'), name, kind: 'disk', icon, bytes, app: null, data: '',
    children, created: now(), modified: now(), ...extra,
  };
}

const README = `Welcome to Macintosh.

This is a browser recreation of Macintosh System 6.0 and Finder 6.1,
released in April 1988, running the way it did on a Macintosh SE.

Everything you see is drawn with one bit per pixel: black or white,
no grey, no colour. The desktop patterns, window pin-stripes, icons
and the typeface are all rebuilt from scratch for the web.

What is new since System 3.0:
  * MultiFinder. Special \u25b8 Set Startup\u2026 starts the Macintosh with
    MultiFinder instead of the plain Finder: applications then share
    the machine instead of taking it over. The Apple menu lists the
    programs that are running, and About the Finder grows a
    "Largest Unused Block" line. Restart to make it take effect.
  * MacroMaker, the new System 6.0 desk accessory: it looks like a
    tape recorder and remembers where you clicked.
  * The Control Panel is the strip-of-icons kind now: Keyboard,
    Mouse, Sound, Memory and Startup Disk, one pane at a time.
  * The ImageWriter LQ joins the Chooser, on AppleTalk.
  * A 30 MB SCSI hard disk beside the 800K startup floppy.
  * The Trash empties itself when the Finder quits. It is not a
    folder yet; System 7 fixes that.

What went away:
  * The 400K disk. The SE's SuperDrive reads them, but nobody
    writes them any more.
  * Restart and Shut Down live in the Special menu, where they
    belong.

Try this:
  * Special \u25b8 Set Startup\u2026 \u2192 MultiFinder, then restart.
  * Open the Apple menu and see the running programs.
  * Click through the Control Panel icons.
  * Make a folder inside a folder inside a folder \u2014 HFS since 1986.

Open "Credits" for full credits, sources and licence notes.
`;

const WELCOME = `Welcome to MacWrite.

Click in this page and type. The File menu can save your
work to the System Disk, and documents you save show up
in the Finder as soon as you close this window.

MacWrite and MacPaint were no longer in the box by 1986 — the
Mac Plus shipped without them — but this disk keeps them, because
a Mac without MacPaint is not much fun. Have fun.
`;

const LETTER = `11 January 1986

Apple Computer, Inc.
20525 Mariani Avenue
Cupertino, California 95014

Dear Apple,

We bought the Plus the day it arrived. The manuals say
800K per disk and 1 MB of memory, and for once the
manuals are telling the truth.

The only thing missing is a reason to use the SCSI port.
Tell the engineers to hurry up with a hard disk that
costs less than the computer.

Sincerely,
A customer
`;

const CREDITS_TEXT = `Credits

This project is an homage to the original Macintosh. It contains
no Apple software, ROMs, fonts or artwork: every pixel was drawn
for this clone. Open the Credits application for the full list.
`;

export function reloadDefaults() {
  /* HFS at last: folders inside folders, three levels deep. */
  const letters = folder('Letters', 'folder', [
    doc('Letter to Apple', 'docText', LETTER, { size: 3072 }),
    doc('Thank You', 'docText', 'Dear Macintosh team,\n\nThank you for the Plus. 1 MB of memory, an 800K drive\nand a SCSI port. It feels like a machine that will still be\nuseful in five years.\n\nYours,\na happy customer\n', { size: 2048 }),
  ]);
  const projects = folder('Projects', 'folder', [
    folder('Disk Labels', 'folder', [
      folder('1986', 'folder', [
        doc('January Labels', 'docText', 'SYSTEM TOOLS 1.0\nMacintosh Plus\n\nKeep this disk away from magnets, heat and\nthe family dog.\n', { size: 1024 }),
      ]),
    ]),
    folder('AppleTalk Notes', 'folder', [
      doc('Cable Plan', 'docText', 'LocalTalk cabling, office layout\n\n1. LaserWriter at the far end, daisy-chained.\n2. Terminators at both ends of the run.\n3. Do not coil the spare cable around the phone.\n', { size: 2048 }),
    ]),
  ]);

  const documents = folder('Documents', 'folder', [
    doc('Welcome', 'docText', WELCOME),
    doc('Read Me', 'docText', README),
    doc('Credits Notes', 'docText', CREDITS_TEXT),
    letters,
    projects,
  ]);

  const systemFolder = folder('System Folder', 'systemfolder', [
    // Apple shipped these with the lock bit set; Get Info shows Locked: Yes.
    doc('System', 'app', 'System 6.0 — boot disk image placeholder.', { size: 168 * 1024, locked: true }),
    doc('Finder', 'app', 'Finder 6.1 — the desktop you are looking at.', { size: 96 * 1024, locked: true }),
    doc('MultiFinder', 'app', 'MultiFinder — the co-operative multitasker.\nSpecial ▸ Set Startup… turns it on; restart to run it.', { size: 24 * 1024, locked: true }),
    doc('DA Handler', 'app', 'DA Handler — lets desk accessories open on top of applications.', { size: 4 * 1024, locked: true }),
    doc('Backgrounder', 'app', 'Backgrounder — keeps the Finder active behind applications.', { size: 8 * 1024, locked: true }),
    doc('ImageWriter', 'app', 'Printer driver for the ImageWriter II.', { size: 9 * 1024, locked: true }),
    doc('ImageWriter LQ', 'app', 'Printer driver for the ImageWriter LQ. New in System 6.0.', { size: 12 * 1024, locked: true }),
    doc('LaserWriter', 'app', 'LaserWriter driver, with AppleTalk support.', { size: 40 * 1024, locked: true }),
    doc('AppleTalk', 'app', 'AppleTalk network driver. 230.4 kbit/s over LocalTalk.', { size: 12 * 1024, locked: true }),
    doc('MacroMaker', 'macromaker', 'MacroMaker — record mouse and keyboard actions.\nNew in System 6.0.', { kind: 'doc', app: 'macromaker', size: 16 * 1024 }),
    doc('Scrapbook File', 'scrapbook', '', { kind: 'doc', size: 4 * 1024 }),
    doc('Clipboard File', 'docText', '', { size: 512 }),
    folder('Preferences', 'folder', [
      doc('Finder Preferences', 'docText', '', { size: 512 }),
    ]),
  ]);

  const applications = folder('Applications', 'folder', [
    appFile('Launcher', 'launcher', 'launcher', 18 * 1024),
    appFile('MacWrite', 'macwrite', 'macwrite', 62 * 1024),
    appFile('MacPaint', 'macpaint', 'macpaint', 71 * 1024),
    appFile('Calculator', 'calculator', 'calculator', 9 * 1024),
    appFile('Alarm Clock', 'clock', 'clock', 7 * 1024),
    appFile('Control Panel', 'controlpanel', 'controlpanel', 14 * 1024),
    appFile('Key Caps', 'keycaps', 'keycaps', 6 * 1024),
    appFile('Note Pad', 'notepad', 'notepad', 5 * 1024),
    appFile('Puzzle', 'puzzle', 'puzzle', 8 * 1024),
    appFile('Scrapbook', 'scrapbook', 'scrapbook', 11 * 1024),
    appFile('Credits', 'credits', 'credits', 6 * 1024),
    appFile('About the Finder', 'floppy', 'about', 4 * 1024),
    appFile('Chooser', 'printer', 'chooser', 22 * 1024),
    appFile('MacroMaker', 'macromaker', 'macromaker', 16 * 1024),
  ]);

  const systemDisk = volume('System 6.0', 'floppy', FLOPPY_800K,
    [systemFolder, applications, documents], { id: 'systemdisk' });

  /* The SE has a SCSI port, and by 1988 the 30SC is the hard disk to own —
     30 MB of HFS, comfortably past the 32 MB limit System 6.0.2 lifted. */
  const scsi = volume('30SC Hard Disk', 'harddisk', 30 * 1024 * 1024, [
    folder('Applications', 'folder', [
      appFile('MacWrite', 'macwrite', 'macwrite', 62 * 1024),
      appFile('MacPaint', 'macpaint', 'macpaint', 71 * 1024),
      appFile('MacDraw', 'draw', 'launcher', 96 * 1024),
    ]),
    folder('System Folder', 'systemfolder', [
      doc('Finder', 'app', 'Finder 6.1 — a spare, for rescuing a sick startup disk.', { size: 96 * 1024 }),
      doc('System', 'app', 'System 6.0 — a spare, for rescuing a sick startup disk.', { size: 168 * 1024 }),
    ]),
    folder('Backups', 'folder', [
      doc('Letters (June)', 'docText', 'Backed up from the System 6.0 disk.\n', { size: 6 * 1024 }),
      doc('Disk Labels (June)', 'docText', 'Backed up from the System 6.0 disk.\n', { size: 3 * 1024 }),
    ]),
    doc('Read Me First', 'docText', 'APPLE HARD DISK 30SC\n\n30 MB, 5400 RPM, SCSI ID 0. Format it with the\nApple HD SC Setup utility, copy your System Folder\nonto it, then Special \u25b8 Set Startup\u2026 to boot from it.\n\nSystem 6.0 can have 8 MB of RAM, but the 30SC\nnever sleeps. Do not stack books on it.\n', { size: 2048 }),
    { id: 'trashondisk', name: 'Trash', kind: 'trash', icon: 'trash', app: null, data: '', children: [], created: now(), modified: now() },
  ], { id: 'scsidisk' });

  fs.roots = [systemDisk, scsi];
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
