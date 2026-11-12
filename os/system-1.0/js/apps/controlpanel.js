/* Control Panel — desktop pattern, bell and alarm volume, keyboard repeat.
   Changes are saved with the rest of the system preferences. */

import { el, clamp } from '../core/ui.js';
import { DESKTOP_PATTERNS, patternStyle, applyPattern } from '../core/patterns.js';
import { audio, beep } from '../core/sound.js';

export default {
  id: 'controlpanel',
  name: 'Control Panel',
  icon: 'controlpanel',
  kind: 'Desk Accessory',
  w: 352,
  h: 264,
  single: true,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [{ label: 'Close', key: 'W', action: () => appCtx.win.close() }],
    }];
  },

  open(appCtx) {
    const { win, prefs, savePrefs, desktop } = appCtx;
    const wrap = el('div', { class: 'cpanel' });

    /* --- desktop pattern ------------------------------------------------- */
    const patSection = el('section', {}, el('h4', {}, el('span', { text: 'Desktop' }), el('span', { text: 'Pattern' })));
    const grid = el('div', { class: 'pat-grid' });
    const swatches = [];
    for (const id of DESKTOP_PATTERNS) {
      const sw = el('div', { class: 'swatch' + (prefs.desktopPattern === id ? ' on' : ''), title: id });
      Object.assign(sw.style, patternStyle(id));
      sw.addEventListener('pointerdown', () => {
        prefs.desktopPattern = id;
        savePrefs();
        applyPattern(desktop, id);
        swatches.forEach((s) => s.classList.toggle('on', s === sw));
        beep(0.08);
      });
      swatches.push(sw);
      grid.append(sw);
    }
    patSection.append(grid);

    /* --- helper for 1-bit sliders ---------------------------------------- */
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
      return { row, paint };
    }

    /* --- sound ------------------------------------------------------------ */
    const soundSection = el('section', {}, el('h4', {}, el('span', { text: 'Sound' }), el('span', { text: 'Volume' })));
    const check = el('div', { class: 'checkline' });
    const box = el('div', { class: 'box', text: prefs.sound ? '✓' : '' });
    check.append(box, el('span', { text: 'Sound on' }));
    check.addEventListener('pointerdown', () => {
      prefs.sound = !prefs.sound;
      audio.enabled = prefs.sound;
      box.textContent = prefs.sound ? '✓' : '';
      savePrefs();
      if (prefs.sound) beep(0.1);
    });

    const bell = slider('Bell Volume', () => prefs.bellVolume, (v) => {
      prefs.bellVolume = v;
      audio.bellVolume = v;
    });
    const alarmS = slider('Alarm Volume', () => prefs.alarmVolume, (v) => {
      prefs.alarmVolume = v;
      audio.alarmVolume = v;
    });
    soundSection.append(check, bell.row, alarmS.row);

    /* --- keyboard --------------------------------------------------------- */
    const kbSection = el('section', {}, el('h4', {}, el('span', { text: 'Keyboard' }), el('span', { text: 'Repeat' })));
    const repeat = slider('Repeat Rate', () => prefs.repeat, (v) => { prefs.repeat = v; });
    kbSection.append(repeat.row);

    /* --- startup ---------------------------------------------------------- */
    const aboutSection = el('section', {},
      el('h4', {}, el('span', { text: 'Startup Disk' })),
      el('div', { class: 'ctl-row' },
        el('span', { class: 'lab', text: 'System Disk' }),
        el('span', { style: { opacity: '.65' }, text: '400K — System 1.0' }),
      ),
    );

    wrap.append(patSection, soundSection, kbSection, aboutSection);
    win.body.append(wrap);
    win.refreshMenus();
  },
};
