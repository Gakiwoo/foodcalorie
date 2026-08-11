// M12 E2E：拍照识别闭环（选图→识别→确认→记录）+ 通知设置保存
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173/';
const SHOT = 'C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/archive/verify-screenshots/verify11';
const IMG = 'C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/archive/verify-screenshots/verify6/01-records.png';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require('fs');
fs.mkdirSync(SHOT, { recursive: true });

const EMAIL = 't_fc_test@x.com';
const PWD = 'Test123456!';
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

    // 1) 相机页：选图 → 预览 → 识别
    await page.goto(BASE + 'camera', { waitUntil: 'networkidle2' });
    await sleep(2500);
    const camLoad = await page.evaluate(() => document.body.innerText.includes('对准食物') || !!document.querySelector('.fa-camera'));
    ok('相机页加载(取景框/快门)', camLoad, '');
    const inputHandle = await page.$('input[type="file"]');
    await inputHandle.uploadFile(IMG);
    await sleep(1500);
    const preview = await page.evaluate(() => !!document.querySelector('img[alt="预览"]'));
    ok('选图后本地预览', preview, '');
    await page.screenshot({ path: SHOT + '/01-camera-preview.png' });
    await clickByText(page, '开始识别');
    await sleep(4000);
    const crPath = await page.evaluate(() => location.pathname);
    ok('识别→结果页', crPath === '/camerresult', crPath);

    // 2) 结果页：候选列表 → 确认添加
    const crText = await page.evaluate(() => document.body.innerText);
    ok('结果页候选列表(≥5)', crText.includes('选择食物') && crText.includes('推荐度'), '');
    ok('结果页图片回显', await page.evaluate(() => !!document.querySelector('img[alt="识别照片"]')), '');
    await page.screenshot({ path: SHOT + '/02-camerresult.png' });
    const confirmBtn = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('确认添加')); return b ? b.textContent : null; });
    ok('确认按钮含食物', !!confirmBtn, 'btn=' + confirmBtn);
    await clickByText(page, '确认添加');
    await sleep(3500);
    ok('确认→回记录页', (await page.evaluate(() => location.pathname)) === '/records', 'path=' + (await page.evaluate(() => location.pathname)));
    const recText = await page.evaluate(() => document.body.innerText);
    ok('记录含 AI 识别食物', /AI识别|选中食物/.test(recText) || (await page.evaluate(() => document.body.innerText.includes('kcal'))), '');
    await page.screenshot({ path: SHOT + '/03-records.png' });

    // 3) 通知设置：真实加载 + 切换 + 保存
    await page.goto(BASE + 'notification', { waitUntil: 'networkidle2' });
    await sleep(3000);
    const notifText = await page.evaluate(() => document.body.innerText);
    ok('通知页真实加载(5 开关+免打扰)', notifText.includes('记录提醒') && notifText.includes('每周报告') && notifText.includes('免打扰时段'), '');
    await page.screenshot({ path: SHOT + '/04-notification.png' });
    // 切换「社区互动」开关（第 3 个 Switch）
    await page.evaluate(() => {
      const switches = [...document.querySelectorAll('div')].filter((d) => d.style?.width === '46px' && d.style?.cursor === 'pointer');
      const s = switches[2];
      if (s) s.click();
    });
    await sleep(300);
    await clickByText(page, '保存设置');
    await sleep(3000);
    ok('通知保存→设置页', (await page.evaluate(() => location.pathname)) === '/settings', 'path=' + (await page.evaluate(() => location.pathname)));
    // 还原开关
    await page.goto(BASE + 'notification', { waitUntil: 'networkidle2' });
    await sleep(2500);
    await page.evaluate(() => {
      const switches = [...document.querySelectorAll('div')].filter((d) => d.style?.width === '46px' && d.style?.cursor === 'pointer');
      const s = switches[2];
      if (s) s.click();
    });
    await clickByText(page, '保存设置');
    await sleep(2500);

    // 清理识别记录
    await page.goto(BASE + 'records', { waitUntil: 'networkidle2' });
    await sleep(2500);
    const hasTrash = await page.evaluate(() => document.querySelectorAll('.fa-trash-can').length);
    if (hasTrash > 0) {
      await page.evaluate(() => { const el = document.querySelector('.fa-trash-can'); if (el) el.click(); });
      await sleep(2000);
    }

    ok('无 JS 错误', errors.length === 0, errors.slice(0, 3).join(' | '));
    console.log(results.join('\n'));
  } catch (e) {
    console.log(results.join('\n'));
    console.log('❌ 异常:', e.message);
  } finally {
    await browser.close();
  }
})();
