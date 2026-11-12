/* Credits — full credits for the system, the ideas, the images and the type. */

import { el } from '../core/ui.js';
import { scroller } from '../core/wm.js';

const HTML = `
<h1>Credits &amp; sources</h1>
<p class="fine">Macintosh System 1.0 — web clone. A 1-bit homage to the desktop
that started it all. Everything below explains what this is, what it is not,
and who deserves the credit.</p>

<h2>The system this recreates</h2>
<p><b>Macintosh System 1.0</b> and <b>Finder 1.0</b>, released by
<b>Apple Computer</b> on 24 January 1984 with the original Macintosh.
The screen, the menu bar, the pin-striped title bars, the close boxes,
the scroll bars, the 1-bit icons and the desktop patterns are all
recreated from memory and from public documentation of that system.</p>
<p class="fine">The real System 1.0 ran on a 68000 at 8 MHz, drew
512 × 342 pixels at 72 dpi, and had 128K of memory. This clone runs the same
pixel grid in a browser tab, which is roughly a million times faster and a
good deal more forgiving.</p>

<h2>Ideas &amp; people</h2>
<p>The design language being honoured here was invented by the Macintosh
team at Apple:</p>
<ul>
  <li><b>Jef Raskin</b> — started the Macintosh project and its
      “computer for the rest of us” premise.</li>
  <li><b>Bill Atkinson</b> — QuickDraw and MacPaint; the idea that ordinary
      people could draw on a computer.</li>
  <li><b>Andy Hertzfeld</b> — system software, the desktop and the
      celebrated 1984 launch.</li>
  <li><b>Susan Kare</b> — the icons, the typefaces (Chicago, Geneva, Monaco)
      and the friendly face of the machine.</li>
  <li><b>Bruce Horn</b> — the Finder and its folders, windows and trash.</li>
  <li><b>Burrell Smith, Bud Tribble, Chris Espinosa, Steve Wozniak,
      Steve Jobs</b> — the hardware, the business and the nerve.</li>
</ul>
<p class="fine">Their stories are told at folklore.org, in “Revolution in the
Valley”, and in Apple’s own archives.</p>

<h2>Images &amp; icons</h2>
<p><b>Every icon in this project is original pixel art</b>, drawn from
scratch for this clone with a tiny bitmap DSL (js/core/icons.js): the floppy
disk, the folder, the trash basket, the smiling Macintosh, the tool palette,
the digitiser, the puzzle, the clock, the calculator — all of them. The desktop
patterns are likewise generated from original 8 × 8 tiles.</p>
<p>No Apple artwork, icon resources, ROM bitmaps or Finder resources are
included or redistributed. The <i>style</i> — 32 × 32 black-and-white icons
with dithered shading, drawn by Susan Kare for the original Macintosh — is the
inspiration, and the credit for inventing that visual language belongs to
her and to Apple.</p>

<h2>Typeface</h2>
<p>The system is set in <b>MacPixel Chicago</b>, an original Chicago-style
bitmap typeface drawn for this project (tools/build_font.py) and compiled to
WOFF2 with fontTools. Every glyph is hand-plotted on a 12-pixel grid;
none of Apple’s font data is used.</p>
<p class="fine">Chicago was designed by Susan Kare for Apple in 1984 and is
a trademark of Apple Inc. It is <i>not</i> included in this project.
MacPixel Chicago is released under the MIT licence as part of this source
tree, because the clone needs a face that can be shipped legally.</p>

<h2>Sounds</h2>
<p>All audio is synthesised live with the Web Audio API: the start-up chord,
the beeps, the disk insert and eject sounds, and the alarm. No samples of
Apple’s ROM chime are used or included; the start-up sound here is an
original approximation of that famous four-note swell.</p>

<h2>The software</h2>
<p>Hand-written HTML, CSS and JavaScript. No frameworks, no bundler, no
tracking, no network requests. The virtual file system lives in
localStorage, so documents you write and paint stay on your machine.</p>
<ul>
  <li>Window manager, menus, scroll bars, dialogs — js/core/</li>
  <li>Finder, MacWrite, MacPaint, Launcher and the desk accessories — js/apps/</li>
  <li>Bitmap typeface and its build script — tools/build_font.py</li>
</ul>

<h2>Further reading</h2>
<ul>
  <li><a href="https://en.wikipedia.org/wiki/System_1.0" target="_blank" rel="noreferrer">System 1.0 on Wikipedia</a></li>
  <li><a href="https://en.wikipedia.org/wiki/Macintosh_128K" target="_blank" rel="noreferrer">Macintosh 128K on Wikipedia</a></li>
  <li><a href="https://en.wikipedia.org/wiki/Susan_Kare" target="_blank" rel="noreferrer">Susan Kare on Wikipedia</a></li>
  <li><a href="https://www.folklore.org/" target="_blank" rel="noreferrer">folklore.org — Macintosh stories</a></li>
</ul>

<h2>Legal</h2>
<p class="fine">This is an unofficial, non-commercial tribute and is not
affiliated with, endorsed by, or sponsored by Apple Inc. “Macintosh”,
“Finder”, “Chicago” and the Apple logo are trademarks of Apple Inc.
No Apple software, ROM code, fonts or artwork are distributed with this
project. Names are used descriptively to refer to the historical system
being recreated.</p>
<p class="mark">Thank you, Macintosh team. 1984.</p>
`;

export default {
  id: 'credits',
  name: 'Credits',
  icon: 'credits',
  kind: 'Application',
  w: 430,
  h: 284,
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
    const sc = scroller(win, { v: true, h: false });
    const box = el('div', { class: 'credits', html: HTML });
    sc.view.append(box);
    win.refreshMenus();
  },
};
