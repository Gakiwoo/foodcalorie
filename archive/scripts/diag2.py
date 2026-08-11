# -*- coding: utf-8 -*-
"""服务器数据库诊断（干净脚本）"""
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, timeout=60):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

out, _ = run('ls -la /var/www/foodcalorie-api/data/ 2>/dev/null')
print('data 目录:', out)

# 用 node 单行脚本查库（写入临时 js 避免引号地狱）
js = """
const D = require('/var/www/foodcalorie-api/node_modules/better-sqlite3');
const db = new D('/var/www/foodcalorie-api/data/foodcalorie.db');
console.log('tables:', db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name).join(','));
console.log('records:', JSON.stringify(db.prepare('SELECT * FROM food_records').all()));
"""
out, err = run(f'cat > /tmp/diag.js << "EOF"\n{js}\nEOF\nnode /tmp/diag.js 2>&1')
print('DB 内容:', out or err)

client.close()
print('===== 完成 =====')
