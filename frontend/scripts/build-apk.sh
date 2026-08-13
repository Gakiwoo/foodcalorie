#!/usr/bin/env bash
set -euo pipefail

TASK="${1:-assembleRelease}"
case "$TASK" in
  assembleDebug|assembleRelease|bundleRelease) ;;
  *) echo "Unsupported Gradle task: $TASK" >&2; exit 2 ;;
esac

FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export VITE_API_ORIGIN="${VITE_API_ORIGIN:-https://foodcalorie.gakiwoo.com}"

cd "$FRONTEND_DIR"
npm run build:apk
npx cap sync android

cd android
./gradlew "$TASK" --no-daemon

echo "Android build completed: $TASK"
