# -*- coding: utf-8 -*-
"""M4 部署：上传 src 全量 → pm2 restart → 健康检查 → 运行服务器端 M4 验证脚本"""
import paramiko, os

SRC = 'src'
REMOTE = '/var/www/foodcalorie-api/src'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
sftp = client.open_sftp()

# 1. 递归上传 src（保留目录结构）
count = 0
for root, dirs, files in os.walk(SRC):
    rel = os.path.relpath(root, SRC)
    target_dir = REMOTE if rel == '.' else f'{REMOTE}/{rel.replace(os.sep, "/")}'
    try:
        sftp.stat(target_dir)
    except FileNotFoundError:
        sftp.mkdir(target_dir)
    for f in files:
        if not f.endswith('.js'):
            continue
        local = os.path.join(root, f)
        remote = f'{target_dir}/{f}'
        sftp.put(local, remote)
        count += 1
print(f'上传 {count} 个文件')
sftp.close()

def run(cmd, timeout=120):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

# 2. 重启 + 健康检查
run('pm2 restart foodcalorie-api')
_, _ = run('sleep 3')
out, _ = run('pm2 list | grep foodcalorie-api')
print('pm2:', out)
out, _ = run('curl -s -m 8 http://127.0.0.1:3001/api/v1/health')
print('health:', out)

# 3. 上传并运行 M4 验证脚本
sftp = client.open_sftp()
sftp.put('verify_m4.js', '/tmp/verify_m4.js')
sftp.close()
out, _ = run('node /tmp/verify_m4.js 2>&1', timeout=120)
print(out)

client.close()
print('\n===== M4 部署与验证完成 =====')
