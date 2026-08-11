// M8 E2E：发现页(contents) → 挑战页(challenges join/checkin) → 收藏页(favorites)
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173/';
const SHOT = 'C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/archive/verify-screenshots/verify7';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require('fs');
fs.mkdirSync(SHOT, { recursive: true });

const EMAIL = 't_fc_test@x.com';
const PWD = 'Test123456!';
const results = [];
const ok = (n, p, x = '') => results.push(`${p ? '✅' : '❌'} ${n}${x ? ' → ' + x : ''}`);

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });
  page.on('dialog', async (d) => d.accept());
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));

  try {
    // 登录
    await page.goto(BASE + 'login', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3500);
    await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
    await page.type('input[placeholder="请输入密码"]', PWD);
    await page.click('button');
    await sleep(4000);
    ok('登录', (await page.evaluate(() => location.pathname)) === '/');

    // 1) 发现页：内容流
    await page.goto(BASE + 'discover', { waitUntil: 'networkidle2' });
    await sleep(3500);
    const discText = await page.evaluate(() => document.body.innerText);
    ok('发现页内容流(含种子食谱/文章)', discText.includes('牛油果鸡肉沙拉') && discText.includes('减脂期蛋白质') && discText.includes('夏季轻食挑战'), '');
    await page.screenshot({ path: SHOT + '/01-discover.png' });
    // 分类切换：食谱
    await page.evaluate(() => { const d = [...document.querySelectorAll('div')].find((x) => x.textContent === '食谱'); if (d) d.click(); });
    await sleep(600);
    const recOnly = await page.evaluate(() => document.body.innerText);
    ok('分类切换「食谱」过滤', recOnly.includes('牛油果鸡肉沙拉') && !recOnly.includes('减脂期蛋白质'), '');
    await page.screenshot({ path: SHOT + '/02-discover-recipe.png' });

    // 2) 挑战页
    await page.goto(BASE + 'challenge', { waitUntil: 'networkidle2' });
    await sleep(3000);
    const chText = await page.evaluate(() => document.body.innerText);
    ok('挑战页加载(活动名/任务)', chText.includes('夏季轻食挑战') && chText.includes('我的任务'), '');
    await page.screenshot({ path: SHOT + '/03-challenge.png' });
    // 操作按钮：参与 或 打卡
    const btnInfo = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const b = btns.find((x) => /参与|打卡/.test(x.textContent));
      return b ? b.textContent.trim() : null;
    });
    ok('操作按钮存在(' + btnInfo + ')', !!btnInfo, 'btn=' + btnInfo);
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /参与|打卡/.test(x.textContent)); if (b) b.click(); });
    await sleep(800); // toast 约 1.6s 消失，需尽快捕获
    const toast1 = await page.evaluate(() => document.querySelector('.toast')?.textContent || '');
    ok('挑战操作触发(' + toast1 + ')', /加入|打卡|已参与/.test(toast1), 'toast=' + toast1);
    await page.screenshot({ path: SHOT + '/04-challenge-after.png' });

    // 3) 收藏页（先经页面 fetch 收藏 recipe/1）
    const seeded = await page.evaluate(async () => {
      const r = await fetch('/api/v1/foodcalorie/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'recipe', ref_id: 1 }) });
      return r.status;
    });
    ok('预置收藏(API)', seeded === 201 || seeded === 409, 'status=' + seeded);
    await page.goto(BASE + 'favorites', { waitUntil: 'networkidle2' });
    await sleep(4000); // 首次编译新组件可能较慢
    const favText = await page.evaluate(() => document.body.innerText);
    ok('收藏页显示内容标题', favText.includes('牛油果鸡肉沙拉') && favText.includes('食谱'), '');
    await page.screenshot({ path: SHOT + '/05-favorites.png' });
    // 取消收藏
    await page.evaluate(() => { const b = document.querySelector('.fa-bookmark'); if (b) b.click(); });
    await sleep(2500);
    const after = await page.evaluate(() => document.body.innerText);
    ok('取消收藏后为空态', after.includes('还没有收藏内容'), '');

    ok('无 JS 错误', errors.length === 0, errors.slice(0, 3).join(' | '));
    console.log(results.join('\n'));
  } catch (e) {
    console.log(results.join('\n'));
    console.log('❌ 异常:', e.message);
  } finally {
    await browser.close();
  }
})();
