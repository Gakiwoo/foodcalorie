'use strict'

const fs = require('fs')
const path = require('path')
const { getDb } = require('../../db')
const { ServiceError } = require('../utils/serviceError')
const { NOT_FOUND, PARAM_INVALID } = require('../utils/errors')

const IMAGE_ROUTE_PREFIX = '/api/v1/foodcalorie/ai/images/'
const FILENAME_PATTERN = /^food_\d+_[0-9a-f]{8}\.(?:jpg|png|webp|heic|heif)$/i

function getUploadDir() {
  const dir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', '..', 'uploads')
  fs.mkdirSync(dir, { recursive: true })
  return path.resolve(dir)
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
  getDb()
    .prepare("INSERT INTO uploaded_images (filename, user_id, status) VALUES (?, ?, 'pending')")
    .run(filename, userId)
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
  const expired = getDb()
    .prepare("SELECT filename, user_id FROM uploaded_images WHERE status = 'pending' AND created_at < datetime('now', '-1 day') LIMIT 100")
    .all()
  const remove = getDb().prepare('DELETE FROM uploaded_images WHERE filename = ? AND user_id = ?')
  const tx = getDb().transaction(() => {
    for (const row of expired) remove.run(row.filename, row.user_id)
  })
  tx()
  for (const row of expired) {
    try { fs.unlinkSync(path.join(getUploadDir(), row.filename)) } catch (error) {
      if (error.code !== 'ENOENT') throw error
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
