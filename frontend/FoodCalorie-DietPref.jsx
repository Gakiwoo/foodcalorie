import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';

// 饮食偏好页：真实数据（GET/PUT profile.diet_preferences）
const GROUPS = [
  { title: '口味偏好', key: 'taste', options: ['清淡', '微辣', '中辣', '重口', '甜口', '酸口'] },
  { title: '饮食方式', key: 'style', options: ['均衡', '低碳水', '高蛋白', '素食', '低脂', '低盐'] },
  { title: '忌口过敏原', key: 'allergen', options: ['牛肉', '海鲜', '坚果', '乳制品', '麸质', '鸡蛋', '大豆'] }
];

export default function FoodCalorieDietPref() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      await http.put('/api/v1/foodcalorie/profile', { diet_preferences: selected });
      toast('偏好已保存');
      navigate('/settings');
    } catch (e) {
      toast(e.message || '保存失败');
      setSaving(false);
    }
  }

  return (
    <div data-name="FoodCalorie-DietPref" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="饮食偏好" />
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div>
      ) : (
        <>
          {GROUPS.map((g) => (
            <Card key={g.key} style={{ margin: '6px 20px 12px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>{g.title}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {g.options.map((opt) => {
                  const on = selected.includes(opt);
                  return (
                    <div
                      key={opt}
                      onClick={() => toggle(opt)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: on ? '#34C759' : '#F3F4F6',
                        color: on ? '#FFFFFF' : '#6B7280'
                      }}>
                      {opt}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
          <div style={{ padding: '10px 20px' }}>
            <button onClick={save} disabled={saving} style={{ width: '100%', height: 48, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>{saving ? '保存中…' : '保存偏好'}</button>
          </div>
        </>
      )}
    </div>
  );
}
