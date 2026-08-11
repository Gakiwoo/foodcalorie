# -*- coding: utf-8 -*-
"""上传并运行 verify_interop3.js（服务器端互通验证）"""
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
sftp = client.open_sftp()
sftp.put('verify_interop3.js', '/tmp/verify_interop3.js')
sftp.close()
_, o, e = client.exec_command('node /tmp/verify_interop3.js 2>&1', timeout=90)
print(o.read().decode('utf-8', 'replace'))
err = e.read().decode('utf-8', 'replace')
if err:
    print('[stderr]', err[:300])
client.close()
