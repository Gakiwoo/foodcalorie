'use strict'
// Service 层：食刻资料业务（读取自动建默认档；更新支持部分字段）
const profileRepo = require('./repositories/profileRepo')

// GET：无档则自动创建默认档（首次访问即就绪），并附带 users 昵称
function getProfile(userId) {
  let profile = profileRepo.getByUserId(userId)
  if (!profile) {
    profile = profileRepo.upsert(userId, {})
  }
  return { ...profile, nickname: profileRepo.getNickname(userId) }
}

// PUT：白名单字段由 routes 的 zod 保证，这里只做 diet_preferences 的 JSON 序列化
function updateProfile(userId, patch) {
  const data = { ...patch }
  if (Array.isArray(data.diet_preferences)) {
    data.diet_preferences = JSON.stringify(data.diet_preferences)
  }
  const profile = profileRepo.upsert(userId, data)
  return { ...profile, nickname: profileRepo.getNickname(userId) }
}

module.exports = { getProfile, updateProfile }
