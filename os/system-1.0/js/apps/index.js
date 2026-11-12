/* Application registry — everything the Launcher and the Apple menu can start. */

import launcher from './launcher.js';
import macwrite from './macwrite.js';
import macpaint from './macpaint.js';
import calculator from './calculator.js';
import clock from './clock.js';
import controlpanel from './controlpanel.js';
import keycaps from './keycaps.js';
import notepad from './notepad.js';
import puzzle from './puzzle.js';
import scrapbook from './scrapbook.js';
import credits from './credits.js';
import about from './about.js';

export const APPS = [
  launcher,
  macwrite,
  macpaint,
  calculator,
  clock,
  controlpanel,
  keycaps,
  notepad,
  puzzle,
  scrapbook,
  credits,
  about,
];

export const APP_MAP = new Map(APPS.map((a) => [a.id, a]));

export function getApp(id) { return APP_MAP.get(id); }

/** App list for the Launcher grid (everything except the launcher itself). */
export const LAUNCHABLE = APPS.filter((a) => a.id !== 'launcher');
