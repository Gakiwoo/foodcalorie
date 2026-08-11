# -*- coding: utf-8 -*-
"""部署 favorites 联查升级 → 重启 → 快速验证"""
import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
sftp = client.open_sftp()
sftp.put('src/modules/favorites/repositories/favoriteRepo.js', '/var/www/foodcalorie-api/src/modules/favorites/repositories/favoriteRepo.js')
sftp.close()

def run(cmd, timeout=90):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

run('pm2 restart foodcalorie-api')
_, _ = run('sleep 3')
out, _ = run('pm2 list | grep foodcalorie-api')
print('pm2:', out)

# 用测试账号：登录 → 收藏 recipe/1 → 列表应含标题
VERIFY = r'''const BASE1='http://127.0.0.1:3000', BASE2='http://127.0.0.1:3001'
;(async()=>{
  const j=(r)=>r.json().catch(()=>null)
  const lr=await fetch(BASE1+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'t_fc_test@x.com',password:'Test123456!'})})
  const sc=lr.headers.getSetCookie?lr.headers.getSetCookie():[]
  const at=(sc.find(x=>x.startsWith('access_token='))||'').split(';')[0].slice(13)
  const H={'Content-Type':'application/json',Authorization:'Bearer '+at}
  const req=(u,o={})=>fetch(BASE2+u,{...o,headers:{...H,...(o.headers||{})}})
  // 确保收藏存在
  await req('/api/v1/foodcalorie/favorites',{method:'POST',body:JSON.stringify({type:'recipe',ref_id:1})}).catch(()=>{})
  let r=await req('/api/v1/foodcalorie/favorites')
  let b=await j(r)
  console.log('收藏列表:', r.status, JSON.stringify(b.data?.[0] || null))
  console.log('含标题:', b.data?.[0]?.title === '牛油果鸡肉沙拉' ? '✅' : '❌', '| 含摘要:', b.data?.[0]?.summary ? '✅' : '❌', '| 含封面:', b.data?.[0]?.cover_icon ? '✅' : '❌')
  // 清理（取消收藏保持测试环境干净）
  await req('/api/v1/foodcalorie/favorites?type=recipe&ref_id=1',{method:'DELETE'})
  console.log('已清理测试收藏')
})().catch(e=>{console.log('❌',e.message);process.exit(1)})
'''
sftp = client.open_sftp()
with sftp.open('/tmp/verify_fav.js', 'w') as f:
    f.write(VERIFY)
sftp.close()
out, _ = run('node /tmp/verify_fav.js 2>&1')
print(out)
client.close()
print('===== 部署完成 =====')
