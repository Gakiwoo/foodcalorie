'use strict'
// 入口：食刻后端 API 服务（foodcalorie-api）
const { createApp } = require('./app')
const { logger } = require('./shared/utils/logger')
const { closeDb } = require('./db')

const PORT = Number(process.env.PORT) || 3001
const HOST = process.env.HOST || '127.0.0.1' // 默认仅本机监听（nginx 反代），避免公网直连；如需公网直连可设 HOST=0.0.0.0

// ── 启动前密钥守卫：JWT_SECRET 必须与 gakiwoo-api 一致且非占位/弱密钥 ──
// 生产环境 fail-fast（漏配/占位直接拒绝启动）；非生产环境仅警告（本地占位符不阻塞开发）
function assertJwtSecret() {
  const secret = process.env.JWT_SECRET
  const isProd = process.env.NODE_ENV === 'production'
  const fail = (msg) => {
    if (isProd) {
      logger.error(msg)
      process.exit(1)
    }
    logger.warn(msg + '（当前非生产环境，仅警告）')
  }
  if (!secret) {
    return fail('JWT_SECRET 未配置，请从 gakiwoo-api .env 复制同一值')
  }
  if (secret.length < 16) {
    return fail('JWT_SECRET 长度不足 16 位，请使用与 gakiwoo-api 一致的强密钥')
  }
  if (/please-set-same-secret|changeme|your-secret/i.test(secret)) {
    return fail('JWT_SECRET 疑似占位/示例值，请配置真实密钥（与 gakiwoo-api 一致）')
  }
}

assertJwtSecret()

function installProcessHandlers() {
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'uncaughtException')
    setTimeout(() => process.exit(1), 500)
  })
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'unhandledRejection')
  })
  process.on('SIGINT', () => {
    closeDb()
    process.exit(0)
  })
}

installProcessHandlers()

const app = createApp()
const server = app.listen(PORT, HOST, () => {
  logger.info(`foodcalorie-api 已启动: http://${HOST}:${PORT}/api/v1/health`)
})

module.exports = { app, server }
