/* Icons for the macOS Big Sur 11 clone.
   All of these are the official Big Sur icon artwork, extracted from
   macOS system software (.icns containers, PNG representations) — see
   CREDITS.md for the source repository and provenance. Only the tiny
   menu-bar glyphs (Wi-Fi, battery, Spotlight, Control Center) and the
   Apple logo are drawn in code. */

const OFFICIAL = {
  finder: '../../assets/icons/macos-11/finder.png',
  safari: '../../assets/icons/macos-11/safari.png',
  mail: '../../assets/icons/macos-11/mail.png',
  messages: '../../assets/icons/macos-11/messages.png',
  music: '../../assets/icons/macos-11/music.png',
  photos: '../../assets/icons/macos-11/photos.png',
  notes: '../../assets/icons/macos-11/notes.png',
  calendar: '../../assets/icons/macos-11/calendar.png',
  calculator: '../../assets/icons/macos-11/calculator.png',
  terminal: '../../assets/icons/macos-11/terminal.png',
  sysprefs: '../../assets/icons/macos-11/sysprefs.png',
  textedit: '../../assets/icons/macos-11/textedit.png',
  appstore: '../../assets/icons/macos-11/appstore.png',
  maps: '../../assets/icons/macos-11/maps.png',
  tv: '../../assets/icons/macos-11/tv.png',
  podcasts: '../../assets/icons/macos-11/podcasts.png',
  reminders: '../../assets/icons/macos-11/reminders.png',
  facetime: '../../assets/icons/macos-11/facetime.png',
  news: '../../assets/icons/macos-11/news.png',
  weather: '../../assets/icons/macos-11/weather.png',
  books: '../../assets/icons/macos-11/books.png',
  stocks: '../../assets/icons/macos-11/stocks.png',
  preview: '../../assets/icons/macos-11/preview.png',
  chess: '../../assets/icons/macos-11/chess.png',
  fontbook: '../../assets/icons/macos-11/fontbook.png',
  diskutil: '../../assets/icons/macos-11/diskutil.png',
  softwareupdate: '../../assets/icons/macos-11/softwareupdate.png',
  aboutmac: '../../assets/icons/macos-11/aboutmac.png',
  keychain: '../../assets/icons/macos-11/keychain.png',
  quicktime: '../../assets/icons/macos-11/quicktime.png',
  siri: '../../assets/icons/macos-11/siri.png',
  notifications: '../../assets/icons/macos-11/notifications.png',
  spotlight: '../../assets/icons/macos-11/spotlight.png',
  displays: '../../assets/icons/macos-11/displays.png',
  trash: '../../assets/icons/macos-11/trash.png',
  trashFull: '../../assets/icons/macos-11/trashFull.png',
  folder: '../../assets/icons/macos-11/folder.png',
  folderOpen: '../../assets/icons/macos-11/folderOpen.png',
  home: '../../assets/icons/macos-11/home.png',
  docsFolder: '../../assets/icons/macos-11/docsFolder.png',
  downloads: '../../assets/icons/macos-11/downloads.png',
  appsFolder: '../../assets/icons/macos-11/appsFolder.png',
  app: '../../assets/icons/macos-11/app.png',
  doc: '../../assets/icons/macos-11/doc.png',
  server: '../../assets/icons/macos-11/server.png',
  systemFolder: '../../assets/icons/macos-11/systemFolder.png',
  harddisk: '../../assets/icons/macos-11/harddisk.png',
  extdisk: '../../assets/icons/macos-11/extdisk.png',
  network: '../../assets/icons/macos-11/network.png',
  stop: '../../assets/icons/macos-11/stop.png',
  cautionBadge: '../../assets/icons/macos-11/cautionBadge.png',
  aliasBadge: '../../assets/icons/macos-11/aliasBadge.png',
  locked: '../../assets/icons/macos-11/locked.png',
  user: '../../assets/icons/macos-11/user.png',
  search: '../../assets/icons/macos-11/search.png',
  airdrop: '../../assets/icons/macos-11/airdrop.png',
  sbRecents: '../../assets/icons/macos-11/sbRecents.png',
  sbDesktop: '../../assets/icons/macos-11/sbDesktop.png',
  sbCloud: '../../assets/icons/macos-11/sbCloud.png',
  laptop: '../../assets/icons/macos-11/laptop.png',
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
  // tiny drawn fallback (menu glyphs are drawn at call sites)
  const cv = document.createElement('canvas');
  cv.width = cv.height = 32;
  cv.style.width = cv.style.height = `${size}px`;
  return cv;
}
