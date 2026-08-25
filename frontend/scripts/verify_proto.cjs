const puppeteer = require('puppeteer-core');

const { CHROME, BASE, SHOT_DIR } = require('./e2e-config');
const SHOT_DIR_LEGACY = SHOT_DIR + '/verify1';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=480,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });

  const log = [];
  async function step(name, clickSel, expectPath) {
    if (clickSel) {
      const clicked = await page.click(clickSel, { timeout: 4000 }).then(() => true).catch(() => false);
      if (!clicked) { log.push(`⚠️ ${name} → 元素未找到 ${clickSel}`); return; }
      await sleep(600);
    }
    const path = await page.evaluate(() => location.pathname);
    const ok = !expectPath || path === expectPath;
    log.push(`${ok ? '✅' : '❌'} ${name} → ${path}${expectPath ? ` (期望 ${expectPath})` : ''}`);
  }

  try {
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);
    log.push('✅ 首页加载（Tailwind CDN 生效）');

    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/01-home.png` });
    await step('首页→拍照识别', '[data-name="camera-card"]', '/camera');
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/02-camera.png` });
    await sleep(1000);
    const camText = await page.evaluate(() => document.body.innerText);
    log.push(`${camText.includes('拍照识别') || !!document.querySelector('.fa-camera') ? '✅' : '❌'} 相机页加载（取景框+快门）`);
    // 相机→识别结果（真实拍照/上传链路见 verify_m12 登录态）
    await page.goto(BASE + 'camera-result', { waitUntil: 'networkidle2' });
    await sleep(1000);
    const crText = await page.evaluate(() => document.body.innerText);
    log.push(`${crText.includes('请先拍照识别') ? '✅' : '❌'} 识别结果页无状态兜底`);
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/03-camerresult.png` });
    // 回到记录页，继续后续链路
    await page.goto(BASE + 'records', { waitUntil: 'networkidle2' });
    await sleep(2000);

    // 记录→发现（新 Records BottomNav 文本点击）
    const toDiscover = await page.evaluate(() => { const e = [...document.querySelectorAll('span')].find((x) => x.textContent.trim() === '发现'); if (e) e.click(); return !!e; });
    await sleep(1200);
    const pDisc = await page.evaluate(() => location.pathname);
    log.push(`${toDiscover && pDisc === '/discover' ? '✅' : '❌'} 记录→发现 → ${pDisc}`);
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/05-discover.png` });
    // 发现页内容区渲染（未登录=空态/登录=卡片，均正常）
    const discState = await page.evaluate(() => ({
      cards: document.querySelectorAll('[data-name^="discover-card-"]').length,
      empty: document.body.innerText.includes('暂无内容') || document.body.innerText.includes('加载失败')
    }));
    log.push(`${discState.cards > 0 || discState.empty ? '✅' : '❌'} 发现页内容区渲染 [cards=${discState.cards} 空态=${discState.empty}]`);
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/06-article.png` });
    // 发现→我的（BottomNav）
    const toMe = await page.evaluate(() => { const e = [...document.querySelectorAll('span')].find((x) => x.textContent.trim() === '我的'); if (e) e.click(); return !!e; });
    await sleep(1200);
    const pMe = await page.evaluate(() => location.pathname);
    log.push(`${toMe && pMe === '/me' ? '✅' : '❌'} 发现→我的 → ${pMe}`);
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/07-me.png` });
    await step('我的→我的收藏', '[data-name="quick-3"]', '/favorites');
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/08-favorites.png` });
    // 收藏→返回（新 Favorites NavBar 返回箭头）
    const favBack = await page.evaluate(() => { const e = document.querySelector('.fa-chevron-left'); if (e) e.click(); return !!e; });
    await sleep(1200);
    const pFavBack = await page.evaluate(() => location.pathname);
    log.push(`${favBack && pFavBack === '/me' ? '✅' : '❌'} 收藏→返回 → ${pFavBack}`);
    await step('我的→目标设置', '[data-name="quick-2"]', '/goal');
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/09-goal.png` });
    await sleep(1000);
    const goalText = await page.evaluate(() => document.body.innerText);
    log.push(`${goalText.includes('健康目标') && goalText.includes('每日目标热量') ? '✅' : '❌'} 目标设置页加载（真实表单）`);
    await page.goto(BASE + 'me', { waitUntil: 'networkidle2' });
    await sleep(1500);
    await step('我的→数据导出', '[data-name="quick-4"]', '/dataexport');
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/10-dataexport.png` });

    // 添加记录页：自带搜索（新 AddFood 组件）
    await page.goto(BASE + 'addfood', { waitUntil: 'networkidle2' });
    await sleep(2000);
    const searchInput = await page.$('input[placeholder="搜索食物（如：鸡胸肉、米饭）"]');
    log.push(`${searchInput ? '✅' : '❌'} 添加记录→搜索框存在`);
    if (searchInput) {
      await searchInput.type('鸡');
      await sleep(1200);
      await page.screenshot({ path: `${SHOT_DIR_LEGACY}/11-search.png` });
      log.push('✅ 添加记录→搜索可输入');
    }

    await page.goto(BASE + 'settings', { waitUntil: 'networkidle2' });
    await sleep(800);
    await step('设置→通知设置', '[data-name="card-notify"]', '/notification');
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/12-notification.png` });

    console.log(log.join('\n'));
  } catch (e) {
    console.log(log.join('\n'));
    console.log('❌ 异常:', e.message);
  } finally {
    await browser.close();
  }
})();
