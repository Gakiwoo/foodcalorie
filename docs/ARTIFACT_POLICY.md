# APK 产物管理规则

## 唯一正式来源

正式 APK 只由 GitHub Actions 使用发布密钥签名，并上传到 [GitHub Releases](https://github.com/Gakiwoo/foodcalorie/releases)。文件名必须包含语义版本和 Android `versionCode`：

```text
FoodCalorie-v<version>-code<versionCode>-release.apk
FoodCalorie-v<version>-code<versionCode>-release.apk.sha256
```

发布前流水线会校验 `applicationId=com.shike.app`、tag、`versionName`、`versionCode` 和 APK 签名。SHA-256 文件用于下载后校验完整性。

## 开发产物

- `frontend/android/app/build/`、仓库根目录和临时下载目录不得作为交付目录。
- debug APK 使用 Android 调试证书，可能无法覆盖安装正式版；它只用于短期测试。
- APK 由 `.gitignore` 排除，不应提交到 Git。需要留存的旧包移到仓库外，并明确标注为不可交付。

## 升级规则

- 每次正式发布必须同时提升语义版本和 `versionCode`，统一使用 `node scripts/release-bump.mjs <version>`。
- Android 只允许相同应用 ID、相同签名且 `versionCode` 更高的 APK 原位升级。
- 设备若安装过 debug 签名包，切换正式版时需先卸载旧包；卸载会清除应用本地数据，应先确认数据已同步。
- 线上回退采用“向前修复”：发布更高 `versionCode` 的修复版，不用旧 APK 覆盖新版本。
