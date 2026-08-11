# -*- coding: utf-8 -*-
"""修复 nginx /api/v1 冲突：收窄为 /api/v1/foodcalorie/（+ 精确 /api/v1/health）
让 /api/v1/auth/* 等恢复由 gakiwoo-api(:3000) 处理，两个项目共存。
流程：下载配置 → 本地替换 → 上传 → 备份 → nginx -t → reload（失败回滚）→ 验证
"""
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
sftp = client.open_sftp()
CFG = '/etc/nginx/sites-enabled/gakiwoo.com'
sftp.get(CFG, 'nginx_conf_cur.txt')
sftp.close()

# ── 本地处理配置 ──
lines = open('nginx_conf_cur.txt', encoding='utf-8').read().split('\n')

# 定位旧块
start = None
for i, ln in enumerate(lines):
    if 'location ^~ /api/v1/ {' in ln:
        start = i
        break
assert start is not None, '未找到 /api/v1/ location'
# 找块尾：从 start 之后第一个 4 空格缩进的独立 }
end = None
for i in range(start + 1, len(lines)):
    if lines[i] == '    }':
        end = i
        break
assert end is not None, '未找到块尾'
print(f'旧块: 行 {start + 1} ~ {end + 1}')

NEW_BLOCK = '''    location ^~ /api/v1/foodcalorie/ {
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

    location = /api/v1/health {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }'''

new_lines = lines[:start] + NEW_BLOCK.split('\n') + lines[end + 1:]
open('nginx_conf_new.txt', 'w', encoding='utf-8').write('\n'.join(new_lines))
print('新配置已生成，含 foodcalorie 前缀:', 'api/v1/foodcalorie/' in '\n'.join(new_lines))

# ── 上传 + 应用 ──
sftp = client.open_sftp()
sftp.put('nginx_conf_new.txt', '/tmp/nginx_gakiwoo_new.conf')
sftp.close()

def run(cmd, timeout=60):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

run(f'cp {CFG} {CFG}.bak.$(date +%s).narrow')
run(f'cp /tmp/nginx_gakiwoo_new.conf {CFG}')
out, _ = run('nginx -t 2>&1 | tail -2')
print('nginx -t:', out)
if 'successful' not in out:
    latest = run(f'ls -t {CFG}.bak.* | head -1')[0]
    run(f'cp "{latest}" {CFG}')
    print('❌ 校验失败，已回滚到', latest)
    client.close()
    raise SystemExit(1)
out, _ = run('nginx -s reload 2>&1 | tail -1; echo RELOAD_DONE')
print('reload:', out)

# ── 验证（三路径各归其主）──
def check(name, cmd):
    out, _ = run(cmd)
    print(f'[{name}]', out[:220])

check('我们的 /api/v1/foodcalorie/records', 'curl -s -m 8 -o /dev/null -w "%{http_code}" https://gakiwoo.com/api/v1/foodcalorie/records')
check('我们的 /api/v1/health', 'curl -s -m 8 https://gakiwoo.com/api/v1/health | head -c 120')
check('gakiwoo /api/v1/auth/me', 'curl -s -m 8 https://gakiwoo.com/api/v1/auth/me | head -c 160')
check('gakiwoo /api/auth/me', 'curl -s -m 8 https://gakiwoo.com/api/auth/me | head -c 160')
check('gakiwoo /api/v1/auth/login(测试账号)', 'curl -s -m 8 -X POST https://gakiwoo.com/api/v1/auth/login -H "Content-Type: application/json" -d \'{"email":"t_fc_test@x.com","password":"Test123456!"}\' | head -c 160')

client.close()
print('\n===== 修复完成 =====')
