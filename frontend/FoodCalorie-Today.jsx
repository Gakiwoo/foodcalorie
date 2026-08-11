import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, todayStr } from './src/ui/toast';
import { StatusBar, NavBar, Ring, Card } from './src/ui/common';

// 今日记录页：真实数据（GET stats + GET records 当日列表）
export default function FoodCalorieToday() {
  const navigate = useNavigate();
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
      setStats(s.data);
      setList(r.data.list);
    } catch (e) {
      setError(e.message || '加载失败，请检查登录状态');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id, name) {
    try {
      await http.del('/api/v1/foodcalorie/records/' + id);
      toast('已删除「' + name + '」');
      load();
    } catch (e) {
      toast(e.message || '删除失败');
    }
  }

  const mealIcon = { 早餐: 'fa-mug-hot', 午餐: 'fa-bowl-food', 晚餐: 'fa-moon', 加餐: 'fa-apple-whole' };
  const today = todayStr();

  return (
    <div data-name="FoodCalorie-Today" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="今日记录" right={<span style={{ fontSize: 13, color: '#22A85A', fontWeight: 600 }}>{today.slice(5)}</span>} />

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div>
      ) : error ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#E03131', fontSize: 14 }}>
          {error}
          <div style={{ marginTop: 12 }}><button onClick={load} style={{ padding: '8px 24px', borderRadius: 12, border: 'none', background: '#34C759', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>重试</button></div>
        </div>
      ) : (
        <>
          {/* Hero：环 + 摄入 */}
          <Card style={{ margin: '6px 20px 14px', display: 'flex', alignItems: 'center', gap: 18, background: 'linear-gradient(135deg,#FFFFFF 0%,#F0FBF4 100%)' }}>
            <Ring size={104} stroke={10} percent={stats.percent} label={stats.total} sub="已摄入 kcal" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>目标摄入</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A' }}>{stats.target} kcal</div>
              <div style={{ marginTop: 6, fontSize: 12, color: stats.total <= stats.target ? '#22A85A' : '#E8590C' }}>
                {stats.total <= stats.target ? '✓ 未超标，继续保持' : '⚠ 已超出目标'}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#9CA3AF' }}>剩余 {Math.max(0, stats.target - stats.total)} kcal</div>
            </div>
          </Card>

          {/* 当日记录列表 */}
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: '28px 16px' }}>
                <i className="fas fa-utensils" style={{ fontSize: 28, color: '#D1D5DB' }} />
                <div style={{ marginTop: 8, fontSize: 13, color: '#9CA3AF' }}>今天还没有记录</div>
                <button onClick={() => navigate('/addfood')} style={{ marginTop: 14, padding: '9px 28px', borderRadius: 14, border: 'none', background: '#34C759', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+ 添加记录</button>
              </Card>
            ) : (
              list.map((r) => (
                <Card key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={'fas ' + (mealIcon[r.meal_type] || 'fa-bowl-food')} style={{ fontSize: 16, color: '#22A85A' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{r.food_name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{r.category || '未分类'} · {r.meal_type} · {r.record_time.slice(11)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#E8590C' }}>{r.calories}<span style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}> kcal</span></span>
                    <i className="fas fa-trash-can" style={{ fontSize: 13, color: '#C0C4CC', cursor: 'pointer' }} onClick={() => handleDelete(r.id, r.food_name)} />
                  </div>
                </Card>
              ))
            )}
          </div>
          <div style={{ padding: '14px 20px' }}>
            <button onClick={() => navigate('/addfood')} style={{ width: '100%', height: 48, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>+ 添加记录</button>
          </div>
        </>
      )}
    </div>
  );
}
