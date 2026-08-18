## 食刻 FoodCalorie v1.0.4

**拍照识别食物卡路里的健康饮食记录 App** —— Web 与 Android 双端同步发布。

### 本版变更（2026-08-18）

**🎨 设计稿还原（10 个核心页面按 MasterGo 设计稿对齐）**
- Home / Me / Records / Today / Camera / CameraResult / AddFood / Search / Challenge / Detail
- 全局：Web 伪状态栏、底部导航顺序修正（首页/记录/发现/我的）、环形图白心、NavBar dark 主题

**🐛 Bug 修复与加固（全面评估 4 P1 + 22 P2）**
- 月视图「今天」高亮修复、记录时间空值崩溃防护、401 会话失效正确跳转登录
- 后端：multer 错误码映射（413/400）、CSV 公式注入防护、JWT 算法白名单、SIGTERM 优雅关闭、日期日历校验、分页上限、上传目录一次性创建 + pending 图片 6h 清理
- Redis 可插拔限流：`REDIS_URL` 配置时多实例共享滑动窗口，故障自动回退内存

**⚡ 性能**
- 路由级代码分割（React.lazy）：主包 362KB → 200KB（gzip 97KB → 66KB）

**📱 APK 构建流程升级**
- 改由 GitHub Actions CI 自动构建并上传 artifact
- MainActivity 显式允许第三方 Cookie（APK 登录态持久化）
- 内置生产 API 地址，安装即用

### 📥 下载与安装

| 文件 | 说明 |
| --- | --- |
| `foodcalorie-v1.0.4-debug.apk` | Android 安装包（debug 签名，约 4.7MB） |

**安装步骤：**
1. 下载上方 APK 文件
2. 传输到 Android 手机（数据线 / 微信 / 网盘均可）
3. 点击安装，系统提示「未知来源」时允许本次安装
4. 打开「食刻」App，使用邮箱注册或登录（与 Web 端账号互通）

> ⚠️ 本版本为 **debug 签名**（CI 自动构建），适用于体验与真机联调；正式上架商店需 release 签名版本。
> 最低支持 Android 5.1+（minSdk 22）。

### ✅ 验证情况

- 后端单测 45/45 · 前端单测 14/14 · 生产 E2E 8/8 通过
- 生产环境已部署（https://foodcalorie.gakiwoo.com）
- 依赖审计 0 漏洞

### 🧩 技术栈

React 18 · Vite 8 · Capacitor 7 · Node 24 · Express 4 · SQLite · Kimi 视觉模型
