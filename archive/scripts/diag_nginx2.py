# -*- coding: utf-8 -*-
"""诊断：为什么 cat 只返回 55 字节"""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, timeout=40):
    _, o, e = c.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

print('=== ls -la sites-enabled ===')
out, _ = run('ls -la /etc/nginx/sites-enabled/')
print(out)
print('\n=== readlink gakiwoo.com ===')
out, _ = run('readlink -f /etc/nginx/sites-enabled/gakiwoo.com; ls -la /etc/nginx/sites-enabled/gakiwoo.com')
print(out)
print('\n=== cat 返回 repr ===')
out, err = run('cat /etc/nginx/sites-enabled/gakiwoo.com')
print('len:', len(out))
print('repr:', repr(out[:200]))
if err:
    print('stderr:', err)
print('\n=== wc -c ===')
out, _ = run('wc -c /etc/nginx/sites-enabled/gakiwoo.com')
print(out)
c.close()
