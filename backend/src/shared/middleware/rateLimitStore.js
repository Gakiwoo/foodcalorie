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
    const c = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 2000,
        // 连接失败不自动重连：redis 默认 reconnectStrategy 会无限重试，
        // 使进程句柄永不释放（测试套件/优雅关闭场景挂起）。失败后由内存限流兜底，无需重连。
        reconnectStrategy: false
      }
    })
    // 连接期错误标记 failed：让调用方立即回退内存，避免请求阻塞在长连接超时上
    c.on('error', (err) => {
      failed = true
      console.warn('[rateLimit] redis 连接异常，降级为内存限流:', err.message)
    })
    try {
      await c.connect()
      failed = false
      client = c
      return c
    } catch (err) {
      // 连接失败：销毁客户端释放 socket 句柄（否则进程无法退出）
      try { c.destroy() } catch { /* 忽略销毁错误 */ }
      failed = true
      throw err
    }
  })()
  return connecting
}

// 优雅关闭：释放 redis 客户端，避免句柄阻止进程退出
async function closeRateLimit() {
  if (client) {
    const c = client
    client = null
    connecting = null
    try {
      await c.quit()
    } catch {
      try { c.destroy() } catch { /* 忽略 */ }
    }
    return
  }
  // 连接进行中：等待其 settle（失败路径内部已 destroy），再清空引用
  if (connecting) {
    try { await connecting } catch { /* 连接失败，内部已清理 */ }
    connecting = null
  }
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

module.exports = { usesRedis, checkRedis, closeRateLimit }
