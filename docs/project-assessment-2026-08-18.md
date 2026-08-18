# 食刻（FoodCalorie）项目全面评估报告

- 评估日期：2026-08-18
- 评估基线：`main @ 21420a7`（本地 / GitHub / Codeup / 生产四端一致）
- 评估方式：双 Agent 深度代码审查（后端 37 文件 + 前端全部页面）+ 构建/测试/依赖实测

---

## 一、项目概览

| 维度 | 数据 |
| --- | --- |
| 后端 | Express 4.22 + SQLite（better-sqlite3 12.11）+ JWT，9 模块 / 23 条路由 / ~2469 行 |
| 前端 | Vite 8 + React 18 + Router v7，31 页面 / ~4245 行 / Capacitor APK（com.shike.app） |
| 测试 | 后端单测 45 用例（node --test）+ 前端 vitest 14 用例 + 16 个 E2E 脚本（含生产 7 项断言） |
| 依赖安全 | `npm audit` 前后端均 **0 漏洞** |
| CI | 4 job 全绿（security / backend / frontend / android-debug），Node 24 + JDK 21 |
| 生产 | https://foodcalorie.gakiwoo.com（PM2 :3001 + nginx 静态），已稳定运行 |

---

## 二、问题清单（按风险等级）

### P0（安全漏洞 / 数据损坏 / 崩溃）— 无

前后端审查均未确认 P0 级问题。已验证防护：IDOR 越权、SQL 注入、路径遍历、上传魔数校验、CSV 行首公式注入、xss（无 dangerouslySetInnerHTML）、密钥不落盘。

### P1（功能错误 / 潜在崩溃）— 4 项（全部前端）

| # | 位置 | 问题 | 影响 |
| --- | --- | --- | --- |
| 1 | `frontend/FoodCalorie-RecordsMonth.jsx:80` | `const isToday = date === todayStr`：`date` 为 `MM-DD` 字符串，`todayStr` 是**函数引用**，比较恒 false | 月视图「今天」格子永不高亮，今日标识失效 |
| 2 | `frontend/FoodCalorie-Home.jsx:113`、`FoodCalorie-Today.jsx:131` | `r.record_time.slice(11,16)` 无空值防护（Records.jsx 有防护，写法不一致） | 后端某条记录缺 `record_time` 时整页崩溃 |
| 3 | `frontend/src/api/client.js:149` | `tokenStore.set` 全库无调用 → localStorage 恒空 → `hadSession` 恒 false →「曾登录但会话过期」用户 401 后**不会**跳转登录页 | 会话失效用户被困在当前页报错，无引导 |
| 4 | `frontend/src/api/client.js:102,145` | APK WebView 下 `capacitor://localhost` 对 `https://foodcalorie.gakiwoo.com` 跨源发 `credentials:'include'`，受第三方 Cookie / SameSite 限制 | 登录态在 APK 内可能无法持久（需真机联调确认） |

### P2（次要 / 潜在风险）— 后端 12 项

| # | 位置 | 问题 | 建议 |
| --- | --- | --- | --- |
| B1 | `ai/routes.js:81` + `errorHandler.js:7` | multer 错误（>10MB、字段名错）未映射，落通用 500 | 映射为 413/400 |
| B2 | `app.js:55` + `rateLimit.js:20` | `trust proxy:'loopback'` 仅当反代与本机同回环成立；异机反代下所有用户共享同一 IP 限流桶 | 确认部署拓扑；异机时改 `trust proxy:1` 或配置真实代理 IP |
| B3 | `ai/routes.js:59` | pending 图片 1 天才清理；多账号 × 5次/min × 10MB 可占满磁盘 | 缩短清理周期或限制 pending 总量 |
| B4 | `export/service.js:22` | CSV 公式注入仅挡行首 `=+-@`，`\t`/`\r` 前缀未防护 | 补充制表符/回车前缀过滤 |
| B5 | `requireAuth.js:27` | `jwt.verify` 未显式指定 `algorithms` | 加固为 `algorithms:['HS256']` |
| B6 | `app.js:70` | 非生产环境 `origin:true` 反射任意源并携带凭据 | 生产已 fail-closed，dev 可接受；确认不误开 |
| B7 | `server.js:43` | 仅注册 SIGINT 无 SIGTERM | 补 SIGTERM 优雅关闭（WAL checkpoint） |
| B8 | `records/routes.js:27` + `profiles/routes.js:25` | body 字段 `record_time`/`birthday` 仅正则无日历校验（query 侧已修） | 复用 `isValidCnDate()` |
| B9 | `records/routes.js:46` | `page` 无上限，巨型 OFFSET 全表偏移 | 加 `page.max(10000)` |
| B10 | `imageStore.js:12-16,76` | 每次图片下载执行 `fs.mkdirSync`+`path.resolve` 同步系统调用 | 启动时 mkdir 一次 |
| B11 | `records/service.js:54`、`challengeRepo.js:44` | 死代码 `listRecords` / `updateLastCheckIn` | 删除 |
| B12 | `package.json:14` | `engines: node>=24` 与 CI/生产实际一致，但 README 曾写 Node 20 | 统一文档口径（实为 Node 24） |

### P2（次要）— 前端 10 项

| # | 位置 | 问题 | 建议 |
| --- | --- | --- | --- |
| F1 | `FoodCalorie-Settings.jsx:14,91` | 硬编码「2000 kcal」「128 条记录」 | 接真实数据 |
| F2 | `FoodCalorie-Profile.jsx:55` | 昵称 PUT 失败被 `.catch(()=>null)` 吞掉仍提示成功 | 失败时提示错误 |
| F3 | `FoodCalorie-DataExport.jsx:29,32` | 文件名 `toISOString()`（UTC）上海凌晨差一天；`a.click()` 后立即 revoke 可能中断下载 | 用本地日期；延迟 revoke |
| F4 | `FoodCalorie-CameraResult.jsx:84` / `RecordsWeek.jsx:70` / `Challenge.jsx:67` | 空 `onClick` 死代码；`stats.target*7`、`check_in_days` 无空值防护 → 可渲染 NaN | 补防护 |
| F5 | 全部页面 | `common.jsx` 的 `normalizeDailyStats` 已实现但无页面使用（仅测试） | 页面接入统一归一化 |
| F6 | Home/Camera/Search | 触控目标 <44px（设置 20px、加号 32px、相册 26px） | 放大触控区 |
| F7 | 全站 | 31 页单 bundle（JS 362KB / gzip 97KB）无代码分割 | 路由级 `React.lazy` 拆包 |
| F8 | `FoodCalorie-AddFood.jsx:290` | sticky 保存栏未加 `safe-area-inset-bottom` | 全面屏手势条遮挡风险 |
| F9 | `Notification.jsx` / `Burst` | Switch 组件三份重复实现 | 收敛到 common.jsx |
| F10 | `main.jsx:15` | StrictMode 开发/测试下 useEffect 双发请求 | E2E 连 dev 注意幂等（生产无影响） |

---

## 三、功能完整性评估

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| 认证/注册 | ✅ | 复用 gakiwoo `/api/auth`（httpOnly Cookie），登录/注册/刷新/退出闭环 |
| AI 拍照识别 | ✅ | Kimi moonshot-v1-8k-vision-preview，上传→识别→多候选→份量调整→落库 |
| 记录管理 | ✅ | 增删改查 + 日/周/月视图 + 按餐次/日期分组 + 导出 CSV/JSON |
| 食物库 | ✅ | 搜索（防抖+竞态守卫）+ 常见食物 + 自定义添加 + AI 回灌 |
| 挑战打卡 | ✅ | 参与/每日打卡/进度/积分，含窗口校验（防过期刷分） |
| 目标/偏好 | ✅ | 每日目标、饮食偏好、单位、精度设置 |
| 收藏/发现/文章 | ✅ | favorites/discover/contents 模块 |
| 统计 | ✅ | 日/周/月汇总、环形图、宏观营养占比、达标天数 |
| 多端 | ⚠️ | Web + Android APK（debug）已可用；iOS / 小程序未做真机联调 |
| 分布式 | ⚠️ | 限流为单机内存实现（写 30/min / 读 120/min），多实例需 Redis |

**结论**：核心功能闭环完整，M1-M13 里程碑功能均已落地；主要缺口在**多实例限流**与**多端真机联调**。

---

## 四、性能评估

| 维度 | 现状 | 评价 |
| --- | --- | --- |
| 前端首包 | 单 JS 362KB / gzip 97KB + CSS 74KB | 中等偏优；无代码分割是主要优化空间 |
| 图片 | 食物图懒加载/尺寸控制良好，objectURL 清理正确 | ✅ |
| 列表 | 未虚拟化（数据量小，影响低） | ✅ 当前可接受 |
| API 效率 | 无 N+1；SQLite 同步调用在请求路径，高并发有瓶颈 | ⚠️ 单实例够用，需压测确认上限 |
| 限流 | 内存滑窗，无泄漏（已验证）；单机限制 | ⚠️ 多实例需 Redis |
| 构建产物 | 生产 build 362KB JS；APK 4.9MB（debug） | ✅ |
| 后端清理 | pending 图片 1 天清理周期偏长 | ⚠️ 见 B3 |

---

## 五、代码质量评估

| 维度 | 结果 |
| --- | --- |
| ESLint | 前后端全绿（0 error 0 warning） |
| 单元测试 | 后端 45/45（服务器跑，本地 Node22 ABI 不兼容）、前端 14/14 |
| 生产 E2E | 7/7 通过（登录/记录/搜索/添加/相机/无 JS 错误） |
| 依赖审计 | 0 漏洞（前后端） |
| CI | 4 job 全配置（security/backend/frontend/android-debug） |
| 错误处理 | 统一 `{code,message,data}` + 6 段错误码；multer 错误映射缺失（B1） |
| 死代码 | 后端 2 处、前端若干（B11/F4） |
| 组件复用 | Switch 三份重复（F9）；食物卡片样式各页重复实现 |
| 文档 | README/SPEC/ASSESSMENT/报告齐全；`engines` 口径不一致（B12） |

---

## 六、构建标准对照

| 标准项 | 是否满足 | 证据 |
| --- | --- | --- |
| 生产构建（Web） | ✅ | `vite build` 成功，`index-*.js` 产出，线上已部署 |
| APK 构建（Debug） | ✅ | 昨天 `assembleDebug` 成功，`食刻-app-debug-v1.0.3.apk`（内置最新代码） |
| APK 构建（Release） | ⚠️ | keystore 在 `C:\fc-release.keystore` 但签名密码未持久化，需用户提供后构建 |
| 后端测试门禁 | ✅ | 45/45 通过 |
| 前端测试门禁 | ✅ | 14/14 通过 + 生产 E2E 7/7 |
| 依赖安全门禁 | ✅ | audit 0 漏洞 |
| CI 自动化 | ✅ | GitHub Actions 4 job 全绿 |
| 部署就绪 | ✅ | PM2 + nginx 生产运行中，四端一致 `21420a7` |
| 密钥安全 | ✅ | JWT_SECRET/Kimi key 仅存服务器 .env，`check-secrets.mjs` 门禁 |

---

## 七、总体结论

### ✅ 达到构建/发布标准（条件通过）

项目**满足发布与构建要求**：

1. **所有构建门禁通过**：Web build、APK debug、后端 45 单测、前端 14 单测 + 生产 E2E 7/7、依赖审计 0 漏洞、CI 4 job 全绿。
2. **生产已稳定运行**：线上服务健康、四端代码一致、无 P0 安全漏洞。
3. **功能闭环完整**：M1-M13 核心功能全部落地。

### ⚠️ 建议正式发布/迭代前处理（按优先级）

- **P1-1 必修**：`RecordsMonth` 今日高亮失效（一行修复）；Home/Today 的 `record_time` 空值防护（一行修复）。
- **P1-2 建议**：401 会话失效跳转逻辑（`hadSession` 恒 false）；APK 登录态持久化需**真机联调**验证。
- **P2 批次**：multer 错误码映射、CSV `\t\r` 注入、JWT algorithms 加固、SIGTERM、body 日期校验（约半天工作量，可并入下次修复轮）。

### 风险摘要

| 级别 | 数量 | 说明 |
| --- | --- | --- |
| P0 | 0 | 无安全/数据损坏级问题 |
| P1 | 4 | 2 个崩溃防护 + 1 个功能失效 + 1 个 APK 待验证 |
| P2 | 22 | 12 后端 + 10 前端，多为加固与优化项 |

> 结论：**可以发布**；建议在下一个版本迭代中优先修复 2 个 P1 崩溃防护问题（成本极低），并规划真机联调与 Redis 限流。
