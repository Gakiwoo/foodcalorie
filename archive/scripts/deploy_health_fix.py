# -*- coding: utf-8 -*-
"""方案2：health 移到 /foodcalorie/health 专属前缀 + 删除 nginx = /api/v1/health 劫持 + 单测更新 + 验证"""
import paramiko
import re
import time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, t=60):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

# 1. 上传 app.js + 单测 → 重启
sftp = c.open_sftp()
sftp.put('src/app.js', '/var/www/foodcalorie-api/src/app.js')
sftp.put('test/m1-base.test.js', '/var/www/foodcalorie-api/test/m1-base.test.js')
sftp.close()
run('pm2 restart foodcalorie-api')
time.sleep(3)

# 2. 删除 nginx 的 location = /api/v1/health 块
out, _ = run('cat /etc/nginx/sites-enabled/gakiwoo.com')
cfg = out
pat = re.compile(r'\n    location = /api/v1/health \{.*?\n    \}', re.S)
if pat.search(cfg):
    cfg = pat.sub('', cfg, count=1)
    sftp = c.open_sftp()
    with sftp.open('/etc/nginx/sites-enabled/gakiwoo.com', 'w') as f:
        f.write(cfg)
    sftp.close()
    print('已删除 = /api/v1/health location')
else:
    print('未找到该 location（可能已删）')

out, _ = run('nginx -t 2>&1')
print('nginx -t:', 'OK' if 'successful' in out else out[-100:])
run('nginx -s reload')
time.sleep(1)

# 3. 验证
print('--- 验证 ---')
out, _ = run('curl -s -m 5 -o /dev/null -w "%{http_code}" https://gakiwoo.com/api/v1/health')
print('/api/v1/health(已归还 /api 命名空间):', out)
out, _ = run('curl -s -m 5 https://gakiwoo.com/api/v1/foodcalorie/health | head -c 120')
print('/api/v1/foodcalorie/health(我们专属):', out)
out, _ = run('curl -s -m 5 https://gakiwoo.com/api/v1/foodcalorie/records -o /dev/null -w "%{http_code}"')
print('业务 API 不受影响:', out)
out, _ = run('curl -s -m 5 -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/assets/index-Dyq-rmQH.js')
print('前端静态不受影响:', out)

# 4. 单测
out, _ = run('cd /var/www/foodcalorie-api && DB_PATH=/tmp/fc-h.db NODE_ENV=test npm test 2>&1 | tail -6', t=300)
print(out)
c.close()
