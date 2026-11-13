/* Alarm Clock — an analog face with a digital readout and a settable alarm. */

import { el } from '../core/ui.js';
import { prompt, dialog } from '../core/wm.js';
import { alarm, keyClick, beep } from '../core/sound.js';
import { fmtTime } from '../core/ui.js';

function drawFace(canvas, date) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - 3;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  // rim (two pixel rings like the original)
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
  ctx.stroke();

  // tick marks
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const inner = r - (i % 3 === 0 ? 8 : 5);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2));
    ctx.stroke();
  }

  const sec = date.getSeconds();
  const min = date.getMinutes() + sec / 60;
  const hr = (date.getHours() % 12) + min / 60;

  const hand = (angle, len, thick) => {
    const a = angle * Math.PI * 2 - Math.PI / 2;
    ctx.lineWidth = thick;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
    ctx.stroke();
  };

  hand(hr / 12, r * 0.48, 3);
  hand(min / 60, r * 0.72, 2);
  ctx.lineWidth = 1;
  hand(sec / 60, r * 0.8, 1);

  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 2, cy - 2, 4, 4);
}

export default {
  id: 'clock',
  name: 'Alarm Clock',
  icon: 'clock',
  kind: 'Desk Accessory',
  w: 190,
  h: 216,
  single: true,
  resizable: false,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [
        { label: 'Set Alarm…', action: () => appCtx.api.setAlarm() },
        { sep: true },
        { label: 'Close', key: 'W', action: () => appCtx.win.close() },
      ],
    }];
  },

  open(appCtx) {
    const { win, prefs, savePrefs } = appCtx;
    const wrap = el('div', { class: 'clockapp' });
    const canvas = el('canvas', { width: 96, height: 96 });
    canvas.style.width = '96px';
    canvas.style.height = '96px';
    const digital = el('div', { class: 'digital', text: '' });
    const dateEl = el('div', { class: 'digital', style: { opacity: '.7' }, text: '' });

    const alarmRow = el('div', { class: 'setrow' });
    const box = el('div', { class: 'box', text: prefs.alarmOn ? '✓' : '' });
    const alarmLabel = el('span', { text: 'Alarm off' });
    const setBtn = el('button', { class: 'btn', text: 'Set…' });

    alarmRow.append(el('span', { class: 'box', text: '' }), box, alarmLabel, setBtn);
    alarmRow.firstChild.style.visibility = 'hidden';
    wrap.append(canvas, digital, dateEl, alarmRow);
    win.body.append(wrap);

    let fired = false;

    const updateAlarmLabel = () => {
      if (prefs.alarmOn && prefs.alarmTime) alarmLabel.textContent = `Alarm ${prefs.alarmTime}`;
      else if (prefs.alarmTime) alarmLabel.textContent = `Alarm ${prefs.alarmTime} (off)`;
      else alarmLabel.textContent = 'Alarm off';
      box.textContent = prefs.alarmOn ? '✓' : '';
    };

    const api = {
      async setAlarm() {
        const value = await prompt({
          title: 'Alarm Clock',
          message: 'Set alarm time (24-hour, e.g. 07:30):',
          value: prefs.alarmTime || '07:30',
          icon: null,
        });
        if (value === null) return;
        const m = value.trim().match(/^(\d{1,2}):(\d{2})$/);
        if (!m) { beep(); return; }
        const h = Math.min(23, Number(m[1]));
        const mi = Math.min(59, Number(m[2]));
        prefs.alarmTime = `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
        prefs.alarmOn = true;
        savePrefs();
        updateAlarmLabel();
      },
    };
    appCtx.api = api;

    box.parentElement.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      prefs.alarmOn = !prefs.alarmOn;
      savePrefs();
      updateAlarmLabel();
      keyClick();
    });
    setBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); api.setAlarm(); });

    const tick = () => {
      const now = new Date();
      drawFace(canvas, now);
      digital.textContent = fmtTime(now) + (now.getSeconds() % 2 ? '' : ' ');
      dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (prefs.alarmOn && prefs.alarmTime === hhmm && now.getSeconds() === 0 && !fired) {
        fired = true;
        alarm();
        dialog({
          title: 'Alarm Clock',
          icon: 'clock',
          message: `It is ${fmtTime(now)}.`,
          buttons: ['OK'],
        });
      }
      if (now.getSeconds() !== 0) fired = false;
    };

    updateAlarmLabel();
    tick();
    const timer = setInterval(tick, 500);
    win.onDestroy = () => clearInterval(timer);
    win.refreshMenus();
  },
};
