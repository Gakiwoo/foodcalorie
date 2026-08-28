import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { http } from './src/api/client';
import { todayStr } from './src/ui/toast';
import { StatusBar, NavBar, BottomNav, Ring, Card, normalizeDailyStats } from './src/ui/common';
import { useUnits } from './src/ui/units';
import { Loading, ErrorRetry, EmptyState } from './src/ui/PageState';
import { PageContainer, ListItem } from './src/ui/components';
import { colors, spacing, radius, shadow, fontSize, fontWeight } from './src/ui/theme';

const SEG_OPTIONS = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' }
];

function formatGroupHeader(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date(todayStr() + 'T00:00:00');
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const suffix = `${month}月${day}日`;
  if (d.getTime() === today.getTime()) return `今天·${suffix}`;
  if (d.getTime() === yesterday.getTime()) return `昨天·${suffix}`;
  return suffix;
}

function computeMacros(items) {
  let carbs = 0;
  let protein = 0;
  let fat = 0;
  items.forEach((r) => {
    carbs += Number(r.carbs_g) || 0;
    protein += Number(r.protein_g) || 0;
    fat += Number(r.fat_g) || 0;
  });
  const totalCal = carbs * 4 + protein * 4 + fat * 9;
  if (totalCal <= 0) return [];
  return [
    { label: '碳水', value: Math.round((carbs * 4 / totalCal) * 100) },
    { label: '蛋白', value: Math.round((protein * 4 / totalCal) * 100) },
    { label: '脂肪', value: Math.round((fat * 9 / totalCal) * 100) }
  ];
}

function groupByDate(list) {
  const map = {};
  list.forEach((r) => {
    const d = r.record_time ? r.record_time.slice(0, 10) : '未知';
    if (!map[d]) map[d] = [];
    map[d].push(r);
  });
  return Object.keys(map)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((d) => ({
      date: d,
      items: map[d],
      total: map[d].reduce((s, r) => s + (Number(r.calories) || 0), 0)
    }));
}

const mealIcon = { 早餐: 'fa-mug-hot', 午餐: 'fa-bowl-rice', 晚餐: 'fa-leaf', 加餐: 'fa-apple-whole' };
const mealGradient = {
  早餐: 'linear-gradient(135deg,#D1C4E9 0%,#B39DDB 100%)',
  午餐: 'linear-gradient(135deg,#FFE0B2 0%,#FFCC80 100%)',
  晚餐: 'linear-gradient(135deg,#C8E6C9 0%,#A5D6A7 100%)',
  加餐: 'linear-gradient(135deg,#FFF9C4 0%,#FFF59D 100%)'
};

export default function FoodCalorieRecords() {
  const navigate = useNavigate();
  const { unitCalorie, unitWeight, kcal, g } = useUnits();
  const [params] = useSearchParams();
  const dateParam = params.get('date');
  const date = dateParam || todayStr();
  const isToday = !dateParam;
  const [stats, setStats] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, r] = await Promise.all([
        http.get('/api/v1/foodcalorie/records/stats', { range: 'day', date }),
        http.get('/api/v1/foodcalorie/records', { date })
      ]);
      setStats(normalizeDailyStats(s.data));
      setList(r.data.list);
    } catch (e) {
      setError(e.message || '加载失败，请检查登录状态');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const macros = useMemo(() => computeMacros(list), [list]);
  const groups = useMemo(() => groupByDate(list), [list]);

  const percent = stats?.percent ?? 0;
  const totalIntake = stats?.total ?? 0;
  const avgIntake = stats?.average ?? Math.round(totalIntake);

  return (
    <PageContainer data-name="FoodCalorie-Records">
      <StatusBar />
      <NavBar
        showBack={false}
        title={isToday ? '记录' : date.slice(5)}
        right={
          <span style={{ whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => !isToday && navigate('/records')}>
            {isToday ? (
              <i className="fas fa-sliders" style={{ fontSize: 20, color: colors.textPrimary }} />
            ) : (
              <span style={{ fontSize: fontSize.sm, color: colors.primaryDark, fontWeight: fontWeight.semibold }}>回到今天</span>
            )}
          </span>
        }
      />

      {loading ? (
        <Loading text="加载中…" padding={60} />
      ) : error ? (
        <ErrorRetry error={error} onRetry={load} padding={40} />
      ) : (
        <>
          {/* 汇总卡 */}
          <div style={{ padding: '8px 20px' }}>
            <Card style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, padding: spacing.xl, borderRadius: radius.xxl, boxShadow: shadow.lg }} data-name="summary-card">
              <Ring size={96} stroke={12} percent={percent} label={percent + '%'} sub="已摄入" labelSize={18} labelWeight={700} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary }}>今日摄入 {kcal(totalIntake)} {unitCalorie}</span>
                <span style={{ fontSize: fontSize.md, color: colors.textTertiary }}>日均 {kcal(avgIntake)} {unitCalorie}</span>
                <div style={{ display: 'flex', gap: spacing.sm, paddingTop: 4, flexWrap: 'wrap' }}>
                  {macros.map((m) => (
                    <span
                      key={m.label}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 10px', height: 26, borderRadius: 13,
                        background: colors.primaryBg, color: colors.primaryDark,
                        fontSize: fontSize.sm, fontWeight: fontWeight.semibold
                      }}>
                      {m.label} {m.value}%
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* 日/周/月 */}
          <div style={{ padding: '8px 20px' }}>
            <div role="tablist" aria-label="记录范围切换" style={{ display: 'flex', height: 40, background: colors.surface, borderRadius: radius.xxl, padding: 4, boxShadow: shadow.lg, gap: 4 }}>
              {SEG_OPTIONS.map((o) => {
                const selected = o.value === 'day';
                return (
                  <div
                    key={o.value}
                    role="tab"
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => o.value === 'week' ? navigate('/records-week') : o.value === 'month' && navigate('/records-month')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        o.value === 'week' ? navigate('/records-week') : o.value === 'month' && navigate('/records-month');
                      }
                    }}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      height: 32, borderRadius: radius.xl,
                      background: selected ? colors.primary : 'transparent',
                      color: selected ? colors.textInverse : colors.textTertiary,
                      fontSize: fontSize.lg, fontWeight: selected ? fontWeight.semibold : fontWeight.medium,
                      cursor: 'pointer'
                    }}>
                    {o.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 记录列表 */}
          <div style={{ padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
            {list.length === 0 ? (
              <EmptyState icon="fa-utensils" text={isToday ? '今天还没有记录' : '这一天没有记录'} actionText="+ 添加记录" onAction={() => navigate('/addfood')} padding={28} />
            ) : (
              groups.map((grp) => (
                <div key={grp.date} style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                  <div data-name={'group-header-' + grp.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary }}>{formatGroupHeader(grp.date)}</span>
                    <span style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primary }}>{kcal(grp.total)} {unitCalorie}</span>
                  </div>
                  {grp.items.map((r) => (
                    <ListItem
                      key={r.id}
                      data-name={'food-card-' + r.id}
                      onClick={() => navigate('/detail?id=' + r.id)}
                      icon={
                        <div style={{ width: 56, height: 56, borderRadius: radius.lg, background: mealGradient[r.meal_type] || colors.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className={'fas ' + (mealIcon[r.meal_type] || 'fa-bowl-food')} style={{ fontSize: 24, color: colors.textInverse }} />
                        </div>
                      }
                      title={r.food_name}
                      subtitle={`${r.record_time ? r.record_time.slice(11, 16) : '--:--'} · ${r.meal_type}`}
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
        </>
      )}

      <BottomNav active="/records" />
    </PageContainer>
  );
}
