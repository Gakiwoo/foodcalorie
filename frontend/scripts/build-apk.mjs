import { build } from 'vite'
import { verifyApkAssets } from './verify-apk-assets.mjs'

const DEFAULT_API_ORIGIN = 'https://foodcalorie.gakiwoo.com'

process.env.VITE_API_ORIGIN ||= DEFAULT_API_ORIGIN

const apiOrigin = new URL(process.env.VITE_API_ORIGIN)
if (apiOrigin.protocol !== 'https:' || apiOrigin.pathname !== '/') {
  throw new Error('Android production builds require a path-free HTTPS VITE_API_ORIGIN')
}

await build({
  mode: 'apk',
  build: {
    outDir: 'dist-apk',
    emptyOutDir: true,
  },
})

await verifyApkAssets()
console.log(`[android] Embedded API origin: ${apiOrigin.origin}`)
