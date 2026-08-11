const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 150)); });
  await page.goto('http://127.0.0.1:5173/favorites', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(5000);
  const names = await page.evaluate(() => Array.from(document.querySelectorAll('[data-name]')).map(e => e.getAttribute('data-name')).slice(0, 12));
  console.log('data-name:', JSON.stringify(names));
  console.log('errors:', errors.length ? errors.join('\n') : '无');
  await browser.close();
})();
