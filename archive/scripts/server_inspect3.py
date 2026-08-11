# -*- coding: utf-8 -*-
"""只读：auth 模块代码 + 接口验证（仅注册登录范围）"""
import paramiko, json

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(name, cmd, limit=None):
    print(f'\n===== {name} =====')
    _, stdout, _ = client.exec_command(cmd, timeout=40)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    if limit and len(out) > limit:
        out = out[:limit] + '\n...[截断]'
    print(out if out else '(空)')

run('server.js 中 auth 挂载', 'grep -n "auth\|app.use" /var/www/gakiwoo-api/server.js | head -20')
run('auth/routes.js 全文（前 190 行）', 'sed -n "1,190p" /var/www/gakiwoo-api/modules/auth/routes.js', 6000)
run('auth/service.js 前 120 行', 'sed -n "1,120p" /var/www/gakiwoo-api/modules/auth/service.js', 5000)
run('usersRepo.js 前 80 行', 'sed -n "1,80p" /var/www/gakiwoo-api/modules/auth/repositories/usersRepo.js', 3500)
run('tokenRepo.js 前 60 行', 'sed -n "1,60p" /var/www/gakiwoo-api/modules/auth/repositories/tokenRepo.js', 3000)
run('db.js（数据库）', 'cat /var/www/gakiwoo-api/db.js')
run('接口验证: /api/auth/me 未认证', 'curl -s -m 8 http://127.0.0.1:3000/api/auth/me -H "Content-Type: application/json" | head -c 400')
run('接口验证: /api/auth/usage 未认证', 'curl -s -m 8 http://127.0.0.1:3000/api/auth/usage -H "Content-Type: application/json" | head -c 300')

client.close()
print('\n===== 完成（全程只读） =====')
