// 生产环境 E2E：https://gakiwoo.com/foodcalorie/ 登录→记录→添加→清理
const puppeteer = require('puppeteer-core');
const { EMAIL, PWD } = require('./test-credentials');
// 生产验证脚本：默认打生产；可用 FC_E2E_BASE 覆盖（如本地联调）
const { CHROME, BASE: _base } = require('./e2e-config');
const BASE = process.env.FC_E2E_BASE ? _base : 'https://foodcalorie.gakiwoo.com/';
const SHOT = require('os').tmpdir() + '/fc-verify-shots';
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
    await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
    await page.type('input[placeholder="请输入密码"]', PWD);
    await page.click('button');
    let p = '';
    for (let i = 0; i < 20; i++) { p = await page.evaluate(() => location.pathname); if (p === '/' || p === '/foodcalorie') break; await sleep(500); }
    ok('生产登录→首页', p === '/' || p === '/foodcalorie', p);

    // 3) 记录页真实数据（生产 API 全链路）
    await page.goto(BASE + 'records', { waitUntil: 'networkidle2' });
    await sleep(4000);
    const recText = await page.evaluate(() => document.body.innerText);
    ok('生产记录页真实数据', recText.includes('记录') && (recText.includes('已摄入') || recText.includes('今日摄入')), recText.slice(0, 60));
    await page.screenshot({ path: SHOT + '/02-records.png' });

    // 4) 添加记录（搜索→添加）
    await page.goto(BASE + 'addfood', { waitUntil: 'networkidle2' });
    await sleep(3000);
    await page.type('input[placeholder="搜索食物名称"]', '鸡蛋');
    await sleep(1500);
    const rc = await page.evaluate(() => document.querySelectorAll('[data-name^="food-result-"]').length);
    ok('生产搜索「鸡蛋」出结果', rc >= 1, 'results=' + rc);
    await page.evaluate(() => { const el = document.querySelector('[data-name^="food-result-"]'); if (el) el.click(); });
    await sleep(800);
    // 设计稿 AddFood 为多选+保存栏：选中后点击"保存记录"
    await page.evaluate(() => { const el = document.querySelector('[data-name="save-records-btn"]'); if (el) el.click(); });
    await sleep(3000);
    ok('添加→回记录页', (await page.evaluate(() => location.pathname)) === '/records', 'path=' + (await page.evaluate(() => location.pathname)));
    const hasEgg = await page.evaluate(() => document.body.innerText.includes('鸡蛋'));
    ok('记录含「鸡蛋」', hasEgg, '');
    await page.screenshot({ path: SHOT + '/03-records-added.png' });

    // 5) 识别页（Kimi）
    await page.goto(BASE + 'camera', { waitUntil: 'networkidle2' });
    await sleep(2500);
    ok('生产相机页加载', await page.evaluate(() => !!document.querySelector('.fa-camera')), '');

    // 清理测试记录（记录列表已无删除图标，需进入详情页删除）
    await page.goto(BASE + 'records', { waitUntil: 'networkidle2' });
    await sleep(3000);
    await page.evaluate(() => {
      // 点击第一条记录卡片进入详情
      const card = document.querySelector('[data-name^="food-card-"]');
      if (card) card.click();
    });
    await sleep(2000);
    await page.evaluate(() => {
      // 详情页删除按钮：红色描边"删除记录"
      const btns = Array.from(document.querySelectorAll('button, span, div'));
      const del = btns.find((b) => b.innerText && b.innerText.includes('删除记录'));
      if (del) del.click();
    });
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
