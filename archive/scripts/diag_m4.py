# -*- coding: utf-8 -*-
"""诊断：M4 种子数据与昵称读取"""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, timeout=60):
    _, o, e = c.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

print('=== 直接 require db.js 触发种子 ===')
out, _ = run(r'''node -e "
try {
  const {getDb} = require('/var/www/foodcalorie-api/src/db.js');
  const db = getDb();
  console.log('counts:', JSON.stringify(db.prepare('SELECT (SELECT COUNT(*) FROM food_items) f,(SELECT COUNT(*) FROM contents) c,(SELECT COUNT(*) FROM challenges) g').get()));
  const u = db.prepare('SELECT id, email, nickname FROM users WHERE id = 1000000').get();
  console.log('user:', JSON.stringify(u));
} catch(e) { console.log('ERR:', e.stack); }
" 2>&1''')
print(out)

print('\n=== contents 表结构 ===')
out, _ = run(r'''node -e "
const D = require('/var/www/foodcalorie-api/node_modules/better-sqlite3');
const db = new D('/var/lib/gakiwoo/gakiwoo.db', {readonly:true});
console.log(JSON.stringify(db.prepare(\"PRAGMA table_info(contents)\").all()));
" 2>&1''')
print(out)

print('\n=== challenges 表结构 ===')
out, _ = run(r'''node -e "
const D = require('/var/www/foodcalorie-api/node_modules/better-sqlite3');
const db = new D('/var/lib/gakiwoo/gakiwoo.db', {readonly:true});
console.log(JSON.stringify(db.prepare(\"PRAGMA table_info(challenges)\").all()));
" 2>&1''')
print(out)
c.close()
