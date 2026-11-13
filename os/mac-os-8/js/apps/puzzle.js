/* Puzzle — the classic fifteen-tile sliding puzzle. */

import { el } from '../core/ui.js';
import { dialog } from '../core/wm.js';
import { keyClick, beep } from '../core/sound.js';

function solvedState() {
  const t = [];
  for (let i = 1; i <= 15; i++) t.push(i);
  t.push(0);
  return t;
}

function isSolved(t) {
  for (let i = 0; i < 15; i++) if (t[i] !== i + 1) return false;
  return t[15] === 0;
}

export default {
  id: 'puzzle',
  name: 'Puzzle',
  icon: 'puzzle',
  kind: 'Desk Accessory',
  w: 220,
  h: 244,
  single: true,
  resizable: false,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [
        { label: 'Shuffle', key: 'N', action: () => appCtx.api.shuffle() },
        { sep: true },
        { label: 'Close', key: 'W', action: () => appCtx.win.close() },
      ],
    }];
  },

  open(appCtx) {
    const { win } = appCtx;
    const wrap = el('div', { class: 'puzzle' });
    const tilesEl = el('div', { class: 'tiles' });
    const foot = el('div', { class: 'foot' });
    const movesEl = el('span', { text: 'Moves: 0' });
    const shuffleBtn = el('button', { class: 'btn', text: 'Shuffle' });
    foot.append(movesEl, shuffleBtn);

    const winBox = el('div', { style: { fontSize: '12px', textAlign: 'center', opacity: '.7' }, text: 'Slide the tiles into order.' });
    wrap.append(tilesEl, foot, winBox);
    win.body.append(wrap);

    let tiles = solvedState();
    let moves = 0;
    let done = false;

    const render = () => {
      tilesEl.innerHTML = '';
      tiles.forEach((value, idx) => {
        const tile = el('div', { class: 'tile' + (value === 0 ? ' blank' : ''), text: value ? String(value) : '' });
        tile.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          if (done) return;
          tryMove(idx);
        });
        tilesEl.append(tile);
      });
      movesEl.textContent = `Moves: ${moves}`;
    };

    const adjacent = (a, b) => {
      const ax = a % 4, ay = Math.floor(a / 4);
      const bx = b % 4, by = Math.floor(b / 4);
      return Math.abs(ax - bx) + Math.abs(ay - by) === 1;
    };

    const tryMove = (idx) => {
      const blank = tiles.indexOf(0);
      if (!adjacent(idx, blank)) { beep(0.08); return; }
      [tiles[idx], tiles[blank]] = [tiles[blank], tiles[idx]];
      moves++;
      keyClick();
      render();
      if (isSolved(tiles)) {
        done = true;
        setTimeout(() => {
          dialog({
            title: 'Puzzle',
            icon: 'puzzle',
            message: `Congratulations!\nYou solved the puzzle in ${moves} move${moves === 1 ? '' : 's'}.`,
            buttons: ['Shuffle', 'OK'],
            defaultButton: 1,
          }).then((r) => { if (r.index === 0) shuffle(); });
        }, 150);
      }
    };

    const shuffle = () => {
      tiles = solvedState();
      // random legal moves guarantee a solvable position
      let blank = 15;
      for (let i = 0; i < 250; i++) {
        const opts = [];
        if (blank % 4 > 0) opts.push(blank - 1);
        if (blank % 4 < 3) opts.push(blank + 1);
        if (blank >= 4) opts.push(blank - 4);
        if (blank < 12) opts.push(blank + 4);
        const pick = opts[Math.floor(Math.random() * opts.length)];
        [tiles[blank], tiles[pick]] = [tiles[pick], tiles[blank]];
        blank = pick;
      }
      moves = 0;
      done = false;
      render();
    };

    const api = { shuffle };
    appCtx.api = api;
    shuffleBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); shuffle(); });

    shuffle();
    win.refreshMenus();
  },
};
