## 食刻 FoodCalorie v1.0.6

**拍照识别食物卡路里的健康饮食记录 App** —— Web 与 Android 双端同步发布。

### 本版变更（2026-08-28）

**🎨 设计系统落地**
- 新增 `src/ui/theme.js` 设计令牌（颜色/间距/圆角/阴影/字号/层级）与 `src/ui/components/` 页面原语（PageContainer/ListItem/PrimaryButton/SectionHeader/StatBadge）
- 全部 31 个页面接入统一组件与令牌；新增 404 页与通配路由

**🐛 缺陷修复**
- 会话过期用户 401 后正确跳转登录页（此前被困当前页）
- 月视图「今天」高亮修复（todayStr 函数引用比较恒 false）
- Home/Today 记录时间空值整页崩溃防护
- 后端：内容浏览量事务内原子读增、AI 识别过滤 0 卡路里幻觉候选、export 接口独立限流、过期图片清理移出上传路径、补查询索引

**✅ 质量基建**
- 前端新增 31 页面 vitest 冒烟套件（34 文件 / 376 用例，页面全覆盖）
- 后端单测扩至 58 用例（新增 foods / contents / profiles 域）
- 双端 ESLint 零告警；`npm audit` 0 漏洞

**🔧 发布链路打通（首个 release 正式签名版本）**
- 修复 ci.yml android-release 两处 working-directory 缺陷（secrets 缺失跳过崩溃、APK 上传路径错位）
- 生成 release keystore 并注入 GitHub Secrets，v1.0.6 起发布正式签名 APK

### 📥 下载与安装

| 文件 | 说明 |
| --- | --- |
| `app-release.apk` | Android 安装包（**release 正式签名**，约 3.99MB） |

**安装步骤：**
1. 下载上方 APK 文件
2. 传输到 Android 手机（数据线 / 微信 / 网盘均可）
3. 点击安装，系统提示「未知来源」时允许本次安装
4. 打开「食刻」App，使用邮箱注册或登录（与 Web 端账号互通）

> ⚠️ 本版本起为 **release 正式签名**。此前安装过 debug 签名版本（v1.0.4 及更早）的用户需**先卸载旧版**再安装（签名不同无法覆盖安装）。
> 最低支持 Android 5.1+（minSdk 22）。

### ✅ 验证情况

- 后端单测 58/58 · 前端单测 376/376 · CI 全绿（security/backend/frontend/android-debug/android-release）
- 签名 APK 由 GitHub Actions `assembleRelease` 构建并自动上传
- 依赖审计 0 漏洞

### 🧩 技术栈

React 18 · Vite 8 · Capacitor 7 · Node 24 · Express 4 · SQLite · Kimi 视觉模型
