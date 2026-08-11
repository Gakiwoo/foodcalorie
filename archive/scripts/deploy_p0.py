# -*- coding: utf-8 -*-
"""P0 部署：前端 dist → /var/www/foodcalorie-web；守护脚本 + cron；server.js(127.0.0.1)；nginx 注入；验证"""
import paramiko, os

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
sftp = c.open_sftp()

# 1. 上传前端 dist（递归）
WEB = '/var/www/foodcalorie-web'
try:
    sftp.stat(WEB)
except FileNotFoundError:
    sftp.mkdir(WEB)
def put_tree(local, remote):
    sftp.mkdir(remote) if not _exists(sftp, remote) else None
    for name in os.listdir(local):
        lp = os.path.join(local, name)
        rp = remote + '/' + name
        if os.path.isdir(lp):
            try: sftp.stat(rp)
            except FileNotFoundError: sftp.mkdir(rp)
            put_tree(lp, rp)
        else:
            sftp.put(lp, rp)
def _exists(sftp, p):
    try: sftp.stat(p); return True
    except FileNotFoundError: return False
put_tree('C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/frontend/dist-prod', WEB)
print('dist 上传完成')

# 2. 守护脚本 + cron
sftp.put('foodcalorie-nginx-inject.py', '/usr/local/bin/foodcalorie-nginx-inject.py')
sftp.put('foodcalorie-nginx-guard.sh', '/usr/local/bin/foodcalorie-nginx-guard.sh')
sftp.close()

def run(cmd, t=60):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

run('chmod +x /usr/local/bin/foodcalorie-nginx-inject.py /usr/local/bin/foodcalorie-nginx-guard.sh')
# cron 每 5 分钟
run("(crontab -l 2>/dev/null | grep -v foodcalorie-nginx-guard; echo '*/5 * * * * /usr/local/bin/foodcalorie-nginx-guard.sh') | crontab -")
out, _ = run('crontab -l | grep foodcalorie')
print('cron:', out)

# 3. server.js 更新（绑定 127.0.0.1）→ 重启
sftp = c.open_sftp()
sftp.put('src/server.js', '/var/www/foodcalorie-api/src/server.js')
sftp.close()
run('pm2 restart foodcalorie-api')
_, _ = run('sleep 3')

# 4. 运行守护（注入两个 location）→ 验证
out, _ = run('bash /usr/local/bin/foodcalorie-nginx-guard.sh && nginx -t 2>&1 | tail -1')
print('守护注入:', out)

# 5. 验证
print('--- 验证 ---')
out, _ = run('curl -s -o /dev/null -w "静态页面=%{http_code} " https://gakiwoo.com/foodcalorie/ && curl -s -o /dev/null -w "| 业务API=%{http_code} " https://gakiwoo.com/api/v1/foodcalorie/records && curl -s -o /dev/null -w "| health=%{http_code}\\n" https://gakiwoo.com/api/v1/health')
print(out)
out, _ = run('curl -s https://gakiwoo.com/foodcalorie/ | head -c 200')
print('页面内容:', out)
out, _ = run('curl -s -m 5 -o /dev/null -w "%{http_code}" http://123.57.102.126:3001/api/v1/health 2>&1 || echo "3001 公网不可达(已收敛)"')
print('3001 公网直连:', out)
c.close()
print('===== P0 部署完成 =====')
