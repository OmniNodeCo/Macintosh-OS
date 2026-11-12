/* Credits — full credits for the system, the ideas, the images and the type. */

import { el } from '../core/ui.js';
import { scroller } from '../core/wm.js';

const HTML = `
<h1>Credits &amp; sources</h1>
<p class="fine">Macintosh System 6.0 — web clone. A 1-bit homage to the
April 1988 release running on a Macintosh SE: MultiFinder, Set Startup,
MacroMaker, the icon-strip Control Panel and a 30 MB SCSI hard disk beside the
800K startup floppy. Everything below explains what this is, what it is not,
and who deserves the credit.</p>

<h2>The system this recreates</h2>
<p><b>Macintosh System 6.0</b> and <b>Finder 6.1</b>, released by
<b>Apple Computer</b> in April 1988. System 6 was the last of the “classic”
single-tasking systems that everybody actually used, and the first with
<b>MultiFinder</b> in wide circulation: choose Special ▸ Set Startup…, pick
MultiFinder, restart, and applications share the machine instead of taking it
over. The Apple menu then lists the running programs. <b>MacroMaker</b>, a
tape-recorder desk accessory, recorded mouse and keyboard actions. The Control
Panel became the strip-of-icons kind (Keyboard, Mouse, Sound, Memory, Startup
Disk), the ImageWriter LQ joined the Chooser, and the Trash — famously —
emptied itself whenever the Finder quit.</p>
<p class="fine">The real System 6 ran on a 68000 at 8 MHz, drew 512 × 342
pixels at 72 dpi, addressed 24 bits of memory (8 MB ceiling, no virtual
memory), and sold boxed for US$49. This clone runs the same pixel grid in a
browser tab and keeps the ceiling honest: no VM, and the About box shows
“Largest Unused Block” only when MultiFinder is running, exactly as the manual
described it.</p>
<p class="fine">One honest note on the disks: the clone mounts an 800K startup
floppy and a 30 MB Apple Hard Disk 30SC, so free space, ejecting and HFS
nesting all have somewhere to happen. The 400K disk of earlier years is gone;
the SE’s SuperDrive could still read one, but by 1988 nobody wrote them.</p>

<h2>Ideas &amp; people</h2>
<p>The design language being honoured here was invented by the Macintosh
team at Apple: Jef Raskin, Bill Atkinson, Andy Hertzfeld, Susan Kare,
Bruce Horn, Burrell Smith, Bud Tribble, Chris Espinosa, Steve Wozniak and
Steve Jobs, and the later system-software teams who carried the Finder through
System 5 and 6. Their stories are told at folklore.org, in “Revolution in the
Valley”, and in Apple’s own archives.</p>
<p class="fine">MultiFinder’s story runs from Andy Hertzfeld’s Switcher (1985)
through System 5 to System 6, where Set Startup made it a first-class citizen;
System 7 later made it mandatory and retired the dialog.</p>

<h2>What is honestly not simulated</h2>
<ul>
  <li><b>Real multitasking</b> — MultiFinder’s co-operative scheduling is
      represented by state and menus, not by actual time-slicing.</li>
  <li><b>MacroMaker recording</b> — the recorder is a faithful prop; it tapes
      nothing. The real one recorded click locations and mouse paths, and was
      famous for missing buttons that had moved.</li>
  <li><b>Colour &amp; 32-bit QuickDraw</b> — System 6 drew colour on the
      Macintosh II; this clone stays 1-bit on the SE’s screen.</li>
  <li><b>Font/DA Mover, INITs, the 15-desk-accessory limit</b> — mentioned,
      not simulated.</li>
</ul>

<h2>Clone-only conveniences</h2>
<ul>
  <li><b>Insert Disk File…</b> (Apple menu) mounts a fresh 800K disk.</li>
  <li><b>Credits</b> application, and this window’s text.</li>
  <li>The desktop remembers window positions and preferences between visits
      (localStorage) — the real thing forgot everything at shutdown.</li>
</ul>

<h2>Art &amp; type</h2>
<p>Every icon, window frame, desktop pattern and glyph in this clone is
original work drawn in code — no Apple fonts, ROM artwork, icons or sounds are
included. The bitmap typeface is a from-scratch homage (“MacPixel Chicago”) in
the spirit of the original, not a copy of it. No Apple assets were harmed, or
downloaded.</p>

<h2>Sources</h2>
<ul>
  <li>Wikipedia — <i>System 6</i>, <i>System 7</i>, <i>MultiFinder</i>,
      <i>Classic Mac OS</i> (release facts, feature lists, limitations).</li>
  <li>Apple Fandom — <i>Set Startup</i> (the Special ▸ Set Startup… dialog and
      its Finder/MultiFinder options).</li>
  <li>68kmla forums — <i>How to enable MultiFinder in System 6.0.8</i>
      (⌘-⌥-double-click of the MultiFinder file, and the restart rule).</li>
  <li>Higher Intellect Vintage Wiki — <i>MultiFinder</i> (configuration,
      DA Handler, Backgrounder).</li>
  <li>versionmuseum.com — <i>History of the Classic Mac OS</i>.</li>
</ul>

<h2>Licence</h2>
<p class="fine">Original code and artwork in this repository are released under
the MIT licence (see LICENSE in the repository root). “Macintosh”, “Mac”,
“Finder”, “MultiFinder”, “MacroMaker”, “ImageWriter”, “LaserWriter” and
“AppleTalk” are trademarks of Apple Inc.; this project is an unaffiliated,
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
