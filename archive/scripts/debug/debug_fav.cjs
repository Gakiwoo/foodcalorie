const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(3500);
  await page.type('input[placeholder="请输入邮箱地址"]', 't_fc_test@x.com');
  await page.type('input[placeholder="请输入密码"]', 'Test123456!');
  await page.click('button');
  await sleep(4000);
  // 预置收藏
  const s = await page.evaluate(async () => (await fetch('/api/v1/foodcalorie/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'recipe', ref_id: 1 }) })).status);
  console.log('seed:', s);
  // 直接页面内调 GET 看返回
  const g = await page.evaluate(async () => {
    const r = await fetch('/api/v1/foodcalorie/favorites');
    return { status: r.status, body: (await r.text()).slice(0, 300) };
  });
  console.log('GET favorites:', JSON.stringify(g));
  await page.goto('http://127.0.0.1:5173/favorites', { waitUntil: 'networkidle2' });
  await sleep(4000);
  const txt = await page.evaluate(() => document.body.innerText);
  console.log('页面文本(前200):', txt.slice(0, 200).replace(/\n+/g, ' | '));
  await browser.close();
})();
