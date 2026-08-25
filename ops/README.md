# Operations

Production configuration kept here is intentionally free of credentials. Secrets belong in the
server environment or CI secret store and must never be committed.

## Node.js runtime

Production uses Node.js 24 Active LTS from `/opt/node-v24/bin`. Install backend dependencies with
`/opt/node-v24/bin/npm ci --omit=dev`, then start the API through
`pm2 start /var/www/foodcalorie-api/ecosystem.config.cjs --only foodcalorie-api --update-env`.
The committed PM2 configuration pins the interpreter so a global PM2 daemon cannot silently fall
back to an end-of-life system Node.js release.

The production CORS allowlist must include the two exact Capacitor origins used by signed mobile
builds: `https://localhost` for Android and `capacitor://localhost` for iOS. Keep the allowlist
explicit; do not replace these entries with a wildcard when credentials are enabled.

## SSH baseline

`sshd/99-foodcalorie-hardening.conf` disables password authentication while retaining public-key
access. Deploy it as `/etc/ssh/sshd_config.d/99-foodcalorie-hardening.conf`, run `sshd -t`, reload
SSH, and verify a second public-key session before locking an existing account password.

## Release signing

Android release signing is configured with local Gradle properties or environment variables:

- `FC_RELEASE_STORE_FILE`
- `FC_RELEASE_STORE_PASSWORD`
- `FC_RELEASE_KEY_ALIAS`
- `FC_RELEASE_KEY_PASSWORD`

Never place these values in a tracked file.

### 一次性初始化：生成 keystore 并注入 GitHub Secrets

> CI（`.github/workflows/ci.yml` 的 `android-release` job）在 push `v*` tag 且
> 已配置 `FC_RELEASE_STORE_PASSWORD` Secret 时自动产出签名 APK 并上传 GitHub Releases。
> 以下步骤只需执行一次；keystore 丢失 = 无法再发同名应用更新，请离线加密备份。

```bash
# 1) 生成 keystore（在本机任意目录，不要放进仓库）
keytool -genkeypair -v \
  -keystore fc-release.keystore \
  -alias fc-release \
  -keyalg RSA -keysize 2048 -validity 3650 \
  -dname "CN=Gakiwoo, OU=FoodCalorie, O=Gakiwoo, L=Beijing, ST=Beijing, C=CN"

# 2) 加密备份（离线存储；密码本身也单独记录在密码管理器）
gpg -c fc-release.keystore   # 产物 fc-release.keystore.gpg

# 3) 读取 base64 供注入
base64 -w0 fc-release.keystore   # Linux/macOS；Windows: certutil -encode 后去头尾

# 4) 注入 GitHub Secrets（仓库 Settings → Secrets and variables → Actions）：
#    FC_KEYSTORE_BASE64        = 上一步 base64 输出（整串）
#    FC_RELEASE_STORE_PASSWORD = keystore 口令
#    FC_RELEASE_KEY_ALIAS      = fc-release
#    FC_RELEASE_KEY_PASSWORD   = 密钥口令（可与 keystore 口令相同）
```

验证：push `v1.0.5` tag → Actions `android-release` job 运行 → Releases 出现
`app-release.apk`（签名 + 未混淆；上架前再评估 R8 混淆）。

## Private uploads

Include `nginx/private-uploads.conf` in the FoodCalorie virtual host. The application serves images
through `/api/v1/foodcalorie/ai/images/:filename` after authenticating the owner. The underlying
upload directory must not be exposed with an nginx `alias`.
