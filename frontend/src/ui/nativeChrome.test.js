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
  it('delegates the status bar to the operating system', () => {
    const source = readFrontendSourceFiles()

    expect(source).toContain('<StatusBar')
    expect(source).not.toContain('data-name="status-time"')
    expect(source).not.toContain('fa-signal')
    expect(source).not.toContain('fa-wifi')
    expect(source).not.toContain('fa-battery')
  })

  it('does not reference unbundled design-export assets', () => {
    expect(readFrontendSourceFiles()).not.toContain('./asset/')
  })
})
