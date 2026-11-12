/* Control Panel — redesigned in System 3.0: the controls finally carry words,
   and the panel grew the settings the Plus made necessary. Desktop pattern,
   bell and alarm volume, keyboard repeat, insertion-point blinking, mouse
   tracking, AppleTalk, and the RAM cache that made 3.0 feel quick.
   Changes are saved with the rest of the system preferences. */

import { el, clamp } from '../core/ui.js';
import { DESKTOP_PATTERNS, patternStyle, applyPattern } from '../core/patterns.js';
import { audio, beep } from '../core/sound.js';

export default {
  id: 'controlpanel',
  name: 'Control Panel',
  icon: 'controlpanel',
  kind: 'Desk Accessory',
  w: 384,
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
    const blink = slider('Blink Rate', () => prefs.menuBlink ?? 0.5, (v) => { prefs.menuBlink = v; });
    kbSection.append(repeat.row, blink.row);

    const mouseSection = el('section', {}, el('h4', {}, el('span', { text: 'Mouse' }), el('span', { text: 'Tracking' })));
    const trackRow = el('div', { class: 'ctl-row' });
    const trackLabel = el('span', { class: 'lab', text: 'Tracking' });
    const trackBtn = el('button', { class: 'btn', text: prefs.mouseTracking || 'Mouse' });
    trackBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      prefs.mouseTracking = prefs.mouseTracking === 'Tablet' ? 'Mouse' : 'Tablet';
      trackBtn.textContent = prefs.mouseTracking;
      savePrefs();
      beep(0.05);
    });
    trackRow.append(trackLabel, trackBtn);
    mouseSection.append(trackRow);

    /* --- RAM cache (new in 3.0) ------------------------------------------ */
    const cacheSection = el('section', {}, el('h4', {}, el('span', { text: 'RAM Cache' }), el('span', { text: 'Memory' })));
    const cacheRow = el('div', { class: 'ctl-row' });
    const cacheBtn = el('button', { class: 'btn', text: prefs.cacheOn === false ? 'Off' : `${prefs.cache || 128}K` });
    cacheBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      // Off -> 64K -> 128K -> 256K -> Off
      const steps = [0, 64, 128, 256];
      const cur = prefs.cacheOn === false ? 0 : (prefs.cache || 128);
      const next = steps[(steps.indexOf(cur) + 1) % steps.length];
      prefs.cache = next || 128;
      prefs.cacheOn = next !== 0;
      cacheBtn.textContent = next ? `${next}K` : 'Off';
      savePrefs();
      beep(0.05);
    });
    cacheRow.append(el('span', { class: 'lab', text: 'Cache' }), cacheBtn,
      el('span', { class: 'hint', text: 'Keeps the Finder in memory.' }));
    cacheSection.append(cacheRow);

    /* --- AppleTalk (new in 3.0) ------------------------------------------ */
    const atSection = el('section', {}, el('h4', {}, el('span', { text: 'AppleTalk' }), el('span', { text: 'Network' })));
    const atRow = el('div', { class: 'ctl-row' });
    const connected = el('button', { class: `btn${prefs.appleTalk !== false ? ' on' : ''}`, text: 'Connected' });
    const disconnected = el('button', { class: `btn${prefs.appleTalk === false ? ' on' : ''}`, text: 'Disconnected' });
    const setNet = (on) => {
      prefs.appleTalk = on;
      connected.classList.toggle('on', on);
      disconnected.classList.toggle('on', !on);
      savePrefs();
      beep(0.05);
    };
    connected.addEventListener('pointerdown', (e) => { e.preventDefault(); setNet(true); });
    disconnected.addEventListener('pointerdown', (e) => { e.preventDefault(); setNet(false); });
    atRow.append(el('span', { class: 'lab', text: 'Network' }), connected, disconnected);
    atSection.append(atRow);

    /* --- startup ---------------------------------------------------------- */
    const printerName = prefs.printer === 'laserwriter' ? 'LaserWriter' : 'ImageWriter';
    const aboutSection = el('section', {},
      el('h4', {}, el('span', { text: 'Startup Disk' })),
      el('div', { class: 'ctl-row' },
        el('span', { class: 'lab', text: 'System Disk' }),
        el('span', { style: { opacity: '.65' }, text: '800K — System 3.0' }),
      ),
      el('div', { class: 'ctl-row' },
        el('span', { class: 'lab', text: 'Printer' }),
        el('span', { style: { opacity: '.65' }, text: `${printerName} · ${prefs.printerPort || 'Printer'}` }),
        el('button', {
          class: 'btn',
          text: 'Chooser…',
          onpointerdown: (e) => { e.preventDefault(); appCtx.launch('chooser'); },
        }),
      ),
    );

    wrap.append(patSection, soundSection, kbSection, mouseSection, cacheSection, atSection, aboutSection);
    win.body.append(wrap);
    win.refreshMenus();
  },
};
