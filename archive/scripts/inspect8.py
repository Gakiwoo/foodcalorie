# -*- coding: utf-8 -*-
"""只读：auth 模块登录/注册响应体、issueTokens payload、cookie domain"""
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(name, cmd, limit=3500):
    print(f'\n===== {name} =====')
    _, stdout, stderr = client.exec_command(cmd, timeout=40)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    print(out[:limit] if out else ('(空)' + (f' [stderr] {err[:200]}' if err else '')))

# 1. issueTokens payload 字段（service.js 30-60 行）
run('issueTokens 定义', r'''sed -n '30,60p' /var/www/gakiwoo-api/modules/auth/service.js''')

# 2. login 处理函数（返回体）
run('login handler（routes.js）', r'''grep -n -A 30 "router.post('/login'\|app.post('/login'\|login = " /var/www/gakiwoo-api/modules/auth/routes.js 2>/dev/null | head -45''')

# 3. service.login 返回结构
run('service.login 返回', r'''grep -n -B2 -A 25 "async function login\|function login" /var/www/gakiwoo-api/modules/auth/service.js | head -50''')

# 4. authCookies.js 全文（domain/secure/sameSite）
run('authCookies.js 全文', r'''cat /var/www/gakiwoo-api/shared/utils/authCookies.js''')

# 5. 登录响应是否含 token（搜索 res.json / accessToken）
run('routes.js 中 token 返回', r'''grep -nE "accessToken|refreshToken|res\.json|res\.status" /var/www/gakiwoo-api/modules/auth/routes.js | head -20''')

# 6. 真实调用 login（读行为验证，注册一个临时测试账号后登录，看响应体与 Set-Cookie）
run('注册临时账号 t_fc_test@x.com', r'''curl -s -m 10 -X POST http://127.0.0.1:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"t_fc_test@x.com","password":"Test123456!","nickname":"食刻联调"}' | head -c 600''')

client.close()
print('\n===== 盘点完成（全程只读+注册测试账号） =====')
