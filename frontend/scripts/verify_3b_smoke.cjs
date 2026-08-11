// 批次3b 冒烟：Settings/Privacy/About 重构后渲染 + 导航验证
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173';
const EMAIL = 't_fc_test@x.com';
const PWD = 'Test123456!';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = [];
const ok = (name, cond, extra) => log.push(`${cond ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`);

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));

  // 登录
  await page.goto(BASE + '/login', { waitUntil: 'networkidle2', timeout: 40000 });
  await sleep(3000);
  await page.type('input[placeholder="请输入邮箱地址"]', EMAIL);
  await page.type('input[placeholder="请输入密码"]', PWD);
  await page.click('button');
  for (let i = 0; i < 16; i++) { if ((await page.evaluate(() => location.pathname)) !== '/login') break; await sleep(500); }
  ok('登录成功', (await page.evaluate(() => location.pathname)) !== '/login');

  // Settings 页：渲染 + 各设置项导航
  await page.goto(BASE + '/settings', { waitUntil: 'networkidle2' });
  await sleep(1500);
  let text = await page.evaluate(() => document.body.innerText);
  ok('Settings 渲染(目标与偏好/识别设置/通用)', text.includes('目标与偏好') && text.includes('识别设置') && text.includes('通用'));
  ok('Settings 渲染(账户卡/退出)', text.includes('健康生活家') && text.includes('退出登录'));
  ok('Settings 行数(每日目标热量/饮食偏好/单位设置/拍照识别精度/隐私设置/帮助反馈/关于食刻)', ['每日目标热量', '饮食偏好', '单位设置', '拍照识别精度', '隐私设置', '帮助反馈', '关于食刻'].every((s) => text.includes(s)));

  // 点击「每日目标热量」→ /goal
  await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find((d) => d.textContent.includes('每日目标热量') && d.style.cursor === 'pointer'); if (el) el.click(); });
  await sleep(1200);
  ok('设置项→目标页', (await page.evaluate(() => location.pathname)) === '/goal', (await page.evaluate(() => location.pathname)));

  // 返回 Settings → 点击「关于食刻」→ /about
  await page.goto(BASE + '/settings', { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find((d) => d.textContent.includes('关于食刻') && d.style.cursor === 'pointer'); if (el) el.click(); });
  await sleep(1200);
  ok('设置项→关于页', (await page.evaluate(() => location.pathname)) === '/about');

  // About 渲染：核心功能/版本/ICP
  text = await page.evaluate(() => document.body.innerText);
  ok('About 渲染(食刻/Version/核心功能/ICP)', text.includes('食刻') && text.includes('Version 1.0.0') && text.includes('核心功能') && text.includes('粤ICP备2025362354号'));

  // About 返回 → Privacy
  await page.goto(BASE + '/privacy', { waitUntil: 'networkidle2' });
  await sleep(1000);
  text = await page.evaluate(() => document.body.innerText);
  ok('Privacy 渲染(数据分析授权/修改密码/注销账号/更新日期)', ['数据分析授权', '个性化推荐', '数据脱敏共享', '修改密码', '注销账号', '2026 年 7 月 1 日'].every((s) => text.includes(s)));

  // Privacy 开关交互（统计页面中"开"状态开关容器数量变化）
  const countOn = () => page.evaluate(() => document.querySelectorAll('div[style*="flex-end"], div[style*="justify-content: flex-end"]').length);
  const before = await countOn();
  await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find((d) => d.textContent.includes('数据分析授权') && d.style.cursor === 'pointer'); if (el) el.click(); });
  await sleep(400);
  const after = await countOn();
  ok('Privacy 开关可切换', before !== after, `on:${before}→${after}`);

  ok('无页面 JS 错误', errors.length === 0, errors[0] || '');
  console.log(log.join('\n'));
  console.log(`\n3B 冒烟: ${log.filter((l) => l.startsWith('✅')).length}/${log.length} 通过`);
  await browser.close();
  if (log.some((l) => l.startsWith('❌'))) process.exit(1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
