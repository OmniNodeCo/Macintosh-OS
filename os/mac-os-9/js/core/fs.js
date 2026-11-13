/* ============================================================================
   A tiny in-memory file system for the Mac OS 9.0 clone.

   Unlike 1.0 and 2.0 — where the Finder faked folders on top of a flat MFS
   disk — this is a real tree: HFS folders nest to any depth, the Finder walks
   them, and every volume has its own byte budget.  Per-volume free space,
   The startup disk is a 10 GB IDE drive now; the Zip 100 disk is the floppy of 1999.
   Everything the user creates is persisted to localStorage.
   ========================================================================== */

import { uid, fmtDate } from './ui.js';

const KEY = 'macintosh-os.9.0.fs.v1';

/* Mac OS 9.0 (October 1999) runs on HFS+ volumes: disks may exceed 2 GB.
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

This is a browser recreation of Mac OS 9.0 — "Sonata", the
23 October 1999 release advertised as "Your Internet co-pilot",
with over fifty new features. This machine is a Power Macintosh G4
("Yikes!", PCI Graphics): a PowerPC 7400 at 350 MHz with the AltiVec
Velocity Engine, 64 MB of memory, a 10 GB Ultra ATA hard disk, a
32x CD-ROM and a Zip 100 disk. There is no floppy drive — this is
1999; the Zip disk took its place.

The screen is an 800 \u00d7 600 window in full colour, wearing the
same Platinum appearance Mac OS 8 introduced. The icons are the
official artwork of the era (see Credits); the chrome is still
drawn in code.

What is new since Mac OS 8:
  * Sherlock 2. Not a find window any more: a search centre with
    channels — Internet, People, Shopping, News, Apple, Pictures,
    Reference — searched from one box.
  * Multiple Users. A login panel at startup and account kinds:
    Owner, Normal, Limited, Panels and Guest, with each person's
    settings kept apart.
  * The Keychain. AppleShare, internet and application passwords
    in one encrypted drawer with a master password (128-bit).
  * Automatic Software Update. The Mac itself checks Apple's
    software server and lists what is new.
  * Voice Recognition password printing, file sharing over TCP/IP,
    and DVD playback on machines with a DVD-ROM drive.

What is honestly not new here:
  * Multitasking is still cooperative, and there is still no
    protected memory. A misbehaving application can still take
    the whole Mac with it — that is the classic Mac OS bargain,
    and this museum keeps it.

Try this:
  * Apple menu \u25b8 Sherlock 2 \u2192 try the channels.
  * Control Panels \u25b8 Multiple Users \u2192 log in as someone.
  * Apple menu \u25b8 Keychain Access \u2192 set a master password.
  * Control Panels \u25b8 Software Update \u2192 press Update Now.

Open "Credits" for full credits, sources and licence notes.
`;

const WELCOME = `Welcome to MacWrite.

Click in this page and type. The File menu can save your
work to Macintosh HD, and documents you save show up
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

This project is an homage to the classic Macintosh. It contains no
Apple software, ROMs or fonts. Its icons use official Apple artwork
of each era, credited in full; everything else was drawn for this
clone. Open the Credits application for the full list.
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
    doc('AppleTalk', 'app', 'AppleTalk network extension.', { size: 48 * 1024, locked: true }),
    doc('LaserWriter 8', 'app', 'LaserWriter 8 driver — PostScript Level 2, on AppleTalk.', { size: 320 * 1024, locked: true }),
    doc('ImageWriter', 'app', 'Printer driver for the ImageWriter II and LQ.', { size: 24 * 1024, locked: true }),
    doc('QuickTime', 'app', 'QuickTime 4 — movies, streaming, and the odd codec war.', { size: 512 * 1024, locked: true }),
    doc('Mac OS Runtime for Java', 'app', 'MRJ 2.1 — Java inside Mac OS 9.', { size: 768 * 1024, locked: true }),
    doc('Contextual Menu Extension', 'app', 'Contextual menus. Control-click anything.', { size: 32 * 1024, locked: true }),
    doc('TrueType', 'app', 'TrueType outline fonts. Charcoal joins Chicago, Geneva\nand Monaco as the system face.', { size: 128 * 1024, locked: true }),
  ]);

  const controlPanels = folder('Control Panels', 'folder', [
    doc('Appearance', 'cdevMemory', '', { kind: 'doc', app: 'controlpanel', size: 64 * 1024 }),
    doc('General', 'cdevMemory', '', { kind: 'doc', app: 'controlpanel', size: 20 * 1024 }),
    doc('Memory', 'cdevMemory', '', { kind: 'doc', app: 'controlpanel', size: 16 * 1024 }),
    doc('Virtual Memory', 'cdevMemory', '', { kind: 'doc', app: 'controlpanel', size: 12 * 1024 }),
    doc('Startup Disk', 'cdevStartup', '', { kind: 'doc', app: 'controlpanel', size: 10 * 1024 }),
    doc('Keyboard', 'cdevKeyboard', '', { kind: 'doc', app: 'controlpanel', size: 8 * 1024 }),
    doc('Mouse', 'cdevMouse', '', { kind: 'doc', app: 'controlpanel', size: 8 * 1024 }),
    doc('Sound', 'cdevSound', '', { kind: 'doc', app: 'controlpanel', size: 8 * 1024 }),
    doc('Desktop Pattern', 'controlpanel', '', { kind: 'doc', app: 'controlpanel', size: 6 * 1024 }),
    doc('Multiple Users', 'multipleusers', '', { kind: 'doc', app: 'multipleusers', size: 256 * 1024 }),
    doc('Software Update', 'softwareupdate', '', { kind: 'doc', app: 'softwareupdate', size: 384 * 1024 }),
  ]);

  const appleMenuItems = folder('Apple Menu Items', 'folder', [
    { id: uid('f'), name: 'Control Panels', kind: 'alias', icon: 'folder', app: null, data: '',
      aliasOf: controlPanels.id, children: null, created: now(), modified: now() },
    doc('SimpleText', 'note', '', { kind: 'doc', app: 'simpletext', size: 24 * 1024 }),
    doc('Note Pad', 'note', '', { kind: 'doc', app: 'notepad', size: 5 * 1024 }),
    doc('Puzzle', 'puzzle', '', { kind: 'doc', app: 'puzzle', size: 8 * 1024 }),
    doc('Scrapbook', 'scrapbook', '', { kind: 'doc', app: 'scrapbook', size: 11 * 1024 }),
    doc('Key Caps', 'keycaps', '', { kind: 'doc', app: 'keycaps', size: 6 * 1024 }),
    doc('Chooser', 'printer', '', { kind: 'doc', app: 'chooser', size: 22 * 1024 }),
    doc('Sherlock 2', 'sherlock', '', { kind: 'doc', app: 'sherlock', size: 512 * 1024 }),
    doc('Keychain Access', 'keychain', '', { kind: 'doc', app: 'keychain', size: 224 * 1024 }),
  ]);

  const systemFolder = folder('System Folder', 'systemfolder', [
    doc('System', 'app', 'Mac OS 9.0 — the Platinum system file.\nSherlock 2, Multiple Users, the Keychain and\nAutomatic Software Update live here.', { size: 2816 * 1024, locked: true }),
    doc('Finder', 'app', 'Finder 9.0 — native and multithreaded, with\nspring-loaded folders and contextual menus.', { size: 1024 * 1024, locked: true }),
    extensions,
    controlPanels,
    appleMenuItems,
    folder('Preferences', 'folder', [
      doc('Finder Preferences', 'docText', '', { size: 2048 }),
    ]),
    folder('Startup Items', 'folder', []),
    doc('Scrapbook File', 'scrapbook', '', { kind: 'doc', size: 16 * 1024 }),
    doc('Clipboard File', 'docText', '', { size: 512 }),
  ]);

  const applications = folder('Applications', 'folder', [
    appFile('SimpleText', 'note', 'simpletext', 128 * 1024),
    appFile('MacWrite', 'macwrite', 'macwrite', 62 * 1024),
    appFile('MacPaint', 'macpaint', 'macpaint', 71 * 1024),
    appFile('Launcher', 'launcher', 'launcher', 32 * 1024),
    appFile('Calculator', 'calculator', 'calculator', 24 * 1024),
    appFile('Alarm Clock', 'clock', 'clock', 16 * 1024),
    appFile('Key Caps', 'keycaps', 'keycaps', 12 * 1024),
    appFile('Note Pad', 'notepad', 'notepad', 12 * 1024),
    appFile('Puzzle', 'puzzle', 'puzzle', 20 * 1024),
    appFile('Scrapbook', 'scrapbook', 'scrapbook', 24 * 1024),
    appFile('Credits', 'credits', 'credits', 12 * 1024),
    appFile('About This Macintosh', 'floppy', 'about', 8 * 1024),
    appFile('Chooser', 'printer', 'chooser', 44 * 1024),
    appFile('Control Panels', 'controlpanel', 'controlpanel', 28 * 1024),
    appFile('Sherlock 2', 'sherlock', 'sherlock', 512 * 1024),
    appFile('Keychain Access', 'keychain', 'keychain', 224 * 1024),
    appFile('Multiple Users', 'multipleusers', 'multipleusers', 256 * 1024),
    appFile('Software Update', 'softwareupdate', 'softwareupdate', 384 * 1024),
  ]);

  /* A Power Macintosh G4 ("Yikes!", PCI Graphics, October 1999): a 10 GB
     Ultra ATA drive on an HFS+ volume — the 2 GB ceiling of plain HFS is
     long gone — a Zip 100 disk in the expansion bay, a 32x CD-ROM and a
     2 MB RAM Disk. The G4 shipped with no floppy drive; the Zip is the
     removable disk of the day. */
  const systemDisk = volume('Macintosh HD', 'harddisk', 10 * 1024 * 1024 * 1024,
    [systemFolder, applications, documents], { id: 'systemdisk' });

  const zip = volume('Zip 100', 'zip', 100 * 1024 * 1024, [
    folder('Backups', 'folder', [
      doc('Monday Backup', 'docText', 'A 100 MB Zip disk held about seventy floppies.\nPeople carried three and lost two.\n', { size: 2048 }),
    ]),
    folder('Fonts', 'folder', [
      doc('Chicago', 'app', 'The system face since 1984.', { size: 24 * 1024, locked: true }),
      doc('Charcoal', 'app', 'Charcoal arrived with Platinum in 1997.', { size: 32 * 1024, locked: true }),
    ]),
    doc('Read Me', 'docText', 'ZIP 100 DISK\n\n100,000,000 bytes of spinning magnetic memory.\nThe click of a Zip drive is the sound of 1999.\n', { size: 2048 }),
    { id: 'trashonzip', name: 'Trash', kind: 'trash', icon: 'trash', app: null, data: '', children: [], created: now(), modified: now() },
  ], { id: 'zipdisk' });

  const cd = volume('Mac OS 9 CD', 'cd', 650 * 1024 * 1024, [
    folder('Mac OS Install', 'folder', [
      doc('Install Mac OS 9', 'app', 'The installer. The CD boots the G4 directly.', { size: 3 * 1024 * 1024, locked: true }),
      doc('Read Me', 'docText', 'MAC OS 9 CD\n\nBoot from this CD by holding C at start-up, or pick\nit in Control Panels \u25b8 Startup Disk.\n', { size: 4096, locked: true }),
    ]),
    folder('Utilities', 'folder', [
      doc('Drive Setup', 'app', 'Formats ATA and SCSI disks.', { size: 256 * 1024, locked: true }),
      doc('Disk First Aid', 'app', 'Repairs disk damage.', { size: 192 * 1024, locked: true }),
      doc('Norton Utilities', 'app', 'Third-party first aid. Run it twice a year.', { size: 2 * 1024 * 1024, locked: true }),
    ]),
    doc('About This Disc', 'docText', 'A CD-ROM is a 650 MB floppy that remembers everything.\nNothing here can be erased, which is the point.\n', { size: 4096, locked: true }),
  ], { id: 'macos9cd' });

  const ramDisk = volume('RAM Disk', 'ram', 2 * 1024 * 1024, [
    doc('scratch', 'docText', 'A RAM Disk lives in memory and forgets everything at\nrestart. Fast, cheerful and unreliable — 1984 tech,\nstill useful in 1999.\n', { size: 512 }),
  ], { id: 'ramdisk' });

  fs.roots = [systemDisk, zip, cd, ramDisk];
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
