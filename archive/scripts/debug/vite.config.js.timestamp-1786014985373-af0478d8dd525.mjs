// vite.config.js
import { defineConfig } from "file:///C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      // 认证接口 → 服务器 gakiwoo-api（注册登录模块复用）
      "/api/auth": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true
      },
      // 业务接口 → 本服务 foodcalorie-api
      "/api/v1": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXFdvcmtCdWRkeVxcXFwyMDI2LTA4LTA1LTEwLTIyLTIzXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXFdvcmtCdWRkeVxcXFwyMDI2LTA4LTA1LTEwLTIyLTIzXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yL1dvcmtCdWRkeS8yMDI2LTA4LTA1LTEwLTIyLTIzL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgb3BlbjogZmFsc2UsXG4gICAgcHJveHk6IHtcbiAgICAgIC8vIFx1OEJBNFx1OEJDMVx1NjNBNVx1NTNFMyBcdTIxOTIgXHU2NzBEXHU1MkExXHU1NjY4IGdha2l3b28tYXBpXHVGRjA4XHU2Q0U4XHU1MThDXHU3NjdCXHU1RjU1XHU2QTIxXHU1NzU3XHU1OTBEXHU3NTI4XHVGRjA5XG4gICAgICAnL2FwaS9hdXRoJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjMwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcbiAgICAgIH0sXG4gICAgICAvLyBcdTRFMUFcdTUyQTFcdTYzQTVcdTUzRTMgXHUyMTkyIFx1NjcyQ1x1NjcwRFx1NTJBMSBmb29kY2Fsb3JpZS1hcGlcbiAgICAgICcvYXBpL3YxJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjMwMDEnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxWCxTQUFTLG9CQUFvQjtBQUNsWixPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQTtBQUFBLE1BRUwsYUFBYTtBQUFBLFFBQ1gsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUE7QUFBQSxNQUVBLFdBQVc7QUFBQSxRQUNULFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
