import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { todayStr } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';
import { useUnits } from './src/ui/units';
import { Loading, ErrorRetry } from './src/ui/PageState';
import { PageContainer } from './src/ui/components';
import { colors, radius, fontSize, fontWeight } from './src/ui/theme';

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

  if (loading) return <PageContainer><StatusBar /><NavBar title="周记录" /><Loading text="加载中…" padding={60} /></PageContainer>;

  if (!stats) {
    return (
      <PageContainer data-name="FoodCalorie-RecordsWeek">
        <StatusBar /><NavBar title="本周记录" />
        <ErrorRetry error={error} onRetry={loadStats} padding={40} />
      </PageContainer>
    );
  }

  const today = todayStr();
  const fromTs = stats.from && !Number.isNaN(new Date(stats.from + 'T00:00:00').getTime())
    ? new Date(stats.from + 'T00:00:00')
    : (() => {
        const now = new Date();
        const day = now.getDay() || 7;
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
      })();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(fromTs.getTime() + i * 86400000);
    days.push({ date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i] });
  }
  return (
    <PageContainer data-name="FoodCalorie-RecordsWeek">
      <StatusBar />
      <NavBar title="本周记录" />

      <Card style={{ margin: '6px 20px 14px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 84, height: 84, borderRadius: 42, background: 'linear-gradient(135deg,#34C759,#1FA355)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ textAlign: 'center', color: colors.textInverse }}>
            <div style={{ fontSize: 20, fontWeight: fontWeight.extrabold, lineHeight: 1 }}>{stats.percent ?? 0}%</div>
            <div style={{ fontSize: 9, opacity: 0.85 }}>达标比例</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fontSize.md }}><span style={{ color: colors.textTertiary }}>周总摄入</span><span style={{ fontWeight: fontWeight.bold, color: colors.textPrimary }}>{kcal(stats.total ?? 0)} {unitCalorie}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fontSize.md }}><span style={{ color: colors.textTertiary }}>日均摄入</span><span style={{ fontWeight: fontWeight.bold, color: colors.textPrimary }}>{kcal(stats.average ?? 0)} {unitCalorie}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fontSize.md }}><span style={{ color: colors.textTertiary }}>达标天数</span><span style={{ fontWeight: fontWeight.bold, color: colors.primary }}>{stats.reachedDays ?? 0}/{stats.totalDays ?? 0}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fontSize.md }}><span style={{ color: colors.textTertiary }}>周目标</span><span style={{ fontWeight: fontWeight.bold, color: colors.textPrimary }}>{kcal((stats.target ?? 0) * 7)} {unitCalorie}</span></div>
        </div>
      </Card>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary }}>本周记录</span>
        {days.map((d) => {
          const cal = (stats.daily && stats.daily[d.date]) || 0;
          const isToday = d.date === today;
          const over = cal > (stats.target ?? 0);
          return (
            <Card key={d.date} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer', border: isToday ? `1.5px solid ${colors.primary}` : '1.5px solid transparent' }} onClick={() => navigate('/records?date=' + d.date)}>
              <div style={{ width: 40, height: 40, borderRadius: radius.lg, background: isToday ? colors.primary : colors.borderLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fas fa-calendar-day" style={{ fontSize: 14, color: isToday ? colors.textInverse : colors.textTertiary }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>{d.name}{isToday ? '（今天）' : ''}</div>
                <div style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 }}>{d.date}</div>
              </div>
              {cal > 0 ? (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: over ? '#E8590C' : colors.primaryDark }}>{kcal(cal)}<span style={{ fontSize: 10, fontWeight: fontWeight.regular, color: colors.textTertiary }}> {unitCalorie}</span></div>
                  <div style={{ fontSize: 10, color: over ? '#E8590C' : colors.primary, fontWeight: fontWeight.semibold }}>{over ? '⚠ 超标' : '✓ 达标'}</div>
                </div>
              ) : (
                <span style={{ fontSize: fontSize.sm, color: '#C0C4CC' }}>未记录</span>
              )}
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
