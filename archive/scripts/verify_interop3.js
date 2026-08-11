// 服务器端执行：真实 token 互通全链路验证（gakiwoo auth ↔ foodcalorie records）
const fs = require('fs')
const BASE1 = 'http://127.0.0.1:3000'
const BASE2 = 'http://127.0.0.1:3001'
const log = (...a) => console.log(...a)
const j = (r) => r.json().catch(() => null)

async function main() {
  // 1) 登录 → 捕获 Set-Cookie 双 token
  const loginRes = await fetch(BASE1 + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 't_fc_test@x.com', password: 'Test123456!' })
  })
  const sc = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : []
  const at = (sc.find((x) => x.startsWith('access_token=')) || '').split(';')[0].slice(13)
  const rt = (sc.find((x) => x.startsWith('refresh_token=')) || '').split(';')[0].slice(14)
  const loginBody = await j(loginRes)
  log('1) login:', loginRes.status, JSON.stringify(loginBody), '| at_len=' + at.length, 'rt_len=' + rt.length)
  if (!at) throw new Error('未捕获 access_token')

  const H = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + at }
  const req = (url, opt = {}) => fetch(BASE2 + url, { ...opt, headers: { ...H, ...(opt.headers || {}) } })

  // 2) 记录列表（空）
  let r = await req('/api/v1/foodcalorie/records')
  log('2) 记录列表:', r.status, JSON.stringify(await j(r)).slice(0, 150))

  // 3) 创建
  r = await req('/api/v1/foodcalorie/records', {
    method: 'POST',
    body: JSON.stringify({ food_name: '红烧牛肉面', category: '中式面食', meal_type: '午餐', calories: 520, protein_g: 28, carbs_g: 65, fat_g: 18, record_time: '2026-08-06 12:00' })
  })
  const created = await j(r)
  log('3) 创建记录:', r.status, JSON.stringify(created).slice(0, 200))
  const rid = created?.data?.id
  if (!rid) throw new Error('创建失败')

  // 4) 按日期列表
  r = await req('/api/v1/foodcalorie/records?date=2026-08-06')
  log('4) 按日期列表:', r.status, JSON.stringify(await j(r)).slice(0, 150))

  // 5) 日统计
  r = await req('/api/v1/foodcalorie/records/stats?range=day&date=2026-08-06')
  log('5) 日统计:', r.status, JSON.stringify(await j(r)).slice(0, 200))

  // 6) 月历
  r = await req('/api/v1/foodcalorie/records/calendar?month=2026-08')
  log('6) 月历:', r.status, JSON.stringify(await j(r)).slice(0, 200))

  // 7) 编辑
  r = await req('/api/v1/foodcalorie/records/' + rid, {
    method: 'PUT',
    body: JSON.stringify({ calories: 480, portion: '2 份' })
  })
  log('7) 编辑记录:', r.status, JSON.stringify(await j(r)).slice(0, 150))

  // 8) gakiwoo /me 认我们的 token（双向互通）
  r = await fetch(BASE1 + '/api/auth/me', { headers: { Authorization: 'Bearer ' + at } })
  log('8) gakiwoo /me(Bearer):', r.status, JSON.stringify(await j(r)).slice(0, 150))

  // 9) refresh 换新（移动端长会话）
  r = await fetch(BASE1 + '/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: rt })
  })
  const sc2 = r.headers.getSetCookie ? r.headers.getSetCookie() : []
  log('9) refresh:', r.status, 'new_access=' + (sc2.some((x) => x.startsWith('access_token=')) ? 'YES' : 'NO'), 'new_refresh=' + (sc2.some((x) => x.startsWith('refresh_token=')) ? 'YES' : 'NO'))

  // 10) 删除（清理）
  r = await req('/api/v1/foodcalorie/records/' + rid, { method: 'DELETE' })
  log('10) 删除记录:', r.status, JSON.stringify(await j(r)).slice(0, 150))

  // 11) 复核共享库业务表（只读）
  const D = require('/var/www/foodcalorie-api/node_modules/better-sqlite3')
  const db = new D('/var/lib/gakiwoo/gakiwoo.db', { readonly: true })
  const t = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('user_profiles','food_records','food_items','favorites','contents','challenges')").all().map((x) => x.name)
  const c = db.prepare('SELECT COUNT(*) c FROM food_records').get()
  log('11) 共享库业务表:', t.join(', ') || '无', '| food_records 残留:', c.c)
  db.close()
}

main().catch((e) => {
  console.log('❌', e.message)
  process.exit(1)
})
