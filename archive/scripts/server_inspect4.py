# -*- coding: utf-8 -*-
"""只读：认证中间件与多端兼容性（仅注册登录相关）"""
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(name, cmd, limit=4000):
    print(f'\n===== {name} =====')
    _, stdout, _ = client.exec_command(cmd, timeout=40)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    print(out[:limit] if out else '(空)')

run('requireAuth 中间件（Bearer/Cookie 支持）', 'cat /var/www/gakiwoo-api/shared/middleware/auth.js', 4500)
run('authCookies（cookie 配置）', 'cat /var/www/gakiwoo-api/shared/utils/authCookies.js', 2500)
run('csrfOriginGuard（移动端无 Origin 兼容）', 'cat /var/www/gakiwoo-api/shared/middleware/csrfOriginGuard.js', 2500)
run('loginThrottle', 'cat /var/www/gakiwoo-api/shared/middleware/loginThrottle.js', 1500)
run('users 表 schema', 'grep -rn "CREATE TABLE.*users\|CREATE TABLE IF NOT EXISTS users" /var/www/gakiwoo-api/shared/db/*.js /var/www/gakiwoo-api/*.js 2>/dev/null | head -5; grep -rn -A 15 "CREATE TABLE IF NOT EXISTS users" /var/www/gakiwoo-api/shared/db/ 2>/dev/null | head -25')
run('ALLOWED_ORIGINS', 'cat /var/www/gakiwoo-api/shared/config/allowedOrigins.js 2>/dev/null | head -30')

client.close()
print('\n===== 完成（全程只读） =====')
