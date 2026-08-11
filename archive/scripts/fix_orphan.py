# -*- coding: utf-8 -*-
"""清理孤立的静态 location 残留行（alias/index/try_files 悬空），保留正确的 ^~ location"""
import paramiko, re

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, t=40):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

out, _ = run('cat /etc/nginx/sites-enabled/gakiwoo.com')
cfg = out

# 删除"不属于 location 块"的孤儿 alias/index/try_files（位于第一个 location 之前）
orphan = re.compile(
    r'\n    alias /var/www/foodcalorie-web/;\n    index index.html;\n    try_files \$uri \$uri/ /foodcalorie/index\.html;\n',
    re.S
)
# 只删除第一个 location 之前的孤儿（保留 ^~ location 块内的）
first_loc = cfg.find('location ')
if first_loc > 0:
    head, tail = cfg[:first_loc], cfg[first_loc:]
    head = orphan.sub('\n', head, count=1)
    cfg = head + tail
    print('已清理孤儿行')

sftp = c.open_sftp()
with sftp.open('/etc/nginx/sites-enabled/gakiwoo.com', 'w') as f:
    f.write(cfg)
sftp.close()

_, out = run('nginx -t 2>&1')
print('nginx -t:', out[-120:])
if 'successful' in out:
    run('nginx -s reload')
    _, _ = run('sleep 1')
    print('JS:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/assets/index-Dyq-rmQH.js')[0])
    print('CSS:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/assets/index-IyXDwmqf.css')[0])
    print('页面:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/login')[0])
    print('API:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/api/v1/foodcalorie/records')[0])
else:
    print('❌ nginx -t 失败，未 reload')
c.close()
