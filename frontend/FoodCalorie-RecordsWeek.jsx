import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, todayStr } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';

// 周视图：真实数据（GET stats?range=week → 周汇总 + 每日摄入，点某天进记录页）
export default function FoodCalorieRecordsWeek() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/records/stats', { range: 'week' });
        setStats(r.data);
      } catch (e) {
        setError(e.message || '加载失败，请检查登录状态');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}><StatusBar /><NavBar title="周记录" /><div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div></div>;

  if (!stats) {
    return (
      <div data-name="FoodCalorie-RecordsWeek" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
        <StatusBar /><NavBar title="本周记录" />
        <div style={{ padding: 40, textAlign: 'center', color: '#E03131', fontSize: 14 }}>
          {error}
          <div style={{ marginTop: 12 }}><button onClick={() => location.reload()} style={{ padding: '8px 24px', borderRadius: 12, border: 'none', background: '#34C759', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>重试</button></div>
        </div>
      </div>
    );
  }

  const today = todayStr();
  // 周一~周日
  const days = [];
  const base = new Date(stats.from + 'T00:00:00');
  for (let i = 0; i < 7; i++) {
    const d = new Date(base.getTime() + i * 86400000);
    days.push({ date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i] });
  }
  const weekNames = { 一: '周一', 二: '周二', 三: '周三', 四: '周四', 五: '周五', 六: '周六', 日: '周日' };

  return (
    <div data-name="FoodCalorie-RecordsWeek" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="本周记录" />

      {/* 周汇总 */}
      <Card style={{ margin: '6px 20px 14px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 84, height: 84, borderRadius: 42, background: 'linear-gradient(135deg,#34C759,#1FA355)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{stats.percent}%</div>
            <div style={{ fontSize: 9, opacity: 0.85 }}>达标比例</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#9CA3AF' }}>周总摄入</span><span style={{ fontWeight: 700, color: '#1A1A1A' }}>{stats.total} kcal</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#9CA3AF' }}>日均摄入</span><span style={{ fontWeight: 700, color: '#1A1A1A' }}>{stats.average} kcal</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#9CA3AF' }}>达标天数</span><span style={{ fontWeight: 700, color: '#34C759' }}>{stats.reachedDays}/{stats.totalDays}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#9CA3AF' }}>周目标</span><span style={{ fontWeight: 700, color: '#1A1A1A' }}>{stats.target * 7} kcal</span></div>
        </div>
      </Card>

      {/* 每日列表 */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>本周记录</span>
        {days.map((d) => {
          const cal = stats.daily[d.date] || 0;
          const isToday = d.date === today;
          const over = cal > stats.target;
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
                  <div style={{ fontSize: 14, fontWeight: 700, color: over ? '#E8590C' : '#22A85A' }}>{cal}<span style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}> kcal</span></div>
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
