import { open } from './lib.mjs';
let pass = 0, fail = 0;
const t = (name, cond, extra = '') => { if (cond) { pass++; console.log(`ok    ${name}`); } else { fail++; console.log(`FAIL  ${name}  ${extra}`); } };
const { browser, page, errors } = await open('http://127.0.0.1:8000/os/macos-12/', { width: 1512, height: 982 });

t('boots to desktop without errors', errors.length === 0, errors.join(' | '));
t('24px menu bar', await page.$eval('#menubar', (e) => e.offsetHeight) === 24);

await page.$eval('.mb-item.apple', (e) => e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 })));
await page.waitForFunction((s) => [...document.querySelectorAll('.menu')].some((m) => m.textContent.includes(s)), { timeout: 3000 }, 'System Preferences');
t('menu anchored under Apple item', await page.$eval('.menu', (m) => { const r = m.getBoundingClientRect(); const icon = document.querySelector('.mb-item.apple').getBoundingClientRect(); return Math.abs(r.left - icon.left) < 5 && Math.abs(r.top - icon.bottom) < 6; }));
t('Apple menu shows System Preferences', await page.$eval('.menu', (m) => m.textContent.includes('System Preferences')));
await page.evaluate(() => document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));

const layout = await page.evaluate(() => ({
  wins: [...document.querySelectorAll('.win')].map((w) => ({ t: w.querySelector('.title .wt')?.textContent || '', body: w.textContent })),
}));
t('boot trio: About, Finder, Safari', layout.wins.length === 3 && layout.wins.some((w) => w.t === 'Safari') && layout.wins.some((w) => w.t === 'Recents') && layout.wins.some((w) => w.body.includes('12.0.1')), layout.wins.map((w) => w.t).join(','));
t('screen scales to fit 1512×982 design', await page.evaluate(() => Math.abs(window.__macScale - Math.min(1, (window.innerWidth - 28) / 1512, (window.innerHeight - 96) / 982)) < 0.002));
const bodyAll = layout.wins.map((w) => w.body).join('|||');
t('About: MacBook Pro (14-inch M1 Pro, 16 GB)', bodyAll.includes('MacBook Pro') && bodyAll.includes('M1 Pro') && bodyAll.includes('16 GB'));
t('About: Monterey 12.0.1', bodyAll.includes('Version 12.0.1'));
const sizes = await page.$$eval('.win', (w) => w.map((x) => [x.offsetWidth, x.offsetHeight]));
t('Monterey palette sizes 900×560 / 420×520 / 820×520', sizes.some((s) => s[0] === 420 && s[1] === 520) && sizes.some((s) => s[0] === 900 && s[1] === 560) && sizes.some((s) => s[0] === 820 && s[1] === 520), JSON.stringify(sizes));
const safari = layout.wins.find((w) => w.t === 'Safari');
t('Safari: Apple/MacRumors/Museum Wall tabs', safari && safari.body.includes('Apple') && safari.body.includes('MacRumors') && safari.body.includes('Museum Wall'));
t('Safari tab content', safari && safari.body.includes('Focus, Shortcuts') && safari.body.includes('apple.com'));
t('Finder status: 342.18 GB available', bodyAll.includes('342.18 GB available'));
t('Monterey System Preferences bands', await page.evaluate(() => !!window.mac.launch('sysprefs')) && await page.evaluate(() => [...document.querySelectorAll('.win')].map((w) => w.textContent).join('|||')).then((s) => s.includes('Battery') && s.includes('Time Machine') && s.includes('Users & Groups') && s.includes('Network')));
t('wallpaper shuffle API', await page.evaluate(() => { window.mac.shuffleWallpaper(); return typeof window.mac.shuffleWallpaper === 'function'; }));

t('Control Center: Display/Sound/Focus + setFocus', await page.evaluate(() => {
  window.mac.toggleCC();
  const cc = document.querySelector('#controlcenter');
  const ok1 = cc.textContent.includes('Display') && cc.textContent.includes('Sound') && cc.textContent.includes('Focus');
  window.mac.setFocus('dnd');
  const ok2 = window.mac.focus() === 'dnd';
  window.mac.toggleCC();
  return ok1 && ok2;
}));
t('no Stage Manager in 12.0.1 CC (era-accurate)', await page.evaluate(() => { window.mac.toggleCC(); const ok = !document.querySelector('#controlcenter').textContent.includes('Stage Manager'); window.mac.toggleCC(); return ok; }));

const restart = await page.evaluate(() => { window.mac.restart(); return true; });
t('restart returns to boot screen', restart && await page.waitForFunction(() => !!document.querySelector('.boot-apple'), { timeout: 4000 }).then(() => true).catch(() => false));
t('boot logo renders after restart', await page.waitForFunction(() => !!document.querySelector('.boot-apple svg'), { timeout: 4000 }).then(() => true).catch(() => false));

console.log(`\n${pass} passed, ${fail} failed (sys12)`);
await browser.close();
process.exit(fail ? 1 : 0);
