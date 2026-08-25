const puppeteer = require('puppeteer-core');

const { CHROME, BASE, SHOT_DIR } = require('./e2e-config');
const SHOT_DIR_LEGACY = SHOT_DIR + '/verify2';

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

  async function step(name, clickSel, expectPath, wait = 600) {
    if (clickSel) {
      const clicked = await page.click(clickSel, { timeout: 4000 }).then(() => true).catch(() => false);
      if (!clicked) { log.push(`⚠️ ${name} → 元素未找到 ${clickSel}`); return; }
      await sleep(wait);
    }
    const path = await page.evaluate(() => location.pathname);
    const ok = !expectPath || path === expectPath;
    log.push(`${ok ? '✅' : '❌'} ${name} → ${path}${expectPath ? ` (期望 ${expectPath})` : ''}`);
  }
  // 按文本点击（适配重写后的真实数据组件）
  async function clickText(name, text, expectPath) {
    const clicked = await page.evaluate((t) => {
      const el = [...document.querySelectorAll('div, span, button')].find((x) => x.textContent.trim() === t);
      if (el) el.click();
      return !!el;
    }, text);
    if (!clicked) { log.push(`⚠️ ${name} → 未找到文本「${text}」`); return; }
    await sleep(1000);
    const path = await page.evaluate(() => location.pathname);
    const ok = !expectPath || path === expectPath;
    log.push(`${ok ? '✅' : '❌'} ${name} → ${path}${expectPath ? ` (期望 ${expectPath})` : ''}`);
  }
  async function assertText(name, text) {
    const found = await page.evaluate((t) => document.body.innerText.includes(t), text);
    log.push(`${found ? '✅' : '❌'} ${name}（含「${text}」）`);
  }

  try {
    // 1. 记录 → 周视图（新组件 Seg 文本点击）
    await page.goto(BASE + 'records', { waitUntil: 'networkidle2' });
    await sleep(2500);
    await clickText('记录→周视图', '周', '/records-week');
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/01-records-week.png` });
    await assertText('周视图页面加载', '本周记录');

    // 2. 记录 → 月视图
    await page.goto(BASE + 'records', { waitUntil: 'networkidle2' });
    await sleep(2000);
    await clickText('记录→月视图', '月', '/records-month');
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/02-records-month.png` });

    // 3. 详情/编辑（无 id 兜底态；真实详情/编辑/删除链路见 verify_m9 登录态）
    await page.goto(BASE + 'detail', { waitUntil: 'networkidle2' });
    await sleep(2000);
    await assertText('详情页无id兜底', '记录不存在或已删除');
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/03-editrecord.png` });
    await page.goto(BASE + 'editrecord', { waitUntil: 'networkidle2' });
    await sleep(2000);
    await assertText('编辑页无id兜底', '缺少记录参数');

    // 5. 发现 → 挑战活动页（新组件 banner 文本点击）
    await page.goto(BASE + 'discover', { waitUntil: 'networkidle2' });
    await sleep(2500);
    const bannerClicked = await page.evaluate(() => {
      const el = [...document.querySelectorAll('div')].find((x) => x.textContent.includes('夏季轻食挑战') && x.style?.cursor === 'pointer');
      if (el) el.click();
      return !!el;
    });
    if (!bannerClicked) {
      log.push('⚠️ 发现→挑战活动 → 未找到 banner');
    } else {
      await sleep(1000);
      const path = await page.evaluate(() => location.pathname);
      log.push(`${path === '/challenge' ? '✅' : '❌'} 发现→挑战活动 → ${path} (期望 /challenge)`);
    }
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/05-challenge.png` });

    // 6. 发现 → 搜索框存在（数据需登录，交互层断言；数据断言见 verify_m8）
    await page.goto(BASE + 'discover', { waitUntil: 'networkidle2' });
    await sleep(2000);
    const searchBox = await page.$('input[placeholder="搜索食谱、减脂知识…"]');
    if (!searchBox) {
      log.push('⚠️ 发现→搜索框 → 未找到');
    } else {
      await searchBox.type('沙拉');
      await sleep(1000);
      log.push('✅ 发现→搜索框可输入');
      await page.screenshot({ path: `${SHOT_DIR_LEGACY}/06-discover-search.png` });
    }

    // 7. 我的 → 帮助反馈 / 个人信息
    await page.goto(BASE + 'me', { waitUntil: 'networkidle2' });
    await sleep(800);
    await step('我的→帮助反馈', '[data-name="s-icon-3"]', '/help');
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/06-help.png` });
    await page.goto(BASE + 'me', { waitUntil: 'networkidle2' });
    await sleep(800);
    await step('我的→个人信息', '[data-name="profile-arrow"]', '/profile');
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/07-profile.png` });

    // 8. 设置 → 各设置子页
    await page.goto(BASE + 'settings', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await step('设置→饮食偏好', '[data-name="label-diet"]', '/dietpref');
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/08-dietpref.png` });
    await page.goto(BASE + 'settings', { waitUntil: 'networkidle2' });
    await sleep(800);
    await step('设置→单位设置', '[data-name="label-unit"]', '/unit');
    await page.goto(BASE + 'settings', { waitUntil: 'networkidle2' });
    await sleep(800);
    await step('设置→识别精度', '[data-name="label-precision"]', '/precision');
    await page.screenshot({ path: `${SHOT_DIR_LEGACY}/09-precision.png` });
    await page.goto(BASE + 'settings', { waitUntil: 'networkidle2' });
    await sleep(800);
    await step('设置→连拍模式', '[data-name="label-burst"]', '/burst');
    await page.goto(BASE + 'settings', { waitUntil: 'networkidle2' });
    await sleep(800);
    await step('设置→帮助反馈', '[data-name="label-help"]', '/help');

    // 9. 设置 → 我的记录 → 返回设置（需求6）
    await page.goto(BASE + 'settings', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await step('设置→我的记录', '[data-name="card-records"]', '/records');
    const backBtn = await page.evaluate(() => !!document.querySelector('[data-name="records-back-float"]'));
    log.push(`${backBtn ? '✅' : '❌'} 记录页返回浮层出现`);
    await step('记录页→返回设置', '[data-name="records-back-float"]', '/settings');

    console.log(log.join('\n'));
  } catch (e) {
    console.log(log.join('\n'));
    console.log('❌ 异常:', e.message);
  } finally {
    await browser.close();
  }
})();
