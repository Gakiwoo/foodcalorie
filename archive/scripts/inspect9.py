# -*- coding: utf-8 -*-
"""只读：注册 schema 密码规则"""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
_, o, _ = c.exec_command("grep -n -B2 -A 12 'registerSchema' /var/www/gakiwoo-api/modules/auth/routes.js | head -35", timeout=40)
print(o.read().decode('utf-8', 'replace'))
c.close()
