# -*- coding: utf-8 -*-
"""只读：refresh 路由处理逻辑"""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
_, o, _ = c.exec_command("grep -n -A 20 \"router.post('/refresh'\" /var/www/gakiwoo-api/modules/auth/routes.js | head -26", timeout=40)
print(o.read().decode('utf-8', 'replace'))
c.close()
