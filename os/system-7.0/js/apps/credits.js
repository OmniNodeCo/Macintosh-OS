/* Credits — full credits for the system, the ideas, the images and the type. */

import { el } from '../core/ui.js';
import { scroller } from '../core/wm.js';

const HTML = `
<h1>Credits &amp; sources</h1>
<p class="fine">Macintosh System 7.0 — web clone. A 1-bit homage to the
13 May 1991 release on a Macintosh SE with its memory maxed out: the System 7
look, aliases, Balloon Help, About This Macintosh, the Application menu,
labels, a 1.4 MB SuperDrive disk and an 80 MB hard disk. Everything below
explains what this is, what it is not, and who deserves the credit.</p>

<h2>The system this recreates</h2>
<p><b>Macintosh System 7.0</b> (development name “Big Bang”), released by
<b>Apple Computer</b> on 13 May 1991. System 7 rebuilt the Macintosh
interface: beveled windows and embossed controls, a desktop that wears grey
linen, <b>aliases</b> (File ▸ Make Alias), <b>Balloon Help</b> in a new Help
menu, <b>TrueType</b> outline fonts, <b>AppleScript</b>, <b>Publish &amp;
Subscribe</b>, virtual memory (on machines with a 68020 or better), and a
<b>Trash that is a real folder</b> — throw something away and restart; it is
still there. The Control Panel desk accessory became a folder of separate
panel programs, the Apple menu is built from the <b>Apple Menu Items</b>
folder, and the running programs moved to the <b>Application menu</b> at the
right end of the menu bar. Force Quit arrived on ⌘-Option-Escape.</p>
<p class="fine">The real System 7 ran 32-bit QuickDraw and required 2 MB of
RAM; this clone keeps the SE's 512 × 342 one-bit screen, so the colour
editions are out of scope — but the SE really did run System 7 in black and
white, and the bevels and linen are honest at 1 bit. The virtual-memory panel
is present and honestly unavailable, because the SE's 68000 cannot do it.</p>
<p class="fine">One honest note on the disks: the clone mounts a 1.4 MB
SuperDrive floppy and an 80 MB SCSI hard disk, the sizes a 1991 desktop
machine actually carried.</p>

<h2>The Blue Meanies</h2>
<p class="fine">System 7 was written by a team that called itself the
<b>Blue Meanies</b>, after the film “Yellow Submarine”; the release kept a
secret about box in their honour. Option-click the little Macintosh in About
This Macintosh here for a small bow in the same direction.</p>

<h2>Ideas &amp; people</h2>
<p>The design language being honoured here was invented by the Macintosh
team at Apple — Jef Raskin, Bill Atkinson, Andy Hertzfeld, Susan Kare,
Bruce Horn, Burrell Smith, Bud Tribble, Chris Espinosa, Steve Wozniak and
Steve Jobs — and carried forward by the system-software teams of the late
1980s and early 1990s. Their stories are told at folklore.org, in “Revolution
in the Valley”, and in Apple’s own archives.</p>

<h2>What is honestly not simulated</h2>
<ul>
  <li><b>Colour &amp; 32-bit QuickDraw</b> — System 7's colour screen modes
      need a Macintosh II-class monitor; the SE is 1-bit and stays 1-bit.</li>
  <li><b>AppleScript, AppleEvents, Publish &amp; Subscribe, file sharing</b>
      — named and honoured, not simulated.</li>
  <li><b>Virtual memory</b> — the panel exists and says exactly why it is
      unavailable: this CPU is a 68000.</li>
  <li><b>TrueType rendering</b> — the bitmap homage typeface stands in for
      the real outlines.</li>
</ul>

<h2>Clone-only conveniences</h2>
<ul>
  <li><b>Insert Disk File…</b> (Apple menu) mounts a fresh 1.4 MB disk.</li>
  <li><b>Credits</b> application, and this window's text.</li>
  <li>The desktop remembers window positions, labels and preferences
      between visits (localStorage) — close enough to the real Trash, which
      System 7 made persistent too.</li>
</ul>

<h2>Art &amp; type</h2>
<p>Every icon, bevel, dither pattern and glyph in this clone is original work
drawn in code — no Apple fonts, ROM artwork, icons or sounds are included.
The bitmap typeface is a from-scratch homage (“MacPixel Chicago”) in the
spirit of the original, not a copy of it. No Apple assets were harmed, or
downloaded.</p>

<h2>Sources</h2>
<ul>
  <li>Wikipedia — <i>System 7</i>, <i>System 6</i>, <i>Classic Mac OS</i>,
      <i>Alias (Mac OS)</i>, <i>Balloon Help</i>, <i>TrueType</i> (release
      facts, feature lists, the Blue Meanies).</li>
  <li>versionmuseum.com — <i>History of the Classic Mac OS</i>.</li>
  <li>folkware/Apple archives and folklore.org — the design history.</li>
</ul>

<h2>Licence</h2>
<p class="fine">Original code and artwork in this repository are released under
the MIT licence (see LICENSE in the repository root). “Macintosh”, “Mac”,
“Finder”, “System 7”, “TrueType”, “AppleTalk”, “AppleScript” and
“Macintosh SE” are trademarks of Apple Inc.; this project is an unaffiliated,
non-commercial homage for historical study. Not an Apple product.</p>
`;

export default {
  id: 'credits',
  name: 'Credits',
  icon: 'note',
  kind: 'Application',
  w: 420,
  h: 300,
  single: true,

  menus(appCtx) {
    return [{
      title: 'File',
      items: [{ label: 'Close', key: 'W', action: () => appCtx.win.close() }],
    }];
  },

  open(appCtx) {
    const { win } = appCtx;
    const sc = scroller();
    sc.body.classList.add('credits');
    sc.body.innerHTML = HTML;
    win.body.append(sc.root);
    win.refreshMenus();
  },
};
