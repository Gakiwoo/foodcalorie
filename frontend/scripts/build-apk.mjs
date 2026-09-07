import { build } from 'vite'
import { rmSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyApkAssets } from './verify-apk-assets.mjs'

const DEFAULT_API_ORIGIN = 'https://foodcalorie.gakiwoo.com'

process.env.VITE_API_ORIGIN ||= DEFAULT_API_ORIGIN

const apiOrigin = new URL(process.env.VITE_API_ORIGIN)
if (apiOrigin.protocol !== 'https:' || apiOrigin.pathname !== '/') {
  throw new Error('Android production builds require a path-free HTTPS VITE_API_ORIGIN')
}

// 每次从空目录构建，避免旧 hash 资源再次被 Capacitor 打包。
// 删除前同时校验绝对路径、相对边界和目录名，防止路径配置错误扩大影响范围。
const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(frontendRoot, 'dist-apk')
const relativeOutDir = relative(frontendRoot, outDir)
if (relativeOutDir !== 'dist-apk' || dirname(outDir) !== frontendRoot) {
  throw new Error(`Refusing to clean unexpected APK output directory: ${outDir}`)
}
rmSync(outDir, { recursive: true, force: true })

await build({
  mode: 'apk',
  build: {
    outDir,
    emptyOutDir: true,
  },
})

await verifyApkAssets()
console.log(`[android] Embedded API origin: ${apiOrigin.origin}`)
