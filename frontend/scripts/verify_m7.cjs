// M7 E2E：真实登录 → 记录页真实数据 → 添加记录(搜索) → 设置保存 → 删除记录
const puppeteer = require('puppeteer-core');
const { CHROME, BASE, SHOT_DIR } = require('./e2e-config');
const SHOT = SHOT_DIR + '/verify6';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require('fs');
fs.mkdirSync(SHOT, { recursive: true });

const { EMAIL, PWD } = require('./test-credentials');
const results = [];
const ok = (n, p, x = '') => results.push(`${p ? '✅' : '❌'} ${n}${x ? ' → ' + x : ''}`);

// 辅助：按文本点击按钮
const clickByText = (page, text) =>
  page.evaluate((t) => {
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find((x) => x.textContent.includes(t));
    if (b) b.click();
    return !!b;
  }, text);

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });
  page.on('dialog', async (d) => d.accept());
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));

  try {
    // 1) 登录
    await page.goto(BASE + 'login', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3500);
    await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
    await page.type('input[placeholder="请输入密码"]', PWD);
    await page.click('button');
    await sleep(4000);
    const p1 = await page.evaluate(() => location.pathname);
    ok('登录 → 首页', p1 === '/', 'path=' + p1);

    // 2) 记录页：真实 stats + 列表
    await page.goto(BASE + 'records', { waitUntil: 'networkidle2' });
    await sleep(3500);
    const recText = await page.evaluate(() => document.body.innerText);
    ok('记录页加载(含"今日记录")', recText.includes('今日记录') && recText.includes('已摄入'), '');
    const hasTotal = /今日摄入\s*\d+/.test(recText.replace(/\s+/g, ' '));
    ok('记录页显示真实摄入', hasTotal, '');
    await page.screenshot({ path: SHOT + '/01-records.png' });

    // 3) 添加记录：搜索 → 点结果 → 回记录页
    await page.goto(BASE + 'addfood', { waitUntil: 'networkidle2' });
    await sleep(2500);
    await page.type('input[placeholder="搜索食物（如：鸡胸肉、米饭）"]', '牛肉');
    await sleep(1500); // 防抖 350ms + 请求
    const resultsCount = await page.evaluate(() => document.querySelectorAll('[data-name^="food-result-"]').length);
    ok('搜索「牛肉」出结果', resultsCount >= 1, 'results=' + resultsCount);
    await page.screenshot({ path: SHOT + '/02-addfood-search.png' });
    const added = await page.evaluate(() => {
      const el = document.querySelector('[data-name^="food-result-"]');
      if (el) el.click();
      return !!el;
    });
    ok('点击搜索结果添加', added, '');
    await sleep(3500);
    const p2 = await page.evaluate(() => location.pathname);
    ok('添加后跳转 /records', p2 === '/records', 'path=' + p2);
    const listText = await page.evaluate(() => document.body.innerText);
    ok('记录列表含新增食物', listText.includes('牛肉'), '');

    // 4) 设置保存闭环：饮食偏好
    await page.goto(BASE + 'dietpref', { waitUntil: 'networkidle2' });
    await sleep(2500);
    await page.evaluate(() => {
      const chips = [...document.querySelectorAll('div')].filter((d) => d.textContent === '高蛋白');
      if (chips[0]) chips[0].click();
    });
    await sleep(300);
    await clickByText(page, '保存偏好');
    await sleep(2500);
    const p3 = await page.evaluate(() => location.pathname);
    ok('偏好保存 → /settings', p3 === '/settings', 'path=' + p3);
    await page.screenshot({ path: SHOT + '/03-settings.png' });

    // 5) 单位设置保存
    await page.goto(BASE + 'unit', { waitUntil: 'networkidle2' });
    await sleep(2500);
    await page.evaluate(() => {
      const d = [...document.querySelectorAll('div')].find((x) => x.textContent === '千焦 kJ');
      if (d) d.click();
    });
    await clickByText(page, '保存设置');
    await sleep(2500);
    ok('单位保存 → /settings', (await page.evaluate(() => location.pathname)) === '/settings', '');

    // 6) 个人信息页加载+保存
    await page.goto(BASE + 'profile', { waitUntil: 'networkidle2' });
    await sleep(3000);
    const profText = await page.evaluate(() => document.body.innerText);
    ok('个人信息加载(含昵称)', profText.includes('食刻联调') || profText.includes('t_fc_test'), '');
    await page.screenshot({ path: SHOT + '/04-profile.png' });
    await clickByText(page, '保存修改');
    await sleep(2500);
    ok('个人信息保存 → /me', (await page.evaluate(() => location.pathname)) === '/me', '');

    // 7) 记录页删除刚添加的记录
    await page.goto(BASE + 'records', { waitUntil: 'networkidle2' });
    await sleep(3000);
    const del = await page.evaluate(() => {
      const icons = [...document.querySelectorAll('.fa-trash-can')];
      if (icons[0]) icons[0].click();
      return icons.length;
    });
    ok('删除按钮可点', del >= 1, 'trash=' + del);
    await sleep(2500);
    const afterDel = await page.evaluate(() => document.body.innerText);
    ok('删除后列表无「牛肉」', !afterDel.includes('牛肉'), '');
    await page.screenshot({ path: SHOT + '/05-after-delete.png' });

    ok('无 JS 错误', errors.length === 0, errors.slice(0, 3).join(' | '));
    console.log(results.join('\n'));
  } catch (e) {
    console.log(results.join('\n'));
    console.log('❌ 异常:', e.message);
  } finally {
    await browser.close();
  }
})();
