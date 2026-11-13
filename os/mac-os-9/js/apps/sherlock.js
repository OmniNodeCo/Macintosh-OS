/* Sherlock 2 — Mac OS 9's search centre.

   Sherlock 2 (October 1999) grew from the find-by-content idea into a
   search *centre*: a column of channels — Internet, People, Shopping,
   News, Apple, Pictures, Reference — each of which could be searched at
   once from one box. The real Sherlock 2 phoned home to search engines
   and shops over a dial-up line; this museum has no network, so each
   channel answers with a small period-correct sample and says so.
   (The museum records this openly: the channels are theatre, the
   interface is the exhibit.) */

import { el } from '../core/ui.js';

const CHANNELS = [
  {
    id: 'internet', name: 'Internet', icon: 'app',
    blurb: 'Search the World Wide Web.',
    results: [
      ['Apple — Mac OS 9', 'www.apple.com/macos', 'Your Internet co-pilot. Over 50 new features.'],
      ['Mac OS 9: The Review — MacAddict', 'www.macaddict.com', 'Sherlock 2 alone is worth the upgrade.'],
      ['VersionTracker', 'www.versiontracker.com', 'The place Mac users check twice a day.'],
    ],
  },
  {
    id: 'people', name: 'People', icon: 'app',
    blurb: 'Find people in the phone book and email directories.',
    results: [
      ['Steve K.', 'Cupertino, CA', 'Listing in the People directory.'],
      ['Susan K.', 'San Francisco, CA', 'Listing in the People directory.'],
    ],
  },
  {
    id: 'shopping', name: 'Shopping', icon: 'app',
    blurb: 'Compare prices across online stores.',
    results: [
      ['USB Floppy Drive — $99', 'MacWarehouse', 'In stock. Ships in 24 hours.'],
      ['128 MB SDRAM — $149', 'MacMall', 'For Power Mac G4 (PCI).'],
    ],
  },
  {
    id: 'news', name: 'News', icon: 'app',
    blurb: 'Search today’s news headlines.',
    results: [
      ['Mac OS 9 Ships October 23', 'MacWEEK', '“Your Internet co-pilot” arrives with Sherlock 2.'],
      ['G4 Supply Improves', 'MacCentral', 'Motorola catches up with demand.'],
    ],
  },
  {
    id: 'apple', name: 'Apple', icon: 'appleLarge',
    blurb: 'Search Apple.com support and downloads.',
    results: [
      ['Mac OS 9.0.1 Update', 'Apple Software Updates', 'For all Mac OS 9 users.'],
      ['Power Macintosh G4 (PCI) — Support', 'Apple', 'Documents, downloads and manuals.'],
    ],
  },
  {
    id: 'pictures', name: 'Pictures', icon: 'docPaint',
    blurb: 'Search picture collections.',
    results: [
      ['Graphite G4 Tower', 'Apple Product Images', 'The Yikes! board in its graphite case.'],
    ],
  },
  {
    id: 'reference', name: 'Reference', icon: 'docText',
    blurb: 'Search dictionaries and encyclopedias.',
    results: [
      ['co-pilot (n.)', 'Dictionary', 'One who flies with the pilot; in 1999, your Internet.'],
    ],
  },
];

export default {
  id: 'sherlock',
  name: 'Sherlock 2',
  icon: 'sherlock',
  kind: 'Application',
  w: 460,
  h: 320,
  single: true,
  resizable: true,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [{ label: 'Close', key: 'W', action: () => appCtx.win.close() }],
    }, {
      title: 'Channels',
      items: CHANNELS.map((c) => ({ label: c.name, action: () => appCtx.__select && appCtx.__select(c.id) })),
    }];
  },

  open(appCtx) {
    const { win } = appCtx;
    const wrap = el('div', { class: 'sherlock2', style: { display: 'flex', gap: '8px', height: '100%' } });

    const list = el('div', { style: { width: '120px', overflow: 'auto', borderRight: '1px solid #888', paddingRight: '4px' } });
    const pane = el('div', { class: 'grow', style: { overflow: 'auto' } });
    wrap.append(list, pane);
    win.body.append(wrap);

    const field = el('input', { class: 'field', value: 'Mac OS 9', style: { width: '60%', marginRight: '6px' } });
    const go = el('button', { class: 'btn', text: 'Search' });

    let current = CHANNELS[0];
    const render = () => {
      pane.innerHTML = '';
      pane.append(
        el('div', { style: { fontWeight: 'bold', fontSize: '13px' }, text: `Sherlock 2 — ${current.name}` }),
        el('div', { style: { opacity: '.75', fontSize: '12px', margin: '4px 0' }, text: current.blurb }),
        el('div', { style: { display: 'flex', alignItems: 'center', margin: '8px 0' } }, field, go),
      );
      const res = el('div', { class: 'pad', style: { padding: '4px' } });
      for (const [title, where, note] of current.results) {
        res.append(el('div', { class: 'pad', style: { marginBottom: '6px', borderBottom: '1px dotted #999', paddingBottom: '4px' } },
          el('div', { style: { fontWeight: 'bold', textDecoration: 'underline', color: '#00c' }, text: title }),
          el('div', { style: { fontSize: '11px', opacity: '.7' }, text: where }),
          el('div', { style: { fontSize: '12px' }, text: note }),
        ));
      }
      pane.append(res);
      pane.append(el('div', { style: { marginTop: '8px', opacity: '.65', fontSize: '11px', lineHeight: '13px' },
        text: `Results for “${field.value}” are samples: the museum has no network connection. The channels are Sherlock 2’s.` }));
    };

    const select = (id) => {
      current = CHANNELS.find((c) => c.id === id) || CHANNELS[0];
      for (const n of list.children) n.classList.toggle('sel', n.dataset.id === current.id);
      render();
    };
    appCtx.__select = select;

    for (const c of CHANNELS) {
      const row = el('div', {
        class: 'mi' + (c === current ? ' sel' : ''),
        style: { padding: '3px 6px', cursor: 'default' },
        text: c.name,
      });
      row.dataset.id = c.id;
      row.addEventListener('pointerdown', () => select(c.id));
      list.append(row);
    }

    go.addEventListener('click', render);
    field.addEventListener('keydown', (e) => { if (e.key === 'Enter') render(); });
    render();
    win.refreshMenus();
  },
};
