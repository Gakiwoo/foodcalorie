# -*- coding: utf-8 -*-
"""只读：接入正式环境前最后一次盘点（pm2/.env键名/token payload/nginx）"""
import paramiko, re

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('123.57.102.126', username='root', password='WUjiaqi1006!', timeout=25)

def run(name, cmd, limit=3000):
    print(f'\n===== {name} =====')
    _, stdout, stderr = client.exec_command(cmd, timeout=40)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    print(out[:limit] if out else ('(空)' + (f' [stderr] {err[:200]}' if err else '')))

# 1. 服务状态
run('pm2 服务列表', 'pm2 list 2>/dev/null | grep -E "foodcalorie|gakiwoo|name|online|errored" | head -8')

# 2. foodcalorie-api 现有 .env 键名（脱敏）
run('foodcalorie-api .env 键名(脱敏)', r'''awk -F= '{ if ($1 ~ /SECRET|PASSWORD|KEY|TOKEN/) print $1"=***"; else print }' /var/www/foodcalorie-api/.env 2>/dev/null''')

# 3. gakiwoo-api .env 键名（脱敏）
run('gakiwoo-api .env 键名(脱敏)', r'''awk -F= '{ if ($1 ~ /SECRET|PASSWORD|KEY|TOKEN/) print $1"=<masked>"; else print }' /var/www/gakiwoo-api/.env 2>/dev/null | head -25''')

# 4. gakiwoo JWT_SECRET 与 foodcalorie 是否同值（只比较，不显示）
run('JWT_SECRET 一致性检查', r'''S1=$(grep -oE '^JWT_SECRET=.*' /var/www/gakiwoo-api/.env 2>/dev/null | head -1); S2=$(grep -oE '^JWT_SECRET=.*' /var/www/foodcalorie-api/.env 2>/dev/null | head -1); if [ -n "$S1" ] && [ -n "$S2" ] && [ "$S1" = "$S2" ]; then echo "✅ 两服务 JWT_SECRET 相同"; else echo "⚠️ 不同或缺失  gakiwoo: ${S1:0:20}...  foodcalorie: ${S2:0:20}..."; fi''')

# 5. gakiwoo DB 文件位置
run('gakiwoo 数据库文件', r'''grep -oE '^DB_PATH=.*' /var/www/gakiwoo-api/.env 2>/dev/null; find /var/www/gakiwoo-api -maxdepth 2 -name '*.db' 2>/dev/null; ls -la /var/www/gakiwoo-api/data/ 2>/dev/null | head -8''')

# 6. gakiwoo token payload claims（jwt.sign 调用）
run('gakiwoo jwt.sign payload 字段', r'''grep -rn "jwt.sign\|payload" /var/www/gakiwoo-api/modules/auth/service.js /var/www/gakiwoo-api/shared/utils/*.js 2>/dev/null | grep -iE "sign|payload|expiresIn|{ *id|id:|email" | head -12''')

# 7. gakiwoo 登录/刷新响应体是否含 token（Set-Cookie vs body）
run('gakiwoo authCookies 下发方式', r'''grep -nE "res.cookie|accessToken|refreshToken|res.json|Set-Cookie|maxAge|httpOnly" /var/www/gakiwoo-api/shared/utils/authCookies.js 2>/dev/null | head -14''')

# 8. nginx 配置：/api/auth location 与配置文件位置
run('nginx /api 相关 location', r'''grep -rn "api/auth\|api/v1\|proxy_pass" /etc/nginx/conf.d/ /etc/nginx/sites-enabled/ 2>/dev/null | grep -vE "^\s*#" | head -20; ls /etc/nginx/conf.d/ 2>/dev/null''')

client.close()
print('\n===== 盘点完成（全程只读） =====')
