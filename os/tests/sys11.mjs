import { open } from './lib.mjs';
let pass = 0, fail = 0;
const t = (name, cond, extra = '') => { if (cond) { pass++; console.log(`ok    ${name}`); } else { fail++; console.log(`FAIL  ${name}  ${extra}`); } };
const { browser, page, errors } = await open('http://127.0.0.1:8000/os/macos-11/', { width: 1280, height: 900 });

t('boots to desktop without errors', errors.length === 0, errors.join(' | '));
t('24px menu bar', await page.$eval('#menubar', (e) => e.offsetHeight) === 24);
t('screen scales to fit 1440×900 design', await page.evaluate(() => Math.abs(window.__macScale - Math.min(1, (window.innerWidth - 28) / 1440, (window.innerHeight - 96) / 900)) < 0.002));

await page.$eval('.mb-item.apple', (e) => e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 })));
await page.waitForFunction((s) => [...document.querySelectorAll('.menu')].some((m) => m.textContent.includes(s)), { timeout: 3000 }, 'System Preferences');
t('menu anchored under Apple item', await page.$eval('.menu', (m) => { const r = m.getBoundingClientRect(); const icon = document.querySelector('.mb-item.apple').getBoundingClientRect(); return Math.abs(r.left - icon.left) < 5 && Math.abs(r.top - icon.bottom) < 6; }));

const all = await page.evaluate(() => [...document.querySelectorAll('.win')].map((w) => w.textContent).join('|||'));
t('boot duo: About This Mac 11.2.3', all.includes('MacBook Pro') && all.includes('11.2.3'));
t('boot duo: Finder', all.includes('245.62 GB available'));
t('menu items era-correct', await page.evaluate(() => { document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); document.querySelector('.mb-item.apple').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 })); return document.querySelector('.menu').textContent.includes('System Preferences') && document.querySelector('.menu').textContent.includes('About This Mac'); }));

t('System Preferences opens (Big Sur layout)', await page.evaluate(() => {
  const item = [...document.querySelectorAll('.menu .mi')].find((m) => m.textContent.includes('System Preferences'));
  if (!item) return false;
  item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  return [...document.querySelectorAll('.win')].some((w) => w.textContent.includes('Apple ID') && w.textContent.includes('Desktop & Screen Saver'));
}));
t('Big Sur prefs rows', await page.evaluate(() => [...document.querySelectorAll('.win')].map((w) => w.textContent).join('|||')).then((s) => s.includes('Dock & Menu Bar') && s.includes('Siri') && s.includes('Desktop & Screen Saver')));

t('Safari placeholder opens (720×460)', await page.evaluate(() => !!window.mac.launch('safari')) && await page.$eval('.win', () => [...document.querySelectorAll('.win')].some((w) => w.textContent.includes('no network'))));
t('wallpaper gradient on #screen', await page.$eval('#screen', (s) => getComputedStyle(s).background.includes('gradient')));

t('Control Center opens with modules', await page.evaluate(() => { window.mac.toggleCC(true); return document.querySelector('#controlcenter').textContent.includes('Wi-Fi') && document.querySelector('#controlcenter').textContent.includes('Do Not Disturb') && document.querySelector('#controlcenter').textContent.includes('Display') && document.querySelector('#controlcenter').textContent.includes('Sound') && document.querySelector('#controlcenter').textContent.includes('Screen Mirroring'); }));
t('Do Not Disturb toggles (era-correct)', await page.evaluate(() => {
  const row = [...document.querySelectorAll('#controlcenter .cc-row')].find((r) => r.textContent.includes('Do Not Disturb'));
  if (!row) return false;
  row.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  const on = [...document.querySelectorAll('#controlcenter .cc-row')].find((r) => r.textContent.includes('Do Not Disturb'));
  const ok = on.textContent.includes('On');
  window.mac.toggleCC(false);
  return ok;
}));

t('System Preferences icon grid', await page.evaluate(() => { window.mac.launch('sysprefs'); return document.querySelectorAll('.prefs-item').length >= 25 && !!document.querySelector('.prefs-appleid') && !!document.querySelector('.prefs-search'); }));
t('prefs drill-in + back', await page.evaluate(() => {
  const item = [...document.querySelectorAll('.prefs-item')].find((i) => i.dataset.name === 'General');
  item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  const pane = document.querySelectorAll('.prefs-row').length >= 2;
  document.querySelector('.prefs-back').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  return pane && document.querySelectorAll('.prefs-item').length >= 25;
}));

t('green button animates to full screen', await page.evaluate(async () => {
  const win = document.querySelector('.win');
  const before = win.offsetWidth;
  win.querySelector('.light.zoom').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 450));
  const grew = win.offsetWidth >= before + 200;
  win.querySelector('.light.zoom').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 450));
  return grew && Math.abs(win.offsetWidth - before) < 8;
}));
t('yellow button minimizes', await page.evaluate(async () => {
  const wins = document.querySelectorAll('.win');
  const win = wins[wins.length - 1];
  win.querySelector('.light.min').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 800));
  return !win.isConnected;
}));

const restart = await page.evaluate(() => { window.mac.restart(); return true; });
t('restart returns to boot screen', restart && await page.waitForFunction(() => !!document.querySelector('.boot-apple'), { timeout: 4000 }).then(() => true).catch(() => false));
t('boot logo renders after restart', await page.waitForFunction(() => { const b = document.querySelector('.boot-apple svg'); return !!b && b.getBoundingClientRect().width > 20; }, { timeout: 4000 }).then(() => true).catch(() => false));
t('restart cleared windows', await page.waitForFunction(() => document.querySelectorAll('.win').length === 0, { timeout: 3000 }).then(() => true).catch(() => false));
t('single boot guard', await page.$$eval('#boot', (b) => b.length) === 1);

console.log(`\n${pass} passed, ${fail} failed (sys11)`);
await browser.close();
process.exit(fail ? 1 : 0);
