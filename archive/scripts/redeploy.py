# -*- coding: utf-8 -*-
import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
sftp = client.open_sftp()
sftp.put('src/app.js', '/var/www/foodcalorie-api/src/app.js')
sftp.close()
def run(cmd, timeout=120):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8','replace').strip(), e.read().decode('utf-8','replace').strip()
run('pm2 restart foodcalorie-api')
out, _ = run('sleep 3; pm2 list | grep foodcalorie-api')
print('pm2:', out)
out, _ = run('curl -s -m 8 http://127.0.0.1:3001/api/v1/health')
print('health:', out)
out, _ = run('curl -s -m 8 http://127.0.0.1:3001/api/v1/foodcalorie/records')
print('records 未认证:', out)
# 自签测试 token 验证业务流
import json, base64, hmac, hashlib, time
secret = 'fc-deploy-test-secret-please-change'
def b64(d): return base64.urlsafe_b64encode(json.dumps(d, separators=(',', ':')).encode()).rstrip(b'=').decode()
def b64raw(s): return base64.urlsafe_b64encode(s).rstrip(b'=').decode()
h = b64({'alg':'HS256','typ':'JWT'}); p = b64({'id':1,'email':'t@x.com','role':'user','iat':int(time.time()),'exp':int(time.time())+900})
t = f'{h}.{p}.{b64raw(hmac.new(secret.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest())}'
out, _ = run(f'curl -s -m 8 -X POST http://127.0.0.1:3001/api/v1/foodcalorie/records -H "Content-Type: application/json" -H "Authorization: Bearer {t}" -d \'{{"food_name":"测试牛肉面","meal_type":"午餐","calories":520,"record_time":"2026-08-06 12:00"}}\'')
print('创建记录:', out)
out, _ = run(f'curl -s -m 8 "http://127.0.0.1:3001/api/v1/foodcalorie/records/stats?range=day&date=2026-08-06" -H "Authorization: Bearer {t}"')
print('日统计:', out)
out, _ = run(f'curl -s -m 8 "http://127.0.0.1:3001/api/v1/foodcalorie/records?date=2026-08-06" -H "Authorization: Bearer {t}"')
print('记录列表:', out[:200])
client.close()
print('===== 完成 =====')
