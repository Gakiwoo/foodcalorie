// 全局 toast 辅助：派发 fc-toast 事件，由 App 统一展示（复用现有 toast UI）
export function toast(msg) {
  window.dispatchEvent(new CustomEvent('fc-toast', { detail: msg }));
}

// 本地日期工具（使用用户时区，非 UTC）
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function nowDateTime() {
  const d = new Date();
  return `${todayStr()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
