/* Control Panels — the Mac OS 8 way.

   Separate little programs in the Control Panels folder: double-click
   "Memory" and the Memory panel opens as its own window. Mac OS 8 adds the
   Appearance panel — Platinum lives here, along with the highlight colour
   this museum actually obeys. */

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
          checkline('Spring-loaded folders', () => prefs.springload !== false, (v) => { prefs.springload = v; }),
          el('p', { class: 'hint', text: 'Drag an item over a folder and hold it there: the folder springs open. New in Mac OS 8.' }),
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
          popup(['128K', '256K', '512K'], () => `${prefs.cache}K`, (v) => { prefs.cache = parseInt(v, 10); }),
          el('p', { class: 'hint', text: 'The disk cache keeps recently read data in memory. On a 32 MB Power Macintosh, 512K is generous.' }),
        );
        return p;
      },
      'Virtual Memory': () => {
        const p = el('div', { class: 'pane' });
        p.append(
          el('h4', {}, el('span', { text: 'Virtual Memory' }), el('span', { text: 'Available' })),
          radiogroup([
            { value: 'off', label: 'Off', disabled: false },
            { value: 'on', label: 'On', disabled: false },
          ], () => prefs.vm || 'on', (v) => { prefs.vm = v; }),
          el('p', { class: 'hint', text: 'At last: a Macintosh in this museum with an MMU. The PowerPC 604e can run Virtual Memory, and the 2 GB hard disk lends a 48 MB backing file.' }),
          el('p', { class: 'hint', text: 'With Virtual Memory on, the Macintosh runs software in 32 MB of space while the disk holds the rest. System 7 had the same panel — on the SE it simply refused.' }),
        );
        return p;
      },
      Appearance: () => {
        const p = el('div', { class: 'pane' });
        p.append(
          el('h4', {}, el('span', { text: 'Appearance' }), el('span', { text: 'Theme' })),
          el('p', { class: 'hint', text: 'Theme: Platinum — the only appearance in this museum. Light grey frames, ridged title bars, rounded buttons.' }),
          el('div', { class: 'hr' }),
          el('p', { class: 'hint', text: 'Highlight colour:' }),
        );
        const grid = el('div', { class: 'pat-grid' });
        const colors = {
          blue: '#7a6fc4', violet: '#8a5fc4', red: '#b23a3a', orange: '#c4772a',
          yellow: '#b8a12a', green: '#3f8f4f', gray: '#7a7a7a',
        };
        for (const [id, hex] of Object.entries(colors)) {
          const sw = el('div', { class: 'swatch' + (prefs.hl === id ? ' on' : ''), title: id });
          sw.style.background = hex;
          sw.addEventListener('pointerdown', () => {
            if (window.mac && window.mac.setHighlight) window.mac.setHighlight(id);
            else { prefs.hl = id; savePrefs(); }
            grid.querySelectorAll('.swatch').forEach((x) => x.classList.toggle('on', x === sw));
            beep(0.08);
          });
          grid.append(sw);
        }
        p.append(grid);
        p.append(el('p', { class: 'hint', text: 'The highlight colour marks selected text, menu choices and icons across the system.' }));
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
          el('p', { class: 'hint', text: 'The Macintosh starts up from the selected disk at the next restart — or hold C to boot from the Mac OS 8 CD.' }),
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
          el('p', { class: 'hint', text: 'Mac OS 8 still knows the 8 × 8 desktop tiles. Pick one that flatters Platinum.' }),
        );
        return p;
      },
    };

    wrap.append((panes[which] || panes.General)());
    win.body.append(wrap);
    win.refreshMenus();
  },
};
