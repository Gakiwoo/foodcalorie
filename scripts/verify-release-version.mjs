// 校验 Web、Android 与可选 Git tag 的发布身份，供本地和 CI 共用。
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const versionSource = readFileSync(join(root, 'frontend', 'src', 'version.js'), 'utf8')
const gradleSource = readFileSync(join(root, 'frontend', 'android', 'app', 'build.gradle'), 'utf8')

const webVersion = versionSource.match(/APP_VERSION = '([^']+)'/)?.[1]
const androidVersion = gradleSource.match(/versionName "([^"]+)"/)?.[1]
const versionCode = Number(gradleSource.match(/versionCode (\d+)/)?.[1] || 0)
const applicationId = gradleSource.match(/applicationId "([^"]+)"/)?.[1]
const requestedTag = process.argv[2]

const errors = []
if (!/^\d+\.\d+\.\d+$/.test(webVersion || '')) errors.push(`Web 版本无效: ${webVersion}`)
if (androidVersion !== webVersion) errors.push(`Web/Android 版本不一致: ${webVersion} / ${androidVersion}`)
if (!Number.isInteger(versionCode) || versionCode <= 0) errors.push(`versionCode 无效: ${versionCode}`)
if (applicationId !== 'com.shike.app') errors.push(`applicationId 非预期: ${applicationId}`)
if (requestedTag && requestedTag !== `v${webVersion}`) errors.push(`Git tag 与应用版本不一致: ${requestedTag} / v${webVersion}`)

if (errors.length) {
  errors.forEach((error) => console.error(`[release] ${error}`))
  process.exit(1)
}

console.log(`[release] OK applicationId=${applicationId} versionName=${webVersion} versionCode=${versionCode}`)
