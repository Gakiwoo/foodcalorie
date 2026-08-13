# 食刻（FoodCalorie）项目文件结构与维护索引

> 生成时间：2026-08-07 ｜ 用途：帮助后续开发者快速定位代码、理解依赖、安全维护
> 生产入口：https://foodcalorie.gakiwoo.com （独立子域名）

---

## 一、顶层目录速览

```
WorkBuddy/2026-08-05-10-22-23/
├── frontend/          # 前端：Vite + React（31 个页面组件 + 共享 UI）
├── backend/           # 后端：Express + SQLite（9 业务模块，分层架构）
├── docs/              # 产品/页面文档
├── archive/           # 归档区（历史脚本、原型、截图、旧构建，只读参考）
├── react-app-backup/  # 早期原型备份（与 archive/react-app-backup 重复，保留勿动）
├── .mastergo/         # MasterGo 设计稿同步数据（勿改）
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
| `package.json` | 依赖：react 18 / react-router-dom 6 / **puppeteer-core**（E2E） |

### 2.2 页面组件（`FoodCalorie-*.jsx`，31 个）

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

> ⚠️ **维护红线**：`Help.jsx` 通过 `import html from './FoodCalorie-Help.html?raw'` 嵌入内容，**必须保留 `FoodCalorie-Help.html`**。其余同名 `.html` 原型均已归档（archive/prototype/legacy-html/），避免 Vite/静态服务路由冲突。

### 2.3 共享代码 `src/`

| 文件 | 职责 |
|------|------|
| `src/api/client.js` | 封装的 http 客户端（token 注入 / 统一错误 / 401 跳转） |
| `src/api/auth.js` | 认证辅助（登出等） |
| `src/ui/common.jsx` | 通用 UI：StatusBar / NavBar / Card / Seg / 环形进度等 |
| `src/ui/toast.js` | Toast 提示 + `nowDateTime()` 时间格式化 |

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
"C:/Users/Administrator/.workbuddy/binaries/node/versions/22.22.2/node.exe" verify_m14.cjs
```
> 历史调试脚本已归档 `archive/scripts/debug/`。

### 2.5 构建产物（`dist-prod3/` 为当前生产版本）

| 目录 | 说明 |
|------|------|
| `dist-prod3/` | **当前生产构建**（子域根路径，已部署 /var/www/foodcalorie-web/） |
| `archive/prototype/old-dist/` | 旧构建（dist-v0 / 子路径版 / 早期根路径版），仅历史参考 |

构建命令：`NODE_ENV=production vite build --outDir dist-prod3`（Windows 下用新 outDir 避开安全钩子清空拦截）。

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

### 3.4 单元测试 `test/`

| 文件 | 覆盖 |
|------|------|
| `m1-base.test.js` | 基础：health/鉴权/错误码 |
| `records.test.js` | 记录域 CRUD/stats（含目标读 profile） |
| `ai.test.js` | AI 降级/解析/enrich/受控回灌仓储/image_url |
| `challenges.test.js` | 挑战：首次/连续/断签/重复 429 |

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
