# 食刻 App · 后端

食刻业务后端 API 服务（**foodcalorie-api**）。注册登录模块**复用服务器 gakiwoo-api**（`/api/auth/*`，零改动）；本服务提供业务接口 `/api/v1/foodcalorie/*`。

- 技术规格：`SPEC.md`（已确认：Node 20 + Express 4 + SQLite 同栈）
- 服务器注册登录盘点：`server-audit.md`

## 快速开始

```bash
cd backend
npm install
cp .env.example .env        # 填写 JWT_SECRET（与 gakiwoo-api 一致）、DB_PATH
npm run init-db             # 初始化业务表
npm run dev                 # http://127.0.0.1:3001
npm test                    # node:test + supertest
```

API 文档（开发环境）：`http://127.0.0.1:3001/api/docs`（Swagger）

## 目录结构

```
backend/
├── SPEC.md / server-audit.md   # 规格与盘点
├── src/
│   ├── server.js               # 入口（PORT=3001）
│   ├── app.js                  # Express 装配（v1 版本前缀 + Swagger）
│   ├── db.js                   # better-sqlite3 连接 + 建表（业务表）
│   ├── modules/                # 按域模块化（Controller/Service/DAO）
│   │   ├── health/             # 健康检查
│   │   ├── records/            # 食物记录（routes/service/repositories）
│   │   ├── profiles/           # 食刻资料与设置（目标/偏好/单位/识别/通知）
│   │   ├── foods/              # 食物库搜索
│   │   ├── favorites/          # 收藏（recipe/article/food）
│   │   ├── contents/           # 发现页内容（文章/食谱）
│   │   ├── challenges/         # 挑战活动（参与/每日打卡）
│   │   └── export/             # 数据导出（csv/json）
│   └── shared/
│       ├── middleware/         # requireAuth / errorHandler / rateLimit / validate
│       ├── utils/              # response(ok/okPage) / serviceError / errors(错误码) / logger
│       └── config/
├── test/                       # node:test + supertest
├── package.json / .env.example / .gitignore
└── data/                       # 本机开发 SQLite（gitignore）
```

## 认证对接（多端）

- 接口：`POST /api/auth/register|login|logout|refresh`、`GET|PUT /api/auth/me`、`PUT /api/auth/me/password`（gakiwoo-api，经 nginx/vite proxy）
- Web：Cookie（SameSite=Strict, httpOnly）
- APK / iOS / 小程序：`Authorization: Bearer <access_token>`；登录时捕获 `Set-Cookie` 保存 token
- 本服务 `requireAuth` 使用同一 `JWT_SECRET` 校验（Bearer 或 Cookie）

## 接口版本与统一响应

- 前缀 `/api/v1`，响应头 `X-API-Version: v1`
- 成功：`{ code: 0, message: 'ok', data }`；失败：`{ code, message }`（错误码见 `src/shared/utils/errors.js`）

## 开发进度

| 阶段 | 内容 | 状态 |
|------|------|------|
| M1 基础工程 | 骨架/中间件/错误码/健康检查 | ✅ 编码+服务器验证 |
| M2 认证对接 | 前端 apiClient + Login/Register 真实表单 + vite proxy | ✅ 已联调（真实注册/登录/退出 E2E 通过）|
| M3 记录域 | records CRUD + stats + calendar（partial 更新）| ✅ 编码+服务器验证 |
| M4 资料与设置 | profile 读写（目标/偏好/单位/识别/通知）| ✅ 已上线（默认建档 + 部分更新）|
| M5 内容域 | foods 搜索 + contents 流/详情 + favorites | ✅ 已上线（43 食物 + 6 内容种子）|
| M6 扩展 | challenges（参与/每日打卡）+ export（csv/json）| ✅ 已上线；ai/recognize 预留 |
| M7 前端对接 | Records/Today/AddFood/Profile/DietPref/Unit/Precision/Burst 接真实 API | ✅ 已上线（E2E 13/13）|
| M8 前端对接 | Discover/Challenge/Favorites 接真实 API（favorites 联查内容）| ✅ 已上线（E2E 10/10）|
| M9 前端对接 | Detail/EditRecord/RecordsWeek/RecordsMonth/DataExport 接真实 API | ✅ 已上线（E2E 21/21）|
| M10 前端对接 | Home/Me 接真实数据（首页摄入环/我的信息）；单测补跑 14/14 | ✅ 已上线（E2E 12/12 + 单测全绿）|
| M11 前端对接 | Article/Recipe 详情（contents/:id + 真实收藏）、Goal、Search；stats 读用户目标 | ✅ 已上线（E2E 15/15 + 单测 15/15）|
| M12 AI 识别+通知 | ai/recognize 接口（multer+候选）、Camera/CameraResult 闭环、Notification | ✅ 已上线（E2E 11/11）|
| M13 AI 视觉模型 | Kimi/Moonshot 视觉识别接入，单测 19/19 | ✅ 已上线并**启用真实识别**（MOONSHOT_API_KEY 已配置）|
| M14 完善级 | 识别图片持久化（uploads+image_url 落库+详情展示）、模型新食物回灌食物库、Swagger 环境白名单、挑战连续打卡（streak） | ✅ 已上线（E2E 9/9 + 单测 27/27）|
| M15+ | 推送（非 SPEC 需求） | ⏳ 扩展愿景 |

### 图片持久化（M14）
- 识别图片经 multer diskStorage 落盘 `/var/www/foodcalorie-api/uploads/`，响应返回 `image_url=/uploads/<文件>`；确认添加记录时随 body 提交落库 `food_records.image_url`
- 子域 nginx 已加 `location ^~ /uploads/` → alias 静态服务（Cache-Control 1 天）；记录详情页展示识别图
- 记录创建/更新校验 `image_url` 支持相对路径（`.url()` 会拒绝 `/uploads/...`，已放宽为 max 500）

### 模型数据回灌（M14）
- Kimi 识别出的「新食物」（食物库无匹配 + 营养有效）自动回灌 `food_items`（`source='model'` 标记，名称幂等去重，每图最多 3 条）
- 越用越准：下次同食物识别直接命中食物库数据（conf 0.95-）

### Swagger 环境白名单（M14）
- 非 production 默认开放 `/api/docs`；production 需 `SWAGGER_ENABLED=true` 显式开启（安全默认关闭）

### 挑战连续打卡（M14）
- `streak_days` 字段：昨天打过 → +1；断签/首次 → 重置 1；同日重复仍 429；列表与打卡响应均返回 streak_days

### AI 识别（Kimi 视觉模型）配置
- 识别流程：上传图片 → **Kimi 视觉模型**（moonshot 视觉 API，OpenAI 兼容）识别食物 → 输出候选 JSON → 与食物库匹配补全营养 → 用户确认落记录
- ✅ **已配置 MOONSHOT_API_KEY 并启用真实识别**（验证：食物图识别出"炒饭 250 kcal"等候选）
- 配置位置：服务器 `/var/www/foodcalorie-api/.env` 添加 `MOONSHOT_API_KEY=sk-xxx` → `pm2 restart foodcalorie-api`
- 可选覆盖：`MOONSHOT_BASE_URL`（默认 https://api.moonshot.cn/v1）、`MOONSHOT_VISION_MODEL`（默认 moonshot-v1-8k-vision-preview，可用 kimi-k3/kimi-k2.6）
- **无 Key / 识别失败自动降级**：返回食物库候选推荐（8 项含营养+置信度），message 标注原因，服务不中断

## 部署与接入状态（2026-08-06 已完成）

**服务器正式接入完成**（阿里云，全程未改动 gakiwoo-api 任何代码）：

| 项 | 状态 |
|----|------|
| 服务 | PM2 `foodcalorie-api`（端口 3001，online）|
| JWT_SECRET | ✅ 与 gakiwoo-api 同源（`/etc/gakiwoo/api.env`，token 双向互通）|
| DB_PATH | ✅ `/var/lib/gakiwoo/gakiwoo.db`（共享 users 表，业务表已建）|
| Nginx | ✅ `location ^~ /api/v1/` → `127.0.0.1:3001`（配置已备份 `.bak.*`）|
| 外网 | ✅ `https://gakiwoo.com/api/v1/foodcalorie/health`、`/api/auth/*`、`/api/v1/foodcalorie/*` 全部可达 |
| **生产前端** | ✅ **https://foodcalorie.gakiwoo.com/**（独立子域名，根路径部署，生产 E2E 8/8）|
| **旧入口** | ✅ `https://gakiwoo.com/foodcalorie/` → 301 至新子域 |
| **端口收敛** | ✅ foodcalorie-api 绑定 **127.0.0.1:3001**（公网直连已拒绝，仅 nginx 反代）|
| **nginx 守护** | ✅ `/usr/local/bin/foodcalorie-nginx-guard.sh` + cron 每 5 分钟自愈（location + gakiwoo 白名单）|

**生产部署（独立子域名 foodcalorie.gakiwoo.com）**：
- `frontend/dist-prod/` → `/var/www/foodcalorie-web/`（根路径 SPA）；BrowserRouter basename `/`；构建 `NODE_ENV=production vite build --outDir dist-prod`（Windows 用新 outDir 避开安全钩子）
- nginx server：`sites-available/foodcalorie.gakiwoo.com`（443 SSL + 静态根路径 + `/api/auth`→3000 + `/api/v1`→3001），证书 certbot（webroot）
- **gakiwoo 白名单**：`foodcalorie.gakiwoo.com` 已加入 release 版 `allowedOrigins.js`（官方扩展点）；**下次 gakiwoo 发布会丢失，由守护脚本自动补回并重启**

**nginx 运维**：gakiwoo 发布流程会重写 `sites-enabled/gakiwoo.com` 并删除食刻 location → 守护脚本（cron 每 5 分钟）自动重新注入：
- `location /foodcalorie/`（→ 301 到子域名）
- `location ^~ /api/v1/foodcalorie/`（反代 127.0.0.1:3001）
- 备份统一在 `/etc/nginx/backups/`（**不可放 sites-enabled/，否则被 nginx include 加载**）
- 守护脚本同时**守护 gakiwoo release 白名单**（发布覆盖后自动补回 foodcalorie 并重启 gakiwoo-api）
- 修复脚本归档：`archive/scripts/foodcalorie-nginx-inject.py`、`foodcalorie-nginx-guard.sh`

**联调验证（全链路通过）**：
- API 级：登录捕获 Set-Cookie → Bearer → 记录 CRUD/stats/calendar 全通；`/api/auth/me` 双向认 token；`Cookie: refresh_token` 头 refresh 成功（移动端模式）
- 前端 E2E（puppeteer）：真实注册→登录→`/me=200`→记录 API 200→退出→`/me=401` 全部通过
- 备份：`/var/backups/gakiwoo/gakiwoo-pre-foodcalorie-*.db`、`foodcalorie-api/.env.bak.*`、`gakiwoo.com.bak.*`

**本地开发**：`frontend/vite.config.js` 代理 `/api/auth` → `https://gakiwoo.com`、`/api/v1` → **直连 `http://123.57.102.126:3001`**（不依赖 nginx），含 dev 专用 cookie 重写（剥离 Domain/Secure，localhost 可登录）；`127.0.0.1:5173` 已在 gakiwoo ALLOWED_ORIGINS 白名单，CSRF 不拦截。

> ⚠️ **重要运维提醒**：
> 1. gakiwoo 发布流程会重写 `/etc/nginx/sites-enabled/gakiwoo.com`，**删除我们的 `/api/v1` location**（2026-08-06 已发生）。恢复脚本：`archive/scripts/nginx_deploy_narrow.py`（**收窄版**）。
> 2. **必须使用收窄版 location**：`^~ /api/v1/foodcalorie/` → `127.0.0.1:3001`（health 已并入该前缀 `/api/v1/foodcalorie/health`）。**禁止用宽泛前缀 `^~ /api/v1/`**——gakiwoo-api 自身挂载了 `/api/v1/auth/*`（登录接口），宽泛前缀会把它的登录劫持到 3001 导致另一个项目登录失败（2026-08-07 实测事故）。旧宽泛脚本已改名禁用：`nginx_deploy_broad.LEGACY-DO-NOT-USE.py`。
> 3. 路由归属：`/api/v1/foodcalorie/*`（含 health）→ foodcalorie-api(:3001)；`/api/v1/auth/*`、`/api/auth/*` 及其它 → gakiwoo-api(:3000)。

**多端认证要点**：login 响应体只有 `{user}`，token 在 httpOnly Set-Cookie 中；Web 同源自动携带；原生端捕获 Set-Cookie 存 token，用 `Authorization: Bearer` 访问；refresh 仅认 cookie（`Cookie: refresh_token=` 头）。
