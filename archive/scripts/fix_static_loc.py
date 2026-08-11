# -*- coding: utf-8 -*-
"""修复静态 location：替换为 ^~ 版本（避免被 gakiwoo 正则 location 抢走静态资源）"""
import paramiko, re

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, t=40):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

out, _ = run('cat /etc/nginx/sites-enabled/gakiwoo.com')
cfg = out

NEW_WEB = """    location ^~ /foodcalorie/ {
        alias /var/www/foodcalorie-web/;
        index index.html;
        try_files $uri $uri/ /foodcalorie/index.html;
    }"""

old_pattern = re.compile(r'\n    location /foodcalorie/ \{.*?\n    \}', re.S)
if old_pattern.search(cfg):
    cfg = old_pattern.sub('\n' + NEW_WEB, cfg, count=1)
    print('已替换旧静态 location -> ^~ 版本')
elif 'location ^~ /foodcalorie/' not in cfg:
    m = re.search(r'(\n\s{4}location\s)', cfg)
    cfg = cfg[:m.start()] + '\n' + NEW_WEB + cfg[m.start():]
    print('已插入静态 location')
else:
    print('已是 ^~ 版本，无需处理')

sftp = c.open_sftp()
with sftp.open('/etc/nginx/sites-enabled/gakiwoo.com', 'w') as f:
    f.write(cfg)
sftp.close()
print('配置已写回')

_, out = run('nginx -t 2>&1 | tail -1')
print('nginx -t:', out)
run('nginx -s reload')
_, _ = run('sleep 1')
print('JS:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/assets/index-Dyq-rmQH.js')[0])
print('CSS:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/assets/index-IyXDwmqf.css')[0])
print('页面:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/login')[0])
print('API:', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/api/v1/foodcalorie/records')[0])
c.close()
