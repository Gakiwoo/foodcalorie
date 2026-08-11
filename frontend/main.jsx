import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
// 本地化图标样式：替代原 index.html 的 font-awesome CDN（弱网/离线可用，APK 打包必需）
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles.css';

// 生产部署到独立子域名 foodcalorie.gakiwoo.com（根路径），basename 恒为 /
const basename = '/';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
