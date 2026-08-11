# -*- coding: utf-8 -*-
"""只读深入：gakiwoo-api 注册登录模块结构与接口"""
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

cmds = [
    ('PM2 服务列表', 'pm2 list 2>/dev/null'),
    ('gakiwoo-api 顶层', 'ls -la /var/www/gakiwoo-api/ 2>/dev/null'),
    ('package.json（技术栈）', 'cat /var/www/gakiwoo-api/package.json 2>/dev/null | head -60'),
    ('modules 目录', 'ls /var/www/gakiwoo-api/modules/ 2>/dev/null'),
    ('auth 模块结构', 'find /var/www/gakiwoo-api/modules/auth -type f 2>/dev/null | head -40'),
    ('auth 路由文件', 'grep -rn "router\.\|app\.\(get\|post\|put\|delete\)\|/api/" /var/www/gakiwoo-api/modules/auth/*.js /var/www/gakiwoo-api/modules/auth/**/*.js 2>/dev/null | head -40'),
    ('数据库配置', 'grep -rEn "mongoose|sequelize|typeorm|prisma|mysql|postgres|mongodb|redis|DATABASE_URL|DB_" /var/www/gakiwoo-api/.env /var/www/gakiwoo-api/config* /var/www/gakiwoo-api/src 2>/dev/null | head -25'),
    ('auth 相关环境变量', 'grep -iE "auth|jwt|secret|token|session|cookie|expire" /var/www/gakiwoo-api/.env* 2>/dev/null | head -15'),
    ('入口文件', 'cat /var/www/gakiwoo-api/server.js /var/www/gakiwoo-api/app.js /var/www/gakiwoo-api/index.js 2>/dev/null | head -40'),
]

for name, cmd in cmds:
    print(f'\n===== {name} =====')
    try:
        _, stdout, stderr = client.exec_command(cmd, timeout=40)
        out = stdout.read().decode('utf-8', errors='replace').strip()
        print(out if out else '(空)')
    except Exception as e:
        print('[执行异常]', e)

client.close()
print('\n===== 深入盘点完成（全程只读） =====')
