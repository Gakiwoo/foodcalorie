# 食刻 FoodCalorie 发布手册

本流程用于 Web、API 与 Android 正式版发布。GitHub 和 Codeup 的 `main` 及发布 tag 必须指向同一提交。

## 1. 发布前门禁

```bash
cd backend && npm ci && npm run lint && npm test && npm audit --audit-level=high
cd ../frontend && npm ci && npm run lint && npm test && npm run build && npm audit --audit-level=high
cd .. && node scripts/check-secrets.mjs
```

同时确认：

- 工作区除本次变更外无未提交文件。
- `origin/main`、`codeup/main` 与本地基线同步。
- GitHub Actions 的发布签名与部署 Secrets 已配置。
- 正式 APK 只从 GitHub Release 交付，不使用本地或 debug APK。

## 2. 提升版本

```bash
node scripts/release-bump.mjs <x.y.z>
node scripts/verify-release-version.mjs v<x.y.z>
```

脚本会拒绝同版本和降版本，并在校验 Web/Android 当前版本一致后，将 `versionCode` 加一。提交前检查版本文件与发布说明。

## 3. 合并与双远端同步

修复分支同时推送到 GitHub 和 Codeup；GitHub PR 的 CI 全绿后合并。随后拉取 `origin/main` 并将相同提交推到 Codeup：

```bash
git fetch origin --prune
git fetch codeup --prune
git switch main
git pull --ff-only origin main
git push codeup main
```

## 4. 打 tag 发布

```bash
git tag -a v<x.y.z> -m "食刻 v<x.y.z>"
git push origin v<x.y.z>
git push codeup v<x.y.z>
```

tag 自动触发：

1. CI 完整质量门禁与 Android debug 构建。
2. release job 校验 tag、应用 ID、版本、签名，发布带版本号的正式 APK 和 SHA-256。
3. deploy job 备份、部署 Web/API、写入同一提交标记并执行健康检查。

## 5. 发布后验证

- GitHub Release 附件名包含正确的 `versionName` 与 `versionCode`，SHA-256 可校验。
- 真机从上一正式版直接覆盖升级，应用名称、图标、登录与关键页面正确。
- `https://foodcalorie.gakiwoo.com` 可访问，页面无伪造系统状态栏。
- `https://foodcalorie.gakiwoo.com/api/v1/foodcalorie/health` 返回 200。
- 服务器 Web/API 的 `RELEASE_SHA` 均等于发布提交短 SHA。

## 6. 回滚

| 范围 | 处理方式 |
| --- | --- |
| API | 从 `/var/backups/foodcalorie/deploy/` 恢复最近备份，重装生产依赖并重启 PM2 |
| Web | 恢复上一份已验证的静态产物并重新冒烟 |
| 数据库 | 按 `ops/backup/README.md` 恢复，并执行完整性检查 |
| APK | 不降 `versionCode`；修复后发布更高版本。仅在用户知晓本地数据会被清除时才卸载重装旧包 |

故障处置完成后，要重新核对本地、服务器、GitHub、Codeup 四端提交标记。
