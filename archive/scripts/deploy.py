# -*- coding: utf-8 -*-
"""部署 foodcalorie-api 到阿里云服务器并验证（不动 gakiwoo-api 任何模块）"""
import os, io
import paramiko

HOST, USER, PWD = '123.57.102.126', 'root', 'WUjiaqi1006!'
REMOTE = '/var/www/foodcalorie-api'

LOCAL_FILES = [
    'package.json', '.env.example',
    'src/server.js', 'src/app.js', 'src/db.js',
    'src/modules/health/routes.js',
    'src/modules/records/routes.js', 'src/modules/records/service.js',
    'src/modules/records/repositories/recordRepo.js',
    'src/shared/middleware/requireAuth.js', 'src/shared/middleware/errorHandler.js',
    'src/shared/middleware/rateLimit.js', 'src/shared/middleware/validate.js',
    'src/shared/utils/errors.js', 'src/shared/utils/serviceError.js',
    'src/shared/utils/response.js', 'src/shared/utils/logger.js',
    'test/m1-base.test.js', 'test/records.test.js'
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PWD, timeout=25)
sftp = client.open_sftp()

def run(cmd, timeout=120):
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

# 1. 建目录 + 上传
run(f'mkdir -p {REMOTE}/src/modules/health {REMOTE}/src/modules/records/repositories {REMOTE}/src/shared/middleware {REMOTE}/src/shared/utils {REMOTE}/test {REMOTE}/data')
for f in LOCAL_FILES:
    remote = f'{REMOTE}/{f}'
    try:
        sftp.mkdir(os.path.dirname(remote))
    except OSError:
        pass
    sftp.put(f, remote)
    print('上传', f)
print('源码上传完成')

# 2. node 环境
out, _ = run('which node; node -v 2>/dev/null; ls /opt/node-v20/bin/node 2>/dev/null')
print('服务器 node:', out)

# 3. 写 .env（独立测试库，JWT_SECRET 测试值——部署接入 gakiwoo 时需改为同值）
env_content = """PORT=3001
NODE_ENV=production
DB_PATH=/var/www/foodcalorie-api/data/foodcalorie.db
JWT_SECRET=fc-deploy-test-secret-please-change
CORS_ORIGINS=https://gakiwoo.com,https://www.gakiwoo.com
"""
with sftp.open(f'{REMOTE}/.env', 'w') as f:
    f.write(env_content)
print('.env 已写入（独立测试库，未接入 gakiwoo 同库）')

# 4. npm install（服务器网络快）
out, err = run(f'cd {REMOTE} && npm install --no-audit --no-fund 2>&1 | tail -3', timeout=420)
print('npm install:', out or err)

client.close()
print('===== 部署脚本完成 =====')
