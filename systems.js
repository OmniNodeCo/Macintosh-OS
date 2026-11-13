/* =============================================================================
   Macintosh OS — the web museum
   The startup-disk wall for every Macintosh system recreation in this repository.
   A single data file drives the launcher: add a system here and it appears on the
   wall and in the keyboard navigation.
   ========================================================================== */

/* Every system recreation in the repo. `href` is relative to the repo root so
   the page works from any sub-path (project pages, user pages, file:// …). */
window.SYSTEMS = [
  {
    id: 'system-1.0',
    name: 'System 1.0',
    short: '1.0',
    finder: 'Finder 1.0',
    year: 1984,
    date: '24 January 1984',
    model: 'Macintosh 128K',
    bits: '1-bit, 512 × 342',
    status: 'ready',
    href: 'os/system-1.0/',
    blurb:
      'The original. Menu bar, striped title bars, one-bit icons, desk accessories ' +
      'and the first Finder — rebuilt pixel for pixel with an original typeface.',
    highlights: ['Finder', 'MacWrite', 'MacPaint', 'Desk accessories', 'Trash'],
  },
  {
    id: 'system-2.0',
    name: 'System 2.0',
    short: '2.0',
    finder: 'Finder 4.1',
    year: 1985,
    date: 'April 1985',
    model: 'Macintosh 512K',
    bits: '1-bit, 512 × 342',
    status: 'ready',
    href: 'os/system-2.0/',
    blurb:
      'The first real update: Finder 4.1 brings New Folder, Shut Down, the MiniFinder ' +
      'and Choose Printer, and a disk dragged to the Trash is ejected. Faster start-up, ' +
      'all-white disk icons.',
    highlights: ['MiniFinder', 'Choose Printer', 'New Folder', 'Print Catalog', 'Shut Down'],
  },
  {
    id: 'system-3.0',
    name: 'System 3.0',
    short: '3.0',
    finder: 'Finder 5.1',
    year: 1986,
    date: 'January 1986',
    model: 'Macintosh Plus',
    bits: '1-bit, 512 × 342',
    status: 'ready',
    href: 'os/system-3.0/',
    blurb:
      'The Plus arrives, and with it HFS: real folders inside folders, 800K disks, ' +
      'a 20 MB hard disk on a SCSI cable. The Chooser learns AppleTalk, every window ' +
      'gets a zoom box, and About the Finder becomes a memory meter.',
    highlights: ['HFS folders', 'Chooser', 'Zoom box', '800K disks', 'HD20'],
  },
  {
    id: 'system-6.0',
    name: 'System 6.0',
    short: '6.0',
    finder: 'Finder 6.1',
    year: 1988,
    date: 'April 1988',
    model: 'Macintosh SE',
    bits: '1-bit, 512 × 342',
    status: 'ready',
    href: 'os/system-6.0/',
    blurb:
      'MultiFinder at last: Special ▸ Set Startup… turns the machine into a ' +
      'co-operative multitasker. MacroMaker records your clicks like a tape ' +
      'recorder, the Control Panel becomes a strip of icons, and a 30 MB SCSI ' +
      'hard disk moves in beside the 800K floppy.',
    highlights: ['MultiFinder', 'Set Startup', 'MacroMaker', 'Icon Control Panel', '30SC disk'],
  },
  {
    id: 'system-7.0',
    name: 'System 7.0',
    short: '7.0',
    finder: 'Finder 7.0',
    year: 1991,
    date: '13 May 1991',
    model: 'Macintosh SE',
    bits: '1-bit, 512 × 342',
    status: 'ready',
    href: 'os/system-7.0/',
    blurb:
      'Big Bang: beveled windows and grey linen, aliases with little arrow ' +
      'badges, Balloon Help, labels, About This Macintosh with a memory bar for ' +
      'every running application, and a Trash that survives a restart.',
    highlights: ['System 7 look', 'Aliases', 'Balloon Help', 'Labels', 'Trash persists'],
  },
  {
    id: 'mac-os-8',
    name: 'Mac OS 8',
    short: '8',
    finder: 'Finder 8.0',
    year: 1997,
    date: '26 July 1997',
    model: 'Power Macintosh 8600',
    bits: 'Platinum, colour 640 × 480',
    status: 'ready',
    href: 'os/mac-os-8/',
    blurb:
      'The Platinum appearance in colour on a Power Macintosh 8600: spring-loaded ' +
      'folders, contextual menus, a native multithreaded Finder, Virtual Memory ' +
      'that finally works, and SimpleText in the box.',
    highlights: ['Platinum', 'Spring-loaded folders', 'Contextual menus'],
  },
  {
    id: 'mac-os-9',
    name: 'Mac OS 9',
    short: '9',
    finder: 'Finder 9.0',
    year: 1999,
    date: 'October 1999',
    model: 'Power Mac G4',
    bits: 'Platinum, 8-bit+',
    status: 'planned',
    href: '',
    blurb:
      'The last of the classic Mac OS: Sherlock, Keychain, multiple users, ' +
      'and the sound of a startup chime that closed an era.',
    highlights: ['Sherlock', 'Keychain', 'Multiple users'],
  },
  {
    id: 'mac-os-x',
    name: 'Mac OS X',
    short: 'X',
    finder: 'Finder 10.0',
    year: 2001,
    date: 'March 2001',
    model: 'Power Mac G4 Cube',
    bits: 'Aqua, 32-bit',
    status: 'planned',
    href: '',
    blurb:
      'Aqua, the Dock, the genie effect and a Unix core under a lickable ' +
      'interface. Where the modern Mac begins.',
    highlights: ['Aqua', 'Dock', 'Quartz'],
  },
];
