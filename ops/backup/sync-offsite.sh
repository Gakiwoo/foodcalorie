#!/usr/bin/env bash
# 异地备份同步（可选加固）：将本地备份目录增量同步到远端主机/对象存储挂载点。
# 用法：./sync-offsite.sh [LOCAL_BACKUP_DIR] [REMOTE_TARGET]
#   LOCAL_BACKUP_DIR  默认 /var/backups/foodcalorie（backup-foodcalorie.sh 的输出目录）
#   REMOTE_TARGET     默认 rsync://user@backup-host:/backups/foodcalorie
#                     （也可以是 OSS 挂载目录，如 /mnt/oss/backups/foodcalorie）
# cron 示例（备份后 1 小时执行）：
#   30 4 * * * /var/www/foodcalorie-api/ops/backup/sync-offsite.sh >> /var/log/foodcalorie-backup.log 2>&1
set -euo pipefail

LOCAL_DIR="${1:-/var/backups/foodcalorie}"
REMOTE_TARGET="${2:-rsync://user@backup-host:/backups/foodcalorie}"

if [[ ! -d "${LOCAL_DIR}" ]]; then
  echo "[ERROR] local backup dir not found: ${LOCAL_DIR}" >&2
  exit 1
fi

# --archive --delete：增量同步 + 与本地一致（本地保留策略已裁剪旧备份，远端自动跟随）
rsync -avz --delete "${LOCAL_DIR}/" "${REMOTE_TARGET}/"

echo "[OK] offsite sync done: ${LOCAL_DIR} -> ${REMOTE_TARGET}"
