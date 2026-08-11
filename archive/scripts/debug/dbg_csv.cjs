const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(3000);
  await page.type('input[placeholder="请输入邮箱地址"]', 't_fc_test@x.com');
  await page.type('input[placeholder="请输入密码"]', 'Test123456!');
  await page.click('button');
  await sleep(4000);
  const info = await page.evaluate(async () => {
    const r = await fetch('/api/v1/foodcalorie/export?format=csv&range=all', { method: 'POST' });
    const buf = await r.arrayBuffer();
    const bytes = new Uint8Array(buf);
    return {
      status: r.status,
      ct: r.headers.get('content-type'),
      first3bytes: Array.from(bytes.slice(0, 3)),
      text: (await new Response(buf).text()).slice(0, 60)
    };
  });
  console.log(JSON.stringify(info));
  await browser.close();
})();
