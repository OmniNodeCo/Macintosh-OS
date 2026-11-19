import { open } from './lib.mjs';
let pass = 0, fail = 0;
const t = (name, cond, extra = '') => { if (cond) { pass++; console.log(`ok    ${name}`); } else { fail++; console.log(`FAIL  ${name}  ${extra}`); } };
const { browser, page, errors } = await open('http://127.0.0.1:8000/os/macos-26/', { width: 1512, height: 982 });
const winText = (sel) => page.$eval(sel, (w) => w.textContent);

t('boots to desktop without errors', errors.length === 0, errors.join(' | '));
t('24px glass menu bar', await page.$eval('#menubar', (e) => e.offsetHeight) === 24);
await page.waitForFunction(() => document.querySelectorAll('.win').length >= 3, { timeout: 5000 });
const names = await page.evaluate(() => [...document.querySelectorAll('.win')].map((w) => w.dataset.app || '?'));
t('boot trio finder+about+passwords', ['finder', 'about', 'passwords'].every((x) => names.includes(x)), names.join(','));
t('About: M4 Pro 24 GB', (await winText('.win[data-app="about"]')).includes('Apple M4 Pro') && (await winText('.win[data-app="about"]')).includes('24 GB'));
t('About: Tahoe 26.0', (await winText('.win[data-app="about"]')).includes('Version 26.0'));
t('Finder: Hello Tahoe', (await winText('.win[data-app="finder"]')).includes('Hello Tahoe.rtf'));

t('Phone + Games apps open', await page.evaluate(() => !!window.mac.launch('phone') && !!window.mac.launch('games')));
t('dock has Phone + Games tiles', await page.evaluate(() => !!document.querySelector('#dock .tile[data-app="phone"]') && !!document.querySelector('#dock .tile[data-app="games"]')));

t('green button animates to full screen', await page.evaluate(async () => {
  const win = document.querySelector('.win[data-app="games"]');
  const before = win.offsetWidth;
  win.querySelector('.light.zoom').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 450));
  const grew = win.offsetWidth >= 1500;
  win.querySelector('.light.zoom').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 450));
  return grew && Math.abs(win.offsetWidth - before) < 8;
}));
t('yellow button minimizes with animation', await page.evaluate(async () => {
  const win = document.querySelector('.win[data-app="games"]');
  win.querySelector('.light.min').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 800));
  return ![...document.querySelectorAll('.win')].some((w) => w.dataset.app === 'games' && !w.classList.contains('closing'));
}));

t('Settings sidebar present', await page.evaluate(() => { window.mac.launch('sysprefs'); return true; }) && await page.waitForSelector('.win[data-app="sysprefs"] .set-row', { timeout: 3000 }).then(() => page.$eval('.win[data-app="sysprefs"]', (w) => w.querySelectorAll('.set-row').length > 25)));
t('Liquid Glass chrome', await page.evaluate(() => getComputedStyle(document.querySelector('#menubar')).backdropFilter.includes('blur')));

t('restart returns to boot with logo', await page.evaluate(() => { window.mac.restart(); return true; }) && await page.waitForFunction(() => !!document.querySelector('.boot-apple svg'), { timeout: 4000 }).then(() => true).catch(() => false));
t('no console errors at end', errors.length === 0, errors.join(' | '));

console.log(`\n${pass} passed, ${fail} failed (sys26)`);
await browser.close();
process.exit(fail ? 1 : 0);
