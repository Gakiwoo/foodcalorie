# -*- coding: utf-8 -*-
"""子域名迁移 Step1：80/acme → certbot 签发 → 443 server 块 → reload → 验证"""
import paramiko
import time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, t=120):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

# 1. 第一阶段 server 块（80 + acme-challenge webroot）
V1 = """server {
    listen 80;
    listen [::]:80;
    server_name foodcalorie.gakiwoo.com;
    location /.well-known/acme-challenge/ { root /var/www/foodcalorie-web/; }
    location / { return 301 https://$host$request_uri; }
}
"""
sftp = c.open_sftp()
with sftp.open('/etc/nginx/sites-available/foodcalorie.gakiwoo.com', 'w') as f:
    f.write(V1)
# softlink
run('ln -sf /etc/nginx/sites-available/foodcalorie.gakiwoo.com /etc/nginx/sites-enabled/foodcalorie.gakiwoo.com')
sftp.close()
out, _ = run('nginx -t 2>&1')
print('nginx -t(80阶段):', 'OK' if 'successful' in out else out[-100:])
run('nginx -s reload')
time.sleep(1)

# 2. certbot 签发
out, _ = run(
    'certbot certonly --webroot -w /var/www/foodcalorie-web -d foodcalorie.gakiwoo.com '
    '--non-interactive --agree-tos --keep-until-expiring 2>&1 | tail -6',
    t=180
)
print('certbot:', out)
out, _ = run('ls /etc/letsencrypt/live/foodcalorie.gakiwoo.com/ 2>/dev/null || echo 证书未生成')
print('证书目录:', out)

# 3. 第二阶段：443 server 块（静态根路径 + /api/auth→3000 + /api/v1→3001）
V2 = """server {
    listen 80;
    listen [::]:80;
    server_name foodcalorie.gakiwoo.com;
    location /.well-known/acme-challenge/ { root /var/www/foodcalorie-web/; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name foodcalorie.gakiwoo.com;

    ssl_certificate     /etc/letsencrypt/live/foodcalorie.gakiwoo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/foodcalorie.gakiwoo.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_session_cache   shared:SSL:10m;

    # 前端静态（SPA 根路径）
    location / {
        root  /var/www/foodcalorie-web;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 登录/认证（同域反代 gakiwoo-api，cookie 同站携带）
    location /api/auth/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # 业务 API（同域反代 foodcalorie-api）
    location /api/v1/ {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout    120s;
        client_max_body_size  100M;
    }
}
"""
sftp = c.open_sftp()
with sftp.open('/etc/nginx/sites-available/foodcalorie.gakiwoo.com', 'w') as f:
    f.write(V2)
sftp.close()
out, _ = run('nginx -t 2>&1')
print('nginx -t(443阶段):', 'OK' if 'successful' in out else out[-150:])
run('nginx -s reload')
time.sleep(1)

# 4. 验证
print('--- 验证 ---')
print('HTTPS 首页:', run('curl -s -o /dev/null -w "%{http_code}" https://foodcalorie.gakiwoo.com/')[0])
print('80→301:', run('curl -s -o /dev/null -w "%{http_code}" http://foodcalorie.gakiwoo.com/')[0])
print('业务API:', run('curl -s -o /dev/null -w "%{http_code}" https://foodcalorie.gakiwoo.com/api/v1/foodcalorie/records')[0])
print('health:', run('curl -s https://foodcalorie.gakiwoo.com/api/v1/foodcalorie/health | head -c 80')[0])
print('登录入口:', run('curl -s -o /dev/null -w "%{http_code}" https://foodcalorie.gakiwoo.com/api/auth/me')[0])
c.close()
