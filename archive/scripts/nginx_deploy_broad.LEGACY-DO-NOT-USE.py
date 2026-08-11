# -*- coding: utf-8 -*-
"""Phase B：Nginx 增量暴露 /api/v1 → 127.0.0.1:3001
流程：备份配置 → 校验未存在 /api/v1 → 插入 location（^~ 最长前缀优先于 /api/）→ nginx -t → reload → 外网验证
"""
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, timeout=60):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

CFG = '/etc/nginx/sites-enabled/gakiwoo.com'

# 1. 读取现有配置
cfg, err = run(f'cat {CFG}')
if 'api/v1' in cfg:
    print('⚠️ 已存在 /api/v1，跳过插入'); client.close(); raise SystemExit(0)

# 2. 备份
out, _ = run(f'cp {CFG} {CFG}.bak.$(date +%s) && echo "备份: {CFG}.bak.$(date +%s)"')
print(out)

# 3. 构造新 location 块（与 /api/ 块同风格）
LOC = '''    location ^~ /api/v1/ {
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
# 在静态资源正则 location 前插入（与 /api/ 块顺序无关，前缀匹配以最长为准）
anchor = 'location ~*'
idx = cfg.find(anchor)
print('锚点索引:', idx, '| 配置长度:', len(cfg))
assert idx >= 0, '未找到插入锚点！'
# 找到锚点所在行的行首
line_start = cfg.rfind('\n', 0, idx) + 1
new_cfg = cfg[:line_start] + LOC + cfg[line_start:]

# 4. 上传新配置到 /tmp 校验
sftp = client.open_sftp()
with sftp.open('/tmp/gakiwoo.com.new', 'w') as f:
    f.write(new_cfg)
sftp.close()

# 5. nginx -t 校验（用新文件替换前先测：复制到 sites-enabled 前先测语法需要放正确路径）
#    方案：先备份已在步骤2，现在直接替换并立即 nginx -t，失败则回滚
run(f'cp /tmp/gakiwoo.com.new {CFG}')
out, err = run('nginx -t 2>&1')
print('nginx -t:', out)
if 'successful' not in out:
    # 回滚
    latest = run(f'ls -t {CFG}.bak.* | head -1')[0]
    run(f'cp "{latest}" {CFG}')
    print('❌ 配置校验失败，已回滚到', latest)
    client.close(); raise SystemExit(1)

# 6. reload
out, _ = run('nginx -s reload 2>&1 && echo RELOAD_OK')
print('reload:', out)

# 7. 外网路径验证（走 443 → nginx → 3001）
out, _ = run('curl -s -m 10 https://gakiwoo.com/api/v1/health')
print('外网 /api/v1/health:', out)
out, _ = run('curl -s -m 10 -o /dev/null -w "auth(未带token) %{http_code}\\n" https://gakiwoo.com/api/auth/me')
print('外网 /api/auth/me:', out)
out, _ = run('curl -s -m 10 -o /dev/null -w "v1 records(未带token) %{http_code}\\n" https://gakiwoo.com/api/v1/foodcalorie/records')
print('外网 /api/v1/records:', out)

client.close()
print('\n===== Phase B 完成 =====')
