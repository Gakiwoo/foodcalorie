'use strict'
// Service 层：内容业务（详情自动 +1 浏览量）
const contentRepo = require('./repositories/contentRepo')
const { ServiceError } = require('../../shared/utils/serviceError')
const { CONTENT_NOT_FOUND } = require('../../shared/utils/errors')

function listContents({ type, page, pageSize }) {
  return contentRepo.list({ type, page, pageSize })
}

function getContent(id) {
  // 原子读取并递增浏览量（事务包裹），避免并发下返回值与 DB 实际值不一致
  const content = contentRepo.getAndIncrementViews(id)
  if (!content) throw new ServiceError(404, CONTENT_NOT_FOUND)
  return content
}

module.exports = { listContents, getContent }
