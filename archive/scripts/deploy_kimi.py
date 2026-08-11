# -*- coding: utf-8 -*-
"""部署 Kimi 视觉识别：上传 ai 模块 → restart → 验证（无 key 降级 + 单测）"""
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
sftp = c.open_sftp()
for remote, local in [
    ('/var/www/foodcalorie-api/src/modules/ai/routes.js', 'src/modules/ai/routes.js'),
    ('/var/www/foodcalorie-api/src/modules/ai/service.js', 'src/modules/ai/service.js'),
    ('/var/www/foodcalorie-api/src/modules/ai/repositories/aiRepo.js', 'src/modules/ai/repositories/aiRepo.js'),
    ('/var/www/foodcalorie-api/test/ai.test.js', 'test/ai.test.js')]:
    sftp.put(local, remote)
    print('上传', remote)
sftp.close()

def run(cmd, t=300):
    _, o, e = c.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

run('pm2 restart foodcalorie-api')
_, _ = run('sleep 3')

# 1) 接口验证（服务器 .env 无 MOONSHOT_API_KEY → 降级）
VERIFY = """
const BASE1='http://127.0.0.1:3000', BASE2='http://127.0.0.1:3001'
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==','base64')
;(async()=>{
  const j=(r)=>r.json().catch(()=>null)
  const lr=await fetch(BASE1+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'t_fc_test@x.com',password:'Test123456!'})})
  const sc=lr.headers.getSetCookie?lr.headers.getSetCookie():[]
  const at=(sc.find(x=>x.startsWith('access_token='))||'').split(';')[0].slice(13)
  const H={'Authorization':'Bearer '+at}
  const fd=new FormData()
  fd.append('image', new Blob([PNG],{type:'image/png'}), 'test.png')
  const r=await fetch(BASE2+'/api/v1/foodcalorie/ai/recognize',{method:'POST',headers:H,body:fd})
  const b=await j(r)
  console.log('识别接口:', r.status, '候选数:', b.data?.candidates?.length, '| message:', b.data?.message)
  console.log('降级路径正常:', b.data?.message?.includes('候选推荐')||b.data?.message?.includes('未启用') ? 'YES' : 'NO')
})().catch(e=>{console.log('ERR',e.message);process.exit(1)})
"""
sftp = c.open_sftp()
with sftp.open('/tmp/verify_kimi.js', 'w') as f:
    f.write(VERIFY)
sftp.close()
out, _ = run('node /tmp/verify_kimi.js 2>&1')
print(out)

# 2) 单测（无 key 路径）
out, _ = run('cd /var/www/foodcalorie-api && DB_PATH=/tmp/fc-kimi.db NODE_ENV=test npm test 2>&1 | tail -8', t=300)
print(out)
c.close()
