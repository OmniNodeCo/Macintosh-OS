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
    date: '23 October 1999',
    model: 'Power Macintosh G4 (Yikes!)',
    bits: 'Platinum, colour 800 × 600',
    status: 'ready',
    href: 'os/mac-os-9/',
    blurb:
      'The last of the classic Mac OS on a Power Macintosh G4: Sherlock 2 ' +
      'channels, Multiple Users, the Keychain, Automatic Software Update, ' +
      'a 10 GB disk and a Zip 100 in place of the floppy.',
    highlights: ['Sherlock 2', 'Keychain', 'Multiple Users', 'Software Update'],
  },
  {
    id: 'mac-os-x',
    name: 'Mac OS X',
    short: 'X',
    finder: 'Finder 10.0',
    year: 2001,
    date: '24 March 2001',
    model: 'Power Macintosh G4 (PCI)',
    bits: 'Aqua, colour 1024 × 768',
    status: 'ready',
    href: 'os/mac-os-x/',
    blurb:
      'Cheetah: Aqua pinstripes, the glass Dock, jelly-bean window controls ' +
      'and the Finder — where the modern Mac begins.',
    highlights: ['Aqua', 'The Dock', 'Protected memory'],
  },
  {
    id: 'macos-11',
    name: 'macOS Big Sur',
    short: '11',
    finder: 'Finder 20',
    year: 2020,
    date: '12 November 2020',
    model: 'MacBook Pro (13-inch, M1, 2020)',
    bits: 'Big Sur, Retina 1440 × 900',
    status: 'ready',
    href: 'os/macos-11/',
    blurb:
      'The rounded redesign and the Apple silicon debut: Control Center, ' +
      'Notification Center widgets, the squircle Dock and About This Mac.',
    highlights: ['Control Center', 'Apple silicon', 'Squircle icons'],
  },
  {
    id: 'macos-12',
    name: 'macOS Monterey',
    short: '12',
    finder: 'Finder 20',
    year: 2021,
    date: '25 October 2021',
    model: 'MacBook Pro (14-inch, M1 Pro, 2021)',
    bits: 'Monterey, Retina 1512 \u00d7 982',
    status: 'ready',
    href: 'os/macos-12/',
    blurb:
      'Focus modes, Shortcuts on the Mac and Safari tab groups on the new ' +
      '14-inch MacBook Pro \u2014 Big Sur\u2019s look, a calmer year inside.',
    highlights: ['Focus modes', 'Shortcuts', 'Safari tab groups'],
  },
  {
    id: 'macos-13',
    name: 'macOS Ventura',
    short: '13',
    finder: 'Finder 20',
    year: 2022,
    date: '24 October 2022',
    model: 'MacBook Air (13.6-inch, M2, 2022)',
    bits: 'Ventura, Retina 1470 \u00d7 956',
    status: 'ready',
    href: 'os/macos-13/',
    blurb:
      'System Preferences becomes System Settings \u2014 the sidebar every Mac user had ' +
      'to relearn \u2014 plus Stage Manager in Control Center and Weather and Clock on the Mac.',
    highlights: ['System Settings sidebar', 'Stage Manager', 'Weather + Clock'],
  },
  {
    id: 'macos-14',
    name: 'macOS Sonoma',
    short: '14',
    finder: 'Finder 20',
    year: 2023,
    date: '26 September 2023',
    model: 'MacBook Pro (14-inch, M2 Pro, 2023)',
    bits: 'Sonoma, Retina 1512 \u00d7 982',
    status: 'ready',
    href: 'os/macos-14/',
    blurb:
      'Widgets come to the desktop, floating over the wallpaper in frosted glass \u2014 ' +
      'calendar, weather and world clocks over a Sonoma sunset.',
    highlights: ['Desktop widgets', 'System Settings', 'Weather + Clock'],
  },
  {
    id: 'macos-15',
    name: 'macOS Sequoia',
    short: '15',
    finder: 'Finder 20',
    year: 2024,
    date: '16 September 2024',
    model: 'MacBook Pro (14-inch, M3 Pro, 2023)',
    bits: 'Sequoia, Retina 1512 \u00d7 982',
    status: 'ready',
    href: 'os/macos-15/',
    blurb:
      'Drag a window to an edge and it snaps into place \u2014 real window tiling, plus the ' +
      'new Passwords app, iPhone Mirroring in Control Center and a calculator that calculates.',
    highlights: ['Window tiling', 'Passwords app', 'Working Calculator'],
  },
  {
    id: 'macos-26',
    name: 'macOS Tahoe',
    short: '26',
    finder: 'Finder 20',
    year: 2025,
    date: '15 September 2025',
    model: 'MacBook Pro (14-inch, M4 Pro, 2024)',
    bits: 'Tahoe, Liquid Glass 1512 \u00d7 982',
    status: 'ready',
    href: 'os/macos-26/',
    blurb:
      'The first big redesign since Big Sur: Liquid Glass everywhere \u2014 translucent ' +
      'menu bar, glass Dock and glassy windows \u2014 plus the Phone and Games apps.',
    highlights: ['Liquid Glass', 'Phone + Games apps', 'Window tiling'],
  },
  {
    id: 'macos-27',
    name: 'macOS Golden Gate',
    short: '27',
    finder: 'Finder 20',
    year: 2026,
    date: '14 September 2026',
    model: 'MacBook Pro (14-inch, M5 Pro, 2025)',
    bits: 'Golden Gate, Liquid Glass 1512 \u00d7 982',
    status: 'ready',
    href: 'os/macos-27/',
    blurb:
      'Siri AI arrives \u2014 a conversational Siri with its own app \u2014 with Visual ' +
      'Intelligence on the Mac, Safari tab topics and a Liquid Glass slider that really ' +
      'slides. The first Apple-Silicon-only macOS.',
    highlights: ['Siri AI app', 'Visual Intelligence', 'Liquid Glass slider'],
  },
];
