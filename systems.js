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
    status: 'planned',
    href: '',
    blurb:
      'Hierarchical folders, the HFS file system and the Plus with its SCSI port ' +
      'and 1 MB of memory. Bigger disks, deeper folders.',
    highlights: ['HFS', 'Hierarchical folders', 'SCSI'],
  },
  {
    id: 'system-6.0',
    name: 'System 6.0',
    short: '6.0',
    finder: 'Finder 6.1',
    year: 1988,
    date: 'March 1988',
    model: 'Macintosh II',
    bits: '1-bit to 8-bit colour',
    status: 'planned',
    href: '',
    blurb:
      'MultiFinder, colour QuickDraw, the Control Panel as we remember it and the ' +
      'first taste of running more than one application at a time.',
    highlights: ['MultiFinder', 'Colour', 'DA suite'],
  },
  {
    id: 'system-7.0',
    name: 'System 7.0',
    short: '7.0',
    finder: 'Finder 7.0',
    year: 1991,
    date: 'May 1991',
    model: 'Macintosh IIfx',
    bits: '8-bit colour',
    status: 'planned',
    href: '',
    blurb:
      'Aliases, Balloon Help, AppleScript, TrueType and a desktop that finally ' +
      'looks like a place rather than a list of disks.',
    highlights: ['Aliases', 'Balloon Help', 'AppleScript', 'TrueType'],
  },
  {
    id: 'mac-os-8',
    name: 'Mac OS 8',
    short: '8',
    finder: 'Finder 8.0',
    year: 1997,
    date: 'July 1997',
    model: 'Power Macintosh 8600',
    bits: 'Platinum, 8-bit+',
    status: 'planned',
    href: '',
    blurb:
      'The Platinum appearance, spring-loaded folders, the Finder as a multi-user ' +
      'shell and the beginning of the modern Mac look.',
    highlights: ['Platinum', 'Spring-loaded folders', 'Multitasking'],
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
