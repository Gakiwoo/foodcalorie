// 共享 UI 组件：状态栏 / 顶部导航 / 底部导航 / 进度环 / 分段控件
// 视觉规范：页面背景 #F7F8FA、主题绿 #34C759、卡片白色圆角 16px
import React from 'react';
import { useNavigate } from 'react-router-dom';

export function StatusBar() {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px 8px' }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>9:41</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <i className="fas fa-signal" style={{ fontSize: 13, color: '#1A1A1A' }} />
        <i className="fas fa-wifi" style={{ fontSize: 13, color: '#1A1A1A' }} />
        <i className="fas fa-battery-full" style={{ fontSize: 13, color: '#1A1A1A' }} />
      </div>
    </div>
  );
}

export function NavBar({ title, right, onBack }) {
  const navigate = useNavigate();
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
      <div
        style={{ width: 32, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => (onBack ? onBack() : navigate(-1))}>
        <i className="fas fa-chevron-left" style={{ fontSize: 20, color: '#1A1A1A' }} />
      </div>
      <p style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{title}</p>
      <div style={{ width: 32, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>{right}</div>
    </div>
  );
}

const NAV_ITEMS = [
  { key: '/', icon: 'fa-house', label: '首页' },
  { key: '/discover', icon: 'fa-compass', label: '发现' },
  { key: '/records', icon: 'fa-clipboard-list', label: '记录' },
  { key: '/me', icon: 'fa-user', label: '我的' }
];

export function BottomNav({ active }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        marginTop: 'auto',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        background: '#FFFFFF',
        borderTop: '1px solid #F0F2F5',
        padding: '8px 0 20px'
      }}>
      {NAV_ITEMS.map((n) => {
        const on = n.key === active;
        return (
          <div key={n.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate(n.key)}>
            <i className={'fas ' + n.icon} style={{ fontSize: 18, color: on ? '#34C759' : '#C0C4CC' }} />
            <span style={{ fontSize: 10, color: on ? '#34C759' : '#9CA3AF' }}>{n.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// SVG 渐变进度环（百分比 0-100）
export function Ring({ percent, size = 120, stroke = 11, label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(100, Math.max(0, percent)) / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34C759" />
            <stop offset="100%" stopColor="#1FA355" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8F5EC" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A' }}>{label}</span>
        {sub && <span style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{sub}</span>}
      </div>
    </div>
  );
}

// 分段控件
export function Seg({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', background: '#EEF0F2', borderRadius: 12, padding: 3 }}>
      {options.map((o) => (
        <div
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '7px 0',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            background: value === o.value ? '#FFFFFF' : 'transparent',
            color: value === o.value ? '#34C759' : '#9CA3AF',
            boxShadow: value === o.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
          }}>
          {o.label}
        </div>
      ))}
    </div>
  );
}

// 白色圆角卡片容器（透传 data-name 等属性）
export function Card({ children, style = {}, ...rest }) {
  return (
    <div {...rest} style={{ background: '#FFFFFF', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', padding: 16, ...style }}>
      {children}
    </div>
  );
}
