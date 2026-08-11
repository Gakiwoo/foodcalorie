# -*- coding: utf-8 -*-
"""重部署 db.js 修复 → 重启 → 复跑 M4 验证"""
import paramiko, os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
sftp = client.open_sftp()
sftp.put('src/db.js', '/var/www/foodcalorie-api/src/db.js')
sftp.put('verify_m4.js', '/tmp/verify_m4.js')
sftp.close()

def run(cmd, timeout=120):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

run('pm2 restart foodcalorie-api')
_, _ = run('sleep 3')
out, _ = run('pm2 list | grep foodcalorie-api')
print('pm2:', out)
out, _ = run('node /tmp/verify_m4.js 2>&1', timeout=120)
print(out)
client.close()
