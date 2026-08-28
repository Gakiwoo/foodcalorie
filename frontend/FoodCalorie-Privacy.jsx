import React, { useState } from 'react';
import { toast } from './src/ui/toast';
import { NavBar, StatusBar, ToggleSwitch } from './src/ui/common';
import { PageContainer } from './src/ui/components';
import { colors, radius, shadow, fontSize, fontWeight } from './src/ui/theme';

const SETTINGS = [
  { key: 'analytics', icon: 'fa-chart-line', bg: '#E8F5EC', color: '#22A85A', title: '数据分析授权', desc: '允许我们分析食物数据以改善推荐', on: true },
  { key: 'rec', icon: 'fa-wand-magic-sparkles', bg: '#FFF4E5', color: '#FA8C16', title: '个性化推荐', desc: '根据饮食习惯推送相关内容', on: true },
  { key: 'share', icon: 'fa-user-shield', bg: '#E6F4FF', color: '#1677FF', title: '数据脱敏共享', desc: '匿名共享健康趋势以协助研究', on: false },
  { key: 'oauth', icon: 'fa-right-to-bracket', bg: '#F3E8FF', color: '#7C3AED', title: '第三方登录', desc: '微信/Apple ID 快速登录', on: true },
  { key: 'sync', icon: 'fa-cloud-arrow-up', bg: '#E8F5EC', color: '#22A85A', title: '同步到云端', desc: '多设备同步健康记录', on: true }
];

const SECURITY_ROWS = [
  { key: 'pwd', icon: 'fa-key', text: '修改密码', color: '#1A1A1A', action: () => toast('修改密码开发中') },
  { key: 'account', icon: 'fa-user-xmark', text: '注销账号', color: '#FF6B6B', action: () => toast('注销账号需二次确认（演示）') }
];

const rowStyle = { width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' };
const dividerStyle = { width: 'calc(100% - 32px)', height: 1, background: colors.segBg, marginLeft: 16 };

export default function FoodCaloriePrivacy() {
  const [toggles, setToggles] = useState(() => Object.fromEntries(SETTINGS.map((s) => [s.key, s.on])));

  function toggle(key) {
    setToggles((t) => ({ ...t, [key]: !t[key] }));
  }

  return (
    <PageContainer data-name="FoodCalorie-Privacy">
      <StatusBar />
      <NavBar title="隐私设置" />

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 20px 8px' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', background: colors.surface, borderRadius: radius.xl, boxShadow: shadow.lg }}>
          {SETTINGS.map((s, i) => (
            <React.Fragment key={s.key}>
              <div style={rowStyle} onClick={() => toggle(s.key)}>
                <div style={{ width: 36, height: 36, display: 'flex', justifyContent: 'center', alignItems: 'center', background: s.bg, borderRadius: radius.md, flexShrink: 0 }}>
                  <i className={'fas ' + s.icon} style={{ color: s.color, fontSize: 15 }} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.semibold }}>{s.title}</span>
                  <span style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>{s.desc}</span>
                </div>
                <ToggleSwitch checked={toggles[s.key]} label={s.title} />
              </div>
              {i < SETTINGS.length - 1 && <div style={dividerStyle} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', background: colors.surface, borderRadius: radius.xl, boxShadow: shadow.lg }}>
          {SECURITY_ROWS.map((r, i) => (
            <React.Fragment key={r.key}>
              <div style={rowStyle} onClick={r.action}>
                <i className={'fas ' + r.icon} style={{ width: 16, color: r.color, fontSize: fontSize.md, textAlign: 'center' }} aria-hidden="true" />
                <span style={{ flex: 1, color: r.color, fontSize: fontSize.lg, fontWeight: fontWeight.medium }}>{r.text}</span>
                <i className="fas fa-chevron-right" style={{ color: '#C0C4CC', fontSize: 12 }} aria-hidden="true" />
              </div>
              {i < SECURITY_ROWS.length - 1 && <div style={dividerStyle} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '16px 20px 20px' }}>
        <span style={{ color: colors.textTertiary, fontSize: fontSize.xs, textAlign: 'center' }}>隐私政策最后更新：2026 年 7 月 1 日</span>
      </div>
    </PageContainer>
  );
}
