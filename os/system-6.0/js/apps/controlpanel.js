/* Control Panel — System 6 style.

   The System 3–5 panel was one long list. From System 5/6 the Control Panel is
   a strip of device icons along the top (each one a "cdev": Keyboard, Mouse,
   Sound, Memory, Startup Disk, …) with one pane of settings below. Click an
   icon to switch panes. Everything is saved with the system preferences. */

import { el, clamp } from '../core/ui.js';
import { DESKTOP_PATTERNS, patternStyle, applyPattern } from '../core/patterns.js';
import { audio, beep } from '../core/sound.js';
import { iconImg } from '../core/icons.js';
import * as FS from '../core/fs.js';

export default {
  id: 'controlpanel',
  name: 'Control Panel',
  icon: 'controlpanel',
  kind: 'Desk Accessory',
  w: 420,
  h: 300,
  single: true,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [{ label: 'Close', key: 'W', action: () => appCtx.win.close() }],
    }];
  },

  open(appCtx) {
    const { win, prefs, savePrefs, desktop } = appCtx;
    const wrap = el('div', { class: 'cpanel cpanel6' });

    /* --- helpers ---------------------------------------------------------- */
    function slider(label, get, set) {
      const row = el('div', { class: 'ctl-row' });
      const sliderEl = el('div', { class: 'slider' });
      const knob = el('div', { class: 'knob' });
      sliderEl.append(knob);
      const paint = () => {
        const v = clamp(get(), 0, 1);
        knob.style.left = `${Math.round(v * 100)}%`;
      };
      const setFrom = (clientX) => {
        const r = sliderEl.getBoundingClientRect();
        const s = window.__macScale || 1;
        const v = clamp((clientX - r.left) / s / (r.width / s), 0, 1);
        set(Math.round(v * 20) / 20);
        paint();
        savePrefs();
      };
      sliderEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        setFrom(e.clientX);
        const move = (ev) => setFrom(ev.clientX);
        const up = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          beep(0.07);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });
      row.append(el('span', { class: 'lab', text: label }), sliderEl);
      paint();
      return row;
    }

    function checkline(label, get, set) {
      const check = el('div', { class: 'checkline' });
      const box = el('div', { class: 'box', text: get() ? '✓' : '' });
      check.append(box, el('span', { text: label }));
      check.addEventListener('pointerdown', () => {
        set(!get());
        box.textContent = get() ? '✓' : '';
        savePrefs();
        beep(0.08);
      });
      return check;
    }

    function popup(options, get, set) {
      const row = el('div', { class: 'ctl-row' });
      const sel = el('div', { class: 'popup', text: String(get()) });
      sel.addEventListener('pointerdown', () => {
        const i = options.findIndex((o) => String(o) === String(get()));
        const next = options[(i + 1) % options.length];
        set(next);
        sel.textContent = String(next);
        savePrefs();
        beep(0.07);
      });
      row.append(sel);
      return row;
    }

    function radiogroup(options, get, set) {
      const box = el('div', { class: 'radiogroup' });
      const rows = [];
      for (const opt of options) {
        const r = el('div', { class: 'radioline' });
        const dot = el('div', { class: 'radio', text: get() === opt.value ? '●' : '' });
        r.append(dot, el('span', { text: opt.label }));
        r.addEventListener('pointerdown', () => {
          set(opt.value);
          rows.forEach((x) => { x.dot.textContent = x.value === opt.value ? '●' : ''; });
          savePrefs();
          beep(0.07);
        });
        rows.push({ dot, value: opt.value });
        box.append(r);
      }
      return box;
    }

    /* --- panes ------------------------------------------------------------ */
    const panes = {
      keyboard: () => {
        const p = el('div', { class: 'pane' });
        p.append(
          el('h4', {}, el('span', { text: 'Keyboard' }), el('span', { text: 'Typing' })),
          slider('Repeat Rate', () => prefs.repeat, (v) => { prefs.repeat = v; }),
          slider('Blink Rate', () => prefs.menuBlink, (v) => { prefs.menuBlink = v; }),
          el('p', { class: 'hint', text: 'The Repeat Rate sets how fast a held-down key repeats. The Blink Rate sets how fast the insertion point blinks.' }),
        );
        return p;
      },
      mouse: () => {
        const p = el('div', { class: 'pane' });
        p.append(
          el('h4', {}, el('span', { text: 'Mouse' }), el('span', { text: 'Pointing' })),
          slider('Tracking', () => prefs.trackSpeed ?? 0.6, (v) => { prefs.trackSpeed = v; }),
          slider('Double-Click', () => prefs.dblSpeed ?? 0.6, (v) => { prefs.dblSpeed = v; }),
          radiogroup([
            { value: 'Mouse', label: 'Mouse' },
            { value: 'Tablet', label: 'Tablet' },
          ], () => prefs.mouseTracking, (v) => { prefs.mouseTracking = v; }),
        );
        return p;
      },
      sound: () => {
        const p = el('div', { class: 'pane' });
        p.append(
          el('h4', {}, el('span', { text: 'Sound' }), el('span', { text: 'Volume' })),
          checkline('Sound on', () => prefs.sound, (v) => {
            prefs.sound = v;
            audio.enabled = v;
          }),
          slider('Bell Volume', () => prefs.bellVolume, (v) => {
            prefs.bellVolume = v;
            audio.bellVolume = v;
          }),
          slider('Alarm Volume', () => prefs.alarmVolume, (v) => {
            prefs.alarmVolume = v;
            audio.alarmVolume = v;
          }),
          el('p', { class: 'hint', text: 'One little speaker, one little beep. The SE has no sound chip to argue with.' }),
        );
        return p;
      },
      memory: () => {
        const p = el('div', { class: 'pane' });
        const multi = !!prefs.multiFinder;
        p.append(
          el('h4', {}, el('span', { text: 'Memory' }), el('span', { text: 'Cache' })),
          checkline('Disk Cache', () => prefs.cacheOn, (v) => { prefs.cacheOn = v; }),
          popup(['64K', '128K', '256K'], () => `${prefs.cache}K`, (v) => {
            prefs.cache = parseInt(v, 10);
          }),
          el('p', { class: 'hint', text: 'The disk cache keeps recently read data in RAM. Bigger cache, fewer trips to the disk.' }),
          el('div', { class: 'hr' }),
          el('p', { class: 'hint', text: multi
            ? 'MultiFinder is running. You have 2 MB of 24-bit addressing — 8 MB is the ceiling.'
            : 'MultiFinder is off. Special ▸ Set Startup… turns it on, then restart.' }),
        );
        return p;
      },
      startup: () => {
        const p = el('div', { class: 'pane' });
        const disks = FS.fs.roots.filter((r) => r.kind === 'disk');
        p.append(
          el('h4', {}, el('span', { text: 'Startup Disk' }), el('span', { text: 'Boot' })),
          radiogroup(
            disks.map((d) => ({ value: d.id, label: d.name })),
            () => prefs.startupDisk || disks[0]?.id,
            (v) => { prefs.startupDisk = v; },
          ),
          el('p', { class: 'hint', text: 'The Macintosh starts up from this disk at the next restart. Choose carefully: the System Folder must be blessed, and this one is.' }),
        );
        return p;
      },
      pattern: () => {
        const p = el('div', { class: 'pane' });
        const grid = el('div', { class: 'pat-grid' });
        for (const id of DESKTOP_PATTERNS) {
          const sw = el('div', { class: 'swatch' + (prefs.desktopPattern === id ? ' on' : ''), title: id });
          Object.assign(sw.style, patternStyle(id));
          sw.addEventListener('pointerdown', () => {
            prefs.desktopPattern = id;
            savePrefs();
            applyPattern(desktop, id);
            grid.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('on', s === sw));
            beep(0.08);
          });
          grid.append(sw);
        }
        p.append(
          el('h4', {}, el('span', { text: 'Desktop Pattern' }), el('span', { text: '8 × 8' })),
          grid,
          el('p', { class: 'hint', text: 'The desktop wears an 8 × 8 tile, the same one the Finder tiles across the screen.' }),
        );
        return p;
      },
    };

    const cdevs = [
      { id: 'keyboard', icon: 'cdevKeyboard', label: 'Keyboard' },
      { id: 'mouse', icon: 'cdevMouse', label: 'Mouse' },
      { id: 'sound', icon: 'cdevSound', label: 'Sound' },
      { id: 'memory', icon: 'cdevMemory', label: 'Memory' },
      { id: 'startup', icon: 'cdevStartup', label: 'Startup Disk' },
      { id: 'pattern', icon: 'controlpanel', label: 'Desktop Pattern' },
    ];

    const strip = el('div', { class: 'cdev-strip' });
    const holder = el('div', { class: 'cdev-holder' });
    let current = null;
    const tiles = [];
    function show(id) {
      if (current === id) return;
      current = id;
      tiles.forEach((t) => t.classList.toggle('on', t.dataset.id === id));
      holder.innerHTML = '';
      holder.append(panes[id]());
    }
    for (const c of cdevs) {
      const tile = el('div', { class: 'cdev-tile', 'data-id': c.id, title: c.label },
        iconImg(c.icon), el('div', { class: 'cdev-lbl', text: c.label }));
      tile.addEventListener('pointerdown', () => { show(c.id); beep(0.06); });
      tiles.push(tile);
      strip.append(tile);
    }

    wrap.append(strip, holder);
    win.body.append(wrap);
    show('keyboard');
    win.refreshMenus();
  },
};
