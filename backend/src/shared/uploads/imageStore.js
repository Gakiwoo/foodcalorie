'use strict'

const fs = require('fs')
const path = require('path')
const { getDb } = require('../../db')
const { ServiceError } = require('../utils/serviceError')
const { NOT_FOUND, PARAM_INVALID } = require('../utils/errors')

const IMAGE_ROUTE_PREFIX = '/api/v1/foodcalorie/ai/images/'
const FILENAME_PATTERN = /^food_\d+_[0-9a-f]{8}\.(?:jpg|png|webp|heic|heif)$/i

// 上传目录：模块加载时创建一次，避免每个请求重复同步 mkdir（B10）
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', '..', 'uploads'))
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

function getUploadDir() {
  return UPLOAD_DIR
}

function validateFilename(filename) {
  if (!FILENAME_PATTERN.test(filename) || path.basename(filename) !== filename) {
    throw new ServiceError(404, NOT_FOUND, '图片不存在')
  }
  return filename
}

function imageUrl(filename) {
  return IMAGE_ROUTE_PREFIX + validateFilename(filename)
}

function filenameFromUrl(url) {
  if (!url) return null
  if (!String(url).startsWith(IMAGE_ROUTE_PREFIX)) {
    throw new ServiceError(400, PARAM_INVALID, 'image_url 必须是本服务签发的私有图片地址')
  }
  return validateFilename(String(url).slice(IMAGE_ROUTE_PREFIX.length))
}

function findOwned(filename, userId) {
  return getDb()
    .prepare('SELECT filename, user_id, status, created_at, claimed_at FROM uploaded_images WHERE filename = ? AND user_id = ?')
    .get(validateFilename(filename), userId)
}

function assertOwnedUrl(url, userId) {
  const filename = filenameFromUrl(url)
  if (!filename) return null
  const row = findOwned(filename, userId)
  if (!row) throw new ServiceError(404, NOT_FOUND, '图片不存在')
  return row
}

function register(filename, userId) {
  validateFilename(filename)
  const db = getDb()
  // 单用户 pending 上限守护（B3）：超过 30 张未确认图片时，先清理该用户最旧的 pending
  const pendingCount = db.prepare("SELECT COUNT(*) AS c FROM uploaded_images WHERE user_id = ? AND status = 'pending'").get(userId).c
  if (pendingCount >= 30) {
    const oldest = db.prepare("SELECT filename FROM uploaded_images WHERE user_id = ? AND status = 'pending' ORDER BY created_at ASC LIMIT 1").get(userId)
    if (oldest) {
      db.prepare('DELETE FROM uploaded_images WHERE filename = ? AND user_id = ?').run(oldest.filename, userId)
      try { fs.unlinkSync(path.join(UPLOAD_DIR, oldest.filename)) } catch (error) {
        if (error.code !== 'ENOENT') console.warn(`[imageStore] 清理超出上限图片失败 ${oldest.filename}: ${error.message}`)
      }
    }
  }
  db.prepare("INSERT INTO uploaded_images (filename, user_id, status) VALUES (?, ?, 'pending')").run(filename, userId)
  cleanupExpiredPending()
  return imageUrl(filename)
}

function claim(url, userId) {
  const row = assertOwnedUrl(url, userId)
  if (!row) return null
  if (row.status !== 'pending') {
    throw new ServiceError(400, PARAM_INVALID, '图片已被其他记录使用')
  }
  const changes = getDb()
    .prepare("UPDATE uploaded_images SET status = 'claimed', claimed_at = datetime('now') WHERE filename = ? AND user_id = ? AND status = 'pending'")
    .run(row.filename, userId).changes
  if (changes !== 1) throw new ServiceError(400, PARAM_INVALID, '图片状态已变化，请重新识别')
  return row.filename
}

function ownedFile(filename, userId) {
  const row = findOwned(filename, userId)
  if (!row) throw new ServiceError(404, NOT_FOUND, '图片不存在')
  const filePath = path.resolve(getUploadDir(), row.filename)
  if (path.dirname(filePath) !== getUploadDir() || !fs.existsSync(filePath)) {
    throw new ServiceError(404, NOT_FOUND, '图片不存在')
  }
  return filePath
}

function removeOwnedUrl(url, userId) {
  const row = assertOwnedUrl(url, userId)
  if (!row) return
  // 兼容历史数据中多个记录引用同一张图片的情况：最后一个引用删除后才清理文件。
  const stillReferenced = getDb()
    .prepare('SELECT 1 FROM food_records WHERE user_id = ? AND image_url = ? LIMIT 1')
    .get(userId, url)
  if (stillReferenced) return
  getDb().prepare('DELETE FROM uploaded_images WHERE filename = ? AND user_id = ?').run(row.filename, userId)
  try { fs.unlinkSync(path.join(getUploadDir(), row.filename)) } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

function cleanupExpiredPending() {
  // 清理周期从 1 天缩短到 6 小时（B3），配合单用户 pending 上限守护
  const expired = getDb()
    .prepare("SELECT filename, user_id FROM uploaded_images WHERE status = 'pending' AND created_at < datetime('now', '-6 hours') LIMIT 100")
    .all()
  const remove = getDb().prepare('DELETE FROM uploaded_images WHERE filename = ? AND user_id = ?')
  const tx = getDb().transaction(() => {
    for (const row of expired) remove.run(row.filename, row.user_id)
  })
  tx()
  // 逐个清理文件：单文件失败（EPERM/EBUSY 等）只记日志，不得阻断当前用户的上传流程
  for (const row of expired) {
    try { fs.unlinkSync(path.join(getUploadDir(), row.filename)) } catch (error) {
      if (error.code !== 'ENOENT') console.warn(`[imageStore] 清理过期图片失败 ${row.filename}: ${error.message}`)
    }
  }
}

module.exports = {
  IMAGE_ROUTE_PREFIX,
  FILENAME_PATTERN,
  getUploadDir,
  imageUrl,
  filenameFromUrl,
  assertOwnedUrl,
  register,
  claim,
  ownedFile,
  removeOwnedUrl,
  cleanupExpiredPending
}
