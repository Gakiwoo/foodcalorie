'use strict'
// Controller 层：AI 拍照识别（multipart 图片上传 → 候选食物，用户确认后落记录）
// 图片持久化：diskStorage 落盘到 uploads/，识别返回 image_url 供前端确认后随记录落库
const express = require('express')
const fs = require('fs')
const crypto = require('crypto')
const multer = require('multer')
const { requireAuth } = require('../../shared/middleware/requireAuth')
const { createRateLimit } = require('../../shared/middleware/rateLimit')
const { ok } = require('../../shared/utils/response')
const { ServiceError } = require('../../shared/utils/serviceError')
const { PARAM_INVALID } = require('../../shared/utils/errors')
const imageStore = require('../../shared/uploads/imageStore')
const service = require('./service')

const router = express.Router()

// AI 识别按用户限流：5 次 / 分钟（保护 Kimi 付费 API 与磁盘），登录用户按 user id
const aiUserLimit = createRateLimit(5, 60 * 1000, (req) => `ai:${req.user?.id || 'anon:' + (req.ip || 'unknown')}`)

// ── 文件魔数校验（杜绝客户端 mimetype 伪装上传任意内容）──
const MAGIC_CHECKERS = {
  'image/jpeg': (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) =>
    b.length >= 8 &&
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  'image/webp': (b) => b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
  'image/heic': (b) => isHeifFamily(b),
  'image/heif': (b) => isHeifFamily(b)
}
const HEIF_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'])
function isHeifFamily(buffer) {
  if (buffer.length < 12 || buffer.toString('ascii', 4, 8) !== 'ftyp') return false
  const brands = [buffer.toString('ascii', 8, 12)]
  for (let offset = 16; offset + 4 <= Math.min(buffer.length, 64); offset += 4) {
    brands.push(buffer.toString('ascii', offset, offset + 4))
  }
  return brands.some((brand) => HEIF_BRANDS.has(brand))
}
function checkMagic(mimetype, buf) {
  const checker = MAGIC_CHECKERS[mimetype]
  return !!checker && checker(buf)
}

// 上传目录仅供应用读取；nginx 必须禁止直接公开该目录。
const UPLOAD_DIR = imageStore.getUploadDir()

const EXT_BY_MIME = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/heic': '.heic', 'image/heif': '.heif' }

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || '.jpg'
    const name = `food_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`
    cb(null, name)
  }
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

// 私有图片下载：必须通过当前用户鉴权与所有权检查。
router.get('/images/:filename', requireAuth, (req, res, next) => {
  try {
    const filePath = imageStore.ownedFile(req.params.filename, req.user.id)
    res.set('Cache-Control', 'private, no-store')
    return res.sendFile(filePath)
  } catch (error) {
    return next(error)
  }
})

/**
 * @swagger
 * /foodcalorie/ai/recognize:
 *   post:
 *     tags: [AI]
 *     summary: 拍照识别（上传图片 → 返回候选食物 + image_url，用户确认后随记录落库）
 *     security: [{ BearerAuth: [] }]
 *     requestBody: multipart/form-data field=image
 */
router.post('/recognize', requireAuth, aiUserLimit, upload.single('image'), async (req, res, next) => {
  const file = req.file
  try {
    if (!file) throw new ServiceError(400, PARAM_INVALID, '请上传图片文件')
    // 魔数校验：文件头与声明 mimetype 一致才继续（失败即清理落盘文件）
    const buf = fs.readFileSync(file.path)
    if (!checkMagic(file.mimetype, buf)) {
      try { fs.unlinkSync(file.path) } catch {}
      throw new ServiceError(400, PARAM_INVALID, '图片文件内容与声明格式不符')
    }
    const privateImageUrl = imageStore.imageUrl(file.filename)
    const data = await service.recognize({
      mimetype: file.mimetype,
      size: file.size,
      buffer: buf,
      image_url: privateImageUrl
    })
    imageStore.register(file.filename, req.user.id)
    return ok(res, data, '识别完成，请确认')
  } catch (e) {
    // 识别失败（含 Kimi 降级异常/业务错误）→ 清理已落盘文件，防孤儿文件泄漏磁盘
    if (file && file.path) {
      try { fs.unlinkSync(file.path) } catch {}
    }
    next(e)
  }
})

module.exports = router
