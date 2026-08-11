const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);
  // 浏览器内拉取模块源码，看是新的还是旧的
  const src = await page.evaluate(async () => {
    const r = await fetch('/FoodCalorie-Favorites.jsx');
    return (await r.text()).slice(0, 400);
  });
  console.log('浏览器拉取模块前400字符:');
  console.log(src.slice(0, 200));
  console.log('--- 含新组件标记(fav-card-):', src.includes('fav-card-'), '| 含旧HTML壳(dangerouslySetInnerHTML):', src.includes('dangerouslySetInnerHTML'));
  // 再看 App.jsx import
  const appSrc = await page.evaluate(async () => (await fetch('/App.jsx')).text());
  console.log('App.jsx 含 Favorites import:', /import FoodCalorieFavorites from '\.\/FoodCalorie-Favorites\.jsx'/.test(appSrc));
  await browser.close();
})();
