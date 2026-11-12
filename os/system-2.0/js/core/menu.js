/* ============================================================================
   The menu bar: Apple menu + application menus, with the classic Mac
   behaviour of "click to open, drag to another title to switch".
   ========================================================================== */

import { el, $ } from './ui.js';
import { iconURL } from './icons.js';
import { click } from './sound.js';

let barEl = null;
let layerEl = null;
let defs = [];
let openIdx = -1;
let dropdown = null;
let barItems = [];
let defaultDefs = [];
let suppressClose = false;

export function initMenu({ bar, layer, defaults = [] }) {
  barEl = bar;
  layerEl = layer;
  defaultDefs = defaults;
  document.addEventListener('pointerdown', (e) => {
    if (openIdx < 0) return;
    const t = e.target;
    if (t && t.closest && (t.closest('#menubar') || t.closest('.menu'))) return;
    closeMenu();
  }, true);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openIdx >= 0) {
      e.preventDefault();
      closeMenu();
    }
  });
}

export function setDefaultMenus(fn) {
  defaultDefs = fn;
  if (!activeWindow()) setMenus(typeof fn === 'function' ? fn() : fn);
}

let activeWindowFn = () => null;
export function bindActiveWindow(fn) { activeWindowFn = fn; }
const activeWindow = () => activeWindowFn();

export function getMenus() { return defs; }

export function setMenus(next) {
  closeMenu(true);
  defs = (Array.isArray(next) ? next : []).filter(Boolean);
  renderBar();
}

function renderBar() {
  if (!barEl) return;
  barEl.innerHTML = '';
  barItems = defs.map((def, i) => {
    const item = el('div', { class: 'mb-item' + (def.apple ? ' apple' : '') });
    if (def.apple) {
      const img = el('img', { src: iconURL('apple'), alt: '' });
      item.append(img);
    } else {
      item.append(document.createTextNode(def.title));
    }
    item.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      click();
      if (openIdx === i) closeMenu();
      else openMenu(i);
    });
    item.addEventListener('pointerenter', () => {
      if (openIdx >= 0 && openIdx !== i) openMenu(i);
    });
    barEl.append(item);
    return item;
  });
}

function itemsOf(def) {
  const raw = typeof def.items === 'function' ? def.items() : def.items;
  return (raw || []).filter(Boolean);
}

function openMenu(idx) {
  if (idx < 0 || idx >= defs.length) return;
  closeDropdown();
  openIdx = idx;
  barItems.forEach((b, i) => b.classList.toggle('open', i === idx));

  const def = defs[idx];
  const items = itemsOf(def);

  const dd = el('div', { class: 'menu' });
  for (const it of items) {
    if (it.sep) {
      dd.append(el('div', { class: 'mi-sep' }));
      continue;
    }
    const row = el('div', {
      class: 'mi' + (it.disabled ? ' dis' : ''),
      role: 'menuitem',
    });
    if (it.checked) row.append(el('span', { class: 'mi-check', text: '✓' }));
    row.append(el('span', { text: it.label || '' }));
    if (it.key) row.append(el('span', { class: 'mi-key', text: `\u2318${it.key}` }));
    if (!it.disabled) {
      row.addEventListener('pointerenter', () => {
        dd.querySelectorAll('.mi.hl').forEach((n) => n.classList.remove('hl'));
        row.classList.add('hl');
      });
      row.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu(true);
        try { it.action && it.action(); } catch (err) { console.error(err); }
      });
    }
    dd.append(row);
  }

  layerEl.append(dd);
  dropdown = dd;

  const barItem = barItems[idx];
  const w = dd.offsetWidth || 150;
  let left = barItem ? barItem.offsetLeft : 8;
  const maxLeft = 512 - w - 1;
  if (left > maxLeft) left = Math.max(1, maxLeft);
  dd.style.left = `${left}px`;
  dd.style.top = '20px';
}

function closeDropdown() {
  if (dropdown) dropdown.remove();
  dropdown = null;
}

export function closeMenu(keepBar = false) {
  closeDropdown();
  if (!keepBar) {
    openIdx = -1;
    barItems.forEach((b) => b.classList.remove('open'));
  } else {
    openIdx = -1;
    barItems.forEach((b) => b.classList.remove('open'));
  }
}

export function isOpen() { return openIdx >= 0; }

/** Keyboard shortcuts displayed in the menus (⌘ + letter). */
export function handleShortcut(e) {
  if (!(e.metaKey || e.ctrlKey) || e.altKey) return false;
  const key = (e.key || '').length === 1 ? e.key.toUpperCase() : e.key;
  if (!key) return false;
  for (const def of defs) {
    for (const it of itemsOf(def)) {
      if (it && it.key && !it.sep && !it.disabled && String(it.key).toUpperCase() === key && it.action) {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        try { it.action(); } catch (err) { console.error(err); }
        return true;
      }
    }
  }
  return false;
}

export function refresh() {
  if (openIdx >= 0) {
    const idx = openIdx;
    openMenu(idx);
  } else {
    setMenus(defs);
  }
}
