import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { PageContainer } from './src/ui/components';
import { colors, radius, fontSize, fontWeight } from './src/ui/theme';

const GROUPS = [
  { title: '口味偏好', key: 'taste', options: ['清淡', '微辣', '中辣', '重口', '甜口', '酸口'] },
  { title: '饮食方式', key: 'style', options: ['均衡', '低碳水', '高蛋白', '素食', '低脂', '低盐'] },
  { title: '忌口过敏原', key: 'allergen', options: ['牛肉', '海鲜', '坚果', '乳制品', '麸质', '鸡蛋', '大豆'] }
];

export default function FoodCalorieDietPref() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const { busy: saving, run: runSaving } = useBusy();

  useEffect(() => {
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/profile');
        setSelected(r.data.diet_preferences || []);
      } catch (e) {
        toast(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function toggle(opt) {
    setSelected((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]));
  }

  async function save() {
    await runSaving(async () => {
      try {
        await http.put('/api/v1/foodcalorie/profile', { diet_preferences: selected });
        toast('偏好已保存');
        navigate('/settings');
      } catch (e) {
        toast(e.message || '保存失败');
      }
    });
  }

  return (
    <PageContainer data-name="FoodCalorie-DietPref">
      <StatusBar />
      <NavBar title="饮食偏好" />
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>加载中…</div>
      ) : (
        <>
          {GROUPS.map((g) => (
            <Card key={g.key} style={{ margin: '6px 20px 12px' }}>
              <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 12 }}>{g.title}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {g.options.map((opt) => {
                  const on = selected.includes(opt);
                  return (
                    <div
                      key={opt}
                      onClick={() => toggle(opt)}
                      style={{
                        padding: '8px 16px', borderRadius: 20, fontSize: fontSize.md, fontWeight: fontWeight.semibold, cursor: 'pointer',
                        background: on ? colors.primary : colors.borderLight, color: on ? colors.textInverse : colors.textSecondary
                      }}>
                      {opt}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
          <div style={{ padding: '10px 20px' }}>
            <button onClick={save} disabled={saving} style={{ width: '100%', height: 48, borderRadius: radius.xl, border: 'none', background: colors.primary, color: colors.textInverse, fontSize: fontSize.xl, fontWeight: fontWeight.bold, cursor: saving ? 'wait' : 'pointer' }}>{saving ? '保存中…' : '保存偏好'}</button>
          </div>
        </>
      )}
    </PageContainer>
  );
}
