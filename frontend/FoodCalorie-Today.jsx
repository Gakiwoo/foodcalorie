import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { todayStr } from './src/ui/toast';
import { StatusBar, NavBar, Ring, Card, BottomNav, normalizeDailyStats } from './src/ui/common';
import { useUnits } from './src/ui/units';
import { Loading, ErrorRetry, EmptyState } from './src/ui/PageState';

// 今日记录页：真实数据（GET stats + GET records 当日列表）
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

  // 空值兜底：normalizeDailyStats 对缺失/畸形数据返回 null，渲染前归一化，防止整页白屏
  const s = stats || { total: 0, target: 1400, percent: 0 };

  return (
    <div data-name="FoodCalorie-Today" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="今日记录" right={<span style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>{today.slice(5)}</span>} />

      {loading ? (
        <Loading text="加载中…" padding={60} />
      ) : error ? (
        <ErrorRetry error={error} onRetry={load} padding={40} />
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Hero 卡：白底圆角阴影 + 进度条 */}
            <div style={{ padding: '8px 20px' }}>
              <Card style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20, padding: 24, borderRadius: 20, background: '#FFFFFF', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}>
                <Ring size={112} stroke={12} percent={s.percent} label={kcal(s.total)} sub={`已摄入 ${unitCalorie}`} labelSize={22} labelWeight={800} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>目标 {kcal(s.target)} {unitCalorie}</div>
                  <div style={{ fontSize: 13, fontWeight: 400, color: '#34C759' }}>还可摄入 {kcal(Math.max(0, s.target - s.total))} {unitCalorie}</div>
                  <div style={{ width: '100%', maxWidth: 140, height: 8, borderRadius: 8, background: '#E8F5EC', overflow: 'hidden' }}>
                    <div style={{ width: heroPercent + '%', height: '100%', borderRadius: 8, background: '#34C759' }} />
                  </div>
                </div>
              </Card>
            </div>

            {/* 宏观营养素 */}
            <div style={{ padding: '8px 20px' }}>
              <Card style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}>
                {[
                  { label: '碳水', value: g(macros.carbs) + ' ' + unitWeight },
                  { label: '蛋白质', value: g(macros.protein) + ' ' + unitWeight },
                  { label: '脂肪', value: g(macros.fat) + ' ' + unitWeight }
                ].map((m, idx, arr) => (
                  <React.Fragment key={m.label}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>{m.value}</span>
                      <span style={{ fontSize: 12, fontWeight: 400, color: '#9CA3AF' }}>{m.label}</span>
                    </div>
                    {idx < arr.length - 1 && <div style={{ width: 1, height: 28, background: '#EEF0F2' }} />}
                  </React.Fragment>
                ))}
              </Card>
            </div>

            {/* 按餐次分组的记录列表 */}
            <div style={{ padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {groupedMeals.length === 0 ? (
                <EmptyState icon="fa-utensils" text="今天还没有记录" actionText="+ 添加记录" onAction={() => navigate('/addfood')} padding={28} />
              ) : (
                groupedMeals.map((grp) => (
                  <div key={grp.meal} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{grp.meal}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#34C759' }}>{kcal(grp.calories)} {unitCalorie}</span>
                    </div>
                    {grp.items.map((r) => (
                      <Card key={r.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 12, background: mealGradient[r.meal_type] || mealGradient['午餐'], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <i className={'fas ' + (mealIcon[r.meal_type] || 'fa-bowl-food')} style={{ fontSize: 24, color: '#FFFFFF' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>{r.food_name}</div>
                          <div style={{ fontSize: 12, color: '#9CA3AF' }}>{r.record_time ? r.record_time.slice(11, 16) : '--:--'}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#34C759' }}>{kcal(r.calories)} {unitCalorie}</span>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>蛋白 {g(r.protein_g)} {unitWeight}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
          <BottomNav active="/records" />
        </>
      )}
    </div>
  );
}
