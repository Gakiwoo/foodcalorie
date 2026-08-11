#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""食刻 nginx location 注入器：向 gakiwoo.com server 块注入食刻所需 location（幂等）
注入内容：
  1) location /foodcalorie/           → 前端静态包（SPA fallback）
  2) location ^~ /api/v1/foodcalorie/ → foodcalorie-api(:3001) 反向代理
用法：python3 foodcalorie-nginx-inject.py <gakiwoo.com 配置路径>
"""
import re
import sys

CFG = sys.argv[1] if len(sys.argv) > 1 else '/etc/nginx/sites-enabled/gakiwoo.com'

BLOCK_WEB = '''    location ^~ /foodcalorie/ {
        alias /var/www/foodcalorie-web/;
        index index.html;
        try_files $uri $uri/ /foodcalorie/index.html;
    }
'''

BLOCK_API = '''    location ^~ /api/v1/foodcalorie/ {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout    120s;
        proxy_connect_timeout 10s;
        client_max_body_size  100M;
        proxy_buffering    off;
        proxy_cache        off;
    }
'''

with open(CFG, 'r', encoding='utf-8') as f:
    cfg = f.read()

changed = False
# 1) 前端静态 location
if 'location /foodcalorie/' not in cfg:
    # 在 server 块内第一个 location 前插入（或文件末尾的 server 块内）
    m = re.search(r'(\n\s{4}location\s)', cfg)
    if m:
        cfg = cfg[: m.start()] + '\n' + BLOCK_WEB.rstrip('\n') + cfg[m.start():]
    else:
        cfg = cfg.rstrip() + '\n' + BLOCK_WEB
    changed = True

# 2) 业务 API location
if 'location ^~ /api/v1/foodcalorie/' not in cfg:
    m = re.search(r'(\n\s{4}location\s)', cfg)
    if m:
        cfg = cfg[: m.start()] + '\n' + BLOCK_API.rstrip('\n') + cfg[m.start():]
    else:
        cfg = cfg.rstrip() + '\n' + BLOCK_API
    changed = True

if changed:
    with open(CFG, 'w', encoding='utf-8') as f:
        f.write(cfg)
    print('INJECTED')
else:
    print('OK')
