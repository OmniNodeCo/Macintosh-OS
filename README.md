# Macintosh OS — a web museum of classic Mac systems

Every Macintosh system, running in the browser. The repository is a **launcher** (a boot
chooser and a wall of startup disks) plus one self-contained recreation per system. It
starts with the **1984 Macintosh System 1.0 / Finder 1.0**, a working, from-scratch
recreation of the original desktop in 1-bit black and white: 512 × 342 pixels of menu bar,
striped windows, dithered icons, desk accessories — written in plain HTML, CSS and
JavaScript with **no frameworks, no image files and no Apple assets**.

**Live site:** <https://omninodeco.github.io/Macintosh-OS/> (GitHub Pages, served from `main`).

```bash
python3 -m http.server 8000      # or: npx serve .
# then open http://localhost:8000/            → the boot chooser / startup disks
#           http://localhost:8000/os/system-1.0/  → System 1.0
```

The museum page (chooser + startup disks) is a pure static page, so it also works
straight from `file://` — double-click `index.html`. System 1.0 itself uses ES modules and
therefore needs a web server or GitHub Pages.

> **It is an original fan tribute.** Every glyph, icon, pattern, beep and line of code was
> made for this project. Apple's Chicago font, ROM icons and sounds are *not* included.
> See [CREDITS.md](CREDITS.md) for full credits, sources and licensing.

---

## Systems

| System | Year | Machine | State |
| --- | --- | --- | --- |
| [System 1.0](os/system-1.0/) | 1984 | Macintosh 128K | **bootable** |
| System 2.0 | 1985 | Macintosh 512K | planned |
| System 3.0 | 1986 | Macintosh Plus | planned |
| System 6.0 | 1988 | Macintosh II | planned |
| System 7.0 | 1991 | Macintosh II fx | planned |
| Mac OS 8 | 1997 | Power Macintosh 8600 | planned |
| Mac OS 9 | 1999 | Power Mac G4 | planned |
| Mac OS X | 2001 | Power Mac G4 Cube | planned |

The list lives in one place — [`systems.js`](systems.js). Add an entry with a `href` and a
`status: 'ready'` and the system appears in the boot chooser and in the startup-disk grid;
no other file needs to change.

## Adding the next system

Two steps:

1. Build it in `os/<id>/` (its own `index.html` + `js/`, and `css/<id>/` if it needs its
   own chrome).
2. Add one object to [`systems.js`](systems.js) with `status: 'ready'` and its `href`
   (`os/<id>/`). The boot chooser and the disk grid pick it up automatically.

Scaffolding a system is `mkdir os/system-2.0 && cp -r os/system-1.0/* os/system-2.0/`,
then edit. `os/system-2.0/index.html` in this commit is the placeholder shown when a
"soon" disk is opened by URL.

### Layout

```
os/system-1.0/          one self-contained system: index.html + js/ (+ its own tools/)
os/system-1.0/tools/    the typeface builder for that system
css/system-1.0/mac.css  that system's chrome; systems do not share CSS
assets/fonts/           shared typefaces (MacPixel Chicago)
assets/icons/           shared icon art (favicon)
systems.js              the registry the launcher reads
index.html              the boot chooser / startup-disk wall
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

## Keyboard

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
index.html              the boot chooser / startup-disk wall for every system
launcher.css            the museum lobby: 1-bit masthead, feature panel, disk grid, chooser
launcher.js             builds the grid from systems.js, runs the boot chooser (keys: ↑ ↓ Return Esc)
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

1. Push `main`.
2. Settings ▸ Pages ▸ **Build and deployment** ▸ Source: *Deploy from a branch*,
   Branch: `main`, folder: `/ (root)`.
3. The included workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) can
   also deploy on every push to `main` (Settings ▸ Pages ▸ Source: *GitHub Actions*).

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
