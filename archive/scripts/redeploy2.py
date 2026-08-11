# -*- coding: utf-8 -*-
"""重新部署修复版并完整验证记录 CRUD"""
import paramiko, json, base64, hmac, hashlib, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
sftp = client.open_sftp()
for f in ['src/modules/records/routes.js', 'src/modules/records/repositories/recordRepo.js']:
    sftp.put(f, f'/var/www/foodcalorie-api/{f}')
sftp.close()

def run(cmd, timeout=90):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

run('pm2 restart foodcalorie-api --update-env')
run('sleep 3')

# 自签测试 token（与服务器 .env 的 JWT_SECRET 一致）
secret = 'fc-deploy-test-secret-please-change'
def b64(d): return base64.urlsafe_b64encode(json.dumps(d, separators=(',', ':')).encode()).rstrip(b'=').decode()
def b64raw(s): return base64.urlsafe_b64encode(s).rstrip(b'=').decode()
h = b64({'alg': 'HS256', 'typ': 'JWT'})
p = b64({'id': 1, 'email': 't@x.com', 'role': 'user', 'iat': int(time.time()), 'exp': int(time.time()) + 900})
tok = f'{h}.{p}.{b64raw(hmac.new(secret.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest())}'
AUTH = f'-H "Authorization: Bearer {tok}"'

out, _ = run(f'curl -s -m 8 http://127.0.0.1:3001/api/v1/health')
print('health:', out)

# 1. 创建
out, _ = run(f'curl -s -m 8 -X POST http://127.0.0.1:3001/api/v1/foodcalorie/records -H "Content-Type: application/json" {AUTH} -d \'{{"food_name":"红烧牛肉面","category":"中式面食","meal_type":"午餐","calories":520,"protein_g":28,"carbs_g":65,"fat_g":18,"record_time":"2026-08-06 12:30"}}\'')
print('1 创建:', out)
# 2. 再建一条早餐
run(f'curl -s -m 8 -X POST http://127.0.0.1:3001/api/v1/foodcalorie/records -H "Content-Type: application/json" {AUTH} -d \'{{"food_name":"蓝莓酸奶杯","meal_type":"早餐","calories":210,"record_time":"2026-08-06 09:15"}}\'')
# 3. 列表
out, _ = run(f'curl -s -m 8 "http://127.0.0.1:3001/api/v1/foodcalorie/records?date=2026-08-06" {AUTH}')
print('2 列表:', out[:300])
# 4. 日统计
out, _ = run(f'curl -s -m 8 "http://127.0.0.1:3001/api/v1/foodcalorie/records/stats?range=day&date=2026-08-06&target=1400" {AUTH}')
print('3 日统计:', out)
# 5. 编辑第一条
out, _ = run(f'curl -s -m 8 -X PUT http://127.0.0.1:3001/api/v1/foodcalorie/records/1 -H "Content-Type: application/json" {AUTH} -d \'{{"food_name":"红烧牛肉面","meal_type":"午餐","calories":600,"record_time":"2026-08-06 12:30"}}\'')
print('4 编辑:', out[:200])
# 6. 删除
out, _ = run(f'curl -s -m 8 -X DELETE http://127.0.0.1:3001/api/v1/foodcalorie/records/2 {AUTH}')
print('5 删除:', out)
# 7. 月历
out, _ = run(f'curl -s -m 8 "http://127.0.0.1:3001/api/v1/foodcalorie/records/calendar?month=2026-08" {AUTH}')
print('6 月历:', out)

client.close()
print('===== 完整验证完成 =====')
