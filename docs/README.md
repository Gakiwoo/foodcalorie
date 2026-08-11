# 食刻（FoodCalorie）App 项目总览

**食刻** — 拍照识别食物卡路里的健康饮食记录 App。全栈已完成：前端 31 页 React（Vite），后端 9 模块 Express + SQLite，生产已部署至独立子域名。

> **最新、最全的文件结构索引见 [`docs/PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md)**（2026-08-07 整理，含归档清单与运维要点）。本文件为项目入口概览。

---

## 当前状态（2026-08-07）

| 维度 | 状态 |
|------|------|
| 前端 | ✅ 31 页全部接真实 API（仅 Privacy/About/Help 纯内容页） |
| 后端 | ✅ 9 模块 / 16 接口 / 单测 27/27 / Kimi 视觉识别真实可用 |
| 生产 | ✅ https://foodcalorie.gakiwoo.com （独立子域，P0 三项完成，双守护自愈） |
| 验证 | ✅ 本地 E2E 9 套 + 生产 E2E 8/8 + 单测 27/27 |

## 目录结构（精简）

```
2026-08-05-10-22-23/
├── frontend/          # Vite + React 18 + react-router-dom 6
│   ├── App.jsx        # 路由表 + 全局 NAV 委托（静态/遗留页）
│   ├── main.jsx       # 入口（BrowserRouter，生产 basename 环境切换）
│   ├── FoodCalorie-*.jsx  # 31 个页面组件（真实数据组件）
│   ├── FoodCalorie-Help.html  # ⚠️ 唯一保留的 ?raw 嵌入源（Help.jsx 依赖，勿删）
│   ├── src/           # api(client/auth) + ui(common/toast)
│   ├── scripts/       # 12 个核心 E2E 验证脚本（verify_*.cjs）
│   └── dist-prod3/    # 当前生产构建（已部署）
├── backend/           # Express + better-sqlite3（Controller/Service/DAO）
│   ├── src/           # app.js / server.js / db.js / modules(9) / shared
│   ├── test/          # node:test 单测（4 文件，27 用例）
│   ├── README.md      # 开发/部署/运维手册
│   ├── SPEC.md        # 原始需求规格
│   └── ASSESSMENT.md  # 完成度评估 + 遗留项清单
├── docs/
│   ├── PROJECT_STRUCTURE.md  # ★ 文件结构索引（维护首选）
│   └── pages-inventory.md    # 页面清单（路由/组件）
├── archive/           # 归档区（脚本/原型/截图/旧构建，只读参考）
├── react-app-backup/  # 历史备份（与 archive/react-app-backup 相同，可删除）
├── .mastergo/         # MasterGo 设计稿数据（勿动）
└── .workbuddy/memory/ # 每日开发记忆（含踩坑记录）
```

## 前端快速启动

```bash
cd frontend
npm install          # 首次
npm run dev          # 开发预览 → http://localhost:5173
npm run build        # 生产构建
```

> dev 代理：`/api/auth` → https://gakiwoo.com（登录服务）、`/api/v1` → 同域 nginx → 3001。详见 `PROJECT_STRUCTURE.md` §2.1。

## 关键链接

- 生产入口：https://foodcalorie.gakiwoo.com
- 测试账号：`t_fc_test@x.com` / `Test123456!`
- 后端文档：`backend/README.md`、`backend/ASSESSMENT.md`
- 文件索引：`docs/PROJECT_STRUCTURE.md`
