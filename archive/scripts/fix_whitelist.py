# -*- coding: utf-8 -*-
"""修正白名单：改 release 版本（pm2 实际加载）→ 重启 → 重测登录；回滚旧目录修改"""
import paramiko
import time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, t=60):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

# 1. release 版本白名单追加
RELEASE = '/var/www/gakiwoo-releases/20260806T142039Z-ddff3868cc69/api/shared/config/allowedOrigins.js'
run('cp ' + RELEASE + ' ' + RELEASE + '.bak-$(date +%s).subdomain')
out, _ = run('cat ' + RELEASE)
cfg = out
if 'foodcalorie.gakiwoo.com' not in cfg:
    cfg = cfg.replace("  'https://gakiwoo.com',", "  'https://gakiwoo.com',\n  'https://foodcalorie.gakiwoo.com',", 1)
    sftp = c.open_sftp()
    with sftp.open(RELEASE, 'w') as f:
        f.write(cfg)
    sftp.close()
    print('release 白名单已加 foodcalorie')
out, _ = run('grep foodcalorie ' + RELEASE)
print('确认:', out)

# 2. 重启 gakiwoo-api
run('pm2 restart gakiwoo-api')
time.sleep(4)

# 3. 重测登录（带 Origin）
out, _ = run(
    'curl -s -m 8 -X POST https://foodcalorie.gakiwoo.com/api/auth/login '
    '-H "Content-Type: application/json" -H "Origin: https://foodcalorie.gakiwoo.com" '
    '-d \'{"email":"t_fc_test@x.com","password":"Test123456!"}\' | head -c 200'
)
print('重测登录(带Origin):', out)

# 4. 回滚旧目录的误改（恢复备份）
run('mv -f /var/www/gakiwoo-api/shared/config/allowedOrigins.js.bak-*.subdomain /var/www/gakiwoo-api/shared/config/allowedOrigins.js 2>/dev/null || true')
out, _ = run('grep -c foodcalorie /var/www/gakiwoo-api/shared/config/allowedOrigins.js || echo 0')
print('旧目录已回滚(foodcalorie 计数):', out)
c.close()
