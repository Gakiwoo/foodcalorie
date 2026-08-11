# -*- coding: utf-8 -*-
"""只读盘点阿里云服务器已有注册登录模块。仅执行只读命令，不修改服务器任何内容。"""
import paramiko

HOST = '123.57.102.126'
USER = 'root'
PWD = 'WUjiaqi1006!'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PWD, timeout=25)

cmds = [
    ('系统信息', 'uname -a; cat /etc/os-release 2>/dev/null | grep -E "PRETTY_NAME|VERSION="'),
    ('监听端口', 'ss -tlnp 2>/dev/null | head -40'),
    ('Web/应用进程', 'ps aux 2>/dev/null | grep -iE "node|python|java|nginx|gunicorn|uwsgi|php-fpm|go run|pm2" | grep -v grep | head -25'),
    ('运行中的相关服务', 'systemctl list-units --type=service --state=running 2>/dev/null | grep -iE "nginx|node|python|java|mysql|mariadb|postgres|redis|mongo|php|gunicorn|uwsgi|docker" | head -25'),
    ('Docker 容器', 'docker ps 2>/dev/null | head -15'),
    ('常见部署目录', 'ls -la /root /home /opt /srv /var/www /www 2>/dev/null | head -50'),
    ('Nginx 站点配置', 'grep -rE "server_name|proxy_pass|listen|root " /etc/nginx/conf.d/ /etc/nginx/sites-enabled/ 2>/dev/null | head -40'),
    ('查找 auth/login/user 相关目录', 'find /root /home /opt /srv /var/www /www -maxdepth 3 -type d \\( -iname "*auth*" -o -iname "*login*" -o -iname "*user*" -o -iname "*account*" \\) 2>/dev/null | head -15'),
]

for name, cmd in cmds:
    print(f'\n===== {name} =====')
    try:
        _, stdout, stderr = client.exec_command(cmd, timeout=40)
        out = stdout.read().decode('utf-8', errors='replace').strip()
        err = stderr.read().decode('utf-8', errors='replace').strip()
        print(out if out else '(空)')
        if err and 'denied' not in err and 'No such' not in err:
            print('[stderr]', err[:300])
    except Exception as e:
        print('[执行异常]', e)

client.close()
print('\n===== 盘点完成（全程只读） =====')
