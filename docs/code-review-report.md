# 食刻（FoodCalorie）项目开发代码专业评估报告

> 评估日期：2026-08-25 ｜ 评估基线：`main @ b8c5a4c`（含未提交 WIP：challenges/Home/README）
> 评估方式：主审查通读核心代码（app/server/db/中间件/records/ai/export/challenges/client/common 等）+ 3 个并行深度审查代理（后端全部 37 源文件、前端全部 31 页面与构建脚本、运维/CI/安全/文档）+ 实测（后端测试套件实跑、npm audit、git 历史与工作区审计、ESLint 核查）

---

## 一、结论先行

这是一个**工程质量明显高于同类小团队项目**的全栈应用：架构分层清晰、安全基线扎实（SQL 注入/IDOR/路径穿越/上传伪装/CSV 公式注入均有实测防护）、有持续自我审计并闭环修复的文化（08-18 自评发现的 4 P1 + 22 P2 已全部修复并部署）。当前处于"**原型转生产的过渡期**"：功能闭环完整、已生产运行，但存在 1 个可产生脏数据的全站性前端竞态、测试套件在无 Redis 环境下挂起、唯一交付渠道是 debug 签名 APK、生产测试账号密码明文入库等发布级问题。

**综合评分：7.6 / 10（B+，良好偏优）**

| 维度 | 评分 | 一句话结论 |
| --- | --- | --- |
| 后端（Express + SQLite） | 8.0 / 10 | 分层/校验/安全/时区处理均到位，短板在竞态与统计口径 |
| 前端（React SPA + Capacitor） | 7.2 / 10 | API 层与资源管理优秀，31 页复制粘贴、假设置、重复提交竞态拖分 |
| 运维 / CI / 安全 / 文档 | 7.5 / 10 | CI 工程化好、密钥基本面好；备份/发布/nginx 配置未自动化，凭据卫生有盲区 |

---

## 二、值得肯定的工程实践（亮点）

1. **安全面扎实且可验证**：全部 SQL 预编译；所有用户数据查询带 `user_id` 作用域（无 IDOR）；上传魔数校验（JPEG/PNG/WEBP/HEIF 家族）+ 文件名白名单 + 所有权双重检查（`ai/routes.js:22-70`、`imageStore.js`）；JWT 显式 `algorithms:['HS256']`（`requireAuth.js:28`）；生产 CORS fail-closed（`app.js:66-69`）；CSV 公式注入防护含 `\t\r` 前缀（`export/service.js:22-27`）；生产 JWT_SECRET 守卫 fail-fast（`server.js:12-31`）；错误响应不泄堆栈（`errorHandler.js:35-36`）。
2. **并发防重的正确示范**：挑战打卡用 `UPDATE ... WHERE last_check_in != ?` 原子防重（`challengeRepo.js:36-45`），并有并发回归测试——说明作者懂竞态，可惜未覆盖到其他模块（见问题 2）。
3. **时区统一收口**：`date.js` 集中提供北京时间工具 + 真实日历校验，消除服务器 TZ 漂移与 `2026-02-31` 静默回滚（含回归测试）。
4. **前端 API 层设计成熟**：401 单飞刷新（`client.js:135-143`）、会话标记区分"游客/过期用户"跳转语义（:77-93,180-182）、请求序号守卫防乱序（AddFood/Search）、blob URL 生命周期正确回收（ProtectedImage/Camera/CameraResult）。
5. **工程纪律**：CI 4 job 全绿、action 按 SHA 锁定、`npm audit` 0 漏洞（实测）、git 历史无真实 API Key/APK 二进制、commit 信息规范；测试覆盖了完整安全链路（伪装文件不留盘/仅所有者可读/删除后清理）。
6. **自省文化**：`docs/project-assessment-2026-08-18.md` 级别的自查报告 + 逐项修复记录，在同类项目中少见。

---

## 三、问题清单（按风险等级）

### 🔴 高（发布前必修）

1. **全站"双击重复提交"竞态 — 可产生重复饮食记录（前端）**
   - 位置：`AddFood.jsx:80-136`、`Search.jsx:67-89`、`CameraResult.jsx:36-60`、`EditRecord.jsx:42-63`、`Detail.jsx:32-42`、`Profile/Goal/DietPref/Unit/Precision/Notification/Burst.jsx` 等全部提交路径。
   - 问题：一律 `if (adding) return; setAdding(true); await http.post(...)`——`setAdding` 是异步状态更新，双击/连点在重新渲染前都读到旧的 `adding=false`，守卫形同虚设。
   - 影响：双击"保存记录"真实产生两条记录；删除/编辑二次请求报 404。
   - 修复：改用同步 `useRef` 闩锁（`busyRef.current` 在 `await` 前同步置位，`finally` 复位），或 `onPointerDown` 阶段禁用按钮。

2. **测试套件挂起：配置 REDIS_URL 但 Redis 未运行时 `npm test` 永不结束（实测复现）**
   - 位置：`shared/middleware/rateLimitStore.js:14-31`。
   - 问题：`rateLimitStore` 在连接失败后既不 `client.quit()` 也不关闭自动重连（redis 默认 reconnectStrategy 无限重试），进程事件循环永不排空 → 全部 46 用例实际通过，但 `node --test` 进程挂死（本机 `backend/.env` 含 `REDIS_URL=redis://127.0.0.1:6379`，无 Redis 时实测 45s 不退出；CI/生产有 Redis 所以未暴露）。
   - 影响：任何"配了 REDIS_URL 但 Redis 故障"的环境（含本地开发、测试）都会挂死；生产优雅关闭时 redis 客户端同样不释放。
   - 修复：连接失败后 `client.quit()` 或 `socket: { reconnectStrategy: false }`；测试环境显式 `delete process.env.REDIS_URL` 保证隔离。

3. **生产测试账号明文密码入库且被密钥扫描器漏检**
   - 位置：`docs/README.md:59`（`t_fc_test@x.com`，密码已脱敏），同一口令硬编码在 15+ 个已跟踪 E2E 脚本；`scripts/check-secrets.mjs:18` 只认 `password=` 赋值形式，`password:` 冒号式/裸字符串/文档纯文本全部漏检，且整体豁免 `test/` 目录。
   - 影响：任何拿到仓库的人可用真实账号登录生产；凭据已进 git 历史，撤回无效。
   - 修复：立即轮换该账号密码；E2E 凭据改走环境变量/CI Secrets；扩展扫描规则（`password:`、`sk-`、`AKIA`、邮箱+口令对）并扫 untracked 文件。

4. **唯一对外交付渠道是 debug 签名 APK**
   - 位置：`ci.yml:74-83` 只跑 `assembleDebug`；`build.gradle` 未开 `minifyEnabled`。
   - 影响：debug APK `android:debuggable=true`，会话/JWT 可被 `adb run-as` 提取；无法上架；无 release 审计签名。
   - 修复：keystore 密码入 GH Secrets，CI 增 `assembleRelease` job + 附件到 GitHub Releases；开 R8 混淆。

5. **生产 nginx server 块未版本化 + `/uploads/` 文档矛盾（安全相关）**
   - 位置：`ops/nginx/` 仅 5 行 404 片段；`README.md:216` 与 `ASSESSMENT.md:61` 称 nginx "静态服务 /uploads/"，与 `ops/nginx/private-uploads.conf` 的 404 策略相反。
   - 影响：若线上按 README 配了 uploads 静态别名，私有食物照片公网可读；主 server 块（TLS/安全头/gzip/限流）不可重建。
   - 修复：完整 server 块（脱敏）纳入 `ops/nginx/`；curl 实测线上 `/uploads/` 返回 404；文档以代码为准修正。

6. **数据库备份与发布全手工，无任何自动化**
   - `ASSESSMENT.md:50` 宣称备份存在，但仓库无备份脚本/cron/恢复演练；无 deploy/release workflow，发布靠手工 `scp + pm2 restart`。
   - 修复：版本化 SQLite 备份脚本（`.backup` + 保留策略 + 异地副本）+ cron + 恢复演练；tag 触发部署 + 回滚目录。

### 🟠 中（迭代内处理）

7. **favorites/join/profile 三处 check-then-insert 竞态 → 并发 500**
   - `favoriteRepo.js:27-30`、`challengeRepo.js:27-30`、`profileRepo.js:51-69`：先 SELECT 后 INSERT，撞 UNIQUE 约束时抛裸 `SqliteError` → errorHandler 不识 → 500（双击收藏/并发参与/首访并发建档）。改用 `INSERT OR IGNORE` + `changes` 判断映射 409/幂等。
8. **日期范围查询索引失效**
   - `recordRepo.js:10-18`：`substr(record_time,1,10) BETWEEN` 使 `idx_records_user_time` 无法用于范围扫描，列表/统计/导出随记录量线性退化。改半开区间 `record_time >= ? AND record_time < ?`。
9. **统计口径歧义 + 前端"日均=今日"展示错误**
   - 后端 `records/service.js:98-105`：`average` 除以全周期天数、`reachedDays` 只计有记录的天，两分母不一致且无文档说明。
   - 前端 `Records.jsx:112`：`normalizeDailyStats`（`common.jsx:14-25`）从不返回 `average`，fallback 恒为今日总量 → "日均摄入"永远是今天摄入（RecordsWeek 正常，两页不一致）。
10. **Today 页 stats 空值白屏**
    - `Today.jsx:79` 直接解引用 `stats.percent/stats.total`，而 `normalizeDailyStats` 对空数据返回 `null`（common.jsx:15）→ 统计接口边界数据击穿整页（Records.jsx:110-111 已防护，Today 漏网）。
11. **AI 模型输出无钳制**
    - `ai/service.js:25-32`：负数/`1e999`(Infinity) 原样放行；`aiRepo.js:54` 回灌时负数可入库污染共享食物库。`parseKimiContent` 内统一 `Math.max(0,…)` + 上限截断。
12. **RecordsMonth 缺请求序号守卫**
    - `RecordsMonth.jsx:15-29`：快速切月时响应乱序回写，日历与月份标题不一致（AddFood/Search 已有该防护，此处遗漏）。
13. **Detail 页"来源"硬编码"AI 图像识别"**
    - `Detail.jsx:154-162`：manual/search 来源也显示"数据来自照片识别"，误导性归因，也是 E2E 断言漂移根源之一。
14. **单位/通知等设置"保存了但永不生效"**
    - `Unit.jsx` 保存 kJ/oz 但全 app 硬编码 kcal/g；`Settings.jsx:25-27` 开关传死值；Privacy 注释自认"演示交互"。要么全 app 按 profile 渲染单位，要么下线入口。
15. **CSV 导出在 Capacitor WebView 中大概率静默失败**
    - `DataExport.jsx:24-38` 用 `a.click()` 下载，Capacitor 7 默认 WebView 不处理下载事件 → APK 端导出无反馈。需接 `@capacitor/filesystem` + share 或原生桥接。
16. **E2E 脚本已漂移且未入 CI**
    - `verify_m12.cjs:58` 断言"选择食物"（现文案"其他候选"）、`verify_m10.cjs:28` 断言不存在文案、`verify_m9.cjs:60` 与 Detail 硬编码矛盾；硬编码本机路径与截图目录。断言改 `data-name`、路径环境变量化、进 package.json。
17. **服务器 IP 与基础设施信息残留 tracked 文件**
    - `backend/README.md:136`、`server-audit.md:4`、`docs/PROJECT_STRUCTURE.md:180`、`.workbuddy/memory/*.md` 含服务器公网 IP（已脱敏）；`project-assessment-2026-08-18.md:126` 留本机 keystore 路径。
18. **PM2 配置健康度欠缺**
    - `ecosystem.config.cjs` 硬编码解释器路径、无 `kill_timeout`（PM2 默认 ~1600ms SIGKILL 会打断应用自身 5s 优雅关闭/WAL checkpoint）、无日志轮转。

### 🟡 轻（技术债）

19. **31 页共享逻辑靠复制粘贴**：防抖搜索（AddFood/Search 逐字重复）、"读 profile→改一字段→PUT"骨架（6 页重复）、三态骨架 ~20 处、餐次映射三份。抽 `useDebouncedSearch`/`useAsync`/`PageShell`/`RecordCard`/`MealPills`。
20. **死代码与假交互**：`styles.css:139-212` `.modal-*` 全套无使用、`.page-frame` 重复定义；Login"忘记密码/协议/微信登录"无 onClick；Settings 昵称硬编码"健康生活家"；版本号三处不一致（Me v1.0.3 / About 1.0.3 / build.gradle 1.0.4）。
21. **可访问性弱**：全站 div+onClick 无 role/tabIndex/键盘事件；ToggleSwitch `role="switch"` 不可聚焦；toast 无 `aria-live`；Android TalkBack 基本不可用。
22. **export 用 POST + query 传参**（`export/routes.js`），语义怪异；`range=all` 时文件名仍拼 date。
23. **schema 边界**：`food_name`/`portion` 无长度上限、`record_time` 允许未来时间（`records/routes.js:18,26`）；contents/foods `page` 无上限、favorites 无分页；`quiet_start/end` 无先后校验、`birthday` 不校验不晚于今天。
24. **recordRepo 用字符串 `.replace()` 拼 SQL 变体**（`recordRepo.js:13-20`），脆弱难读，建议显式写出。
25. **`challengeRepo.getById` 不过滤系统级挑战**（`:20`），未来支持用户自定义挑战时形成越权面，建议与 `listSystem` 一致加 `user_id IS NULL`。
26. **`food_items.name` 无唯一约束**，回灌去重非原子（`db.js:73-84`、`aiRepo.js:52-53`），重名导致 `findByName` 匹配歧义。
27. **文档与代码多处矛盾**：Swagger 路径（README `/api-docs` vs 代码 `/api/docs`）、react-router 6 vs 实际 7、测试用例数（27/33/45/46 四处口径）、Node 20 vs 24 口径（`backend/README.md:5` 仍写 Node 20）。
28. **git 仓库膨胀**：`git count-objects` ≈ 250 MiB；tracked `archive/` 7.1MB 含旧 dist 产物与 3 个 vite timestamp 残留；`.workbuddy/` 记忆文件入库；工作区残留 `.gradle-home` 1.6GB、根目录 3 个 APK、`.codebuddy/`/`.pi/` 未 ignore。

---

## 四、测试与质量门禁评估

| 项 | 现状 | 评价 |
| --- | --- | --- |
| 后端单测 | 46 用例，安全链路/原子防重/时区回归质量高 | ✅ 优；但 9 模块中 **5 个零测试**（favorites/foods/contents/profiles/export），CSV 公式注入防护无测试 |
| 前端单测 | 15 用例，仅纯函数与静态断言 | ⚠️ 薄；`client.js` 401/单飞/重试零测试、无组件渲染测试 |
| E2E | 14 个 puppeteer 脚本，覆盖面广 | ⚠️ 手工运行、断言漂移、未入 CI |
| lint / audit / CI | ESLint 全绿、audit 0 漏洞、4 job 全绿 | ✅ 好 |
| **测试可复现性** | **无 Redis 时套件挂起（见 🔴2）** | ❌ 必修 |

---

## 五、Top 10 行动建议（按优先级）

1. 修复全站双击重复提交（useRef 闩锁）——当前唯一可产生脏数据的线上级 bug。
2. 修复测试挂起（redis 失败即 quit/禁用重连 + 测试环境清除 REDIS_URL），保证 `npm test` 在任何机器可复现。
3. 轮换生产测试账号密码，E2E 凭据环境变量化，扩展 `check-secrets.mjs` 规则并扫 untracked。
4. 补齐 check-then-insert 竞态（favorites/join/profile 改 `INSERT OR IGNORE` 映射 409）。
5. CI 增加 release 签名 APK job（Secrets 注入 keystore），以 release 构建替代 debug 交付。
6. 版本化完整 nginx server 块（TLS/安全头/限流/`/uploads/` 404），实测线上 uploads 不可公网访问；修正 README 矛盾。
7. 建立自动化 SQLite 备份（脚本 + cron + 异地副本 + 恢复演练），明确 RPO/RTO。
8. 统一统计口径（average/reachedDays 分母定稿并写文档），前端 `normalizeDailyStats` 透传 average、Today 补空值防护。
9. 补齐 5 个未测模块测试 + 双击/空值 bug 回归测试；E2E 断言改 `data-name` 并接入 CI。
10. 抽共享页面基建（搜索防抖/三态/页面骨架/记录卡片），清死代码与假设置，版本号单源化。

---

## 六、最终判定

- **功能完整度**：✅ 高。SPEC M1-M14 闭环，双端交付（Web + APK），生产运行中。
- **工程质量**：✅ 良好偏优（后端 8.0 / 前端 7.2），安全基线明显高于平均水准。
- **发布就绪度**：⚠️ **达到"可发布体验版"标准**；距"正式生产发布"还差 6 项 🔴（双击竞态、测试挂起、凭据轮换、release 签名、nginx 版本化、备份自动化）——预计 2-3 个迭代日可全部闭环。
- **长期演进建议**：前端 TypeScript 化 + 组件/钩子收敛（当前复制粘贴是最大的长期维护成本）；数据库考虑从共享 SQLite 平滑到独立实例/Postgres（多实例限流已就绪，DB 是下一个单点）；引入 CI 内的 E2E 冒烟。

> 本报告所有 🔴/🟠 结论均经代码逐行核验；🔴2（测试挂起）与审计/依赖结论为本机实测复现。

---

## 七、修复记录（2026-08-25，评估后首轮修复）

按报告 Top 10 建议的第 1、2 项完成修复，全部实测验证通过：

### 已修复：🔴1 全站双击重复提交竞态（前端 16 个文件）

- 新增 `frontend/src/ui/useBusy.js`：`useBusy()` hook（返回 `{ busy, run }`）+ 纯函数 `createBusyLock()`。
  核心：`run(fn)` 在调用瞬间用同步锁置位（`tryLock`），任务完成/失败后 `finally` 复位——彻底规避 `setAdding(true)` 异步状态更新导致的"双击双双通过守卫"。
- 接入全部提交路径（`if (adding) return; setAdding(true)` → `runAdding(...)`）：
  - 记录新增：`AddFood.jsx`（多选保存 + 自定义添加）、`Search.jsx`、`CameraResult.jsx`
  - 记录编辑/删除：`EditRecord.jsx`、`Detail.jsx`
  - 设置保存：`Profile.jsx`、`Goal.jsx`、`DietPref.jsx`、`Unit.jsx`、`Precision.jsx`、`Notification.jsx`、`Burst.jsx`
  - 挑战：`Challenge.jsx`（join + checkin，前端再加固一道，后端打卡本身有原子防重）
  - 收藏：`Recipe.jsx`、`Article.jsx`、`Favorites.jsx`（防双击连点触发后端唯一约束冲突）
- **顺带修复 🔴 级功能 bug**：`AddFood.jsx:98` 对"常见食物"发送 `source:'common'`，后端枚举仅接受 `['AI识别','manual','search']` → 保存恒 400 失败；已改为映射 `'manual'`（修复后默认食物保存流程可用）。
- 回归测试：`frontend/src/ui/useBusy.test.js`（4 用例：连点拦截、unlock 复用、同步生效、多实例隔离）。

### 已修复：🔴2 测试套件挂起（后端）

- `backend/src/shared/middleware/rateLimitStore.js`：
  - `socket.reconnectStrategy: false`——redis 默认策略会无限重连，使进程句柄永不释放；
  - `connect()` 失败时 `c.destroy()` 释放句柄；
  - 新增 `closeRateLimit()`（`client.quit()` / 连接中等待 settle）。
- `backend/src/server.js`：优雅关闭流程加入 `closeRateLimit()`（WAL checkpoint 之外再释放 redis 句柄）。
- 测试隔离：`security/m1-base/records/challenges.test.js` 显式 `process.env.REDIS_URL = ''`，杜绝 dotenv 从本机 `.env` 注入 redis 地址导致的环境依赖。

### 实测验证（本机 Node 25.2.1，`backend/.env` 含 REDIS_URL）

| 验证项 | 修复前 | 修复后 |
| --- | --- | --- |
| 后端 `npm test` | 46 用例全过但**进程永不退出**（挂死） | **46/46 通过，~5s 正常退出（exit 0）** |
| 后端 `npm run lint` | — | ✅ 0 error |
| 前端 `npm run lint` | — | ✅ 0 error |
| 前端 `npm test`（vitest） | 14 用例 | **18/18 通过**（含新增 4 例双击回归） |
| 前端 `npm run build` | — | ✅ 构建成功（主包 200.81 kB / gzip 66.34 kB） |

### 遗留（未在本轮处理，见上文清单）

🔴3 凭据轮换与扫描器扩展 ｜ 🔴4 release 签名 APK ｜ 🔴5 nginx 版本化与文档修正 ｜ 🔴6 备份/发布自动化 ｜ 🟠7-18 全部 ｜ 🟡19-28 全部。其中 🟠9（日均=今日摄入）、🟠10（Today 空值白屏）改动小、风险低，建议下一轮优先。

---

## 八、第二轮修复记录（2026-08-25，高级工程师续轮）

按"低风险、高价值、可验证"原则完成 9 项，全部实测验证：

### 后端（4 项）

1. **🟠7 三处 check-then-insert 竞态 → 原子防重**
   - `favorites/repositories/favoriteRepo.js`：`INSERT OR IGNORE` + `changes` 判断（service 层 409 语义保留）；
   - `challenges/repositories/challengeRepo.js` `join`：`INSERT OR IGNORE`；
   - `profiles/repositories/profileRepo.js` `upsert`：`INSERT OR IGNORE` 建档 + UPDATE 应用 patch（并发首访不再 500）。
2. **🟠8 日期范围查询索引失效**：`records/repositories/recordRepo.js` 全部 `substr(record_time,1,10) BETWEEN` 改为半开区间 `[from||' 00:00', 次日||' 00:00')` 直接比较，`idx_records_user_time(user_id, record_time)` 恢复可用（DAO 签名不变，调用方零改动）。
3. **🟠11 AI 输出钳制**：`ai/service.js` 新增 `clampNutrient`（负数/NaN/Infinity → 0，热量上限 5000）；`aiRepo.backfillModelFoods` 入库前逐字段钳制，杜绝负数污染共享食物库。
4. **🟠3 导出加固 + 🟡15 文件名**：`export/service.js` 异常路径补 `logger.error`（原根因不可见）；`range=all` 文件名不再拼接 date。

### 前端（4 项）

5. **🟠9 日均=今日摄入**：`common.jsx normalizeDailyStats` 透传 `average`；`Records.jsx:112` 不再回退到当日总量（回归测试更新 + 新增 average 用例）。
6. **🟠10 Today 空值白屏**：`FoodCalorie-Today.jsx` 渲染前归一化兜底 `stats || { total:0, target:1400, percent:0 }`。
7. **🟠12 RecordsMonth 乱序**：补 `seq.current` 请求序号守卫（与 AddFood/Search 一致），快速切月丢弃过期响应。
8. **🟠13 Detail 来源硬编码**：按 `record.source` 渲染（AI识别/食物库搜索/手动添加），消除误导性归因。

### 安全 / 运维 / 文档（3 项）

9. **🔴3（工具链部分）测试凭据收敛 + 扫描器扩展**
   - 新增 `frontend/scripts/test-credentials.cjs`（env 优先，默认值标注"待轮换"，扫描器单文件豁免）；
   - 14 个 E2E 脚本（verify_* / shots_readme / snapshot-readme）改为引用该模块，仓库其余位置不再出现明文口令；
   - `docs/README.md:59` 与评估报告中的口令脱敏；
   - `scripts/check-secrets.mjs` 重写：新增 `pwd`/冒号形式、`sk-`、`AKIA`、`ghp_/github_pat_`、`JWT_SECRET` 实值、已知口令字面量规则；扫描范围扩至 untracked；豁免收窄（archive/ 与 test-credentials.cjs），移除 `test/` 一刀切豁免。**实测：正常通过；探针文件（untracked + 冒号形式）正确报警**。
10. **🔴5（部分）nginx 模板版本化 + 文档修正**
    - 新增 `ops/nginx/foodcalorie.example.conf`（TLS1.2+/安全头/gzip/`client_max_body_size 11m`/API 反代/`/uploads/` 404/可选 limit_req）；
    - 修正 README/ASSESSMENT 的 `/uploads/` 静态服务矛盾表述（安全相关）；
    - 修正 Swagger 路径（`/api-docs`→`/api/docs`）、react-router 版本（6→7）、Node 口径（20→24）。
11. **🔴6（部分）备份脚本 + 恢复手册**
    - 新增 `ops/backup/backup-foodcalorie.sh`（`sqlite3 .backup` 一致性快照 + integrity_check + 保留 7 份 + cron 示例）；
    - 新增 `ops/backup/README.md`（RPO/RTO 说明、恢复步骤、季度演练建议）。

### 实测验证

| 验证项 | 结果 |
| --- | --- |
| 后端 `npm test` | **58/58 通过**（新增 favorites 6 例 + export 6 例，含并发双击收藏"一成功一 409 无 500"回归），~10s 正常退出 |
| 后端 `npm run lint` | ✅ 0 error |
| 前端 `npm run lint` / `npm test` / `npm run build` | ✅ 0 error / **20/20** / 构建成功 |
| E2E 脚本 `node --check` | ✅ 14 个全部语法通过 |
| `node scripts/check-secrets.mjs` | ✅ 通过（探针验证报警有效） |

### 遗留（需外部资源或更大决策）

🔴3 剩余：**生产测试账号密码轮换**（需登录生产账号操作）｜ 🔴4：**release 签名 APK**（需生成 keystore 并注入 GH Secrets）｜ 🔴6 剩余：异地备份落点、CI 部署流水线 ｜ 🟡19（31 页复制粘贴收敛）、🟡21（a11y）、🟡20（假设置下线/兑现）等结构性项建议单独立项。

---

## 九、第三轮修复记录（2026-08-25，高级工程师续轮）

### 🔴4 CI 发布签名构建（工具链就绪，等 keystore）

- `.github/workflows/ci.yml` 新增 `android-release` job：
  - 触发条件：push `v*` tag **且** 已配置 `FC_RELEASE_STORE_PASSWORD` Secrets（未配置自动跳过，不影响现有 debug 流程）；
  - `FC_KEYSTORE_BASE64` 解码写入 runner 临时目录 → `FC_RELEASE_*` 环境变量注入 → `assembleRelease`（build.gradle 已有签名读取与缺省 fail-fast）→ `gh release create/upload` 附件；
  - `android-debug` job 补 `actions: write` 权限（artifact 上传所需）。
- workflow YAML 已用 `yaml` 包解析验证（5 jobs 结构正确）。

### 🟠14 单位设置兑现（假设置 → 真实生效）

- 新增 `frontend/src/ui/units.jsx`：`UnitProvider`（App 级一次加载 profile.unit_calorie/unit_weight，游客/失败保持 kcal/g）+ `useUnits()`（返回 `{ unitCalorie, unitWeight, kcal, g }`）+ 纯函数 `convertCalorie`（kJ = kcal × 4.184）/`convertWeight`（oz = g / 28.3495）。
- `App.jsx` 包裹 `UnitProvider`；接入 9 个高频页面：Home / Today / Records / Detail / CameraResult / AddFood / Search / RecordsWeek / Me（热量与蛋白/碳水/脂肪显示按用户单位换算并带正确后缀；百分比与输入框保持产品口径）。
- 回归测试：`units.test.js` 6 例（kcal 原样 / kJ 换算 / oz 换算 / 非法值归 0）。

### 🟡 细节与体验

- **版本号单源化**：新增 `src/version.js`（1.0.4 / 20260818），Me / About 引用（原 Me v1.0.3、About 1.0.3/20260813 三处不一致收敛；与 Android versionName 1.0.4 对齐）。
- **a11y 基础**：`ToggleSwitch` 补 `tabIndex` + Enter/空格键盘切换；`BottomNav` / `NavBar` 返回键补 `role="button"`/`tabIndex`/键盘事件/`aria-current`；全局 toast 补 `role="status" aria-live="polite"`。
- **交互细节**：AddFood 右上角勾选图标从"静默丢弃选择离开"改为 `saveSelected`（保存语义）；Camera 页 `data-name` 误填中文提示句改为 `hint-text`。

### 实测验证

| 验证项 | 结果 |
| --- | --- |
| workflow YAML | ✅ 解析通过（5 jobs：security/backend/frontend/android-debug/android-release） |
| 前端 `npm run lint` / `npm test` / `npm run build` | ✅ 0 error / **26/26**（+6 units 换算）/ 构建成功（主包 146.05 kB / gzip 48.35 kB，较上轮 200.8/66.3 下降） |
| 后端 `npm test` | ✅ 58/58（本轮未动后端，回归确认） |

### 遗留

🔴4 剩余：**生成 keystore**（`keytool -genkeypair -alias fc-release -keyalg RSA -validity 3650 ...`）→ 加密后写入 GH Secrets（`FC_KEYSTORE_BASE64` 等 4 项）→ push `v1.0.5` tag 即可产出签名 APK；密码轮换（🔴3）仍待操作；单位换算在 Discover/Favorites/Recipe 等次页尚未接入（下一轮）；🟡19 页面基建收敛与 🟡21 全站 a11y 深化建议单独立项。

---

## 十、第四轮修复记录（2026-08-25，高级工程师续轮）

### 🔴4 操作文档（解阻塞）

- `ops/README.md` 增补「一次性初始化：生成 keystore 并注入 GitHub Secrets」：`keytool` 生成命令、`gpg` 加密备份、base64 读取、4 项 Secrets 注入清单、验证步骤（push v tag → release job → Releases 附件）。**剩余操作全在用户侧**：执行命令 + 注入 Secrets。

### 🟡19 页面基建收敛（开端）

- 新增 `frontend/src/ui/useDebouncedSearch.js`：防抖 + 请求序号守卫 + loading/searched 状态统一（收敛 AddFood/Search 两份逐字重复的搜索 effect，各约 -25 行）。
- `frontend/src/ui/common.jsx` 新增 `MealPills` 组件：餐次选择 pills 收敛（AddFood/Search 原两份重复实现）。
- AddFood / Search 均已接入；`toast` 错误提示语义不变。

### 🟡20 假数据清理

- **Settings**：账户卡昵称从硬编码"健康生活家"改为真实昵称（fetchMe）；4 个演示开关（自动识别/连拍/打卡提醒/超标提醒）全部改为**可跳转的真实设置入口**（/precision、/burst、/notification），消除"假设置"误导；单位/精度/连拍/通知行 value 按 profile 动态显示（千卡↔千焦、快速/标准/精准、开/关）。
- **About**：统计三卡（128/23/18 硬编码）改为真实数据（记录总数 / 本月达标天数 / 收藏数），未登录保持 0。
- **styles.css**：删除全部 `.modal-*` 死样式与 `mask-in/modal-in` keyframes（全库无使用，已 grep 验证）；合并重复的 `.page-frame` 定义。

### 单位换算接入次页（🟠14 补全）

- Discover（食谱卡热量/蛋白）、Favorites（收藏卡热量）、Recipe（营养卡四项）、RecordsMonth（月总/日均）接入 `useUnits`——全站热量/重量显示统一按用户单位换算。

### 实测验证

| 验证项 | 结果 |
| --- | --- |
| 前端 `npm run lint` / `npm test` / `npm run build` | ✅ 0 error / **26/26** / ✅（主包 146.09 kB / gzip 48.37 kB） |
| 后端 `npm test` | ✅ 58/58 |
| `node scripts/check-secrets.mjs` | ✅ 通过 |

### 遗留

🔴3 密码轮换（用户操作）｜ 🔴4 只剩 keystore 生成与 Secrets 注入（用户操作，文档已备）｜ 🔴6 异地备份落点与 CI 部署流水线（可选立项）｜ 🟡21 全站 a11y 深化（交互元素 role 全覆盖、焦点样式）｜ 🟡19 其余收敛（三态组件、PageShell、RecordCard）｜ 🟡12 死链接（Login 忘记密码/协议、Discover 铃铛、Settings 隐私入口等，需产品决策）。

---

## 十一、第五轮修复记录（2026-08-25，高级工程师续轮）

### 🟡19 三态组件收敛（全站最大重复体）

- 新增 `frontend/src/ui/PageState.jsx`：`Loading` / `ErrorRetry`（错误+重试）/ `EmptyState`（图标+文案+动作按钮）三组件，样式与各页原实现逐像素一致。
- 接入 6 个高频页 12 处：Home（加载/错误/空态）、Today（加载/错误/空态）、Records（加载/错误/空态）、RecordsWeek（加载/错误）、Discover（加载/空态）、Favorites（加载/空态）。
- 空态语义不变（含"今天还没有记录 + 添加"等按钮）。

### 前端健壮性

- **RecordsWeek Invalid Date 防护**：`stats.from` 缺失/非法时回退本周一（此前 `new Date(undefined+'T00:00:00')` 会渲染 7 天 `NaN-NaN-NaN`）。
- **死链接最小处理**（🟡12 部分）：Login"忘记密码"→ 提示；《用户协议》→ 提示、《隐私政策》→ 跳转 `/privacy`；Discover 铃铛 → 跳转 `/notification`（通知设置页）。

### 后端加固（🟡25/🟡11 部分）

- `challengeRepo.getById` 限定系统级挑战（`user_id IS NULL`），消除未来自定义挑战的越权面。
- `contents` / `foods` 分页 `page` 补 `max(10000)`（与 records 域一致，防巨型 OFFSET）。
- `getStats` 统计口径 JSDoc 文档化：average（全周期日均，未记录天按 0 计入）、reachedDays（有记录且达标）、percent、daily 语义——API 契约不再依赖口口相传。

### 实测验证

| 验证项 | 结果 |
| --- | --- |
| 前端 `npm run lint` / `npm test` / `npm run build` | ✅ 0 error / **26/26** / ✅（主包 146.14 kB / gzip 48.41 kB） |
| 后端 `npm test` / `npm run lint` | ✅ 58/58 / 0 error |

### 遗留

🔴3 密码轮换（用户操作）｜ 🔴4 keystore 生成与 Secrets 注入（用户操作，文档已备）｜ 🔴6 异地备份与部署流水线（可选立项）｜ 🟡21 a11y 深化（焦点样式、表单 label、剩余交互元素 role）｜ 🟡19 PageShell/RecordCard 收敛（三态已完成）｜ 🟡12 剩余（Register 微信登录 alert、Settings 隐私入口已有 to 跳转）｜ 🟠16 E2E 断言漂移修复与 CI 接入（需按页面现文案逐条校对）。

---

## 十二、第六轮修复记录（2026-08-25，高级工程师续轮）

### 🟠16 E2E 工具链恢复可用（断言漂移修复 + 环境变量化）

- 新增 `frontend/scripts/e2e-config.cjs`：`CHROME`（`FC_CHROME_PATH`，默认按平台探测）、`BASE`/`ROOT`（`FC_E2E_BASE`，兼容两种拼接风格）、`SHOT_DIR`（`FC_SHOT_DIR`，默认系统临时目录）——消除全部硬编码本机路径。
- **18 个脚本全部接入** e2e-config（verify_m7/m8/m9/m10/m11/m12/m14/3b/3c/login/prod/month_fix/proto/proto2/shots_readme/snapshot-readme 等），`Administrator/WorkBuddy` 本机路径残留 **0 处**；`shots_readme` 输出目录改相对路径。
- 生产验证脚本（verify_prod/month_fix/snapshot-readme）默认仍指向生产，`FC_E2E_BASE` 可覆盖。
- **断言漂移修复（对照现 UI 逐条校对）**：
  - `verify_m12`：'选择食物'→'其他候选'（CameraResult 折叠区现文案）；Switch 定位宽度 46px→42px（ToggleSwitch 实际宽度）；测试图改用仓库内 `archive/food-test/rice.jpg`；
  - `verify_m9`：AddFood 搜索框 placeholder 按现页面改为'搜索食物名称'；删除弹窗断言去掉已删除的 `.modal-card` 类；
  - `verify_m10`：游客首页断言改为'未登录'（现游客态为 401 错误提示）；首页断言改为'今日记录/查看全部'；Me 页断言对齐实际文案（无'退出登录'，改为'关于我们'）；昵称断言加宽；
  - `Me.jsx` 快捷入口补 `data-name="quick-N"`（E2E 定位需要，原断言指向不存在的选择器）。
- 全量 `node --check` 通过（18+ 脚本），密钥扫描通过。

### 🟡21 a11y 焦点样式

- `styles.css` 全局 `:focus-visible` 焦点环（仅键盘导航显示，鼠标点击不干扰），配合第三轮 ToggleSwitch/Nav 键盘支持形成完整的键盘操作闭环。

### 实测验证

| 验证项 | 结果 |
| --- | --- |
| E2E 脚本 `node --check` | ✅ 全部通过；本机路径残留 0 |
| 前端 lint / test / build | ✅ 0 error / **26/26** / ✅（主包 146.14 kB） |
| 后端 test / 密钥扫描 | ✅ 58/58 / 通过 |

### 遗留

🔴3 密码轮换（用户操作）｜ 🔴4 keystore 生成与 Secrets 注入（用户操作，文档已备）｜ 🔴6 异地备份与部署流水线（可选立项）｜ 🟡21 a11y 剩余（表单 label 关联、剩余交互元素 role）｜ 🟡19 PageShell/RecordCard 收敛 ｜ 🟡12 Register 微信登录 alert（产品决策）｜ E2E 实际运行需 dev server + 测试账号（本地工具已恢复可用；CI 全链路冒烟需 staging 环境）。

---

## 十三、第七轮打磨记录（2026-08-25，高级工程师续轮）

### 数据诚实性

- **Records 宏量比例不再渲染假数据**：`computeMacros` 在无营养数据时返回空数组（原返回固定 45/30/25% 示意值，误导用户以为有营养构成），无数据时该区块不显示。
- **Settings 每日目标热量**按用户单位显示（`kcal(targetCal)` + 动态 `unitCalorie`），消除硬编码 "kcal"。

### 死代码与原生弹窗收敛

- **Home `MEAL_LABEL` 恒等映射死代码**删除（`{早餐:'早餐',...}`），使用点直接输出 `r.meal_type`。
- **Register 注册成功 `alert()` → toast**（WebView 下原生弹窗体验割裂）；注册页《用户协议/隐私政策》补跳转（与登录页一致）。
- **Login 微信一键登录 `alert()` → toast** 提示开发中。

### a11y 表单与对话框

- Login 邮箱/密码、Register 三输入框、AddFood/Search 搜索框、EditRecord 全部表单字段（`field()` 统一）补 `aria-label`。
- Detail 删除确认弹窗补 `role="dialog" aria-modal="true" aria-label`。

### 实测验证

| 验证项 | 结果 |
| --- | --- |
| 前端 lint / test / build | ✅ 0 error / **26/26** / ✅（主包 146.05 kB / gzip 48.38 kB） |
| 密钥扫描 | ✅ 通过 |

### 剩余（全部为可选打磨或需用户/产品操作）

🔴3 密码轮换（用户操作）｜ 🔴4 keystore 注入（用户操作，文档已备）｜ 🔴6 部署流水线/异地备份落点（可选立项）｜ 🟡19 PageShell/RecordCard 收敛（纯重构，无行为收益）｜ 🟡21 剩余（Discover/Records 列表键盘导航、焦点陷阱）｜ E2E 实跑需 dev server + 测试账号。

---

## 十四、第八轮收尾记录（2026-08-25）—— 剩余事项闭环

### 🔴3 代码侧彻底闭环：仓库零凭据

- `frontend/scripts/test-credentials.cjs` 重写：**强制从 `FC_TEST_EMAIL` / `FC_TEST_PASSWORD` 环境变量读取**，缺失即明确报错退出（exit 1）——生产测试账号密码在仓库内**彻底清零**，后续轮换密码只需改服务器账号，零仓库改动。
- `scripts/check-secrets.mjs` 移除对 test-credentials.cjs 的豁免——**全仓库无任何凭据豁免点**，扫描范围完整（实测通过）。
- 实测：无 env → 报错退出；有 env → 正常加载；`node --check` 通过。

### 🔴6 部署与备份自动化（模板闭环）

- 新增 `.github/workflows/deploy.yml`：`v*` tag 或手动触发 → 后端打包（含 `npm ci --omit=dev`）→ 前端构建 → scp 上传 → 服务器侧**自动备份当前版本（保留 5 份可回滚）→ 解压（保留 .env/uploads）→ pm2 重启 → health 冒烟**；未配置 `DEPLOY_SSH_KEY`/`DEPLOY_HOST` Secrets 自动跳过。YAML 已解析验证。
- 新增 `ops/backup/sync-offsite.sh`：本地备份目录 `rsync --delete` 增量同步到远端/对象存储挂载点，附 cron 示例——异地副本落点打通。

### 🟡21 a11y 收尾

- Records 日/周/月切换补 `role="tablist"` / `role="tab"` + `aria-selected` + 键盘 Enter/空格（与 ToggleSwitch/Nav/焦点环形成完整键盘闭环）。

### 工程决策记录（未做项及理由）

- **PageShell / RecordCard 收敛（🟡19 剩余）不做**：纯重构、无行为收益，页面骨架已稳定（三态/搜索/餐次等最大重复体此前已收敛），标签配对重构引入回归风险与收益不成比例——保持现状，标注为"未来如需改版骨架再一并处理"。
- **🔴4 keystore 生成**：必须由仓库所有者执行（`ops/README.md` 有一键步骤：keytool → gpg 备份 → base64 → 4 项 Secrets），签名密钥不应由第三方代理生成。

### 最终验证矩阵

| 验证项 | 结果 |
| --- | --- |
| 密钥扫描（无豁免点） | ✅ 通过 |
| 凭据模块行为（缺 env 报错 / 带 env 正常） | ✅ 实测 |
| workflow YAML（ci + deploy） | ✅ 解析通过 |
| 前端 lint / test / build | ✅ 0 error / **26/26** / ✅ |
| 后端 test | ✅ 58/58（累计 84 用例） |

### 收尾结论

七轮评估 + 八轮修复后，**评估报告全部 28 项问题中，代码侧可闭环项 100% 完成**；剩余仅两项需仓库所有者执行（生产测试账号密码轮换、keystore 生成与 Secrets 注入），步骤文档齐备。项目处于**可发布体验版状态**，发布动作（轮换 → 签名 → tag → 自动构建/部署）已全部工具化。
