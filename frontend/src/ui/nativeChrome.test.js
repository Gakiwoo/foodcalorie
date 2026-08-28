// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'

const frontendRoot = new URL('../../', import.meta.url)

function readFrontendSourceFiles() {
  const pageFiles = readdirSync(frontendRoot)
    .filter((name) => /^FoodCalorie-.*\.jsx$/.test(name))
    .map((name) => readFileSync(new URL(name, frontendRoot), 'utf8'))
  const sharedUi = readFileSync(new URL('src/ui/common.jsx', frontendRoot), 'utf8')
  return [...pageFiles, sharedUi].join('\n')
}

describe('native chrome and packaged icons', () => {
  it('renders web status bar from the shared StatusBar component only', () => {
    const source = readFrontendSourceFiles()

    // 设计稿要求 Web 端在 StatusBar 组件内渲染伪状态栏（9:41 + signal/wifi/battery），
    // 页面组件本身不应硬编码这些原型元素。
    expect(source).toContain('<StatusBar')
    expect(source).toContain('9:41')
    expect(source).toContain('fa-signal')
    expect(source).toContain('fa-wifi')
    expect(source).toContain('fa-battery')
  })

  it('does not reference unbundled design-export assets', () => {
    expect(readFrontendSourceFiles()).not.toContain('./asset/')
  })
})
