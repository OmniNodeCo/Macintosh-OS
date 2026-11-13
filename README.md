# Macintosh OS — a web museum of classic Mac systems

Every Macintosh system, running in the browser. The repository is a **launcher** (one wall
of startup disks, release notes, a changelog and a style picker) plus one self-contained
recreation per system. It
starts with the **1984 Macintosh System 1.0 / Finder 1.0**, a working, from-scratch
recreation of the original desktop in 1-bit black and white: 512 × 342 pixels of menu bar,
striped windows, official icons, desk accessories — written in plain HTML, CSS and
JavaScript with **no frameworks, no image files and no Apple assets**. **System 2.0 /
Finder 4.1** (April 1985), **System 3.0 / Finder 5.1** (January 1986, the Macintosh
Plus), **System 6.0 / Finder 6.1** (April 1988, the Macintosh SE), **System 7.0**
(May 1991), **Mac OS 8.0** (July 1997, the Power Macintosh 8600 — the
museum's first colour screen), **Mac OS 9.0** (October 1999, a Power
Macintosh G4 "Yikes!"), **Mac OS X 10.0** (March 2001, "Cheetah" — Aqua and
the Dock) and **macOS Big Sur 11** (November 2020, an M1 MacBook Pro —
Control Center and the rounded redesign) are the second through ninth
bootable disks.

**Live site:** <https://omninodeco.github.io/Macintosh-OS/> (GitHub Pages, served from `main`).

```bash
python3 -m http.server 8000      # or: npx serve .
# then open http://localhost:8000/            → the launcher / startup disks
#           http://localhost:8000/os/system-1.0/  → System 1.0
#           http://localhost:8000/os/system-2.0/  → System 2.0
#           http://localhost:8000/os/system-3.0/  → System 3.0
#           http://localhost:8000/os/system-6.0/  → System 6.0
#           http://localhost:8000/os/system-7.0/  → System 7.0
#           http://localhost:8000/os/mac-os-8/    → Mac OS 8.0
#           http://localhost:8000/os/mac-os-9/    → Mac OS 9.0
#           http://localhost:8000/os/mac-os-x/    → Mac OS X 10.0
#           http://localhost:8000/os/macos-11/   → macOS Big Sur 11
```

The museum page is a pure static page, so it also works straight from `file://` —
double-click `index.html`. System 1.0 itself uses ES modules and therefore needs a web
server or GitHub Pages.

> **It is an original fan tribute.** Every glyph, pattern, beep and line of code was
> made for this project. The **icons are the official Apple artwork** of each era,
> credited in [CREDITS.md](CREDITS.md); Apple's Chicago font, ROM art and sounds are
> *not* included.
> See [CREDITS.md](CREDITS.md) for full credits, sources and licensing.

---

## Systems

| System | Year | Machine | State |
| --- | --- | --- | --- |
| [System 1.0](os/system-1.0/) | 1984 | Macintosh 128K | **bootable** |
| [System 2.0](os/system-2.0/) | 1985 | Macintosh 512K | **bootable** |
| [System 3.0](os/system-3.0/) | 1986 | Macintosh Plus | **bootable** |
| [System 6.0](os/system-6.0/) | 1988 | Macintosh SE | **bootable** |
| [System 7.0](os/system-7.0/) | 1991 | Macintosh SE | **bootable** |
| [Mac OS 8](os/mac-os-8/) | 1997 | Power Macintosh 8600 | **bootable** |
| [Mac OS 9](os/mac-os-9/) | 1999 | Power Macintosh G4 (Yikes!) | **bootable** |
| [Mac OS X](os/mac-os-x/) | 2001 | Power Macintosh G4 (PCI) | **bootable** |
| [macOS Big Sur](os/macos-11/) | 2020 | MacBook Pro (13-inch, M1) | **bootable** |

The list lives in one place — [`systems.js`](systems.js). Add an entry with a `href` and a
`status: 'ready'` and the system appears on the startup-disk wall; no other file needs to
change.

### What's new, changelog and launcher styles

* **One list of systems.** The startup-disk wall is the only place systems are listed; it
  is keyboard-driven (`↑ ↓ ← →` to choose, `Return` to boot) and planned disks shake + beep.
* **What's new / Changelog.** Release history lives in [`changelog.js`](changelog.js),
  newest first. The newest entry fills the *What's new* panel; the whole array fills the
  changelog. Shipping a release is one object, prepended there.
* **Launcher styles.** *Settings* offers **Classic** (1984: one bit, hard hairlines),
  **Platinum** (System 7/8 grey, bevelled cards), **Aqua** (Mac OS X gloss) and
  **Modern dark**. The choice sets `data-style` on `<html>`, is applied before first paint
  and is saved in `localStorage`. Styles only re-skin the lobby — the systems keep their own
  appearance, and the floppy art stays one-bit so it reads in every theme.

## Adding the next system

Two steps:

1. Build it in `os/<id>/` (its own `index.html` + `js/`, and `css/<id>/` if it needs its
   own chrome).
2. Add one object to [`systems.js`](systems.js) with `status: 'ready'` and its `href`
   (`os/<id>/`). The startup-disk wall picks it up automatically.

Scaffolding a system is `cp -r os/system-2.0 os/system-4.0 && cp -r css/system-2.0 css/system-4.0`,
then edit — give it its own `localStorage` keys, its own `index.html` and its own entry in
`systems.js`.

### Layout

```
os/system-1.0/          one self-contained system: index.html + js/ (+ its own tools/)
os/system-1.0/tools/    the typeface builder for that system
os/system-2.0/          System 2.0 / Finder 4.1 — its own js/, no imports from 1.0
os/system-3.0/          System 3.0 / Finder 5.1 — HFS, the Chooser, zoom boxes, 800K disks
os/system-6.0/          System 6.0 / Finder 6.1 — MultiFinder, Set Startup, MacroMaker
os/system-7.0/          System 7.0 — the System 7 look, aliases, Balloon Help, labels
os/mac-os-8/            Mac OS 8.0 — Platinum in colour, spring folders, context menus
css/system-1.0/mac.css  that system's chrome; systems do not share CSS
css/system-2.0/mac.css  System 2.0's chrome (Choose Printer, MiniFinder, Print Catalog)
css/system-3.0/mac.css  System 3.0's chrome (Chooser, status strip, test page, memory meter)
css/system-6.0/mac.css  System 6.0's chrome (cdev strip, MacroMaker)
css/system-7.0/mac.css  System 7.0's chrome (bevels, balloons, label bands, app menu)
css/mac-os-8/mac.css    Mac OS 8.0's Platinum layer (ridged title bars, candy controls)
assets/fonts/           shared typefaces (MacPixel Chicago)
assets/icons/           shared icon art (favicon)
systems.js              the registry the launcher reads
index.html              the launcher: masthead nav, what's new, feature, disk wall, changelog
changelog.js            release history; the newest entry feeds "What's new" (v0.8.0 = Mac OS 8.0)
launcher.css, launcher.js
```

Each system in `os/<id>/` is a standalone page: it can be opened on its own, deep-linked,
or embedded in an iframe. Systems **do not import each other's code** — only the shared
`assets/` — so a new recreation cannot break an old one.

---

## What is in the box — System 1.0

### The machine

* **Boot sequence** — the happy Mac, *Click anywhere to start up.*, a synthesised start-up
  chime, then the desktop. *Special ▸ Shut Down…* dims the screen to *It is now safe to turn
  off your Macintosh.* and *Restart…* boots again.
* **A beige Macintosh case** drawn in CSS — CRT recess, 3.5″ floppy slot, *Macintosh*
  wordmark — with the screen scaled in whole steps (1×, 1.25×, 1.5×, 2×, 2.5×, 3×) so
  every Mac pixel stays crisp at any window size.
* **The menu bar** — Apple menu plus the active application's own menus. Menus are
  keyboard-navigable, support ⌘/Ctrl shortcuts, check marks, separators and greyed-out
  items. `Esc` closes a menu.

### Finder

* Desktop with the **System Disk**, the **Launcher** and the **Trash** icons, free
  positioning, marquee (rubber-band) selection, single- and double-click selection rules.
* **Windows** with striped title bars, close box, zoom box (double-click the title bar to
  zoom), drag to move, drag the size box to resize, click to bring to front.
* Real **Mac scroll bars**: arrows that auto-repeat, draggable thumbs, paging in the track,
  and the scroll bars disappear when the content fits.
* **Icon view** and **list view** (with sizes), sorting *by Icon, Name, Size, Date, Kind*.
* **File operations** — New Folder, Open, Get Info, Rename…, Duplicate, Move to Trash,
  Put Away, Empty Trash…, Erase Disk…, Select All, Cut / Copy / Paste, Clean Up.
* **Drag and drop** — drag icons between folders, onto folders, and onto the Trash; a
  ghost icon follows the pointer and the desktop icon for a folder updates when the trash
  fills up.
* **Persistence** — your files, window positions, desktop icons, patterns, volumes and
  Note Pad pages are kept in `localStorage`, so a reload puts the machine back the way you
  left it.
* The **Apple menu** lists desk accessories and applications, exactly as System 1.0 did.

### Applications

| Application | What it does |
| --- | --- |
| **Launcher** | Full-screen icon grid for every app in the machine (System 7-style addition, see CREDITS). Double-click or press Return to launch. |
| **MacWrite** | Word processor: ruler with inch marks and margin markers, styles (Plain/Bold/Italic/Underline/Outline/Shadow), type sizes and alignment, live word count, page area, Save / Save As… / Open, dirty-document dot in the title bar. |
| **MacPaint** | Paint program: pencil, eraser, line, rectangle, oval, fill (flood fill), spray, text; eight 1-bit patterns; four line widths; Undo, New, Clear Page, Save as PNG inside the virtual disk. |
| **Alarm Clock** | Analog + digital face, day/date, settable alarm with volume, snooze-free beep at the appointed minute. |
| **Calculator** | Four-function calculator with running display, ±, %, C, and full keyboard support. |
| **Control Panel** | Eight desktop patterns, sound on/off, bell and alarm volumes, key-repeat rate, start-up disk info. Settings apply instantly and persist. |
| **Key Caps** | The 1984 keyboard layout; type on your keyboard or click keys and see them light up and echo into the field. |
| **Note Pad** | Four pages of quick notes with the folded-corner page-turn controls; saved with the system preferences. |
| **Puzzle** | The 15-puzzle, shufflable, with a move counter. |
| **Scrapbook** | A gallery of the desktop art (the apple, the happy Mac, patterns) with descriptions. |
| **Credits** | The full credits and licensing notes, readable on the machine itself. |
| **About This Macintosh** | The classic About box: model, system version, memory bar, system/free memory figures and a button that opens Credits. |

All desk accessories behave like the originals: they open as small fixed-size windows with
their own menu bars, and only one copy can be open at a time.

---

## System 2.0 — what the update changed

System 2.0 (April 1985) is a separate recreation, not a theme: `os/system-2.0/` has its own
JS, its own CSS, its own storage namespace (`macintosh-os.2.0.*`, so documents never mix
with 1.0's) and its own changelog entry.

What is actually different on screen, and why:

| Feature | Where |
| --- | --- |
| **Finder 4.1** | The Finder version jumped 1.1 → 4.1 in this release; the About box says so. |
| **New Folder** | `File ▸ New Folder` (⌘N) replaces *Empty Folder*, ending the empty-folder era. |
| **Print Catalog…** | `File ▸ Print Catalog…` (⌘P) previews a listing of the disk or folder and "prints" it to the chosen printer. |
| **Shut Down** | `Special ▸ Shut Down…` and the Apple menu; parks the head and shows the safe-to-switch-off screen. |
| **Use MiniFinder** | `Special ▸ Use MiniFinder` dithers the desktop and puts a small application list in front of it — the At Ease ancestor. *Use Finder* (⌘W) comes back. |
| **Choose Printer** | New desk accessory, the Chooser's forerunner: ImageWriter or LaserWriter, on the Printer / Modem / AppleTalk port. The title bar and Control Panel follow the choice. |
| **Eject by Trash** | Drag a volume to the Trash and it is ejected (the icon leaves the desktop). The System Disk refuses, because you are running from it. A second volume, the MacPaint Disk, ships on the desktop so you can try it — and *Put Away* does the same thing from the menu. |
| **All-white disks** | The disk icon lost its black shutter, the most visible change of the release. |
| **512K of memory, 400K of disk** | The About box shows the 512K machine with System 196K · Largest unused 316K. The disk is the 400K floppy that machine really booted from: Get Info reports `400K disk, one volume · N free`, computed from a 400 × 1024-byte budget. |
| **Faster start-up** | The splash clears after 680 ms instead of 850 ms — the 20 % quicker boot System 2.0 advertised. |

Put Back and Close All are deliberately absent: Finder 4.1 removed them.


---

## System 3.0 — what the update changed

System 3.0 (January 1986, sold as System Software 0.7, shipped with the Macintosh Plus)
is the third recreation: `os/system-3.0/`, its own JS and CSS, its own storage namespace
(`macintosh-os.3.0.*`) and its own changelog entry.

| Feature | Where |
| --- | --- |
| **Finder 5.1** | The about box is now *About the Finder…*, and it is a memory meter: total memory, System and Finder residency, and the largest free block. The mountain picture is gone with 4.1. |
| **HFS** | Folders are real directories and nest to any depth: `System Disk ▸ Documents ▸ Projects ▸ Disk Labels ▸ 1986 ▸ January Labels`. The 1.0 and 2.0 Finders faked folders on a flat MFS disk; this one does not. |
| **800K disks** and **SCSI** | The startup disk is an 800 × 1024-byte volume. An **HD20**, 20 MB of it, sits on the desktop — the volume HFS was actually written for — and a 400K disk from an older 512K machine still mounts. |
| **Zoom box** | Every window has one in its title bar: one click fills the screen, another click restores. The 2.0 windows only zoomed on a title-bar double-click. |
| **The Chooser** | Replaces 2.0's *Choose Printer*: printer icons (ImageWriter / LaserWriter), **AppleTalk Active / Inactive**, a Zones list and a live Devices list — pick a LaserWriter out of `*` or `Engineering` and the title bar follows. *Print Test Page* produces a real 1-bit test sheet with the driver version and the date. |
| **Control Panel, with words** | The picture-only panel grew labels and the settings the Plus needed: **Blink Rate**, **Mouse Tracking**, a **RAM Cache** (Off / 64K / 128K / 256K) and **AppleTalk Connected / Disconnected**. |
| **Status strip** | Finder windows report `12 items · 512K in disk · 288K available` — per volume, so the HD20 reports megabytes. |
| **Trash bulging** | The Trash icon lifts and fills the moment it holds anything, as it has since 3.0. |
| **Insert Disk File…** | Apple menu and `View ▸ Insert Disk File…` (⌘M) mount a fresh 800K volume from the Finder. |
| **Faster start-up** | The splash clears at 520 ms: 3.0's disk cache keeps the Finder's hot routines in memory. |
| **MiniFinder retired** | `Special` no longer offers *Use MiniFinder* — the Plus has the memory to keep the whole Finder loaded. `window.mac.enterMini()` still exists, and does nothing, so code written against 2.0 does not break. |

The machine is a **Macintosh Plus**: 1 MB of memory, the 800K drive, SCSI, and the same
512 × 342 one-bit screen as every Mac before it.

---

## System 6.0 — what the update changed

April 1988, and the museum machine becomes a **Macintosh SE**: 2 MB of memory,
an 800K startup floppy and a **30 MB Apple Hard Disk 30SC** on the SCSI bus.

* **MultiFinder.** Special ▸ **Set Startup…** is the real dialog: choose whether
  the machine starts with the plain Finder or MultiFinder, and what opens at
  startup. With MultiFinder running the Apple menu lists the running programs,
  and About the Finder grows its "Largest Unused Block" line — exactly as the
  System 6 manuals describe.
* **MacroMaker** joins the Apple menu: the System 6 desk accessory that looks
  like a tape recorder. The clone plays the part and says honestly that it
  records nothing.
* **The Control Panel becomes the strip-of-icons kind** — Keyboard, Mouse,
  Sound, Memory, Startup Disk and Desktop Pattern, one cdev pane at a time.
* **ImageWriter LQ** joins the Chooser; system files ship locked (System,
  Finder, MultiFinder, DA Handler, Backgrounder, the printer drivers).
* **The Trash empties when the Finder terminates** — System 6 behaviour, wired
  into restart and shut down. System 7 will fix it.

## System 7.0 — what the update changed

13 May 1991: "Big Bang". The museum machine keeps the SE's 512 × 342 one-bit
screen (the SE really ran System 7 in black and white) and gains a
**1.4 MB SuperDrive disk** and an **80 MB SCSI hard disk**.

* **The System 7 look.** Beveled window frames, embossed rounded buttons with a
  ringed default, ridged grow boxes, dithered scroll channels and the 50% grey
  linen desktop.
* **About This Macintosh** replaces About the Finder: a memory bar for every
  running application and the Largest Unused Block. Option-click the little
  Macintosh for a bow to the Blue Meanies.
* **Aliases** — File ▸ Make Alias. The alias wears a little arrow badge and
  double-clicks its way to the original; Get Info shows the original's name.
* **Balloon Help** — the new Help menu turns on speech balloons over the icons.
* **Labels** — the Label menu paints patterned bands (Essential, Hot,
  In Progress, Cool, Personal, Project 1, Project 2) under icon names.
* **The Application menu** at the right end of the menu bar switches between the
  Finder and running applications.
* **Control Panels** is a folder of separate little panels again — including
  Virtual Memory, which is honestly unavailable on this machine's 68000.
* **Apple Menu Items folder** builds the Apple menu; drop something in and it
  appears. **Force Quit** is on ⌘/Ctrl-Option-Escape, Find… is in the File menu,
  and the **Trash is a real folder**: throw something away, restart, and it is
  still there.

## Mac OS 8.0 — what the update changed

26 July 1997: the biggest overhaul since System 7, and the place where the
cancelled Copland project finally reached machines. The museum machine is a
**Power Macintosh 8600** (PowerPC 604e at 200 MHz, 32 MB of RAM) and the
museum's **first colour screen**: 640 × 480. Volumes: a **1.4 MB SuperDrive
disk**, a **2 GB Fast SCSI hard disk** (exactly plain HFS's ceiling) and a
**Mac OS 8 CD**.

* **The Platinum appearance.** Light grey frames, ridged active title bars,
  candy-box window controls, rounded embossed buttons and grey scroll
  channels — all drawn in CSS, no Apple art.
* **Spring-loaded folders.** Drag an icon over a folder and hold it there:
  the folder springs open underneath you.
* **Contextual menus.** Control-click an icon for Open, Get Info…, Make Alias,
  Move to Trash and label items. (Cloned flat: the museum has no submenus.)
* **The Appearance control panel** with a working highlight colour — pick one
  of seven swatches and menus, selections and icon highlights follow along.
* **Virtual Memory is available** — the PowerPC 604e has an MMU; the 2 GB disk
  lends a backing file. The System 7 panel's polite refusal is over.
* **SimpleText** in the box (a renamed MacWrite in this museum), colour icons
  in our Platinum palette, and About This Macintosh with per-application
  memory bars for 32 MB.
* Everything System 7 brought along stays: aliases, Balloon Help, labels,
  the Application menu, Apple Menu Items, Force Quit, Find…, and a Trash that
  persists.



| Keys | Action |
| --- | --- |
| `Esc` | Close the open menu; with no menu open, click away from windows (deselect) |
| `⌘`/`Ctrl` + `W` | Close the front window |
| `⌘`/`Ctrl` + `N` | New folder (Finder) |
| `⌘`/`Ctrl` + `O` | Open the selected item (Finder / Launcher) |
| `⌘`/`Ctrl` + `I` | Get Info |
| `⌘`/`Ctrl` + `D` | Duplicate |
| `⌘`/`Ctrl` + `Z` | Undo (MacPaint, MacWrite) |
| `⌘`/`Ctrl` + `X` / `C` / `V` | Cut / Copy / Paste |
| `⌘`/`Ctrl` + `A` | Select All |
| `⌘`/`Ctrl` + `S` | Save (MacWrite, MacPaint) |
| `⌘`/`Ctrl` + `L` | Open the Launcher |
| `⌘`/`Ctrl` + `M` | Insert Disk File (System 3.0) |
| Delete / Backspace | Delete the selection in text fields and documents |

Shortcuts are not registered specially: they come from the same table that draws the menu
items, so the keystroke shown next to an item is always the one that works.

---

## Fidelity notes

What is faithful to 1984:

* The 512 × 342 1-bit screen, 1-pixel hairlines, 50 % dither for "grey".
* Menu bar layout and typography, menu behaviour (click-and-hold, drag through items).
* Window chrome: 1-pixel frames, striped title bars, close box on the left, zoom box on the
  right, hatched size box, scroll-bar proportions and arrow glyphs.
* Icon grid geometry (78 × 58-pixel cells), label wrapping and inverted selection.
* The Apple menu as the home of desk accessories; the Trash; the System Disk; 400K volume.
* A hand-drawn, pixel-hinted menu font in the spirit of Chicago (drawn from scratch and
  bundled, because Chicago itself is Apple's and cannot be redistributed).

Where it knowingly differs:

* **The Launcher** is an addition — Apple's Launcher arrived with System 7.
* Text is edited with `contenteditable`, so you get a real caret, selection and clipboard.
* Documents and pictures are stored as data URLs in `localStorage`, not on a 400K floppy.
* MacPaint's canvas is 320 × 200 pixels; the original was 576 × 720.
* There is no ROM, no real disk driver, no Sound Designer, no MultiFinder, no hard disk.
* A few conveniences: keyboard shortcuts for every menu item, `window.mac` debug API,
  and persistence of window positions.

---

## How it is built

```
index.html              the launcher: masthead nav, what's new, feature, disk wall, changelog
changelog.js            release history; the newest entry feeds "What's new" (v0.8.0 = Mac OS 8.0) for every system
launcher.css            the lobby in four styles (Classic, Platinum, Aqua, dark), all token-driven
launcher.js              builds the wall from systems.js, the changelog from changelog.js,
                        the style picker, and the arrow-key/Return navigation
systems.js              the registry of systems: name, year, machine, copy, href, status
os/system-1.0/
index.html              that system's shell: case > screen > desk > (menu bar, desktop,
                        windows, menus, dialogs), with a link back to the museum
css/system-1.0/mac.css  every piece of chrome: case, menu bar, windows, scroll bars, dialogs,
                        each application's layout, the desktop patterns
js/core/
  ui.js                 element helper, drag sessions, pointer capture helpers
  icons.js              32 × 32 / 16 × 16 1-bit bitmaps drawn in code, cursor + favicon art
  patterns.js           8 × 8 dither patterns for the desktop and MacPaint
  fs.js                 the virtual file system (disks, folders, documents, trash) + persistence
  sound.js              Web Audio: start-up chime, key clicks, beeps, disk whirr, shutdown
  menu.js               menu bar, menus, shortcut table, enabled/checked state
  wm.js                 windows, drag/resize/zoom, Mac scroll bars, alerts and dialogs
js/apps/                one module per application, plus the Finder and the Apple menu
js/main.js              boot, screen scaling, preferences, launch API, restart/shutdown
tools/build_font.py     builds assets/fonts/MacPixelChicago.{ttf,woff2} with FontTools
assets/fonts/           "MacPixel Chicago" — an original 12 px bitmap typeface (MIT)
assets/icons/           favicon
```

No build step is required to run the site; the font is committed. To rebuild it:

```bash
python3 -m venv .fontenv
.fontenv/bin/pip install fonttools brotli pillow
.fontenv/bin/python os/system-1.0/tools/build_font.py
```

### Debug API

`window.mac` exposes the machine for tinkering in the console:

```js
mac.launch('macpaint');            // launch any app by id
mac.finder.openContainer(mac.fs.fs.roots[0]);  // open the System Disk window
mac.fs.fs.trash.children;          // what is in the Trash
mac.prefs, mac.savePrefs();        // system preferences
mac.restart(); mac.shutdown();     // the Special menu items
```

---

## Deploying to GitHub Pages

The site is static and root-relative to the repository, so project pages work with no
build step: `https://<user>.github.io/Macintosh-OS/`.

1. **Settings ▸ Pages ▸ Build and deployment ▸ Source: _GitHub Actions_** — this one click
   cannot be done by a workflow token, so it has to be done once by a repository admin.
2. Push to `main`. [`.github/workflows/pages.yml`](.github/workflows/pages.yml) stages the
   repository (everything except `.git`/`.github`) and deploys it.

The repository is also the artefact: `.nojekyll` is present, so nothing is filtered, and a
branch-based deploy (`main`, `/ (root)`) works exactly as well if you prefer that.

Everything the pages load is relative (`os/system-1.0/`, `../../assets/…`), so the same
files work at a project path, a user path, a custom domain or `localhost`.

---

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari). It needs ES modules, CSS
`zoom`, canvas and Web Audio; the first click on the screen unlocks audio, as browsers
require. It is responsive: the case scales to fit small windows, and the whole machine
works down to phone-sized screens.

---

## Licence and credits

* **Code, artwork and the MacPixel Chicago typeface:** MIT — see [LICENSE](LICENSE).
* **Credits for the ideas, the system it imitates, and every source consulted:**
  [CREDITS.md](CREDITS.md) (also available inside the machine: *Apple ▸ Credits*).
* Macintosh, Finder, MacWrite, MacPaint and the Apple logo are trademarks of Apple Inc.
  This project is an unofficial tribute and is not affiliated with Apple.
