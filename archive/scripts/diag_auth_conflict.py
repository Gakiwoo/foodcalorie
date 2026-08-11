# -*- coding: utf-8 -*-
"""确认根因：/api/v1/auth 当前被谁处理 + gakiwoo 是否挂载 /api/v1/auth"""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, timeout=40):
    _, o, e = c.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

print('=== 当前 nginx 中 /api/v1 location ===')
out, _ = run('grep -n -A 3 "api/v1" /etc/nginx/sites-enabled/gakiwoo.com | head -20')
print(out)

print('\n=== gakiwoo-api 是否挂载 /api/v1/auth（server.js 路由前缀）===')
out, _ = run(r'''grep -nE "api/v1|/v1|use\('/api|authRouter|auth.*mount" /var/www/gakiwoo-api/server.js | head -12''')
print(out)

print('\n=== 外网实测 ===')
out, _ = run('curl -s -m 8 -o /dev/null -w "/api/v1/auth/me → %{http_code}\\n" https://gakiwoo.com/api/v1/auth/me')
print(out)
out, _ = run('curl -s -m 8 https://gakiwoo.com/api/v1/auth/me | head -c 200')
print('  body:', out)
c.close()
