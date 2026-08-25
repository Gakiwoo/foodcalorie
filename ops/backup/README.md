# Backup & Recovery（食刻数据库备份与恢复）

## 备份

```bash
# 手动备份（默认库 /var/lib/gakiwoo/gakiwoo.db → /var/backups/foodcalorie/，保留 7 份）
/var/www/foodcalorie-api/ops/backup/backup-foodcalorie.sh

# 指定路径
./backup-foodcalorie.sh /path/to/foodcalorie.db /path/to/backup/dir
```

**cron（建议每日 03:30，避开业务高峰）：**

```
30 3 * * * /var/www/foodcalorie-api/ops/backup/backup-foodcalorie.sh >> /var/log/foodcalorie-backup.log 2>&1
```

要点：
- 使用 `sqlite3 .backup`（在线一致性快照），**不要用 `cp`**——WAL 模式下 cp 会漏掉未 checkpoint 的页。
- 脚本内置 `PRAGMA integrity_check` 校验，失败即非零退出并记日志。
- 保留 `KEEP`（默认 7）份后自动清理。
- **异地副本（强烈建议）**：将 `/var/backups/foodcalorie/` 挂载对象存储（如 OSS），或每日 `rsync -a /var/backups/foodcalorie/ user@other-host:/backups/foodcalorie/`。
- RPO ≈ 24h（每日一次）；如业务不可接受，改为每小时一次并调大 KEEP。

## 恢复

```bash
# 1) 停服，避免写入竞争
pm2 stop foodcalorie-api

# 2) 恢复（先备份损坏库再覆盖）
cp /var/lib/gakiwoo/gakiwoo.db /var/lib/gakiwoo/gakiwoo.db.corrupt-$(date +%Y%m%d)
sqlite3 /var/lib/gakiwoo/gakiwoo.db ".restore '/var/backups/foodcalorie/foodcalorie-20260825-033000.db'"

# 3) 校验并启动
sqlite3 /var/lib/gakiwoo/gakiwoo.db "PRAGMA integrity_check;"
pm2 start foodcalorie-api

# 4) 验证业务可用
curl -s http://127.0.0.1:3001/api/v1/foodcalorie/health
```

## 每季度演练建议

1. 用最新备份恢复到临时目录，起一个 `:3999` 实例，跑 `verify_prod.cjs`（环境变量指向临时实例）。
2. 记录 RTO（从故障到恢复可用的时间）并归档。
