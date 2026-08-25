// 登录注册链路回归（适配真实表单组件）：登录↔注册互跳、登录提交、注册提交、退出登录
const puppeteer = require('puppeteer-core');
const { EMAIL, PWD } = require('./test-credentials');
const { CHROME, BASE, SHOT_DIR } = require('./e2e-config');
const SHOT = SHOT_DIR + '/verify3';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require('fs');
fs.mkdirSync(SHOT, { recursive: true });

const log = [];
const ok = (n, p, x = '') => log.push(`${p ? '✅' : '❌'} ${n}${x ? ' → ' + x : ''}`);

// 轮询等待跳转到期望路径（最长 10s，抵御网络时序波动）
async function waitPath(page, expect) {
  for (let i = 0; i < 20; i++) {
    const p = await page.evaluate(() => location.pathname);
    if (p === expect) return p;
    await sleep(500);
  }
  return await page.evaluate(() => location.pathname);
}

(async () => {
  let browser = null;
  try {
    browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'], protocolTimeout: 120000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 430, height: 900 });
    page.on('dialog', async (d) => d.accept());

    // 登录页加载 + 互跳
    await page.goto(BASE + 'login', { waitUntil: 'networkidle2', timeout: 40000 });
    await sleep(3500);
    ok('登录页加载', true);
    await page.screenshot({ path: SHOT + '/01-login.png' });
    const toReg = await page.evaluate(() => { const e = [...document.querySelectorAll('span')].find((x) => x.textContent.trim() === '立即注册'); if (e) e.click(); return !!e; });
    await waitPath(page, '/register');
    ok('登录→注册', toReg && (await page.evaluate(() => location.pathname)) === '/register', 'path=' + (await page.evaluate(() => location.pathname)));
    await page.screenshot({ path: SHOT + '/02-register.png' });
    const toLogin = await page.evaluate(() => { const e = [...document.querySelectorAll('span')].find((x) => x.textContent.trim() === '去登录'); if (e) e.click(); return !!e; });
    await waitPath(page, '/login');
    ok('注册→登录', toLogin && (await page.evaluate(() => location.pathname)) === '/login', 'path=' + (await page.evaluate(() => location.pathname)));

    // 登录提交（真实 API）
    await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
    await page.type('input[placeholder="请输入密码"]', PWD);
    await page.click('button');
    const pLogin = await waitPath(page, '/');
    ok('登录→提交(首页)', pLogin === '/', 'path=' + pLogin);

    // 注册提交（真实 API，新账号）
    await page.goto(BASE + 'register', { waitUntil: 'networkidle2', timeout: 40000 });
    await sleep(4500);
    const rand = 'fc_reg_' + Date.now() + '@x.com';
    await page.type('input[placeholder="请输入邮箱地址"]', rand);
    await page.type('input[placeholder="设置密码（6-20 位字母数字）"]', 'RegTest123!');
    await page.type('input[placeholder="再次输入密码"]', 'RegTest123!');
    await page.click('button');
    const pReg = await waitPath(page, '/login');
    ok('注册→提交(跳登录页)', pReg === '/login', 'path=' + pReg);

    // 退出登录
    await page.goto(BASE + 'settings', { waitUntil: 'networkidle2', timeout: 40000 });
    await sleep(3500);
    const logout = await page.$('[data-name="logout-card"]');
    ok('设置→退出入口存在', !!logout);
    if (logout) {
      await logout.click();
      const pLogout = await waitPath(page, '/login');
      ok('退出→登录页', pLogout === '/login', 'path=' + pLogout);
    }
    await page.screenshot({ path: SHOT + '/03-login.png' });
    console.log(log.join('\n'));
  } catch (e) {
    console.log(log.join('\n'));
    console.log('❌ 异常:', e.message);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
})();
