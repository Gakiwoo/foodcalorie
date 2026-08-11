# -*- coding: utf-8 -*-
"""诊断：nginx 配置文件实际内容与锚点"""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)
_, o, _ = c.exec_command('cat /etc/nginx/sites-enabled/gakiwoo.com', timeout=40)
data = o.read()
txt = data.decode('utf-8', 'replace')
print('文件大小:', len(data), 'bytes')
print('含 CRLF:', b'\r\n' in data)
print('含 "location ~*":', 'location ~*' in txt)
i = txt.find('location ~*')
print('锚点片段 repr:', repr(txt[i:i+90]) if i >= 0 else '未找到')
c.close()
