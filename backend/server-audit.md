# 服务器已有「注册登录模块」盘点报告（只读）

> 盘点时间：2026-08-06 · 方式：SSH 只读命令（未修改服务器任何内容，未触碰注册登录以外的模块）
> 服务器：阿里云 Ubuntu 22.04.5 LTS · IP 已脱敏

## 1. 模块位置与运行方式

| 项 | 值 |
|----|-----|
| 服务 | **gakiwoo-api**（PM2 id=35，进程名 `node /var/www/gakiwoo-releases/...`）|
| 代码目录 | `/var/www/gakiwoo-api/` |
| 注册登录模块 | `/var/www/gakiwoo-api/modules/auth/`（routes.js / service.js / repositories/{usersRepo,tokenRepo}.js）|
| 对外端口 | `127.0.0.1:3000`（PM2 托管）|
| 反向代理 | Nginx：`gakiwoo.com` / `design.gakiwoo.com` → `127.0.0.1:3000` |
| 依赖服务 | Redis `127.0.0.1:6379`（ioredis 缓存/限流）；SQLite（better-sqlite3）|

## 2. 技术栈（现有模块）

- **Node.js ≥ 24**（生产运行时固定为 `/opt/node-v24/bin/node`）
- **Express ^4.18.2**、**better-sqlite3 ^12.9.0**（SQLite）
- **jsonwebtoken ^9.0.2**（JWT）、**bcryptjs ^2.4.3**（密码哈希）
- **zod ^3.23.8**（参数校验）、**pino ^10**（日志）、**helmet / cors / cookie-parser**
- **swagger-jsdoc + swagger-ui-express**（API 文档，挂载 `/api/docs`）
- 部署：PM2 v6.0.14 + Nginx

## 3. 注册登录接口（已存在，复用，零改动）

挂载路径：`v1.use('/auth', authRoutes)` → `app.use('/api/v1', v1)` + `app.use('/api', v1)`
即 **`/api/auth/*`** 与 **`/api/v1/auth/*`** 均可用。

| 方法 | 路径 | 说明 | 成功响应 |
|------|------|------|---------|
| POST | `/api/auth/register` | 注册（email+password+nickname?） | 201 `{message:'注册成功，请登录', user:{id,email,nickname,role}}` |
| POST | `/api/auth/login` | 登录 | 200 `{user:{id,email,nickname,role}}` + **Set-Cookie**（access_token/refresh_token）|
| POST | `/api/auth/logout` | 退出（清 cookie）| `{message}` |
| POST | `/api/auth/refresh` | 刷新令牌（读 refresh_token cookie）| 200 `{user}` + 新 Set-Cookie |
| GET | `/api/auth/me` | 当前用户 | 200 `{user}` |
| PUT | `/api/auth/me` | 更新资料（nickname）| `{user}` |
| PUT | `/api/auth/me/password` | 修改密码 | `{message}` |
| GET | `/api/auth/usage` / `/usage/stats` | 用量统计 | 数据 |

**鉴权中间件（多端兼容已验证）**：
- `extractToken`：**优先读 `Cookie: access_token`，其次 `Authorization: Bearer <token>`** → 移动端/小程序可直用 Bearer。
- `csrfOriginGuard`：**缺失 Origin/Referer 的请求（原生客户端/服务端调用）直接放行** → 移动端写请求不会被 CSRF 拦截。
- JWT：access 15min / refresh 7d；refresh_token 以 SHA-256 哈希存 `refresh_tokens` 表（支持撤销）。

**错误格式**：`{ "error": "未登录，请先登录", "code": "LOGIN_REQUIRED" }`
常见 code：`LOGIN_REQUIRED` / `LOGIN_EXPIRED` / `AUTH_INVALID`；业务错误 HTTP 400/401/409/429。

**限流**：登录 5 次/5min（按邮箱）、写操作 10/min、读操作 30/min。

## 4. 用户数据表（users，SQLite）

```sql
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    UNIQUE NOT NULL,      -- 登录账号（小写去空格）
  password_hash TEXT    NOT NULL,             -- bcrypt 12 轮
  nickname      TEXT,
  role          TEXT    DEFAULT 'user',
  is_active     INTEGER DEFAULT 1,
  created_at    TEXT    DEFAULT (datetime('now')),
  last_login    TEXT
);
-- 另有 refresh_tokens / usage_logs 等
```

## 5. 多端对接结论（对后续开发的关键约束）

1. **服务端注册登录模块零改动**，即可支持三端：
   - Web：Cookie（SameSite=Strict + httpOnly，域名 `.gakiwoo.com`）
   - APK/iOS/小程序：`Authorization: Bearer <access_token>`（原生请求无 Origin，CSRF 放行）
2. **移动端获取 token**：login/refresh 通过 `Set-Cookie` 下发，body 不含 token。移动端需**捕获 Set-Cookie 响应头**并自行保存（或使用支持 cookie jar 的 HTTP 客户端），后续请求带 `Cookie` 或 `Authorization`。
3. **刷新**：`POST /api/auth/refresh` 读取 Cookie 中的 refresh_token；移动端带 `Cookie: refresh_token=...` 即可续期。
4. **新业务服务鉴权**：若新建食刻业务 API，需用**同一 `JWT_SECRET`** 实现相同 `requireAuth` 逻辑（复制实现即可，不动现有模块）。
5. CORS/CSRF 白名单（`allowedOrigins.js`）已含 `http://localhost:5173`（前端 dev），生产域名需补充。

## 6. 安全提醒

- 本盘点报告与临时脚本不包含任何凭据明文；服务器密码请勿写入代码/文档/仓库。
- 连接服务器时仅执行只读命令；未对服务器做任何修改。
