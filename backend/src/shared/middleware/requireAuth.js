'use strict'
// 鉴权中间件：与 gakiwoo-api shared/middleware/auth.js 同一 JWT_SECRET / 同一逻辑
// 支持 Cookie access_token 与 Authorization: Bearer 双通道（多端兼容）
const jwt = require('jsonwebtoken')
const { ServiceError } = require('../utils/serviceError')

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (() => {
    throw new Error('JWT_SECRET must be set in .env（与 gakiwoo-api 保持一致）')
  })()

// 从 httpOnly cookie 或 Authorization header 提取 token（与 gakiwoo-api 一致）
function extractToken(req) {
  if (req.cookies?.access_token) return req.cookies.access_token
  const auth = req.headers['authorization']
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7)
  return null
}

function requireAuth(req, res, next) {
  const token = extractToken(req)
  if (!token) {
    return next(new ServiceError(401, 20001, '未登录，请先登录'))
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    // payload: { id, email, role, iat, exp }
    req.user = { id: payload.id, email: payload.email, role: payload.role }
    return next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ServiceError(401, 20002, '登录已过期，请重新登录'))
    }
    return next(new ServiceError(401, 20003, '无效的登录凭证'))
  }
}

module.exports = { requireAuth, extractToken }
