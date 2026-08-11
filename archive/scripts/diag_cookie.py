# -*- coding: utf-8 -*-
"""诊断：cookie jar 内容与 node fetch set-cookie"""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(cmd, timeout=60):
    _, o, e = c.exec_command(cmd, timeout=timeout)
    return o.read().decode('utf-8', 'replace').strip(), e.read().decode('utf-8', 'replace').strip()

print('=== /tmp/fc.jar 内容 ===')
out, _ = run('cat /tmp/fc.jar')
print(out)

print('\n=== node fetch 登录（捕获 Set-Cookie）===')
out, _ = run(r'''node -e "
(async()=>{
  const r = await fetch('http://127.0.0.1:3000/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'t_fc_test@x.com',password:'Test123456!'})});
  console.log('status:', r.status);
  console.log('set-cookie:', JSON.stringify(r.headers.getSetCookie ? r.headers.getSetCookie() : r.headers.get('set-cookie')));
  const b = await r.json(); console.log('body:', JSON.stringify(b));
})().catch(e=>console.log('ERR', e.message));
" 2>&1''')
print(out)
c.close()
