/* ============================================================================
   A tiny in-memory file system for the System 7.0 clone.

   Unlike 1.0 and 2.0 — where the Finder faked folders on top of a flat MFS
   disk — this is a real tree: HFS folders nest to any depth, the Finder walks
   them, and every volume has its own byte budget.  Per-volume free space,
   Trash "bulging" and 800K startup disks are all System 7.0 behaviour.
   Everything the user creates is persisted to localStorage.
   ========================================================================== */

import { uid, fmtDate } from './ui.js';

const KEY = 'macintosh-os.7.0.fs.v1';

/* System 7.0 is the release that made the 800K double-sided floppy normal:
   800 x 1024 = 819,200 bytes, the formatted capacity of the startup disk.
   System 2.0's 400K media still mount, which is why the filesystem carries
   the size of each volume instead of assuming one. */
export const VOLUME_BYTES = 800 * 1024;
export const VOLUME_LABEL = '800K';

export const FLOPPY_800K = 800 * 1024;
export const FLOPPY_1_4M = 1440 * 1024;   // the SuperDrive's 1.4 MB disk

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
    label: n.label, aliasOf: n.aliasOf, desc: n.desc,
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

This is a browser recreation of Macintosh System 7.0, the May 1991
release that rebuilt the Macintosh interface from the ground up —
still one bit per pixel on this SE, still 512 × 342.

Everything you see is drawn with one bit per pixel: black or white.
The desktop patterns, beveled window frames, scrollbars, icons and
the typeface are all rebuilt from scratch for the web.

What is new since System 6.0:
  * The System 7 look. Windows grow bevels and a ridged grow box,
    buttons go rounded and embossed, scrollbars get arrow boxes,
    and the desktop wears a 50% grey linen by default.
  * About This Macintosh replaces About the Finder: every running
    application gets a memory bar, and the largest unused block
    is always on show.
  * Aliases. File \u25b8 Make Alias makes a small file that points at
    any other — double-click it to open the original.
  * Balloon Help. The Help menu turns on speech balloons that
    explain every icon you hover.
  * The Apple menu is built from the Apple Menu Items folder, the
    running programs move to the Application menu at the right end
    of the menu bar, and Control Panels are separate little
    programs in their own folder.
  * Labels. The Label menu paints a patterned band under any icon's
    name — Essential, Hot, In Progress, Cool, Personal, Project 1
    or Project 2.
  * Force Quit: press Ctrl/⌘ + Option + Escape.
  * The Trash is a real folder now. Throw something away, restart,
    and it is still there. Empty Trash is a promise, not a habit.

What went away:
  * MacroMaker. AppleScript replaced the tape recorder.
  * Set Startup. MultiFinder is not optional any more; it just runs.
  * The 800K disk. This machine carries a 1.4 MB SuperDrive disk
    and an 80 MB hard disk.

Try this:
  * Apple menu \u25b8 About This Macintosh.
  * Make an alias of the Read Me and open it.
  * Help \u25b8 Show Balloons, then hover the icons.
  * Right end of the menu bar: the Application menu.

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

  /* --- System Folder, the System 7 way ------------------------------------ */
  const extensions = folder('Extensions', 'folder', [
    doc('AppleTalk', 'app', 'AppleTalk network extension. 230.4 kbit/s over LocalTalk.', { size: 12 * 1024, locked: true }),
    doc('LaserWriter', 'app', 'LaserWriter 7.0 driver, with AppleTalk support.', { size: 44 * 1024, locked: true }),
    doc('ImageWriter', 'app', 'Printer driver for the ImageWriter II and LQ.', { size: 14 * 1024, locked: true }),
    doc('DA Handler', 'app', 'DA Handler — opens desk accessories on top of applications.', { size: 8 * 1024, locked: true }),
    doc('TrueType', 'app', 'TrueType outline fonts: Chicago, Geneva, Monaco, New York, Venice.\nBuilt into System 7.0 — no more bitmap-only screen fonts.', { size: 96 * 1024, locked: true }),
  ]);

  const controlPanels = folder('Control Panels', 'folder', [
    doc('General', 'cdevMemory', '', { kind: 'doc', app: 'controlpanel', size: 20 * 1024 }),
    doc('Memory', 'cdevMemory', '', { kind: 'doc', app: 'controlpanel', size: 16 * 1024 }),
    doc('Virtual Memory', 'cdevMemory', '', { kind: 'doc', app: 'controlpanel', size: 12 * 1024 }),
    doc('Startup Disk', 'cdevStartup', '', { kind: 'doc', app: 'controlpanel', size: 10 * 1024 }),
    doc('Keyboard', 'cdevKeyboard', '', { kind: 'doc', app: 'controlpanel', size: 8 * 1024 }),
    doc('Mouse', 'cdevMouse', '', { kind: 'doc', app: 'controlpanel', size: 8 * 1024 }),
    doc('Sound', 'cdevSound', '', { kind: 'doc', app: 'controlpanel', size: 8 * 1024 }),
    doc('Desktop Pattern', 'controlpanel', '', { kind: 'doc', app: 'controlpanel', size: 6 * 1024 }),
  ]);

  const appleMenuItems = folder('Apple Menu Items', 'folder', [
    { id: uid('f'), name: 'Control Panels', kind: 'alias', icon: 'folder', app: null, data: '',
      aliasOf: controlPanels.id, children: null, created: now(), modified: now() },
    doc('Note Pad', 'note', '', { kind: 'doc', app: 'notepad', size: 5 * 1024 }),
    doc('Puzzle', 'puzzle', '', { kind: 'doc', app: 'puzzle', size: 8 * 1024 }),
    doc('Scrapbook', 'scrapbook', '', { kind: 'doc', app: 'scrapbook', size: 11 * 1024 }),
    doc('Key Caps', 'keycaps', '', { kind: 'doc', app: 'keycaps', size: 6 * 1024 }),
    doc('Chooser', 'printer', '', { kind: 'doc', app: 'chooser', size: 22 * 1024 }),
    doc('Note Pad alias demo', 'note', '', { kind: 'doc', app: 'notepad', size: 1024 }),
  ]);
  // give the last entry a proper alias shape pointing at Note Pad
  {
    const np = appleMenuItems.children[1];
    const demo = appleMenuItems.children[appleMenuItems.children.length - 1];
    demo.name = `${np.name} alias`;
    demo.aliasOf = np.id;
    demo.kind = 'alias';
  }

  const systemFolder = folder('System Folder', 'systemfolder', [
    // Apple shipped these with the lock bit set; Get Info shows Locked: Yes.
    doc('System', 'app', 'System 7.0 — boot disk image placeholder.\n32-bit QuickDraw and TrueType live in here.', { size: 336 * 1024, locked: true }),
    doc('Finder', 'app', 'Finder 7.0 — the desktop you are looking at.', { size: 176 * 1024, locked: true }),
    extensions,
    controlPanels,
    appleMenuItems,
    folder('Preferences', 'folder', [
      doc('Finder Preferences', 'docText', '', { size: 1024 }),
    ]),
    folder('Startup Items', 'folder', []),
    doc('Scrapbook File', 'scrapbook', '', { kind: 'doc', size: 4 * 1024 }),
    doc('Clipboard File', 'docText', '', { size: 512 }),
  ]);

  const applications = folder('Applications', 'folder', [
    appFile('Launcher', 'launcher', 'launcher', 18 * 1024),
    appFile('MacWrite', 'macwrite', 'macwrite', 62 * 1024),
    appFile('MacPaint', 'macpaint', 'macpaint', 71 * 1024),
    appFile('Calculator', 'calculator', 'calculator', 9 * 1024),
    appFile('Alarm Clock', 'clock', 'clock', 7 * 1024),
    appFile('Key Caps', 'keycaps', 'keycaps', 6 * 1024),
    appFile('Note Pad', 'notepad', 'notepad', 5 * 1024),
    appFile('Puzzle', 'puzzle', 'puzzle', 8 * 1024),
    appFile('Scrapbook', 'scrapbook', 'scrapbook', 11 * 1024),
    appFile('Credits', 'credits', 'credits', 6 * 1024),
    appFile('About This Macintosh', 'floppy', 'about', 4 * 1024),
    appFile('Chooser', 'printer', 'chooser', 22 * 1024),
    appFile('Control Panels', 'controlpanel', 'controlpanel', 14 * 1024),
  ]);

  const systemDisk = volume('System 7.0', 'floppy', FLOPPY_1_4M,
    [systemFolder, applications, documents], { id: 'systemdisk' });

  /* 1991: a 1.4 MB SuperDrive disk and an 80 MB SCSI hard disk — the sizes a
     Macintosh IIsi or an SE with an accelerator actually carried. */
  const scsi = volume('80MB HD', 'harddisk', 80 * 1024 * 1024, [
    folder('Applications', 'folder', [
      appFile('MacWrite', 'macwrite', 'macwrite', 62 * 1024),
      appFile('MacPaint', 'macpaint', 'macpaint', 71 * 1024),
      appFile('MacDraw', 'draw', 'launcher', 96 * 1024),
    ]),
    folder('Documents', 'folder', [
      doc('System 7 Read Me', 'docText', 'SYSTEM 7.0 READ ME\n\nWelcome to System 7. Aliases, Balloon Help, TrueType,\nAppleScript and a desktop that finally looks like a\nplace. Drag this file to the Trash \u2014 then restart.\nIt will still be there. The Trash is a folder now.\n', { size: 4096 }),
      folder('Projects', 'folder', [
        folder('Disk Labels', 'folder', [
          folder('1991', 'folder', [
            doc('May Labels', 'docText', 'SYSTEM 7.0\nMacintosh\n\n80 MB. The whole System Folder fits in one\ncorner of it.\n', { size: 1024 }),
          ]),
        ]),
      ]),
    ]),
    doc('Read Me First', 'docText', 'SCSI HARD DISK, 80 MB\n\n80 MB, 5400 RPM, SCSI ID 0. System 7.0 formats it\nwith Apple HD SC Setup and blesses the System Folder.\nVirtual Memory wants a 68020 or better; this disk\nwill lend it a swap file when the time comes.\n', { size: 2048 }),
    { id: 'trashondisk', name: 'Trash', kind: 'trash', icon: 'trash', app: null, data: '', children: [], created: now(), modified: now() },
  ], { id: 'scsidisk' });

  fs.roots = [systemDisk, scsi];
  fs.trash = makeTrashNode();

  // a couple of sample documents on the desktop? no — keep the classic look
  saveRaw();
}

/* System 7 aliases: small files that point at another object. */
export function makeAlias(target, parent) {
  const base = `${target.name}`;
  return addNode(parent, {
    name: uniqueName(parent, `${base} alias`),
    kind: 'alias',
    icon: target.icon,
    app: target.app,
    data: '',
    aliasOf: target.id,
  });
}

export function resolveAlias(node) {
  if (!node || node.kind !== 'alias') return node;
  return findById(node.aliasOf) || node;
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
