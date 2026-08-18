import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { logout } from './src/api/auth';
import { toast } from './src/ui/toast';
import { NavBar, StatusBar, ToggleSwitch } from './src/ui/common';

// 设置页：统一使用可离线打包的 Font Awesome 图标，不再依赖设计稿导出的散列资源名。

// 分组与设置项（value 为右侧文案；switch 为演示开关；to 为跳转目标）
// target 行 value 由真实 profile 数据动态填充（F1）
const GROUPS = [
  {
    title: '目标与偏好',
    rows: [
      { key: 'target', icon: 'fa-bullseye', label: '每日目标热量', to: '/goal' },
      { key: 'diet', icon: 'fa-leaf', label: '饮食偏好', to: '/dietpref' },
      { key: 'unit', icon: 'fa-scale-balanced', label: '单位设置', value: '千卡(kcal)', to: '/unit' }
    ]
  },
  {
    title: '识别设置',
    rows: [
      { key: 'precision', icon: 'fa-wand-magic-sparkles', label: '拍照识别精度', value: '标准', to: '/precision' },
      { key: 'auto', icon: 'fa-bolt', label: '自动识别', switch: true },
      { key: 'burst', icon: 'fa-camera', label: '连拍模式', switch: false }
    ]
  },
  {
    title: '通知',
    rows: [
      { key: 'checkin', icon: 'fa-bell', label: '每日打卡提醒', switch: true },
      { key: 'over', icon: 'fa-triangle-exclamation', label: '摄入超标提醒', switch: true }
    ]
  },
  {
    title: '通用',
    rows: [
      { key: 'privacy', icon: 'fa-shield-halved', label: '隐私设置', to: '/privacy' },
      { key: 'help', icon: 'fa-circle-question', label: '帮助反馈', to: '/help' },
      { key: 'about', icon: 'fa-circle-info', label: '关于食刻', to: '/about' }
    ]
  }
];

const rowStyle = { width: '100%', height: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', cursor: 'pointer' };
const leftStyle = { display: 'flex', alignItems: 'center', gap: 12 };
const labelStyle = { color: '#1A1A1A', fontSize: 15, fontWeight: 500 };
const valueStyle = { color: '#9CA3AF', fontSize: 14, textAlign: 'right' };
const dividerStyle = { width: 'calc(100% - 32px)', height: 1, background: '#EEF0F2', marginLeft: 16 };

export default function FoodCalorieSettings() {
  const navigate = useNavigate();
  // F1：真实数据（目标热量 + 记录总数），加载失败时回退占位
  const [targetCal, setTargetCal] = useState(null);
  const [recordCount, setRecordCount] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await http.get('/api/v1/foodcalorie/profile');
        setTargetCal(p.data?.target_calories ?? null);
      } catch { /* 未登录忽略 */ }
      try {
        const r = await http.get('/api/v1/foodcalorie/records', { page: 1, pageSize: 1 });
        setRecordCount(r.data?.total ?? null);
      } catch { /* 未登录忽略 */ }
    })();
  }, []);

  function handleLogout() {
    logout()
      .catch(() => {})
      .finally(() => {
        toast('已退出登录');
        navigate('/login');
      });
  }

  return (
    <div data-name="FoodCalorie-Settings" style={{ width: '100%', minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F7F8FA' }}>
      <StatusBar />
      <NavBar title="设置" />

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '12px 20px' }}>
        {/* 账户卡 → 个人主页 */}
        <div data-name="account-card" onClick={() => navigate('/profile')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#FFFFFF', borderRadius: 20, boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: 'linear-gradient(135deg,#34C759,#22A85A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-user" style={{ color: '#FFFFFF', fontSize: 24 }} aria-hidden="true" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ color: '#1A1A1A', fontSize: 17, fontWeight: 700 }}>健康生活家</span>
              <span style={{ color: '#9CA3AF', fontSize: 13 }}>查看个人主页</span>
            </div>
          </div>
          <i className="fas fa-chevron-right" style={{ color: '#C0C4CC', fontSize: 13 }} aria-hidden="true" />
        </div>

        {/* 我的记录 → 记录页（带来源标记） */}
        <div data-name="card-records" onClick={() => navigate('/records', { state: { from: 'settings' } })} style={{ width: '100%', height: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', background: '#FFFFFF', borderRadius: 16, boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 10, background: '#E8F5EC' }}>
              <i className="fas fa-clipboard-list" style={{ fontSize: 16, color: '#22A85A' }} />
            </div>
            <span style={{ color: '#1A1A1A', fontSize: 14, fontWeight: 600 }}>我的记录</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#9CA3AF', fontSize: 12 }}>{recordCount != null ? recordCount + ' 条记录' : '--'}</span>
            <i className="fas fa-chevron-right" style={{ color: '#C0C4CC', fontSize: 12 }} aria-hidden="true" />
          </div>
        </div>

        {/* 分组设置项 */}
        {GROUPS.map((g) => (
          <div key={g.title} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ padding: '0 4px' }}>
              <span style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 500 }}>{g.title}</span>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 16, boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              {g.rows.map((r, i) => (
                <React.Fragment key={r.key}>
                  <div style={rowStyle} onClick={r.to ? () => navigate(r.to) : () => toast('该功能开发中')}>
                    <div style={leftStyle}>
                      <i className={'fas ' + r.icon} style={{ width: 18, color: '#22A85A', fontSize: 16, textAlign: 'center' }} aria-hidden="true" />
                      <span style={labelStyle}>{r.label}</span>
                    </div>
                    {r.switch !== undefined ? (
                      <ToggleSwitch checked={r.switch} label={r.label} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {r.value && <span style={valueStyle}>{r.value}</span>}
                        {r.key === 'target' && targetCal != null && <span style={valueStyle}>{targetCal} kcal</span>}
                        {r.key === 'target' && targetCal == null && <span style={valueStyle}>--</span>}
                        <i className="fas fa-chevron-right" style={{ color: '#C0C4CC', fontSize: 12 }} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  {i < g.rows.length - 1 && <div style={dividerStyle} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}

        {/* 退出登录 */}
        <div data-name="logout-card" onClick={handleLogout} style={{ width: '100%', padding: '15px 0', textAlign: 'center', background: '#FFFFFF', borderRadius: 16, boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
          <span style={{ color: '#E03131', fontSize: 14, fontWeight: 700 }}>退出登录</span>
        </div>
      </div>
    </div>
  );
}
