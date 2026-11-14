import { open } from './lib.mjs';
let pass = 0, fail = 0;
const t = (name, cond, extra = '') => { if (cond) { pass++; console.log(`ok    ${name}`); } else { fail++; console.log(`FAIL  ${name}  ${extra}`); } };
const { browser, page, errors } = await open('http://127.0.0.1:8000/os/macos-13/', { width: 1470, height: 956 });
const winText = (sel) => page.$eval(sel, (w) => w.textContent);

t('boots to desktop without errors', errors.length === 0, errors.join(' | '));
t('24px menu bar', await page.$eval('#menubar', (e) => e.offsetHeight) === 24);
await page.waitForFunction(() => document.querySelectorAll('.win').length >= 3, { timeout: 5000 });
const names = await page.evaluate(() => [...document.querySelectorAll('.win')].map((w) => w.dataset.app || '?'));
t('boot trio finder+about+settings', ['finder', 'about', 'sysprefs'].every((x) => names.includes(x)), names.join(','));

await page.$eval('.mb-item.apple', (e) => e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 })));
await page.waitForFunction((s) => [...document.querySelectorAll('.menu')].some((m) => m.textContent.includes(s)), { timeout: 3000 }, 'System Settings');
t('menu anchored under Apple item', await page.$eval('.menu', (m) => { const r = m.getBoundingClientRect(); const icon = document.querySelector('.mb-item.apple').getBoundingClientRect(); return Math.abs(r.left - icon.left) < 5 && Math.abs(r.top - icon.bottom) < 6; }));
t('Apple menu shows System Settings', await page.$eval('.menu', (m) => m.textContent.includes('System Settings')));
await page.evaluate(() => document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));

t('About: MacBook Air M2 8 GB', (await winText('.win[data-app="about"]')).includes('MacBook Air') && (await winText('.win[data-app="about"]')).includes('Apple M2') && (await winText('.win[data-app="about"]')).includes('8 GB'));
t('About: Ventura 13.0', (await winText('.win[data-app="about"]')).includes('Version 13.0'));
t('Finder: Hello Ventura + 342.18 GB', (await winText('.win[data-app="finder"]')).includes('Hello Ventura.rtf') && (await winText('.win[data-app="finder"]')).includes('342.18 GB available'));

const set = await page.$('.win[data-app="sysprefs"]');
t('Settings window titled System Settings', await set.evaluate((w) => w.querySelector('.title .wt').textContent === 'System Settings'));
const rows = await set.evaluate((w) => w.querySelectorAll('.set-row').length);
t('settings sidebar rows (25+)', rows > 25, `rows=${rows}`);
const side = await set.evaluate((w) => w.querySelector('.set-side').textContent);
for (const row of ['Wi-Fi', 'Desktop & Dock', 'Software Update', 'Wallpaper', 'Touch ID & Password']) t(`sidebar row ${row}`, side.includes(row));
t('General pane by default', await set.evaluate((w) => w.querySelector('.set-pane h2').textContent.includes('General')));
await set.evaluate((w) => [...w.querySelectorAll('.set-row')].find((r) => r.dataset.name === 'Wi-Fi').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
t('Wi-Fi pane switches', await set.evaluate((w) => w.querySelector('.set-pane').textContent.includes('Museum-5G')));

t('Control Center: Stage Manager + Focus', await page.evaluate(() => {
  window.mac.toggleCC();
  const cc = document.querySelector('#controlcenter');
  const ok = cc.textContent.includes('Stage Manager') && cc.textContent.includes('Focus');
  window.mac.toggleCC();
  return ok;
}));

t('Weather app: Cupertino 58°', await page.evaluate(() => !!window.mac.launch('weather')) && (await winText('.win[data-app="weather"]')).includes('Cupertino') && (await winText('.win[data-app="weather"]')).includes('58°'));
t('Clock app opens', await page.evaluate(() => !!window.mac.launch('clock')));

t('restart returns to boot with logo', await page.evaluate(() => { window.mac.restart(); return true; }) && await page.waitForFunction(() => !!document.querySelector('.boot-apple svg'), { timeout: 4000 }).then(() => true).catch(() => false));
t('no console errors at end', errors.length === 0, errors.join(' | '));

console.log(`\n${pass} passed, ${fail} failed (sys13)`);
await browser.close();
process.exit(fail ? 1 : 0);
