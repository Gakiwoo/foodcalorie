// 一次性脚本：登录生产并截取 README 预览 4 页（Home/Me/Records/Discover）
// 运行：node frontend/scripts/snapshot-readme.cjs
const puppeteer = require('puppeteer-core');
const { EMAIL, PWD } = require('./test-credentials');
// 截图脚本：默认打生产；可用 FC_E2E_BASE 覆盖（如本地联调）
const { CHROME, BASE: _base } = require('./e2e-config');
const BASE = process.env.FC_E2E_BASE ? _base : 'https://foodcalorie.gakiwoo.com/';
const fs = require('fs');
const os = require('os');
const path = require('path');
const OUT = path.join(__dirname, '..', '..', 'docs', 'images');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'], protocolTimeout: 120000 });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // 登录
  await page.goto(BASE + 'login', { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(3500);
  await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
  await page.type('input[placeholder="请输入密码"]', PWD);
  await page.click('button');
  for (let i = 0; i < 20; i++) {
    const p = await page.evaluate(() => location.pathname);
    if (p === '/' || p === '/foodcalorie') break;
    await sleep(500);
  }
  await sleep(1500);

  const shots = [
    { path: BASE, file: 'home-v2.png', wait: 2000 },
    { path: BASE + 'records', file: 'records-v2.png', wait: 2500 },
    { path: BASE + 'discover', file: 'discover-v2.png', wait: 2000 },
    { path: BASE + 'me', file: 'me-v2.png', wait: 2000 }
  ];
  for (const s of shots) {
    await page.goto(s.path, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(s.wait);
    const file = path.join(OUT, s.file);
    await page.screenshot({ path: file, fullPage: false });
    console.log('snap:', s.file, fs.statSync(file).size, 'bytes');
  }
  await browser.close();
  console.log('DONE');
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
