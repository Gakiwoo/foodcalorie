// 前端 API 客户端：统一 baseURL / Bearer 附加 / 401 自动刷新 / 错误码映射
// 认证接口复用 gakiwoo-api：/api/auth/*（vite proxy → :3000）
// 业务接口：/api/v1/foodcalorie/*（vite proxy → :3001）
//
// baseURL 解析（支持 APK/独立部署）：
//   VITE_API_BASE 设置时（如 https://foodcalorie.gakiwoo.com/api）→ 请求拼完整 URL（APK 用）
//   未设置时 → 同源相对路径（Web 生产/开发走 vite proxy / 同域 nginx）

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

// 拼接完整请求地址：绝对 URL 原样；相对路径加 base；同源相对时原样
function resolveUrl(path) {
  if (/^https?:\/\//.test(path)) return path
  return API_BASE ? API_BASE + path : path
}

const TOKEN_KEY = 'fc_access_token'
const REFRESH_KEY = 'fc_refresh_token'

export const tokenStore = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access, refresh) => {
    if (access) localStorage.setItem(TOKEN_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
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

/**
 * 统一请求封装
 * @param {string} path 以 /api 开头的相对路径（或绝对 URL）
 * @param {object} options fetch 选项
 */
export async function apiClient(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const access = tokenStore.getAccess()
  if (access) headers.Authorization = `Bearer ${access}`

  const url = resolveUrl(path)
  let resp = await fetch(url, { ...options, headers, credentials: 'include' })

  // 401 → 尝试 refresh 一次
  if (resp.status === 401 && !options._retried) {
    const ok = await refreshSession()
    if (ok) {
      return apiClient(path, { ...options, _retried: true })
    }
    tokenStore.clear()
    // 未登录/过期：交给调用方决定（如跳转登录页）
  }

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
