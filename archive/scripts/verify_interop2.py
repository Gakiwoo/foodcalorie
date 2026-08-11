# -*- coding: utf-8 -*-
"""Phase A2（重跑）：node 捕获 token → Bearer 全链路互通验证"""
import paramiko, json

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, timeout=60):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

BASE1 = 'http://127.0.0.1:3000'
BASE2 = 'http://127.0.0.1:3001'

# 1. node 登录并落盘 token（不打印 token 值）
out, _ = run(r'''node -e "
(async()=>{
  const fs=require('fs');
  const r=await fetch('http://127.0.0.1:3000/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'t_fc_test@x.com',password:'Test123456!'})});
  const sc=r.headers.getSetCookie();
  const at=sc.find(x=>x.startsWith('access_token=')).split(';')[0].slice(13);
  const rt=sc.find(x=>x.startsWith('refresh_token=')).split(';')[0].slice(14);
  fs.writeFileSync('/tmp/fc.at',at); fs.writeFileSync('/tmp/fc.rt',rt);
  console.log('token 已落盘', at.length, rt.length);
})().catch(e=>console.log('ERR',e.message));
" 2>&1''')
print('1) 登录捕获 token:', out)

def at():
    return run('cat /tmp/fc.at')[0].strip()

# 2. 记录域 CRUD（Bearer）
t = at()
out, _ = run(f'curl -s -m 10 {BASE2}/api/v1/foodcalorie/records -H "Authorization: Bearer {t}"')
print('2) 记录列表:', out[:160])

out, _ = run(f'''curl -s -m 10 -X POST {BASE2}/api/v1/foodcalorie/records -H "Content-Type: application/json" -H "Authorization: Bearer {t}" -d '{{"food_name":"红烧牛肉面","category":"中式面食","meal_type":"午餐","calories":520,"protein_g":28,"carbs_g":65,"fat_g":18,"record_time":"2026-08-06 12:00"}}' ''')
print('3) 创建记录:', out[:200])
rid = json.loads(out).get('data', {}).get('id')
if not rid:
    print('!! 创建失败，终止'); client.close(); raise SystemExit(1)

out, _ = run(f'curl -s -m 10 "{BASE2}/api/v1/foodcalorie/records?date=2026-08-06" -H "Authorization: Bearer {t}"')
print('4) 按日期列表:', out[:170])

out, _ = run(f'curl -s -m 10 "{BASE2}/api/v1/foodcalorie/records/stats?range=day&date=2026-08-06" -H "Authorization: Bearer {t}"')
print('5) 日统计:', out[:200])

out, _ = run(f'curl -s -m 10 "{BASE2}/api/v1/foodcalorie/records/calendar?month=2026-08" -H "Authorization: Bearer {t}"')
print('6) 月历:', out[:200])

out, _ = run(f'''curl -s -m 10 -X PUT {BASE2}/api/v1/foodcalorie/records/{rid} -H "Content-Type: application/json" -H "Authorization: Bearer {t}" -d '{{"calories":480,"portion":"2 份"}}' ''')
print('7) 编辑记录:', out[:150])

# 3. gakiwoo /me 认我们的 token（双向互通）
out, _ = run(f'curl -s -m 10 {BASE1}/api/auth/me -H "Authorization: Bearer {t}"')
print('8) gakiwoo /me(Bearer):', out[:160])

# 4. refresh 换新
rt = run('cat /tmp/fc.rt')[0].strip()
out, _ = run(f'''node -e "
(async()=>{
  const r=await fetch('http://127.0.0.1:3000/api/auth/refresh',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refresh_token:process.argv[1]})});
  const sc=r.headers.getSetCookie()||[];
  console.log('status',r.status,'new_access='+(sc.find(x=>x.startsWith('access_token='))?'YES':'NO'), 'new_refresh='+(sc.find(x=>x.startsWith('refresh_token='))?'YES':'NO'));
})().catch(e=>console.log('ERR',e.message));
" "{rt}" 2>&1''')
print('9) refresh 换新:', out[:200])

# 5. 删除记录（清理）
out, _ = run(f'curl -s -m 10 -X DELETE {BASE2}/api/v1/foodcalorie/records/{rid} -H "Authorization: Bearer {t}"')
print('10) 删除记录:', out[:140])

# 6. 复核共享库业务表（只读）
out, _ = run(r'''node -e "const D=require('/var/www/foodcalorie-api/node_modules/better-sqlite3');const db=new D('/var/lib/gakiwoo/gakiwoo.db',{readonly:true});const t=db.prepare(\"SELECT name FROM sqlite_master WHERE type='table' AND name IN ('user_profiles','food_records','food_items','favorites','contents','challenges')\").all().map(x=>x.name);console.log('业务表:',t.join(', ')||'无');const c=db.prepare('SELECT COUNT(*) c FROM food_records').get();console.log('food_records 残留:',c.c);" 2>&1''')
print('11) 共享库业务表:', out[:300])

client.close()
print('\n===== Phase A2 完成 =====')
