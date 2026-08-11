# -*- coding: utf-8 -*-
"""第二步：确认依赖、启动 foodcalorie-api、验证接口"""
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, timeout=120):
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='replace').strip(), stderr.read().decode('utf-8', errors='replace').strip()

REMOTE = '/var/www/foodcalorie-api'

out, _ = run(f'ls {REMOTE}/node_modules | wc -l')
print('node_modules 包数:', out)
out, _ = run(f'ls -d {REMOTE}/node_modules/express {REMOTE}/node_modules/better-sqlite3 {REMOTE}/node_modules/jsonwebtoken 2>/dev/null')
print('关键包:', out.replace('\n', ', '))

# 启动（pm2；若已存在先删）
out, _ = run('pm2 delete foodcalorie-api 2>/dev/null; pm2 start ' + REMOTE + '/src/server.js --name foodcalorie-api --node-args="--max-old-space-size=256" 2>&1 | tail -5')
print('pm2 start:', out)
out, _ = run('sleep 2; pm2 list 2>/dev/null | grep foodcalorie-api')
print('pm2 状态:', out)

# 验证
out, _ = run('curl -s -m 8 http://127.0.0.1:3001/api/v1/health')
print('health:', out)
out, _ = run('curl -s -m 8 http://127.0.0.1:3001/api/v1/foodcalorie/records')
print('records 未认证:', out)

# 用测试 JWT 验证业务流（登录/注册属 gakiwoo-api 3000，不在此验证）
import json, base64, hmac, hashlib, time
secret = 'fc-deploy-test-secret-please-change'
def b64(d): return base64.urlsafe_b64encode(json.dumps(d, separators=(',', ':')).encode()).rstrip(b'=').decode()
def b64raw(s): return base64.urlsafe_b64encode(s).rstrip(b'=').decode()
header = b64({'alg': 'HS256', 'typ': 'JWT'})
payload = b64({'id': 1, 'email': 'deploy-test@x.com', 'role': 'user', 'iat': int(time.time()), 'exp': int(time.time()) + 900})
sig = b64raw(hmac.new(secret.encode(), f'{header}.{payload}'.encode(), hashlib.sha256).digest())
token = f'{header}.{payload}.{sig}'

out, _ = run(f'curl -s -m 8 -X POST http://127.0.0.1:3001/api/v1/foodcalorie/records -H "Content-Type: application/json" -H "Authorization: Bearer {token}" -d \'{{"food_name":"测试牛肉面","meal_type":"午餐","calories":520,"record_time":"2026-08-06 12:00"}}\'')
print('创建记录:', out)
out, _ = run(f'curl -s -m 8 "http://127.0.0.1:3001/api/v1/foodcalorie/records/stats?range=day&date=2026-08-06" -H "Authorization: Bearer {token}"')
print('日统计:', out)

client.close()
print('===== 验证完成 =====')
