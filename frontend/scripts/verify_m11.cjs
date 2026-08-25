// M11 E2E：食谱/文章详情（contents/:id + 收藏）、目标设置（profile）、搜索页（foods）
const puppeteer = require('puppeteer-core');
const { CHROME, BASE, SHOT_DIR } = require('./e2e-config');
const SHOT = SHOT_DIR + '/verify10';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require('fs');
fs.mkdirSync(SHOT, { recursive: true });

const { EMAIL, PWD } = require('./test-credentials');
const results = [];
const ok = (n, p, x = '') => results.push(`${p ? '✅' : '❌'} ${n}${x ? ' → ' + x : ''}`);
const clickByText = (page, text) =>
  page.evaluate((t) => {
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find((x) => x.textContent.includes(t));
    if (b) b.click();
    return !!b;
  }, text);

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'], protocolTimeout: 120000 });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });
  page.on('dialog', async (d) => d.accept());
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));

  try {
    // 登录
    await page.goto(BASE + 'login', { waitUntil: 'networkidle2', timeout: 40000 });
    await sleep(3000);
    await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
    await page.type('input[placeholder="请输入密码"]', PWD);
    await page.click('button');
    for (let i = 0; i < 16; i++) { if ((await page.evaluate(() => location.pathname)) === '/') break; await sleep(500); }

    // 1) 发现页 → 食谱详情（带 id）
    await page.goto(BASE + 'discover', { waitUntil: 'networkidle2' });
    await sleep(3000);
    const recipeGo = await page.evaluate(() => {
      const el = [...document.querySelectorAll('[data-name^="discover-card-"]')].find((x) => x.textContent.includes('牛油果鸡肉沙拉'));
      if (el) el.click();
      return !!el;
    });
    await sleep(3000);
    const rp = await page.evaluate(() => location.pathname + location.search);
    ok('发现→食谱详情(带id)', recipeGo && /\/recipe\?id=\d+/.test(rp), rp);
    const recipeText = await page.evaluate(() => document.body.innerText);
    ok('食谱真实食材/步骤', recipeText.includes('所需食材') && recipeText.includes('烹饪步骤') && recipeText.includes('鸡胸肉 150g'), '');
    ok('食谱真实营养(382 kcal)', recipeText.includes('382') && recipeText.includes('热量 kcal'), '');
    await page.screenshot({ path: SHOT + '/01-recipe.png' });

    // 2) 收藏食谱 → 收藏页可见 → 取消
    const favRecipe = await page.evaluate(() => { const el = document.querySelector('.fa-bookmark'); if (el) el.click(); return !!el; });
    await sleep(2500);
    ok('收藏食谱', favRecipe, '');
    await page.goto(BASE + 'favorites', { waitUntil: 'networkidle2' });
    await sleep(3000);
    const favText = await page.evaluate(() => document.body.innerText);
    ok('收藏页含食谱', favText.includes('牛油果鸡肉沙拉'), '');
    const unFav = await page.evaluate(() => { const el = document.querySelector('.fa-bookmark'); if (el) el.click(); return !!el; });
    await sleep(2500);
    ok('取消收藏', unFav && (await page.evaluate(() => document.body.innerText.includes('还没有收藏内容'))), '');

    // 3) 发现页 → 文章详情（带 id）
    await page.goto(BASE + 'discover', { waitUntil: 'networkidle2' });
    await sleep(3000);
    const articleGo = await page.evaluate(() => {
      const el = [...document.querySelectorAll('[data-name^="discover-card-"]')].find((x) => x.textContent.includes('减脂期蛋白质'));
      if (el) el.click();
      return !!el;
    });
    await sleep(3000);
    const ap = await page.evaluate(() => location.pathname + location.search);
    ok('发现→文章详情(带id)', articleGo && /\/article\?id=\d+/.test(ap), ap);
    const articleText = await page.evaluate(() => document.body.innerText);
    ok('文章真实正文/作者', articleText.includes('蛋白质能提高饱腹感') && articleText.includes('食刻科普'), '');
    await page.screenshot({ path: SHOT + '/02-article.png' });

    // 4) 目标设置（profile GET/PUT）
    await page.goto(BASE + 'goal', { waitUntil: 'networkidle2' });
    await sleep(3000);
    const goalText = await page.evaluate(() => document.body.innerText);
    ok('目标页真实加载(当前目标)', goalText.includes('健康目标') && goalText.includes('每日目标热量'), '');
    // 改目标为「保持」+ 目标热量 1600
    await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find((x) => x.textContent.trim() === '保持' && x.style?.cursor === 'pointer'); if (el) el.click(); });
    await sleep(300);
    await page.evaluate(() => { const inp = [...document.querySelectorAll('input')].find((i) => i.type === 'number'); if (inp) { inp.value = ''; } });
    await page.type('input[type="number"]', '1600');
    await page.screenshot({ path: SHOT + '/03-goal.png' });
    await clickByText(page, '保存目标');
    await sleep(3000);
    ok('保存目标→回我的', (await page.evaluate(() => location.pathname)) === '/me', 'path=' + (await page.evaluate(() => location.pathname)));
    const meText = await page.evaluate(() => document.body.innerText);
    ok('我的页目标已更新(1600)', meText.includes('1600'), '');
    // 还原目标（避免影响其他测试）
    await page.goto(BASE + 'goal', { waitUntil: 'networkidle2' });
    await sleep(2500);
    await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find((x) => x.textContent.trim() === '减脂' && x.style?.cursor === 'pointer'); if (el) el.click(); });
    await sleep(300);
    await page.evaluate(() => { const inp = [...document.querySelectorAll('input')].find((i) => i.type === 'number'); if (inp) { inp.value = ''; } });
    await page.type('input[type="number"]', '1400');
    await clickByText(page, '保存目标');
    await sleep(2500);

    // 5) 搜索页（foods 搜索 → 添加记录）
    await page.goto(BASE + 'search', { waitUntil: 'networkidle2' });
    await sleep(2500);
    await page.type('input[placeholder="搜索食物（如：鸡胸肉、米饭）"]', '燕麦');
    await sleep(1500);
    const resultsCount = await page.evaluate(() => document.querySelectorAll('[data-name^="search-result-"]').length);
    ok('搜索「燕麦」出结果', resultsCount >= 1, 'results=' + resultsCount);
    await page.screenshot({ path: SHOT + '/04-search.png' });
    const addClick = await page.evaluate(() => { const el = document.querySelector('[data-name^="search-result-"]'); if (el) el.click(); return !!el; });
    await sleep(3000);
    ok('点结果添加→回记录页', addClick && (await page.evaluate(() => location.pathname)) === '/records', 'path=' + (await page.evaluate(() => location.pathname)));
    const recText = await page.evaluate(() => document.body.innerText);
    ok('记录列表含「燕麦」', recText.includes('燕麦'), '');
    // 清理测试记录
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
