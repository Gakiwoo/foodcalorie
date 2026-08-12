#!/bin/bash
# 食刻 APK 构建（WorkBuddy 环境适配版 + release 签名）
# 原理：环境禁止"删除/覆盖"文件（所有进程）→ 每次构建使用全新目录（只创建不删除）
#  - C:/fc-cap-<ts>  capacitor-android 副本
#  - C:/fc-ab-<ts>   android 工程副本（全新无 build）
#  - C:/fc-gh-<ts>   GRADLE_USER_HOME（native/依赖缓存全新）
#  - C:/fc-pc-<ts>   project-cache（全新）
# 用法：build-apk.sh [assembleDebug|assembleRelease]（默认 assembleRelease）
set -e
TASK="${1:-assembleRelease}"
TS=$(date +%s)
SRC_ANDROID="E:/00-Vibeo Coding/Foodcalorie/frontend/android"
SRC_CAP="E:/00-Vibeo Coding/Foodcalorie/frontend/node_modules/@capacitor/android/capacitor"
AB="C:/fc-ab-$TS"
CAP="C:/fc-cap-$TS"
GH="C:/fc-gh-$TS"
PC="C:/fc-pc-$TS"
VARIANT=$(echo "$TASK" | sed 's/assemble//' | tr 'A-Z' 'a-z')

echo "[1/5] 复制工程到 $AB ..."
mkdir -p "$AB" && cp -r "$SRC_ANDROID/." "$AB/"
echo "[2/5] 复制 capacitor 模块到 $CAP ..."
mkdir -p "$CAP" && cp -r "$SRC_CAP/." "$CAP/"
sed -i "s|new File('../node_modules/@capacitor/android/capacitor')|new File('$CAP')|" "$AB/capacitor.settings.gradle"
# debug 签名：注入 C 盘 keystore（~/.android 被保护）
sed -i "/android {/a\\
\\    signingConfigs {\\n\\        debug {\\n\\            storeFile file('C:/fc-debug.keystore')\\n\\            storePassword 'android'\\n\\            keyAlias 'androiddebugkey'\\n\\            keyPassword 'android'\\n\\        }\\n\\    }" "$AB/app/build.gradle"
# 注入 APK 版 Web assets（dist-apk：相对路径 ./assets + es2015 + VITE_API_BASE）
rm -rf "$AB/app/src/main/assets/public" 2>/dev/null || true
mkdir -p "$AB/app/src/main/assets"
cp -r "E:/00-Vibeo Coding/Foodcalorie/frontend/dist-apk" "$AB/app/src/main/assets/public"
echo "[2.5] Web assets 注入完成"
echo "[3/5] 构建 $TASK（全新缓存）..."
cd "$AB"
export ANDROID_HOME="C:/Android"
export GRADLE_USER_HOME="$GH"
"C:/fc-gradle/gradle-8.2.1/bin/gradle.bat" $TASK --no-daemon --project-cache-dir "$PC" > "$AB/run.log" 2>&1 || { echo "[FAIL] 构建失败，日志："; tail -20 "$AB/run.log"; exit 1; }
echo "[4/5] 构建成功，拷贝 APK ..."
APK="$AB/app/build/outputs/apk/$VARIANT/app-$VARIANT.apk"
if [ -f "$APK" ]; then
  cp "$APK" "E:/00-Vibeo Coding/Foodcalorie/frontend/dist/foodcalorie-$VARIANT.apk"
  echo "[5/5] APK: E:/00-Vibeo Coding/Foodcalorie/frontend/dist/foodcalorie-$VARIANT.apk"
  ls -la "E:/00-Vibeo Coding/Foodcalorie/frontend/dist/foodcalorie-$VARIANT.apk"
else
  echo "[FAIL] APK 未生成，查找 outputs/apk 下文件..."; find "$AB/app/build/outputs/apk" -name "*.apk" 2>/dev/null; tail -20 "$AB/run.log"; exit 1
fi
