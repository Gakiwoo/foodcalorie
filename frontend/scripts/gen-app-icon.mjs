import { access } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import process from 'node:process'
import puppeteer from 'puppeteer-core'

const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = path.join(frontendDir, 'assets', 'brand', 'app-icon-source.svg')
const masterPath = path.join(frontendDir, 'assets', 'brand', 'app-icon-master.png')

const browserCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

async function findBrowser() {
  for (const candidate of browserCandidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // Try the next standard browser location.
    }
  }
  throw new Error('Chrome/Chromium not found. Set CHROME_PATH before generating Android icons.')
}

async function renderMaster() {
  const browser = await puppeteer.launch({
    executablePath: await findBrowser(),
    headless: true,
    args: ['--allow-file-access-from-files', '--force-device-scale-factor=1'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1 })
    await page.goto(new URL(`file:///${sourcePath.replaceAll('\\', '/')}`).href, { waitUntil: 'load' })
    await page.screenshot({ path: masterPath, type: 'png', omitBackground: false })
  } finally {
    await browser.close()
  }
}

await renderMaster()

const python = process.platform === 'win32' ? 'python' : 'python3'
const result = spawnSync(python, [path.join(frontendDir, 'scripts', 'gen-icons.py')], {
  cwd: frontendDir,
  encoding: 'utf8',
  stdio: 'inherit',
})

if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)

console.log(`[android-assets] Brand source: ${sourcePath}`)
