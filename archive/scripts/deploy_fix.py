# -*- coding: utf-8 -*-
"""部署 PUT partial 修复并验证"""
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
sftp = client.open_sftp()
sftp.put('src/modules/records/routes.js', '/var/www/foodcalorie-api/src/modules/records/routes.js')
sftp.put('src/modules/records/service.js', '/var/www/foodcalorie-api/src/modules/records/service.js')
sftp.close()

def run(cmd, timeout=90):
    _, o, e = client.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

run('pm2 restart foodcalorie-api')
_, _ = run('sleep 2')

VERIFY = r'''const BASE1='http://127.0.0.1:3000', BASE2='http://127.0.0.1:3001'
;(async()=>{
  const j=(r)=>r.json().catch(()=>null)
  // 登录拿 token
  const lr=await fetch(BASE1+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'t_fc_test@x.com',password:'Test123456!'})})
  const sc=lr.headers.getSetCookie?lr.headers.getSetCookie():[]
  const at=(sc.find(x=>x.startsWith('access_token='))||'').split(';')[0].slice(13)
  const rt=(sc.find(x=>x.startsWith('refresh_token='))||'').split(';')[0].slice(14)
  const H={'Content-Type':'application/json',Authorization:'Bearer '+at}
  const req=(u,o={})=>fetch(BASE2+u,{...o,headers:{...H,...(o.headers||{})}})
  // 创建
  let r=await req('/api/v1/foodcalorie/records',{method:'POST',body:JSON.stringify({food_name:'测试面',meal_type:'午餐',calories:520,record_time:'2026-08-06 12:00'})})
  const created=await j(r); const id=created.data.id
  console.log('A) 创建:',r.status,'id='+id)
  // 部分更新（只改 calories）
  r=await req('/api/v1/foodcalorie/records/'+id,{method:'PUT',body:JSON.stringify({calories:480})})
  let body=await j(r)
  console.log('B) 部分更新:',r.status,body.data?('calories='+body.data.calories+' name='+body.data.food_name):JSON.stringify(body))
  // 完整更新
  r=await req('/api/v1/foodcalorie/records/'+id,{method:'PUT',body:JSON.stringify({food_name:'红烧牛肉面',meal_type:'晚餐',calories:650,portion:'2 份',record_time:'2026-08-06 19:00'})})
  body=await j(r)
  console.log('C) 完整更新:',r.status,body.data?('calories='+body.data.calories+' meal='+body.data.meal_type+' portion='+body.data.portion):JSON.stringify(body))
  // 移动端模式：Cookie 头 refresh
  r=await fetch(BASE1+'/api/auth/refresh',{method:'POST',headers:{'Content-Type':'application/json',Cookie:'refresh_token='+rt}})
  const sc2=r.headers.getSetCookie?r.headers.getSetCookie():[]
  console.log('D) Cookie头 refresh:',r.status,'new_access='+(sc2.some(x=>x.startsWith('access_token='))?'YES':'NO'))
  // 清理
  r=await req('/api/v1/foodcalorie/records/'+id,{method:'DELETE'})
  console.log('E) 删除:',r.status)
})().catch(e=>{console.log('❌',e.message);process.exit(1)})
'''
sftp = client.open_sftp()
with sftp.open('/tmp/verify_fix.js', 'w') as f:
    f.write(VERIFY)
sftp.close()
out, _ = run('node /tmp/verify_fix.js 2>&1')
print(out)
client.close()
print('\n===== 修复验证完成 =====')
