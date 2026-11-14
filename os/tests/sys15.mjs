import { open } from './lib.mjs';
let pass = 0, fail = 0;
const t = (name, cond, extra = '') => { if (cond) { pass++; console.log(`ok    ${name}`); } else { fail++; console.log(`FAIL  ${name}  ${extra}`); } };
const { browser, page, errors } = await open('http://127.0.0.1:8000/os/macos-15/', { width: 1512, height: 982 });
const winText = (sel) => page.$eval(sel, (w) => w.textContent);

t('boots to desktop without errors', errors.length === 0, errors.join(' | '));
t('24px menu bar', await page.$eval('#menubar', (e) => e.offsetHeight) === 24);
await page.waitForFunction(() => document.querySelectorAll('.win').length >= 3, { timeout: 5000 });
const names = await page.evaluate(() => [...document.querySelectorAll('.win')].map((w) => w.dataset.app || '?'));
t('boot trio finder+about+passwords', ['finder', 'about', 'passwords'].every((x) => names.includes(x)), names.join(','));
t('About: M3 Pro 18 GB', (await winText('.win[data-app="about"]')).includes('Apple M3 Pro') && (await winText('.win[data-app="about"]')).includes('18 GB'));
t('About: Sequoia 15.0', (await winText('.win[data-app="about"]')).includes('Version 15.0'));
t('Passwords app list', (await winText('.win[data-app="passwords"]')).includes('apple.com') && (await winText('.win[data-app="passwords"]')).includes('curator'));

t('Calculator opens', await page.evaluate(() => !!window.mac.launch('calculator')));
await page.click('.win[data-app="calculator"] .calc-btn:nth-child(5)');
await page.click('.win[data-app="calculator"] .calc-btn:nth-child(8)');
await page.click('.win[data-app="calculator"] .calc-btn:nth-child(6)');
await page.click('.win[data-app="calculator"] .calc-btn:nth-child(19)');
const disp = await page.$eval('.win[data-app="calculator"] .calc-disp', (d) => d.textContent);
t('Calculator computes 7×8=56', disp === '56', `display=${disp}`);

t('Control Center: iPhone Mirroring + Stage Manager', await page.evaluate(() => {
  window.mac.toggleCC();
  const cc = document.querySelector('#controlcenter');
  const ok = cc.textContent.includes('iPhone Mirroring') && cc.textContent.includes('Stage Manager');
  window.mac.toggleCC();
  return ok;
}));

t('Window menu has tiling items', await page.evaluate(() => {
  [...document.querySelectorAll('.mb-item')].find((i) => i.textContent === 'Window').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 }));
  return [...document.querySelectorAll('.menu')].some((m) => m.textContent.includes('Top Left') && m.textContent.includes('Fill') && m.textContent.includes('Right'));
}));
await page.evaluate(() => {
  const mi = [...document.querySelectorAll('.menu .mi')].find((m) => m.textContent.includes('Right'));
  mi.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 300));
const calcW = await page.$eval('.win[data-app="calculator"]', (el) => el.offsetWidth);
t('tiling: Right tiles calculator to half width', Math.abs(calcW - 756) < 8, `w=${calcW}`);

await page.evaluate(() => window.mac.launch('sysprefs'));
await page.waitForSelector('.win[data-app="sysprefs"] .set-row', { timeout: 3000 });
t('Settings sidebar (25+ rows)', await page.$eval('.win[data-app="sysprefs"]', (w) => w.querySelectorAll('.set-row').length > 25));

t('restart returns to boot with logo', await page.evaluate(() => { window.mac.restart(); return true; }) && await page.waitForFunction(() => !!document.querySelector('.boot-apple svg'), { timeout: 4000 }).then(() => true).catch(() => false));
t('no console errors at end', errors.length === 0, errors.join(' | '));

console.log(`\n${pass} passed, ${fail} failed (sys15)`);
await browser.close();
process.exit(fail ? 1 : 0);
