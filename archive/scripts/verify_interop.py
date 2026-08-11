# -*- coding: utf-8 -*-
"""Phase A2：真实 token 互通验证（全程服务器内 loopback）
1) gakiwoo /api/auth/login → cookie jar 捕获双 token
2) access_token 作 Bearer → 记录域 CRUD / stats / calendar
3) /api/auth/me（gakiwoo 认我们的 token）→ 双向互通证明
4) /api/auth/refresh（refresh_token 换新）→ 多端刷新证明
5) 复核共享库业务表已创建（只读）
"""
import paramiko, json

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, timeout=60):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

EMAIL, PWD = 't_fc_test@x.com', 'Test123456!'
BASE1 = 'http://127.0.0.1:3000'   # gakiwoo-api
BASE2 = 'http://127.0.0.1:3001'   # foodcalorie-api

# 1. 登录 → cookie jar
out, err = run(f'''curl -s -m 10 -c /tmp/fc.jar -X POST {BASE1}/api/auth/login -H "Content-Type: application/json" -d '{{"email":"{EMAIL}","password":"{PWD}"}}' ''')
print('1) login:', out[:200])
if '"user"' not in out:
    print('登录失败，终止'); client.close(); raise SystemExit(1)

# 2. 从 jar 提取 access/refresh token
out, _ = run(r'''awk '$6=="access_token"{print $7}' /tmp/fc.jar > /tmp/fc.at; awk '$6=="refresh_token"{print $7}' /tmp/fc.jar > /tmp/fc.rt; echo "access_len=$(wc -c < /tmp/fc.at) refresh_len=$(wc -c < /tmp/fc.rt)"''')
print('2) token 提取:', out)

def beart():
    return run('cat /tmp/fc.at')[0].strip()

# 3. 记录域 CRUD（Bearer）
at = beart()
out, _ = run(f'curl -s -m 10 {BASE2}/api/v1/foodcalorie/records -H "Authorization: Bearer {at}"')
print('3) 记录列表(空):', out[:160])

out, _ = run(f'''curl -s -m 10 -X POST {BASE2}/api/v1/foodcalorie/records -H "Content-Type: application/json" -H "Authorization: Bearer {at}" -d '{{"food_name":"红烧牛肉面","category":"中式面食","meal_type":"午餐","calories":520,"protein_g":28,"carbs_g":65,"fat_g":18,"record_time":"2026-08-06 12:00"}}' ''')
print('4) 创建记录:', out[:220])
try:
    rid = json.loads(out)['data']['id']
except Exception:
    rid = None
    print('   !! 无法解析 id，终止'); client.close(); raise SystemExit(1)

out, _ = run(f'curl -s -m 10 "{BASE2}/api/v1/foodcalorie/records?date=2026-08-06" -H "Authorization: Bearer {at}"')
print('5) 按日期列表:', out[:180])

out, _ = run(f'curl -s -m 10 "{BASE2}/api/v1/foodcalorie/records/stats?range=day&date=2026-08-06" -H "Authorization: Bearer {at}"')
print('6) 日统计:', out[:220])

out, _ = run(f'curl -s -m 10 "{BASE2}/api/v1/foodcalorie/records/calendar?month=2026-08" -H "Authorization: Bearer {at}"')
print('7) 月历:', out[:220])

out, _ = run(f'''curl -s -m 10 -X PUT {BASE2}/api/v1/foodcalorie/records/{rid} -H "Content-Type: application/json" -H "Authorization: Bearer {at}" -d '{{"calories":480,"portion":"2 份"}}' ''')
print('8) 编辑记录:', out[:160])

# 4. gakiwoo 认我们的 token（双向互通）
out, _ = run(f'curl -s -m 10 {BASE1}/api/auth/me -H "Authorization: Bearer {at}"')
print('9) gakiwoo /me(Bearer):', out[:160])

# 5. refresh 换新 token
rt = run('cat /tmp/fc.rt')[0].strip()
out, _ = run(f'''curl -s -m 10 -c /tmp/fc2.jar -X POST {BASE1}/api/auth/refresh -H "Content-Type: application/json" -d '{{"refresh_token":"{rt}"}}' ''')
print('10) refresh:', out[:120])

# 6. 删除记录（清理测试数据）
out, _ = run(f'curl -s -m 10 -X DELETE {BASE2}/api/v1/foodcalorie/records/{rid} -H "Authorization: Bearer {at}"')
print('11) 删除记录:', out[:140])

# 7. 复核共享库业务表已创建（只读）
out, _ = run(r'''node -e "const D=require('/var/www/foodcalorie-api/node_modules/better-sqlite3');const db=new D('/var/lib/gakiwoo/gakiwoo.db',{readonly:true});const t=db.prepare(\"SELECT name FROM sqlite_master WHERE type='table' AND name IN ('user_profiles','food_records','food_items','favorites','contents','challenges')\").all().map(x=>x.name);console.log('业务表:',t.join(', ')||'无');" 2>&1''')
print('12) 共享库业务表:', out[:300])

client.close()
print('\n===== Phase A2 完成 =====')
