// 共享 UI 组件：原生系统栏 / 顶部导航 / 底部导航 / 进度环 / 分段控件
// 视觉规范：页面背景 #F7F8FA、主题绿 #34C759、卡片白色圆角 16px
import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar as NativeStatusBar, Style } from '@capacitor/status-bar';
import { useNavigate } from 'react-router-dom';

const SYSTEM_BAR_APPEARANCE = {
  light: { style: Style.Light, backgroundColor: '#F7F8FA' },
  dark: { style: Style.Dark, backgroundColor: '#0F0F0F' }
};

// 将后端返回的今日统计归一化为安全渲染模型
export function normalizeDailyStats(value) {
  if (!value || typeof value !== 'object') return null;
  const number = (candidate, fallback = 0) =>
    Number.isFinite(Number(candidate)) ? Number(candidate) : fallback;
  return {
    total: number(value.total),
    target: number(value.target, 1400),
    percent: number(value.percent),
    average: number(value.average), // 日均（后端按范围口径计算），透传避免前端 fallback 失真
    reachedDays: number(value.reachedDays),
    totalDays: number(value.totalDays, 1)
  };
}

// Web 端状态栏：按设计稿渲染 9:41 + signal/wifi/battery 图标，
// 确保 H5/浏览器预览与设计稿一致；原生平台仍只配置系统栏。
export function StatusBar({ appearance = 'light' }) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const options = SYSTEM_BAR_APPEARANCE[appearance] || SYSTEM_BAR_APPEARANCE.light;
    void Promise.allSettled([
      NativeStatusBar.show(),
      NativeStatusBar.setOverlaysWebView({ overlay: false }),
      NativeStatusBar.setStyle({ style: options.style }),
      NativeStatusBar.setBackgroundColor({ color: options.backgroundColor })
    ]);
  }, [appearance]);

  if (Capacitor.isNativePlatform()) return null;

  const isDark = appearance === 'dark';
  const color = isDark ? '#FFFFFF' : '#1A1A1A';
  const bg = isDark ? '#0F0F0F' : '#F7F8FA';
  return (
    <div
      data-name="status-bar"
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px 8px',
        background: bg,
        flexShrink: 0
      }}>
      <span data-name="status-time" style={{ color, fontSize: 15, fontWeight: 600, lineHeight: '20px' }}>9:41</span>
      <div data-name="status-icons" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
        <i data-name="icon-signal" className="fas fa-signal" style={{ fontSize: 14, color }} />
        <i data-name="icon-wifi" className="fas fa-wifi" style={{ fontSize: 14, color }} />
        <i data-name="icon-battery" className="fas fa-battery-full" style={{ fontSize: 14, color }} />
      </div>
    </div>
  );
}

export function NavBar({ title, right, onBack, appearance = 'light', showBack = true }) {
  const navigate = useNavigate();
  const isDark = appearance === 'dark';
  const color = isDark ? '#FFFFFF' : '#1A1A1A';
  return (
    <div data-name="top-nav" style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
      {showBack ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="返回"
          style={{ width: 32, display: 'flex', alignItems: 'center', cursor: 'pointer', outline: 'none' }}
          onClick={() => (onBack ? onBack() : navigate(-1))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onBack ? onBack() : navigate(-1);
            }
          }}>
          <i data-name="nav-back" className="fas fa-chevron-left" style={{ fontSize: 22, color }} />
        </div>
      ) : (
        <div data-name="nav-spacer" style={{ width: 32 }} />
      )}
      <p data-name="nav-title" style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 700, color, lineHeight: '24px', margin: 0 }}>{title}</p>
      <div style={{ width: 32, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>{right}</div>
    </div>
  );
}

export function ToggleSwitch({ checked, label, onChange }) {
  const toggle = () => onChange && onChange(!checked);
  return (
    <span
      role="switch"
      aria-checked={checked}
      aria-label={label}
      tabIndex={onChange ? 0 : undefined}
      onClick={toggle}
      onKeyDown={(e) => {
        // 键盘可达：Enter / 空格 触发切换（a11y）
        if (onChange && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          toggle();
        }
      }}
      style={{
        width: 42,
        height: 24,
        padding: 2,
        borderRadius: 12,
        background: checked ? '#34C759' : '#D1D5DB',
        display: 'flex',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        alignItems: 'center',
        flexShrink: 0,
        cursor: onChange ? 'pointer' : 'default',
        outline: 'none',
        transition: 'background .2s ease'
      }}>
      <span style={{ width: 20, height: 20, borderRadius: 10, background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,.18)' }} />
    </span>
  );
}

// 设计稿 Tab 顺序：首页 / 记录 / 发现 / 我的
const NAV_ITEMS = [
  { key: '/', icon: 'fa-house', label: '首页' },
  { key: '/records', icon: 'fa-clipboard-list', label: '记录' },
  { key: '/discover', icon: 'fa-compass', label: '发现' },
  { key: '/me', icon: 'fa-user', label: '我的' }
];

export function BottomNav({ active }) {
  const navigate = useNavigate();
  return (
    <div
      data-name="bottom-nav"
      style={{
        marginTop: 'auto',
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 8,
        background: '#FFFFFF',
        borderTop: '1px solid #EEF0F2',
        padding: '10px 20px'
      }}>
      {NAV_ITEMS.map((n) => {
        const on = n.key === active;
        return (
          <div
            key={n.key}
            data-name={'nav-' + n.label}
            role="button"
            tabIndex={0}
            aria-label={n.label}
            aria-current={on ? 'page' : undefined}
            onClick={() => navigate(n.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(n.key);
              }
            }}
            style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', outline: 'none' }}>
            <i className={'fas ' + n.icon} style={{ fontSize: 22, color: on ? '#34C759' : '#9CA3AF' }} />
            <span style={{ fontSize: 11, fontWeight: on ? 600 : 500, color: on ? '#34C759' : '#9CA3AF', lineHeight: '14px', textAlign: 'center' }}>{n.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// SVG 渐变进度环（百分比 0-100）
export function Ring({ percent, size = 120, stroke = 11, label, sub, labelSize = 22, labelWeight = 800 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(100, Math.max(0, percent)) / 100);
  const innerSize = size - stroke * 2 - 4;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34C759" />
            <stop offset="100%" stopColor="#22A85A" />
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
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2, background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: labelSize, fontWeight: labelWeight, color: '#1A1A1A', lineHeight: 1 }}>{label}</span>
          {sub && <span style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{sub}</span>}
        </div>
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

// 餐次选择 pills（AddFood / Search 收敛共用）
export function MealPills({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
      {options.map((m) => {
        const val = typeof m === 'string' ? m : m.value;
        const label = typeof m === 'string' ? m : m.label;
        const active = value === val;
        return (
          <div
            key={val}
            onClick={() => onChange(val)}
            style={{
              height: 30,
              borderRadius: 15,
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: active ? '#34C759' : '#FFFFFF',
              color: active ? '#FFFFFF' : '#1A1A1A',
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              boxShadow: active ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
