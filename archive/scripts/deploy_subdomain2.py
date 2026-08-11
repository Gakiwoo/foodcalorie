# -*- coding: utf-8 -*-
"""子域名迁移 Step2：前端根路径部署 + gakiwoo 白名单 + 主站 301 + 守护脚本更新 + 验证"""
import paramiko
import os
import time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, t=60):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

# 1. 前端根路径版本部署（先清服务器旧文件再上传）
run('rm -rf /var/www/foodcalorie-web/*')
sftp = c.open_sftp()
def put_tree(local, remote):
    for name in os.listdir(local):
        lp = os.path.join(local, name)
        rp = remote + '/' + name
        if os.path.isdir(lp):
            try: sftp.stat(rp)
            except FileNotFoundError: sftp.mkdir(rp)
            put_tree(lp, rp)
        else:
            sftp.put(lp, rp)
put_tree('C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/frontend/dist-prod2', '/var/www/foodcalorie-web')
sftp.close()
print('前端根路径版本已部署')

# 2. gakiwoo 白名单加 foodcalorie 子域（官方扩展点，备份后改）
run('cp /var/www/gakiwoo-api/shared/config/allowedOrigins.js /var/www/gakiwoo-api/shared/config/allowedOrigins.js.bak-$(date +%s).subdomain')
out, _ = run('cat /var/www/gakiwoo-api/shared/config/allowedOrigins.js')
cfg = out
if "foodcalorie.gakiwoo.com" not in cfg:
    cfg = cfg.replace("  'https://gakiwoo.com',", "  'https://gakiwoo.com',\n  'https://foodcalorie.gakiwoo.com',", 1)
    sftp = c.open_sftp()
    with sftp.open('/var/www/gakiwoo-api/shared/config/allowedOrigins.js', 'w') as f:
        f.write(cfg)
    sftp.close()
    print('已添加 foodcalorie.gakiwoo.com 白名单')
    run('pm2 restart gakiwoo-api')
    time.sleep(3)
else:
    print('白名单已存在')
out, _ = run('grep foodcalorie /var/www/gakiwoo-api/shared/config/allowedOrigins.js')
print('白名单确认:', out)

# 3. 主站守护注入器更新：/foodcalorie 静态 → 301 到子域；/api/v1/foodcalorie 保留
INJECT = '''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""食刻 nginx location 注入器（子域名迁移后）：
  1) location /foodcalorie/          → 301 到 https://foodcalorie.gakiwoo.com/（旧子路径入口退役）
  2) location ^~ /api/v1/foodcalorie/ → foodcalorie-api(:3001)（兼容保留）
"""
import re, sys
CFG = sys.argv[1] if len(sys.argv) > 1 else '/etc/nginx/sites-enabled/gakiwoo.com'
BLOCK_WEB = """    location /foodcalorie/ {
        return 301 https://foodcalorie.gakiwoo.com$request_uri;
    }
"""
BLOCK_API = """    location ^~ /api/v1/foodcalorie/ {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout    120s;
        client_max_body_size  100M;
    }
"""
with open(CFG, 'r', encoding='utf-8') as f:
    cfg = f.read()
changed = False
if 'location /foodcalorie/' not in cfg:
    m = re.search(r'(\\n\\s{4}location\\s)', cfg)
    cfg = cfg[:m.start()] + '\\n' + BLOCK_WEB.rstrip('\\n') + cfg[m.start():] if m else cfg.rstrip() + '\\n' + BLOCK_WEB
    changed = True
if 'location ^~ /api/v1/foodcalorie/' not in cfg:
    m = re.search(r'(\\n\\s{4}location\\s)', cfg)
    cfg = cfg[:m.start()] + '\\n' + BLOCK_API.rstrip('\\n') + cfg[m.start():] if m else cfg.rstrip() + '\\n' + BLOCK_API
    changed = True
if changed:
    with open(CFG, 'w', encoding='utf-8') as f:
        f.write(cfg)
    print('INJECTED')
else:
    print('OK')
'''
sftp = c.open_sftp()
with sftp.open('/usr/local/bin/foodcalorie-nginx-inject.py', 'w') as f:
    f.write(INJECT)
sftp.close()
print('注入器已更新（/foodcalorie → 301）')

# 主站现有 location 更新：把静态 alias 块替换为 301（服务器上直接处理）
out, _ = run('cat /etc/nginx/sites-enabled/gakiwoo.com')
cfg = out
import re as _re
old_web = _re.compile(r'\n    location \^~ /foodcalorie/ \{.*?\n    \}', _re.S)
if old_web.search(cfg):
    cfg = old_web.sub('\n    location /foodcalorie/ {\n        return 301 https://foodcalorie.gakiwoo.com$request_uri;\n    }', cfg, count=1)
    sftp = c.open_sftp()
    with sftp.open('/etc/nginx/sites-enabled/gakiwoo.com', 'w') as f:
        f.write(cfg)
    sftp.close()
    print('主站 /foodcalorie 已改为 301')
out, _ = run('nginx -t 2>&1')
print('nginx -t:', 'OK' if 'successful' in out else out[-120:])
run('nginx -s reload')
time.sleep(1)

# 4. 验证
print('--- 验证 ---')
print('子域首页:', run('curl -s -o /dev/null -w "%{http_code}" https://foodcalorie.gakiwoo.com/')[0])
print('子域JS:', run('curl -s -o /dev/null -w "%{http_code}" https://foodcalorie.gakiwoo.com/assets/index-Nt1BEgnn.js')[0])
print('主站/foodcalorie(301):', run('curl -s -o /dev/null -w "%{http_code}" https://gakiwoo.com/foodcalorie/')[0])
print('主站/redir:', run('curl -s -I https://gakiwoo.com/foodcalorie/ | grep -i location | head -1')[0])
print('子域业务:', run('curl -s -o /dev/null -w "%{http_code}" https://foodcalorie.gakiwoo.com/api/v1/foodcalorie/records')[0])
c.close()
