import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import App from './App.jsx';
import AppErrorBoundary from './src/ui/AppErrorBoundary.jsx';
// 本地化图标样式：替代原 index.html 的 font-awesome CDN（弱网/离线可用，APK 打包必需）
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles.css';

const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;
const bootFallback = document.getElementById('boot-fallback');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Router>
        <App />
      </Router>
    </AppErrorBoundary>
  </React.StrictMode>
);

bootFallback?.remove();
