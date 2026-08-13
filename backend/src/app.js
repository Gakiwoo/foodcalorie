'use strict'
// Express 应用装配（与 server.js 分离，便于 supertest 测试）
// dotenv 基于 __dirname 定位 .env，避免 PM2 从任意 cwd 启动时读不到配置
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')

const { logger } = require('./shared/utils/logger')
const { errorHandler } = require('./shared/middleware/errorHandler')
const { createRateLimit } = require('./shared/middleware/rateLimit')

const healthRoutes = require('./modules/health/routes')
const recordsRoutes = require('./modules/records/routes')
const profilesRoutes = require('./modules/profiles/routes')
const foodsRoutes = require('./modules/foods/routes')
const favoritesRoutes = require('./modules/favorites/routes')
const contentsRoutes = require('./modules/contents/routes')
const challengesRoutes = require('./modules/challenges/routes')
const exportRoutes = require('./modules/export/routes')
const aiRoutes = require('./modules/ai/routes')

// Swagger 文档（与 gakiwoo-api 一致）
// 环境白名单：非 production 默认开放；production 需显式 SWAGGER_ENABLED=true（安全默认关闭）
function setupSwagger(app) {
  const enabled =
    process.env.SWAGGER_ENABLED === 'true' ||
    (process.env.NODE_ENV || 'development') !== 'production'
  if (!enabled) return
  const swaggerJsdoc = require('swagger-jsdoc')
  const swaggerUi = require('swagger-ui-express')
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: '食刻 API',
        version: '1.0.0',
        description: '食刻 App 业务后端（注册登录复用 gakiwoo-api /api/auth/*）'
      },
      servers: [{ url: '/api/v1' }]
    },
    apis: [__dirname + '/modules/**/routes.js']
  }
  const spec = swaggerJsdoc(options)
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec))
}

function createApp() {
  const app = express()

  // 信任 loopback 反代（nginx）：保证 req.ip / 限流键取到真实客户端 IP
  app.set('trust proxy', 'loopback')

  // 安全头
  app.use(helmet())
  // CORS（生产环境必须显式提供白名单，避免携带凭据时 fail-open）
  const origins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const isProduction = process.env.NODE_ENV === 'production'
  if (isProduction && origins.length === 0) {
    throw new Error('生产环境必须配置 CORS_ORIGINS 白名单')
  }
  app.use(
    cors({
      origin: origins.length
        ? (origin, callback) => callback(null, !origin || origins.includes(origin))
        : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  )
  app.use(cookieParser())
  app.use(express.json({ limit: '2mb' }))

  // 请求日志（简化）
  app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      logger.info({ method: req.method, path: req.originalUrl, status: res.statusCode, ms: Date.now() - start })
    })
    next()
  })

  // API 版本管理：/api/v1 前缀；响应头标识版本
  const v1 = express.Router()
  v1.use((req, res, next) => {
    res.set('X-API-Version', 'v1')
    next()
  })

  // 全局限流（health 豁免）：写 30/min、读 120/min，按真实客户端 IP
  // 说明：内存桶仅适用于当前单实例部署；扩展为多实例时需接入共享限流存储。
  const writeLimit = createRateLimit(30, 60 * 1000)
  const readLimit = createRateLimit(120, 60 * 1000)
  v1.use((req, res, next) => {
    if (req.path.startsWith('/foodcalorie/health')) return next()
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) return writeLimit(req, res, next)
    return readLimit(req, res, next)
  })

  // 模块路由挂载
  // 模块路由挂载（health 使用 /foodcalorie/health 专属前缀，避免占用 /api/v1 命名空间）
  v1.use('/foodcalorie/health', healthRoutes)
  v1.use('/foodcalorie/records', recordsRoutes)
  v1.use('/foodcalorie/profile', profilesRoutes)
  v1.use('/foodcalorie/foods', foodsRoutes)
  v1.use('/foodcalorie/favorites', favoritesRoutes)
  v1.use('/foodcalorie/contents', contentsRoutes)
  v1.use('/foodcalorie/challenges', challengesRoutes)
  v1.use('/foodcalorie/export', exportRoutes)
  v1.use('/foodcalorie/ai', aiRoutes)

  app.use('/api/v1', v1)

  setupSwagger(app)

  // 兜底 404（JSON 统一格式）
  app.use((req, res) => {
    res.status(404).json({ code: 10002, message: '接口不存在' })
  })

  app.use(errorHandler)

  return app
}

module.exports = { createApp }
