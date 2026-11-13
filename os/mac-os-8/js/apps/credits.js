/* Credits — full credits for the system, the ideas, the images and the type. */

import { el } from '../core/ui.js';
import { scroller } from '../core/wm.js';

const HTML = `
<h1>Credits &amp; sources</h1>
<p class="fine">Mac OS 8.0 — web clone. A colour homage to the 26 July 1997
release on a Power Macintosh 8600: the Platinum appearance, spring-loaded
folders, contextual menus, a native multithreaded Finder, a 1.4 MB SuperDrive
disk, a 2 GB hard disk and a 12x CD-ROM — all at 640 × 480. Everything below
explains what this is, what it is not, and who deserves the credit.</p>

<h2>The system this recreates</h2>
<p><b>Mac OS 8.0</b>, released by <b>Apple Computer</b> on 26 July 1997 —
the largest overhaul of the Macintosh since System 7, and the place where
years of work on the cancelled <b>Copland</b> project finally reached
machines. Its face is the <b>Apple Platinum</b> appearance: light grey
frames, ridged title bars, candy-box window controls, rounded embossed
buttons, and colour everywhere. The Finder became a <b>native multithreaded
PowerPC application</b> — no more frozen desktop while the Macintosh is
busy. <b>Spring-loaded folders</b> let a dragged item spring a folder open
by hovering; <b>contextual menus</b> put a short, knowing menu on
Control-click. SimpleText arrived as the pack-in text tool (it grew out of
TeachText), Mac OS shipped with QuickTime and the Mac OS Runtime for Java,
and the whole thing is documented as the release that sold over a million
copies in two weeks while Apple needed the money.</p>
<p class="fine">The machine: <b>Power Macintosh 8600/200</b> (“Kansas”,
February 1997) — PowerPC 604e at 200 MHz, 32 MB of RAM, 4 MB ROM, 2 MB
VRAM, a 2.0 GB Fast SCSI disk, a 1.4 MB SuperDrive and a 12x CD-ROM. The
2 GB volume is exactly the ceiling of plain HFS; Mac OS 8.1's HFS Plus
lifted it the following year. Virtual Memory runs here for real — unlike
the SE museum piece, this CPU has an MMU.</p>

<h2>What is new since System 7.0 in this museum</h2>
<ul>
<li><b>Colour, 640 × 480.</b> The first system here not to wear one bit per
pixel. Platinum greys, gold folders, steel disks, periwinkle
highlights.</li>
<li><b>Platinum appearance</b>, drawn in CSS and code: ridged title bars,
candy controls, grey scroll channels, embossed default buttons.</li>
<li><b>Spring-loaded folders.</b> Drag anything over a folder and hold it
there; it opens underneath you.</li>
<li><b>Contextual menus.</b> Control-click an icon for Open, Get Info,
Make Alias, Move to Trash and label items. (Cloned flat — see the notes
below.)</li>
<li><b>Appearance control panel</b> with a working highlight colour: the
swatches recolour menus, selections and icons system-wide.</li>
<li><b>Virtual Memory: available.</b> On/Off and honest about swapping to
the 2 GB disk.</li>
<li><b>SimpleText</b> in the box (a renamed, recoloured MacWrite in this
museum), and a <b>Mac OS 8 CD</b> volume with a locked installer.</li>
</ul>

<h2>What is not here, and why</h2>
<ul>
<li><b>Charcoal.</b> The Mac OS 8 system font is not included — the museum
renders everything in its own pixel face, <b>MacPixelChicago</b>. Our
bitmaps are not Apple's Charcoal.</li>
<li><b>Submenus.</b> Contextual menus here are flat: the Label items stand
alone instead of under a Label submenu. The museum has no submenus in any
system.</li>
<li><b>HFS Plus, Sherlock, Multi-User, Appearance themes beyond Platinum,
QuickTime playback, Java.</b> HFS Plus is 8.1; Sherlock and the Themes
folder are 8.5; the rest needs machinery this museum does not pretend to
have. Mac OS 8's actual 8.0 feature set is what you see.</li>
<li><b>Apple artwork, ROM icons, sounds and fonts</b> of any kind. Every
icon is our own 32 × 32 colour drawing; every sound is synthesised
WebAudio. The icons echo the Platinum colour language (gold folders, steel
disks) without copying Apple's bitmap art.</li>
</ul>

<h2>Clone-only conveniences</h2>
<ul>
<li>Preferences (desktop pattern, highlight colour, Virtual Memory on/off)
survive a reload through <code>localStorage</code>.</li>
<li>"Insert Disk File…" in the Apple menu mounts a disk image from your
computer's filesystem — not something System 7 offered.</li>
<li>Credits in the Apple menu, a launcher page for the whole museum, and
the console API (<code>window.mac</code>) are museum furniture.</li>
<li>MacWrite and MacPaint remain available alongside SimpleText as museum
pieces — in 1997 neither was in the box.</li>
</ul>

<h2>Sources</h2>
<ul>
<li>Wikipedia: Mac OS 8; System 7; Copland; Appearance Manager;
HFS Plus.</li>
<li>Apple Computer, "Mac OS 8" press materials and the Power Macintosh
8600 technical specifications (February 1997): 200 MHz PowerPC 604e,
32 MB RAM, 2 GB Fast SCSI, 1.4 MB SuperDrive, 12x CD-ROM.</li>
<li>The Finder behaviours modelled here (spring-loading delay, contextual
menu contents, Trash persistence, aliases) follow the published System 7
and Mac OS 8 user-interface documentation and contemporary press
descriptions.</li>
</ul>

<h2>The museum</h2>
<p class="fine">Everything on this page is drawn and synthesised in code:
no Apple bitmaps, no Apple sounds, no Apple fonts. The pixel face
MacPixelChicago is our own. The layout borrows the spirit of Susan Kare's
icons and Apple's Platinum design language; the execution is ours. Mac,
Macintosh, Mac OS, Platinum and the happy Macintosh are trademarks of
Apple Inc. This is an homage for study and nostalgia, not an Apple
product.</p>

<p class="fine">Part of the Macintosh-OS museum: System 1.0 (1984),
System 2.0 (1985), System 3.0 (1986), System 6.0 (1988), System 7.0 (1991)
and Mac OS 8.0 (1997), all booting side by side.</p>
`;

export default {
  id: 'credits',
  name: 'Credits',
  icon: 'credits',
  kind: 'Application',
  w: 460,
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
    const sc = scroller(win, { v: true, h: false });
    const box = el('div', { class: 'credits', html: HTML });
    sc.view.append(box);
    win.refreshMenus();
  },
};
