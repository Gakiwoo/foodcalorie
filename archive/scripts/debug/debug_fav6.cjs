const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message.slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 200)); });
  await page.goto('http://127.0.0.1:5173/favorites', { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(10000); // App.jsx 静态 import 31 组件，首屏可能很慢
  const info = await page.evaluate(() => {
    const roots = document.querySelectorAll('#root');
    return {
      rootCount: roots.length,
      bodyStart: document.body.innerHTML.slice(0, 400),
      favCards: document.querySelectorAll('[data-name^="fav-card-"]').length,
      navSearch: !!document.querySelector('[data-name="nav-search"]')
    };
  });
  console.log('DOM:', JSON.stringify(info, null, 0));
  console.log('errors:', errors.length ? errors.join('\n') : '无');
  await browser.close();
})();
