/* Icons for the macOS Monterey 12 clone.
   Monterey kept Big Sur's icon design, so these are the same official
   icon artwork extracted from macOS system software (see CREDITS.md,
   assets/icons/macos-11 for the full list). The Shortcuts icon and the
   menu-bar glyphs are museum drawings. */

const BASE = '../../assets/icons/macos-12/';

const OFFICIAL = {
  finder: BASE + 'finder.png',
  safari: BASE + 'safari.png',
  mail: BASE + 'mail.png',
  messages: BASE + 'messages.png',
  music: BASE + 'music.png',
  photos: BASE + 'photos.png',
  notes: BASE + 'notes.png',
  calendar: BASE + 'calendar.png',
  calculator: BASE + 'calculator.png',
  terminal: BASE + 'terminal.png',
  sysprefs: BASE + 'sysprefs.png',
  textedit: BASE + 'textedit.png',
  appstore: BASE + 'appstore.png',
  maps: BASE + 'maps.png',
  tv: BASE + 'tv.png',
  podcasts: BASE + 'podcasts.png',
  reminders: BASE + 'reminders.png',
  facetime: BASE + 'facetime.png',
  news: BASE + 'news.png',
  weather: BASE + 'weather.png',
  books: BASE + 'books.png',
  stocks: BASE + 'stocks.png',
  preview: BASE + 'preview.png',
  chess: BASE + 'chess.png',
  fontbook: BASE + 'fontbook.png',
  diskutil: BASE + 'diskutil.png',
  softwareupdate: BASE + 'softwareupdate.png',
  aboutmac: BASE + 'aboutmac.png',
  keychain: BASE + 'keychain.png',
  quicktime: BASE + 'quicktime.png',
  siri: BASE + 'siri.png',
  notifications: BASE + 'notifications.png',
  spotlight: BASE + 'spotlight.png',
  displays: BASE + 'displays.png',
  trash: BASE + 'trash.png',
  trashFull: BASE + 'trashFull.png',
  folder: BASE + 'folder.png',
  folderOpen: BASE + 'folderOpen.png',
  home: BASE + 'home.png',
  docsFolder: BASE + 'docsFolder.png',
  downloads: BASE + 'downloads.png',
  appsFolder: BASE + 'appsFolder.png',
  app: BASE + 'app.png',
  doc: BASE + 'doc.png',
  server: BASE + 'server.png',
  systemFolder: BASE + 'systemFolder.png',
  harddisk: BASE + 'harddisk.png',
  extdisk: BASE + 'extdisk.png',
  network: BASE + 'network.png',
  stop: BASE + 'stop.png',
  cautionBadge: BASE + 'cautionBadge.png',
  aliasBadge: BASE + 'aliasBadge.png',
  locked: BASE + 'locked.png',
  user: BASE + 'user.png',
  search: BASE + 'search.png',
  airdrop: BASE + 'airdrop.png',
  sbRecents: BASE + 'sbRecents.png',
  sbDesktop: BASE + 'sbDesktop.png',
  sbCloud: BASE + 'sbCloud.png',
  laptop: BASE + 'laptop.png',
  shortcuts: BASE + 'shortcuts.png',
};

export function iconURL(name) {
  return OFFICIAL[name] || null;
}

export function iconEl(name, size = 32) {
  const url = iconURL(name);
  if (url) {
    const img = new Image();
    img.src = url; img.alt = '';
    img.width = size; img.height = size;
    return img;
  }
  const cv = document.createElement('canvas');
  cv.width = cv.height = 32;
  cv.style.width = cv.style.height = `${size}px`;
  return cv;
}
