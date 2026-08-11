#!/bin/bash
# 食刻 APK 构建（WorkBuddy 环境适配版）
# 原理：环境禁止"删除/覆盖"文件（所有进程）→ 每次构建使用全新目录（只创建不删除）
#  - C:/fc-cap-<ts>  capacitor-android 副本（settings 指向它，build 产物不出现在 E 盘）
#  - C:/fc-ab-<ts>   android 工程副本（全新无 build）
#  - C:/fc-gh-<ts>   GRADLE_USER_HOME（native/依赖缓存全新，规避 native-platform 二次加载失败）
#  - C:/fc-pc-<ts>   project-cache（全新，规避锁文件被拒）
set -e
TS=$(date +%s)
SRC_ANDROID="E:/00-Vibeo Coding/Foodcalorie/frontend/android"
SRC_CAP="E:/00-Vibeo Coding/Foodcalorie/frontend/node_modules/@capacitor/android/capacitor"
AB="C:/fc-ab-$TS"
CAP="C:/fc-cap-$TS"
GH="C:/fc-gh-$TS"
PC="C:/fc-pc-$TS"

echo "[1/5] 复制工程到 $AB ..."
mkdir -p "$AB" && cp -r "$SRC_ANDROID/." "$AB/"
echo "[2/5] 复制 capacitor 模块到 $CAP ..."
mkdir -p "$CAP" && cp -r "$SRC_CAP/." "$CAP/"
sed -i "s|new File('../node_modules/@capacitor/android/capacitor')|new File('$CAP')|" "$AB/capacitor.settings.gradle"
# 注入 debug 签名配置（~/.android 被保护，改用 C 盘 keystore）
sed -i "/android {/a\\
\\    signingConfigs {\\n\\        debug {\\n\\            storeFile file('C:/fc-debug.keystore')\\n\\            storePassword 'android'\\n\\            keyAlias 'androiddebugkey'\\n\\            keyPassword 'android'\\n\\        }\\n\\    }" "$AB/app/build.gradle"
grep -A6 "signingConfigs" "$AB/app/build.gradle" | head -8
echo "[3/5] 构建 APK（全新缓存）..."
cd "$AB"
export ANDROID_HOME="C:/Android"
export GRADLE_USER_HOME="$GH"
"C:/fc-gradle/gradle-8.2.1/bin/gradle.bat" assembleDebug --no-daemon --project-cache-dir "$PC" > "$AB/run.log" 2>&1 || { echo "[FAIL] 构建失败，日志："; tail -20 "$AB/run.log"; exit 1; }
echo "[4/5] 构建成功，拷贝 APK ..."
APK="$AB/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK" ]; then
  cp "$APK" "E:/00-Vibeo Coding/Foodcalorie/frontend/dist/foodcalorie-debug.apk"
  echo "[5/5] APK: E:/00-Vibeo Coding/Foodcalorie/frontend/dist/foodcalorie-debug.apk"
  ls -la "E:/00-Vibeo Coding/Foodcalorie/frontend/dist/foodcalorie-debug.apk"
else
  echo "[FAIL] APK 未生成，日志尾部："; tail -20 "$AB/run.log"; exit 1
fi
