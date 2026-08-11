// M4 服务器端全链路验证：profile / foods / contents / favorites / challenges / export
const BASE1 = 'http://127.0.0.1:3000'
const BASE2 = 'http://127.0.0.1:3001'
const j = (r) => r.json().catch(() => null)
const results = []
const ok = (name, pass, extra = '') => results.push(`${pass ? '✅' : '❌'} ${name}${extra ? ' → ' + extra : ''}`)

async function main() {
  // 登录（测试账号）
  const lr = await fetch(BASE1 + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 't_fc_test@x.com', password: 'Test123456!' })
  })
  const sc = lr.headers.getSetCookie ? lr.headers.getSetCookie() : []
  const at = (sc.find((x) => x.startsWith('access_token=')) || '').split(';')[0].slice(13)
  const H = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + at }
  const req = (url, opt = {}) => fetch(BASE2 + url, { ...opt, headers: { ...H, ...(opt.headers || {}) } })

  // 1) Profile：自动创建默认档
  let r = await req('/api/v1/foodcalorie/profile')
  let b = await j(r)
  ok('profile 自动建档', r.status === 200 && b.data?.target_calories === 1400 && b.data?.nickname, 'nickname=' + b.data?.nickname)

  // 2) Profile 更新
  r = await req('/api/v1/foodcalorie/profile', {
    method: 'PUT',
    body: JSON.stringify({ gender: '男', height_cm: 175, weight_kg: 68, goal_type: '减脂', diet_preferences: ['清淡', '高蛋白', '坚果'], precision_mode: 'precise', burst_enabled: true, target_calories: 1500 })
  })
  b = await j(r)
  ok('profile 更新', r.status === 200 && b.data?.gender === '男' && b.data?.height_cm === 175 && b.data?.precision_mode === 'precise' && b.data?.burst_enabled === 1 && Array.isArray(b.data?.diet_preferences), JSON.stringify({ g: b.data?.gender, p: b.data?.precision_mode, b: b.data?.burst_enabled, dp: b.data?.diet_preferences }))

  // 3) 非法枚举校验
  r = await req('/api/v1/foodcalorie/profile', { method: 'PUT', body: JSON.stringify({ precision_mode: 'xxx' }) })
  ok('profile 非法值拦截', r.status === 400 && (await j(r)).code === 10001)

  // 4) 食物库搜索
  r = await req('/api/v1/foodcalorie/foods?keyword=' + encodeURIComponent('鸡'))
  b = await j(r)
  ok('食物库搜索「鸡」', r.status === 200 && b.data?.total >= 2, 'total=' + b.data?.total)
  r = await req('/api/v1/foodcalorie/foods?category=' + encodeURIComponent('轻食'))
  b = await j(r)
  ok('食物库分类过滤「轻食」', r.status === 200 && b.data?.total >= 2, 'total=' + b.data?.total)
  r = await req('/api/v1/foodcalorie/foods/categories')
  b = await j(r)
  ok('食物分类列表', r.status === 200 && b.data?.length >= 5, 'cats=' + (b.data || []).length)

  // 5) 内容流 + 详情
  r = await req('/api/v1/foodcalorie/contents?type=recipe')
  b = await j(r)
  ok('食谱流', r.status === 200 && b.data?.total === 3, 'total=' + b.data?.total)
  r = await req('/api/v1/foodcalorie/contents/1')
  b = await j(r)
  ok('内容详情(含成分/步骤)', r.status === 200 && Array.isArray(b.data?.ingredients) && Array.isArray(b.data?.steps), 'title=' + b.data?.title)

  // 6) 收藏 CRUD
  r = await req('/api/v1/foodcalorie/favorites', { method: 'POST', body: JSON.stringify({ type: 'recipe', ref_id: 1 }) })
  ok('收藏', r.status === 201)
  r = await req('/api/v1/foodcalorie/favorites', { method: 'POST', body: JSON.stringify({ type: 'recipe', ref_id: 1 }) })
  ok('重复收藏拦截 409', r.status === 409, 'code=' + (await j(r)).code)
  r = await req('/api/v1/foodcalorie/favorites?type=recipe')
  b = await j(r)
  ok('收藏列表', r.status === 200 && b.data?.length === 1, 'count=' + b.data?.length)
  r = await req('/api/v1/foodcalorie/favorites?type=recipe&ref_id=1', { method: 'DELETE' })
  ok('取消收藏', r.status === 200 && (await j(r)).data?.favorited === false)

  // 7) 挑战
  r = await req('/api/v1/foodcalorie/challenges')
  b = await j(r)
  ok('挑战列表', r.status === 200 && b.data?.length >= 1 && b.data[0]?.joined === false, 'name=' + (b.data?.[0]?.name || '-'))
  const cid = b.data?.[0]?.id
  r = await req(`/api/v1/foodcalorie/challenges/${cid}/join`, { method: 'POST' })
  ok('参与挑战', r.status === 200 && (await j(r)).data?.joined === true)
  r = await req(`/api/v1/foodcalorie/challenges/${cid}/checkin`, { method: 'POST' })
  b = await j(r)
  ok('打卡 +1 天', r.status === 200 && b.data?.check_in_days === 1 && b.data?.points === 10, JSON.stringify(b.data))
  r = await req(`/api/v1/foodcalorie/challenges/${cid}/checkin`, { method: 'POST' })
  ok('同日重复打卡 429', r.status === 429, 'msg=' + (await j(r)).message)

  // 8) 导出（先造一条记录）
  r = await req('/api/v1/foodcalorie/records', { method: 'POST', body: JSON.stringify({ food_name: '导出测试面', meal_type: '早餐', calories: 350, record_time: '2026-08-06 08:00' }) })
  const rid = (await j(r)).data?.id
  r = await req('/api/v1/foodcalorie/export?format=csv&range=day&date=2026-08-06', { method: 'POST' })
  const csvText = await r.text()
  ok('CSV 导出', r.status === 200 && r.headers.get('content-type')?.includes('text/csv') && csvText.includes('导出测试面') && csvText.includes('food_name'), 'bytes=' + csvText.length)
  r = await req('/api/v1/foodcalorie/export?format=json&range=all', { method: 'POST' })
  b = await j(r)
  ok('JSON 导出', r.status === 200 && b.data?.records?.length >= 1, 'count=' + b.data?.count)
  await req('/api/v1/foodcalorie/records/' + rid, { method: 'DELETE' })

  // 9) 共享库复核
  const D = require('/var/www/foodcalorie-api/node_modules/better-sqlite3')
  const db = new D('/var/lib/gakiwoo/gakiwoo.db', { readonly: true })
  const foods = db.prepare('SELECT COUNT(*) c FROM food_items').get().c
  const contents = db.prepare('SELECT COUNT(*) c FROM contents').get().c
  const parts = db.prepare('SELECT COUNT(*) c FROM challenge_participants').get().c
  const prof = db.prepare('SELECT COUNT(*) c FROM user_profiles').get().c
  ok('种子与建表复核', foods >= 40 && contents >= 6 && parts >= 1 && prof >= 1, `foods=${foods} contents=${contents} parts=${parts} profiles=${prof}`)
  db.close()

  console.log(results.join('\n'))
}
main().catch((e) => {
  console.log(results.join('\n'))
  console.log('❌ 异常:', e.message)
  process.exit(1)
})
