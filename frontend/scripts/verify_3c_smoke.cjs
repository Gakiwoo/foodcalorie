// 批次3c 冒烟：首页/我的页委托收敛后导航验证
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173';
const EMAIL = 't_fc_test@x.com';
const PWD = 'Test123456!';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = [];
const ok = (name, cond, extra) => log.push(`${cond ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`);
const clickText = (page, t) => page.evaluate((txt) => {
  const el = [...document.querySelectorAll('div')].find((d) => d.textContent.includes(txt) && d.style.cursor === 'pointer');
  if (el) { el.click(); return true; } return false;
}, t);

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));

  await page.goto(BASE + '/login', { waitUntil: 'networkidle2', timeout: 40000 });
  await sleep(3000);
  await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
  await page.type('input[placeholder="请输入密码"]', PWD);
  await page.click('button');
  for (let i = 0; i < 16; i++) { if ((await page.evaluate(() => location.pathname)) !== '/login') break; await sleep(500); }
  ok('登录成功', (await page.evaluate(() => location.pathname)) !== '/login');

  // 首页：设置齿轮 → /settings
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  await sleep(1500);
  await page.evaluate(() => { const el = document.querySelector('.fa-gear'); if (el) el.closest('div').click(); });
  await sleep(1000);
  ok('首页设置齿轮→设置页', (await page.evaluate(() => location.pathname)) === '/settings');

  // 首页：拍照识别卡 → /camera（用相机图标定位外层可点卡）
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  await sleep(1200);
  await page.evaluate(() => {
    const ic = document.querySelector('.fa-camera');
    let el = ic;
    while (el && el !== document.body) { if (el.style && el.style.cursor === 'pointer') { el.click(); return; } el = el.parentElement; }
  });
  await sleep(1000);
  ok('首页拍照卡→相机页', (await page.evaluate(() => location.pathname)) === '/camera');

  // 首页：宫格「记录」→ /records（精确文本匹配，避免命中今日卡）
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  await sleep(1200);
  await page.evaluate(() => {
    const sp = [...document.querySelectorAll('span')].find((s) => s.textContent.trim() === '记录');
    let el = sp;
    while (el && el !== document.body) { if (el.style && el.style.cursor === 'pointer') { el.click(); return; } el = el.parentElement; }
  });
  await sleep(1000);
  ok('首页宫格记录→记录页', (await page.evaluate(() => location.pathname)) === '/records');

  // 我的页：快捷「目标设置」→ /goal
  await page.goto(BASE + '/me', { waitUntil: 'networkidle2' });
  await sleep(1500);
  await clickText(page, '目标设置');
  await sleep(1000);
  ok('我的页快捷目标→目标页', (await page.evaluate(() => location.pathname)) === '/goal');

  // 我的页：设置列表「隐私设置」→ /privacy
  await page.goto(BASE + '/me', { waitUntil: 'networkidle2' });
  await sleep(1200);
  await clickText(page, '隐私设置');
  await sleep(1000);
  ok('我的页隐私设置→隐私页', (await page.evaluate(() => location.pathname)) === '/privacy');

  // 我的页：头像箭头 → /profile
  await page.goto(BASE + '/me', { waitUntil: 'networkidle2' });
  await sleep(1200);
  await page.evaluate(() => { const el = document.querySelector('.fa-chevron-right'); const card = el && el.closest('div[style*="flex-shrink: 0"], div[style*="flexShrink"]'); if (card) card.click(); else if (el) el.parentElement.click(); });
  await sleep(1000);
  ok('我的页头像箭头→个人主页', (await page.evaluate(() => location.pathname)) === '/profile');

  // 帮助页：渲染 + FAQ 点击无错
  await page.goto(BASE + '/help', { waitUntil: 'networkidle2' });
  await sleep(1200);
  const helpText = await page.evaluate(() => document.body.innerText);
  ok('帮助页渲染(常见问题/意见反馈/联系客服)', ['常见问题', '意见反馈', '联系客服', '提交反馈'].every((s) => helpText.includes(s)));
  await clickText(page, '如何修改每日卡路里目标？');
  await sleep(500);
  const toastShown = await page.evaluate(() => document.querySelector('.toast') && document.querySelector('.toast').textContent);
  ok('帮助页 FAQ 点击 toast', !!(toastShown && toastShown.includes('常见问题')), toastShown || '无');

  ok('无页面 JS 错误', errors.length === 0, errors[0] || '');
  console.log(log.join('\n'));
  console.log(`\n3C 冒烟: ${log.filter((l) => l.startsWith('✅')).length}/${log.length} 通过`);
  await browser.close();
  if (log.some((l) => l.startsWith('❌'))) process.exit(1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
