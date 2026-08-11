'use strict'
// 日志：pino（与 gakiwoo-api 一致）
const pino = require('pino')

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'foodcalorie-api' },
  ...(process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {})
})

module.exports = { logger }
