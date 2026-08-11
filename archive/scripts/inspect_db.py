# -*- coding: utf-8 -*-
"""只读：确认 gakiwoo-api SQLite 路径与 JWT_SECRET 配置方式（注册登录对接所需）"""
import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
def run(name, cmd, limit=2500):
    print(f'\n===== {name} =====')
    _, stdout, _ = client.exec_command(cmd, timeout=40)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    print(out[:limit] if out else '(空)')
run('db core 文件头', 'sed -n "1,40p" /var/www/gakiwoo-api/shared/db/core.js')
run('数据库文件位置', 'grep -rnE "DB_PATH|database|\.db" /var/www/gakiwoo-api/shared/db/core.js /var/www/gakiwoo-api/.env.example 2>/dev/null | head -10; find /var/www/gakiwoo-api -maxdepth 2 -name "*.db" 2>/dev/null; find /var/www -maxdepth 3 -name "*.db" 2>/dev/null | head -5')
run('.env 中 DB/JWT 键名（脱敏）', 'grep -oE "^[A-Z_]+" /var/www/gakiwoo-api/.env 2>/dev/null | head -20')
client.close()
print('\n===== 完成（只读） =====')
