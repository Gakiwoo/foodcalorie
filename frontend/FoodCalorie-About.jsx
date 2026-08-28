import React, { useState, useEffect } from 'react';
import { toast } from './src/ui/toast';
import { http } from './src/api/client';
import { NavBar, StatusBar } from './src/ui/common';
import { APP_VERSION, APP_BUILD } from './src/version';
import designLogoSymbol from './assets/brand/design-logo-symbol.svg';
import { PageContainer } from './src/ui/components';
import { colors, radius, shadow, fontSize, fontWeight } from './src/ui/theme';

const STATS = [
  { key: 'records', label: '已记录餐', color: '#34C759' },
  { key: 'streak', label: '坚持天数', color: '#1677FF' },
  { key: 'favorites', label: '收藏项', color: '#FA8C16' }
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

const cardStyle = { width: '100%', background: colors.surface, borderRadius: radius.xl, boxShadow: shadow.lg };
const dividerStyle = { width: 'calc(100% - 32px)', height: 1, background: colors.segBg, marginLeft: 16 };

export default function FoodCalorieAbout() {
  const [counts, setCounts] = useState({ records: 0, streak: 0, favorites: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [r, s, f] = await Promise.all([
          http.get('/api/v1/foodcalorie/records', { page: 1, pageSize: 1 }),
          http.get('/api/v1/foodcalorie/records/stats', { range: 'month' }),
          http.get('/api/v1/foodcalorie/favorites')
        ]);
        setCounts({
          records: r.data?.total ?? 0,
          streak: s.data?.reachedDays ?? 0,
          favorites: Array.isArray(f.data) ? f.data.length : 0
        });
      } catch { }
    })();
  }, []);

  return (
    <PageContainer data-name="FoodCalorie-About">
      <StatusBar />
      <NavBar title="关于我们" />

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 20px 8px' }}>
        <div style={{ ...cardStyle, borderRadius: radius.xxl, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '24px 20px' }}>
          <div style={{ width: 80, height: 80, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #34C759 0%, #22A85A 100%)', borderRadius: 40 }}>
            <img src={designLogoSymbol} width="36" height="36" alt="" aria-hidden="true" />
          </div>
          <span style={{ color: colors.textPrimary, fontSize: 24, fontWeight: fontWeight.bold }}>食刻</span>
          <span style={{ color: colors.textTertiary, fontSize: fontSize.sm }}>Version {APP_VERSION} · Build {APP_BUILD}</span>
        </div>

        <div style={{ ...cardStyle, padding: '14px 16px' }}>
          <p style={{ margin: 0, color: '#3A3A3A', fontSize: fontSize.lg, lineHeight: '24px' }}>
            食刻是一款专注健康饮食记录与营养管理的 App，让你轻松掌握每一餐的热量、蛋白质和营养比例。我们相信，健康来自对每一口食物的了解。
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', gap: 10 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '14px 0', ...cardStyle }}>
              <span style={{ color: s.color, fontSize: 20, fontWeight: fontWeight.bold }}>{counts[s.key]}</span>
              <span style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px' }}>
          <span style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>核心功能</span>
          {FEATURES.map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-circle-check" style={{ color: colors.primary, fontSize: 13 }} aria-hidden="true" />
              <span style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.medium }}>{f}</span>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
          {LINKS.map((l, i) => (
            <React.Fragment key={l.key}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', cursor: 'pointer' }} onClick={l.action}>
                <span style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.medium }}>{l.text}</span>
                <i className="fas fa-chevron-right" style={{ color: '#C0C4CC', fontSize: 12 }} aria-hidden="true" />
              </div>
              {i < LINKS.length - 1 && <div style={dividerStyle} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ width: '100%', height: 44, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, background: colors.bg, borderRadius: 14, cursor: 'pointer' }} onClick={() => toast(`已是最新版本 v${APP_VERSION}`)}>
          <i className="fas fa-arrows-rotate" style={{ color: colors.primaryDark, fontSize: 13 }} aria-hidden="true" />
          <span style={{ color: colors.primaryDark, fontSize: fontSize.lg, fontWeight: fontWeight.semibold }}>检查更新</span>
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 20px 20px' }}>
        <span style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>© 2026 食刻 Studio</span>
        <span style={{ color: '#C0C4CC', fontSize: 10 }}>粤ICP备2025362354号</span>
      </div>
    </PageContainer>
  );
}
