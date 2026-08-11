# 食刻（FoodCalorie）项目长期记忆

## 部署与运维（重要）
- 服务器：root@123.57.102.126（gakiwoo 同服务器），**本机 id_ed25519 已免密授权**（ssh root@123.57.102.126 直接可连，无需密码——用户记忆里只记录了密码 WUjiaqi1006!，实际密钥已可用）
- 后端：/var/www/foodcalorie-api，PM2 `foodcalorie-api`，监听 127.0.0.1:3001（已收敛内网）
- 前端：/var/www/foodcalorie-web（dist 静态，子域 https://foodcalorie.gakiwoo.com，nginx 独立 location，非 gakiwoo 主站路径）
- 数据库：data/foodcalorie.db（SQLite）；上传图片 uploads/（nginx /uploads/ 静态服务）
- .env：JWT_SECRET 与 gakiwoo-api 同值（len=64 真实值，已清除重复空行）；CORS_ORIGINS 含 gakiwoo/foodcalorie/localhost/capacitor（APK 白名单已加）
- 部署流程：本地 build → 备份（cp -r 到 *-backup-YYYYMMDD）→ scp 包 → 解压 → npm install → pm2 restart → 验证（单测 33/33 + 生产 E2E）
- 2026-08-11 已上线：限流接线（写 30/min 读 120/min + AI 5/min）/魔数校验/trust proxy/密钥守卫/时区统一/分页下推/前端 CDN 本地化/委托收敛

## 技术栈与架构
- 后端：Node 20 + Express 4 + SQLite（better-sqlite3）+ JWT（与 gakiwoo 共享 users DB/JWT_SECRET）；分层 Controller/Service/DAO；统一响应 {code,message,data}；6 段错误码
- 前端：Vite + React 18 + BrowserRouter（basename /）；生产子域根路径部署；font-awesome 本地打包（无 CDN）；全站导航已组件内 onClick（data-name 全局委托已废弃）
- AI 识别：Moonshot Kimi moonshot-v1-8k-vision-preview（MOONSHOT_API_KEY 在服务器 .env）；识别图片落盘 uploads/ + 食物库回灌（source='model'）

## 测试资产
- 后端单测：backend/test/*.test.js（33 用例，node --test 运行）
- 前端 E2E：frontend/scripts/verify_*.cjs（本地连 127.0.0.1:5173 dev server，生产 verify_prod 连 https://foodcalorie.gakiwoo.com）；测试账号 t_fc_test@x.com
- 已知伪影：verify_m7 昵称断言偶发失败（密集登录限流）；截图写 archive 被 Chrome EPERM（新脚本用 os.tmpdir()）

## 遗留待办
- multer 1.x→2.x 升级（1.x 已知漏洞）
- APK 打包（Android SDK 未装；前端已就绪：VITE_API_BASE 支持 + CDN 本地化 + CORS 白名单）
- Redis 多实例限流/缓存；多端真机联调（iOS/小程序）
- 服务器备份目录 foodcalorie-api-backup-20260811 稳定后可清理
