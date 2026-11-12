/* MacWrite — the word processor. A ruled page you can type into, with
   Save / Save As writing documents into the virtual System Disk. */

import { el } from '../core/ui.js';
import * as FS from '../core/fs.js';
import { dialog, prompt, confirm, alert } from '../core/wm.js';
import { keyClick, beep } from '../core/sound.js';

const DEFAULT_NAME = 'untitled';

export default {
  id: 'macwrite',
  name: 'MacWrite',
  icon: 'macwrite',
  kind: 'Application',
  w: 424,
  h: 254,
  single: false,

  menus(appCtx) {
    return [
      {
        title: 'File',
        items: [
          { label: 'New', key: 'N', action: () => appCtx.api.newDoc() },
          { label: 'Save', key: 'S', action: () => appCtx.api.save() },
          { label: 'Save As…', action: () => appCtx.api.saveAs() },
          { sep: true },
          { label: 'Close', key: 'W', action: () => appCtx.win.close() },
        ],
      },
      {
        title: 'Edit',
        items: [
          { label: 'Undo', key: 'Z', action: () => document.execCommand('undo') },
          { sep: true },
          { label: 'Cut', key: 'X', action: () => document.execCommand('cut') },
          { label: 'Copy', key: 'C', action: () => document.execCommand('copy') },
          { label: 'Paste', key: 'V', action: () => document.execCommand('paste') },
          { label: 'Select All', key: 'A', action: () => appCtx.api.selectAll() },
          { sep: true },
          { label: 'Insert Date', action: () => appCtx.api.insertDate() },
        ],
      },
      {
        title: 'Format',
        items: [
          { label: 'Align Left', action: () => appCtx.api.align('left') },
          { label: 'Align Center', action: () => appCtx.api.align('center') },
          { label: 'Align Right', action: () => appCtx.api.align('right') },
        ],
      },
    ];
  },

  open(appCtx) {
    const { win, file, finder } = appCtx;
    let doc = file || null;
    let dirty = false;
    let forceClose = false;

    const wrap = el('div', { class: 'mwrite' });
    const ruler = el('div', { class: 'ruler' });
    for (let x = 0; x <= 400; x += 8) {
      const major = x % 64 === 0;
      const tick = el('div', { class: `tick${major ? ' major' : ''}` });
      tick.style.left = `${x + 8}px`;
      ruler.append(tick);
      if (major && x > 0 && x < 400) {
        const num = el('span', { class: 'num', text: String(x / 64) });
        num.style.left = `${x + 8 - 3}px`;
        ruler.append(num);
      }
    }
    ruler.append(el('div', { class: 'marker', style: { left: '8px' } }));
    ruler.append(el('div', { class: 'marker', style: { left: '392px' } }));

    const page = el('div', {
      class: 'page',
      contenteditable: 'true',
      spellcheck: 'false',
      role: 'textbox',
      'aria-multiline': 'true',
    });
    const status = el('div', { class: 'status' });
    const wordsEl = el('span', { text: '0 words' });
    const posEl = el('span', { text: '' });
    status.append(wordsEl, posEl);
    wrap.append(ruler, page, status);
    win.body.append(wrap);

    const setTitle = () => {
      win.setTitle(`${doc ? doc.name : DEFAULT_NAME}${dirty ? ' *' : ''}`);
    };

    const pageText = () => (page.innerText === undefined ? page.textContent : page.innerText);

    const countWords = () => {
      const text = pageText().trim();
      const n = text ? text.split(/\s+/).length : 0;
      wordsEl.textContent = `${n} word${n === 1 ? '' : 's'}`;
    };

    const load = (node) => {
      doc = node;
      page.innerHTML = '';
      page.textContent = node ? node.data || '' : '';
      dirty = false;
      setTitle();
      countWords();
    };

    const markDirty = () => { dirty = true; setTitle(); countWords(); };

    page.addEventListener('input', markDirty);
    page.addEventListener('keyup', countWords);
    page.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey) return;
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') keyClick();
    });
    // paste as plain text only — MacWrite knew nothing of HTML
    page.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
    });

    const api = {
      newDoc() {
        if (dirty) {
          dialog({
            title: 'MacWrite',
            message: 'Save the changes to this document first?',
            buttons: ['Save', 'Cancel', "Don't Save"],
            cancelButton: 1,
            defaultButton: 0,
            icon: 'note',
          }).then((r) => {
            if (r.index === 0) appCtx.api.save().then((ok) => { if (ok) load(null); });
            else if (r.index === 2) load(null);
          });
        } else load(null);
      },
      selectAll() {
        const range = document.createRange();
        range.selectNodeContents(page);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        page.focus();
      },
      insertDate() {
        page.focus();
        document.execCommand('insertText', false, new Date().toLocaleDateString());
        markDirty();
      },
      align(where) {
        page.style.textAlign = where;
        beep(0.08);
      },
      async saveAs() {
        const name = await prompt({
          title: 'Save As',
          message: 'Save this document as:',
          value: doc ? `${doc.name} copy` : DEFAULT_NAME,
          ok: 'Save',
          icon: null,
        });
        if (name === null) return false;
        const target = FS.documentsFolder();
        const node = FS.addNode(target, {
          name: name.trim() || DEFAULT_NAME,
          kind: 'doc',
          icon: 'docText',
          app: 'macwrite',
          data: pageText(),
        });
        doc = node;
        dirty = false;
        setTitle();
        finder.refreshAll();
        return true;
      },
      async save() {
        if (!doc) return appCtx.api.saveAs();
        doc.data = pageText();
        doc.modified = Date.now();
        FS.changed();
        dirty = false;
        setTitle();
        finder.refreshAll();
        return true;
      },
    };
    appCtx.api = api;

    load(doc);
    win.refreshMenus();
    setTimeout(() => page.focus(), 60);

    win.onClose = () => {
      if (!dirty || forceClose) return true;
      dialog({
        title: 'MacWrite',
        message: `Save the changes to “${doc ? doc.name : DEFAULT_NAME}” before closing?`,
        buttons: ['Save', 'Cancel', "Don't Save"],
        cancelButton: 1,
        defaultButton: 0,
        icon: 'note',
      }).then((r) => {
        if (r.index === 0) {
          appCtx.api.save().then((ok) => { if (ok) { forceClose = true; win.close(); } });
        } else if (r.index === 2) {
          forceClose = true;
          win.close();
        }
      });
      return false;
    };
  },
};
