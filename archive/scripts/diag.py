# -*- coding: utf-8 -*-
import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
def run(cmd, timeout=60):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8','replace').strip(), e.read().decode('utf-8','replace').strip()
out, _ = run('pm2 logs foodcalorie-api --lines 30 --nostream 2>&1 | tail -35')
print(out)
client.close()
