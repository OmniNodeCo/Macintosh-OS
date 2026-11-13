/* The System 7 Apple menu: "About This Macintosh" first, then whatever lives
   in the Apple Menu Items folder inside the System Folder — exactly how the
   real Finder built the menu. Desk accessories became little applications in
   that folder; drop something in and it appears here. */

import * as FS from '../core/fs.js';

export function appleMenu(ctx) {
  const items = [
    { label: 'About This Macintosh…', action: () => ctx.launch('about') },
    { sep: true },
  ];

  const folder = FS.systemDisk()
    && (FS.systemDisk().children || []).find((c) => c.name === 'System Folder');
  const ami = folder && (folder.children || []).find((c) => c.name === 'Apple Menu Items');
  for (const node of (ami && ami.children) || []) {
    const target = node.kind === 'alias' ? FS.resolveAlias(node) : node;
    items.push({
      label: node.name,
      action: () => {
        if (!target) return;
        if (target.kind === 'folder' || target.kind === 'disk') {
          if (ctx.finder && ctx.finder.openContainer) ctx.finder.openContainer(target);
        } else {
          ctx.launch(target.app || 'macwrite', { file: target, fromNode: target });
        }
      },
    });
  }

  items.push({ sep: true });
  items.push({ label: 'Insert Disk File…', action: () => ctx.finder && ctx.finder.mountDiskFile && ctx.finder.mountDiskFile() });
  items.push({ label: 'Credits', action: () => ctx.launch('credits') });
  return { apple: true, items };
}

/** Simple Apple menu for utility windows (Get Info, About, Credits…). */
export function utilityMenus(ctx, win) {
  return [appleMenu(ctx), {
    title: 'File',
    items: [{ label: 'Close', key: 'W', action: () => win.close() }],
  }, {
    title: 'Special',
    items: [
      { label: 'Restart…', action: () => ctx.restart() },
      { label: 'Shut Down…', action: () => ctx.shutdown() },
    ],
  }];
}
