import { open } from './lib.mjs';
let pass = 0, fail = 0;
const t = (name, cond, extra = '') => { if (cond) { pass++; console.log(`ok    ${name}`); } else { fail++; console.log(`FAIL  ${name}  ${extra}`); } };
const { browser, page, errors } = await open('http://127.0.0.1:8000/os/macos-27/', { width: 1512, height: 982 });
const winText = (sel) => page.$eval(sel, (w) => w.textContent);

t('boots to desktop without errors', errors.length === 0, errors.join(' | '));
t('24px glass menu bar', await page.$eval('#menubar', (e) => e.offsetHeight) === 24);
await page.waitForFunction(() => document.querySelectorAll('.win').length >= 3, { timeout: 5000 });
const names = await page.evaluate(() => [...document.querySelectorAll('.win')].map((w) => w.dataset.app || '?'));
t('boot trio finder+about+passwords', ['finder', 'about', 'passwords'].every((x) => names.includes(x)), names.join(','));
t('About: M5 Pro 24 GB', (await winText('.win[data-app="about"]')).includes('Apple M5 Pro') && (await winText('.win[data-app="about"]')).includes('24 GB'));
t('About: Golden Gate 27.0', (await winText('.win[data-app="about"]')).includes('Version 27.0'));
t('Finder: Hello Golden Gate', (await winText('.win[data-app="finder"]')).includes('Hello Golden Gate.rtf'));

t('Siri app opens (Siri AI)', await page.evaluate(() => !!window.mac.launch('siri')) && (await winText('.win[data-app="siri"]')).includes('What can I help with?'));
t('dock has Siri tile', await page.evaluate(() => !!document.querySelector('#dock .tile[data-app="siri"]')));

t('Visual Intelligence in Apple menu', await page.evaluate(() => {
  document.querySelector('.mb-item.apple').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 }));
  return [...document.querySelectorAll('.menu .mi')].some((m) => m.textContent.includes('Visual Intelligence'));
}));
await page.evaluate(() => document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));

t('Liquid Glass slider adjusts glass live', await page.evaluate(async () => {
  window.mac.launch('sysprefs');
  await new Promise((r) => setTimeout(r, 300));
  const w = document.querySelector('.win[data-app="sysprefs"]');
  [...w.querySelectorAll('.set-row')].find((r) => r.dataset.name === 'Appearance').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  const rng = w.querySelector('.glass-slider');
  if (!rng) return false;
  const before = getComputedStyle(document.querySelector('#menubar')).backgroundColor;
  rng.value = '80';
  rng.dispatchEvent(new Event('input'));
  await new Promise((r) => setTimeout(r, 120));
  const after = getComputedStyle(document.querySelector('#menubar')).backgroundColor;
  return before !== after && document.documentElement.style.getPropertyValue('--tga') === '0.80';
}));

t('green button animates to full screen', await page.evaluate(async () => {
  const win = document.querySelector('.win');
  const before = win.offsetWidth;
  win.querySelector('.light.zoom').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 450));
  const grew = win.offsetWidth >= 1500;
  win.querySelector('.light.zoom').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 450));
  return grew && Math.abs(win.offsetWidth - before) < 8;
}));

t('restart returns to boot with logo', await page.evaluate(() => { window.mac.restart(); return true; }) && await page.waitForFunction(() => !!document.querySelector('.boot-apple svg'), { timeout: 4000 }).then(() => true).catch(() => false));
t('no console errors at end', errors.length === 0, errors.join(' | '));

console.log(`\n${pass} passed, ${fail} failed (sys27)`);
await browser.close();
process.exit(fail ? 1 : 0);
