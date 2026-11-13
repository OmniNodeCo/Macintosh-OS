# Credits

**Macintosh System 1.0 — Web Clone** is a fan-made, non-commercial homage to the
1984 Apple Macintosh. It is not affiliated with, endorsed by, or sponsored by
Apple Inc. It ships **no Apple code, ROM images, fonts, icons, sounds or other
assets**: every pixel, glyph, beep and line of code in this repository was made
for this project.

---

## 1. The system and the ideas

The behaviour and the look of this clone are modelled on **Macintosh System 1.0
(1984)** with **Finder 1.0**, and on the design language that its team invented —
the menu bar that belongs to the active application, windows with striped title
bars and close/zoom boxes in the corners, black-and-white 1-bit icons, desk
accessories, the Trash, and a computer that says *hello* when you switch it on.

Credit and thanks for those ideas go to the people who built the original
Macintosh:

| Person | Contribution that this clone imitates |
| --- | --- |
| **Bill Atkinson** | QuickDraw and the bitmapped screen model; the region/clipping ideas behind the window, menu and dialog chrome; the original MacPaint |
| **Andy Hertzfeld** | Much of the system software, the desk-accessory mechanism, the Control Panel, the Alarm Clock, the Note Pad, the Scrapbook, and the sound engine |
| **Susan Kare** | The icon language and the bitmap typefaces that the 1-bit aesthetic is built on (our glyphs and icons are *redrawn from scratch*, not copied) |
| **Bruce Horn** | Finder 1.0 — the desktop metaphor with icons, folders and the Trash |
| **Jef Raskin** | The original Macintosh project and its "computer for the rest of us" intent |
| **Burrell Smith** | The hardware that made the 512 × 342 1-bit screen possible |
| **Jerry Manock** | The case design of the Macintosh 128K that the beige frame in this page imitates |
| **Steve Capps** | Finder, plus the "Guide" and other early Mac software |
| **Chris Espinosa**, **Joanna Hoffman**, **Bud Tribble**, **George Crow**, **Donn Denman**, **Caroline Rose**, **Patti King**, **Randy Wigginton** and the rest of the Macintosh and Lisa teams | the rest of the system, applications and documentation |

The fictional-but-faithful scenario in the *Welcome* document, the wording of the
dialogs and the layout of the menus are our own reconstruction from documented
descriptions of System 1.0 — nothing is quoted verbatim from Apple's code or
manuals.

### Written and web sources consulted

* **Revolution in the Valley: The Insanely Great Story of How the Mac Was Made** —
  Andy Hertzfeld (O'Reilly, 2004). Anecdotes used for the desk accessories, the
  startup chime and the Finder's behaviour.
* **Folklore.org** — the same stories in web form; primary source for details such
  as the 512 × 342 screen size, the "happy Mac" and the icon grid.
* **Inside Macintosh, Volume I** (Apple Computer, 1985) — the window, menu, dialog
  and QuickDraw conventions that the chrome here follows.
* **Human Interface Guidelines: The Apple Desktop Interface** (Apple, 1987) — for
  the menu/window/icon rules that System 1.0 established.
* **Macintosh System 1.0 documentation and screen archives** (e.g. the Internet
  Archive's software library and the Macintosh Garden) — studied for layout,
  proportions and the wording of menus; **no files from those archives are
  included in this repository**.

## 2. The images

All artwork in this project is **original**, drawn as code:

* **Icons** — `js/core/icons.js`. Every icon (disk, folder, document, Trash,
  applications, desk accessories, MacPaint tools, the Apple menu's apple, the
  happy Mac) is a hand-written 1-bit bitmap built with the small `Bitmap` helper
  in the same file, then rendered to a canvas. Nothing is traced from or copied
  out of Apple's ROM, and nothing is downloaded from an icon set.
  The redrawn apple in the menu bar is a stylistic reference to the rainbow apple
  logo, which is a trademark of Apple Inc.; it is used here only to signal what
  this project is a tribute to.
* **Desktop patterns and paint patterns** — `js/core/patterns.js`, generated as
  CSS `repeating-linear-gradient`s or 8 × 8 dither masks.
* **The Macintosh case, CRT bezel, floppy slot and wordmark** — `css/mac.css`
  (`#stage`, `#screen`), pure CSS gradients and box shadows.
* **The startup "happy Mac"** — drawn in `drawHappyMac()` in `js/core/icons.js`.
* **Favicon** — `assets/icons/favicon.svg`, hand-written SVG.

No stock photography or third-party illustration is used anywhere.

## 3. The typeface

**“MacPixel Chicago”** is an original 12 px bitmap typeface drawn for this
project on a 4 × 8 unit grid and compiled into a real font file
(`assets/fonts/MacPixelChicago.ttf` and `.woff2`) by `tools/build_font.py`
(FontTools). It is *inspired by* the look of Chicago, the Apple menu-bar font
designed by Susan Kare and later digitised by Apple — but it is not Chicago, it
is not derived from any Apple font data, and no Apple font file is included or
required. Chicago itself is © Apple Inc. and is not licensed for redistribution,
which is precisely why this typeface was drawn from scratch.

The font, and the icons and other art in `js/core/icons.js`, are released under
the MIT licence together with the rest of the project (see `LICENSE`).

## 4. Sound

Every sound is synthesised at runtime with the Web Audio API
(`js/core/sound.js`): the startup chime, key clicks, the beep, the disk-insert
whirr and the shutdown tone. No audio files are used and no Apple recording is
sampled. The chime is an original chord progression written to *evoke* the
feeling of the 1984 startup sound, not a reproduction of it.

## 5. Code

All HTML, CSS and JavaScript was written for this project. There are **no
third-party runtime libraries** — no frameworks, no icon fonts, no analytics.
`tools/build_font.py` uses FontTools, Brotli and Pillow as build-time
dependencies only; the generated font is committed, so running the site needs
nothing but a static file server.

## 6. What is deliberately *not* here

* No Apple system software, ROM, disk images or resources.
* No Apple fonts (Chicago, Geneva, Monaco, New York…).
* No Apple sound files.
* No copied icons, cursors or desktop pictures from Apple's ROM or from any
  third-party icon pack.
* No Apple logos other than the redrawn apple used as a menu-bar glyph in a
  clearly-labelled fan tribute.

## 7. Trademarks

Macintosh, Mac, Finder, MacWrite, MacPaint, Key Caps, Alarm Clock, Note Pad,
Scrapbook, Control Panel, System 1.0 and the Apple logo are trademarks of
Apple Inc., registered in the U.S. and other countries. They are used here in a
descriptive, nominative sense, to say what this fan project is a tribute to.

## 8. Scope note: the Launcher

System 1.0 did not have a Launcher — Apple's Launcher desk accessory arrived
with System 7 in 1991. This clone includes one because it is a *launcher for a
web OS* first and a period replica second: the Launcher window, its icon grid
and its "Applications / n items" header are drawn in the same 1-bit Finder
style, but they are an addition to the 1984 feature set, and are credited here
as such.

## 9. Licence

* **Code, artwork, typeface and documentation:** MIT — see `LICENSE`.
* **Name and inspiration:** Apple Inc. and the Macintosh team, as described above.

If you believe something here misuses protected material, please open an issue
and it will be removed.

## System 2.0 (April 1985)

The second recreation in this repository, `os/system-2.0/`, follows the April 1985
release: **System 2.0 / Finder 4.1**. The version jump (1.1 → 4.1) and the command list —
New Folder in, Empty Folder / Put Back / Close All out, Print Catalog, Shut Down and
Use MiniFinder in, plus the Choose Printer desk accessory and eject-by-Trash — are
documented in Apple's release notes and in the histories listed below. The all-white disk
icon, the shortened start-up and the 512K figure follow the 512K Macintosh.

Nothing from Apple's disks is included: the Finder 4.1 behaviours were reimplemented from
public descriptions, and the Choose Printer and MiniFinder screens are original drawings.

## System 3.0 (January 1986)

The third recreation, `os/system-3.0/`, is **System 3.0 / Finder 5.1** — sold as System
Software 0.7 and shipped with the Macintosh Plus in January 1986. The feature set follows
the release histories: HFS and 800K startup disks, SCSI and the Apple HD20, the zoom box,
the redesigned Control Panel with its labelled controls and RAM cache, Trash "bulging",
and the Chooser replacing Choose Printer with AppleTalk, zones and a live device list.
The disappearance of MiniFinder and the mountain scene in About the Finder, and their
replacement by a memory meter, are likewise documented changes of this release.

Sources for the 3.0 detail: Wikipedia's *Classic Mac OS* / *System Software 4* release
table, HandWiki's System 3 entry, the Apple Museum's early-Mac-OS page, Infinite Mac's
1986 notes, Version Museum's screenshots (System 3 desktop, System Folder, Control Panel),
MacTech's 1986 article on how the Chooser works with AppleTalk, and Low End Mac on what
shipped in the box.

Again, nothing from Apple's disks: Finder 5.1's behaviour was reimplemented from public
descriptions, and every pixel of the Chooser, the test page, the HD20, the memory meter and
the 400K disk is drawn for this clone.

Three things here are the clone's own and are labelled as such in the code:

* **The Launcher.** Apple's Launcher arrived with System 7. The icon-grid Launcher in this
  museum is this project's, carried into each system so the desk accessories are always
  reachable. MiniFinder — the authentic 2.0-era launcher — is still present in
  `os/system-2.0/`, and gone from 3.0, where Apple retired it.
* **The printer test page.** The Chooser in 3.0 chose a printer; it did not print a test
  page. The one in the File menu is a convenience, drawn as a 1-bit sheet.
* **The three-volume disk set.** A real Plus booted from a single 800K floppy. The HD20
  and the 400K MacPaint disk exist so that per-volume free space, HFS nesting and ejecting
  all have somewhere to happen.

## System 6.0 (April 1988)

The fourth recreation, `os/system-6.0/`, is **System 6.0 / Finder 6.1** on a Macintosh SE.
The feature set follows the documented release: **MultiFinder** and its **Special ▸ Set
Startup…** dialog (Finder or MultiFinder, plus what opens at startup — the change took
effect at the next restart, as here), the Apple menu's running-programs list under
MultiFinder, the "Largest Unused Block" line appearing in the About box only when
MultiFinder runs, **MacroMaker** (the tape-recorder desk accessory new in System 6.0), the
**Control Panel as a strip of device icons** (cdevs: Keyboard, Mouse, Sound, Memory,
Startup Disk), the **ImageWriter LQ** driver new in this release, the Trash emptying when
the Finder terminates, and the locked system files (System, Finder, MultiFinder, DA
Handler, Backgrounder, printer drivers).

Sources for the 6.0 detail: Wikipedia's *System 6* (release date, MultiFinder, MacroMaker,
ImageWriter LQ, Trash behaviour, 24-bit/8 MB limits, the not-a-menu application icon), the
Apple Fandom *Set Startup* page (the dialog's exact options), the 68kmla forum thread on
enabling MultiFinder (⌘-Option-double-click of the MultiFinder file; restart rule), the
Higher Intellect Vintage Wiki *MultiFinder* page (DA Handler, Backgrounder, About box
behaviour), and Version Museum's Classic Mac OS history.

The clone's own, marked as such: **Insert Disk File…**, the **Credits** application, the
**Desktop Pattern pane** (pattern pickers lived in the Control Panel family of this era;
the exact cdev list varied by machine), and the two-volume disk set (a real SE booted from
one floppy or one hard disk; both are mounted so free space and SCSI have somewhere to
happen). MacroMaker's recorder is a faithful prop that records nothing.

## System 7.0 (May 1991)

The fifth recreation, `os/system-7.0/`, is **System 7.0** — "Big Bang", released 13 May
1991 — on the same SE screen, in one bit per pixel (the SE genuinely ran System 7 in black
and white). Recreated from the documented release: the **System 7 look** (beveled window
frames, embossed rounded buttons with a ringed default button, ridged grow boxes, dithered
scroll channels, the 50% grey linen desktop), **aliases** (File ▸ Make Alias, badge,
double-click to the original), **Balloon Help** (Help menu, balloons over the icons),
**labels** with the seven names of the Label menu (Essential … Project 2) drawn as
patterned bands, **About This Macintosh** with per-application memory bars and the Largest
Unused Block, the **Application menu** at the right end of the menu bar, **Control Panels**
as separate panel files in their own folder (with **Virtual Memory** honestly unavailable
on a 68000), the **Apple Menu Items folder** building the Apple menu, **Find…**, **Force
Quit** on ⌘/Ctrl-Option-Escape, and a **Trash that persists** — a real folder since
System 7. The **Blue Meanies** easter egg (Option-click the Macintosh in About) bows to
the System 7 team's own nickname; no individual names are claimed.

Sources for the 7.0 detail: Wikipedia's *System 7* (feature list, Blue Meanies, release
date, mandatory MultiFinder, Trash-as-directory, Extensions and Control Panels folders,
Apple menu relocation), *Alias (Mac OS)*, *Balloon Help* and *TrueType*; Version Museum's
Classic Mac OS history.

The clone's own, marked as such: **Insert Disk File…** (mounting a 1.4 MB disk), the
**Credits** application, the exact bevel arithmetic (1-bit dithers stand in for System 7's
shades), and the desktop's localStorage memory of window positions and labels. AppleScript,
AppleEvents, Publish & Subscribe, personal file sharing and TrueType outline rendering are
named and honoured but not simulated; the virtual-memory panel exists precisely to say why
it cannot work here.

## Mac OS 8.0 (July 1997)

**System:** Mac OS 8.0 (released 26 July 1997; the "Allegro" release built from
the remains of Copland) running on a **Power Macintosh 8600/200** ("Kansas",
February 1997): PowerPC 604e at 200 MHz, 32 MB of RAM, 4 MB ROM, 2 MB VRAM,
2.0 GB Fast SCSI disk, 1.4 MB SuperDrive, 12x CD-ROM. Sources: Wikipedia
(Mac OS 8, Copland, Appearance Manager, HFS Plus) and Apple's Power
Macintosh 8600 technical specifications. The 2 GB volume is exactly plain
HFS's ceiling — HFS Plus arrived with Mac OS 8.1. Virtual Memory is real
here: the 604e has an MMU.

**What is drawn for the first time in colour:** the **Apple Platinum
appearance** — light grey window frames, ridged active title bars, candy-box
window controls, rounded embossed buttons, grey scroll channels and a
highlight colour. All of it is CSS and our own pixel art: no Platinum
resources, no Apple bitmaps. The colour icons (gold folders, steel disks,
periwinkle alias arrows) are our own 32 × 32 drawings that echo the Platinum
colour language without copying Apple's icon art. The default highlight
colour (periwinkle) and the seven Appearance swatches are our
approximations of the Appearance Manager's colour choices.

**Not included, marked plainly:** the **Charcoal** system font (Mac OS 8's
face) is NOT included — everything renders in the museum's own pixel face,
MacPixelChicago. **Submenus:** contextual menus here are flat — the Label
items stand alone instead of under a Label submenu (the museum has no
submenus in any system). **HFS Plus, Sherlock, Multi-User, Appearance
themes beyond Platinum, QuickTime playback and Java** are not claimed:
HFS Plus is 8.1, Sherlock is 8.5, and the rest needs machinery the museum
does not pretend to have.

**Clone-only conveniences:** persistent preferences in localStorage;
"Insert Disk File…" in the Apple menu; the Credits application; the launcher
page; `window.mac` for the console. **SimpleText** is a renamed MacWrite in
this museum (the real SimpleText grew out of TeachText); MacWrite and
MacPaint remain available as museum pieces even though neither shipped with
Mac OS 8. Contextual menus and spring-loaded folders are modelled from
published Mac OS 8 behaviour descriptions (850 ms spring delay is a chosen
approximation).
