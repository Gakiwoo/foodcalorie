#!/bin/bash
# 食刻 nginx 守护：gakiwoo 发布流程会覆盖 sites-enabled/gakiwoo.com 并删除食刻 location，
# 本脚本定时检查并在缺失时注入 + reload（由 cron 每 5 分钟调用）
CFG=/etc/nginx/sites-enabled/gakiwoo.com
LOCK=/tmp/foodcalorie-nginx-guard.lock
LOG=/var/log/foodcalorie-nginx-guard.log

# 防止并发重入
[ -f "$LOCK" ] && exit 0
touch "$LOCK"
trap 'rm -f "$LOCK"' EXIT

# 两个 location 任一缺失 → 注入
if ! grep -q 'location /foodcalorie/' "$CFG" || ! grep -q 'location ^~ /api/v1/foodcalorie/' "$CFG"; then
  cp "$CFG" "$CFG.bak.$(date +%s).guard"
  OUT=$(python3 /usr/local/bin/foodcalorie-nginx-inject.py "$CFG" 2>&1)
  if nginx -t >/dev/null 2>&1; then
    nginx -s reload
    echo "$(date '+%F %T') 注入成功 ($OUT)" >> "$LOG"
  else
    # 校验失败 → 回滚
    LATEST=$(ls -t "$CFG".bak.*.guard 2>/dev/null | head -1)
    [ -n "$LATEST" ] && cp "$LATEST" "$CFG"
    echo "$(date '+%F %T') 注入失败已回滚: $OUT" >> "$LOG"
  fi
fi
