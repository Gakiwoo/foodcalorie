import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, todayStr } from './src/ui/toast';
import { StatusBar, BottomNav } from './src/ui/common';
import { ProtectedImage } from './src/ui/ProtectedImage';
import { useUnits } from './src/ui/units';
import { Loading, ErrorRetry, EmptyState } from './src/ui/PageState';
import { PageContainer, SectionHeader, ListItem, WhiteButton } from './src/ui/components';
import { colors, spacing, radius, shadow, fontSize, fontWeight, cameraGradient } from './src/ui/theme';

export default function FoodCalorieHome() {
  const navigate = useNavigate();
  const { unitCalorie, unitWeight, kcal, g } = useUnits();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await http.get('/api/v1/foodcalorie/records', { date: todayStr(), pageSize: 3 });
      setList(r.data.list || []);
    } catch (e) {
      setError(e.message || '加载失败');
      toast(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return (
    <PageContainer data-name="FoodCalorie-Home">
      <StatusBar />

      {/* 顶部导航：左"今日" / 中"食刻" / 右设置图标 */}
      <div data-name="top-nav" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: '10px 20px' }}>
        <span data-name="nav-date" style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.semibold, lineHeight: '22px' }}>今日</span>
        <p data-name="nav-title" style={{ flex: 1, color: colors.textPrimary, fontSize: fontSize.hero, fontWeight: fontWeight.bold, lineHeight: '24px', textAlign: 'center', margin: 0 }}>食刻</p>
        <div data-name="nav-settings-wrap" onClick={() => navigate('/settings')} style={{ padding: 8, margin: -8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i data-name="nav-settings" className="fas fa-gear" style={{ fontSize: 20, color: colors.textPrimary }} />
        </div>
      </div>

      {/* 拍照识别大卡 */}
      <div data-name="camera-section" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column', padding: '12px 20px' }}>
        <div
          data-name="camera-card"
          onClick={() => navigate('/camera')}
          style={{
            width: '100%', display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-start', alignItems: 'center', gap: 18,
            padding: spacing.xxxl, background: cameraGradient,
            borderRadius: radius.xxl, boxShadow: shadow.primary, cursor: 'pointer'
          }}>
          <div data-name="camera-icon-wrap" style={{ width: 76, height: 76, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.22)', borderRadius: 76 }}>
            <i data-name="camera-icon" className="fas fa-camera" style={{ fontSize: 34, color: colors.textInverse }} />
          </div>
          <div data-name="camera-text" style={{ display: 'flex', alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column', gap: 6 }}>
            <p data-name="camera-title" style={{ alignSelf: 'stretch', flexShrink: 0, color: colors.textInverse, fontSize: fontSize.display, fontWeight: fontWeight.bold, lineHeight: '26px', textAlign: 'center', margin: 0 }}>拍照识别食物</p>
            <p data-name="camera-sub" style={{ alignSelf: 'stretch', flexShrink: 0, color: 'rgba(255,255,255,0.92)', fontSize: fontSize.lg, lineHeight: '20px', textAlign: 'center', margin: 0 }}>一键识别热量与营养</p>
          </div>
          <WhiteButton fullWidth size="lg" onClick={() => navigate('/camera')}>
            <i data-name="cta-icon" className="fas fa-camera" style={{ fontSize: 18, color: colors.primary }} />
            <span data-name="cta-text">拍照识别</span>
          </WhiteButton>
        </div>
      </div>

      {/* 今日记录 */}
      <div data-name="history-section" style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: spacing.section, padding: '12px 20px', overflow: 'hidden' }}>
        <SectionHeader
          title="今日记录"
          action={
            <span data-name="history-more" style={{ color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.medium, lineHeight: '18px', cursor: 'pointer' }} onClick={() => navigate('/today')}>查看全部</span>
          }
        />

        {loading ? (
          <Loading text="加载中…" padding={40} />
        ) : error ? (
          <ErrorRetry error={error} onRetry={loadRecords} padding={32} />
        ) : list.length === 0 ? (
          <EmptyState icon="fa-utensils" text="今天还没有记录" actionText="+ 添加记录" onAction={() => navigate('/addfood')} />
        ) : (
          <div data-name="history-list" style={{ display: 'flex', flexDirection: 'column', gap: spacing.section }}>
            {list.map((r) => (
              <ListItem
                key={r.id}
                data-name={'food-card-' + r.id}
                onClick={() => navigate('/detail?id=' + r.id)}
                icon={
                  r.image_url ? (
                    <ProtectedImage data-name={'food-img-' + r.id} src={r.image_url} alt="" style={{ width: 56, height: 56, objectFit: 'cover' }} />
                  ) : (
                    <i className="fas fa-utensils" style={{ fontSize: 20, color: colors.textDisabled }} />
                  )
                }
                title={r.food_name}
                subtitle={`${r.record_time ? r.record_time.slice(11, 16) : '--:--'} · ${r.meal_type}`}
                right={
                  <>
                    <span data-name={'food-cal-value-' + r.id} style={{ color: colors.primary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold, lineHeight: '22px', textAlign: 'right' }}>{kcal(r.calories)} {unitCalorie}</span>
                    <span data-name={'food-cal-proto-' + r.id} style={{ color: colors.textTertiary, fontSize: fontSize.xs, lineHeight: '15px', textAlign: 'right' }}>蛋白 {g(r.protein_g)} {unitWeight}</span>
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav active="/" />
    </PageContainer>
  );
}
