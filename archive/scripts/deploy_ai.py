# -*- coding: utf-8 -*-
"""部署 AI 接口：上传 ai 模块 + app.js → npm i multer → restart → 验证"""
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
sftp = c.open_sftp()

# 确保目录
for d in ['/var/www/foodcalorie-api/src/modules/ai', '/var/www/foodcalorie-api/src/modules/ai/repositories']:
    try:
        sftp.stat(d)
    except FileNotFoundError:
        sftp.mkdir(d)

for remote, local in [
    ('/var/www/foodcalorie-api/src/modules/ai/routes.js', 'src/modules/ai/routes.js'),
    ('/var/www/foodcalorie-api/src/modules/ai/service.js', 'src/modules/ai/service.js'),
    ('/var/www/foodcalorie-api/src/modules/ai/repositories/aiRepo.js', 'src/modules/ai/repositories/aiRepo.js'),
    ('/var/www/foodcalorie-api/src/app.js', 'src/app.js')]:
    sftp.put(local, remote)
    print('上传', remote)
sftp.close()

def run(cmd, t=300):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

out, _ = run('cd /var/www/foodcalorie-api && npm install multer 2>&1 | tail -2', t=300)
print('npm multer:', out)
run('pm2 restart foodcalorie-api')
_, _ = run('sleep 3')

VERIFY = """
const BASE1='http://127.0.0.1:3000', BASE2='http://127.0.0.1:3001'
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==','base64')
;(async()=>{
  const j=(r)=>r.json().catch(()=>null)
  const lr=await fetch(BASE1+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'t_fc_test@x.com',password:'Test123456!'})})
  const sc=lr.headers.getSetCookie?lr.headers.getSetCookie():[]
  const at=(sc.find(x=>x.startsWith('access_token='))||'').split(';')[0].slice(13)
  const H={'Authorization':'Bearer '+at}
  let r=await fetch(BASE2+'/api/v1/foodcalorie/ai/recognize',{method:'POST',headers:H})
  let b=await j(r)
  console.log('无图:', r.status, b.message||'')
  const fd=new FormData()
  fd.append('image', new Blob([PNG],{type:'image/png'}), 'test.png')
  r=await fetch(BASE2+'/api/v1/foodcalorie/ai/recognize',{method:'POST',headers:H,body:fd})
  b=await j(r)
  console.log('PNG 识别:', r.status, '候选数:', b.data?.candidates?.length, '首候选:', b.data?.candidates?.[0]?.name, 'conf:', b.data?.candidates?.[0]?.confidence)
  console.log('候选全部含营养:', b.data?.candidates?.every(x=>x.calories>0)?'YES':'NO')
  const fd2=new FormData(); fd2.append('image', new Blob(['hello'],{type:'text/plain'}), 'a.txt')
  r=await fetch(BASE2+'/api/v1/foodcalorie/ai/recognize',{method:'POST',headers:H,body:fd2})
  b=await j(r)
  console.log('非图片:', r.status, b.message||'')
})().catch(e=>{console.log('ERR',e.message);process.exit(1)})
"""
sftp = c.open_sftp()
with sftp.open('/tmp/verify_ai.js', 'w') as f:
    f.write(VERIFY)
sftp.close()
out, _ = run('node /tmp/verify_ai.js 2>&1')
print(out)
c.close()
