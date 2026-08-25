import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { http } from './src/api/client';
import { todayStr } from './src/ui/toast';
import { StatusBar, NavBar, BottomNav, Ring, Card, normalizeDailyStats } from './src/ui/common';
import { useUnits } from './src/ui/units';
import { Loading, ErrorRetry, EmptyState } from './src/ui/PageState';

const SHADOW_CARD = '0 4px 14px rgba(0,0,0,0.05)';
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
  // 无营养数据时不渲染假比例（原返回固定 45/30/25 示意值，误导用户）
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

// 记录页：真实数据（GET stats + GET records 列表 + 删除 + 支持 ?date= 指定日期）
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

  const mealIcon = { 早餐: 'fa-mug-hot', 午餐: 'fa-bowl-rice', 晚餐: 'fa-leaf', 加餐: 'fa-apple-whole' };
  const mealGradient = {
    早餐: 'linear-gradient(135deg,#D1C4E9 0%,#B39DDB 100%)',
    午餐: 'linear-gradient(135deg,#FFE0B2 0%,#FFCC80 100%)',
    晚餐: 'linear-gradient(135deg,#C8E6C9 0%,#A5D6A7 100%)',
    加餐: 'linear-gradient(135deg,#FFF9C4 0%,#FFF59D 100%)'
  };
  const macros = useMemo(() => computeMacros(list), [list]);
  const groups = useMemo(() => groupByDate(list), [list]);

  const percent = stats?.percent ?? 0;
  const totalIntake = stats?.total ?? 0;
  const avgIntake = stats?.average ?? Math.round(totalIntake);

  return (
    <div data-name="FoodCalorie-Records" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar
        showBack={false}
        title={isToday ? '记录' : date.slice(5)}
        right={
          <span style={{ whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => !isToday && navigate('/records')}>
            {isToday ? (
              <i className="fas fa-sliders" style={{ fontSize: 20, color: '#1A1A1A' }} />
            ) : (
              <span style={{ fontSize: 12, color: '#22A85A', fontWeight: 600 }}>回到今天</span>
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
            <Card style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, borderRadius: 20, boxShadow: SHADOW_CARD }} data-name="summary-card">
              <Ring size={96} stroke={12} percent={percent} label={percent + '%'} sub="已摄入" labelSize={18} labelWeight={700} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>今日摄入 {kcal(totalIntake)} {unitCalorie}</span>
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>日均 {kcal(avgIntake)} {unitCalorie}</span>
                <div style={{ display: 'flex', gap: 8, paddingTop: 4, flexWrap: 'wrap' }}>
                  {macros.map((m) => (
                    <span
                      key={m.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 10px',
                        height: 26,
                        borderRadius: 13,
                        background: '#E8F5EC',
                        color: '#22A85A',
                        fontSize: 12,
                        fontWeight: 600
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
            <div role="tablist" aria-label="记录范围切换" style={{ display: 'flex', height: 40, background: '#FFFFFF', borderRadius: 20, padding: 4, boxShadow: SHADOW_CARD, gap: 4 }}>
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
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 32,
                      borderRadius: 16,
                      background: selected ? '#34C759' : 'transparent',
                      color: selected ? '#FFFFFF' : '#9CA3AF',
                      fontSize: 14,
                      fontWeight: selected ? 600 : 500,
                      cursor: 'pointer'
                    }}>
                    {o.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 记录列表 */}
          <div style={{ padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {list.length === 0 ? (
              <EmptyState icon="fa-utensils" text={isToday ? '今天还没有记录' : '这一天没有记录'} actionText="+ 添加记录" onAction={() => navigate('/addfood')} padding={28} />
            ) : (
              groups.map((grp) => (
                <div key={grp.date} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div data-name={'group-header-' + grp.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{formatGroupHeader(grp.date)}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#34C759' }}>{kcal(grp.total)} {unitCalorie}</span>
                  </div>
                  {grp.items.map((r) => (
                    <Card key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer', boxShadow: SHADOW_CARD }} data-name={'food-card-' + r.id} onClick={() => navigate('/detail?id=' + r.id)}>
                      <div style={{ width: 56, height: 56, borderRadius: 12, background: mealGradient[r.meal_type] || '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={'fas ' + (mealIcon[r.meal_type] || 'fa-bowl-food')} style={{ fontSize: 24, color: '#FFFFFF' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.food_name}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{r.record_time ? r.record_time.slice(11, 16) : '--:--'} · {r.meal_type}</div>
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
        </>
      )}

      <BottomNav active="/records" />
    </div>
  );
}
