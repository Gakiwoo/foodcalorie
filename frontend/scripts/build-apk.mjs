import { build } from 'vite'
import { verifyApkAssets } from './verify-apk-assets.mjs'

const DEFAULT_API_ORIGIN = 'https://foodcalorie.gakiwoo.com'

process.env.VITE_API_ORIGIN ||= DEFAULT_API_ORIGIN

const apiOrigin = new URL(process.env.VITE_API_ORIGIN)
if (apiOrigin.protocol !== 'https:' || apiOrigin.pathname !== '/') {
  throw new Error('Android production builds require a path-free HTTPS VITE_API_ORIGIN')
}

// 说明：输出目录清理由调用方完成（bash: rm -rf dist-apk）。
// 本机环境将 vite emptyOutDir 与 fs.rmSync 都替换为 safe-delete shim，对 dist-apk 会 fail-closed，
// 因此这里 emptyOutDir 关闭且不做删除；调用方先删目录即可（目录不存在时 vite 直接创建）。
await build({
  mode: 'apk',
  build: {
    outDir: 'dist-apk',
    emptyOutDir: false,
  },
})

await verifyApkAssets()
console.log(`[android] Embedded API origin: ${apiOrigin.origin}`)
