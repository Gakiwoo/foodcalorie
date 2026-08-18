import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const configPath = new URL('../../capacitor.config.json', import.meta.url)
const androidBuildPath = new URL('../../android/app/build.gradle', import.meta.url)
const androidStringsPath = new URL('../../android/app/src/main/res/values/strings.xml', import.meta.url)
const androidStylesPath = new URL('../../android/app/src/main/res/values/styles.xml', import.meta.url)
const launcherPath = new URL('../../android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml', import.meta.url)
const launcherForegroundPath = new URL('../../android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml', import.meta.url)
const brandSourcePath = new URL('../../assets/brand/app-icon-source.svg', import.meta.url)
const aboutPagePath = new URL('../../FoodCalorie-About.jsx', import.meta.url)
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
    expect(build).toMatch(/versionCode 5/)
    expect(build).toMatch(/versionName "1\.0\.4"/)
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

  it('uses the exact utensils mark from the product design for the launcher icon', () => {
    const launcher = readFileSync(launcherPath, 'utf8')
    const foreground = readFileSync(launcherForegroundPath, 'utf8')
    const brandSource = readFileSync(brandSourcePath, 'utf8')
    const aboutPage = readFileSync(aboutPagePath, 'utf8')

    expect(launcher).toContain('@drawable/ic_launcher_foreground')
    expect(foreground).toContain('M5.0554,1.0127')
    expect(brandSource).toContain('About 页面 logo-circle 和 logo-icon')
    expect(brandSource).toContain('#34C759')
    expect(brandSource).toContain('#22A85A')
    expect(aboutPage).toContain("./assets/brand/design-logo-symbol.svg")
  })
})
