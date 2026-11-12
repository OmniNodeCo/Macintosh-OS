/* Small DOM / formatting helpers shared by the whole system. */

export function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(9)) {
    if (kid === null || kid === undefined || kid === false) continue;
    node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return node;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

export function on(target, type, fn, opts) {
  target.addEventListener(type, fn, opts);
  return () => target.removeEventListener(type, fn, opts);
}

export function uid(prefix = 'n') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

/** "Tue, Nov 11, 1984" style dates, but rendered with the bitmap face. */
export function fmtDate(d) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dt = new Date(d);
  return `${days[dt.getDay()]}, ${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

export function fmtTime(d) {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${m} ${ap}`;
}

export function bytes(n) {
  if (n < 1024) return `${n} bytes`;
  return `${Math.round(n / 1024)}K`;
}

/** Trap pointer events so a drag keeps working outside the element. */
export function dragSession(e, { move, up } = {}) {
  e.preventDefault();
  e.stopPropagation();
  const startX = e.clientX, startY = e.clientY;
  let started = false;
  const scale = () => (window.__macScale || 1);
  const mv = (ev) => {
    const dx = (ev.clientX - startX) / scale();
    const dy = (ev.clientY - startY) / scale();
    if (!started && Math.abs(dx) + Math.abs(dy) < 2) return;
    started = true;
    move && move(dx, dy, ev);
  };
  const upFn = (ev) => {
    window.removeEventListener('pointermove', mv);
    window.removeEventListener('pointerup', upFn);
    window.removeEventListener('pointercancel', upFn);
    up && up((ev.clientX - startX) / scale(), (ev.clientY - startY) / scale(), ev, started);
  };
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', upFn);
  window.addEventListener('pointercancel', upFn);
}
