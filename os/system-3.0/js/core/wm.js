/* ============================================================================
   Window manager: movable/resizable 1-bit windows, Mac scroll bars, modal
   alert boxes and the focus/menu-bar wiring.
   ========================================================================== */

import { el, dragSession, clamp, $ } from './ui.js';
import { iconImg, iconURL } from './icons.js';
import { setMenus, bindActiveWindow, closeMenu, handleShortcut } from './menu.js';
import { click, beep } from './sound.js';

export const SCREEN_W = 512;
export const SCREEN_H = 342;
export const MENUBAR_H = 20;
export const DESK_H = SCREEN_H - MENUBAR_H;

const state = {
  wins: [],
  z: 10,
  active: null,
  cascade: 0,
  layer: null,
  dialogs: null,
  defaults: () => [],
};

export function initWM({ layer, dialogs }) {
  state.layer = layer;
  state.dialogs = dialogs;
  bindActiveWindow(() => state.active);
}

export function activeWindow() { return state.active; }
export function allWindows() { return state.wins.slice(); }
export function setDefaultMenusProvider(fn) {
  state.defaults = fn;
  if (!state.active) setMenus(fn());
}
export const defaultMenus = () => state.defaults();

/* ------------------------------------------------------------------ window -- */

export function createWindow(opts = {}) {
  const {
    title = 'Untitled', w = 320, h = 200, x, y,
    resizable = true, menus = null, app = null, icon = null,
    minW = 140, minH = 70, onClose = null, onFocus = null,
    statusText = null,
  } = opts;

  const node = el('div', { class: 'win active' });
  const bar = el('div', { class: 'titlebar' });
  const closebox = el('div', { class: 'closebox', title: 'Close' });
  const titleEl = el('span', { class: 'title', text: title });
  // System 3.0's own addition to the title bar: the zoom box, top right.
  const zoombox = el('div', { class: 'zoombox', title: 'Zoom' });
  bar.append(closebox, titleEl, zoombox);

  const body = el('div', { class: 'win-body' });
  node.append(bar, body);

  if (resizable) node.append(el('div', { class: 'sizebox' }));

  const win = {
    el: node, bar, body, titleEl, app, opts,
    menus: typeof menus === 'function' ? menus : () => menus || state.defaults(),
    getMenus() { return this.menus() || state.defaults(); },
    setTitle(t) { titleEl.textContent = t; this.titleText = t; },
    titleText: title,
    resizeTo(nw, nh) {
      nw = clamp(Math.round(nw), minW, SCREEN_W);
      nh = clamp(Math.round(nh), minH, DESK_H);
      node.style.width = `${nw}px`;
      node.style.height = `${nh}px`;
      this.onResize && this.onResize(nw, nh);
    },
    zoom: () => toggleZoom(),
    close(silent = false) {
      if (this.onClose && !silent) {
        try {
          if (this.onClose() === false) return;
        } catch (err) { console.error(err); }
      }
      node.remove();
      const i = state.wins.indexOf(this);
      if (i >= 0) state.wins.splice(i, 1);
      if (state.active === this) {
        const next = state.wins[state.wins.length - 1] || null;
        focusWindow(next);
      }
      this.onDestroy && this.onDestroy();
    },
    focus() { focusWindow(this); },
    refreshMenus() { if (state.active === this) setMenus(this.getMenus()); },
  };
  win.onResize = null;

  const nw = Math.round(clamp(w, minW, SCREEN_W));
  const nh = Math.round(clamp(h, minH, DESK_H));
  node.style.width = `${nw}px`;
  node.style.height = `${nh}px`;

  let nx, ny;
  if (x === undefined || y === undefined) {
    const n = state.cascade++ % 5;
    nx = 34 + n * 17;
    ny = 20 + n * 15;
  } else {
    nx = x; ny = y;
  }
  // new windows always open fully on screen (they can be dragged off later)
  node.style.left = `${Math.round(clamp(nx, 0, Math.max(0, SCREEN_W - nw)))}px`;
  node.style.top = `${Math.round(clamp(ny, 0, Math.max(0, DESK_H - nh)))}px`;

  state.layer.append(node);
  state.wins.push(win);

  // --- focus on any press inside -------------------------------------------
  node.addEventListener('pointerdown', () => focusWindow(win), true);

  // --- close box ------------------------------------------------------------
  closebox.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closebox.style.background = '#000';
  });
  closebox.addEventListener('click', (e) => {
    e.stopPropagation();
    win.close();
  });

  // --- drag by title bar ----------------------------------------------------
  let zoomed = null;
  bar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.closebox') || e.target.closest('.zoombox')) return;
    focusWindow(win);
    const left0 = node.offsetLeft, top0 = node.offsetTop;
    dragSession(e, {
      move(dx, dy) {
        const nl = clamp(left0 + dx, 60 - node.offsetWidth, SCREEN_W - 70);
        const nt = clamp(top0 + dy, 0, DESK_H - 21);
        node.style.left = `${nl}px`;
        node.style.top = `${nt}px`;
      },
    });
  });
  function toggleZoom() {
    if (zoomed) {
      node.style.left = zoomed.left; node.style.top = zoomed.top;
      win.resizeTo(zoomed.w, zoomed.h);
      zoomed = null;
    } else {
      zoomed = { left: node.style.left, top: node.style.top, w: node.offsetWidth, h: node.offsetHeight };
      node.style.left = '0px'; node.style.top = '0px';
      win.resizeTo(SCREEN_W, DESK_H);
    }
  }

  // the zoom box: a single click, exactly as in Finder 5.1
  zoombox.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    beep(0.03);
    toggleZoom();
  });

  bar.addEventListener('dblclick', (e) => {
    if (e.target.closest('.closebox')) return;
    if (zoomed) {
      node.style.left = zoomed.left; node.style.top = zoomed.top;
      win.resizeTo(zoomed.w, zoomed.h);
      zoomed = null;
    } else {
      zoomed = { left: node.style.left, top: node.style.top, w: node.offsetWidth, h: node.offsetHeight };
      node.style.left = '0px'; node.style.top = '0px';
      win.resizeTo(SCREEN_W, DESK_H);
    }
  });

  // --- resize ---------------------------------------------------------------
  const sizebox = node.querySelector('.sizebox');
  if (sizebox) {
    sizebox.addEventListener('pointerdown', (e) => {
      focusWindow(win);
      const w0 = node.offsetWidth, h0 = node.offsetHeight;
      dragSession(e, {
        move(dx, dy) { win.resizeTo(w0 + dx, h0 + dy); },
      });
    });
  }

  focusWindow(win);
  return win;
}

export function focusWindow(win) {
  state.active = win;
  for (const w of state.wins) w.el.classList.toggle('active', w === win);
  // clicking another window takes the insertion point away from a text field
  const focused = document.activeElement;
  if (focused && focused !== document.body && !(win && win.el.contains(focused))) {
    if (focused.matches('input, textarea, [contenteditable]')) focused.blur();
  }
  if (!win) {
    setMenus(state.defaults());
    return;
  }
  win.el.style.zIndex = ++state.z;
  // give the window itself the keyboard unless something inside it already has it
  if (win.el.tabIndex >= 0 && !win.el.contains(document.activeElement)) {
    try { win.el.focus({ preventScroll: true }); } catch (err) { /* ignore */ }
  }
  setMenus(win.getMenus());
  if (win.onFocus) { try { win.onFocus(); } catch (err) { console.error(err); } }
}

export function closeAll() {
  for (const w of state.wins.slice()) w.close(true);
  state.active = null;
}

/* ------------------------------------------------------------------- menus -- */

export function installKeyboard() {
  window.addEventListener('keydown', (e) => {
    if (handleShortcut(e)) return;
  });
}

/* ---------------------------------------------------------------- scrolling -- */

/**
 * Build a Mac-style scroll area inside a window body.
 * opts: { v, h, always }
 */
export function scroller(win, opts = {}) {
  const { v = true, h = false, always = false, top = 0, bottom = 0 } = opts;
  const area = el('div', { class: 'scrollarea' + (v ? ' v' : '') + (h ? ' h' : '') });
  if (top) area.style.top = `${top}px`;
  if (bottom) area.style.bottom = `${bottom}px`;
  const view = el('div', { class: 'view' });
  area.append(view);
  win.body.append(area);

  let vbar = null, hbar = null;
  if (v) {
    vbar = el('div', { class: 'scrollv' });
    vbar.innerHTML = `
      <div class="arrow up"><i></i></div>
      <div class="arrow down"><i></i></div>`;
    const thumb = el('div', { class: 'thumb' });
    vbar.append(thumb);
    vbar.arrowUp = vbar.querySelector('.arrow.up');
    vbar.arrowDown = vbar.querySelector('.arrow.down');
    vbar.thumb = thumb;
    win.body.append(vbar);
  }
  if (h) {
    hbar = el('div', { class: 'scrollh' });
    hbar.innerHTML = `
      <div class="arrow left"><i></i></div>
      <div class="arrow right"><i></i></div>`;
    const thumb = el('div', { class: 'thumb' });
    hbar.append(thumb);
    hbar.arrowLeft = hbar.querySelector('.arrow.left');
    hbar.arrowRight = hbar.querySelector('.arrow.right');
    hbar.thumb = thumb;
    win.body.append(hbar);
  }

  const setClass = () => {
    area.classList.toggle('v', v && (always || view.scrollHeight > view.clientHeight + 1));
    area.classList.toggle('h', h && (always || view.scrollWidth > view.clientWidth + 1));
    if (vbar) vbar.classList.toggle('hidden', !area.classList.contains('v'));
    if (hbar) hbar.classList.toggle('hidden', !area.classList.contains('h'));
  };

  function update() {
    setClass();
    if (vbar && !vbar.classList.contains('hidden')) {
      const track = vbar.clientHeight - 30;
      const sh = Math.max(1, view.scrollHeight);
      const ch = view.clientHeight;
      const thumbLen = clamp(Math.round(track * (ch / sh)), 16, Math.max(16, track));
      vbar.thumb.style.height = `${thumbLen}px`;
      const maxScroll = Math.max(1, sh - ch);
      const pos = (view.scrollTop / maxScroll) * Math.max(0, track - thumbLen);
      vbar.thumb.style.top = `${16 + pos}px`;
    }
    if (hbar && !hbar.classList.contains('hidden')) {
      const track = hbar.clientWidth - 30;
      const sw = Math.max(1, view.scrollWidth);
      const cw = view.clientWidth;
      const thumbLen = clamp(Math.round(track * (cw / sw)), 16, Math.max(16, track));
      hbar.thumb.style.width = `${thumbLen}px`;
      const maxScroll = Math.max(1, sw - cw);
      const pos = (view.scrollLeft / maxScroll) * Math.max(0, track - thumbLen);
      hbar.thumb.style.left = `${16 + pos}px`;
    }
  }

  const schedule = () => requestAnimationFrame(update);

  function holdScroll(fn) {
    let timer = null;
    return {
      start(e) {
        e.preventDefault();
        fn();
        timer = setInterval(fn, 90);
        const stop = () => { clearInterval(timer); window.removeEventListener('pointerup', stop); };
        window.addEventListener('pointerup', stop);
      },
    };
  }

  if (vbar) {
    vbar.arrowUp.addEventListener('pointerdown', holdScroll(() => { view.scrollTop -= 16; update(); }).start);
    vbar.arrowDown.addEventListener('pointerdown', holdScroll(() => { view.scrollTop += 16; update(); }).start);
    vbar.thumb.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const startY = e.clientY, startTop = view.scrollTop;
      const track = vbar.clientHeight - 30 - vbar.thumb.offsetHeight;
      const ratio = view.scrollHeight - view.clientHeight;
      dragSession(e, {
        move(dx, dy) {
          if (track <= 0) return;
          view.scrollTop = startTop + (dy / track) * ratio;
          update();
        },
      });
    });
    vbar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.arrow') || e.target.closest('.thumb')) return;
      const y = e.clientY - vbar.getBoundingClientRect().top;
      view.scrollTop += (y < parseFloat(vbar.thumb.style.top || '0')) ? -view.clientHeight : view.clientHeight;
      update();
    });
  }
  if (hbar) {
    hbar.arrowLeft.addEventListener('pointerdown', holdScroll(() => { view.scrollLeft -= 16; update(); }).start);
    hbar.arrowRight.addEventListener('pointerdown', holdScroll(() => { view.scrollLeft += 16; update(); }).start);
    hbar.thumb.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const startTop = view.scrollLeft;
      const track = hbar.clientWidth - 30 - hbar.thumb.offsetWidth;
      const ratio = view.scrollWidth - view.clientWidth;
      dragSession(e, {
        move(dx) {
          if (track <= 0) return;
          view.scrollLeft = startTop + (dx / track) * ratio;
          update();
        },
      });
    });
  }

  view.addEventListener('scroll', update, { passive: true });
  const ro = new ResizeObserver(schedule);
  ro.observe(view);
  // content can change size without the view resizing
  const mo = new MutationObserver(schedule);
  mo.observe(view, { childList: true, subtree: true, attributes: true, characterData: true });
  schedule();
  return { area, view, update: schedule, destroy() { ro.disconnect(); mo.disconnect(); } };
}

/* ----------------------------------------------------------------- dialogs -- */

function chrome(title) {
  const bar = el('div', { class: 'titlebar' });
  const t = el('span', { class: 'title', text: title });
  bar.append(t);
  return bar;
}

export function dialog(opts = {}) {
  const {
    title = 'Alert', message = '', icon = 'caution', buttons = ['OK'],
    defaultButton = 0, cancelButton = buttons.length - 1, input = null,
    value = '', width = 300, sound = beep, html = null, detail = null,
  } = opts;

  return new Promise((resolve) => {
    closeMenu();
    if (sound) sound();
    const shield = el('div', { class: 'modal-shield' });
    const dlg = el('div', { class: 'dialog' });
    dlg.style.width = `${width}px`;
    dlg.append(chrome(title));

    const body = el('div', { class: 'win-body' });
    const row = el('div', { class: 'row', style: { gap: '10px', alignItems: 'flex-start' } });
    if (icon) row.append(iconImg(icon, 'dlg-icon'));
    const text = el('div', { class: 'dlg-text' });
    if (html) text.innerHTML = html;
    else {
      String(message).split('\n').forEach((line, i) => {
        if (i === 0) text.append(el('p', { text: line }));
        else if (line.trim() === '') text.append(el('p', { text: '\u00a0' }));
        else text.append(el('p', { text: line }));
      });
    }
    const holder = el('div', { class: 'grow' }, text);
    if (detail) holder.append(el('pre', { class: 'dlg-detail', text: detail }));
    if (input) {
      const field = el('input', { class: 'field', value, style: { width: '100%', marginTop: '8px' } });
      holder.append(field);
      dlg._field = field;
    }
    row.append(holder);
    body.append(row);
    dlg.append(body);

    const btnRow = el('div', { class: 'btns' });
    const finish = (idx) => {
      const val = dlg._field ? dlg._field.value : value;
      shield.remove(); dlg.remove();
      window.removeEventListener('keydown', onKey, true);
      setMenus(state.active ? state.active.getMenus() : state.defaults());
      resolve({ index: idx, value: val });
    };
    buttons.forEach((label, i) => {
      const b = el('button', { class: 'btn' + (i === defaultButton ? ' default' : ''), text: label });
      b.addEventListener('click', () => finish(i));
      btnRow.append(b);
      if (i === defaultButton) dlg._defaultBtn = b;
    });
    dlg.append(btnRow);

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish(cancelButton);
      } else if (e.key === 'Enter' && !e.target.matches('button')) {
        e.preventDefault();
        finish(defaultButton);
      }
    }
    window.addEventListener('keydown', onKey, true);

    state.dialogs.append(shield, dlg);
    const w = dlg.offsetWidth, h = dlg.offsetHeight;
    dlg.style.left = `${Math.round((SCREEN_W - w) / 2)}px`;
    dlg.style.top = `${Math.round(clamp((DESK_H - h) / 2, 10, DESK_H - h - 10))}px`;
    if (dlg._field) {
      dlg._field.focus();
      dlg._field.select();
    } else if (dlg._defaultBtn) {
      dlg._defaultBtn.focus();
    }
  });
}

export async function alert(opts) {
  const r = await dialog({ ...opts, buttons: opts.buttons || ['OK'], cancelButton: 0 });
  return r.index;
}

export async function confirm({ title = 'Alert', message, icon = 'caution', ok = 'OK', cancel = 'Cancel', defaultButton = 0 }) {
  const r = await dialog({ title, message, icon, buttons: [ok, cancel], defaultButton, cancelButton: 1 });
  return r.index === 0;
}

export async function prompt({ title = 'Rename', message = '', value = '', ok = 'OK', cancel = 'Cancel', icon = null, width = 300 }) {
  const r = await dialog({ title, message, icon, input: true, value, buttons: [ok, cancel], width });
  return r.index === 0 ? r.value : null;
}

/* -------------------------------------------------------------- drag ghost -- */

export function showGhost(iconName, x, y) {
  const ghost = document.getElementById('dragghost');
  if (!ghost) return null;
  ghost.innerHTML = '';
  const img = iconImg(iconName);
  ghost.append(img);
  ghost.hidden = false;
  ghost.style.left = `${x - 16}px`;
  ghost.style.top = `${y - 16}px`;
  return ghost;
}

export function moveGhost(x, y) {
  const ghost = document.getElementById('dragghost');
  if (!ghost || ghost.hidden) return;
  ghost.style.left = `${x - 16}px`;
  ghost.style.top = `${y - 16}px`;
}

export function hideGhost() {
  const ghost = document.getElementById('dragghost');
  if (ghost) ghost.hidden = true;
}
