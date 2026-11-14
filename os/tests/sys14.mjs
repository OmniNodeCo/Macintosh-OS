import { open } from './lib.mjs';
let pass = 0, fail = 0;
const t = (name, cond, extra = '') => { if (cond) { pass++; console.log(`ok    ${name}`); } else { fail++; console.log(`FAIL  ${name}  ${extra}`); } };
const { browser, page, errors } = await open('http://127.0.0.1:8000/os/macos-14/', { width: 1512, height: 982 });
const winText = (sel) => page.$eval(sel, (w) => w.textContent);

t('boots to desktop without errors', errors.length === 0, errors.join(' | '));
t('24px menu bar', await page.$eval('#menubar', (e) => e.offsetHeight) === 24);

t('desktop widgets present (3)', await page.$$eval('.desk-widget', (w) => w.length) === 3);
t('widget content', await page.$eval('#desktop', (d) => d.textContent.includes('25') && d.textContent.includes('58°') && d.textContent.includes('Cupertino')));

await page.waitForFunction(() => document.querySelectorAll('.win').length >= 3, { timeout: 5000 });
const names = await page.evaluate(() => [...document.querySelectorAll('.win')].map((w) => w.dataset.app || '?'));
t('boot trio finder+about+safari', ['finder', 'about', 'safari'].every((x) => names.includes(x)), names.join(','));
t('About: M2 Pro 16 GB', (await winText('.win[data-app="about"]')).includes('Apple M2 Pro') && (await winText('.win[data-app="about"]')).includes('16 GB'));
t('About: Sonoma 14.0', (await winText('.win[data-app="about"]')).includes('Version 14.0'));
t('Safari: 3 tabs', await page.$eval('.win[data-app="safari"]', (w) => w.querySelectorAll('.tab').length === 3));

await page.evaluate(() => window.mac.launch('sysprefs'));
await page.waitForSelector('.win[data-app="sysprefs"] .set-row', { timeout: 3000 });
t('Settings sidebar (25+ rows)', await page.$eval('.win[data-app="sysprefs"]', (w) => w.querySelectorAll('.set-row').length > 25));

t('Control Center: Stage Manager', await page.evaluate(() => {
  window.mac.toggleCC();
  const ok = document.querySelector('#controlcenter').textContent.includes('Stage Manager');
  window.mac.toggleCC();
  return ok;
}));

t('Weather app opens', await page.evaluate(() => !!window.mac.launch('weather')));
t('Clock app opens', await page.evaluate(() => !!window.mac.launch('clock')));
t('restart returns to boot with logo', await page.evaluate(() => { window.mac.restart(); return true; }) && await page.waitForFunction(() => !!document.querySelector('.boot-apple svg'), { timeout: 4000 }).then(() => true).catch(() => false));
t('no console errors at end', errors.length === 0, errors.join(' | '));

console.log(`\n${pass} passed, ${fail} failed (sys14)`);
await browser.close();
process.exit(fail ? 1 : 0);
