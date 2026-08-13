import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from './src/ui/toast';

// 隐私设置页：静态内容（数据驱动重构，原 925 行重复 JSX → 数据渲染）
// 视觉保持设计稿：开关（绿 #34C759 = 开 / 灰 #F7F8FA = 关）、图标沿用 asset/icons svg
const ICON = {
  signal: './asset/icons/svg_dafe2afa.svg',
  wifi: './asset/icons/svg_7d24f493.svg',
  battery: './asset/icons/svg_c23974ea.svg',
  back: './asset/icons/svg_e5121903.svg',
  arrow: './asset/icons/svg_a35c487a.svg',
  pwd: './asset/icons/svg_da4e7fb1.svg',
  account: './asset/icons/svg_6713ea2c.svg'
};

const SETTINGS = [
  { key: 'analytics', icon: './asset/icons/svg_59ff4033.svg', bg: '#E8F5EC', title: '数据分析授权', desc: '允许我们分析食物数据以改善推荐', on: true },
  { key: 'rec', icon: './asset/icons/svg_2d5533d0.svg', bg: '#FFF4E5', title: '个性化推荐', desc: '根据饮食习惯推送相关内容', on: true },
  { key: 'share', icon: './asset/icons/svg_2a5919a7.svg', bg: '#E6F4FF', title: '数据脱敏共享', desc: '匿名共享健康趋势以协助研究', on: false },
  { key: 'oauth', icon: './asset/icons/svg_20293da7.svg', bg: '#F3E8FF', title: '第三方登录', desc: '微信/Apple ID 快速登录', on: true },
  { key: 'sync', icon: './asset/icons/svg_e325be46.svg', bg: '#E8F5EC', title: '同步到云端', desc: '多设备同步健康记录', on: true }
];

const SECURITY_ROWS = [
  { key: 'pwd', icon: ICON.pwd, text: '修改密码', color: '#1A1A1A', action: () => toast('修改密码开发中') },
  { key: 'account', icon: ICON.account, text: '注销账号', color: '#FF6B6B', action: () => toast('注销账号需二次确认（演示）') }
];

const rowStyle = { width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' };
const dividerStyle = { width: 'calc(100% - 32px)', height: 1, background: '#EEF0F2', marginLeft: 16 };

export default function FoodCaloriePrivacy() {
  const navigate = useNavigate();
  // 开关为演示交互（本地 state，不接后端）
  const [toggles, setToggles] = useState(() => Object.fromEntries(SETTINGS.map((s) => [s.key, s.on])));

  function toggle(key) {
    setToggles((t) => ({ ...t, [key]: !t[key] }));
  }

  return (
    <div data-name="FoodCalorie-Privacy" style={{ width: '100%', minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F7F8FA' }}>
      {/* 状态栏（设计稿固定样式） */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px 8px' }}>
        <span style={{ color: '#1A1A1A', fontSize: 15, fontWeight: 600 }}>9:41</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[ICON.signal, ICON.wifi, ICON.battery].map((s, i) => (
            <img key={i} src={s} style={{ width: 14, height: 14 }} alt="" />
          ))}
        </div>
      </div>

      {/* 顶部导航 */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
        <img src={ICON.back} style={{ width: 22, height: 22, cursor: 'pointer' }} alt="返回" onClick={() => navigate(-1)} />
        <p style={{ flex: 1, textAlign: 'center', color: '#1A1A1A', fontSize: 18, fontWeight: 700, margin: 0 }}>隐私设置</p>
        <div style={{ width: 22, height: 22 }} />
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 20px 8px' }}>
        {/* 数据授权设置（开关） */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 16, boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)' }}>
          {SETTINGS.map((s, i) => (
            <React.Fragment key={s.key}>
              <div style={rowStyle} onClick={() => toggle(s.key)}>
                <div style={{ width: 36, height: 36, display: 'flex', justifyContent: 'center', alignItems: 'center', background: s.bg, borderRadius: 10, flexShrink: 0 }}>
                  <img src={s.icon} style={{ width: 16, height: 16 }} alt="" />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: '#1A1A1A', fontSize: 14, fontWeight: 600 }}>{s.title}</span>
                  <span style={{ color: '#9CA3AF', fontSize: 11 }}>{s.desc}</span>
                </div>
                <div style={{ width: 40, height: 24, display: 'flex', justifyContent: toggles[s.key] ? 'flex-end' : 'flex-start', alignItems: 'center', padding: 2, background: toggles[s.key] ? '#34C759' : '#F7F8FA', borderRadius: 12, flexShrink: 0 }}>
                  <div style={{ width: 20, height: 20, background: '#FFFFFF', borderRadius: 10 }} />
                </div>
              </div>
              {i < SETTINGS.length - 1 && <div style={dividerStyle} />}
            </React.Fragment>
          ))}
        </div>

        {/* 安全中心 */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 16, boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)' }}>
          {SECURITY_ROWS.map((r, i) => (
            <React.Fragment key={r.key}>
              <div style={rowStyle} onClick={r.action}>
                <img src={r.icon} style={{ width: 16, height: 16 }} alt="" />
                <span style={{ flex: 1, color: r.color, fontSize: 14, fontWeight: 500 }}>{r.text}</span>
                <img src={ICON.arrow} style={{ width: 12, height: 12 }} alt="" />
              </div>
              {i < SECURITY_ROWS.length - 1 && <div style={dividerStyle} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 底部注记 */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '16px 20px 20px' }}>
        <span style={{ color: '#9CA3AF', fontSize: 11, textAlign: 'center' }}>隐私政策最后更新：2026 年 7 月 1 日</span>
      </div>
    </div>
  );
}
