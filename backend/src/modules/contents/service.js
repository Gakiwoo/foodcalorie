'use strict'
// Service 层：内容业务（详情自动 +1 浏览量）
const contentRepo = require('./repositories/contentRepo')
const { ServiceError } = require('../../shared/utils/serviceError')
const { CONTENT_NOT_FOUND } = require('../../shared/utils/errors')

function listContents({ type, page, pageSize }) {
  return contentRepo.list({ type, page, pageSize })
}

function getContent(id) {
  const content = contentRepo.getById(id)
  if (!content) throw new ServiceError(404, CONTENT_NOT_FOUND)
  contentRepo.incrementViews(id)
  return { ...content, views: content.views + 1 }
}

module.exports = { listContents, getContent }
