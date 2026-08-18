// 认证 API：复用服务器 gakiwoo-api /api/auth/*（零改动）
import { apiClient, tokenStore, markSession } from './client'

export async function login({ email, password }) {
  const body = await apiClient('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    credentials: 'same-origin'
  })
  // 服务端通过 Set-Cookie 下发 token；移动端需捕获 Set-Cookie 头。
  // Web 端浏览器自动管理 cookie，无需额外存储；若后端未来在 body 返回 token 则一并存储。
  markSession(true)
  return body // { user: { id, email, nickname, role } }
}

export async function register({ email, password, nickname }) {
  const body = await apiClient('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, nickname })
  })
  markSession(true)
  return body // { message, user }
}

export async function logout() {
  try {
    await apiClient('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
  } finally {
    tokenStore.clear()
    markSession(false)
  }
}

export async function fetchMe() {
  const body = await apiClient('/api/auth/me')
  return body.user
}
