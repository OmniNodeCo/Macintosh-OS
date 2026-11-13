/* Credits — full credits for the system, the ideas, the official icons and the type. */

import { el } from '../core/ui.js';
import { scroller } from '../core/wm.js';

const HTML = `
<h1>Credits &amp; sources</h1>
<p class="fine">Mac OS 9.0 — web clone. A homage to the 23 October 1999
release ("Sonata", "Your Internet co-pilot") on a Power Macintosh G4
("Yikes!", PCI Graphics): Sherlock 2, Multiple Users, the Keychain and
Software Update, in Platinum at 800 × 600 beside a 10 GB disk, a Zip 100
disk and a 32x CD-ROM. Everything below explains what this is, what it
is not, and who deserves the credit.</p>

<h2>The system this recreates</h2>
<p><b>Mac OS 9.0</b>, released by <b>Apple Computer</b> on 23 October
1999 — the last great classic Mac OS, and the first with over fifty new
features aimed at the Internet. <b>Sherlock 2</b> became a search centre
with channels (Internet, People, Shopping, News, Apple, Pictures,
Reference). <b>Multiple Users</b> put a login panel at startup with
account kinds — Owner, Normal, Limited, Panels, Guest. The
<b>Keychain</b> gathered AppleShare, internet and application passwords
behind one master password with 128-bit encryption. <b>Automatic
Software Update</b> let the Mac check Apple's servers on its own.</p>
<p class="fine">The machine: <b>Power Macintosh G4 350 (PCI Graphics)</b>
("Yikes!", October 1999) — PowerPC 7400 at 350 MHz with the AltiVec
Velocity Engine, 1 MB backside cache, 100 MHz bus, 64 MB PC100 SDRAM
(expandable to 1 GB), a 10 GB Ultra ATA/33 disk, a 32x CD-ROM, ATI Rage
128 with 16 MB, 10/100BASE-T Ethernet and a 56k modem. It shipped
without a floppy drive — the Zip 100 disk here is the removable medium
of 1999. Source: EveryMac technical listings.</p>

<h2>Icon credits — official artwork</h2>
<p>This museum's icons are the <b>official Apple icon artwork</b> of each
era (the museum asked for exactly this), from three kinds of sources:</p>
<ul>
<li><b>1984 original artwork — Susan Kare.</b> The mono-era sets
(System 1.0–6.0) are faithful renderings of Kare's original Macintosh
icon artwork from <b>github.com/thomasareed/Classic-Mac-icons</b>
(recreations of the 1984 Finder/System icons: floppy, Trash, MacWrite,
MacPaint, document, happy Macintosh and friends). Scrapbook's clip is
sliced from a render sheet of Kare's original artwork published by the
<b>Smithsonian (invention.si.edu)</b>, via a Milanote gallery render.</li>
<li><b>System 7 official icons</b>, extracted from Apple's own
<b>Macintosh System 7.5.3</b> disk image (Internet Archive,
archive.org/details/AppleMacintoshSystem753) — the icl8 32 × 32 pixel
art pulled from the image's resource forks and catalogued by
<b>github.com/bearz314/ryos</b>. Thresholded to one bit for the
512 × 342 screens of this museum.</li>
<li><b>Mac OS 8 official icons</b>, extracted the same way from Apple's
<b>Mac OS 8.1 retail CD</b> image (Internet Archive, "Mac OS 8 Version
8.1 691-1912-A"). Platinum gold folders, the grey Trash and friends.</li>
<li><b>Mac OS 9 official icons</b>: the 512 × 512 originals from
<b>github.com/bearz314/MacOS9-icons</b>, extracted from Mac OS 9 system
software (documented at blog.warmwolf.com, 2020). Sherlock's folder,
the Zip disk, the suitcase and friends.</li>
</ul>
<p class="fine">A handful of icons remain drawn in code for this clone
where no clean official bitmap exists at this size: the Calculator,
Puzzle, launcher panel, locked-name badge, MiniFinder/MultiFinder
cubes, MacroMaker, the alias arrow badge and the black Apple logo of
1984–88. Aliases wear the museum's own arrow badge over the official
folder art, the way the Finder drew them. Apple's icon artwork is the
property of Apple Inc., used here for study and nostalgia.</p>

<h2>What is honestly not new here</h2>
<ul>
<li><b>Cooperative multitasking, no protected memory.</b> Mac OS 9 is
still classic Mac OS: one misbehaving application can hang the machine.
The museum keeps that truth — it does not pretend to be OS X.</li>
<li><b>The Sherlock 2 channels answer with period samples</b> — the
museum has no network. The channel interface is real; the results are
theatre, and the panel says so.</li>
<li><b>Multiple Users is names and a ritual</b>, not separate file
areas: accounts live in your browser's storage. The password box is a
prop.</li>
<li><b>The Keychain keeps its secrets in localStorage</b> — honour-system
security. The 128-bit era is honoured in the text.</li>
<li><b>Charcoal</b> is not included; the museum renders its own pixel
face, MacPixelChicago. No Apple fonts, ROMs or sounds anywhere.</li>
</ul>

<h2>Clone-only conveniences</h2>
<ul>
<li>Preferences and the Keychain survive a reload through
<code>localStorage</code>.</li>
<li>"Insert Disk File…" mounts a disk image from your computer.</li>
<li>Credits in the Apple menu, the museum launcher page and the console
API (<code>window.mac</code>) are museum furniture.</li>
</ul>

<h2>Sources</h2>
<ul>
<li>Wikipedia: Mac OS 9; Power Mac G4; Sherlock (software); Keychain.</li>
<li>EveryMac: Power Macintosh G4 350 (PCI) technical specifications.</li>
<li>MacTech 15.11 (November 1999) and contemporary Mac press for
Sherlock 2 channels, Multiple Users account kinds, Keychain behaviour
and Software Update.</li>
</ul>

<h2>The museum</h2>
<p class="fine">The icons above are official Apple artwork, credited
source by source; the chrome, type and sounds are ours. Mac, Macintosh,
Mac OS, Sherlock, Platinum and the happy Macintosh are trademarks of
Apple Inc. This is an homage for study and nostalgia, not an Apple
product.</p>

<p class="fine">Part of the Macintosh-OS museum: System 1.0 (1984),
System 2.0 (1985), System 3.0 (1986), System 6.0 (1988), System 7.0
(1991), Mac OS 8.0 (1997) and Mac OS 9.0 (1999), all booting side by
side.</p>
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
