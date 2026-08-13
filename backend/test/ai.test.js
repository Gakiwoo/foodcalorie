'use strict'
// AI 识别模块测试：降级候选（未配置 Key）、Kimi 响应解析、食物库匹配补全
const { test, after } = require('node:test')
const assert = require('node:assert')

process.env.NODE_ENV = 'test'
// 不设置 MOONSHOT_API_KEY：验证降级路径
delete process.env.MOONSHOT_API_KEY
// 临时库隔离（识别降级与回灌都读食物库，避免污染默认 data 库）；Windows/Linux 通用
process.env.DB_PATH = require('path').join(require('os').tmpdir(), 'fc-ai-test.db')
const fs = require('fs')
try { fs.unlinkSync(process.env.DB_PATH) } catch {}
const { closeDb } = require('../src/db')
const { recognize, parseKimiContent, enrich } = require('../src/modules/ai/service')

after(() => { try { fs.unlinkSync(process.env.DB_PATH) } catch {}; closeDb() })

// 单测用临时库：清空 AI 模块的全局 key 缓存需重载 —— 直接验证 recognize 降级与解析函数
test('未配置 MOONSHOT_API_KEY → 降级为食物库候选', async () => {
  const result = await recognize({ mimetype: 'image/png', size: 1000, buffer: Buffer.from('x') })
  assert.ok(Array.isArray(result.candidates))
  assert.ok(result.candidates.length >= 5, '候选至少 5 个')
  assert.ok(result.candidates.every((c) => c.calories > 0), '候选含营养')
  assert.ok(result.message.includes('候选推荐') || result.message.includes('未启用'), '提示降级原因: ' + result.message)
})

test('非法图片类型 → 400', async () => {
  await assert.rejects(
    () => recognize({ mimetype: 'text/plain', size: 100, buffer: Buffer.from('x') }),
    (e) => e.status === 400
  )
})

test('parseKimiContent 解析模型 JSON 输出', () => {
  // 纯 JSON
  const a = parseKimiContent('{"foods":[{"name":"米饭","calories":116,"protein_g":2.6,"carbs_g":25.9,"fat_g":0.3}]}')
  assert.strictEqual(a.length, 1)
  assert.strictEqual(a[0].name, '米饭')
  assert.strictEqual(a[0].calories, 116)

  // markdown 代码块包裹
  const b = parseKimiContent('```json\n{"foods":[{"name":"鸡胸肉","calories":133}]}\n```')
  assert.strictEqual(b[0].name, '鸡胸肉')

  // 非法内容 → 空数组
  assert.deepStrictEqual(parseKimiContent('抱歉我看不清'), [])
})

test('enrich 用食物库数据补全（匹配到用库值，未匹配用模型值）', () => {
  const r = enrich([
    { name: '米饭', calories: 1, protein_g: 0, carbs_g: 0, fat_g: 0 }, // 食物库有「米饭」
    { name: '神秘外星食物', calories: 88, protein_g: 9, carbs_g: 8, fat_g: 7 } // 库没有
  ])
  assert.ok(r[0].id, '米饭匹配到食物库 id')
  assert.strictEqual(r[0].calories, 116, '使用食物库营养而非模型值')
  assert.strictEqual(r[1].id, null, '未匹配 → 无 id')
  assert.strictEqual(r[1].calories, 88, '保留模型营养')
  assert.ok(r[0].confidence > r[1].confidence, '匹配项置信度更高')
})

test('受控回灌仓储保持幂等并过滤无效营养', async () => {
  const aiRepo = require('../src/modules/ai/repositories/aiRepo')
  const { getDb } = require('../src/db')
  const db = getDb()
  const uniqueName = '测试回灌食物' + Date.now()
  // 手工调用回灌（等价于 recognize 内部分支）：营养有效 + 名称不存在 → 入库
  const inserted = aiRepo.backfillModelFoods([
    { name: uniqueName, category: '测试', calories: 120, protein_g: 8, carbs_g: 10, fat_g: 2 },
    { name: uniqueName, category: '测试', calories: 999, protein_g: 0, carbs_g: 0, fat_g: 0 } // 重名 → 跳过
  ])
  assert.strictEqual(inserted.length, 1, '仅插入 1 条（去重）')
  const row = db.prepare('SELECT * FROM food_items WHERE name = ?').get(uniqueName)
  assert.ok(row, '已回灌入库')
  assert.strictEqual(row.source, 'model', 'source 标记为 model')
  assert.strictEqual(row.calories, 120)
  // 再次回灌同名 → 不重复插入
  const again = aiRepo.backfillModelFoods([{ name: uniqueName, calories: 200 }])
  assert.strictEqual(again.length, 0, '幂等：重名不重复插入')
  // 营养全 0 → 不污染库
  const junk = aiRepo.backfillModelFoods([{ name: '无营养垃圾' + Date.now(), calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }])
  assert.strictEqual(junk.length, 0, '营养全 0 不入库')
  // 清理测试数据
  db.prepare('DELETE FROM food_items WHERE name = ?').run(uniqueName)
})

test('recognize 返回结果含 image_url', async () => {
  const imageUrl = '/api/v1/foodcalorie/ai/images/food_12345678_deadbeef.png'
  const result = await recognize({ mimetype: 'image/png', size: 1000, buffer: Buffer.from('x'), image_url: imageUrl })
  assert.strictEqual(result.image_url, imageUrl, 'image_url 透传')
})
