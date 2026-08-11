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
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(3500);
  await page.type('input[placeholder="请输入邮箱地址"]', 't_fc_test@x.com');
  await page.type('input[placeholder="请输入密码"]', 'Test123456!');
  await page.click('button');
  await sleep(4000);
  await page.goto('http://127.0.0.1:5173/favorites', { waitUntil: 'networkidle2' });
  await sleep(5000);
  const txt = await page.evaluate(() => document.body.innerText);
  console.log('页面文本:', txt.slice(0, 250).replace(/\n+/g, ' | '));
  const g = await page.evaluate(async () => {
    const r = await fetch('/api/v1/foodcalorie/favorites');
    return { status: r.status, body: (await r.text()).slice(0, 200) };
  });
  console.log('页面内 GET:', JSON.stringify(g));
  console.log('errors:', errors.length ? errors.join('\n') : '无');
  await browser.close();
})();
