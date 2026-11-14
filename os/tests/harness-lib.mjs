import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function launchBrowser() {
  return puppeteer.launch({
    args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=1'],
    defaultViewport: null,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless ?? true,
  });
}

export function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

export async function open(url, viewport = { width: 1280, height: 900 }) {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)); });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
  await sleep(400);
  await page.evaluate(() => {
    const b = document.getElementById('boot');
    if (b) b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  }).catch(() => {});
  await sleep(1400);
  return { browser, page, errors };
}
