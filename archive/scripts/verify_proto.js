const puppeteer = require('puppeteer-core');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173/';
const SHOT_DIR = 'C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/.verify';

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
      const clicked = await page.click(clickSel, { timeout: 5000 }).then(() => true).catch(() => false);
      await sleep(600);
    }
    const path = await page.evaluate(() => location.pathname);
    const ok = !expectPath || path === expectPath;
    log.push(`${ok ? '✅' : '❌'} ${name} → ${path}${expectPath ? ` (期望 ${expectPath})` : ''}`);
    if (!ok) log.push(`   点击器: ${clickSel || '-'}`);
  }

  try {
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);
    log.push('✅ 首页加载（Tailwind CDN 生效）');

    // 1. 首页 → 拍照识别
    await page.screenshot({ path: `${SHOT_DIR}/01-home.png` });
    await step('首页→拍照识别', '[data-name="camera-card"]', '/camera');
    await page.screenshot({ path: `${SHOT_DIR}/02-camera.png` });

    // 2. 拍照 → 识别结果
    await step('拍照→识别结果', '[data-name="shutter"]', '/camerresult');
    await page.screenshot({ path: `${SHOT_DIR}/03-camerresult.png` });

    // 3. 识别结果 → 记录
    await step('识别结果→记录', '[data-name="btn-confirm"]', '/records');
    await page.screenshot({ path: `${SHOT_DIR}/04-records.png` });

    // 4. 记录 → 今日记录（返回栈测试：先记录页再跳今日）
    await step('记录→今日记录(hero)', '[data-name="group-today"]', null);
    await page.screenshot({ path: `${SHOT_DIR}/04b-records.png` });

    // 5. 记录 → 发现
    await step('记录→发现', '[data-name="nav-discover"]', '/discover');
    await page.screenshot({ path: `${SHOT_DIR}/05-discover.png` });

    // 6. 发现 → 文章详情
    await step('发现→文章详情', '[data-name="article-card"]', '/article');
    await page.screenshot({ path: `${SHOT_DIR}/06-article.png` });

    // 7. 返回
    await step('文章→返回(back)', '[data-name="nav-back"]', '/discover');

    // 8. 发现 → 我的
    await step('发现→我的', '[data-name="nav-me"]', '/me');
    await page.screenshot({ path: `${SHOT_DIR}/07-me.png` });

    // 9. 我的 → 我的收藏
    await step('我的→我的收藏', '[data-name="quick-3"]', '/favorites');
    await page.screenshot({ path: `${SHOT_DIR}/08-favorites.png` });

    // 10. 收藏页返回 → 我的 → 目标设置
    await step('收藏→返回', '[data-name="nav-back"]', '/me');
    await step('我的→目标设置', '[data-name="quick-2"]', '/goal');
    await page.screenshot({ path: `${SHOT_DIR}/09-goal.png` });

    // 11. 目标设置保存 → 我的
    await step('目标设置→保存', '[data-name="save-btn"]', '/me');

    // 12. 我的 → 数据导出
    await step('我的→数据导出', '[data-name="quick-4"]', '/dataexport');
    await page.screenshot({ path: `${SHOT_DIR}/10-dataexport.png` });

    // 13. 记录页搜索 → 搜索结果
    await page.goto(BASE + 'addfood', { waitUntil: 'networkidle2' });
    await sleep(800);
    await step('添加记录→搜索', '[data-name="search-bar"]', '/search');
    await page.screenshot({ path: `${SHOT_DIR}/11-search.png` });

    // 14. 搜索结果 + → 记录
    await step('搜索结果→添加', '[data-name="result-1-add"]', '/records');

    // 15. 设置页 → 通知设置
    await page.goto(BASE + 'settings', { waitUntil: 'networkidle2' });
    await sleep(800);
    await step('设置→通知设置', '[data-name="card-notify"]', '/notification');
    await page.screenshot({ path: `${SHOT_DIR}/12-notification.png` });

    console.log(log.join('\n'));
  } catch (e) {
    console.log(log.join('\n'));
    console.log('❌ 异常:', e.message);
  } finally {
    await browser.close();
  }
})();
