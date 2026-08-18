import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, todayStr } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';

// 月视图：真实数据（GET calendar?month= 每日摄入点 + 月份切换 + 点某天进记录页）
export default function FoodCalorieRecordsMonth() {
  const navigate = useNavigate();
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/records/calendar', { month });
        const map = {};
        (r.data.days || []).forEach((d) => { map[d.day] = d.calories; });
        setDays(map);
      } catch (e) {
        toast(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [month]);

  const [y, m] = month.split('-').map(Number);
  const totalDays = new Date(y, m, 0).getDate();
  const firstDow = new Date(y, m - 1, 1).getDay(); // 0=周日
  const total = Object.values(days).reduce((s, v) => s + v, 0);
  // 日均分母：当前月取"今天与月末的较小者"，未来日期不计入，避免月中查看时日均被系统性低估
  const isCurrentMonth = todayStr().slice(0, 7) === month;
  const elapsedDays = isCurrentMonth ? Number(todayStr().slice(8, 10)) : totalDays;
  const avg = elapsedDays > 0 ? Math.round(total / elapsedDays) : 0;

  function shiftMonth(delta) {
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null); // 前置空位
  for (let day = 1; day <= totalDays; day++) cells.push(day);

  return (
    <div data-name="FoodCalorie-RecordsMonth" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="月历" />

      {/* 月份切换 + 汇总 */}
      <div style={{ padding: '4px 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <i className="fas fa-chevron-left" style={{ fontSize: 14, color: '#34C759', cursor: 'pointer' }} onClick={() => shiftMonth(-1)} />
        <div style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>{y}年{m}月</div>
        <i className="fas fa-chevron-right" style={{ fontSize: 14, color: '#34C759', cursor: 'pointer' }} onClick={() => shiftMonth(1)} />
      </div>
      <Card style={{ margin: '0 20px 12px', display: 'flex', justifyContent: 'space-around', padding: '12px 8px' }}>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 17, fontWeight: 800, color: '#1A1A1A' }}>{total}</div><div style={{ fontSize: 10, color: '#9CA3AF' }}>月总摄入</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 17, fontWeight: 800, color: '#1A1A1A' }}>{avg}</div><div style={{ fontSize: 10, color: '#9CA3AF' }}>日均 kcal</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 17, fontWeight: 800, color: '#34C759' }}>{Object.keys(days).length}</div><div style={{ fontSize: 10, color: '#9CA3AF' }}>记录天数</div></div>
      </Card>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div>
      ) : (
        <>
          {/* 星期表头 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 20px', gap: 6, marginBottom: 6 }}>
            {['日', '一', '二', '三', '四', '五', '六'].map((w) => <div key={w} style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{w}</div>)}
          </div>
          {/* 日历格 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 20px', gap: 6 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={'e' + i} />;
              const date = `${month}-${String(day).padStart(2, '0')}`;
              const cal = days[day] || 0;
              const isToday = date === todayStr().slice(0, 10);
              const has = cal > 0;
              return (
                <div key={day} onClick={() => navigate('/records?date=' + date)} style={{ aspectRatio: '1', borderRadius: 10, background: isToday ? '#34C759' : has ? '#E8F5EC' : '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid ' + (isToday ? '#34C759' : '#EEF0F2') }}>
                  <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 500, color: isToday ? '#fff' : has ? '#1A1A1A' : '#C0C4CC' }}>{day}</span>
                  {has ? <span style={{ fontSize: 8, fontWeight: 700, color: isToday ? '#fff' : '#22A85A', marginTop: 2 }}>{cal}</span> : <span style={{ fontSize: 8, color: '#D1D5DB', marginTop: 2 }}>·</span>}
                </div>
              );
            })}
          </div>
          <div style={{ padding: '14px 20px 8px', fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>点击日期查看当日记录</div>
        </>
      )}
    </div>
  );
}
