'use strict'
// 统一响应格式（SPEC §6.2）：成功 { code:0, message:'ok', data } / 失败 { code, message }
const { OK } = require('./errors')

function ok(res, data, message = 'ok') {
  return res.json({ code: OK, message, data: data ?? null })
}

// 分页包装
function okPage(res, { list, page, pageSize, total }, message = 'ok') {
  return res.json({ code: OK, message, data: { list, page, pageSize, total } })
}

module.exports = { ok, okPage }
