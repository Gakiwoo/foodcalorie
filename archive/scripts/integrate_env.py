# -*- coding: utf-8 -*-
"""Phase A：正式环境接入
1) 备份 gakiwoo.db 与 foodcalorie-api/.env
2) JWT_SECRET ← /etc/gakiwoo/api.env 同源（服务端复制，全程不显示值）
3) DB_PATH ← /var/lib/gakiwoo/gakiwoo.db（共享 users 表）
4) pm2 restart + 一致性自检
"""
import paramiko, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

SHELL = r'''#!/usr/bin/env bash
set -e
TS=$(date +%s)
SECRET_SRC=/etc/gakiwoo/api.env
FC_ENV=/var/www/foodcalorie-api/.env
DB=/var/lib/gakiwoo/gakiwoo.db

[ -f "$SECRET_SRC" ] || { echo "FAIL: no $SECRET_SRC"; exit 1; }
grep -qE '^JWT_SECRET=.+' "$SECRET_SRC" || { echo "FAIL: JWT_SECRET missing in $SECRET_SRC"; exit 1; }
[ -f "$DB" ] || { echo "FAIL: db not found $DB"; exit 1; }

# 1. 数据库安全备份
BK=/var/backups/gakiwoo/gakiwoo-pre-foodcalorie-$TS.db
if [ ! -f "$BK" ]; then
  cp "$DB" "$BK" && echo "DB 备份: $BK"
fi

# 2. .env 备份
[ -f "$FC_ENV" ] && cp "$FC_ENV" "$FC_ENV.bak.$TS" && echo ".env 备份: $FC_ENV.bak.$TS"

# 3. 重建 .env（剔除旧 JWT_SECRET/DB_PATH，追加同源密钥 + 共享库路径）
grep -vE '^(JWT_SECRET|DB_PATH)=' "$FC_ENV" > /tmp/fc.env.new
grep -E '^JWT_SECRET=' "$SECRET_SRC" >> /tmp/fc.env.new
echo 'DB_PATH=/var/lib/gakiwoo/gakiwoo.db' >> /tmp/fc.env.new
mv /tmp/fc.env.new "$FC_ENV"
echo ".env 已更新"

# 4. 一致性自检（只比较，不显示值）
S1=$(grep -E '^JWT_SECRET=' "$SECRET_SRC")
S2=$(grep -E '^JWT_SECRET=' "$FC_ENV")
[ "$S1" = "$S2" ] && echo "CHECK_OK_JWT" || { echo "CHECK_FAIL_JWT"; exit 1; }
grep -q '^DB_PATH=/var/lib/gakiwoo/gakiwoo.db$' "$FC_ENV" && echo "CHECK_OK_DBPATH" || { echo "CHECK_FAIL_DBPATH"; exit 1; }

# 5. 重启
pm2 restart foodcalorie-api >/dev/null 2>&1 && echo "PM2_RESTARTED"
sleep 3
pm2 list | grep foodcalorie-api
'''

sftp = client.open_sftp()
with sftp.open('/tmp/fc-integrate.sh', 'w') as f:
    f.write(SHELL)
sftp.close()

def run(cmd, timeout=120):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

out, err = run('bash /tmp/fc-integrate.sh 2>&1')
print(out)
if err:
    print('[stderr]', err[:300])

# 6. 接口自检
time.sleep(2)
out, _ = run('curl -s -m 8 http://127.0.0.1:3001/api/v1/health')
print('\nhealth:', out)

# 7. 共享库表结构（只读）
out, _ = run(r'''node -e "const D=require('/var/www/foodcalorie-api/node_modules/better-sqlite3');const db=new D('/var/lib/gakiwoo/gakiwoo.db',{readonly:true});const t=db.prepare(\"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name\").all().map(x=>x.name);console.log('tables:',t.join(', '));const u=db.prepare('SELECT COUNT(*) c FROM users').get();console.log('users:',u.c);" 2>&1''')
print('共享库:', out[:600])

client.close()
print('\n===== Phase A 完成 =====')
