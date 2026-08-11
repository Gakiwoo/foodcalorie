# -*- coding: utf-8 -*-
"""模拟 gakiwoo 发布覆盖 → 验证守护脚本自愈"""
import paramiko
import time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, t=40):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

# 1. 模拟发布覆盖：删除两个食刻 location（先备份）
run('cp /etc/nginx/sites-enabled/gakiwoo.com /etc/nginx/backups/gakiwoo.com.before-sim')
SIM = r'''
import re
p = "/etc/nginx/sites-enabled/gakiwoo.com"
s = open(p, encoding="utf-8").read()
for pat in [
    re.compile(r"\n    location \^~ /foodcalorie/ \{.*?\n    \}", re.S),
    re.compile(r"\n    location \^~ /api/v1/foodcalorie/ \{.*?\n    \}", re.S)
]:
    s = pat.sub("", s, count=1)
open(p, "w", encoding="utf-8").write(s)
print("simulated")
'''
sftp = c.open_sftp()
with sftp.open('/tmp/sim_overwrite.py', 'w') as f:
    f.write(SIM)
sftp.close()
out, _ = run('python3 /tmp/sim_overwrite.py')
print('模拟覆盖:', out)

# 2. 覆盖后检查（期望 0）
out, _ = run('grep -c "foodcalorie/" /etc/nginx/sites-enabled/gakiwoo.com || echo 0')
print('覆盖后 location 数:', out)
js_after = run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/assets/index-Dyq-rmQH.js')[0]
print('覆盖后 JS:', js_after)

# 3. 跑守护 → 自愈
run('bash /usr/local/bin/foodcalorie-nginx-guard.sh')
time.sleep(1)
out, _ = run('grep -c "foodcalorie/" /etc/nginx/sites-enabled/gakiwoo.com')
print('自愈后 location 数:', out)
print('自愈后 JS:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/assets/index-Dyq-rmQH.js')[0])
print('自愈后 页面:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/login')[0])
print('自愈后 API:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/api/v1/foodcalorie/records')[0])
print('守护日志:', run('tail -2 /var/log/foodcalorie-nginx-guard.log 2>/dev/null')[0])
c.close()
