# -*- coding: utf-8 -*-
"""清理 sites-enabled 备份 + 修正守护脚本备份路径 + nginx -t/reload/验证"""
import paramiko
import time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, t=40):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

# 1. 建立 backups 目录，移走 sites-enabled 下所有 .bak*
run('mkdir -p /etc/nginx/backups')
out, _ = run('ls /etc/nginx/sites-enabled/*.bak* 2>/dev/null | wc -l')
print('待移动备份数:', out)
run('mv /etc/nginx/sites-enabled/*.bak* /etc/nginx/backups/ 2>/dev/null')
out, _ = run('ls /etc/nginx/sites-enabled/')
print('sites-enabled 剩余:', out)

# 2. 更新守护脚本（备份路径 → /etc/nginx/backups/）
NEW_GUARD = '''#!/bin/bash
# 食刻 nginx 守护：gakiwoo 发布流程会覆盖 sites-enabled/gakiwoo.com 并删除食刻 location，
# 本脚本定时检查并在缺失时注入 + reload（由 cron 每 5 分钟调用）
CFG=/etc/nginx/sites-enabled/gakiwoo.com
LOCK=/tmp/foodcalorie-nginx-guard.lock
LOG=/var/log/foodcalorie-nginx-guard.log
[ -f "$LOCK" ] && exit 0
touch "$LOCK"
trap 'rm -f "$LOCK"' EXIT
if ! grep -q 'location /foodcalorie/' "$CFG" || ! grep -q 'location ^~ /api/v1/foodcalorie/' "$CFG"; then
  cp "$CFG" /etc/nginx/backups/gakiwoo.com.bak.$(date +%s).guard
  OUT=$(python3 /usr/local/bin/foodcalorie-nginx-inject.py "$CFG" 2>&1)
  if nginx -t >/dev/null 2>&1; then
    nginx -s reload
    echo "$(date '+%F %T') 注入成功 ($OUT)" >> "$LOG"
  else
    LATEST=$(ls -t /etc/nginx/backups/gakiwoo.com.bak.*.guard 2>/dev/null | head -1)
    [ -n "$LATEST" ] && cp "$LATEST" "$CFG"
    echo "$(date '+%F %T') 注入失败已回滚: $OUT" >> "$LOG"
  fi
fi
'''
sftp = c.open_sftp()
with sftp.open('/usr/local/bin/foodcalorie-nginx-guard.sh', 'w') as f:
    f.write(NEW_GUARD)
sftp.close()
run('chmod +x /usr/local/bin/foodcalorie-nginx-guard.sh')
print('guard.sh 已更新')

# 3. nginx -t + reload + 验证
out, _ = run('nginx -t 2>&1')
print('nginx -t:', out[-120:])
if 'successful' in out:
    run('nginx -s reload')
    time.sleep(1)
    print('JS:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/assets/index-Dyq-rmQH.js')[0])
    print('CSS:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/assets/index-IyXDwmqf.css')[0])
    print('页面:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/login')[0])
    print('API:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/api/v1/foodcalorie/records')[0])
else:
    print('FAIL')
c.close()
