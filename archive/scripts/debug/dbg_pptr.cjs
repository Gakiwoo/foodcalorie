const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  console.log('page.setInputFiles:', typeof page.setInputFiles);
  console.log('page.uploadFile:', typeof page.uploadFile);
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => { document.body.innerHTML = '<input type="file">'; });
  const h = await page.$('input[type=file]');
  console.log('handle.uploadFile:', typeof h.uploadFile);
  console.log('handle.setInputFiles:', typeof h.setInputFiles);
  await browser.close();
})();
