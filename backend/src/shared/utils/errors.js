'use strict'
// 错误码规范（SPEC §6.3）
// 段位：0 成功 / 1xxxx 通用 / 2xxxx 认证 / 3xxxx 记录 / 4xxxx 内容与收藏 / 5xxxx 统计与导出

module.exports = {
  OK: 0,

  // ── 通用 1xxxx ──
  PARAM_INVALID: 10001,        // 参数校验失败（zod）
  NOT_FOUND: 10002,            // 资源不存在
  RATE_LIMITED: 10003,         // 请求过于频繁
  INTERNAL_ERROR: 10099,       // 服务端未知错误

  // ── 认证 2xxxx（与 gakiwoo-api auth code 语义对齐）──
  AUTH_REQUIRED: 20001,        // 未登录（对应 LOGIN_REQUIRED）
  AUTH_EXPIRED: 20002,         // 登录过期（对应 LOGIN_EXPIRED）
  AUTH_INVALID: 20003,         // 无效凭证（对应 AUTH_INVALID）
  AUTH_FORBIDDEN: 20004,       // 无权限

  // ── 记录 3xxxx ──
  RECORD_NOT_FOUND: 30001,
  RECORD_CREATE_FAILED: 30002,
  RECORD_UPDATE_FAILED: 30003,
  RECORD_DELETE_FAILED: 30004,

  // ── 内容/收藏 4xxxx ──
  FAVORITE_EXISTS: 40001,
  FAVORITE_NOT_FOUND: 40002,
  CONTENT_NOT_FOUND: 40003,

  // ── 统计/导出 5xxxx ──
  RANGE_INVALID: 50001,
  EXPORT_FAILED: 50002,

  // 错误码 → 默认提示文案
  MESSAGES: {
    10001: '参数校验失败',
    10002: '资源不存在',
    10003: '请求过于频繁，请稍后再试',
    10099: '服务内部错误，请稍后再试',
    20001: '未登录，请先登录',
    20002: '登录已过期，请重新登录',
    20003: '无效的登录凭证',
    20004: '无权执行该操作',
    30001: '记录不存在',
    30002: '记录创建失败',
    30003: '记录更新失败',
    30004: '记录删除失败',
    40001: '已收藏，请勿重复操作',
    40002: '收藏不存在',
    40003: '内容不存在',
    50001: '统计范围参数非法（可选 day/week/month）',
    50002: '导出失败'
  }
}
