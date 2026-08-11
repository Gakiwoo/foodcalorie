# -*- coding: utf-8 -*-
"""只读：定位 gakiwoo JWT_SECRET 真实来源（auth 中间件 + secrets 文件 + 发布目录）"""
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(name, cmd, limit=3000):
    print(f'\n===== {name} =====')
    _, stdout, stderr = client.exec_command(cmd, timeout=40)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    print(out[:limit] if out else ('(空)' + (f' [stderr] {err[:200]}' if err else '')))

# 1. gakiwoo-api 顶层结构（是否 symlink）
run('gakiwoo-api 目录属性', 'ls -la /var/www/ | grep -E "gakiwoo" ; readlink /var/www/gakiwoo-api 2>/dev/null; echo "---releases---"; ls /var/www/gakiwoo-releases/ 2>/dev/null | tail -3')

# 2. auth 中间件 JWT_SECRET 定义
run('auth.js 头部（JWT_SECRET 来源）', r'''sed -n '1,22p' /var/www/gakiwoo-api/shared/middleware/auth.js''')

# 3. secrets 文件是否存在 + 键名（脱敏）
run('secrets 文件与键名', r'''ls -la /Users/wujiaqi/.gakiwoo-secrets/ 2>/dev/null; awk -F= '{ if ($1 ~ /SECRET|KEY|TOKEN|PASSWORD/) print $1"=<masked>"; else print }' /Users/wujiaqi/.gakiwoo-secrets/api.env 2>/dev/null | head -30''')

# 4. 发布目录中的 .env 链
run('发布目录 env 链', r'''ls -la /var/www/gakiwoo-releases/$(ls /var/www/gakiwoo-releases/ | tail -1)/ 2>/dev/null | grep -E "\.env|server\.js"; readlink /var/www/gakiwoo-releases/$(ls /var/www/gakiwoo-releases/ | tail -1)/api/.env 2>/dev/null''')

# 5. runtimeConfig / startupValidation 对 JWT_SECRET 的检查
run('runtimeConfig 读取 env', r'''grep -nE "JWT_SECRET|jwt|SECRET" /var/www/gakiwoo-api/shared/config/runtimeConfig.js 2>/dev/null | head -10''')

# 6. 从 .env.example 看 JWT_SECRET 键名规范
run('.env.example 键名', r'''grep -nE "^[A-Z_]+=" /var/www/gakiwoo-api/.env.example 2>/dev/null | head -25''')

client.close()
print('\n===== 盘点完成（全程只读） =====')
