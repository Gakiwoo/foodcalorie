# -*- coding: utf-8 -*-
"""服务器补 devDeps + 上传 test/ + 跑单测（DB_PATH 用临时库防污染共享库）"""
import paramiko, os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, timeout=300):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

# 1. 检查服务器 test 目录与 supertest
out, _ = run('ls /var/www/foodcalorie-api/test/ 2>/dev/null || echo "无 test 目录"')
print('服务器 test:', out)
out, _ = run('ls /var/www/foodcalorie-api/node_modules/supertest 2>/dev/null >/dev/null && echo "supertest 已装" || echo "supertest 未装"')
print(out)

# 2. 上传本地 test/（确保最新）
sftp = client.open_sftp()
for f in os.listdir('test'):
    if f.endswith('.js'):
        sftp.put(f'test/{f}', f'/var/www/foodcalorie-api/test/{f}')
        print('上传 test/', f)
sftp.close()

# 3. 补 devDeps（服务器网络快）
out, _ = run('cd /var/www/foodcalorie-api && npm install --include=dev 2>&1 | tail -3', timeout=400)
print('npm install:', out)

# 4. 跑单测（DB_PATH 临时库）
out, err = run('cd /var/www/foodcalorie-api && DB_PATH=/tmp/fc-unit-test.db NODE_ENV=test npm test 2>&1', timeout=300)
print(out[-3000:] if len(out) > 3000 else out)
if err:
    print('[stderr]', err[:300])

client.close()
print('\n===== 单测完成 =====')
