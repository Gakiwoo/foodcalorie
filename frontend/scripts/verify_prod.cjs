// 生产环境 E2E：https://gakiwoo.com/foodcalorie/ 登录→记录→添加→清理
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'https://foodcalorie.gakiwoo.com/';
const SHOT = 'C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/archive/verify-screenshots/verify12';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require('fs');
fs.mkdirSync(SHOT, { recursive: true });

const results = [];
const ok = (n, p, x = '') => results.push(`${p ? '✅' : '❌'} ${n}${x ? ' → ' + x : ''}`);

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'], protocolTimeout: 120000 });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });
  page.on('dialog', async (d) => d.accept());
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));

  try {
    // 1) 页面加载
    await page.goto(BASE + 'login', { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(4000);
    const loginText = await page.evaluate(() => document.body.innerText);
    ok('生产登录页加载', loginText.includes('食刻') && (await page.evaluate(() => !!document.querySelector('input[placeholder="请输入邮箱地址"]'))), '');
    await page.screenshot({ path: SHOT + '/01-login.png' });

    // 2) 真实登录
    await page.type('input[placeholder="请输入邮箱地址"]', 't_fc_test@x.com');
    await page.type('input[placeholder="请输入密码"]', 'Test123456!');
    await page.click('button');
    let p = '';
    for (let i = 0; i < 20; i++) { p = await page.evaluate(() => location.pathname); if (p === '/' || p === '/foodcalorie') break; await sleep(500); }
    ok('生产登录→首页', p === '/' || p === '/foodcalorie', p);

    // 3) 记录页真实数据（生产 API 全链路）
    await page.goto(BASE + 'records', { waitUntil: 'networkidle2' });
    await sleep(4000);
    const recText = await page.evaluate(() => document.body.innerText);
    ok('生产记录页真实数据', recText.includes('今日记录') && recText.includes('已摄入'), '');
    await page.screenshot({ path: SHOT + '/02-records.png' });

    // 4) 添加记录（搜索→添加）
    await page.goto(BASE + 'addfood', { waitUntil: 'networkidle2' });
    await sleep(3000);
    await page.type('input[placeholder="搜索食物（如：鸡胸肉、米饭）"]', '鸡蛋');
    await sleep(1500);
    const rc = await page.evaluate(() => document.querySelectorAll('[data-name^="food-result-"]').length);
    ok('生产搜索「鸡蛋」出结果', rc >= 1, 'results=' + rc);
    await page.evaluate(() => { const el = document.querySelector('[data-name^="food-result-"]'); if (el) el.click(); });
    await sleep(4000);
    ok('添加→回记录页', (await page.evaluate(() => location.pathname)) === '/records', 'path=' + (await page.evaluate(() => location.pathname)));
    const hasEgg = await page.evaluate(() => document.body.innerText.includes('鸡蛋'));
    ok('记录含「鸡蛋」', hasEgg, '');
    await page.screenshot({ path: SHOT + '/03-records-added.png' });

    // 5) 识别页（Kimi）
    await page.goto(BASE + 'camera', { waitUntil: 'networkidle2' });
    await sleep(2500);
    ok('生产相机页加载', await page.evaluate(() => !!document.querySelector('.fa-camera')), '');

    // 清理测试记录
    await page.goto(BASE + 'records', { waitUntil: 'networkidle2' });
    await sleep(3000);
    await page.evaluate(() => { const el = document.querySelector('.fa-trash-can'); if (el) el.click(); });
    await sleep(2500);

    ok('无 JS 错误', errors.length === 0, errors.slice(0, 3).join(' | '));
    console.log(results.join('\n'));
  } catch (e) {
    console.log(results.join('\n'));
    console.log('❌ 异常:', e.message);
  } finally {
    await browser.close();
  }
})();
