# -*- coding: utf-8 -*-
"""删除 8 空格缩进的孤儿静态块（alias/index/try_files/}），仅保留 location 内的正确块"""
import paramiko, re

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, t=40):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

out, _ = run('cat /etc/nginx/sites-enabled/gakiwoo.com')
cfg = out

# 8 空格缩进的孤儿块（无 location 头）：alias/index/try_files + 闭合 }
orphan = re.compile(
    r'\n        alias /var/www/foodcalorie-web/;\n        index index.html;\n        try_files \$uri \$uri/ /foodcalorie/index\.html;\n    \}\n',
    re.S
)
new_cfg = orphan.sub('\n', cfg, count=1)
if new_cfg != cfg:
    cfg = new_cfg
    print('已删除 8 空格孤儿块')
else:
    print('未匹配到孤儿块（检查缩进）')

sftp = c.open_sftp()
with sftp.open('/etc/nginx/sites-enabled/gakiwoo.com', 'w') as f:
    f.write(cfg)
sftp.close()

_, out = run('nginx -t 2>&1')
print('nginx -t:', out[-150:])
if 'successful' in out:
    run('nginx -s reload')
    _, _ = run('sleep 1')
    print('JS:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/assets/index-Dyq-rmQH.js')[0])
    print('CSS:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/assets/index-IyXDwmqf.css')[0])
    print('页面:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/login')[0])
    print('API:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/api/v1/foodcalorie/records')[0])
else:
    print('❌ nginx -t 失败')
c.close()
