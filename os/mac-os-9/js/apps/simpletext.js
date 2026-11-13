/* SimpleText — Mac OS 8's text utility (it grew out of TeachText).

   A thin wrapper over the museum's MacWrite: same document window, same
   printing, new name and icon. SimpleText was the little text tool that
   shipped with Mac OS 8; MacWrite had been gone from the price list for
   years by then. */

import macwrite from './macwrite.js';

export default {
  ...macwrite,
  id: 'simpletext',
  name: 'SimpleText',
  icon: 'notepad',
};
