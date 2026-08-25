# 食刻 FoodCalorie 发布演练手册（Release Playbook）

> 基于 2026-08-25 发布演练编写：9 项门禁全部实测通过，bump 脚本干跑验证。
> 目标版本示例：**v1.0.5**。全流程约 30 分钟（不含 CI 构建等待）。

---

## 0. 前置条件（一次性，发布前必须完成）

| # | 事项 | 命令/操作 | 状态 |
| --- | --- | --- | --- |
| P1 | 生产测试账号**密码轮换** | 登录服务器/账号后台改密；E2E 凭据改由环境变量注入（仓库已零凭据） | ⏳ **需你操作** |
| P2 | 生成发布 **keystore** | 见 `ops/README.md`「Release signing」：`keytool -genkeypair ...` → gpg 加密备份 → base64 | ⏳ **需你操作** |
| P3 | 注入 GitHub Secrets（4 项） | `FC_KEYSTORE_BASE64` / `FC_RELEASE_STORE_PASSWORD` / `FC_RELEASE_KEY_ALIAS` / `FC_RELEASE_KEY_PASSWORD` | ⏳ 依赖 P2 |
| P4 | （可选）部署 Secrets | `DEPLOY_SSH_KEY` / `DEPLOY_HOST`（启用 `.github/workflows/deploy.yml` 自动部署） | ⏳ 可选 |
| P5 | 本地环境 | Node 24（`.nvmrc`）、JDK 21 + Android SDK **仅 CI 需要**（本机 JDK 17 无 SDK，APK 一律走 CI） | ✅ 已确认 |

---

## 1. 发布前检查（约 5 分钟，本机执行）

```bash
# 一键门禁（本手册撰写日全部通过）
cd backend  && npm run lint && npm test          # ✅ 0 error / 58/58
cd frontend && npm run lint && npm test && npm run build  # ✅ 0 error / 26/26 / build OK
node scripts/check-secrets.mjs                   # ✅ Secret scan passed
```

- [ ] 后端 lint + 58 测试
- [ ] 前端 lint + 26 测试 + 构建
- [ ] 密钥扫描通过（当前仓库零凭据、零豁免点）
- [ ] `git status` 干净（**当前有 99 项未提交改动**，发布前必须先提交）
- [ ] 版本号一致（`frontend/src/version.js` = `android/app/build.gradle versionName`）

## 2. 版本号同步（自动，勿手改）

```bash
node scripts/release-bump.mjs 1.0.5
# 输出示例：[bump] OK: version=1.0.5 versionCode=5 -> 6 build=20260825
# 同步更新：frontend/src/version.js（APP_VERSION/APP_BUILD）与 build.gradle（versionCode+1/versionName）
```

- [ ] 手动验证：`Select-String` 两处版本号 = 1.0.5 / versionCode 6

## 3. 提交与推送

```bash
git add -A
git commit -m "chore: release v1.0.5（版本号同步）"
git push origin main
```

- [ ] 推送后 CI 自动跑 4 个 job（security / backend / frontend / android-debug）
- [ ] 等 Actions 全绿（约 5-8 分钟；`npm ci` + gradle 缓存生效）

## 4. 打 tag 触发发布

```bash
git tag -a v1.0.5 -m "食刻 v1.0.5"
git push origin v1.0.5
```

推 tag 后自动触发：
1. **CI `android-release` job**（需 P3 Secrets 已配）：keystore 解码 → `assembleRelease` → 创建 GitHub Release + 上传 `app-release.apk`（签名）
2. **CI `android-debug` job**：debug APK → artifact（7 天）
3. **（若启用）deploy.yml**：自动部署生产 + 备份 + 冒烟

- [ ] Actions 页面确认 `android-release` 已运行（若显示 skipped，检查 P3 是否注入）
- [ ] Releases 页面出现 v1.0.5 与 `app-release.apk` 附件

## 5. 发布后验证（约 5 分钟）

```bash
# 生产 API 冒烟
curl -s https://foodcalorie.gakiwoo.com/api/v1/foodcalorie/health

# 生产 E2E（需先设置新密码环境变量）
cd frontend/scripts
FC_TEST_EMAIL=t_fc_test@x.com FC_TEST_PASSWORD=<轮换后的密码> node verify_prod.cjs
```

- [ ] health 200
- [ ] 生产 E2E 全绿（登录/记录/添加/相机/清理）
- [ ] APK 安装到真机验证登录态（v1.0.4 遗留项：APK 登录态真机联调）

## 6. 回滚方案

| 场景 | 操作 |
| --- | --- |
| 后端回归 | 服务器 `/var/backups/foodcalorie/deploy/foodcalorie-api-*.tgz`（deploy 自动保留 5 份）→ 解压还原 → `pm2 restart foodcalorie-api` |
| 前端回退 | 用旧 `dist` 覆盖 `/var/www/foodcalorie-web/dist` |
| 数据库 | `ops/backup/README.md` 恢复手册（`.restore` + integrity_check + 冒烟） |
| APK 版本 | Releases 保留历史 APK，用户重装旧版即可 |

## 7. 发布后收尾

- [ ] 更新 `docs/release-notes-v1.0.5.md`（参照 v1.0.4 模板）
- [ ] 根 README「下载与安装」版本号 → v1.0.5
- [ ] 轮换后的测试账号密码仅存密码管理器，不再入库

---

## 演练实测记录（2026-08-25）

| 步骤 | 结果 |
| --- | --- |
| 9 项发布门禁（后端 lint/test、前端 lint/test/build、扫描器、E2E 语法、YAML×2、凭据模块） | ✅ 全部通过 |
| `release-bump.mjs 1.0.5` 干跑 | ✅ 正确产出 1.0.5 / versionCode 6 / build 20260825（演练后已还原） |
| 本机 APK 构建 | ⚠️ 不可行（JDK 17 / 无 ANDROID_HOME）→ **按设计走 CI**（CI 用 JDK 21 + gradle 缓存） |
| git tag 历史 | ⚠️ **仓库尚无任何 tag**，v1.0.5 将是首个 tag 发布 |
| 阻塞项 | P1（密码轮换）、P2/P3（keystore + Secrets）——均需仓库所有者操作 |
