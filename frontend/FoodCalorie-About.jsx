import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from './src/ui/toast';

// 关于我们页：静态内容（数据驱动重构，原 749 行重复 JSX → 数据渲染）
// 视觉保持设计稿：Logo 渐变圆 / 统计三卡 / 功能列表 / 链接行 / 页脚
const ICON = {
  signal: './asset/icons/svg_dafe2afa.svg',
  wifi: './asset/icons/svg_7d24f493.svg',
  battery: './asset/icons/svg_c23974ea.svg',
  back: './asset/icons/svg_e5121903.svg',
  logo: './asset/icons/svg_acabd864.svg',
  feat: './asset/icons/svg_42ba747e.svg',
  arrow: './asset/icons/svg_a35c487a.svg',
  update: './asset/icons/svg_820a89e2.svg'
};

const STATS = [
  { val: '128', label: '已记录餐', color: '#34C759' },
  { val: '23', label: '坚持天数', color: '#1677FF' },
  { val: '18', label: '收藏项', color: '#FA8C16' }
];

const FEATURES = [
  'AI 智能识别 - 一拍即识千种食物',
  '数据统计 - 周月年趋势一目了然',
  '食物库 - 10 万 + 食物营养数据',
  '个性化推荐 - 智能匹配你的目标'
];

const LINKS = [
  { key: 'agreement', text: '用户协议', action: () => toast('用户协议（演示）') },
  { key: 'privacy', text: '隐私政策', action: () => toast('隐私政策（演示）') },
  { key: 'contact', text: '联系我们', action: () => toast('联系我们：hello@shike.app') }
];

const cardStyle = { width: '100%', background: '#FFFFFF', borderRadius: 16, boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)' };
const dividerStyle = { width: 'calc(100% - 32px)', height: 1, background: '#EEF0F2', marginLeft: 16 };

export default function FoodCalorieAbout() {
  const navigate = useNavigate();

  return (
    <div data-name="FoodCalorie-About" style={{ width: 375, minHeight: 812, display: 'flex', flexDirection: 'column', background: '#F7F8FA' }}>
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
        <p style={{ flex: 1, textAlign: 'center', color: '#1A1A1A', fontSize: 18, fontWeight: 700, margin: 0 }}>关于我们</p>
        <div style={{ width: 22, height: 22 }} />
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 20px 8px' }}>
        {/* Logo + 版本 */}
        <div style={{ ...cardStyle, borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '24px 20px' }}>
          <div style={{ width: 80, height: 80, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #34C759 0%, #22A85A 100%)', borderRadius: 40 }}>
            <img src={ICON.logo} style={{ width: 36, height: 36 }} alt="食刻" />
          </div>
          <span style={{ color: '#1A1A1A', fontSize: 24, fontWeight: 700 }}>食刻</span>
          <span style={{ color: '#9CA3AF', fontSize: 12 }}>Version 1.0.0 · Build 20260805</span>
        </div>

        {/* 简介 */}
        <div style={{ ...cardStyle, padding: '14px 16px' }}>
          <p style={{ margin: 0, color: '#3A3A3A', fontSize: 14, lineHeight: '24px' }}>
            食刻是一款专注健康饮食记录与营养管理的 App，让你轻松掌握每一餐的热量、蛋白质和营养比例。我们相信，健康来自对每一口食物的了解。
          </p>
        </div>

        {/* 统计三卡 */}
        <div style={{ width: '100%', display: 'flex', gap: 10 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '14px 0', ...cardStyle }}>
              <span style={{ color: s.color, fontSize: 20, fontWeight: 700 }}>{s.val}</span>
              <span style={{ color: '#9CA3AF', fontSize: 11 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* 核心功能 */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px' }}>
          <span style={{ color: '#1A1A1A', fontSize: 15, fontWeight: 700 }}>核心功能</span>
          {FEATURES.map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={ICON.feat} style={{ width: 14, height: 14 }} alt="" />
              <span style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* 链接 */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
          {LINKS.map((l, i) => (
            <React.Fragment key={l.key}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', cursor: 'pointer' }} onClick={l.action}>
                <span style={{ color: '#1A1A1A', fontSize: 14, fontWeight: 500 }}>{l.text}</span>
                <img src={ICON.arrow} style={{ width: 12, height: 12 }} alt="" />
              </div>
              {i < LINKS.length - 1 && <div style={dividerStyle} />}
            </React.Fragment>
          ))}
        </div>

        {/* 检查更新 */}
        <div style={{ width: '100%', height: 44, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, background: '#F7F8FA', borderRadius: 14, cursor: 'pointer' }} onClick={() => toast('已是最新版本 v1.0.0')}>
          <img src={ICON.update} style={{ width: 14, height: 14 }} alt="" />
          <span style={{ color: '#22A85A', fontSize: 14, fontWeight: 600 }}>检查更新</span>
        </div>
      </div>

      {/* 页脚 */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 20px 20px' }}>
        <span style={{ color: '#9CA3AF', fontSize: 11 }}>© 2026 食刻 Studio</span>
        <span style={{ color: '#C0C4CC', fontSize: 10 }}>粤ICP备2025362354号</span>
      </div>
    </div>
  );
}
