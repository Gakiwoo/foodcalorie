# 食刻（FoodCalorie）项目文件结构与维护索引

> 生成时间：2026-08-07 ｜ 用途：帮助后续开发者快速定位代码、理解依赖、安全维护
> 生产入口：https://foodcalorie.gakiwoo.com （独立子域名）

---

## 一、顶层目录速览

```
foodcalorie/（仓库根）
├── frontend/          # 前端：Vite + React（32 个页面组件 + 共享 UI/主题令牌）
├── backend/           # 后端：Express + SQLite（9 业务模块，分层架构）
├── docs/              # 产品/页面文档
├── ops/               # nginx / sshd / 备份运维配置
├── archive/           # 归档区（历史脚本、原型、截图、旧构建，只读参考；已 gitignore 出库，本地保留）
└── .workbuddy/memory/ # 每日开发记忆（2026-08-0X.md，含踩坑与验证记录）
```

---

## 二、前端 `frontend/`

### 2.1 核心入口

| 文件 | 职责 |
|------|------|
| `index.html` | SPA 挂载点（Vite 入口） |
| `main.jsx` | React 根 + `BrowserRouter`；**生产 basename 按环境切换**（子域根路径 = `/`） |
| `App.jsx` | 路由表 + 全局点击委托 NAV（仅静态/遗留页用，真实数据页组件内自理） |
| `vite.config.js` | dev 代理（`/api/auth` → gakiwoo.com、`/api/v1` → gakiwoo.com 同域）、生产 base |
| `styles.css` | 全局样式 |
| `package.json` | 依赖：react 18 / react-router-dom 7 / **puppeteer-core**（E2E） |

### 2.2 页面组件（`FoodCalorie-*.jsx`，32 个）

全部为**真实数据组件**（内部 fetch API + 自处理导航）。约定：**页面级组件 = 文件名即路由组件**。

| 组 | 文件 | 说明 |
|----|------|------|
| 认证 | `Login` `Register` | 走 `/api/auth/*`（gakiwoo 登录服务） |
| 记录域 | `Home` `Today` `AddFood` `Records` `RecordsWeek` `RecordsMonth` `Detail` `EditRecord` `Search` | 记录 CRUD / 统计 / 周月视图 / 导出 |
| 内容域 | `Discover` `Article` `Recipe` `Favorites` | 发现页 + 详情（`?id=`）+ 收藏 |
| AI | `Camera` `CameraResult` | 拍照识别闭环（Kimi 视觉 → 候选确认 → 落记录，图片持久化） |
| 用户域 | `Me` `Profile` `Goal` `DietPref` `Unit` `Precision` `Burst` `Notification` `Settings` | 我的 / 资料 / 目标 / 偏好 / 单位 / 精确度 / 冲刺 / 通知 |
| 挑战 | `Challenge` `DataExport` | 挑战打卡（含连续 streak）/ 数据导出 |
| 内容页 | `Privacy` `About` `Help` | 纯静态；**Help 依赖 `FoodCalorie-Help.html`（?raw 引入），勿删该 html** |

> 与 jsx 同名的原型 `.html` 已全部归档（archive/prototype/legacy-html/），避免 Vite/静态服务路由冲突；Help.jsx 内容已自包含，不再依赖外部 html。

### 2.3 共享代码 `src/`

| 文件 | 职责 |
|------|------|
| `src/api/client.js` | 封装的 http 客户端（token 注入 / 统一错误 / 401 单飞刷新 + 会话标记跳转 / GET 重试） |
| `src/api/auth.js` | 认证辅助（登录/注册/登出，走 gakiwoo /api/auth/*） |
| `capacitor.config.json` | Android 容器配置；启用 CapacitorHttp，以原生 Cookie 管理器承载 httpOnly 登录会话 |
| `src/ui/theme.js` | 设计令牌（颜色/间距/圆角/阴影/字号/层级），页面禁止硬编码色值 |
| `src/ui/components/` | 页面原语组件（PageContainer/ListItem/PrimaryButton/SectionHeader/StatBadge） |
| `src/ui/common.jsx` | 通用 UI：StatusBar / NavBar / Card / Seg / 环形进度 / ToggleSwitch / MealPills |
| `src/ui/PageState.jsx` | 页面三态：Loading / ErrorRetry / EmptyState |
| `src/ui/units.jsx` | 单位换算上下文（kcal↔kJ、g↔oz，设置真实生效） |
| `src/ui/useBusy.js` / `useDebouncedSearch.js` | 防双击闩锁 / 防抖搜索（请求序号守卫） |
| `src/ui/toast.js` | Toast 提示 + 本地日期工具（todayStr / nowDateTime） |
| `src/test/` | vitest 页面冒烟套件（34 文件 / 376 用例）+ setup + renderPage 工具 |

### 2.4 验证脚本 `scripts/`（核心回归，勿删）

| 脚本 | 覆盖 |
|------|------|
| `verify_login.cjs` | 登录/注册链路 |
| `verify_me.cjs` | 我的页真实数据 |
| `verify_proto.cjs` `verify_proto2.cjs` | 原型链路（首页/相机/发现/目标等 15/17 条） |
| `verify_m7.cjs` | 记录域（CRUD/stats/搜索添加） |
| `verify_m8.cjs` | 内容域（发现/收藏） |
| `verify_m9.cjs` | 详情/周月/导出 |
| `verify_m10.cjs` | 首页/我的真实数据 |
| `verify_m11.cjs` | 内容详情/目标/搜索 |
| `verify_m12.cjs` | AI 识别闭环 + 通知 |
| `verify_m14.cjs` | 图片持久化闭环（识别→落库→详情展示） |
| `verify_prod.cjs` | **生产环境** E2E（BASE=https://foodcalorie.gakiwoo.com/） |

运行方式（Windows）：
```bash
cd frontend/scripts
node verify_m14.cjs   # 需 Node 24（.nvmrc），dev server 已启动时执行
```
> 历史调试脚本已归档 `archive/scripts/debug/`。

### 2.5 构建产物（`dist/`，构建后上传 /var/www/foodcalorie-web/）

| 目录 | 说明 |
|------|------|
| `dist/` | 生产构建产物（`npm run build`；历史 dist-prod3 及更早版本已归档 archive/prototype/old-dist/） |

构建命令：`npm run build`（vite build，base './' + es2015 目标）。

---

## 三、后端 `backend/`

### 3.1 入口与配置

| 文件 | 职责 |
|------|------|
| `src/server.js` | 启动入口（**绑定 127.0.0.1:3001**，收敛公网直连） |
| `src/app.js` | Express 装配：helmet/CORS 白名单/cookieParser/限流/路由挂载/Swagger/404/errorHandler |
| `src/db.js` | SQLite 连接 + 建表 + **幂等列迁移**（migrateColumns）+ 种子数据 |
| `package.json` | scripts：`start`/`dev`/`test`（node --test）/`init-db` |
| `.env.example` | 环境变量模板（MOONSHOT_API_KEY / DB_PATH / JWT_SECRET / SWAGGER_ENABLED 等） |

> 数据文件：`data/foodcalorie.db` 与 `uploads/` 均在**服务器**上（`/var/www/foodcalorie-api/`），本地不落库。

### 3.2 模块架构（Controller/Service/DAO 三层，9 模块）

| 模块 | 目录 | 接口前缀 | 说明 |
|------|------|----------|------|
| health | `modules/health/` | `/foodcalorie/health` | 健康检查 |
| records | `modules/records/` | `/foodcalorie/records` | 记录 CRUD + stats + calendar + 周月视图 |
| profiles | `modules/profiles/` | `/foodcalorie/profile` | 资料/目标/偏好/单位/通知设置 |
| foods | `modules/foods/` | `/foodcalorie/foods` | 食物库搜索 |
| favorites | `modules/favorites/` | `/foodcalorie/favorites` | 收藏（recipe/article/food） |
| contents | `modules/contents/` | `/foodcalorie/contents` | 发现页文章/食谱 + 详情 + 收藏状态 |
| challenges | `modules/challenges/` | `/foodcalorie/challenges` | 挑战参与/打卡/**连续 streak** |
| export | `modules/export/` | `/foodcalorie/export` | 数据导出 csv/json |
| ai | `modules/ai/` | `/foodcalorie/ai` | Kimi 视觉识别、私有图片与受控回灌 |

每模块三件套：`routes.js`（Controller+校验）、`service.js`（业务）、`repositories/xxxRepo.js`（SQL DAO）。

### 3.3 共享层 `src/shared/`

| 分类 | 文件 | 说明 |
|------|------|------|
| middleware | `requireAuth.js` | JWT 鉴权（与 gakiwoo 同密钥互通，Cookie/Bearer 双通道） |
| middleware | `errorHandler.js` | 统一错误响应 `{code,message,data}` |
| middleware | `rateLimit.js` | 基于可信 `req.ip` 的单实例内存限流 |
| middleware | `validate.js` | zod 参数校验 |
| utils | `response.js` | ok / okPage 统一响应 |
| utils | `serviceError.js` | ServiceError（含 HTTP status + 业务码） |
| utils | `errors.js` | 6 段错误码定义 |
| utils | `logger.js` | pino JSON 日志 |

### 3.4 单元测试 `test/`（node:test，58 用例）

| 文件 | 覆盖 |
|------|------|
| `m1-base.test.js` | 基础：health/鉴权/错误码/404 |
| `records.test.js` | 记录域 CRUD/stats/calendar（含目标读 profile、越权 404） |
| `ai.test.js` | AI 降级/解析/enrich/受控回灌/image_url 白名单 |
| `challenges.test.js` | 挑战：首次/连续/断签/重复 429/并发原子防重/窗口校验 |
| `favorites.test.js` | 收藏：防重 409/并发恰好一次/联查/跨用户隔离 |
| `contents.test.js` | 内容流/详情原子浏览量/404 |
| `foods.test.js` | 食物库搜索/分类 |
| `profiles.test.js` | 资料默认档/部分更新/布尔序列化 |
| `export.test.js` | CSV BOM/转义/公式注入防护/JSON/range/跨用户隔离 |
| `security.test.js` | 限流/魔数校验/私有图片所有权/CORS fail-closed |
| `runtime-config.test.js` | 运行时配置守卫 |

运行（服务器上，DB 用临时库隔离）：
```bash
cd /var/www/foodcalorie-api
DB_PATH=/tmp/fc-test.db NODE_ENV=test npm test
```

### 3.5 文档

| 文件 | 内容 |
|------|------|
| `SPEC.md` | 原始产品需求规格（M1-M6 里程碑） |
| `README.md` | 开发/部署/运维手册（含生产部署、nginx 守护、Kimi 配置） |
| `ASSESSMENT.md` | 后端完成度评估 + 遗留项清单（持续更新） |
| `server-audit.md` | 服务器审计记录 |

---

## 四、归档区 `archive/`（只读参考）

| 目录 | 内容 |
|------|------|
| `scripts/` | 历史部署/修复/诊断脚本（deploy_*.py、fix_*.py、nginx 守护脚本等） |
| `scripts/debug/` | 前端历史调试脚本（debug_fav*、dbg_*、patch_* 等） |
| `prototype/legacy-html/` | 11 个原型 HTML（与 jsx 同名，**有路由隐患，勿放回 frontend/ 根**） |
| `prototype/old-dist/` | 历史构建产物 |
| `prototype/` | 早期单文件原型（foodcalorie-interactive/preview.html） |
| `food-test/` | 食物识别测试图（rice.jpg 炒饭图，Kimi 验证用） |
| `verify-screenshots/verify1-13/` | 各里程碑 E2E 截图 |
| `react-app-backup/` | 早期原型代码备份（与根目录 react-app-backup 相同） |

---

## 五、运维要点（服务器 123.57.102.126）

### 5.1 部署布局

| 路径 | 内容 |
|------|------|
| `/var/www/foodcalorie-api/` | 后端代码 + `data/foodcalorie.db` + `uploads/`（识别图片） |
| `/var/www/foodcalorie-web/` | 前端生产构建（dist-prod3 上传） |
| `/etc/nginx/sites-enabled/foodcalorie.gakiwoo.com` | 子域 server 块（禁止 `/uploads/`，仅反代 `/api/*`） |
| `/usr/local/bin/foodcalorie-nginx-guard.sh` | nginx location 守护（cron 5min） |
| `/usr/local/bin/foodcalorie-nginx-inject.py` | location 注入器 |
| `/etc/nginx/backups/` | nginx 配置备份（**勿放 sites-enabled/，会被 include**） |

### 5.2 关键命令

```bash
pm2 restart foodcalorie-api          # 重启后端
cd /var/www/foodcalorie-api && DB_PATH=/tmp/fc.db NODE_ENV=test npm test   # 单测
curl https://foodcalorie.gakiwoo.com/api/v1/foodcalorie/health   # 健康检查
```

### 5.3 环境变量（.env 敏感项）

`MOONSHOT_API_KEY`（Kimi 已配置）、`JWT_SECRET`（与 gakiwoo 同值）、`DB_PATH`、`PORT=3001`、`SWAGGER_ENABLED`、`UPLOAD_DIR`。

---

## 六、本次整理变更记录（2026-08-07）

1. **归档 11 个原型 HTML** → `archive/prototype/legacy-html/`（消除与 jsx 同名的路由隐患）；**保留 `FoodCalorie-Help.html`**（Help.jsx 依赖）
2. **清理 Vite 崩溃残留** `vite.config.js.timestamp-*.mjs` → `archive/scripts/debug/`
3. **归档旧构建产物** `dist/` `dist-prod/` `dist-prod2/` → `archive/prototype/old-dist/`（保留 `dist-prod3/` 为当前生产版）
4. **归档 14 个历史调试脚本** → `archive/scripts/debug/`（scripts/ 仅留 12 个核心验证脚本）
5. 归档后已回归确认：verify_login 7/7 ✅、组件编译 200 ✅、Vite 正常 ✅
