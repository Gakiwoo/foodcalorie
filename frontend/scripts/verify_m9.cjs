// M9 E2E：详情 → 编辑 → 删除 → 周视图 → 月历 → 导出（真实数据）
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173/';
const SHOT = 'C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/archive/verify-screenshots/verify8';
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
    await sleep(3500);
    await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
    await page.type('input[placeholder="请输入密码"]', PWD);
    await page.click('button');
    await sleep(4000);
    ok('登录', (await page.evaluate(() => location.pathname)) === '/');

    // 1) 添加一条记录（供详情/编辑/删除测试）
    await page.goto(BASE + 'addfood', { waitUntil: 'networkidle2' });
    await sleep(2500);
    await page.type('input[placeholder="搜索食物（如：鸡胸肉、米饭）"]', '牛油果');
    await sleep(1500);
    const addClicked = await page.evaluate(() => { const el = document.querySelector('[data-name^="food-result-"]'); if (el) el.click(); return !!el; });
    ok('添加测试记录', addClicked, '');
    await sleep(3500);
    ok('回到记录页', (await page.evaluate(() => location.pathname)) === '/records', 'path=' + (await page.evaluate(() => location.pathname)));
    const hasItem = await page.evaluate(() => document.body.innerText.includes('牛油果'));
    ok('记录列表含新条目', hasItem, '');
    await page.screenshot({ path: SHOT + '/01-records.png' });

    // 2) 点击记录卡 → 详情
    const clickedCard = await page.evaluate(() => { const el = document.querySelector('[data-name^="food-card-"]'); if (el) el.click(); return !!el; });
    await sleep(3000);
    const detailPath = await page.evaluate(() => location.pathname + location.search);
    ok('记录卡→详情(带 id)', clickedCard && /\/detail\?id=\d+/.test(detailPath), detailPath);
    const detailText = await page.evaluate(() => document.body.innerText);
    ok('详情显示食物名', detailText.includes('牛油果'), '');
    ok('详情显示营养与来源', detailText.includes('蛋白质') && (detailText.includes('食物库搜索') || detailText.includes('搜索')), '');
    await page.screenshot({ path: SHOT + '/02-detail.png' });

    // 3) 编辑 → 改热量 → 保存 → 回详情
    const editGo = await page.evaluate(() => { const el = [...document.querySelectorAll('span,button')].find((x) => x.textContent.includes('编辑')); if (el) el.click(); return !!el; });
    await sleep(3000);
    ok('详情→编辑页', editGo && (await page.evaluate(() => location.pathname)) === '/editrecord', 'path=' + (await page.evaluate(() => location.pathname)));
    // 改热量字段（第 3 个 number input：名称/餐次/热量）
    await page.evaluate(() => {
      const inputs = [...document.querySelectorAll('input')];
      const cal = inputs.find((i) => i.placeholder === '如 520');
      if (cal) cal.value = '';
    });
    await page.type('input[placeholder="如 520"]', '333');
    await page.screenshot({ path: SHOT + '/03-editrecord.png' });
    await clickByText(page, '保存修改');
    await sleep(3000);
    const afterEdit = await page.evaluate(() => ({ path: location.pathname + location.search, text: document.body.innerText }));
    ok('保存→回详情', /\/detail\?id=\d+/.test(afterEdit.path), afterEdit.path);
    ok('热量已更新为 333', afterEdit.text.includes('333'), '');

    // 4) 删除 → 确认 → 回记录页
    const delClicked = await page.evaluate(() => { const el = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('删除记录')); if (el) el.click(); return !!el; });
    await sleep(1000);
    ok('删除按钮→确认弹窗', delClicked && (await page.evaluate(() => !!document.querySelector('.modal-card') || document.body.innerText.includes('删除这条记录'))), '');
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '删除'); if (b) b.click(); });
    await sleep(3000);
    const delResult = await page.evaluate(() => location.pathname);
    ok('确认删除→记录页', delResult === '/records', delResult);
    const noItem = await page.evaluate(() => !document.body.innerText.includes('牛油果'));
    ok('列表已无该记录', noItem, '');

    // 5) 周视图
    await page.goto(BASE + 'records-week', { waitUntil: 'networkidle2' });
    await sleep(3000);
    const weekText = await page.evaluate(() => document.body.innerText);
    ok('周视图加载(周总/日均)', weekText.includes('周总摄入') && weekText.includes('日均摄入') && weekText.includes('本周记录'), '');
    ok('周视图含每日行(周一)', weekText.includes('周一'), '');
    await page.screenshot({ path: SHOT + '/04-records-week.png' });

    // 6) 月历
    await page.goto(BASE + 'records-month', { waitUntil: 'networkidle2' });
    await sleep(3000);
    const monthText = await page.evaluate(() => document.body.innerText);
    const year = new Date().getFullYear();
    ok('月历加载(年月+汇总)', monthText.includes(year + '年') && monthText.includes('月总摄入'), '');
    ok('月历含星期表头', monthText.includes('一') && monthText.includes('日'), '');
    await page.screenshot({ path: SHOT + '/05-records-month.png' });

    // 7) 导出 JSON（页面内 fetch 验证接口）
    const exp = await page.evaluate(async () => {
      const r = await fetch('/api/v1/foodcalorie/export?format=json&range=all', { method: 'POST' });
      const b = await r.json();
      return { status: r.status, code: b.code, count: b.data?.count };
    });
    ok('导出 JSON 接口', exp.status === 200 && exp.code === 0 && exp.count >= 0, 'count=' + exp.count);
    const csv = await page.evaluate(async () => {
      const r = await fetch('/api/v1/foodcalorie/export?format=csv&range=all', { method: 'POST' });
      const buf = await r.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const text = await new Response(buf).text();
      return { status: r.status, ct: r.headers.get('content-type') || '', hasHeader: text.includes('food_name'), hasBom: bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf };
    });
    ok('导出 CSV 接口(含表头+BOM)', csv.status === 200 && csv.hasHeader && csv.hasBom, 'ct=' + csv.ct.slice(0, 20));
    // 导出页 UI
    await page.goto(BASE + 'dataexport', { waitUntil: 'networkidle2' });
    await sleep(2500);
    const exportUi = await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find((x) => x.textContent.trim() === 'JSON（程序对接）'); if (el) el.click(); return !!el; });
    await clickByText(page, '导出 JSON');
    await sleep(2500);
    const exportText = await page.evaluate(() => document.body.innerText);
    ok('导出页 JSON 预览', exportText.includes('导出结果'), '');
    await page.screenshot({ path: SHOT + '/06-dataexport.png' });

    ok('无 JS 错误', errors.length === 0, errors.slice(0, 3).join(' | '));
    console.log(results.join('\n'));
  } catch (e) {
    console.log(results.join('\n'));
    console.log('❌ 异常:', e.message);
  } finally {
    await browser.close();
  }
})();
