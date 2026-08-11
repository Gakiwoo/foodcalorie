# -*- coding: utf-8 -*-
"""只读：csrfOriginGuard 完整逻辑（判断本地代理联调是否会被拦截）"""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
_, o, _ = c.exec_command('cat /var/www/gakiwoo-api/shared/middleware/csrfOriginGuard.js', timeout=40)
print(o.read().decode('utf-8', 'replace'))
_, o, _ = c.exec_command('cat /var/www/gakiwoo-api/shared/config/allowedOrigins.js 2>/dev/null | head -20', timeout=40)
print('--- allowedOrigins ---')
print(o.read().decode('utf-8', 'replace'))
c.close()
