import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { todayStr } from './src/ui/toast';
import { StatusBar, NavBar, Ring, Card, BottomNav, normalizeDailyStats } from './src/ui/common';
import { useUnits } from './src/ui/units';
import { Loading, ErrorRetry, EmptyState } from './src/ui/PageState';
import { PageContainer, ListItem } from './src/ui/components';
import { colors, spacing, radius, shadow, fontSize, fontWeight } from './src/ui/theme';

export default function FoodCalorieToday() {
  const navigate = useNavigate();
  const { unitCalorie, unitWeight, kcal, g } = useUnits();
  const [stats, setStats] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const today = todayStr();
      const [s, r] = await Promise.all([
        http.get('/api/v1/foodcalorie/records/stats', { range: 'day', date: today }),
        http.get('/api/v1/foodcalorie/records', { date: today })
      ]);
      setStats(normalizeDailyStats(s.data));
      setList(r.data.list);
    } catch (e) {
      setError(e.message || '加载失败，请检查登录状态');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const mealIcon = { 早餐: 'fa-mug-hot', 午餐: 'fa-bowl-food', 晚餐: 'fa-leaf', 加餐: 'fa-apple-whole' };
  const mealGradient = {
    早餐: 'linear-gradient(135deg,#D1C4E9 0%,#B39DDB 100%)',
    午餐: 'linear-gradient(135deg,#FFE0B2 0%,#FFCC80 100%)',
    晚餐: 'linear-gradient(135deg,#C8E6C9 0%,#A5D6A7 100%)',
    加餐: 'linear-gradient(135deg,#FFF9C4 0%,#FFF59D 100%)'
  };
  const mealOrder = ['早餐', '午餐', '晚餐', '加餐'];
  const today = todayStr();

  const macros = list.reduce((acc, r) => ({
    carbs: acc.carbs + (r.carbs_g || 0),
    protein: acc.protein + (r.protein_g || 0),
    fat: acc.fat + (r.fat_g || 0)
  }), { carbs: 0, protein: 0, fat: 0 });

  const groupedMeals = mealOrder.map((meal) => {
    const items = list.filter((r) => r.meal_type === meal);
    const calories = items.reduce((s, r) => s + (r.calories || 0), 0);
    return { meal, items, calories };
  }).filter((g) => g.items.length > 0);

  const heroPercent = stats && stats.target
    ? Math.min(100, Math.round((stats.total / stats.target) * 100))
    : 0;

  const s = stats || { total: 0, target: 1400, percent: 0 };

  return (
    <PageContainer data-name="FoodCalorie-Today">
      <StatusBar />
      <NavBar title="今日记录" right={<span style={{ fontSize: fontSize.lg, color: colors.textTertiary, fontWeight: fontWeight.medium }}>{today.slice(5)}</span>} />

      {loading ? (
        <Loading text="加载中…" padding={60} />
      ) : error ? (
        <ErrorRetry error={error} onRetry={load} padding={40} />
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '8px 20px' }}>
              <Card style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.xl, padding: spacing.xxl, borderRadius: radius.xxl, background: colors.surface, boxShadow: shadow.lg }}>
                <Ring size={112} stroke={12} percent={s.percent} label={kcal(s.total)} sub={`已摄入 ${unitCalorie}`} labelSize={22} labelWeight={800} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                  <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>目标 {kcal(s.target)} {unitCalorie}</div>
                  <div style={{ fontSize: fontSize.md, fontWeight: fontWeight.regular, color: colors.primary }}>还可摄入 {kcal(Math.max(0, s.target - s.total))} {unitCalorie}</div>
                  <div style={{ width: '100%', maxWidth: 140, height: 8, borderRadius: 8, background: colors.primaryBg, overflow: 'hidden' }}>
                    <div style={{ width: heroPercent + '%', height: '100%', borderRadius: 8, background: colors.primary }} />
                  </div>
                </div>
              </Card>
            </div>

            <div style={{ padding: '8px 20px' }}>
              <Card style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderRadius: radius.xl, boxShadow: shadow.lg }}>
                {[
                  { label: '碳水', value: g(macros.carbs) + ' ' + unitWeight },
                  { label: '蛋白质', value: g(macros.protein) + ' ' + unitWeight },
                  { label: '脂肪', value: g(macros.fat) + ' ' + unitWeight }
                ].map((m, idx, arr) => (
                  <React.Fragment key={m.label}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xs, flex: 1 }}>
                      <span style={{ fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary }}>{m.value}</span>
                      <span style={{ fontSize: fontSize.sm, fontWeight: fontWeight.regular, color: colors.textTertiary }}>{m.label}</span>
                    </div>
                    {idx < arr.length - 1 && <div style={{ width: 1, height: 28, background: colors.segBg }} />}
                  </React.Fragment>
                ))}
              </Card>
            </div>

            <div style={{ padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
              {groupedMeals.length === 0 ? (
                <EmptyState icon="fa-utensils" text="今天还没有记录" actionText="+ 添加记录" onAction={() => navigate('/addfood')} padding={28} />
              ) : (
                groupedMeals.map((grp) => (
                  <div key={grp.meal} style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary }}>{grp.meal}</span>
                      <span style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primary }}>{kcal(grp.calories)} {unitCalorie}</span>
                    </div>
                    {grp.items.map((r) => (
                      <ListItem
                        key={r.id}
                        onClick={() => navigate('/detail?id=' + r.id)}
                        icon={
                          <div style={{ width: 56, height: 56, borderRadius: radius.lg, background: mealGradient[r.meal_type] || mealGradient['午餐'], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className={'fas ' + (mealIcon[r.meal_type] || 'fa-bowl-food')} style={{ fontSize: 24, color: colors.textInverse }} />
                          </div>
                        }
                        title={r.food_name}
                        subtitle={r.record_time ? r.record_time.slice(11, 16) : '--:--'}
                        right={
                          <>
                            <span style={{ fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.primary }}>{kcal(r.calories)} {unitCalorie}</span>
                            <span style={{ fontSize: fontSize.xs, color: colors.textTertiary }}>蛋白 {g(r.protein_g)} {unitWeight}</span>
                          </>
                        }
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
          <BottomNav active="/records" />
        </>
      )}
    </PageContainer>
  );
}
