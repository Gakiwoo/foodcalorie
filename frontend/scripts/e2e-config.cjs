// E2E 脚本共享配置（环境变量优先，消除硬编码本机路径）
// 可用变量：
//   FC_CHROME_PATH    Chrome/Chromium 可执行路径（默认按平台探测）
//   FC_E2E_BASE       被测站点地址（默认本地 dev server）
//   FC_SHOT_DIR       截图输出目录（默认系统临时目录）
const os = require('os')
const path = require('path')

const root = (process.env.FC_E2E_BASE || 'http://127.0.0.1:5173').replace(/\/+$/, '')

module.exports = {
  CHROME:
    process.env.FC_CHROME_PATH ||
    (process.platform === 'win32'
      ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
      : '/usr/bin/google-chrome'),
  // 带尾斜杠：供 BASE + 'login' 风格拼接（多数脚本）
  BASE: root + '/',
  // 无尾斜杠：供 BASE + '/login' 风格拼接
  ROOT: root,
  SHOT_DIR: process.env.FC_SHOT_DIR || path.join(os.tmpdir(), 'fc-e2e-shots')
}
