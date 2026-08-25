import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { todayStr } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';
import { useUnits } from './src/ui/units';
import { Loading, ErrorRetry } from './src/ui/PageState';

// 周视图：真实数据（GET stats?range=week → 周汇总 + 每日摄入，点某天进记录页）
export default function FoodCalorieRecordsWeek() {
  const navigate = useNavigate();
  const { unitCalorie, kcal } = useUnits();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadStats() {
    setLoading(true);
    setError('');
    try {
      const r = await http.get('/api/v1/foodcalorie/records/stats', { range: 'week' });
      setStats(r.data);
    } catch (e) {
      setError(e.message || '加载失败，请检查登录状态');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) return <div style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}><StatusBar /><NavBar title="周记录" /><Loading text="加载中…" padding={60} /></div>;

  if (!stats) {
    return (
      <div data-name="FoodCalorie-RecordsWeek" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
        <StatusBar /><NavBar title="本周记录" />
        <ErrorRetry error={error} onRetry={loadStats} padding={40} />
      </div>
    );
  }

  const today = todayStr();
  // 周一~周日（from 缺失/非法时回退到本周一，避免 Invalid Date 渲染 NaN 日期）
  const fromTs = stats.from && !Number.isNaN(new Date(stats.from + 'T00:00:00').getTime())
    ? new Date(stats.from + 'T00:00:00')
    : (() => {
        const now = new Date();
        const day = now.getDay() || 7; // 周一=1..周日=7
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
      })();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(fromTs.getTime() + i * 86400000);
    days.push({ date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i] });
  }
  return (
    <div data-name="FoodCalorie-RecordsWeek" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="本周记录" />

      {/* 周汇总 */}
      <Card style={{ margin: '6px 20px 14px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 84, height: 84, borderRadius: 42, background: 'linear-gradient(135deg,#34C759,#1FA355)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{stats.percent ?? 0}%</div>
            <div style={{ fontSize: 9, opacity: 0.85 }}>达标比例</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#9CA3AF' }}>周总摄入</span><span style={{ fontWeight: 700, color: '#1A1A1A' }}>{kcal(stats.total ?? 0)} {unitCalorie}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#9CA3AF' }}>日均摄入</span><span style={{ fontWeight: 700, color: '#1A1A1A' }}>{kcal(stats.average ?? 0)} {unitCalorie}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#9CA3AF' }}>达标天数</span><span style={{ fontWeight: 700, color: '#34C759' }}>{stats.reachedDays ?? 0}/{stats.totalDays ?? 0}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#9CA3AF' }}>周目标</span><span style={{ fontWeight: 700, color: '#1A1A1A' }}>{kcal((stats.target ?? 0) * 7)} {unitCalorie}</span></div>
        </div>
      </Card>

      {/* 每日列表 */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>本周记录</span>
        {days.map((d) => {
          const cal = (stats.daily && stats.daily[d.date]) || 0;
          const isToday = d.date === today;
          const over = cal > (stats.target ?? 0);
          return (
            <Card key={d.date} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer', border: isToday ? '1.5px solid #34C759' : '1.5px solid transparent' }} onClick={() => navigate('/records?date=' + d.date)}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: isToday ? '#34C759' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fas fa-calendar-day" style={{ fontSize: 14, color: isToday ? '#fff' : '#9CA3AF' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{d.name}{isToday ? '（今天）' : ''}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{d.date}</div>
              </div>
              {cal > 0 ? (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: over ? '#E8590C' : '#22A85A' }}>{kcal(cal)}<span style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}> {unitCalorie}</span></div>
                  <div style={{ fontSize: 10, color: over ? '#E8590C' : '#34C759', fontWeight: 600 }}>{over ? '⚠ 超标' : '✓ 达标'}</div>
                </div>
              ) : (
                <span style={{ fontSize: 12, color: '#C0C4CC' }}>未记录</span>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
