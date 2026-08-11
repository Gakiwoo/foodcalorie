'use strict'
// 数据库：better-sqlite3（与 gakiwoo-api 同引擎）。
// 部署时通过 DB_PATH 指向 gakiwoo-api 同一 SQLite 文件（共享 users 表），JWT_SECRET 同值互通鉴权。
const path = require('path')
const Database = require('better-sqlite3')

const DB_PATH =
  process.env.DB_PATH ||
  path.join(__dirname, '..', '..', 'data', 'foodcalorie.db')

let dbInstance = null

function initSchema(db) {
  db.exec(`
    -- 用户食刻资料（user_id 关联 gakiwoo-api users.id，不建外键避免跨库耦合）
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id           INTEGER PRIMARY KEY,
      gender            TEXT,
      birthday          TEXT,
      height_cm         INTEGER,
      weight_kg         REAL,
      goal_type         TEXT DEFAULT '减脂',
      target_calories   INTEGER DEFAULT 1400,
      diet_preferences  TEXT DEFAULT '[]',
      unit_calorie      TEXT DEFAULT 'kcal',
      unit_weight       TEXT DEFAULT 'g',
      precision_mode    TEXT DEFAULT 'standard',
      burst_enabled     INTEGER DEFAULT 0,
      burst_count       INTEGER DEFAULT 3,
      notif_record      INTEGER DEFAULT 1,
      notif_goal        INTEGER DEFAULT 1,
      notif_community   INTEGER DEFAULT 0,
      notif_weekly      INTEGER DEFAULT 1,
      notif_activity    INTEGER DEFAULT 0,
      quiet_start       TEXT DEFAULT '22:00',
      quiet_end         TEXT DEFAULT '08:00',
      created_at        TEXT DEFAULT (datetime('now')),
      updated_at        TEXT DEFAULT (datetime('now'))
    );

    -- 食物记录（记录页/今日/周/月视图/详情）
    CREATE TABLE IF NOT EXISTS food_records (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      food_name   TEXT NOT NULL,
      category    TEXT,
      meal_type   TEXT NOT NULL,
      calories    INTEGER NOT NULL,
      protein_g   REAL DEFAULT 0,
      carbs_g     REAL DEFAULT 0,
      fat_g       REAL DEFAULT 0,
      fiber_g     REAL DEFAULT 0,
      portion     TEXT DEFAULT '1 份',
      record_time TEXT NOT NULL,
      source      TEXT DEFAULT 'manual',
      image_url   TEXT,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_records_user_time ON food_records(user_id, record_time);

    -- 食物库（手动添加/搜索页）
    CREATE TABLE IF NOT EXISTS food_items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      category    TEXT,
      calories    INTEGER DEFAULT 0,
      protein_g   REAL DEFAULT 0,
      carbs_g     REAL DEFAULT 0,
      fat_g       REAL DEFAULT 0,
      unit_desc   TEXT DEFAULT '1 份',
      source      TEXT DEFAULT 'seed'
    );
    CREATE INDEX IF NOT EXISTS idx_food_items_name ON food_items(name);

    -- 收藏（我的收藏页）
    CREATE TABLE IF NOT EXISTS favorites (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      type       TEXT NOT NULL,
      ref_id     INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, type, ref_id)
    );

    -- 内容（发现页文章/食谱）
    CREATE TABLE IF NOT EXISTS contents (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      type        TEXT NOT NULL,
      title       TEXT NOT NULL,
      summary     TEXT,
      cover_icon  TEXT,
      author      TEXT,
      views       INTEGER DEFAULT 0,
      calories    INTEGER DEFAULT 0,
      protein_g   REAL DEFAULT 0,
      carbs_g     REAL DEFAULT 0,
      fat_g       REAL DEFAULT 0,
      ingredients TEXT,
      steps       TEXT,
      body        TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    -- 挑战活动定义（user_id 为空 = 系统级活动；M4 起用）
    CREATE TABLE IF NOT EXISTS challenges (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER,
      name          TEXT,
      start_date    TEXT,
      end_date      TEXT,
      check_in_days INTEGER DEFAULT 0,
      tasks         TEXT DEFAULT '[]',
      points        INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now'))
    );

    -- 挑战参与（M4 新增：user × challenge 打卡进度）
    CREATE TABLE IF NOT EXISTS challenge_participants (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id  INTEGER NOT NULL,
      user_id       INTEGER NOT NULL,
      check_in_days INTEGER DEFAULT 0,
      streak_days   INTEGER DEFAULT 0,
      points        INTEGER DEFAULT 0,
      last_check_in TEXT,
      joined_at     TEXT DEFAULT (datetime('now')),
      UNIQUE(challenge_id, user_id)
    );
  `)
}

// ── 幂等迁移：旧库补列（ALTER TABLE 不重复执行）──
function migrateColumns(db) {
  const tableColumns = {}
  const ensure = (table, col, ddl) => {
    if (!tableColumns[table]) {
      tableColumns[table] = db
        .prepare(`PRAGMA table_info(${table})`)
        .all()
        .map((c) => c.name)
    }
    if (!tableColumns[table].includes(col)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`)
      tableColumns[table].push(col)
      console.log(`[migrate] ${table}.${col} 已补充`)
    }
  }
  ensure('food_items', 'source', "source TEXT DEFAULT 'seed'")
  ensure('challenge_participants', 'streak_days', 'streak_days INTEGER DEFAULT 0')
}

// ── 幂等种子数据（仅当对应表为空时插入；业务数据可被前端随时增删）──
const SEED_FOODS = [
  ['米饭', '主食', 116, 2.6, 25.9, 0.3, '1 碗(150g)'],
  ['馒头', '主食', 223, 7.0, 47.0, 1.1, '1 个(100g)'],
  ['面条', '主食', 137, 4.5, 28.0, 0.6, '1 碗(150g)'],
  ['全麦面包', '主食', 246, 10.0, 41.0, 3.5, '1 片(35g)'],
  ['燕麦粥', '主食', 68, 2.4, 12.0, 1.4, '1 碗(200g)'],
  ['玉米', '主食', 112, 4.0, 22.8, 1.2, '1 根(200g)'],
  ['红薯', '主食', 90, 1.6, 20.7, 0.1, '1 个(150g)'],
  ['鸡蛋', '蛋奶', 144, 13.3, 2.8, 8.8, '1 个(50g)'],
  ['牛奶', '蛋奶', 54, 3.0, 3.4, 3.2, '1 杯(250ml)'],
  ['酸奶', '蛋奶', 72, 2.5, 9.3, 2.7, '1 杯(100g)'],
  ['豆浆', '蛋奶', 31, 3.0, 1.2, 1.6, '1 杯(250ml)'],
  ['鸡胸肉', '肉蛋', 133, 24.6, 0.6, 3.6, '100g'],
  ['牛肉', '肉蛋', 125, 20.2, 1.2, 4.2, '100g'],
  ['猪里脊', '肉蛋', 155, 20.2, 0.7, 7.9, '100g'],
  ['三文鱼', '海鲜', 208, 20.0, 0.0, 13.4, '100g'],
  ['基围虾', '海鲜', 101, 18.2, 1.4, 1.4, '100g'],
  ['豆腐', '豆制品', 82, 8.1, 4.2, 3.7, '100g'],
  ['西兰花', '蔬菜', 34, 2.8, 6.6, 0.4, '100g'],
  ['西红柿', '蔬菜', 18, 0.9, 3.9, 0.2, '1 个(150g)'],
  ['黄瓜', '蔬菜', 15, 0.7, 3.6, 0.1, '1 根(150g)'],
  ['胡萝卜', '蔬菜', 39, 1.0, 8.8, 0.2, '1 根(100g)'],
  ['土豆', '蔬菜', 76, 2.0, 17.2, 0.2, '1 个(150g)'],
  ['生菜', '蔬菜', 13, 1.3, 2.0, 0.3, '100g'],
  ['苹果', '水果', 52, 0.3, 13.7, 0.2, '1 个(200g)'],
  ['香蕉', '水果', 93, 1.4, 22.0, 0.2, '1 根(120g)'],
  ['橙子', '水果', 47, 0.9, 11.8, 0.1, '1 个(150g)'],
  ['葡萄', '水果', 69, 0.7, 18.1, 0.2, '100g'],
  ['西瓜', '水果', 30, 0.6, 6.8, 0.1, '100g'],
  ['花生', '坚果', 574, 24.8, 21.7, 44.3, '10 粒(12g)'],
  ['核桃', '坚果', 654, 15.2, 13.7, 65.2, '1 个(6g)'],
  ['橄榄油', '油脂', 884, 0.0, 0.0, 100.0, '1 勺(10ml)'],
  ['可乐', '饮品', 43, 0.0, 10.6, 0.0, '1 罐(330ml)'],
  ['橙汁', '饮品', 45, 0.7, 10.4, 0.2, '1 杯(250ml)'],
  ['啤酒', '饮品', 43, 0.4, 3.6, 0.0, '1 听(330ml)'],
  ['红烧牛肉面', '中式快餐', 290, 9.6, 42.0, 8.8, '1 碗(350g)'],
  ['汉堡', '西式快餐', 295, 16.9, 27.0, 13.5, '1 个(180g)'],
  ['披萨', '西式快餐', 266, 11.0, 33.0, 10.0, '1 片(120g)'],
  ['薯条', '西式快餐', 312, 3.4, 41.0, 15.0, '1 份(100g)'],
  ['煎饼果子', '中式快餐', 325, 9.8, 42.0, 12.5, '1 套(200g)'],
  ['包子', '中式快餐', 227, 7.5, 40.0, 4.5, '1 个(80g)'],
  ['饺子', '中式快餐', 253, 8.5, 36.0, 7.8, '10 个(200g)'],
  ['鸡胸肉沙拉', '轻食', 156, 22.0, 9.0, 3.6, '1 份(300g)'],
  ['牛油果鸡肉沙拉', '轻食', 238, 18.0, 12.0, 13.0, '1 份(320g)']
]

const SEED_CONTENTS = [
  {
    type: 'recipe', title: '牛油果鸡肉沙拉', summary: '高蛋白轻食沙拉，减脂期午餐优选', cover_icon: '🥗',
    author: '食刻营养师', calories: 382, protein_g: 32, carbs_g: 18, fat_g: 20,
    ingredients: JSON.stringify(['鸡胸肉 150g', '牛油果 半个', '生菜 100g', '圣女果 5 个', '橄榄油 5ml', '柠檬汁 少许']),
    steps: JSON.stringify(['鸡胸肉煎熟切块', '生菜圣女果洗净摆盘', '加入牛油果与鸡胸肉', '淋橄榄油与柠檬汁拌匀'])
  },
  {
    type: 'recipe', title: '番茄虾仁意面', summary: '低脂高蛋白，番茄酸甜开胃', cover_icon: '🍝',
    author: '食刻营养师', calories: 455, protein_g: 28, carbs_g: 62, fat_g: 9,
    ingredients: JSON.stringify(['意面 80g', '虾仁 120g', '番茄 2 个', '洋葱 半个', '蒜 2 瓣', '橄榄油 5ml']),
    steps: JSON.stringify(['意面煮熟过凉水', '虾仁煎至变色', '番茄洋葱炒出汁', '加入意面虾仁翻炒调味'])
  },
  {
    type: 'recipe', title: '低脂版宫保鸡丁', summary: '少油少糖，不减风味', cover_icon: '🍗',
    author: '食刻营养师', calories: 318, protein_g: 30, carbs_g: 22, fat_g: 12,
    ingredients: JSON.stringify(['鸡胸肉 200g', '黄瓜 半根', '胡萝卜 半根', '花生 10g', '生抽 1 勺', '零卡糖 少许']),
    steps: JSON.stringify(['鸡丁腌制 15 分钟', '黄瓜胡萝卜切丁', '少油炒鸡丁至变色', '加入配菜与料汁收汁'])
  },
  {
    type: 'article', title: '减脂期蛋白质到底怎么吃', summary: '吃够蛋白质，减脂不挨饿的科学依据', cover_icon: '🥩',
    author: '食刻科普', views: 12800,
    body: '蛋白质能提高饱腹感、维持肌肉量、提高食物热效应。减脂期建议每日蛋白质摄入 1.2~1.6g/kg 体重，优先选择鸡胸肉、鱼虾、蛋奶与豆制品，均匀分配到三餐。'
  },
  {
    type: 'article', title: '晚餐吃得少，真的能瘦吗？', summary: '节食式晚餐可能适得其反', cover_icon: '🌙',
    author: '食刻科普', views: 9620,
    body: '长期过度压低晚餐热量会导致基础代谢下降与夜间暴食。更稳妥的做法是晚餐吃到七分饱，选择高纤维蔬菜 + 优质蛋白 + 适量粗粮，并在睡前 3 小时完成进食。'
  },
  {
    type: 'article', title: '轻食不等于吃草：科学搭配指南', summary: '一份合格的轻食应该怎么搭', cover_icon: '🥑',
    author: '食刻科普', views: 15430,
    body: '合格轻食 = 优质蛋白 + 足量蔬菜 + 慢碳水 + 适量优质脂肪。推荐比例：蔬菜占 1/2，蛋白占 1/4，主食占 1/4，再搭配 10g 左右坚果或半个牛油果补充好脂肪。'
  }
]

const SEED_CHALLENGES = [
  {
    name: '夏季轻食挑战',
    start_date: '2026-07-15',
    end_date: '2026-08-04',
    tasks: JSON.stringify([
      { name: '每日拍照记录一餐', target: 21 },
      { name: '连续 7 天不超标', target: 7 },
      { name: '分享 3 道轻食食谱', target: 3 }
    ]),
    points: 210
  }
]

function seedIfEmpty(db) {
  const foodCount = db.prepare('SELECT COUNT(*) c FROM food_items').get().c
  if (foodCount === 0) {
    const ins = db.prepare(
      'INSERT INTO food_items (name, category, calories, protein_g, carbs_g, fat_g, unit_desc) VALUES (?,?,?,?,?,?,?)'
    )
    const tx = db.transaction((rows) => {
      for (const r of rows) ins.run(...r)
    })
    tx(SEED_FOODS)
    console.log(`[seed] food_items 已初始化 ${SEED_FOODS.length} 条`)
  }

  const contentCount = db.prepare('SELECT COUNT(*) c FROM contents').get().c
  if (contentCount === 0) {
    // 归一化：保证 INSERT 所有命名参数都存在（食谱缺 views、文章缺营养字段时补默认）
    const BASE = { views: 0, calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, ingredients: null, steps: null, body: null }
    const rows = SEED_CONTENTS.map((r) => ({ ...BASE, ...r }))
    const ins = db.prepare(
      `INSERT INTO contents (type, title, summary, cover_icon, author, views, calories, protein_g, carbs_g, fat_g, ingredients, steps, body)
       VALUES (@type, @title, @summary, @cover_icon, @author, @views, @calories, @protein_g, @carbs_g, @fat_g, @ingredients, @steps, @body)`
    )
    const tx = db.transaction((list) => {
      for (const r of list) ins.run(r)
    })
    tx(rows)
    console.log(`[seed] contents 已初始化 ${rows.length} 条`)
  }

  const challengeCount = db.prepare('SELECT COUNT(*) c FROM challenges').get().c
  if (challengeCount === 0) {
    const ins = db.prepare(
      'INSERT INTO challenges (user_id, name, start_date, end_date, tasks, points) VALUES (NULL, @name, @start_date, @end_date, @tasks, @points)'
    )
    const tx = db.transaction((rows) => {
      for (const r of rows) ins.run(r)
    })
    tx(SEED_CHALLENGES)
    console.log(`[seed] challenges 已初始化 ${SEED_CHALLENGES.length} 条`)
  }
}

function getDb() {
  if (dbInstance) return dbInstance
  const dir = path.dirname(DB_PATH)
  const fs = require('fs')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  dbInstance = new Database(DB_PATH)
  dbInstance.pragma('journal_mode = WAL')
  dbInstance.pragma('foreign_keys = ON')
  initSchema(dbInstance)
  migrateColumns(dbInstance)
  seedIfEmpty(dbInstance)
  return dbInstance
}

function closeDb() {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

if (process.argv.includes('--init')) {
  const db = getDb()
  console.log(`数据库就绪: ${DB_PATH}`)
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all()
    .map((t) => t.name)
  console.log('数据表:', tables.join(', '))
  const foods = db.prepare('SELECT COUNT(*) c FROM food_items').get().c
  const contents = db.prepare('SELECT COUNT(*) c FROM contents').get().c
  const challenges = db.prepare('SELECT COUNT(*) c FROM challenges').get().c
  console.log(`种子数据: foods=${foods} contents=${contents} challenges=${challenges}`)
  closeDb()
}

module.exports = { getDb, closeDb, DB_PATH }
