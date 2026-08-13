'use strict'
// Service 层：AI 拍照识别（Kimi/Moonshot 视觉模型识别 + 无 key/失败自动降级为食物库候选）
const aiRepo = require('./repositories/aiRepo')
const { ServiceError } = require('../../shared/utils/serviceError')
const { PARAM_INVALID } = require('../../shared/utils/errors')
const { logger } = require('../../shared/utils/logger')

// Kimi 视觉模型配置（可在 .env 覆盖）
const KIMI_API_KEY = process.env.MOONSHOT_API_KEY || ''
const KIMI_BASE_URL = process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.cn/v1'
const KIMI_MODEL = process.env.MOONSHOT_VISION_MODEL || 'moonshot-v1-8k-vision-preview'

const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_SIZE = 10 * 1024 * 1024

// 解析模型返回内容：容忍 markdown 代码块包裹，提取 JSON
function parseKimiContent(content) {
  if (!content) return []
  let text = String(content).trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) text = fence[1].trim()
  try {
    const obj = JSON.parse(text)
    const foods = Array.isArray(obj) ? obj : obj.foods || obj.candidates || []
    return foods.slice(0, 5).map((f) => ({
      name: String(f.name || '').trim(),
      category: f.category ? String(f.category).trim() : null,
      calories: Math.round(Number(f.calories) || 0),
      protein_g: Number(f.protein_g) || 0,
      carbs_g: Number(f.carbs_g) || 0,
      fat_g: Number(f.fat_g) || 0
    })).filter((f) => f.name)
  } catch {
    return []
  }
}

// 调用 Kimi 视觉模型识别图片中的食物
async function recognizeWithKimi(buffer, mimetype) {
  const imageUrl = `data:${mimetype || 'image/png'};base64,${buffer.toString('base64')}`

  const systemPrompt =
    '你是「食刻」App 的食物识别助手。请识别图片中的主要食物，只输出 JSON（不要任何其他文字）：' +
    '{"foods":[{"name":"食物中文名","category":"分类","calories":热量整数值kcal,"protein_g":蛋白质克数,"carbs_g":碳水化合物克数,"fat_g":脂肪克数}]}' +
    '要求：最多返回 3 个最可能的候选；calories 为每 100g 或一份的估算值；如果图片不是食物，返回 {"foods":[]}。'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)

  try {
    const resp = await fetch(KIMI_BASE_URL + '/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KIMI_API_KEY },
      body: JSON.stringify({
        model: KIMI_MODEL,
        temperature: 0.1,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageUrl } },
              { type: 'text', text: '识别这张图片里的食物' }
            ]
          }
        ]
      })
    })
    if (!resp.ok) throw new Error('Kimi API ' + resp.status + ': ' + (await resp.text()).slice(0, 200))
    const body = await resp.json()
    const content = body.choices?.[0]?.message?.content || ''
    return parseKimiContent(content)
  } finally {
    clearTimeout(timer)
  }
}

// 模型识别的食物 → 与食物库匹配补全营养（匹配到用库数据更准，否则用模型数据）
function enrich(foods) {
  return foods.map((f, i) => {
    const match = aiRepo.findByName(f.name)
    if (match) {
      return { ...match, confidence: Number((0.95 - i * 0.03).toFixed(2)) }
    }
    return {
      id: null,
      name: f.name,
      category: f.category || '未分类',
      calories: f.calories,
      protein_g: f.protein_g,
      carbs_g: f.carbs_g,
      fat_g: f.fat_g,
      unit_desc: '100g',
      confidence: Number((0.75 - i * 0.05).toFixed(2))
    }
  })
}

// 降级：食物库候选推荐
function fallbackRecognize(message = '') {
  return {
    candidates: aiRepo.recommendCandidates(8),
    message: message || '已识别出可能食物，请选择最接近的一项确认'
  }
}

async function recognize({ mimetype, size, buffer, image_url }) {
  if (!OK_TYPES.includes(mimetype)) throw new ServiceError(400, PARAM_INVALID, '请上传 JPEG/PNG/WEBP 格式图片')
  if (!size || size > MAX_SIZE) throw new ServiceError(400, PARAM_INVALID, '图片大小不能超过 10MB')

  // 1) 优先 Kimi 视觉模型
  if (KIMI_API_KEY && buffer) {
    try {
      const foods = await recognizeWithKimi(buffer, mimetype)
      if (foods.length > 0) {
        const candidates = enrich(foods)
        // 模型输出默认不进入公共食物库；仅在显式开启受控回灌时写入。
        if (process.env.AI_BACKFILL_ENABLED === 'true') {
          const backfilled = aiRepo.backfillModelFoods(foods)
          if (backfilled.length > 0) logger.info({ foods: backfilled.map((f) => f.name) }, '模型新食物已回灌食物库')
        }
        return { candidates, image_url, message: 'Kimi 识别完成，请确认最接近的一项' }
      }
      return { ...fallbackRecognize('未识别出明确食物，请手动选择'), image_url }
    } catch (e) {
      logger.warn({ err: e.message }, 'Kimi 识别失败，降级为食物库候选')
    }
  }

  // 2) 降级：食物库候选（未配置 MOONSHOT_API_KEY 或识别失败）
  return {
    ...fallbackRecognize(KIMI_API_KEY ? '识别服务暂不可用，已切换为候选推荐' : 'Kimi 识别未启用（未配置 MOONSHOT_API_KEY），当前为候选推荐'),
    image_url
  }
}

module.exports = { recognize, parseKimiContent, enrich }
