import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { logout, fetchMe } from './src/api/auth';
import { toast } from './src/ui/toast';
import { NavBar, StatusBar } from './src/ui/common';
import { useUnits } from './src/ui/units';

// 设置页：统一使用可离线打包的 Font Awesome 图标，不再依赖设计稿导出的散列资源名。

// 分组与设置项（to 为跳转目标；valueKey+valueMap 为 profile 动态值；value 为静态文案）
// 说明：所有行均为可跳转的真实设置入口（原演示开关已下线，避免"假设置"误导）
const GROUPS = [
  {
    title: '目标与偏好',
    rows: [
      { key: 'target', icon: 'fa-bullseye', label: '每日目标热量', to: '/goal' },
      { key: 'diet', icon: 'fa-leaf', label: '饮食偏好', to: '/dietpref' },
      { key: 'unit', icon: 'fa-scale-balanced', label: '单位设置', valueKey: 'unit_calorie', valueMap: { kcal: '千卡(kcal)', kJ: '千焦(kJ)' }, to: '/unit' }
    ]
  },
  {
    title: '识别设置',
    rows: [
      { key: 'precision', icon: 'fa-wand-magic-sparkles', label: '拍照识别精度', valueKey: 'precision_mode', valueMap: { fast: '快速', standard: '标准', precise: '精准' }, to: '/precision' },
      { key: 'burst', icon: 'fa-camera', label: '连拍模式', valueKey: 'burst_enabled', valueMap: { 1: '已开启', 0: '已关闭' }, to: '/burst' }
    ]
  },
  {
    title: '通知',
    rows: [
      { key: 'checkin', icon: 'fa-bell', label: '每日打卡提醒', valueKey: 'notif_record', valueMap: { 1: '开', 0: '关' }, to: '/notification' },
      { key: 'over', icon: 'fa-triangle-exclamation', label: '摄入超标提醒', valueKey: 'notif_goal', valueMap: { 1: '开', 0: '关' }, to: '/notification' }
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
  const { unitCalorie, kcal } = useUnits();
  // F1：真实数据（目标热量 + 记录总数 + 昵称 + profile 动态值），加载失败时回退占位
  const [profile, setProfile] = useState(null);
  const [nickname, setNickname] = useState('');
  const [targetCal, setTargetCal] = useState(null);
  const [recordCount, setRecordCount] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await http.get('/api/v1/foodcalorie/profile');
        setProfile(p.data ?? null);
        setTargetCal(p.data?.target_calories ?? null);
      } catch { /* 未登录忽略 */ }
      try {
        const me = await fetchMe();
        setNickname(me?.nickname || '');
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
              <span style={{ color: '#1A1A1A', fontSize: 17, fontWeight: 700 }}>{nickname || '食刻用户'}</span>
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
              {g.rows.map((r, i) => {
                // 动态值：valueKey 命中 profile 时用 valueMap 映射；否则用静态 value
                const dynamicValue =
                  r.valueKey && profile != null && profile[r.valueKey] != null
                    ? r.valueMap[profile[r.valueKey]] ?? null
                    : null;
                const rowValue = dynamicValue ?? r.value ?? null;
                return (
                  <React.Fragment key={r.key}>
                    <div style={rowStyle} onClick={() => navigate(r.to)}>
                      <div style={leftStyle}>
                        <i className={'fas ' + r.icon} style={{ width: 18, color: '#22A85A', fontSize: 16, textAlign: 'center' }} aria-hidden="true" />
                        <span style={labelStyle}>{r.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {rowValue && <span style={valueStyle}>{rowValue}</span>}
                        {r.key === 'target' && targetCal != null && <span style={valueStyle}>{kcal(targetCal)} {unitCalorie}</span>}
                        {r.key === 'target' && targetCal == null && <span style={valueStyle}>--</span>}
                        <i className="fas fa-chevron-right" style={{ color: '#C0C4CC', fontSize: 12 }} aria-hidden="true" />
                      </div>
                    </div>
                    {i < g.rows.length - 1 && <div style={dividerStyle} />}
                  </React.Fragment>
                );
              })}
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
