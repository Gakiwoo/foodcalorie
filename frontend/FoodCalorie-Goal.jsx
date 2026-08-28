import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { PageContainer } from './src/ui/components';
import { colors, radius, fontSize, fontWeight } from './src/ui/theme';

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
  const { busy: saving, run: runSaving } = useBusy();

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
    await runSaving(async () => {
      try {
        await http.put('/api/v1/foodcalorie/profile', { goal_type: goal, target_calories: Math.round(Number(target)) });
        toast('目标已保存');
        navigate('/me');
      } catch (e) {
        toast(e.message || '保存失败');
      }
    });
  }

  return (
    <PageContainer data-name="FoodCalorie-Goal">
      <StatusBar />
      <NavBar title="目标设置" />

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>加载中…</div>
      ) : (
        <>
          <Card style={{ margin: '6px 20px 12px' }}>
            <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 12 }}>健康目标</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GOALS.map((g) => {
                const on = goal === g.value;
                return (
                  <div key={g.value} onClick={() => setGoal(g.value)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, border: '1.5px solid ' + (on ? colors.primary : colors.segBg), cursor: 'pointer', background: on ? '#F0FBF4' : colors.surface }}>
                    <div style={{ width: 38, height: 38, borderRadius: radius.lg, background: on ? colors.primary : colors.borderLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={'fas ' + (g.value === '减脂' ? 'fa-fire' : g.value === '保持' ? 'fa-scale-balanced' : 'fa-dumbbell')} style={{ fontSize: 15, color: on ? colors.textInverse : colors.textTertiary }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary }}>{g.value}</div>
                      <div style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 }}>{g.desc}</div>
                    </div>
                    {on && <i className="fas fa-circle-check" style={{ fontSize: 17, color: colors.primary }} />}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card style={{ margin: '0 20px 12px' }}>
            <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 4 }}>每日目标热量</div>
            <div style={{ fontSize: fontSize.sm, color: colors.textTertiary, marginBottom: 12 }}>范围 800-6000 kcal，记录与首页将按此计算达标</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input value={target} onChange={(e) => setTarget(e.target.value)} type="number" min="800" max="6000" style={{ flex: 1, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '12px 14px', fontSize: fontSize.xxl, fontWeight: fontWeight.bold, outline: 'none', color: colors.textPrimary }} />
              <span style={{ fontSize: fontSize.lg, color: colors.textTertiary, fontWeight: fontWeight.semibold }}>kcal / 天</span>
            </div>
          </Card>

          <div style={{ padding: '10px 20px' }}>
            <button onClick={save} disabled={saving} style={{ width: '100%', height: 50, borderRadius: radius.xl, border: 'none', background: colors.primary, color: colors.textInverse, fontSize: fontSize.xl, fontWeight: fontWeight.bold, cursor: saving ? 'wait' : 'pointer' }}>{saving ? '保存中…' : '保存目标'}</button>
          </div>
        </>
      )}
    </PageContainer>
  );
}
