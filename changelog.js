/* Release history and "what's new".
   Newest first. The first entry is what the What's New panel shows; the whole
   array is the changelog. Shipping a release is one object, prepended here. */

window.CHANGELOG = [
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
