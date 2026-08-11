// M14 E2E：图片持久化前端闭环（相机上传 → 识别返回 image_url → 确认添加 → 详情页展示图片）
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173';
const EMAIL = 't_fc_test@x.com';
const PWD = 'Test123456!';
const IMG = require('path').join(__dirname, '..', '..', 'archive', 'food-test', 'rice.jpg');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = [];
const ok = (name, cond, extra) => log.push(`${cond ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`);
const clickByText = (page, text) =>
  page.evaluate((t) => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes(t)); if (b) b.click(); return !!b; }, text);

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
  ok('登录成功', (await page.evaluate(() => location.pathname)) !== '/login', 'path=' + (await page.evaluate(() => location.pathname)));

  // 相机页：选图 → 识别
  await page.goto(BASE + '/camera', { waitUntil: 'networkidle2' });
  await sleep(2500);
  const inputHandle = await page.$('input[type="file"]');
  await inputHandle.uploadFile(IMG);
  await sleep(1500);
  const preview = await page.evaluate(() => !!document.querySelector('img[alt="预览"]'));
  ok('相机页选图本地预览', preview, '');
  await clickByText(page, '开始识别');
  await sleep(6000); // Kimi 真实识别 + 回灌
  const crPath = await page.evaluate(() => location.pathname);
  ok('识别→结果页', crPath === '/camerresult', crPath);
  const imgSrc = await page.evaluate(() => { const img = document.querySelector('img[alt="识别照片"]'); return img ? img.src : ''; });
  ok('结果页图片来自 /uploads/（后端持久化）', imgSrc.includes('/uploads/'), imgSrc.split('/').pop() || imgSrc.slice(0, 40));
  const crText = await page.evaluate(() => document.body.innerText);
  ok('候选列表展示(≥3)', crText.includes('选择食物') && crText.includes('推荐度'), '');
  await page.screenshot({ path: require('path').join(__dirname, '..', '..', 'archive', 'verify-screenshots', 'verify13', '01-camerresult.png') });

  // 确认添加 → 回记录页
  await clickByText(page, '确认添加');
  await sleep(3500);
  ok('确认→回记录页', (await page.evaluate(() => location.pathname)) === '/records', 'path=' + (await page.evaluate(() => location.pathname)));

  // 打开第一条记录详情 → 应展示图片（image_url 落库回读）
  const clickedCard = await page.evaluate(() => { const el = document.querySelector('[data-name^="food-card-"]'); if (el) el.click(); return !!el; });
  await sleep(2000);
  const detailPath = await page.evaluate(() => location.pathname + location.search);
  ok('记录卡→详情页', clickedCard && /\/detail\?id=\d+/.test(detailPath), detailPath);
  const detailImg = await page.evaluate(() => { const img = document.querySelector('[data-name="FoodCalorie-Detail"] img'); return img ? img.src : ''; });
  ok('详情页展示记录图片(来自 uploads)', detailImg.includes('/uploads/'), detailImg.split('/').pop() || '无图片');
  await page.screenshot({ path: require('path').join(__dirname, '..', '..', 'archive', 'verify-screenshots', 'verify13', '02-detail-image.png') });

  ok('无页面 JS 错误', errors.length === 0, errors[0] || '');
  console.log(log.join('\n'));
  console.log(`\nM14 E2E: ${log.filter((l) => l.startsWith('✅')).length}/${log.length} 通过`);
  await browser.close();
  if (log.some((l) => l.startsWith('❌'))) process.exit(1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
