# -*- coding: utf-8 -*-
"""修正主站 301：去根（/foodcalorie → https://foodcalorie.gakiwoo.com/）"""
import paramiko
import time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, t=40):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

# sed 直接替换（单引号包裹，$ 在 sed 替换串为字面量）
out, _ = run(
    "sed -i 's|https://foodcalorie\\.gakiwoo\\.com$request_uri;|https://foodcalorie.gakiwoo.com/;|' "
    "/etc/nginx/sites-enabled/gakiwoo.com"
)
out, _ = run('grep -A 2 "location /foodcalorie/" /etc/nginx/sites-enabled/gakiwoo.com | head -3')
print('当前 301:', out)
out, _ = run('nginx -t 2>&1 | tail -1')
print('nginx -t:', out)
run('nginx -s reload')
time.sleep(1)
out, _ = run('curl -s -I https://gakiwoo.com/foodcalorie/ | grep -i location | head -1')
print('301 验证:', out)
c.close()
