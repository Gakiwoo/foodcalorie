import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, todayStr } from './src/ui/toast';
import { StatusBar, NavBar, BottomNav, Ring, Seg, Card } from './src/ui/common';

// 记录页：真实数据（GET stats + GET records 列表 + 删除 + 支持 ?date= 指定日期）
export default function FoodCalorieRecords() {
  const navigate = useNavigate();
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
      setStats(s.data);
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

  async function handleDelete(id, name) {
    // 不可恢复操作，二次确认（原直接删除易误触）
    if (!window.confirm('确定删除「' + name + '」吗？删除后无法恢复')) return;
    try {
      await http.del('/api/v1/foodcalorie/records/' + id);
      toast('已删除「' + name + '」');
      load();
    } catch (e) {
      toast(e.message || '删除失败');
    }
  }

  const mealIcon = { 早餐: 'fa-mug-hot', 午餐: 'fa-bowl-food', 晚餐: 'fa-moon', 加餐: 'fa-apple-whole' };

  return (
    <div data-name="FoodCalorie-Records" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title={isToday ? '记录' : date.slice(5)} right={
        <span style={{ fontSize: 12, color: '#22A85A', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/records')}>
          {isToday ? <i className="fas fa-filter" style={{ fontSize: 16, color: '#1A1A1A' }} /> : '回到今天'}
        </span>
      } />

      {/* 日/周/月 */}
      <div style={{ padding: '6px 20px 12px' }}>
        <Seg options={[{ value: 'day', label: '日' }, { value: 'week', label: '周' }, { value: 'month', label: '月' }]} value="day" onChange={(v) => v === 'week' ? navigate('/records-week') : v === 'month' && navigate('/records-month')} />
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div>
      ) : error ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#E03131', fontSize: 14 }}>
          {error}
          <div style={{ marginTop: 12 }}><button onClick={load} style={{ padding: '8px 24px', borderRadius: 12, border: 'none', background: '#34C759', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>重试</button></div>
        </div>
      ) : (
        <>
          {/* 汇总卡 */}
          <Card style={{ margin: '0 20px 14px', display: 'flex', alignItems: 'center', gap: 18 }} data-name="summary-card">
            <Ring percent={stats.percent} label={stats.percent + '%'} sub="已摄入" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>今日摄入</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#1A1A1A' }}>{stats.total} <span style={{ fontSize: 13, fontWeight: 500, color: '#9CA3AF' }}>kcal</span></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>目标</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{stats.target} kcal</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>达标天数</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#34C759' }}>{stats.reachedDays}/{stats.totalDays}</span>
              </div>
            </div>
          </Card>

          {/* 记录列表 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 20px 8px' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{isToday ? '今日记录' : date + ' 记录'}</span>
            <span style={{ fontSize: 12, color: '#22A85A', cursor: 'pointer' }} onClick={() => navigate(isToday ? '/today' : '/records')}>{isToday ? '查看今日 ›' : '回今天 ›'}</span>
          </div>
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: '28px 16px' }}>
                <i className="fas fa-utensils" style={{ fontSize: 28, color: '#D1D5DB' }} />
                <div style={{ marginTop: 8, fontSize: 13, color: '#9CA3AF' }}>{isToday ? '今天还没有记录' : '这一天没有记录'}</div>
                <button onClick={() => navigate('/addfood')} style={{ marginTop: 14, padding: '9px 28px', borderRadius: 14, border: 'none', background: '#34C759', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+ 添加记录</button>
              </Card>
            ) : (
              list.map((r) => (
                <Card key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer' }} data-name={'food-card-' + r.id} onClick={() => navigate('/detail?id=' + r.id)}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={'fas ' + (mealIcon[r.meal_type] || 'fa-bowl-food')} style={{ fontSize: 16, color: '#22A85A' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.food_name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{r.category || '未分类'} · {r.meal_type} · {r.record_time.slice(11)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#E8590C' }}>{r.calories}<span style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}> kcal</span></span>
                    <i className="fas fa-trash-can" style={{ fontSize: 13, color: '#C0C4CC', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); handleDelete(r.id, r.food_name); }} />
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      <BottomNav active="/records" />
    </div>
  );
}
