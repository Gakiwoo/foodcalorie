const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 900 });
  const out = [];
  try {
    await page.goto('http://127.0.0.1:5173/records', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000);
    // 检查 donut SVG 是否存在且有渐变描边
    const donut = await page.evaluate(() => {
      const svg = document.querySelector('[data-name="donut"]');
      if (!svg) return { exists: false };
      const grad = svg.querySelector('linearGradient');
      const bars = svg.querySelectorAll('circle');
      return {
        exists: true,
        hasGradient: !!grad,
        gradientStops: grad ? grad.children.length : 0,
        circleCount: bars.length,
        arcDash: bars[1] ? bars[1].getAttribute('stroke-dasharray') : null,
        text: Array.from(svg.querySelectorAll('text')).map((t) => t.textContent.trim())
      };
    });
    out.push('记录页 donut: ' + JSON.stringify(donut));
    await page.screenshot({ path: 'C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/archive/verify-screenshots/verify4/records-ring.png' });

    await page.goto('http://127.0.0.1:5173/today', { waitUntil: 'networkidle2' });
    await sleep(2500);
    const ring = await page.evaluate(() => {
      const svg = document.querySelector('[data-name="ring"]');
      if (!svg) return { exists: false };
      const grad = svg.querySelector('linearGradient');
      const bars = svg.querySelectorAll('circle');
      return {
        exists: true,
        hasGradient: !!grad,
        circleCount: bars.length,
        arcDash: bars[1] ? bars[1].getAttribute('stroke-dasharray') : null,
        text: Array.from(svg.querySelectorAll('text')).map((t) => t.textContent.trim())
      };
    });
    out.push('今日记录页 ring: ' + JSON.stringify(ring));
    await page.screenshot({ path: 'C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/archive/verify-screenshots/verify4/today-ring.png' });

    console.log(out.join('\n'));
  } catch (e) {
    console.log('❌', e.message);
  } finally {
    await browser.close();
  }
})();
