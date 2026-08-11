const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);
  const info = await page.evaluate(async () => {
    const app = await (await fetch('/App.jsx')).text();
    const fav = await (await fetch('/FoodCalorie-Favorites.jsx')).text();
    return {
      appHasFavImport: app.includes("import FoodCalorieFavorites"),
      appHasFavRoute: app.includes("'/favorites'"),
      favHasFavCard: fav.includes('fav-card-'),
      favHasNewComment: fav.includes('我的收藏页：真实数据')
    };
  });
  console.log(JSON.stringify(info));
  // 真实导航到 favorites，看渲染的 root 内容类型
  await page.goto('http://127.0.0.1:5173/favorites', { waitUntil: 'networkidle2' });
  await sleep(4000);
  const dom = await page.evaluate(() => {
    const root = document.getElementById('root');
    return { rootLen: root?.innerHTML.length || 0, hasFavCard: !!document.querySelector('[data-name^="fav-card-"]'), hasNavSearch: !!document.querySelector('[data-name="nav-search"]') };
  });
  console.log('favorites DOM:', JSON.stringify(dom));
  await browser.close();
})();
