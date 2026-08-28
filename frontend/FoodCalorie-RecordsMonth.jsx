import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, todayStr } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';
import { useUnits } from './src/ui/units';
import { PageContainer } from './src/ui/components';
import { colors, radius, fontSize, fontWeight } from './src/ui/theme';

export default function FoodCalorieRecordsMonth() {
  const navigate = useNavigate();
  const { unitCalorie, kcal } = useUnits();
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(true);
  const seq = useRef(0);

  useEffect(() => {
    const current = ++seq.current;
    setLoading(true);
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/records/calendar', { month });
        if (current !== seq.current) return;
        const map = {};
        (r.data.days || []).forEach((d) => { map[d.day] = d.calories; });
        setDays(map);
      } catch (e) {
        if (current !== seq.current) return;
        toast(e.message || '加载失败');
      } finally {
        if (current === seq.current) setLoading(false);
      }
    })();
  }, [month]);

  const [y, m] = month.split('-').map(Number);
  const totalDays = new Date(y, m, 0).getDate();
  const firstDow = new Date(y, m - 1, 1).getDay();
  const total = Object.values(days).reduce((s, v) => s + v, 0);
  const isCurrentMonth = todayStr().slice(0, 7) === month;
  const elapsedDays = isCurrentMonth ? Number(todayStr().slice(8, 10)) : totalDays;
  const avg = elapsedDays > 0 ? Math.round(total / elapsedDays) : 0;

  function shiftMonth(delta) {
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let day = 1; day <= totalDays; day++) cells.push(day);

  return (
    <PageContainer data-name="FoodCalorie-RecordsMonth">
      <StatusBar />
      <NavBar title="月历" />

      <div style={{ padding: '4px 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <i className="fas fa-chevron-left" role="button" tabIndex={0} aria-label="上一月" style={{ fontSize: 14, color: colors.primary, cursor: 'pointer' }} onClick={() => shiftMonth(-1)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shiftMonth(-1); } }} />
        <div style={{ flex: 1, textAlign: 'center', fontSize: fontSize.display, fontWeight: fontWeight.bold, color: colors.textPrimary }}>{y}年{m}月</div>
        <i className="fas fa-chevron-right" role="button" tabIndex={0} aria-label="下一月" style={{ fontSize: 14, color: colors.primary, cursor: 'pointer' }} onClick={() => shiftMonth(1)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shiftMonth(1); } }} />
      </div>
      <Card style={{ margin: '0 20px 12px', display: 'flex', justifyContent: 'space-around', padding: '12px 8px' }}>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 17, fontWeight: fontWeight.extrabold, color: colors.textPrimary }}>{kcal(total)}</div><div style={{ fontSize: 10, color: colors.textTertiary }}>月总摄入 {unitCalorie}</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 17, fontWeight: fontWeight.extrabold, color: colors.textPrimary }}>{kcal(avg)}</div><div style={{ fontSize: 10, color: colors.textTertiary }}>日均 {unitCalorie}</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 17, fontWeight: fontWeight.extrabold, color: colors.primary }}>{Object.keys(days).length}</div><div style={{ fontSize: 10, color: colors.textTertiary }}>记录天数</div></div>
      </Card>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>加载中…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 20px', gap: 6, marginBottom: 6 }}>
            {['日', '一', '二', '三', '四', '五', '六'].map((w) => <div key={w} style={{ textAlign: 'center', fontSize: 11, color: colors.textTertiary, fontWeight: fontWeight.semibold }}>{w}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 20px', gap: 6 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={'e' + i} />;
              const date = `${month}-${String(day).padStart(2, '0')}`;
              const cal = days[day] || 0;
              const isToday = date === todayStr().slice(0, 10);
              const has = cal > 0;
              return (
                <div key={day} role="button" tabIndex={0} aria-label={`${date}，${has ? cal + '千卡' : '无记录'}`} onClick={() => navigate('/records?date=' + date)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/records?date=' + date); } }} style={{ aspectRatio: '1', borderRadius: radius.md, background: isToday ? colors.primary : has ? colors.primaryBg : colors.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid ' + (isToday ? colors.primary : colors.segBg), outline: 'none' }}>
                  <span style={{ fontSize: fontSize.lg, fontWeight: isToday ? fontWeight.bold : fontWeight.medium, color: isToday ? colors.textInverse : has ? colors.textPrimary : '#C0C4CC' }}>{day}</span>
                  {has ? <span style={{ fontSize: 8, fontWeight: fontWeight.bold, color: isToday ? colors.textInverse : colors.primaryDark, marginTop: 2 }}>{cal}</span> : <span style={{ fontSize: 8, color: colors.textDisabled, marginTop: 2 }}>·</span>}
                </div>
              );
            })}
          </div>
          <div style={{ padding: '14px 20px 8px', fontSize: 11, color: colors.textTertiary, textAlign: 'center' }}>点击日期查看当日记录</div>
        </>
      )}
    </PageContainer>
  );
}
