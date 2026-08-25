#!/usr/bin/env bash
# 食刻（FoodCalorie）SQLite 数据库备份脚本
# - 用 sqlite3 .backup 在线一致性备份（WAL 模式下安全，无需停服）
# - 保留策略：本地保留 7 份；如需异地副本，在 BACKUP_DIR 上挂对象存储/rsync 到另一主机
# 用法：./backup-foodcalorie.sh [DB_PATH] [BACKUP_DIR]
# cron 示例（每日 03:30，服务器时区）：
#   30 3 * * * /var/www/foodcalorie-api/ops/backup/backup-foodcalorie.sh /var/lib/gakiwoo/gakiwoo.db /var/backups/foodcalorie >> /var/log/foodcalorie-backup.log 2>&1
set -euo pipefail

DB_PATH="${1:-/var/lib/gakiwoo/gakiwoo.db}"
BACKUP_DIR="${2:-/var/backups/foodcalorie}"
KEEP="${KEEP:-7}"                       # 保留份数（含今日）
STAMP="$(date +%Y%m%d-%H%M%S)"
NAME="foodcalorie-${STAMP}.db"

if [[ ! -f "${DB_PATH}" ]]; then
  echo "[ERROR] DB not found: ${DB_PATH}" >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

# 一致性备份：SQLite 在线备份 API（比 cp 安全：WAL 未 checkpoint 的页也会纳入）
if ! sqlite3 "${DB_PATH}" ".backup '${BACKUP_DIR}/${NAME}'"; then
  echo "[ERROR] sqlite3 .backup failed (is sqlite3 installed?)" >&2
  exit 1
fi

# 完整性校验
if ! sqlite3 "${BACKUP_DIR}/${NAME}" "PRAGMA integrity_check;" | grep -q "^ok$"; then
  echo "[ERROR] integrity_check failed: ${BACKUP_DIR}/${NAME}" >&2
  exit 1
fi

# 保留策略：只保留最近 KEEP 份
ls -1t "${BACKUP_DIR}"/foodcalorie-*.db 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  rm -f "${old}"
  echo "[prune] ${old}"
done

echo "[OK] backup: ${BACKUP_DIR}/${NAME} ($(du -h "${BACKUP_DIR}/${NAME}" | cut -f1))"
