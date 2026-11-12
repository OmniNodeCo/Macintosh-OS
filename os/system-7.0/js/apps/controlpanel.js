/* Control Panels — the System 7 way.

   System 7 broke the old Control Panel DA into separate little programs in
   the Control Panels folder: double-click "Memory" and the Memory panel opens
   as its own window. The Apple menu's "Control Panels" item (an alias in the
   Apple Menu Items folder) opens the folder itself. */

import { el, clamp } from '../core/ui.js';
import { DESKTOP_PATTERNS, patternStyle, applyPattern } from '../core/patterns.js';
import { audio, beep } from '../core/sound.js';
import * as FS from '../core/fs.js';

export default {
  id: 'controlpanel',
  name: 'Control Panel',
  icon: 'controlpanel',
  kind: 'Control Panel',
  w: 340,
  h: 236,
  single: false,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [{ label: 'Close', key: 'W', action: () => appCtx.win.close() }],
    }];
  },

  open(appCtx) {
    const { win, prefs, savePrefs, desktop, file, fromNode } = appCtx;
    const node = file || fromNode;
    const which = (node && node.name) || 'General';
    win.setTitle(which);

    const wrap = el('div', { class: 'cpanel cpanel7' });

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
          if (opt.disabled) return;
          set(opt.value);
          rows.forEach((x) => { x.dot.textContent = x.value === opt.value ? '●' : ''; });
          savePrefs();
          beep(0.07);
        });
        rows.push({ dot, value: opt.value });
        if (opt.disabled) r.style.opacity = '.45';
        box.append(r);
      }
      return box;
    }

    function patternGrid() {
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
      return grid;
    }

    const panes = {
      General: () => {
        const p = el('div', { class: 'pane' });
        p.append(
          el('h4', {}, el('span', { text: 'General' }), el('span', { text: 'Settings' })),
          checkline('Shut Down warning', () => prefs.warnOnShut !== false, (v) => { prefs.warnOnShut = v; }),
          checkline('32-bit addressing', () => !!prefs.addr32, (v) => { prefs.addr32 = v; }),
          el('p', { class: 'hint', text: '32-bit addressing needs a 68020 or better and more than 8 MB of RAM. On this machine it stays politely off — System 7 keeps 24-bit compatibility.' }),
          el('div', { class: 'hr' }),
          el('p', { class: 'hint', text: 'Desktop pattern:' }),
          patternGrid(),
        );
        return p;
      },
      Memory: () => {
        const p = el('div', { class: 'pane' });
        p.append(
          el('h4', {}, el('span', { text: 'Memory' }), el('span', { text: 'Cache' })),
          checkline('Disk Cache', () => prefs.cacheOn, (v) => { prefs.cacheOn = v; }),
          popup(['64K', '128K', '256K'], () => `${prefs.cache}K`, (v) => { prefs.cache = parseInt(v, 10); }),
          el('p', { class: 'hint', text: 'The disk cache keeps recently read data in memory. 256K is a sensible size for a 4 MB machine.' }),
        );
        return p;
      },
      'Virtual Memory': () => {
        const p = el('div', { class: 'pane' });
        p.append(
          el('h4', {}, el('span', { text: 'Virtual Memory' }), el('span', { text: 'Unavailable' })),
          radiogroup([
            { value: 'off', label: 'Off', disabled: false },
            { value: 'on', label: 'On', disabled: true },
          ], () => 'off', () => {}),
          el('p', { class: 'hint', text: 'Virtual Memory is not available on this Macintosh: it needs a 68020 or better processor, and this SE has a 68000. System 7 includes the panel anyway, so here it is.' }),
          el('p', { class: 'hint', text: 'When available it swaps memory to a file on the startup disk — the 80MB HD has room to lend.' }),
        );
        return p;
      },
      'Startup Disk': () => {
        const p = el('div', { class: 'pane' });
        const disks = FS.fs.roots.filter((r) => r.kind === 'disk');
        p.append(
          el('h4', {}, el('span', { text: 'Startup Disk' }), el('span', { text: 'Boot' })),
          radiogroup(
            disks.map((d) => ({ value: d.id, label: d.name })),
            () => prefs.startupDisk || disks[0]?.id,
            (v) => { prefs.startupDisk = v; },
          ),
          el('p', { class: 'hint', text: 'The Macintosh starts up from the selected disk at the next restart. The blessed System Folder decides which disk can boot.' }),
        );
        return p;
      },
      Keyboard: () => {
        const p = el('div', { class: 'pane' });
        p.append(
          el('h4', {}, el('span', { text: 'Keyboard' }), el('span', { text: 'Typing' })),
          slider('Repeat Rate', () => prefs.repeat, (v) => { prefs.repeat = v; }),
          slider('Blink Rate', () => prefs.menuBlink, (v) => { prefs.menuBlink = v; }),
        );
        return p;
      },
      Mouse: () => {
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
      Sound: () => {
        const p = el('div', { class: 'pane' });
        p.append(
          el('h4', {}, el('span', { text: 'Sound' }), el('span', { text: 'Volume' })),
          checkline('Sound on', () => prefs.sound, (v) => { prefs.sound = v; audio.enabled = v; }),
          slider('Bell Volume', () => prefs.bellVolume, (v) => { prefs.bellVolume = v; audio.bellVolume = v; }),
          slider('Alarm Volume', () => prefs.alarmVolume, (v) => { prefs.alarmVolume = v; audio.alarmVolume = v; }),
        );
        return p;
      },
      'Desktop Pattern': () => {
        const p = el('div', { class: 'pane' });
        p.append(
          el('h4', {}, el('span', { text: 'Desktop Pattern' }), el('span', { text: '8 × 8' })),
          patternGrid(),
          el('p', { class: 'hint', text: 'System 7 ships with a 50% grey linen desktop. Pick another tile if the future is too loud.' }),
        );
        return p;
      },
    };

    wrap.append((panes[which] || panes.General)());
    win.body.append(wrap);
    win.refreshMenus();
  },
};
