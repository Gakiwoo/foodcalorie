// M10 E2E：首页真实摄入 + 我的页真实用户信息
const puppeteer = require('puppeteer-core');
const { CHROME, BASE, SHOT_DIR } = require('./e2e-config');
const SHOT = SHOT_DIR + '/verify9';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require('fs');
fs.mkdirSync(SHOT, { recursive: true });

const { EMAIL, PWD } = require('./test-credentials');
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
    // 未登录首页 → 登录引导（游客态：API 401 → 错误提示+重试）
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 40000 });
    await sleep(3500);
    const guestText = await page.evaluate(() => document.body.innerText);
    ok('未登录首页显示登录引导', guestText.includes('未登录'), '');
    await page.screenshot({ path: SHOT + '/01-home-guest.png' });

    // 登录
    await page.goto(BASE + 'login', { waitUntil: 'networkidle2' });
    await sleep(3000);
    await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
    await page.type('input[placeholder="请输入密码"]', PWD);
    await page.click('button');
    for (let i = 0; i < 16; i++) { if ((await page.evaluate(() => location.pathname)) === '/') break; await sleep(500); }

    // 首页真实数据
    await page.goto(BASE, { waitUntil: 'networkidle2' });
    await sleep(3500);
    const homeText = await page.evaluate(() => document.body.innerText);
    ok('首页问候+拍照识别', homeText.includes('食刻') && homeText.includes('拍照识别'), '');
    ok('首页真实数据(今日记录)', homeText.includes('今日记录') && homeText.includes('查看全部'), '');
    ok('首页今日记录卡', homeText.includes('今天还没有记录') || /kcal/.test(homeText), '');
    await page.screenshot({ path: SHOT + '/02-home-auth.png' });

    // 首页 → 拍照识别卡（NAV camera-card）
    const cam = await page.evaluate(() => { const el = document.querySelector('[data-name="camera-card"]'); if (el) el.click(); return !!el; });
    await sleep(1500);
    ok('首页→拍照识别卡', cam && (await page.evaluate(() => location.pathname)) === '/camera', 'path=' + (await page.evaluate(() => location.pathname)));
    await page.goto(BASE, { waitUntil: 'networkidle2' });
    await sleep(2000);
    // 首页 → 设置（NAV nav-settings）
    const set = await page.evaluate(() => { const el = document.querySelector('[data-name="nav-settings"]'); if (el) el.click(); return !!el; });
    await sleep(1500);
    ok('首页→设置', set && (await page.evaluate(() => location.pathname)) === '/settings', 'path=' + (await page.evaluate(() => location.pathname)));

    // 我的页真实信息
    await page.goto(BASE + 'me', { waitUntil: 'networkidle2' });
    await sleep(3500);
    const meText = await page.evaluate(() => document.body.innerText);
    ok('我的页真实昵称', meText.includes('食刻联调') || meText.includes('未设置昵称') || meText.includes('已坚持健康饮食'), '');
    ok('我的页真实邮箱', meText.includes('t_fc_test@x.com'), '');
    ok('我的页今日摄入摘要', meText.includes('今日摄入') && /目标/.test(meText), '');
    ok('我的页快捷/设置入口', meText.includes('我的收藏') && meText.includes('通知设置') && meText.includes('关于我们'), '');
    await page.screenshot({ path: SHOT + '/03-me.png' });

    // 我的页快捷入口 quick-3 → 收藏页（NAV）
    const q3 = await page.evaluate(() => { const el = document.querySelector('[data-name="quick-3"]'); if (el) el.click(); return !!el; });
    await sleep(1500);
    ok('我的→收藏', q3 && (await page.evaluate(() => location.pathname)) === '/favorites', 'path=' + (await page.evaluate(() => location.pathname)));

    ok('无 JS 错误', errors.length === 0, errors.slice(0, 3).join(' | '));
    console.log(results.join('\n'));
  } catch (e) {
    console.log(results.join('\n'));
    console.log('❌ 异常:', e.message);
  } finally {
    await browser.close();
  }
})();
