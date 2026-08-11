const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });
  const log = [];
  const tests = [
    ['settings-row-1', '整行', '/notification'],
    ['s-icon-1', '图标容器', '/notification'],
    ['s-label-1', '文字', '/notification'],
    ['s-arrow-1', '箭头', '/notification'],
    ['settings-row-2', '整行', '/privacy'],
    ['settings-row-3', '整行', '/help'],
    ['settings-row-4', '整行', '/about']
  ];
  try {
    await page.goto(BASE + 'me', { waitUntil: 'networkidle2' });
    await sleep(3000);
    for (const [name, text, expect] of tests) {
      await page.goto(BASE + 'me', { waitUntil: 'networkidle2' });
      await sleep(1200);
      // 找到含文本的元素
      const sel = `[data-name="${name}"]`;
      const found = await page.$(sel);
      if (!found) { log.push(`⚠️ ${name} 元素不存在`); continue; }
      await page.click(sel, { timeout: 4000 }).catch(() => {});
      await sleep(700);
      const path = await page.evaluate(() => location.pathname);
      log.push(`${path === expect ? '✅' : '❌'} ${name} (${text}) → ${path} (期望 ${expect})`);
    }
    console.log(log.join('\n'));
  } catch (e) {
    console.log(log.join('\n'));
    console.log('❌', e.message);
  } finally {
    await browser.close();
  }
})();
