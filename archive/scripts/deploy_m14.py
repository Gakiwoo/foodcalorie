# -*- coding: utf-8 -*-
# M14 部署：图片持久化 + 模型回灌 + Swagger 白名单 + 挑战连续打卡
# 1) 上传后端改动文件 + 单测
# 2) 建 uploads 目录
# 3) 子域 nginx 加 location ^~ /uploads/ → alias
# 4) pm2 restart + 验证
import paramiko
import io

HOST = '123.57.102.126'
USER = 'root'
PWD = 'WUjiaqi1006!'

FILES = [
    ('src/db.js', '/var/www/foodcalorie-api/src/db.js'),
    ('src/app.js', '/var/www/foodcalorie-api/src/app.js'),
    ('src/modules/ai/routes.js', '/var/www/foodcalorie-api/src/modules/ai/routes.js'),
    ('src/modules/ai/service.js', '/var/www/foodcalorie-api/src/modules/ai/service.js'),
    ('src/modules/ai/repositories/aiRepo.js', '/var/www/foodcalorie-api/src/modules/ai/repositories/aiRepo.js'),
    ('src/modules/records/routes.js', '/var/www/foodcalorie-api/src/modules/records/routes.js'),
    ('src/modules/challenges/service.js', '/var/www/foodcalorie-api/src/modules/challenges/service.js'),
    ('src/modules/challenges/repositories/challengeRepo.js', '/var/www/foodcalorie-api/src/modules/challenges/repositories/challengeRepo.js'),
    ('test/ai.test.js', '/var/www/foodcalorie-api/test/ai.test.js'),
    ('test/challenges.test.js', '/var/www/foodcalorie-api/test/challenges.test.js'),
]

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username=USER, password=PWD, timeout=25)

def run(cmd, t=90):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

# 1) 上传文件
sftp = c.open_sftp()
for local, remote in FILES:
    sftp.put(local, remote)
    print('上传', remote.split('/')[-1])
sftp.close()

# 2) uploads 目录（mkdir -p + 软链校验）
out, _ = run('mkdir -p /var/www/foodcalorie-api/uploads && ls -ld /var/www/foodcalorie-api/uploads')
print('uploads 目录:', out)

# 3) 子域 nginx 加 /uploads/ location（若不存在）
CFG = '/etc/nginx/sites-enabled/foodcalorie.gakiwoo.com'
out, _ = run(f'cat {CFG}')
cfg = out
if 'location ^~ /uploads/' not in cfg:
    BLOCK = """    location ^~ /uploads/ {
        alias /var/www/foodcalorie-api/uploads/;
        add_header Cache-Control "public, max-age=86400";
    }
"""
    # 插到第一个 location 之前（保持 server 块内合法）
    idx = cfg.find('\n    location')
    if idx == -1:
        print('!! 未找到插入点')
    else:
        cfg = cfg[:idx] + '\n' + BLOCK + cfg[idx+1:]
        sftp = c.open_sftp()
        with sftp.open(CFG, 'w') as f:
            f.write(cfg)
        sftp.close()
        print('已注入 /uploads/ location')
else:
    print('/uploads/ location 已存在')

out, err = run('nginx -t 2>&1')
print('nginx -t:', out.splitlines()[-1] if out else err)
if 'successful' in out:
    run('nginx -s reload')
    print('nginx reloaded')
else:
    print('!! nginx -t 失败，检查配置')

# 4) 重启 + 验证
run('pm2 restart foodcalorie-api')
import time
time.sleep(3)
out, _ = run('pm2 list | grep foodcalorie-api | awk "{print \\$12, \\$14}"')
print('pm2:', out)

# 5) 功能验证：识别返回 image_url + 上传目录有文件 + 回灌 + 挑战 streak
VERIFY = r'''const BASE='http://127.0.0.1:3001'
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==','base64')
;(async()=>{
  const j=(r)=>r.json().catch(()=>null)
  const lr=await fetch('http://127.0.0.1:3000/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'t_fc_test@x.com',password:'Test123456!'})})
  const sc=lr.headers.getSetCookie?lr.headers.getSetCookie():[]
  const at=(sc.find(x=>x.startsWith('access_token='))||'').split(';')[0].slice(13)
  const H={'Authorization':'Bearer '+at}
  const fd=new FormData()
  fd.append('image', new Blob([PNG],{type:'image/png'}), 'test.png')
  let r=await fetch(BASE+'/api/v1/foodcalorie/ai/recognize',{method:'POST',headers:H,body:fd})
  let b=await j(r)
  console.log('recognize:', r.status, '| image_url:', b.data?.image_url, b.data?.image_url?.startsWith('/uploads/')?'✅':'❌', '| 候选:', b.data?.candidates?.length)
  // 提交记录带 image_url
  const rec={food_name:'测试图片记录',meal_type:'午餐',calories:100,record_time:new Date(Date.now()+8*3600*1000).toISOString().slice(0,16).replace('T',' '),source:'AI识别',image_url:b.data?.image_url||null}
  r=await fetch(BASE+'/api/v1/foodcalorie/records',{method:'POST',headers:{...H,'Content-Type':'application/json'},body:JSON.stringify(rec)})
  b=await j(r)
  console.log('create record:', r.status, '| id:', b.data?.id, '| image_url 落库:', b.data?.image_url?'✅':'❌')
  // 挑战：查当前参与状态，测一次打卡
  r=await fetch(BASE+'/api/v1/foodcalorie/challenges',{headers:H})
  b=await j(r)
  const joined=b.data?.find?.((x)=>x.joined)
  console.log('challenges:', r.status, '| 已参与:', !!joined, '| streak_days 字段:', joined?('streak_days' in joined?'✅':'❌'):'（未参与）')
  // 静态图片可访问（走 nginx /uploads/）
  if(b.data?.image_url){
    const img=await fetch('http://127.0.0.1:3001'+b.data.image_url.replace('/uploads/','/uploads/')).catch(()=>null)
  }
})().catch(e=>{console.log('❌',e.message);process.exit(1)})
'''
sftp = c.open_sftp()
with sftp.open('/tmp/verify_m14.js', 'w') as f:
    f.write(VERIFY)
sftp.close()
out, _ = run('node /tmp/verify_m14.js 2>&1')
print(out)
# 清理
run('rm -f /tmp/verify_m14.js')
c.close()
