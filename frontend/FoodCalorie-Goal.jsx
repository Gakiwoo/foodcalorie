import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';

// 目标设置页：真实数据（GET/PUT profile.goal_type + target_calories）
const GOALS = [
  { value: '减脂', desc: '控制热量缺口，稳步下降' },
  { value: '保持', desc: '维持当前体重与状态' },
  { value: '增肌', desc: '高蛋白 + 适度热量盈余' }
];

export default function FoodCalorieGoal() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('减脂');
  const [target, setTarget] = useState(1400);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/profile');
        setGoal(r.data.goal_type || '减脂');
        setTarget(r.data.target_calories || 1400);
      } catch (e) {
        toast(e.message || '加载失败，请先登录');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    if (!Number(target) || Number(target) < 800 || Number(target) > 6000) return toast('目标热量需在 800-6000 kcal 之间');
    setSaving(true);
    try {
      await http.put('/api/v1/foodcalorie/profile', { goal_type: goal, target_calories: Math.round(Number(target)) });
      toast('目标已保存');
      navigate('/me');
    } catch (e) {
      toast(e.message || '保存失败');
      setSaving(false);
    }
  }

  return (
    <div data-name="FoodCalorie-Goal" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="目标设置" />

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div>
      ) : (
        <>
          {/* 健康目标 */}
          <Card style={{ margin: '6px 20px 12px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>健康目标</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GOALS.map((g) => {
                const on = goal === g.value;
                return (
                  <div key={g.value} onClick={() => setGoal(g.value)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, border: '1.5px solid ' + (on ? '#34C759' : '#EEF0F2'), cursor: 'pointer', background: on ? '#F0FBF4' : '#FFFFFF' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: on ? '#34C759' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={'fas ' + (g.value === '减脂' ? 'fa-fire' : g.value === '保持' ? 'fa-scale-balanced' : 'fa-dumbbell')} style={{ fontSize: 15, color: on ? '#fff' : '#9CA3AF' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{g.value}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{g.desc}</div>
                    </div>
                    {on && <i className="fas fa-circle-check" style={{ fontSize: 17, color: '#34C759' }} />}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 每日目标热量 */}
          <Card style={{ margin: '0 20px 12px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>每日目标热量</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>范围 800-6000 kcal，记录与首页将按此计算达标</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input value={target} onChange={(e) => setTarget(e.target.value)} type="number" min="800" max="6000" style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 12, padding: '12px 14px', fontSize: 16, fontWeight: 700, outline: 'none', color: '#1A1A1A' }} />
              <span style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 600 }}>kcal / 天</span>
            </div>
          </Card>

          <div style={{ padding: '10px 20px' }}>
            <button onClick={save} disabled={saving} style={{ width: '100%', height: 50, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>{saving ? '保存中…' : '保存目标'}</button>
          </div>
        </>
      )}
    </div>
  );
}
