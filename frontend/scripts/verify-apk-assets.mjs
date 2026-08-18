import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const DIST_DIR = new URL('../dist-apk/', import.meta.url)

export async function verifyApkAssets() {
  const entries = await readdir(DIST_DIR, { recursive: true, withFileTypes: true })
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.parentPath
    ? resolve(entry.parentPath, entry.name)
    : resolve(new URL(entry.name, DIST_DIR).pathname))
  const textFiles = files.filter((file) => /\.(?:css|html|js|json)$/.test(file))
  const contents = await Promise.all(textFiles.map((file) => readFile(file, 'utf8')))
  const bundleText = contents.join('\n')

  const requiredChecks = [
    [files.some((file) => /fa-solid-900-.*\.woff2$/.test(file)), 'Font Awesome solid font'],
    [bundleText.includes('https://foodcalorie.gakiwoo.com'), 'production API origin'],
    [bundleText.includes('viewport-fit=cover'), 'safe-area viewport metadata']
  ]
  for (const [passed, label] of requiredChecks) {
    if (!passed) throw new Error(`APK asset verification failed: missing ${label}`)
  }

  // './asset/' 为设计稿导出资源（未打包进 dist），必须禁止；
  // '9:41' 自 2026-08-18 起为设计稿要求的 Web 伪状态栏文案（StatusBar 组件渲染），不再禁止。
  for (const forbidden of ['./asset/']) {
    if (bundleText.includes(forbidden)) {
      throw new Error(`APK asset verification failed: forbidden prototype artifact ${forbidden}`)
    }
  }

  console.log(`[android] Verified ${files.length} packaged web assets`)
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await verifyApkAssets()
}
