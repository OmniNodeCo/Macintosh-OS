/* Software Update — Mac OS 9's update panel.

   Automatic Software Update (new in Mac OS 9, October 1999) was the
   first time the Mac checked Apple's servers on its own and offered to
   install what it found: system updates, new drivers, bundled
   applications. Press Update Now, the modem sang, and a list appeared.

   This museum has no network, so Update Now runs the theatre — a scan,
   a pause, then the *kind* of list Mac OS 9 showed in 1999 — and the
   panel says so in plain words. Nothing here phones anywhere. */

import { el } from '../core/ui.js';

const OFFERS = [
  ['Mac OS 9.0.4', 'Recommended', '12.4 MB', 'Networking, USB and FireWire updates.'],
  ['Apple DVD Player 2.0', 'Recommended', '2.1 MB', 'For Macs with a DVD-ROM drive.'],
  ['QuickTime 4.1.3', 'Recommended', '5.8 MB', 'Streaming, new codecs, the works.'],
  ['iMac Firmware Update 1.2', 'Optional', '1.0 MB', 'Only for iMac (slot-loading).'],
];

export default {
  id: 'softwareupdate',
  name: 'Software Update',
  icon: 'softwareupdate',
  kind: 'Application',
  w: 400,
  h: 300,
  single: true,
  resizable: true,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [{ label: 'Close', key: 'W', action: () => appCtx.win.close() }],
    }];
  },

  open(appCtx) {
    const { win } = appCtx;
    const wrap = el('div', { class: 'swupdate', style: { padding: '8px' } });

    wrap.append(
      el('div', { style: { fontWeight: 'bold', fontSize: '13px' }, text: 'Automatic Software Update' }),
      el('div', { style: { opacity: '.75', fontSize: '12px', margin: '4px 0 8px' },
        text: 'This control panel connects to Apple’s software server and lists what is new for your Mac.' }),
    );

    const bar = el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' } });
    const status = el('div', { class: 'grow', style: { fontSize: '11px', opacity: '.85' }, text: 'Last checked: never.' });
    const go = el('button', { class: 'btn', text: 'Update Now' });
    bar.append(status, go);

    const list = el('div', { style: { border: '1px solid #888', background: '#fff', height: '130px', overflow: 'auto' } });

    const footer = el('div', { style: { marginTop: '8px', opacity: '.65', fontSize: '11px', lineHeight: '13px' },
      text: 'In 1999 this was magic: the Mac checking for its own updates over a 56k modem. The museum cannot reach the network, so the list below is a period sample — the panel’s behaviour is the exhibit.' });

    let ran = false;
    go.addEventListener('click', () => {
      if (ran) { status.textContent = 'Everything is up to date.'; return; }
      status.textContent = 'Connecting to Apple Computer, Inc…';
      list.innerHTML = '';
      setTimeout(() => {
        status.textContent = 'Checking…';
        setTimeout(() => {
          ran = true;
          status.textContent = `Found ${OFFERS.length} items — ${new Date().toLocaleDateString()}.`;
          for (const [name, kind, size, note] of OFFERS) {
            list.append(el('div', { style: { borderBottom: '1px dotted #bbb', padding: '4px 6px', fontSize: '11px' } },
              el('div', { style: { display: 'flex', gap: '8px' } },
                el('b', { class: 'grow', text: name }),
                el('span', { style: { opacity: '.75' }, text: kind }),
                el('span', { style: { opacity: '.75' }, text: size }),
              ),
              el('div', { style: { opacity: '.7' }, text: note }),
            ));
          }
        }, 700);
      }, 600);
    });

    wrap.append(bar, list, footer);
    win.body.append(wrap);
  },
};
