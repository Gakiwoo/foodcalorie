# -*- coding: utf-8 -*-
"""诊断：nginx 配置是否仍含 /api/v1；pm2 状态"""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, timeout=40):
    _, o, e = c.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

print('=== sites-enabled 文件时间 ===')
out, _ = run('ls -la /etc/nginx/sites-enabled/ | grep -E "gakiwoo.com|bak"')
print(out)

print('\n=== gakiwoo.com 是否含 /api/v1 ===')
out, _ = run('grep -n "api/v1" /etc/nginx/sites-enabled/gakiwoo.com || echo "未找到 api/v1"')
print(out)

print('\n=== nginx -t ===')
out, _ = run('nginx -t 2>&1 | tail -2')
print(out)

print('\n=== pm2 ===')
out, _ = run('pm2 list | grep -E "foodcalorie|gakiwoo-api"')
print(out)

print('\n=== 外网实际路径 ===')
out, _ = run('curl -s -m 8 -o /dev/null -w "/api/v1/health=%{http_code}\\n" https://gakiwoo.com/api/v1/health')
print(out)
c.close()
