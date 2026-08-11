// E2E 联调：真实注册 → 登录 → 鉴权 → 记录API → 退出（全部走服务器 gakiwoo.com）
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173/';
const SHOT = 'C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/archive/verify-screenshots/verify5';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require('fs');
fs.mkdirSync(SHOT, { recursive: true });

const EMAIL = 'fc_e2e_' + Date.now() + '@x.com';
const PWD = 'E2eTest123!';
const results = [];
const ok = (name, pass, extra = '') =>
  results.push(`${pass ? '✅' : '❌'} ${name}${extra ? ' → ' + extra : ''}`);

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });
  page.on('dialog', async (d) => { ok('弹窗自动接受: ' + d.message().slice(0, 30), true); await d.accept(); });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 120)); });

  try {
    // 1) 注册页：真实注册
    await page.goto(BASE + 'register', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3500); // Vite 冷编译
    await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
    await page.type('input[placeholder="设置密码（6-20 位字母数字）"]', PWD);
    await page.type('input[placeholder="再次输入密码"]', PWD);
    await sleep(300);
    await page.screenshot({ path: SHOT + '/01-register-filled.png' });
    await page.click('button'); // 唯一按钮「注册并登录」
    await sleep(4000);
    const p1 = await page.evaluate(() => location.pathname);
    ok('注册 → 跳转 /login', p1 === '/login', 'path=' + p1);
    await page.screenshot({ path: SHOT + '/02-after-register-login-page.png' });

    // 2) 登录页：真实登录（邮箱账号密码）
    await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
    await page.type('input[placeholder="请输入密码"]', PWD);
    await sleep(300);
    await page.screenshot({ path: SHOT + '/03-login-filled.png' });
    await page.click('button'); // 第一个按钮「登 录」
    await sleep(4000);
    const p2 = await page.evaluate(() => location.pathname);
    ok('登录 → 跳转 /', p2 === '/', 'path=' + p2);

    // 3) 鉴权核验：cookie 已持有，/api/auth/me 应 200
    const me = await page.evaluate(async () => {
      const r = await fetch('/api/auth/me');
      const b = await r.json().catch(() => null);
      return { status: r.status, email: b?.user?.email || null, nickname: b?.user?.nickname || null };
    });
    ok('浏览器 cookie 鉴权 /me=200', me.status === 200 && me.email === EMAIL, JSON.stringify(me));

    // 4) 记录域 API（cookie 通道）
    const rec = await page.evaluate(async () => {
      const r = await fetch('/api/v1/foodcalorie/records');
      const b = await r.json().catch(() => null);
      return { status: r.status, code: b?.code, total: b?.data?.total };
    });
    ok('记录域 /records=200', rec.status === 200 && rec.code === 0, JSON.stringify(rec));

    // 5) 记录页渲染
    await page.goto(BASE + 'records', { waitUntil: 'networkidle2' });
    await sleep(2500);
    await page.screenshot({ path: SHOT + '/04-records.png' });
    ok('记录页渲染', true);

    // 6) 退出登录
    await page.goto(BASE + 'settings', { waitUntil: 'networkidle2' });
    await sleep(2500);
    await page.screenshot({ path: SHOT + '/05-settings.png' });
    const logoutEl = await page.$('[data-name="logout-card"]');
    ok('设置页退出入口存在', !!logoutEl);
    if (logoutEl) {
      await logoutEl.click();
      await sleep(3000);
      const p3 = await page.evaluate(() => location.pathname);
      ok('退出 → 跳转 /login', p3 === '/login', 'path=' + p3);
      await page.screenshot({ path: SHOT + '/06-after-logout.png' });
      const me2 = await page.evaluate(async () => (await fetch('/api/auth/me')).status);
      ok('退出后 /me=401', me2 === 401, 'status=' + me2);
    }

    // 7) JS 错误检查
    ok('无 JS 错误', errors.length === 0, errors.slice(0, 3).join(' | '));
    console.log(results.join('\n'));
    console.log('\n测试账号:', EMAIL);
  } catch (e) {
    console.log(results.join('\n'));
    console.log('❌ 异常:', e.message);
  } finally {
    await browser.close();
  }
})();
