// 前端 API 客户端：统一 baseURL / Bearer 附加 / 401 自动刷新 / 错误码映射
import { Capacitor } from '@capacitor/core'

export const NATIVE_API_ORIGIN = 'https://foodcalorie.gakiwoo.com'
// 认证接口复用 gakiwoo-api：/api/auth/*（vite proxy → :3000）
// 业务接口：/api/v1/foodcalorie/*（vite proxy → :3001）
//
// API 源站解析（支持 APK/独立部署）：
//   VITE_API_ORIGIN 设置时（如 https://foodcalorie.gakiwoo.com）→ 请求拼完整 URL（APK 用）
//   未设置时 → 同源相对路径（Web 生产/开发走 vite proxy / 同域 nginx）

export function normalizeApiOrigin(value = '') {
  const raw = String(value).trim().replace(/\/+$/, '')
  if (!raw) return ''

  const url = new URL(raw)
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('VITE_API_ORIGIN 仅支持 http/https 地址')
  }

  // 兼容旧版误配置的 https://host/api，避免与 /api/... 请求路径拼成 /api/api/...
  if (url.pathname === '/api') url.pathname = '/'
  if (url.pathname !== '/') {
    throw new Error('VITE_API_ORIGIN 必须是纯源站地址，不能包含路径')
  }
  url.search = ''
  url.hash = ''
  return url.origin
}

export function selectApiOrigin(configuredOrigin = '', isNative = false) {
  return normalizeApiOrigin(configuredOrigin || (isNative ? NATIVE_API_ORIGIN : ''))
}

const API_ORIGIN = selectApiOrigin(
  import.meta.env.VITE_API_ORIGIN || import.meta.env.VITE_API_BASE || '',
  Capacitor.isNativePlatform()
)

export function redirectToLogin(location = window.location, isNative = Capacitor.isNativePlatform()) {
  if (isNative) {
    location.hash = '/login'
    return
  }
  location.assign('/login')
}

// 拼接完整请求地址：绝对 URL 原样；相对路径加 base；同源相对时原样
export function resolveApiUrl(path, origin = '') {
  if (/^https?:\/\//.test(path)) return path
  if (!path.startsWith('/')) throw new Error(`API 路径必须以 / 开头: ${path}`)
  return origin ? new URL(path, normalizeApiOrigin(origin)).toString() : path
}

export const resolveUrl = (path) => resolveApiUrl(path, API_ORIGIN)

// tokenStore：纯内存存储，不落 localStorage（防止 XSS 窃取）。
// 当前认证完全靠 gakiwoo-api 下发的 httpOnly Cookie（credentials: 'include'），
// tokenStore.set() 未被调用；保留此接口仅为未来 Bearer 模式预留，
// 启用后页面刷新即丢失，需重新登录或走 /api/auth/refresh。
let _accessToken = null
let _refreshToken = null
const SESSION_KEY = 'fc_has_session'

export const tokenStore = {
  getAccess: () => _accessToken,
  getRefresh: () => _refreshToken,
  set: (access, refresh) => {
    if (access) _accessToken = access
    if (refresh) _refreshToken = refresh
  },
  clear: () => {
    _accessToken = null
    _refreshToken = null
  }
}

// 会话标记：登录走 gakiwoo httpOnly Cookie，前端不持有 token，
// 因此用独立标记记录"是否曾登录"，供 401 刷新失败时决定是否跳转登录页。
// sessionStorage + 内存兜底（隐私模式/异常环境不可用时静默降级）。
let memorySession = false
export function markSession(has) {
  memorySession = !!has
  try {
    if (has) sessionStorage.setItem(SESSION_KEY, '1')
    else sessionStorage.removeItem(SESSION_KEY)
  } catch { /* 隐私模式忽略 */ }
}

export function hasSession() {
  if (memorySession) return true
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return memorySession
  }
}

// 错误码 → 中文提示（SPEC §6.3）
const CODE_MESSAGES = {
  10001: '参数错误，请检查输入',
  10002: '资源不存在',
  10003: '操作过于频繁，请稍后再试',
  20001: '未登录，请先登录',
  20002: '登录已过期，请重新登录',
  20003: '登录凭证无效',
  30001: '记录不存在',
  LOGIN_REQUIRED: '未登录，请先登录',
  LOGIN_EXPIRED: '登录已过期，请重新登录',
  AUTH_INVALID: '登录凭证无效'
}

function messageOf(body) {
  if (body?.message) return body.message
  if (body?.error) return body.error
  if (body?.code != null && CODE_MESSAGES[body.code]) return CODE_MESSAGES[body.code]
  return '请求失败，请稍后再试'
}

async function refreshSession() {
  // gakiwoo /api/auth/refresh 仅从 httpOnly Cookie 读取 refresh_token：
  // - Web 端：浏览器同源自动携带 cookie（无需手动传参）
  // - 移动端：原生客户端维护 cookie jar，或手动带 `Cookie: refresh_token=...` 头
  try {
    const resp = await fetch(resolveUrl('/api/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    if (!resp.ok) return false
    return true
  } catch {
    return false
  }
}

// 401 单飞（single-flight）：并发请求同时 401 时只触发一次刷新，
// 避免多次 refresh 竞争（若服务端轮换 refresh cookie，后发的刷新会失败导致误踢下线）
let refreshInFlight = null
function refreshSessionOnce() {
  if (!refreshInFlight) {
    refreshInFlight = refreshSession().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

// 登录/注册页豁免判断：兼容 BrowserRouter（pathname）与 APK HashRouter（hash）
function onAuthPage(location = window.location) {
  const p = (location.pathname || '') + (location.hash || '')
  return /\/(login|register)([/?#]|$)/.test(p)
}

// 重试配置：仅 GET 请求，网络错误或 5xx，最多 2 次，指数退避
const RETRY_MAX = 2
const RETRY_DELAYS = [500, 1500] // ms
function isRetryable(method, status, error) {
  if (method && method !== 'GET') return false // 写操作不重试，防重复提交
  if (error) return true // 网络错误（fetch throw）
  if (status >= 500 && status < 600) return true // 服务端错误
  return false
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 统一请求封装
 * @param {string} path 以 /api 开头的相对路径（或绝对 URL）
 * @param {object} options fetch 选项；body 为 FormData 时自动省略 Content-Type（浏览器带 multipart boundary）
 * @param {boolean} options._raw 为 true 时返回原始 Response（供下载 blob 等场景）
 * @param {boolean} options._retried 内部 401 重试标记（勿传）
 * @param {AbortSignal} options.signal 取消信号（透传 fetch，用于页面卸载时取消请求）
 */
export async function apiClient(path, options = {}) {
  const { _raw = false, _retried = false, signal, ...fetchOptions } = options
  const method = (fetchOptions.method || 'GET').toUpperCase()
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData

  // 带重试的 fetch 封装：网络错误/5xx 自动重试（仅 GET），401/429/4xx 不重试
  async function fetchWithRetry(retryCount = 0) {
    const headers = { ...(fetchOptions.headers || {}) }
    if (!isForm) headers['Content-Type'] = 'application/json'
    const access = tokenStore.getAccess()
    if (access) headers.Authorization = `Bearer ${access}`

    const url = resolveUrl(path)
    try {
      const resp = await fetch(url, { ...fetchOptions, headers, credentials: 'include', signal })
      // 5xx 响应也视为可重试（仅 GET）
      if (retryCount < RETRY_MAX && isRetryable(method, resp.status, null)) {
        await sleep(RETRY_DELAYS[retryCount])
        return fetchWithRetry(retryCount + 1)
      }
      return resp
    } catch (err) {
      // AbortError 是主动取消，不重试
      if (err?.name === 'AbortError') throw err
      if (retryCount < RETRY_MAX && isRetryable(method, null, err)) {
        await sleep(RETRY_DELAYS[retryCount])
        return fetchWithRetry(retryCount + 1)
      }
      throw err
    }
  }

  const resp = await fetchWithRetry()

  // 401 → 尝试 refresh 一次（单飞，并发共享同一次刷新）
  if (resp.status === 401 && !_retried) {
    const hadSession = !!(tokenStore.getAccess() || tokenStore.getRefresh() || hasSession())
    const ok = await refreshSessionOnce()
    if (ok) {
      return apiClient(path, { ...options, _retried: true })
    }
    tokenStore.clear()
    markSession(false)
    // 仅"曾登录过但会话已失效"的用户跳转登录页；
    // 游客（从未登录，无任何 token）直接抛 401 由页面渲染游客视图，避免整页跳转打断浏览
    if (hadSession && typeof window !== 'undefined' && !onAuthPage()) {
      redirectToLogin()
    }
  }

  if (_raw) return resp

  let body = null
  try {
    body = await resp.json()
  } catch {
    /* 非 JSON 响应 */
  }

  if (!resp.ok) {
    const err = new Error(messageOf(body))
    err.status = resp.status
    err.code = body?.code
    err.body = body
    throw err
  }
  return body
}

// FormData 专用上传封装（拍照识别等 multipart 场景）
export const upload = {
  post: (path, formData) => apiClient(path, { method: 'POST', body: formData })
}

export const http = {
  get: (path, params) => {
    const qs = params
      ? '?' +
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&')
      : ''
    return apiClient(path + qs)
  },
  post: (path, data) => apiClient(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => apiClient(path, { method: 'PUT', body: JSON.stringify(data) }),
  del: (path) => apiClient(path, { method: 'DELETE' })
}
