// 生产验证：月历页（RecordsMonth）无崩溃 + 日均正常显示（回归 1e30efc 遮蔽 bug）
const puppeteer = require('puppeteer-core');
const { EMAIL, PWD } = require('./test-credentials');
// 生产验证脚本：默认打生产；可用 FC_E2E_BASE 覆盖（如本地联调）
const { CHROME, BASE: _base } = require('./e2e-config');
const BASE = process.env.FC_E2E_BASE ? _base : 'https://foodcalorie.gakiwoo.com/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
const ok = (n, p, x = '') => results.push(`${p ? '✅' : '❌'} ${n}${x ? ' → ' + x : ''}`);

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'], protocolTimeout: 120000 });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 150)));

  try {
    // 登录
    await page.goto(BASE + 'login', { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(4000);
    await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
    await page.type('input[placeholder="请输入密码"]', PWD);
    await page.click('button');
    await sleep(4000);

    // 进入月历页（直接从 URL 访问，路由存在）
    await page.goto(BASE + 'records-month', { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(4000);
    const body = await page.evaluate(() => document.body.innerText);
    const hasMonthTitle = body.includes('月历');
    // 校验日均数字渲染成功（不再是 NaN 或崩溃白屏）
    const avgText = body.match(/日均[^\d]*(\d+)/) || body.match(/平均[^\d]*(\d+)/);
    ok('月历页加载无崩溃', hasMonthTitle && body.length > 100, 'title=月历');
    ok('月历日均已渲染', !!avgText, avgText ? 'avg=' + avgText[1] : '(未找到日均文本)');

    // 周视图也验证一次（同轮改动的 RecordsWeek 重试逻辑）
    await page.goto(BASE + 'records-week', { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(4000);
    const weekBody = await page.evaluate(() => document.body.innerText);
    ok('周视图加载', weekBody.includes('本周记录'), '');

    ok('无 JS 错误', errors.length === 0, errors[0] || '');
  } catch (e) {
    ok('执行异常', false, e.message);
  } finally {
    await browser.close();
  }
  console.log(results.join('\n'));
  process.exit(results.some((r) => r.startsWith('❌')) ? 1 : 0);
})();
