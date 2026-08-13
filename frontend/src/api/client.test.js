import { describe, expect, it } from 'vitest'
import {
  NATIVE_API_ORIGIN,
  normalizeApiOrigin,
  redirectToLogin,
  resolveApiUrl,
  selectApiOrigin,
} from './client'

describe('API URL resolution', () => {
  it('keeps same-origin API paths unchanged for the web build', () => {
    expect(resolveApiUrl('/api/v1/foodcalorie/health')).toBe('/api/v1/foodcalorie/health')
  })

  it('joins an APK origin without duplicating the /api prefix', () => {
    expect(resolveApiUrl('/api/v1/foodcalorie/health', 'https://foodcalorie.gakiwoo.com')).toBe(
      'https://foodcalorie.gakiwoo.com/api/v1/foodcalorie/health'
    )
  })

  it('normalizes the legacy origin that incorrectly ended in /api', () => {
    const origin = normalizeApiOrigin('https://foodcalorie.gakiwoo.com/api/')
    expect(origin).toBe('https://foodcalorie.gakiwoo.com')
    expect(resolveApiUrl('/api/auth/login', origin)).toBe(
      'https://foodcalorie.gakiwoo.com/api/auth/login'
    )
  })

  it('rejects origins with arbitrary paths', () => {
    expect(() => normalizeApiOrigin('https://example.com/backend')).toThrow(/纯源站地址/)
  })

  it('uses the production API origin in a native build without a shell environment variable', () => {
    expect(selectApiOrigin('', true)).toBe(NATIVE_API_ORIGIN)
    expect(selectApiOrigin('', false)).toBe('')
  })

  it('redirects native authentication failures through the hash router without reloading', () => {
    const location = { hash: '', assign: () => { throw new Error('must not reload') } }
    redirectToLogin(location, true)
    expect(location.hash).toBe('/login')
  })
})
