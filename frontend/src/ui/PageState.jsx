// 页面三态组件：加载中 / 错误+重试 / 空态
// 收敛全站 ~20 处重复的"加载中…/错误+重试"骨架（🟡19）。
import React from 'react'

const CENTER = {
  padding: 40,
  textAlign: 'center',
  fontSize: 14,
  lineHeight: '20px'
}

/** 加载态：`<Loading />` 或 `<Loading text="搜索中…" />` */
export function Loading({ text = '加载中…', padding = 40 }) {
  return (
    <div style={{ ...CENTER, padding, color: '#9CA3AF' }}>{text}</div>
  );
}

/** 错误态 + 重试按钮：`<ErrorRetry error={error} onRetry={load} />` */
export function ErrorRetry({ error, onRetry, padding = 40 }) {
  return (
    <div style={{ ...CENTER, padding, color: '#E03131' }}>
      {error || '加载失败，请稍后重试'}
      {onRetry && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={onRetry}
            style={{ padding: '8px 24px', borderRadius: 12, border: 'none', background: '#34C759', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            重试
          </button>
        </div>
      )}
    </div>
  );
}

/** 空态：图标 + 文案 + 可选动作按钮 */
export function EmptyState({ icon = 'fa-utensils', text, actionText, onAction, padding = 32 }) {
  return (
    <div style={{ padding, textAlign: 'center', background: '#FFFFFF', borderRadius: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}>
      <i className={'fas ' + icon} style={{ fontSize: 28, color: '#D1D5DB' }} />
      <div style={{ marginTop: 8, fontSize: 13, color: '#9CA3AF' }}>{text}</div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{ marginTop: 14, padding: '9px 28px', borderRadius: 14, border: 'none', background: '#34C759', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          {actionText}
        </button>
      )}
    </div>
  );
}
