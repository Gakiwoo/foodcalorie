'use strict'
// 可插拔限流存储：配置 REDIS_URL 时使用 Redis 滑动窗口（多实例共享计数），
// 未配置或 Redis 故障时由调用方回退内存实现（单实例行为不变，fail-open 到内存保护）。
const REDIS_URL = process.env.REDIS_URL || ''

let client = null
let connecting = null
let failed = false

function usesRedis() {
  return !!REDIS_URL && !failed
}

async function connect() {
  if (client) return client
  if (connecting) return connecting
  connecting = (async () => {
    const { createClient } = require('redis')
    const c = createClient({ url: REDIS_URL, socket: { connectTimeout: 2000 } })
    // 连接期错误标记 failed：让调用方立即回退内存，避免请求阻塞在长连接超时上
    c.on('error', (err) => {
      failed = true
      console.warn('[rateLimit] redis 连接异常，降级为内存限流:', err.message)
    })
    await c.connect()
    failed = false
    client = c
    return c
  })()
  return connecting
}

// Redis 滑动窗口（原子 Lua）：清理窗口外时间戳 → 计数 → 放行则写入并续期
const SLIDING_WINDOW_LUA = `
redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])
local count = redis.call('ZCARD', KEYS[1])
if count >= tonumber(ARGV[3]) then return 0 end
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[2] .. ':' .. tostring(math.random(1e9)))
redis.call('EXPIRE', KEYS[1], 600)
return 1`

/**
 * Redis 滑动窗口限流检查
 * @returns {Promise<boolean>} true=放行；抛出异常时由调用方回退内存
 */
async function checkRedis(key, limit, windowMs) {
  const c = await connect()
  const now = Date.now()
  const res = await c.eval(SLIDING_WINDOW_LUA, {
    keys: [key],
    arguments: [String(now - windowMs), String(now), String(limit)]
  })
  return res === 1
}

module.exports = { usesRedis, checkRedis }
