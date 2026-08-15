// README 截图：登录测试账号 → 截取关键页面（375x812 手机视口）
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173';
const OUT = 'E:/00-Vibeo Coding/Foodcalorie/docs/images';
const EMAIL = 't_fc_test@x.com';
const PWD = 'Test123456!';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const fs = require('fs');
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 }); // 2x 高清

  // 登录
  await page.goto(BASE + '/login', { waitUntil: 'networkidle2', timeout: 40000 });
  await sleep(2500);
  await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
  await page.type('input[placeholder="请输入密码"]', PWD);
  await page.click('button');
  for (let i = 0; i < 16; i++) {
    if ((await page.evaluate(() => location.pathname)) !== '/login') break;
    await sleep(500);
  }
  console.log('登录后路径:', await page.evaluate(() => location.pathname));

  const shots = [
    ['/', 'home.png'],
    ['/records', 'records.png'],
    ['/me', 'me.png'],
    ['/discover', 'discover.png']
  ];
  for (const [path, file] of shots) {
    await page.goto(BASE + path, { waitUntil: 'networkidle2' });
    await sleep(1800); // 等数据渲染
    await page.screenshot({ path: OUT + '/' + file, fullPage: true });
    console.log('✅', file);
  }

  await browser.close();
  console.log('全部截图完成 →', OUT);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
