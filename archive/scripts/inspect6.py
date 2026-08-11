# -*- coding: utf-8 -*-
"""只读：确认 gakiwoo JWT_SECRET 来源 / issueTokens payload / nginx server 块"""
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

# 1. gakiwoo-api 所有 env 文件
run('gakiwoo env 文件清单', 'ls -la /var/www/gakiwoo-api/.env* 2>/dev/null')

# 2. gakiwoo pm2 ecosystem 配置（可能含环境变量）
run('pm2 进程 env 中 JWT_SECRET 是否存在', r'''pm2 env 35 2>/dev/null | grep -iE "JWT_SECRET|AUTH|DATABASE|DB_PATH|NODE_ENV" | head -8''')

# 3. pm2 启动配置 dump
run('pm2 dump（查找启动 env 文件）', r'''cat ~/.pm2/dump.pm2 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); [print(p['name'], '->', p.get('pm_exec_path',''), p.get('env',{}).get('NODE_ENV','')) for p in d]" 2>/dev/null | head -12''')

# 4. issueTokens / jwt.sign 定义位置
run('issueTokens 与 jwt.sign 定义', r'''grep -rn "issueTokens\|jwt.sign" /var/www/gakiwoo-api/modules/auth/ /var/www/gakiwoo-api/shared/ 2>/dev/null | grep -v "\.map" | head -10''')

# 5. gakiwoo server.js 顶部 env 加载
run('gakiwoo 入口 env 加载', r'''head -30 /var/www/gakiwoo-api/server.js 2>/dev/null | grep -nE "dotenv|config|process.env" | head -6''')

# 6. nginx gakiwoo.com 完整 server 块（仅 / 与 /api 相关）
run('nginx gakiwoo.com server 块', r'''cat /etc/nginx/sites-enabled/gakiwoo.com''', 5000)

# 7. nginx 配置语法预检（只读测试）
run('nginx -t 预检（只读）', 'nginx -t 2>&1')

client.close()
print('\n===== 盘点完成（全程只读） =====')
