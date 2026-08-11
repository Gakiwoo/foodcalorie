# -*- coding: utf-8 -*-
"""守护脚本升级：nginx location 守护 + gakiwoo 白名单守护（防发布覆盖），并重跑子域 E2E"""
import paramiko
import time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, t=60):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

# 1. 升级守护脚本：追加 gakiwoo 白名单守护
NEW_GUARD = '''#!/bin/bash
# 食刻 nginx + gakiwoo 白名单守护：gakiwoo 发布流程会覆盖 sites-enabled/gakiwoo.com 与 release 白名单，
# 本脚本定时检查并恢复（由 cron 每 5 分钟调用）
CFG=/etc/nginx/sites-enabled/gakiwoo.com
LOCK=/tmp/foodcalorie-nginx-guard.lock
LOG=/var/log/foodcalorie-nginx-guard.log
[ -f "$LOCK" ] && exit 0
touch "$LOCK"
trap 'rm -f "$LOCK"' EXIT

# 1) nginx location 守护
if ! grep -q 'location /foodcalorie/' "$CFG" || ! grep -q 'location ^~ /api/v1/foodcalorie/' "$CFG"; then
  cp "$CFG" /etc/nginx/backups/gakiwoo.com.bak.$(date +%s).guard
  OUT=$(python3 /usr/local/bin/foodcalorie-nginx-inject.py "$CFG" 2>&1)
  if nginx -t >/dev/null 2>&1; then
    nginx -s reload
    echo "$(date '+%F %T') nginx 注入成功 ($OUT)" >> "$LOG"
  else
    LATEST=$(ls -t /etc/nginx/backups/gakiwoo.com.bak.*.guard 2>/dev/null | head -1)
    [ -n "$LATEST" ] && cp "$LATEST" "$CFG"
    echo "$(date '+%F %T') nginx 注入失败已回滚: $OUT" >> "$LOG"
  fi
fi

# 2) gakiwoo 白名单守护（release 发布后白名单会丢失，自动补回并重启 gakiwoo-api）
CURRENT=$(readlink -f /var/www/gakiwoo-current 2>/dev/null)
WL="$CURRENT/api/shared/config/allowedOrigins.js"
if [ -f "$WL" ] && ! grep -q 'foodcalorie.gakiwoo.com' "$WL"; then
  cp "$WL" "$WL.bak.$(date +%s).guard"
  sed -i "s|  'https://gakiwoo.com',|  'https://gakiwoo.com',\\n  'https://foodcalorie.gakiwoo.com',|" "$WL"
  if grep -q 'foodcalorie.gakiwoo.com' "$WL"; then
    pm2 restart gakiwoo-api >/dev/null 2>&1
    echo "$(date '+%F %T') 白名单已补回并重启 gakiwoo-api" >> "$LOG"
  fi
fi
'''
sftp = c.open_sftp()
with sftp.open('/usr/local/bin/foodcalorie-nginx-guard.sh', 'w') as f:
    f.write(NEW_GUARD)
sftp.close()
run('chmod +x /usr/local/bin/foodcalorie-nginx-guard.sh')
print('守护脚本已升级（含白名单守护）')

# 2. 模拟白名单丢失 → 守护自愈（快速验证）
out, _ = run('CURRENT=$(readlink -f /var/www/gakiwoo-current); WL="$CURRENT/api/shared/config/allowedOrigins.js"; sed -i "/foodcalorie.gakiwoo.com/d" "$WL"; grep -c foodcalorie "$WL" || echo 0')
print('模拟丢失后计数:', out)
run('bash /usr/local/bin/foodcalorie-nginx-guard.sh')
time.sleep(4)
out, _ = run('CURRENT=$(readlink -f /var/www/gakiwoo-current); grep foodcalorie "$CURRENT/api/shared/config/allowedOrigins.js"')
print('守护恢复:', out)
c.close()
