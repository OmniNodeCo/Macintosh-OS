/* Release history and "what's new".
   Newest first. The first entry is what the What's New panel shows; the whole
   array is the changelog. Shipping a release is one object, prepended here. */

window.CHANGELOG = [
  {
    version: '1.6.0',
    date: '2026-11-18',
    title: 'macOS 27 Golden Gate \u2014 Siri AI and a glass that slides',
    summary: 'The newest macOS boots in the museum: conversational Siri with its own app, Visual Intelligence, and a working Liquid Glass transparency slider.',
    items: [
      'macOS Golden Gate 27.0 (26A428) on a MacBook Pro (14-inch, M5 Pro, 2025) \u2014 15 September-bay golden light: Siri AI with a real conversation window, Visual Intelligence in the Apple menu (Shift\u2013Command\u2013Space in the real release), Safari tab content, Darwin 26, and Apple Silicon only',
      'The Liquid Glass transparency slider in System Settings > Appearance really works \u2014 drag from ultra-clear to fully tinted and the menu bar, Dock, window titles and sidebar glass follow live',
      'macOS Tahoe 26 keeps its place with updated museum counts and Safari tab content',
      'Tests: Big Sur 21, Monterey 22, Ventura 25, Sonoma 17, Sequoia 17, Tahoe 14, Golden Gate 13 \u2014 129 checks, all green'
    ]
  },
  {
    version: '1.5.0',
    date: '2026-11-17',
    title: 'Animated window buttons \u00b7 macOS Tahoe 26 \u00b7 real icons',
    summary: 'Red, yellow and green come alive \u2014 the green button really animates to full screen \u2014 and macOS Tahoe 26 joins the museum with Liquid Glass.',
    items: [
      'The three window buttons animate everywhere they exist (Mac OS X and macOS 11\u201326): green zooms the window smoothly to full screen and back, yellow minimizes with a swoosh toward the Dock, red keeps its scale-fade close \u2014 all honouring prefers-reduced-motion',
      'macOS Tahoe 26.0 (25A354) on a MacBook Pro (14-inch, M4 Pro, 2024) \u2014 Liquid Glass: translucent menu bar, glass Dock, glassy window titles and settings sidebar, Phone and Games apps, 24 GB, Darwin 25',
      'Real icons replace the drawn ones: the System Settings icon (extracted from the macOS icon cache, via macosicons.com) and the official Passwords app icon (Apple Newsroom artwork) now serve macOS 13 through 26',
      'Tests: Big Sur 21, Monterey 22, Ventura 25, Sonoma 17, Sequoia 17, Tahoe 14 \u2014 116 checks, all green'
    ]
  },
  {
    version: '1.4.0',
    date: '2026-11-16',
    title: 'System Preferences, rebuilt \u2014 and settings made real',
    summary: 'Big Sur and Monterey get the real icon-grid System Preferences with drill-in panes; Ventura, Sonoma and Sequoia get fuller System Settings panes.',
    items: [
      'macOS 11 and 12: System Preferences is now the real layout \u2014 Apple ID row, search field and hairline-separated rows of squircle icons with labels below, clicking one drills into the pane with a \u2039 back button and working toggles and sliders',
      'macOS 13, 14 and 15: System Settings panes are much fuller \u2014 General (About, Software Update, Storage, AirDrop & Handoff, Login Items, Language & Region, Sharing), Desktop & Dock, Displays, Sound, Battery, Wallpaper, Siri & Spotlight, Privacy & Security, Touch ID & Password, Users & Groups, Keyboard',
      'All five systems re-tested headless: Big Sur 19, Monterey 20, Ventura 23, Sonoma 15, Sequoia 15 \u2014 92 checks, all green'
    ]
  },
  {
    version: '1.3.0',
    date: '2026-11-15',
    title: 'macOS Ventura 13, Sonoma 14 and Sequoia 15',
    summary: 'Three more Apple-silicon Macs boot today: the System Settings sidebar, desktop widgets and window tiling \u2014 with the same accuracy standard and the same test rig.',
    items: [
      'macOS Ventura 13.0 (22A380) on a MacBook Air (M2, 2022) \u2014 1470 \u00d7 956: the real System Settings sidebar (25+ panes, per-pane content, working toggles), Stage Manager in Control Center, Weather and Clock apps',
      'macOS Sonoma 14.0 (23A344) on a MacBook Pro (14-inch, M2 Pro, 2023) \u2014 1512 \u00d7 982: desktop widgets (calendar, weather, world clocks) in frosted glass over the wallpaper, alongside the System Settings sidebar',
      'macOS Sequoia 15.0 (24A335) on a MacBook Pro (14-inch, M3 Pro, 2023) with 18 GB: real window tiling \u2014 drag a window to any edge or corner and a preview shows the snap (also from the Window menu) \u2014 the Passwords app, iPhone Mirroring in Control Center and a working Calculator',
      'All three boot with the white Apple logo on black, 24px menu bar and 28px titles, era-correct clocks and terminal output (sw_vers, uname, Release_ARM64_T8112/T6020/T6031)',
      'Bug fix: Apple \u25b8 Restart actually restarts again \u2014 the boot guard that protected against double-start had left the click handler dead after a restart (fixed in macOS 11, 12 and carried into 13\u201415)',
      'Tests: Big Sur 17, Monterey 18, Ventura 22, Sonoma 14, Sequoia 14 \u2014 85 checks, all green'
    ]
  },
  {
    version: '1.2.0',
    date: '2026-11-14',
    title: 'The Apple logo on startup \u2014 and a pixel-accuracy pass',
    summary: 'Big Sur and Monterey now boot like real Apple-silicon Macs, with real window chrome, Control Center modules and the full System Preferences grid.',
    items: [
      'Real startup screens: the white Apple logo over a black screen with the progress bar \u2014 the Apple-silicon power-on look \u2014 on both macOS 11 and macOS 12',
      'Exact window chrome: 24px menu bar, 28px title bars with centered standard titles, and Finder\u2019s real unified toolbar (folder name, back/forward, view controls and Search in one bar)',
      'Finder navigates in place \u2014 clicking the sidebar changes the folder and window title instead of stacking a new window',
      'Safari tabs live in the title bar with the address toolbar below, matching Big Sur-and-later Safari',
      'Control Center rebuilt to the real module layout: Wi-Fi/Bluetooth/AirDrop and Focus/Screen Mirroring tiles, Display and Sound sliders, Now Playing \u2014 with the Focus picker in Monterey and a working Do Not Disturb (menu-bar moon) in Big Sur',
      'System Preferences now shows the real category bands (Apple ID, Personal, Hardware, Internet & System, System) with the full pane set of each release, Focus for Monterey',
      'Bug fixes: Control Center rows no longer dismiss the panel, boot cannot double-start, dock and desktop metrics tuned to Big Sur proportions',
      'Tests: Monterey 16 checks, Big Sur 15 checks \u2014 all green'
    ]
  },
  {
    version: '1.1.0',
    date: '2026-11-11',
    title: 'macOS 12 Monterey \u2014 and every system polished',
    summary: 'Focus modes and Shortcuts on a 14-inch M1 Pro MacBook Pro; menus anchored right, natural animations, era-accurate volumes and a full bug sweep.',
    items: [
      'macOS Monterey 12.0.1 (2021) on a MacBook Pro (14-inch, M1 Pro): Focus modes with the menu-bar pill, Shortcuts (Shuffle Wallpaper, Evening Focus, Museum Tour), Safari tab groups, Notification Center widgets, Control Center \u2014 1512 \u00d7 982',
      'Menus now drop exactly under their menu-bar item in Mac OS X and Big Sur \u2014 the long-standing sideways-shift bug is fixed and test-verified (dx=0, dy=0)',
      'Natural UI animations: windows open and close with a quick scale-fade, menus and dialogs ease in, Dock icons bounce on launch, Control/Notification Centers slide \u2014 with a prefers-reduced-motion off switch',
      'Era-accurate volume capacities everywhere: Mac OS X Finder shows Macintosh HD 40 GB HFS+ and the Mac OS X Install CD 650 MB; Big Sur reports 256 GB APFS; Monterey 512 GB SSD',
      'Bug fixes: Finder window titles now follow navigation in Mac OS X and Big Sur (they never updated before); close guards against double-close; Monterey boots to Finder + About + Safari',
      'Every system re-tested headless: System 1.0\u20137.0 and Mac OS 8\u20139 (42 checks), Mac OS X (19), Big Sur (19), Monterey (17) \u2014 all green'
    ]
  },
  {
    version: '1.0.0',
    date: '2026-11-13',
    title: 'Mac OS X 10.0 and macOS Big Sur 11',
    summary: 'Aqua and the rounded redesign join the museum \u2014 two ends of twenty years.',
    items: [
      'Mac OS X 10.0 Cheetah (2001) on a Power Macintosh G4: Aqua pinstripes, the glass Dock with magnification, Finder windows with the aqua toolbar, Mail, TextEdit, Terminal (try \u201chelp\u201d), About This Mac \u2014 1024 \u00d7 768',
      'macOS Big Sur 11 (2020) on a MacBook Pro (13-inch, M1): translucent menu bar, Control Center, Notification Center with widgets, the squircle Dock, Finder with sidebar, System Preferences, About This Mac with M1 specs \u2014 1440 \u00d7 900',
      'Official icon art both eras: Aqua-era icons sliced from published Mac OS X 10.0 screens plus the extracted wire-mesh Trash; Big Sur icons extracted from macOS system software \u2014 all credited in CREDITS.md and the Credits app',
      'Headless suites: Mac OS X 15 checks, Big Sur 17 checks, all green'
    ]
  },
  {
    version: '0.9.0',
    date: '2026-11-11',
    title: 'Mac OS 9, and official icons everywhere',
    summary: 'Sherlock 2, Multiple Users, the Keychain and Software Update on a G4 — and every system now wears Apple\u2019s real icon art.',
    items: [
      'Mac OS 9.0 on a Power Macintosh G4 (Yikes!, 350 MHz): Sherlock 2 search channels, Multiple Users login with account kinds, Keychain Access and Software Update, 800 \u00d7 600 Platinum',
      'Official Apple icon artwork across every system, era by era: Susan Kare\u2019s 1984 originals (System 1.0\u20136.0), System 7.5.3 extractions (7.0), Mac OS 8.1 extractions (8.0), Mac OS 9 originals (9.0) \u2014 all credited in CREDITS.md and the Credits app',
      'New icon assets in assets/icons/, 32 \u00d7 32, with era conversions and per-source attribution'
    ]
  },
  {
    version: '0.8.0',
    date: '2026-11-11',
    title: 'Mac OS 8 boots',
    summary: 'Platinum in colour on a Power Macintosh 8600: spring-loaded folders, contextual menus, and Virtual Memory that finally works.',
    items: [
      'New system: os/mac-os-8/ — Mac OS 8.0 (26 July 1997) on a Power Macintosh 8600, the museum\'s first colour screen at 640 × 480',
      'The Platinum appearance in CSS: light grey frames, ridged title bars, candy-box window controls, rounded embossed buttons, grey scroll channels',
      'Spring-loaded folders: hold a dragged icon over a folder and it springs open',
      'Contextual menus: Control-click an icon for Open, Get Info, Make Alias, Move to Trash and label items (flat — the museum has no submenus)',
      'Appearance control panel with a working highlight colour: seven swatches recolour menus, selections and icons across the system',
      'Virtual Memory is available at last — the PowerPC 604e has an MMU, and the 2 GB hard disk lends the backing file',
      'Volumes of 1997: a 1.4 MB SuperDrive disk, a 2 GB Fast SCSI hard disk and a locked Mac OS 8 CD',
      'SimpleText in the box (a renamed MacWrite in this museum), Colour icons in the Platinum palette (our own art), About This Macintosh 8 with per-application memory bars for 32 MB',
      'Fix: Credits crashed with "a system error occurred" in System 6.0 and 7.0 — the scroller helper was called with the wrong signature; both systems now open Credits cleanly'
    ],
  },
  {
    version: '0.7.0',
    date: '2026-11-11',
    title: 'System 6.0 and System 7.0 boot',
    summary: '1988 and 1991 in one leap: MultiFinder, MacroMaker, and the System 7 look with aliases and balloons.',
    items: [
      'New system: os/system-6.0/ — a Macintosh SE running System 6.0 and Finder 6.1',
      'MultiFinder: Special ▸ Set Startup… picks Finder or MultiFinder; the Apple menu lists running programs and the About box grows its largest-block line',
      'MacroMaker, the tape-recorder desk accessory from System 6.0, joins the Apple menu',
      'The Control Panel becomes the strip-of-icons kind: Keyboard, Mouse, Sound, Memory, Startup Disk, Desktop Pattern',
      'A 30 MB Apple Hard Disk 30SC beside the 800K startup floppy; ImageWriter LQ joins the Chooser',
      'New system: os/system-7.0/ — the May 1991 System 7.0 on the same SE screen, with a 1.4 MB SuperDrive disk and an 80 MB hard disk',
      'The System 7 look: beveled windows, embossed rounded buttons, ridged grow boxes, dithered scroll channels, 50% grey linen desktop',
      'Aliases (File ▸ Make Alias, arrow badges), Balloon Help, labels with patterned bands, Find… and Force Quit on Ctrl/⌘-Option-Escape',
      'About This Macintosh with per-application memory bars and a bow to the Blue Meanies; the Apple menu builds itself from the Apple Menu Items folder; the Trash persists across restarts'
    ]
  },
  {
    version: '0.6.0',
    date: '2026-11-11',
    title: 'System 3.0 boots',
    summary: 'January 1986: the Macintosh Plus, HFS, 800K disks and the Chooser.',
    items: [
      'New system: os/system-3.0/ — a Macintosh Plus running System 3.0 and Finder 5.1',
      'HFS at last: folders nest to any depth, and the Documents folder proves it',
      'Three volumes: an 800K startup disk, a 20 MB HD20 on SCSI, and a 400K disk from a 512K machine',
      'Zoom boxes on every title bar, one click to fill the screen',
      'The Chooser replaces Choose Printer, with AppleTalk, zones and a printed test page',
      'Control Panel with words: blink rate, mouse tracking, RAM cache and AppleTalk',
      'Finder windows report "N items · 512K in disk · N available"; the Trash bulges',
      'Insert Disk File mounts a fresh 800K disk; MiniFinder retires with the 512K machines',
      'System 2.0 corrected: its volume is the 400K floppy the 512K really booted from, not 512K of RAM'
    ]
  },
  {
    version: '0.5.0',
    date: '2026-11-11',
    title: 'System 2.0 boots',
    summary: 'The April 1985 update arrives: Finder 4.1, MiniFinder and Choose Printer.',
    items: [
      'New system: os/system-2.0/ — a 512K Macintosh running System 2.0 and Finder 4.1',
      'MiniFinder: Special ▸ Use MiniFinder swaps the desktop for a small launcher',
      'Choose Printer, the forerunner of the Chooser: ImageWriter or LaserWriter, on any port',
      'File ▸ Print Catalog prints a listing of a disk or folder to the chosen printer',
      'New Folder replaces Empty Folder; Put Back and Close All are gone, as in 4.1',
      'Disk icons lose the black shutter, and dragging a disk to the Trash ejects it',
      'The volume is a full 512K, with free space shown in Get Info',
      'Both systems are bootable from the launcher; System 2.0 gets its own changelog entry'
    ]
  },
  {
    version: '0.4.0',
    date: '2026-11-11',
    title: 'One launcher, four looks, a changelog',
    summary: 'The lobby stops repeating itself and starts remembering how you like it.',
    items: [
      'One list of systems: the boot chooser is gone, the startup-disk wall is the launcher',
      'Keyboard navigation on the wall: arrow keys to choose, Return to boot',
      'Four launcher styles: Classic, Platinum, Aqua and Modern dark, saved per browser',
      'New "What\'s new" panel and this changelog, both driven by changelog.js',
      'A real nav: Systems, What\'s new, Changelog, Settings'
    ]
  },
  {
    version: '0.3.0',
    date: '2026-11-11',
    title: 'The museum opens',
    summary: 'The repository becomes a launcher for every Macintosh system, not just one.',
    items: [
      'New launcher page: a startup-disk wall driven by a single systems.js registry',
      'System 1.0 moved to os/system-1.0/ and stays a standalone, deep-linkable page',
      'Shared assets (typeface, favicon) at the root; every URL is relative',
      'GitHub Pages deploy workflow, .nojekyll, README rewritten for the museum',
      'MacPaint: fast strokes paint every coalesced pointer sample (no more dotted lines)',
      'Finder: fixed a crash in File > Get Info',
      'Keyboard focus follows the front window, so apps receive typing immediately'
    ]
  },
  {
    version: '0.2.0',
    date: '2026-11-10',
    title: 'Credits, licence and a real README',
    summary: 'The paperwork, and the machine now fits on a phone.',
    items: [
      'Credits app on the machine, plus CREDITS.md with sources and licensing notes',
      'MIT LICENSE covering the code, the typeface and the icon art',
      'Original 16 × 16 floppy favicon',
      'Screen scales from 3× to 0.4×, centred and legible at every viewport size'
    ]
  },
  {
    version: '0.1.0',
    date: '2026-11-08',
    title: 'System 1.0 boots',
    summary: 'A working, from-scratch recreation of the 1984 Macintosh desktop.',
    items: [
      '512 × 342 1-bit screen in a CSS-drawn Macintosh case',
      'Finder with icon and list views, drag and drop, Get Info, Trash and persistence',
      'Twelve applications: MacWrite, MacPaint, Calculator, Control Panel, Key Caps, Note Pad, Puzzle, Scrapbook, Alarm Clock, Launcher, Credits and About',
      'Original bitmap typeface ("MacPixel Chicago"), 1-bit patterns and Web Audio chimes'
    ]
  }
];
