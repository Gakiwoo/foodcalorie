import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, StatusBar } from './src/ui/common';
import { PageContainer } from './src/ui/components';
import { colors, radius, shadow, fontSize, fontWeight } from './src/ui/theme';

export default function FoodCalorieNotFound() {
  const navigate = useNavigate();

  return (
    <PageContainer data-name="FoodCalorie-NotFound">
      <StatusBar />
      <NavBar title="页面未找到" />

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '60px 20px 20px', minHeight: '60vh' }}>
        <div style={{ width: 96, height: 96, borderRadius: 48, background: colors.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-question" style={{ fontSize: 40, color: colors.primary }} aria-hidden="true" />
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 48, fontWeight: fontWeight.extrabold, color: colors.textPrimary, lineHeight: 1 }}>404</span>
          <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>页面未找到</span>
          <span style={{ fontSize: fontSize.md, color: colors.textTertiary, maxWidth: 240, lineHeight: '20px' }}>你访问的页面不存在或已被移除</span>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: 8,
            padding: '12px 32px',
            borderRadius: radius.pill,
            border: 'none',
            background: colors.primary,
            color: colors.textInverse,
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            boxShadow: shadow.primary,
            cursor: 'pointer'
          }}>
          返回首页
        </button>
      </div>
    </PageContainer>
  );
}
