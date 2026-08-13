import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from './src/api/auth';
import { toast } from './src/ui/toast';

// 设置页：静态导航壳（数据驱动重构，原 1317 行重复 JSX → 数据渲染）
// 视觉保持设计稿：375px 容器 / 白卡圆角 16px / 图标沿用 asset/icons svg
const ICON = {
  signal: './asset/icons/svg_dafe2afa.svg',
  wifi: './asset/icons/svg_7d24f493.svg',
  battery: './asset/icons/svg_c23974ea.svg',
  back: './asset/icons/svg_e5121903.svg',
  chevron: './asset/icons/svg_4380ec87.svg',
  avatar: './asset/images/3e1a5d7c9145e2459e60d4c1ab3aa43e.jpg',
  // 设置项图标
  target: './asset/icons/svg_f5de3366.svg',
  diet: './asset/icons/svg_46491fc1.svg',
  unit: './asset/icons/svg_cc4f6b56.svg',
  precision: './asset/icons/svg_e2d16172.svg',
  auto: './asset/icons/svg_733a8d31.svg',
  burst: './asset/icons/svg_09b7eb08.svg',
  checkin: './asset/icons/svg_d3b95eb4.svg',
  over: './asset/icons/svg_fe8730e3.svg',
  privacy: './asset/icons/svg_93cbd066.svg',
  help: './asset/icons/svg_72249477.svg',
  about: './asset/icons/svg_9ab0e5a7.svg',
  switchOn: './asset/icons/svg_a43e76cd.svg',
  switchOff: './asset/icons/svg_3418de29.svg'
};

const STATUS_BAR = [
  { icon: ICON.signal, name: 'icon-signal' },
  { icon: ICON.wifi, name: 'icon-wifi' },
  { icon: ICON.battery, name: 'icon-battery' }
];

// 分组与设置项（value 为右侧文案；switch 为演示开关；to 为跳转目标）
const GROUPS = [
  {
    title: '目标与偏好',
    rows: [
      { key: 'target', icon: ICON.target, label: '每日目标热量', value: '2000 kcal', to: '/goal' },
      { key: 'diet', icon: ICON.diet, label: '饮食偏好', to: '/dietpref' },
      { key: 'unit', icon: ICON.unit, label: '单位设置', value: '千卡(kcal)', to: '/unit' }
    ]
  },
  {
    title: '识别设置',
    rows: [
      { key: 'precision', icon: ICON.precision, label: '拍照识别精度', value: '标准', to: '/precision' },
      { key: 'auto', icon: ICON.auto, label: '自动识别', switch: ICON.switchOn },
      { key: 'burst', icon: ICON.burst, label: '连拍模式', switch: ICON.switchOff }
    ]
  },
  {
    title: '通知',
    rows: [
      { key: 'checkin', icon: ICON.checkin, label: '每日打卡提醒', switch: ICON.switchOn },
      { key: 'over', icon: ICON.over, label: '摄入超标提醒', switch: ICON.switchOn }
    ]
  },
  {
    title: '通用',
    rows: [
      { key: 'privacy', icon: ICON.privacy, label: '隐私设置', to: '/privacy' },
      { key: 'help', icon: ICON.help, label: '帮助反馈', to: '/help' },
      { key: 'about', icon: ICON.about, label: '关于食刻', to: '/about' }
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
      {/* 状态栏（设计稿固定样式） */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px 8px' }}>
        <span style={{ color: '#1A1A1A', fontSize: 15, fontWeight: 600 }}>9:41</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUS_BAR.map((s) => (
            <img key={s.name} src={s.icon} style={{ width: 14, height: 14 }} alt="" />
          ))}
        </div>
      </div>

      {/* 顶部导航 */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
        <img src={ICON.back} style={{ width: 22, height: 22, cursor: 'pointer' }} alt="返回" onClick={() => navigate(-1)} />
        <p style={{ flex: 1, textAlign: 'center', color: '#1A1A1A', fontSize: 18, fontWeight: 700, margin: 0 }}>设置</p>
        <div style={{ width: 22, height: 22 }} />
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '12px 20px' }}>
        {/* 账户卡 → 个人主页 */}
        <div data-name="account-card" onClick={() => navigate('/profile')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#FFFFFF', borderRadius: 20, boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, overflow: 'hidden' }}>
              <img src={ICON.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="头像" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ color: '#1A1A1A', fontSize: 17, fontWeight: 700 }}>健康生活家</span>
              <span style={{ color: '#9CA3AF', fontSize: 13 }}>查看个人主页</span>
            </div>
          </div>
          <img src={ICON.chevron} style={{ width: 16, height: 16 }} alt="" />
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
            <span style={{ color: '#9CA3AF', fontSize: 12 }}>128 条记录</span>
            <img src={ICON.chevron} style={{ width: 14, height: 14 }} alt="" />
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
                      <img src={r.icon} style={{ width: 18, height: 18 }} alt="" />
                      <span style={labelStyle}>{r.label}</span>
                    </div>
                    {r.switch ? (
                      <img src={r.switch} style={{ width: 28, height: 16 }} alt="" />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {r.value && <span style={valueStyle}>{r.value}</span>}
                        <img src={ICON.chevron} style={{ width: 14, height: 14 }} alt="" />
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
