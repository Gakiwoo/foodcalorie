import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const configPath = new URL('../../capacitor.config.json', import.meta.url)
const androidBuildPath = new URL('../../android/app/build.gradle', import.meta.url)
const androidStringsPath = new URL('../../android/app/src/main/res/values/strings.xml', import.meta.url)
const androidStylesPath = new URL('../../android/app/src/main/res/values/styles.xml', import.meta.url)
const indexPath = new URL('../../index.html', import.meta.url)

describe('Capacitor native networking', () => {
  it('routes native fetch through CapacitorHttp so httpOnly auth cookies persist', () => {
    const config = JSON.parse(readFileSync(configPath, 'utf8'))

    expect(config.plugins?.CapacitorHttp?.enabled).toBe(true)
    expect(config.plugins?.StatusBar).toEqual({
      overlaysWebView: false,
      style: 'LIGHT',
      backgroundColor: '#F7F8FA',
    })
    expect(config.server).toEqual({ hostname: 'localhost', androidScheme: 'https' })
    expect(config.appName).toBe('食刻')
  })

  it('uses release-ready Android identity and a monotonic application version', () => {
    const build = readFileSync(androidBuildPath, 'utf8')
    const strings = readFileSync(androidStringsPath, 'utf8')

    expect(build).toMatch(/applicationId "com\.shike\.app"/)
    expect(build).toMatch(/versionCode 3/)
    expect(build).toMatch(/versionName "1\.0\.2"/)
    expect(strings).toContain('<string name="app_name">食刻</string>')
    expect(strings).toContain('<string name="title_activity_main">食刻</string>')
  })

  it('uses the real Android system bar with safe-area fallback', () => {
    const styles = readFileSync(androidStylesPath, 'utf8')
    const index = readFileSync(indexPath, 'utf8')

    expect(styles).toContain('android:windowOptOutEdgeToEdgeEnforcement')
    expect(styles).toContain('android:windowLightStatusBar')
    expect(index).toContain('viewport-fit=cover')
  })
})
