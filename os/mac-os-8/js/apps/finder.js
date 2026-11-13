/* ============================================================================
   Finder 5.1 — the desktop, HFS disk/folder windows, icon dragging and the
   File / Edit / View / Special menus as they stood in January 1986.

   What changed since 4.1: real folders inside folders, a zoom box on every
   title bar, a status line that reports each volume's own free space, a Trash
   that bulges when it holds something, and MiniFinder's departure — the Plus
   has the memory to run the whole Finder, so Special no longer offers it.
   ========================================================================== */

import * as FS from '../core/fs.js';
import { createWindow, scroller, focusWindow, alert, confirm, prompt, dialog, showGhost, moveGhost, hideGhost, activeWindow, DESK_H, SCREEN_W } from '../core/wm.js';
import { iconImg, iconURL, nodeIcon } from '../core/icons.js';
import { setMenus } from '../core/menu.js';
import { appleMenu, utilityMenus } from './apple-menu.js';
import { el, clamp, dragSession, fmtDate, bytes, $ } from '../core/ui.js';
import { click, diskEject, diskInsert, beep } from '../core/sound.js';

const POS_KEY = 'macintosh-os.3.0.deskpos';

const finder = {
  ctx: null,
  desk: null,
  deskSel: [],
  windows: new Map(),
  sortMode: 'icon',
  clipboard: null,
  positions: {},
  deskIcons: new Map(),
};

/* Volumes that have been put away. The System Disk is the startup volume, so
   it can be ejected for show but is put straight back on the next boot. */
finder.ejected = new Set();

export function isEjected(node) {
  return !!(node && node.kind === 'disk' && finder.ejected.has(node.id));
}

export function ejectDisk(node) {
  if (!node || node.kind !== 'disk') return;
  if (node === FS.systemDisk()) {
    alert({
      title: 'The System Disk',
      icon: 'caution',
      message: 'The System Disk cannot be put away because the Macintosh is\nrunning from it.',
      buttons: ['OK'],
    });
    return;
  }
  finder.ejected.add(node.id);
  diskEject();
  renderDesktop();
  refreshAll();
}

export function insertDisk(node) {
  if (!node) return;
  finder.ejected.delete(node.id);
  diskInsert();
  renderDesktop();
  refreshAll();
}

/* ------------------------------------------------------------------ setup -- */

export function initFinder(ctx) {
  finder.ctx = ctx;
  wireBalloons();
  finder.desk = document.getElementById('desktop');
  try { finder.positions = JSON.parse(localStorage.getItem(POS_KEY) || '{}'); } catch (e) { finder.positions = {}; }

  finder.desk.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.dicon')) return;
    focusWindow(null);
    selectDesktop([]);
  });

  renderDesktop();
  return finder;
}

export function menusFor(ctx) {
  return [appleMenu(ctx), ...finder.menus()];
}

/* ---------------------------------------------------------------- desktop -- */

function defaultPosition(node) {
  if (node.kind === 'disk') {
    // volumes stack down the right edge, in root order
    const i = Math.max(0, FS.fs.roots.indexOf(node));
    return { x: SCREEN_W - 84, y: 6 + i * 74 };
  }
  if (node.kind === 'trash') return { x: SCREEN_W - 84, y: DESK_H - 92 };
  return { x: 10, y: 6 };
}

export function renderDesktop() {
  const desk = finder.desk;
  desk.innerHTML = '';
  finder.deskIcons.clear();

  const items = [];
  for (const root of FS.fs.roots) {
    if (isEjected(root)) continue;          // put away via the Trash
    items.push(root);
  }
  items.push({ id: 'launcher-icon', name: 'Launcher', kind: 'app', icon: 'launcher', app: 'launcher' });
  if (FS.fs.trash) items.push(FS.fs.trash);

  for (const node of items) {
    const pos = finder.positions[node.id] || defaultPosition(node);
    const elNode = makeDesktopIcon(node, pos);
    desk.append(elNode);
    finder.deskIcons.set(node.id, elNode);
  }
}

function makeDesktopIcon(node, pos) {
  const full = node.kind === 'trash' && node.children && node.children.length;
  const wrap = el('div', { class: 'dicon', 'data-id': node.id });
  wrap.style.left = `${pos.x}px`;
  wrap.style.top = `${pos.y}px`;
  const plate = el('div', { class: 'plate' }, node.kind === 'trash' ? iconImg(full ? 'trashFull' : 'trash') : nodeIcon(node));
  const label = el('span', { class: 'lbl' + (node.label != null ? ` l${node.label}` : ''), text: node.name });
  wrap.append(plate, label);

  wireSelection(wrap, node, () => finder.deskSel, (next) => selectDesktop(next), () => openNode(node));
  wireDrag(wrap, node, null);
  wireContext(wrap, node);
  return wrap;
}

function selectDesktop(nodes) {
  finder.deskSel = nodes;
  for (const [id, elNode] of finder.deskIcons) {
    elNode.classList.toggle('sel', nodes.some((n) => n.id === id));
  }
  if (activeWindow() == null) setMenus(menusFor(finder.ctx));
}

/* ------------------------------------------------------------ interactions -- */

function wireSelection(nodeEl, node, getSel, setSel, onOpen) {
  nodeEl.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const sel = getSel();
    const isSel = sel.some((n) => n.id === node.id);
    if (e.shiftKey) {
      setSel(isSel ? sel.filter((n) => n.id !== node.id) : [...sel, node]);
    } else if (!isSel) {
      setSel([node]);
    }
  });
  nodeEl.addEventListener('dblclick', (e) => { e.preventDefault(); e.stopPropagation(); onOpen(); });
}

function deskPoint(clientX, clientY) {
  const r = finder.desk.getBoundingClientRect();
  const s = window.__macScale || 1;
  return { x: (clientX - r.left) / s, y: (clientY - r.top) / s };
}

function wireDrag(nodeEl, node, win) {
  nodeEl.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const start = { x: e.clientX, y: e.clientY };
    let dragging = false;
    let moved = false;
    const startPos = { left: nodeEl.offsetLeft, top: nodeEl.offsetTop };
    /* Spring-loaded folders (new in Mac OS 8): hold a dragged icon over a
       folder or disk and after a moment it springs open; keep dragging and
       you are already inside it. */
    let springKey = null, springTimer = 0, springTarget = null;
    const springReset = () => {
      clearTimeout(springTimer);
      springTimer = 0; springKey = null; springTarget = null;
    };
    const springCheck = (ev) => {
      const prefsObj = window.mac && window.mac.prefs;
      if (prefsObj && prefsObj.springload === false) return;
      const hit = folderAt(ev.clientX, ev.clientY);
      let tn = null;
      if (hit.kind === 'desktop-icon') tn = FS.findById(hit.id);
      else if (hit.kind === 'icon' && hit.node) tn = hit.node;
      else if (hit.kind === 'window' && hit.node) tn = hit.node;
      if (!tn || tn.id === node.id || (tn.kind !== 'folder' && tn.kind !== 'disk')) {
        springReset();
        return;
      }
      if (springKey === tn.id) return;
      springReset();
      springKey = tn.id;
      springTarget = tn;
      springTimer = setTimeout(() => {
        springTimer = 0;
        openContainer(springTarget);
        springReset();
      }, 850);
    };
    const move = (ev) => {
      if (!dragging) {
        if (Math.abs(ev.clientX - start.x) + Math.abs(ev.clientY - start.y) < 4) return;
        // a disk can always be dragged; locked system files cannot
        dragging = true;
        const p = deskPoint(ev.clientX, ev.clientY);
        showGhost(node.kind === 'trash' ? 'trashFull' : node.icon || 'doc', p.x, p.y);
        nodeEl.classList.add('dragging');
      }
      moved = true;
      const p = deskPoint(ev.clientX, ev.clientY);
      moveGhost(p.x, p.y);
      springCheck(ev);
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      springReset();
      if (!moved) return;
      nodeEl.classList.remove('dragging');
      hideGhost();
      const p = deskPoint(ev.clientX, ev.clientY);
      handleDrop(node, win, p, ev);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    e.stopPropagation();
  });
}

/* -------------------------------------------------------- contextual menu -- */
/* Mac OS 8 brought contextual menus: Control-click an icon and the menu
   already knows what you clicked. (Cloned flat: this museum has no submenus,
   so the Label items stand on their own instead of under a Label submenu.) */

function hideContextMenu() {
  const old = document.querySelector('.ctxmenu');
  if (old) old.remove();
  window.__ctxDismiss = null;
}

export function showContextMenu(x, y, items) {
  hideContextMenu();
  const menu = el('div', { class: 'menu ctxmenu' });
  menu.style.position = 'fixed';
  menu.style.zIndex = '500';
  for (const it of items) {
    if (!it) { menu.append(el('div', { class: 'mi-sep' })); continue; }
    const row = el('div', { class: 'mi' + (it.disabled ? ' dis' : ''), text: it.label });
    if (!it.disabled) {
      row.addEventListener('pointerup', (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        hideContextMenu();
        it.action();
      });
    }
    menu.append(row);
  }
  document.body.append(menu);
  const r = menu.getBoundingClientRect();
  menu.style.left = `${Math.min(x, window.innerWidth - r.width - 4)}px`;
  menu.style.top = `${Math.min(y, window.innerHeight - r.height - 4)}px`;
  const dismiss = (ev) => {
    if (menu.contains(ev.target)) return;
    hideContextMenu();
    document.removeEventListener('pointerdown', dismiss, true);
    document.removeEventListener('contextmenu', dismiss, true);
    window.__ctxDismiss = null;
  };
  window.__ctxDismiss = dismiss;
  setTimeout(() => {
    document.addEventListener('pointerdown', dismiss, true);
    document.addEventListener('contextmenu', dismiss, true);
  }, 0);
  return menu;
}

function contextItemsFor(node) {
  const one = node;
  const canTrash = one && one.kind !== 'trash' && one.kind !== 'disk';
  const items = [
    { label: 'Open', disabled: !one, action: () => openNode(one) },
    { label: 'Get Info…', disabled: !one, action: () => getInfo(one) },
    null,
    { label: 'Make Alias', disabled: !one || one.kind === 'alias', action: () => { FS.makeAlias(one, FS.parentOf(one) || { children: FS.fs.roots }); refreshAll(); } },
    null,
    { label: one && one.kind === 'disk' ? 'Put Away' : 'Move to Trash',
      disabled: one ? !(one.kind === 'disk' ? true : canTrash) : true,
      action: () => { if (one.kind === 'disk') { ejectDisk(one); } else if (FS.trashNode(one)) { diskEject(); refreshAll(); } } },
    null,
  ];
  for (let i = 0; i < 4; i++) {
    const idx = i === 0 ? null : i;
    items.push({
      label: i === 0 ? 'Label: None' : `Label: ${LABELS[i - 1]}`,
      disabled: !one,
      action: () => { applyLabel([one], idx); refreshAll(); },
    });
  }
  return items;
}

function wireContext(nodeEl, node) {
  nodeEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, contextItemsFor(node));
  });
  /* Control-click on any one-button mouse. */
  nodeEl.addEventListener('pointerdown', (e) => {
    if (e.ctrlKey && e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      showContextMenu(e.clientX, e.clientY, contextItemsFor(node));
    }
  });
}

function folderAt(clientX, clientY) {
  const target = document.elementFromPoint(clientX, clientY);
  if (!target) return { kind: 'none' };
  const dicon = target.closest('.dicon');
  if (dicon) return { kind: 'desktop-icon', id: dicon.dataset.id, el: dicon };
  const winEl = target.closest('.win');
  if (winEl) {
    const hit = [...finder.windows.values()].find((w) => w.el === winEl);
    if (hit) {
      const iconEl = target.closest('.icon');
      if (iconEl) return { kind: 'icon', node: FS.findById(iconEl.dataset.id), win: hit };
      return { kind: 'window', win: hit, node: hit.finderNode };
    }
  }
  const desktop = target.closest('#desktop');
  if (desktop) return { kind: 'desktop' };
  return { kind: 'none' };
}

function handleDrop(node, win, p, ev) {
  const hit = folderAt(ev.clientX, ev.clientY);
  let targetNode = null;

  if (hit.kind === 'desktop-icon') {
    targetNode = FS.findById(hit.id);
  } else if (hit.kind === 'icon' && hit.node) {
    targetNode = hit.node.kind === 'trash' || hit.node.kind === 'folder' || hit.node.kind === 'disk' ? hit.node : null;
  } else if (hit.kind === 'window' && hit.node) {
    targetNode = hit.node;
  } else if (hit.kind === 'desktop') {
    // free positioning on the desktop
    if (!win) {
      const x = clamp(Math.round(p.x - 39), 0, SCREEN_W - 78);
      const y = clamp(Math.round(p.y - 18), 0, DESK_H - 66);
      finder.positions[node.id] = { x, y };
      try { localStorage.setItem(POS_KEY, JSON.stringify(finder.positions)); } catch (e) { /* ignore */ }
      const elNode = finder.deskIcons.get(node.id);
      if (elNode) { elNode.style.left = `${x}px`; elNode.style.top = `${y}px`; }
      return;
    }
    return;
  }

  if (!targetNode) return;
  if (targetNode.id === node.id) return;

  if (targetNode.kind === 'trash') {
    if (node.kind === 'disk') {
      // new in Finder 4.1: a disk dragged to the Trash is ejected
      ejectDisk(node);
      return;
    }
    if (FS.trashNode(node)) { diskEject(); refreshAll(); }
    return;
  }

  if (targetNode.kind === 'folder' || targetNode.kind === 'disk') {
    if (FS.moveNode(node, targetNode)) { diskInsert(); refreshAll(); }
    return;
  }

  // dropped on a document or application → nothing happens
}

/* ----------------------------------------------------------------- opening -- */

export function openNode(node) {
  if (!node) return;
  if (node.kind === 'alias') {
    const t = FS.resolveAlias(node);
    if (t && t !== node) { openNode(t); return; }
  }
  if (node.kind === 'folder' || node.kind === 'disk' || node.kind === 'trash') {
    openContainer(node);
  } else if (node.kind === 'app') {
    if (node.app === 'finder') openContainer(FS.systemDisk());
    else finder.ctx.launch(node.app, { fromNode: node });
  } else {
    finder.ctx.launch(node.app || 'macwrite', { file: node });
  }
}

export function openContainer(node) {
  const existing = finder.windows.get(node.id);
  if (existing) {
    focusWindow(existing);
    refreshWindow(existing);
    return existing;
  }
  const isDisk = node.kind === 'disk';
  const isTrash = node.kind === 'trash';
  // an 800K disk holds a lot more than a 400K one did, and HFS nests folders
  const w = isDisk ? 392 : isTrash ? 300 : 336;
  const h = isDisk ? 248 : isTrash ? 196 : 208;

  const win = createWindow({
    title: node.name,
    w, h,
    app: 'finder',
    resizable: true,
    menus: () => menusFor(finder.ctx),
    onClose: () => {
      const had = node.children && node.children.length;
      const wasTrash = isTrash;
      finder.windows.delete(node.id);
      if (wasTrash && had === 0) beep();
    },
  });
  win.finderNode = node;
  win.sel = [];
  win.el.dataset.finder = node.id;

  const sc = scroller(win, { v: true, h: false, always: true, bottom: 16 });
  win.sc = sc;
  const status = el('div', { class: 'fstatus' });
  win.body.append(status);
  win.statusEl = status;
  const grid = el('div', { class: 'fgrid' });
  sc.view.append(grid);
  win.grid = grid;

  grid.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.icon')) return;
    selectIn(win, []);
  });

  finder.windows.set(node.id, win);
  renderWindow(win);
  return win;
}

function renderWindow(win) {
  const node = win.finderNode;
  win.setTitle(node.name);
  const grid = win.grid;
  grid.innerHTML = '';
  const items = FS.sortItems(node.children || [], finder.sortMode);
  const list = finder.sortMode !== 'icon';
  grid.classList.toggle('list', list);

  if (!items.length) {
    const msg = el('div', {
      class: 'pad',
      style: { fontSize: '12px', lineHeight: '14px', opacity: '.75' },
      text: node.kind === 'trash' ? 'The Trash is empty.' : 'This folder is empty.',
    });
    grid.append(msg);
  }

  for (const item of items) {
    const icon = el('div', { class: 'icon', 'data-id': item.id });
    const plate = el('div', { class: 'plate' }, item.kind === 'trash' ? iconImg('trashFull') : nodeIcon(item));
    const label = el('span', { class: 'lbl' + (item.label != null ? ` l${item.label}` : ''), text: item.name });
    icon.append(plate, label);
    if (list) {
      const sz = FS.sizeOf(item);
      const label2 = item.children ? '--' : sz >= 1024 ? `${Math.round(sz / 1024)}K` : `${sz}B`;
      icon.append(el('span', { class: 'col-size', text: label2 }));
    }
    if (win.sel.some((n) => n.id === item.id)) icon.classList.add('sel');
    wireSelection(icon, item, () => win.sel, (next) => selectIn(win, next), () => openNode(item));
    wireDrag(icon, item, win);
    wireContext(icon, item);
    grid.append(icon);
  }
  renderStatus(win);
  if (win.sc) win.sc.update();
  updateTrashIcon();
}

/* Finder 5.1's status strip: "12 items · 512K in disk · 288K available" */
function renderStatus(win) {
  if (!win.statusEl) return;
  const node = win.finderNode;
  const items = (node.children || []).length;
  const sel = win.sel && win.sel.length;
  if (node.kind === 'trash') {
    win.statusEl.textContent = items ? `${items} item${items === 1 ? '' : 's'} in the Trash` : 'The Trash is empty';
    return;
  }
  if (node.kind === 'disk') {
    const used = FS.usedBytes(node);
    win.statusEl.textContent =
      `${items} item${items === 1 ? '' : 's'} · ${bytes(used)} in disk · ${bytes(FS.freeBytes(node))} available`
      + (sel ? ` · ${sel} selected` : '');
    return;
  }
  win.statusEl.textContent = `${items} item${items === 1 ? '' : 's'}`
    + (sel ? ` · ${sel} selected` : '');
}

function selectIn(win, nodes) {
  win.sel = nodes;
  win.grid.querySelectorAll('.icon').forEach((n) => {
    n.classList.toggle('sel', nodes.some((x) => x.id === n.dataset.id));
  });
  renderStatus(win);
  if (activeWindow() === win) setMenus(win.getMenus());
}

export function refreshAll() {
  renderDesktop();
  for (const win of finder.windows.values()) renderWindow(win);
  updateTrashIcon();
  const act = activeFinderWin();
  setMenus(act ? act.getMenus() : menusFor(finder.ctx));
}

function refreshWindow(win) { renderWindow(win); }

function updateTrashIcon() {
  const node = finder.deskIcons.get('trash');
  if (!node) return;
  const n = FS.fs.trash ? FS.fs.trash.children.length : 0;
  const img = node.querySelector('img');
  // new in 3.0: the Trash bulges once it holds anything at all
  if (img) img.src = iconURL(n > 0 ? 'trashFull' : 'trash');
  node.classList.toggle('bulge', n > 0);
}

/* --------------------------------------------------------------- selection -- */

function activeFinderWin() {
  const win = activeWindow();
  return win && win.app === 'finder' ? win : null;
}

function currentSelection() {
  const win = activeFinderWin();
  if (win) return win.sel || [];
  return finder.deskSel || [];
}

function currentContainer() {
  const win = activeFinderWin();
  if (win) return win.finderNode;
  return null;
}

/* ------------------------------------------------------------------- menus -- */

finder.menus = function menus() {
  const ctx = finder.ctx;
  const sel = currentSelection();
  const container = currentContainer();
  const one = sel.length === 1 ? sel[0] : null;
  const canTrash = sel.length > 0 && sel.every((n) => n.kind !== 'disk') && container && container.kind !== 'trash';

  return [
    {
      title: 'File',
      items: [
        { label: 'New Folder', key: 'N', disabled: !container, action: () => newFolder(container) },
        { label: 'Open', key: 'O', disabled: !one, action: () => openNode(one) },
        { sep: true },
        { label: 'Close', key: 'W', disabled: !activeFinderWin(), action: () => activeFinderWin()?.close() },
        { label: 'Get Info', key: 'I', disabled: !one, action: () => getInfo(one) },
        { label: 'Rename…', disabled: !one || one.kind === 'disk', action: () => renameNode(one) },
        { label: 'Duplicate', key: 'D', disabled: !one || !!one.children, action: () => { FS.duplicate(one); refreshAll(); } },
        { label: 'Make Alias', disabled: !one || one.kind === 'alias', action: () => { FS.makeAlias(one, FS.parentOf(one) || { children: FS.fs.roots }); refreshAll(); } },
        { label: 'Find…', key: 'F', action: () => findFile() },
        { sep: true },
        { label: 'Print Catalog…', key: 'P', disabled: !container, action: () => printCatalog(container) },
        { sep: true },
        { label: 'Move to Trash', disabled: !canTrash, action: () => moveSelectionToTrash(sel) },
        { label: 'Put Away', disabled: !(one && one.kind === 'disk'), action: () => ejectDisk(one) },
      ],
    },
    {
      title: 'Edit',
      items: [
        { label: 'Undo', key: 'Z', disabled: true, action: () => {} },
        { sep: true },
        { label: 'Cut', key: 'X', disabled: !sel.length, action: () => copySel(sel, true) },
        { label: 'Copy', key: 'C', disabled: !sel.length, action: () => copySel(sel, false) },
        { label: 'Paste', key: 'V', disabled: !finder.clipboard || !container, action: () => pasteInto(container) },
        { label: 'Clear', disabled: !canTrash, action: () => moveSelectionToTrash(sel) },
        { sep: true },
        { label: 'Select All', key: 'A', disabled: !container, action: () => selectAll(container) },
      ],
    },
    {
      title: 'View',
      items: [
        ...FS.SORTS.map((s) => ({
          label: s.name,
          checked: finder.sortMode === s.id,
          action: () => { finder.sortMode = s.id; refreshAll(); setMenus(menusFor(ctx)); },
        })),
        { sep: true },
        { label: 'Launcher', key: 'L', action: () => ctx.launch('launcher') },
        { sep: true },
        { label: 'Insert Disk File…', key: 'M', action: () => mountDiskFile() },
      ],
    },
    {
      title: 'Label',
      items: [
        ...LABELS.map((name, i) => ({
          label: name,
          checked: !!one && one.label === i,
          disabled: !sel.length,
          action: () => applyLabel(sel, i),
        })),
        { sep: true },
        { label: 'None', checked: !!one && one.label == null, disabled: !sel.length, action: () => applyLabel(sel, null) },
      ],
    },
    {
      title: 'Special',
      items: [
        { label: 'Clean Up', disabled: !container, action: () => refreshAll() },
        { label: 'Empty Trash…', disabled: !(FS.fs.trash && FS.fs.trash.children.length), action: () => emptyTrash() },
        { sep: true },
        { label: 'Erase Disk…', disabled: !(one && one.kind === 'disk'), action: () => eraseDisk(one) },
        // MiniFinder is gone in 3.0: the Plus has the memory for the whole Finder
        { sep: true },
        { label: 'Restart…', action: () => ctx.restart() },
        { label: 'Shut Down…', action: () => ctx.shutdown() },
      ],
    },
    {
      title: 'Help',
      items: [
        { label: 'Show Balloons', checked: !!ctx.prefs.balloons, disabled: !!ctx.prefs.balloons, action: () => setBalloons(true) },
        { label: 'Hide Balloons', checked: !ctx.prefs.balloons, disabled: !ctx.prefs.balloons, action: () => setBalloons(false) },
        { sep: true },
        { label: 'About Balloon Help…', action: () => alert({ title: 'Balloon Help', message: 'Balloon Help explains the screen as you point at it.\nEvery icon, button and menu item can speak up.', buttons: ['OK'] }) },
      ],
    },
  ];
};

/* ------------------------------------------------------ labels (7.0) ----- */

const LABELS = ['Essential', 'Hot', 'In Progress', 'Cool', 'Personal', 'Project 1', 'Project 2'];

export function applyLabel(sel, idx) {
  for (const n of sel) {
    n.label = idx;
    FS.changed();
  }
  refreshAll();
  setMenus(menusFor(finder.ctx));
}

/* ------------------------------------------------- balloon help (7.0) ---- */

let balloonEl = null;

export function setBalloons(on) {
  const prefs = finder.ctx && finder.ctx.prefs;
  if (prefs) {
    prefs.balloons = !!on;
    if (finder.ctx.savePrefs) finder.ctx.savePrefs();
  }
  if (!on && balloonEl) balloonEl.remove();
  setMenus(menusFor(finder.ctx));
}

function showBalloon(target, text) {
  if (!balloonEl) {
    balloonEl = el('div', { class: 'balloon', id: 'balloon' });
  }
  balloonEl.textContent = text;
  const host = document.getElementById('windows') || document.body;
  host.append(balloonEl);
  const r = target.getBoundingClientRect();
  const hr = host.getBoundingClientRect();
  const s = window.__macScale || 1;
  balloonEl.style.left = `${Math.round((r.left - hr.left) / s)}px`;
  balloonEl.style.top = `${Math.round((r.bottom - hr.top) / s + 4)}px`;
}

export function hideBalloon() {
  if (balloonEl) balloonEl.remove();
}

/* Point at a desktop icon and, with balloons on, it talks back. */
function wireBalloons() {
  const over = (e) => {
    const prefs = finder.ctx && finder.ctx.prefs;
    if (!prefs || !prefs.balloons) { hideBalloon(); return; }
    const dicon = e.target.closest && e.target.closest('.dicon');
    if (dicon) {
      const node = FS.findById(dicon.dataset.id) || (FS.fs.trash && dicon.dataset.id === 'trash' ? FS.fs.trash : null);
      const texts = {
        trash: 'The Trash. Put things here to throw them away.\nThe Trash is a folder now — it remembers.',
        'launcher-icon': 'Launcher — open any application.',
      };
      const t = texts[dicon.dataset.id] ||
        (node && `${node.name}. ${node.kind === 'disk' ? 'A disk.' : node.kind === 'alias' ? 'An alias — double-click to open the original.' : 'Double-click to open.'}`);
      showBalloon(dicon, t || 'Macintosh');
      return;
    }
    hideBalloon();
  };
  document.addEventListener('pointerover', over);
  document.addEventListener('mouseover', over);
  document.addEventListener('pointerdown', () => hideBalloon(), true);
}

/* ------------------------------------------------------- find (7.0) ------ */

export async function findFile() {
  const q = (await prompt({ title: 'Find File', message: 'Find all files and folders named:', ok: 'Find', icon: null })) || '';
  const term = q.trim().toLowerCase();
  if (!term) return;
  const hits = [];
  const walk = (n) => {
    if (n.name && n.name.toLowerCase().includes(term)) hits.push(n);
    (n.children || []).forEach(walk);
  };
  FS.fs.roots.forEach(walk);
  if (FS.fs.trash) walk(FS.fs.trash);
  const win = createWindow({ title: `Find “${q.trim()}”`, w: 300, h: 180, app: 'findfile' });
  win.menus = () => utilityMenus(finder.ctx, win);
  win.refreshMenus();
  const list = el('div', { class: 'pad', style: { fontSize: '12px', lineHeight: '16px' } });
  if (!hits.length) {
    list.append(el('div', { text: 'No items found.' }));
  } else {
    list.append(el('div', { style: { opacity: '.7', marginBottom: '4px' }, text: `${hits.length} item${hits.length === 1 ? '' : 's'} found:` }));
    for (const n of hits.slice(0, 24)) {
      const row = el('div', { style: { display: 'flex', gap: '6px', alignItems: 'center', cursor: 'default' } },
        nodeIcon(n), el('span', { text: n.name }));
      row.addEventListener('dblclick', () => openNode(n));
      list.append(row);
    }
  }
  win.body.append(list);
}

/* --------------------------------------------------- print catalog (4.1) -- */

/* Print Catalog printed a listing of a disk or folder to the default printer.
   Here the "printer" is a preview sheet: choose Print and it beeps and closes,
   with a line saying which printer it went to. */
export async function printCatalog(container) {
  if (!container) return;
  const entries = container.children || [];
  const printer = (finder.ctx.prefs.printer === 'laserwriter' ? 'LaserWriter' : 'ImageWriter');
  const port = finder.ctx.prefs.printerPort || 'Printer';

  const lines = [];
  lines.push(`${container.name} — Catalog`);
  lines.push(`${entries.length} item${entries.length === 1 ? '' : 's'} · ${bytes(FS.freeBytes(container))} free`);
  lines.push('');
  const walk = (nodes, depth) => {
    for (const n of nodes) {
      const pad = '  '.repeat(depth);
      const size = FS.sizeOf(n);
      lines.push(`${pad}${n.name}${n.children ? '/' : ''}`.padEnd(26 + depth * 2, '.')
        + ` ${bytes(size).padStart(7)}`);
      if (n.children && n.children.length && depth < 2) walk(n.children, depth + 1);
    }
  };
  walk(entries, 0);

  const r = await dialog({
    title: 'Print Catalog',
    icon: 'printer',
    message: `Print a listing of “${container.name}” on the ${printer}\n(${port} port)?`,
    buttons: ['Print', 'Cancel'],
    defaultButton: 0,
    width: 440,
    detail: lines.join('\n'),
  });
  if (r.index !== 0) return;
  beep(0.06);
  diskInsert();
}

/* ------------------------------------------------------------ file actions -- */

export async function newFolder(container) {
  if (!container) return;
  const name = await prompt({
    title: 'New Folder',
    message: 'Name of new folder:',
    value: FS.uniqueName(container, 'untitled folder'),
    icon: null,
  });
  if (name === null) return;
  const clean = name.trim() || 'untitled folder';
  FS.createFolder(container, clean);
  refreshAll();
}

export async function renameNode(node) {
  if (!node) return;
  const name = await prompt({ title: 'Rename', message: `New name for “${node.name}”:`, value: node.name, icon: null });
  if (name === null) return;
  const parent = FS.parentOf(node) || FS.fs.trash;
  const trimmed = name.trim();
  if (!trimmed) return;
  node.name = trimmed;
  if (parent) node.name = FS.uniqueName(parent, trimmed);
  node.modified = Date.now();
  FS.changed();
  refreshAll();
}

export function moveSelectionToTrash(sel) {
  let moved = 0;
  for (const node of sel) {
    if (node.kind === 'disk') continue;
    if (FS.trashNode(node)) moved++;
  }
  if (moved) diskEject();
  refreshAll();
  const win = activeFinderWin();
  if (win) selectIn(win, []);
}

function copySel(sel, cut) {
  finder.clipboard = { cut, nodes: sel.map((n) => n) };
}

function pasteInto(container) {
  if (!finder.clipboard) return;
  for (const node of finder.clipboard.nodes) {
    if (finder.clipboard.cut) FS.moveNode(node, container);
    else {
      const copy = FS.duplicate(node);
      if (copy) FS.moveNode(copy, container);
    }
  }
  if (finder.clipboard.cut) finder.clipboard = null;
  refreshAll();
}

function selectAll(container) {
  const win = activeFinderWin();
  if (!win || !container) return;
  selectIn(win, FS.sortItems(container.children || [], finder.sortMode));
}

async function emptyTrash() {
  const n = FS.fs.trash.children.length;
  if (!n) return;
  const ok = await confirm({
    title: 'Empty Trash',
    icon: 'caution',
    message: `Are you sure you want to permanently remove the ${n} item${n === 1 ? '' : 's'} in the Trash?\n\nThis cannot be undone.`,
    ok: 'Empty',
    defaultButton: 1,
  });
  if (!ok) return;
  FS.emptyTrash();
  diskEject();
  refreshAll();
}

async function eraseDisk(node) {
  const target = node || FS.systemDisk();
  if (target === FS.systemDisk()) {
    const ok = await confirm({
      title: 'Erase Disk',
      icon: 'caution',
      message: 'Erase the System Disk and restore it to its original\ncontents? All documents you created will be lost.',
      ok: 'Erase',
      defaultButton: 1,
    });
    if (!ok) return;
    FS.reloadDefaults();
    finder.positions = {};
    try { localStorage.removeItem(POS_KEY); } catch (e) { /* ignore */ }
    refreshAll();
    setMenus(menusFor(finder.ctx));
    return;
  }
  const ok = await confirm({
    title: 'Erase Disk',
    icon: 'caution',
    message: `Erase “${target.name}”? Everything on the disk will be lost.`,
    ok: 'Erase',
    defaultButton: 1,
  });
  if (!ok) return;
  FS.removeNode(target);
  finder.ejected.delete(target.id);
  refreshAll();
}

/* Insert Disk File (3.0): mount a small disk kept as a document. The clone
   has no real disk images, so this makes an empty 800K disk instead, which is
   what Insert Disk File was for — bringing a volume online from a file. */
async function mountDiskFile() {
  const name = await prompt({
    title: 'Insert Disk File',
    message: 'Name for the new 800K disk:',
    value: FS.uniqueName({ children: FS.fs.roots }, 'untitled disk'),
    ok: 'Insert',
    icon: null,
  });
  if (name === null) return;
  const disk = FS.addNode({ children: FS.fs.roots }, {
    name: name.trim() || 'untitled disk',
    kind: 'disk',
    icon: 'floppy',
    bytes: FS.FLOPPY_800K,
  });
  // addNode pushed it straight into the roots array
  disk.children = [];
  insertDisk(disk);          // clears ejected state, plays the insert sound
  refreshAll();
}

/* ---------------------------------------------------------------- get info -- */

export function getInfo(node) {
  if (!node) return;
  const win = createWindow({
    title: `${node.name} Info`,
    w: 268, h: 196, resizable: false,
    app: 'getinfo',
    onClose: () => {},
  });
  win.menus = () => utilityMenus(finder.ctx, win);
  win.refreshMenus();
  const box = el('div', { class: 'getinfo' });
  box.append(el('div', { class: 'top' },
    nodeIcon(node),
    el('div', {},
      el('div', { text: node.name }),
      el('div', { style: { opacity: '.7' }, text: FS.kindLabel(node) }),
    ),
  ));
  const kv = (k, v) => el('div', { class: 'kv' }, el('span', { class: 'k', text: k }), el('span', { class: 'v', text: v }));
  box.append(
    el('div', { class: 'hr' }),
    kv('Size:', node.kind === 'disk' ? `${bytes(FS.volumeBytes(node))} disk` : bytes(FS.sizeOf(node))),
    kv('Where:', FS.parentOf(node)?.name || 'Desktop'),
    ...(node.kind === 'alias' ? [kv('Original:', (FS.resolveAlias(node) || {}).name || 'missing')] : []),
    kv('Created:', fmtDate(node.created || Date.now())),
    kv('Modified:', fmtDate(node.modified || Date.now())),
    kv('Locked:', node.locked ? 'Yes' : 'No'),
    el('div', { class: 'hr' }),
    el('div', {
      style: { opacity: '.7' },
      text: node.kind === 'disk'
        ? `${bytes(FS.volumeBytes(node))} disk · ${bytes(FS.usedBytes(node))} in use · ${bytes(FS.freeBytes(node))} available.`
        : node.children
          ? `${(node.children || []).length} item${(node.children || []).length === 1 ? '' : 's'} · ${bytes(FS.sizeOf(node))} total.`
          : 'Click the close box when finished.',
    }),
  );
  win.body.append(box);
  return win;
}

// convenience accessors used by other apps / the console
finder.systemDisk = () => FS.systemDisk();
finder.documents = () => FS.documentsFolder();
finder.openContainer = openContainer;
finder.openNode = openNode;
finder.refreshAll = refreshAll;
finder.getInfo = getInfo;
finder.ejectDisk = ejectDisk;
finder.insertDisk = insertDisk;
finder.isEjected = isEjected;
finder.printCatalog = printCatalog;
finder.mountDiskFile = mountDiskFile;
finder.setBalloons = setBalloons;
finder.applyLabel = applyLabel;
finder.findFile = findFile;
finder.makeAlias = (node) => { FS.makeAlias(node, FS.parentOf(node) || { children: FS.fs.roots }); refreshAll(); };
finder.renderDesktop = renderDesktop;

export default finder;
export { finder };
