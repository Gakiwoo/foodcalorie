// 发布版本号同步：一次命令同步 Web 与 Android 两侧版本号，杜绝人工漏改
// 用法：node scripts/release-bump.mjs 1.0.5
//  - frontend/src/version.js   → APP_VERSION / APP_BUILD（今天日期）
//  - android/app/build.gradle  → versionName / versionCode（自动 +1）
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const version = process.argv[2]
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('用法: node scripts/release-bump.mjs <x.y.z>（如 1.0.5）')
  process.exit(1)
}

const buildDate = new Date().toISOString().slice(0, 10).replace(/-/g, '')

// 1) frontend/src/version.js
const vf = join(root, 'frontend', 'src', 'version.js')
let v = readFileSync(vf, 'utf8')
v = v.replace(/APP_VERSION = '[^']+'/, `APP_VERSION = '${version}'`)
v = v.replace(/APP_BUILD = '[^']+'/, `APP_BUILD = '${buildDate}'`)
writeFileSync(vf, v)

// 2) android/app/build.gradle
const gf = join(root, 'frontend', 'android', 'app', 'build.gradle')
let g = readFileSync(gf, 'utf8')
const prevCode = Number(g.match(/versionCode (\d+)/)?.[1] || 0)
if (!prevCode) {
  console.error('build.gradle 未找到 versionCode，中止')
  process.exit(1)
}
g = g.replace(/versionCode \d+/, `versionCode ${prevCode + 1}`)
g = g.replace(/versionName "[^"]+"/, `versionName "${version}"`)
writeFileSync(gf, g)

console.log(`[bump] OK: version=${version} versionCode=${prevCode} -> ${prevCode + 1} build=${buildDate}`)
console.log(`[bump] 已更新：frontend/src/version.js、frontend/android/app/build.gradle`)
