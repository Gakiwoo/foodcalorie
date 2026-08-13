import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const configPath = new URL('../../capacitor.config.json', import.meta.url)

describe('Capacitor native networking', () => {
  it('routes native fetch through CapacitorHttp so httpOnly auth cookies persist', () => {
    const config = JSON.parse(readFileSync(configPath, 'utf8'))

    expect(config.plugins?.CapacitorHttp?.enabled).toBe(true)
  })
})
