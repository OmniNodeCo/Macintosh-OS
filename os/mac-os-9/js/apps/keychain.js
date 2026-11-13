/* Keychain Access — Mac OS 9's password drawer.

   The Keychain (Mac OS 9, October 1999) collected your AppleShare
   passwords, internet passwords and application passwords in one
   encrypted file, guarded by a single master password, using 128-bit
   encryption. Unlock the keychain once per session and the Mac filled
   in the rest.

   The museum keeps its keychain in your browser's localStorage: the
   128-bit era is honoured in the text, not in the code — a web page
   cannot keep secrets from the person using the browser. The panel
   still teaches the ritual: create, add items, lock, unlock. */

import { el } from '../core/ui.js';
import { dialog } from '../core/wm.js';

const SEED = [
  ['AppleShare server', 'afp://atalk.office.example', 'AppleShare'],
  ['mail.example.net', 'alex', 'Internet password'],
  ['Disk Copy', '—', 'Application password'],
];

function loadItems() {
  try {
    const raw = localStorage.getItem('macintosh-os.9.0.keychain.v1');
    return raw ? JSON.parse(raw) : SEED.map((r) => [...r]);
  } catch (e) {
    return SEED.map((r) => [...r]);
  }
}
function saveItems(items) {
  try { localStorage.setItem('macintosh-os.9.0.keychain.v1', JSON.stringify(items)); } catch (e) { /* ignore */ }
}

export default {
  id: 'keychain',
  name: 'Keychain Access',
  icon: 'keychain',
  kind: 'Application',
  w: 420,
  h: 300,
  single: true,
  resizable: true,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [{ label: 'Close', key: 'W', action: () => appCtx.win.close() }],
    }, {
      title: 'Keychain',
      items: [
        { label: 'Add Item…', action: () => appCtx.__add && appCtx.__add() },
        { label: 'Lock / Unlock', action: () => appCtx.__lock && appCtx.__lock() },
      ],
    }];
  },

  open(appCtx) {
    const { win } = appCtx;
    const wrap = el('div', { class: 'keychain', style: { padding: '8px' } });

    let items = loadItems();
    let locked = false;
    let hasMaster = false;

    const head = el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } });
    const status = el('div', { class: 'grow', style: { fontSize: '11px', opacity: '.8' } });
    const lockBtn = el('button', { class: 'btn', text: 'Lock' });
    const addBtn = el('button', { class: 'btn', text: 'Add Item…' });
    const masterBtn = el('button', { class: 'btn', text: 'Set Master Password…' });
    head.append(status, masterBtn, addBtn, lockBtn);

    const table = el('div', { style: { border: '1px solid #888', height: '120px', overflow: 'auto', background: '#fff' } });

    const footer = el('div', { style: { marginTop: '8px', opacity: '.65', fontSize: '11px', lineHeight: '13px' },
      text: 'Mac OS 9 protected the keychain with 128-bit encryption and one master password. Here the keychain is stored in your browser — honour-system security, on purpose: a web page cannot hide anything from the person at the keyboard.' });

    const render = () => {
      status.textContent = locked
        ? 'The keychain is locked. Unlock it to see your passwords.'
        : (hasMaster ? 'Keychain unlocked (master password set).' : 'Keychain unlocked. No master password yet — set one.');
      table.innerHTML = '';
      if (locked) {
        table.append(el('div', { class: 'pad', style: { padding: '10px', opacity: '.6' }, text: '🔒 locked' }));
      } else {
        for (const [name, account, kind] of items) {
          table.append(el('div', {
            style: { display: 'flex', gap: '8px', fontSize: '11px', padding: '3px 6px', borderBottom: '1px dotted #bbb' },
          },
            el('b', { style: { width: '130px' }, text: name }),
            el('span', { style: { width: '70px', opacity: '.8' }, text: account }),
            el('span', { class: 'grow', style: { opacity: '.7' }, text: kind }),
            el('span', { style: { opacity: '.8' }, text: '••••••••' }),
          ));
        }
      }
    };

    masterBtn.addEventListener('click', async () => {
      const r = await dialog({
        title: 'Keychain', icon: 'keychain',
        message: 'Enter a master password for your keychain.\nIt opens every password inside.',
        input: true, value: '', buttons: ['Cancel', 'Set'],
      });
      if (r.index === 1) {
        hasMaster = r.value.length > 0;
        render();
      }
    });

    addBtn.addEventListener('click', async () => {
      const r = await dialog({
        title: 'Add Keychain Item', icon: 'keychain',
        message: 'Name:', input: true, value: 'server.example.net', buttons: ['Cancel', 'Add'],
      });
      if (r.index === 1 && r.value.trim()) {
        items.push([r.value.trim(), '—', 'Internet password']);
        saveItems(items);
        render();
      }
    });

    lockBtn.addEventListener('click', () => {
      locked = !locked;
      lockBtn.textContent = locked ? 'Unlock' : 'Lock';
      render();
    });

    appCtx.__add = () => addBtn.click();
    appCtx.__lock = () => lockBtn.click();

    wrap.append(head, table, footer);
    win.body.append(wrap);
    render();
    win.refreshMenus();
  },
};
