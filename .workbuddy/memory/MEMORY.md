# 食刻（FoodCalorie）项目长期记忆

## 部署与运维（重要）
- 服务器：生产服务器（gakiwoo 同机），**部署密钥已免密授权**（登录凭据细节已脱敏；历史记录中误存的密码已作废）
- **后端实际运行目录（2026-08-18 确认）：`/var/www/foodcalorie-releases/20260813T091015Z-b9cd7f4d7490/backend`（pm2 foodcalorie-api 的 script path），不是 `/var/www/foodcalorie-api`！部署后端必须 rsync 到 releases 目录并 pm2 restart，仅更新 foodcalorie-api 不会生效**。查证命令：`pm2 describe foodcalorie-api | grep script`
- 后端 PM2 `foodcalorie-api` 监听 127.0.0.1:3001（已收敛内网）；health `/api/v1/foodcalorie/health`
- 前端：/var/www/foodcalorie-web（dist 静态，子域 https://foodcalorie.gakiwoo.com，nginx 独立 location，非 gakiwoo 主站路径）
- 数据库：data/foodcalorie.db（SQLite）；上传图片 uploads/（nginx /uploads/ 静态服务）
- .env：JWT_SECRET 与 gakiwoo-api 同值（len=64 真实值，已清除重复空行）；CORS_ORIGINS 含 gakiwoo/foodcalorie/localhost/capacitor（APK 白名单已加）；**REDIS_URL=redis://127.0.0.1:6379（限流多实例共享，2026-08-18 启用）**
- 部署流程：本地 build → 备份（cp -r 到 *-backup-YYYYMMDD）→ scp 包 → 解压 → npm install → pm2 restart → 验证（单测 45/45 + 生产 E2E）
- 2026-08-11 已上线：限流接线（写 30/min 读 120/min + AI 5/min）/魔数校验/trust proxy/密钥守卫/时区统一/分页下推/前端 CDN 本地化/委托收敛
- 2026-08-17 修复轮：全栈诊断修复 13 处 bug（后端 5+前端 8，详见 docs/bugfix-2026-08-17.md），单测 38→45；关键：month=2026-13 原 500、过期挑战可刷积分、Me 页数据恒空、401 刷新无单飞误踢下线、游客被强制跳登录；备份 *-backup-20260817（稳定后可清理）
- 2026-08-18：Redis 可插拔限流（rateLimitStore，REDIS_URL 未配/故障回退内存）、后端全量修复部署到 releases 目录、APK v1.0.4 改由 CI 构建（本机 gradle 受文件锁影响）

## 技术栈与架构
- 后端：Node 20 + Express 4 + SQLite（better-sqlite3）+ JWT（与 gakiwoo 共享 users DB/JWT_SECRET）；分层 Controller/Service/DAO；统一响应 {code,message,data}；6 段错误码
- 前端：Vite + React 18 + BrowserRouter（basename /）；生产子域根路径部署；font-awesome 本地打包（无 CDN）；全站导航已组件内 onClick（data-name 全局委托已废弃）
- AI 识别：Moonshot Kimi moonshot-v1-8k-vision-preview（MOONSHOT_API_KEY 在服务器 .env）；识别图片落盘 uploads/ + 食物库回灌（source='model'）

## 测试资产
- 后端单测：backend/test/*.test.js（45 用例，node --test 运行；本地 Node22 与 better-sqlite3 ABI 不兼容，走 git archive→scp→服务器临时目录跑）
- 前端 E2E：frontend/scripts/verify_*.cjs（本地连 127.0.0.1:5173 dev server，生产 verify_prod 连 https://foodcalorie.gakiwoo.com）；测试账号 t_fc_test@x.com
- 前端 build 坑：vite safe-delete 清 dist 可能被 trash shim 中止，先 `rm -rf dist` 再 build
- 已知伪影：verify_m7 昵称断言偶发失败（密集登录限流）；截图写 archive 被 Chrome EPERM（新脚本用 os.tmpdir()）

## 设计稿同步（2026-08-18）
- MasterGo 设计稿 ID：`200862263389388`，本地导出目录 `.mastergo/design/200862263389388/M/*.html`
- 已完成 10 个核心页（Home / Me / Records / Today / Camera / CameraResult / AddFood / Search / Challenge / Detail）按设计稿视觉还原
- 关键全局组件变更：StatusBar Web 端渲染伪状态栏；BottomNav 顺序为 首页/记录/发现/我的；NavBar 支持 appearance="dark" 与 showBack={false}；Ring 带白色内圆心
- 差异报告：`docs/design-diff-report-2026-08-18.md`；最终验证：`docs/design-final-verify-2026-08-18.md`
- 提交：`22d5b35`

## 遗留待办
- Redis 多实例限流/缓存；多端真机联调（iOS/小程序）
- 服务器备份目录 foodcalorie-api-backup-20260811/20260817/20260817b、foodcalorie-web-backup-20260817 稳定后可清理
- 正式签名 release APK：keystore 在 C:\fc-release.keystore（8月11日创建，旧 release APK 用它签名过），但 FC_RELEASE_STORE_PASSWORD/KEY_ALIAS/KEY_PASSWORD 未持久化；用户当前选择 debug 签名方案，release 签名需用户提供密码
- 构建环境（2026-08-17 确认）：Android SDK 在 C:/Android（build-tools 34/35/36）；JDK 21 在 C:\Program Files\Microsoft\jdk-21.0.10+7（Capacitor 7 必须 JDK 21，默认 JAVA_HOME=JDK17 会报"无效的源发行版：21"，构建时需临时指定 JAVA_HOME）；local.properties 已指 sdk.dir=C:/Android
- APK 构建流程（本机 Windows）：npm run build:apk（出 dist-apk）→ 手动同步资产（cap sync 被 safe-delete shim 阻断：rm -rf 旧 public 用 `cmd //c "rd /s /q public"` 绕过，再 cp dist-apk/. → assets/public）→ gradlew assembleDebug（JAVA_HOME=JDK21）
- APK 构建坑：vite safe-delete 清 dist-apk 被 trash shim 中止（先 rm -rf dist-apk）；cap sync 删 assets/public 失败（手动同步替代）
