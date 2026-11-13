/* Multiple Users — Mac OS 9's login screen and account kinds.

   Multiple Users (part of Mac OS 9, October 1999) let several people
   share one Mac: at startup a login panel offered each account, and the
   account *kind* set what that person could touch — Owner (everything,
   including the account list), Normal (their own stuff), Limited (only
   chosen applications), Panels (just chosen control panels), and Guest
   (a blank, wiped-at-logout session). Settings and files were kept
   apart per user.

   The museum clones the login panel and the account-kind list. It is
   honest about the limits: accounts are names in browser storage, not
   separate file areas, and there is no password cracking to resist —
   the password box is a faithful prop. */

import { el } from '../core/ui.js';

const KINDS = [
  ['Owner', 'Full access to the computer: all files, all control panels, the account list itself. There is one owner.'],
  ['Normal', 'Their own files and applications; can change their own settings.'],
  ['Limited', 'Only the applications you choose. Everything else is out of reach.'],
  ['Panels', 'Only the control panels you choose. Good for a shared lab Mac.'],
  ['Guest', 'A blank session that is thrown away at logout.'],
];

const ACCOUNTS = [
  { name: 'Owner', kind: 'Owner', icon: 'suitcase' },
  { name: 'alex', kind: 'Normal', icon: 'app' },
  { name: 'lab-1', kind: 'Limited', icon: 'app' },
  { name: 'printer', kind: 'Panels', icon: 'controlpanel' },
  { name: 'Guest', kind: 'Guest', icon: 'extension' },
];

export default {
  id: 'multipleusers',
  name: 'Multiple Users',
  icon: 'multipleusers',
  kind: 'Application',
  w: 380,
  h: 300,
  single: true,
  resizable: false,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [{ label: 'Close', key: 'W', action: () => appCtx.win.close() }],
    }];
  },

  open(appCtx) {
    const { win } = appCtx;
    const wrap = el('div', { class: 'mu', style: { padding: '8px' } });

    wrap.append(
      el('div', { style: { fontWeight: 'bold', fontSize: '13px' }, text: 'Multiple Users' }),
      el('div', { style: { opacity: '.75', fontSize: '12px', margin: '4px 0 8px' },
        text: 'Log in at the login panel below — or read what each kind of account may do.' }),
    );

    // the login panel, as at startup
    const panel = el('div', {
      style: {
        border: '2px solid #555', borderRadius: '6px', background: 'linear-gradient(#eee, #ccc)',
        padding: '10px', marginBottom: '10px',
      },
    });
    panel.append(el('div', { style: { fontWeight: 'bold', textAlign: 'center', marginBottom: '6px' }, text: 'Log In' }));

    const userRow = el('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px', flexWrap: 'wrap' } });
    let picked = ACCOUNTS[0];
    const pw = el('input', { class: 'field', type: 'password', placeholder: 'Password', style: { width: '140px' } });
    const status = el('div', { style: { fontSize: '11px', opacity: '.75', minHeight: '14px', marginTop: '4px', textAlign: 'center' } });

    for (const a of ACCOUNTS) {
      const tile = el('div', {
        style: { textAlign: 'center', cursor: 'default', padding: '2px 6px', border: '1px solid transparent', borderRadius: '4px' },
        title: a.kind,
      },
        el('img', { src: `../../assets/icons/mac-os-9.0/${a.icon === 'controlpanel' ? 'controlpanel' : a.icon === 'suitcase' ? 'suitcase' : a.icon === 'extension' ? 'extension' : 'app'}.png`, width: 32, height: 32, alt: '' }),
        el('div', { style: { fontSize: '11px' }, text: a.name }),
        el('div', { style: { fontSize: '9px', opacity: '.7' }, text: a.kind }),
      );
      tile.addEventListener('pointerdown', () => {
        picked = a;
        for (const n of userRow.children) n.style.borderColor = 'transparent';
        tile.style.borderColor = '#333';
      });
      userRow.append(tile);
    }
    userRow.children[0].style.borderColor = '#333';

    const loginBtn = el('button', { class: 'btn', text: 'Log In' });
    loginBtn.addEventListener('click', () => {
      status.textContent = `Welcome, ${picked.name} (${picked.kind}). Logged in — settings would follow you; files would not.`;
      if (window.mac && window.mac.prefs) {
        window.mac.prefs.muUser = picked.name;
        if (window.mac.savePrefs) window.mac.savePrefs();
      }
    });

    panel.append(userRow, el('div', { style: { textAlign: 'center' } }, pw, loginBtn), status);
    wrap.append(panel);

    // account kinds
    wrap.append(el('div', { style: { fontWeight: 'bold', fontSize: '12px', margin: '6px 0' }, text: 'Account kinds' }));
    const kinds = el('div', { style: { fontSize: '11px', lineHeight: '13px' } });
    for (const [k, d] of KINDS) {
      kinds.append(el('div', { style: { marginBottom: '3px' } },
        el('b', { text: k + ' — ' }), document.createTextNode(d)));
    }
    wrap.append(kinds);
    wrap.append(el('div', { style: { marginTop: '6px', opacity: '.65', fontSize: '11px', lineHeight: '12px' },
      text: 'The museum stores account names in your browser only. The password box is a period prop — do not entrust it with secrets.' }));

    win.body.append(wrap);
  },
};
