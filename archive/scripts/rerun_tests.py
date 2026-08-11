# -*- coding: utf-8 -*-
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
_, o, _ = c.exec_command('cd /var/www/foodcalorie-api && DB_PATH=/tmp/fc-unit-test2.db NODE_ENV=test npm test 2>&1 | grep -B 8 -A 20 "not ok"', timeout=300)
print(o.read().decode('utf-8', 'replace'))
c.close()
