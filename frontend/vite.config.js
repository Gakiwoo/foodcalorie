import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 生产构建部署到 https://gakiwoo.com/foodcalorie/（子路径），静态资源以 /foodcalorie/ 为基准；本地 dev 用 /
// 本地开发代理：前端 localhost:5173 → 服务器
//   /api/auth/*  → https://gakiwoo.com（Nginx → 127.0.0.1:3000 gakiwoo-api，注册登录模块复用，零改动）
//   /api/v1/*    → https://gakiwoo.com（Nginx → 127.0.0.1:3001 foodcalorie-api；由 nginx 守护脚本保证 location 存在；
//                   3001 已收敛为仅本机监听，不可再直连）
function cookieRewrite() {
  // 开发专用：剥离 Set-Cookie 的 Domain=.gakiwoo.com 与 Secure，
  // 否则浏览器（localhost）拒绝存储 → 本地登录态失效。不修改服务器任何行为。
  return (proxy) => {
    proxy.on('proxyRes', (proxyRes) => {
      const sc = proxyRes.headers['set-cookie'];
      if (sc) {
        proxyRes.headers['set-cookie'] = sc.map((c) =>
          c.replace(/;\s*Domain=[^;]+/i, '').replace(/;\s*Secure/i, '')
        );
      }
    });
  };
}

export default defineConfig({
  // base './'：Web 子域根路径部署与 Capacitor APK（本地 assets 加载）双兼容
  //   - Web：https://foodcalorie.gakiwoo.com/ 下 index.html 的 ./assets/… 解析为 /assets/…（与 '/' 等价）
  //   - APK：capacitor://localhost/ 下相对路径可解析（'/' 绝对路径在部分 WebView 下白屏）
  base: './',
  // build.target es2015：Capacitor minSdk 22 覆盖的老 WebView 不支持 Vite 默认 ES2020 → 白屏
  build: {
    target: 'es2015'
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 绑定所有接口（E2E 脚本用 127.0.0.1 访问；默认 localhost 在 Windows 仅绑 ::1）
    port: 5173,
    open: false,
    proxy: {
      '/api/auth': {
        target: 'https://gakiwoo.com',
        changeOrigin: true,
        configure: cookieRewrite()
      },
      '/api/v1': {
        target: 'https://gakiwoo.com',
        changeOrigin: true
      }
    }
  }
});
